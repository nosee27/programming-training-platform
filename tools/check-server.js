#!/usr/bin/env node
/**
 * 后端静态自检（无需 MySQL）
 *   1. server 下所有 JS 语法检查
 *   2. 路由表 vs 前端实际调用的接口：是否一一对应
 *   3. 路由用到的权限码是否都在 sql/02-seed.sql 中
 *   4. dao/entities.js 的字段映射是否都能在 sql/01-schema.sql 中找到对应列
 *
 * 用法：node tools/check-server.js
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const SERVER = path.join(ROOT, 'server');
const problems = [];

function walk(dir, out = []) {
    for (const name of fs.readdirSync(dir)) {
        const full = path.join(dir, name);
        if (name === 'node_modules') continue;
        const stat = fs.statSync(full);
        if (stat.isDirectory()) walk(full, out);
        else out.push(full);
    }
    return out;
}

/* ---------- 1. 语法检查 ---------- */
const jsFiles = walk(SERVER).filter((f) => f.endsWith('.js'));
for (const f of jsFiles) {
    try {
        new vm.Script(fs.readFileSync(f, 'utf8'), { filename: f });
    } catch (e) {
        problems.push('JS 语法错误：' + path.relative(ROOT, f) + ' → ' + e.message);
    }
}

/* ---------- 2. 解析路由表 ---------- */
const routeDir = path.join(SERVER, 'routes');
const prefixMap = {};
const indexSrc = fs.readFileSync(path.join(routeDir, 'index.js'), 'utf8');
for (const m of indexSrc.matchAll(/router\.use\('([^']*)',\s*require\('\.\/([\w-]+)'\)\)/g)) {
    prefixMap[m[2]] = m[1];
}

const routes = [];
for (const file of fs.readdirSync(routeDir)) {
    if (!file.endsWith('.js') || file === 'index.js') continue;
    const name = file.replace('.js', '');
    /* router.use('/', ...) 挂载的前缀要归一化成空串，否则会拼出 /api//news */
    let prefix = prefixMap[name] !== undefined ? prefixMap[name] : '';
    if (prefix === '/') prefix = '';
    const src = fs.readFileSync(path.join(routeDir, file), 'utf8');
    for (const m of src.matchAll(/router\.(get|post|put|delete|patch)\('([^']+)'/g)) {
        routes.push({
            method: m[1].toUpperCase(),
            path: ('/api' + prefix + m[2]).replace(/\/$/, '') || '/api',
            file: file
        });
    }
    /* 检查是否都挂了 auth 中间件 */
    if (name !== 'auth') {
        const withoutAuth = [...src.matchAll(/router\.(get|post|put|delete)\('([^']+)',(?!\s*auth)/g)];
        if (withoutAuth.length) {
            problems.push(name + '.js 中有 ' + withoutAuth.length + ' 条路由缺少 auth 中间件：' +
                withoutAuth.map((x) => x[2]).join(', '));
        }
    }
}
if (!/require\('\.\/auth'\)/.test(indexSrc)) problems.push('routes/index.js 未挂载 auth 路由');

/* ---------- 3. 前端调用的接口是否都存在 ---------- */
const FRONTEND_CALLS = [
    ['POST', '/api/auth/one-key-login'],
    ['GET', '/api/auth/profile'],
    ['GET', '/api/news'],
    ['GET', '/api/news/categories'],
    ['POST', '/api/news'],
    ['GET', '/api/stats/overview'],
    ['GET', '/api/todos'],
    ['GET', '/api/users'],
    ['POST', '/api/users'],
    ['PUT', '/api/users/:id'],
    ['DELETE', '/api/users/:id'],
    ['GET', '/api/roles'],
    ['GET', '/api/roles/:id/permissions'],
    ['PUT', '/api/roles/:id/permissions'],
    ['GET', '/api/permissions'],
    ['GET', '/api/teachers'],
    ['GET', '/api/teacher-courses'],
    ['GET', '/api/evaluations'],
    ['GET', '/api/students'],
    ['POST', '/api/students'],
    ['PUT', '/api/students/:id'],
    ['DELETE', '/api/students/:id'],
    ['GET', '/api/attendances'],
    ['POST', '/api/attendances'],
    ['GET', '/api/payments'],
    ['POST', '/api/payments'],
    ['POST', '/api/payments/:id/confirm'],
    ['GET', '/api/archives'],
    ['GET', '/api/works'],
    ['POST', '/api/works/:id/comment'],
    ['GET', '/api/courses'],
    ['GET', '/api/course-chapters'],
    ['GET', '/api/classes'],
    ['GET', '/api/schedules'],
    ['GET', '/api/scores'],
    ['POST', '/api/scores/batch'],
    ['GET', '/api/score-stats'],
    ['GET', '/api/coursewares'],
    ['GET', '/api/courseware-categories'],
    ['POST', '/api/uploads/courseware']
];

function routeExists(method, want) {
    return routes.some((r) => r.method === method && (r.path === want || r.path + '/:id' === want));
}

for (const [method, p] of FRONTEND_CALLS) {
    const hit = routes.find((r) => r.method === method && r.path === p);
    if (!hit && !routeExists(method, p)) problems.push('后端缺少接口：' + method + ' ' + p);
}

/* ---------- 4. 权限码是否都在种子数据中 ---------- */
const seed = fs.readFileSync(path.join(ROOT, 'sql', '02-seed.sql'), 'utf8');
/* 权限码形如 module:action 或 module:sub:action，这里统一匹配，避免新增模块时漏掉 */
const seedCodes = new Set([...seed.matchAll(/'([a-z]+(?::[a-z:-]+)+)'/g)].map((m) => m[1]));
const usedPerms = new Set();
for (const file of fs.readdirSync(routeDir)) {
    const src = fs.readFileSync(path.join(routeDir, file), 'utf8');
    for (const m of src.matchAll(/requirePerm\('([^']+)'\)/g)) usedPerms.add(m[1]);
}
for (const code of usedPerms) {
    if (!seedCodes.has(code)) problems.push('权限码在种子数据中不存在：' + code);
}

/* ---------- 5. 字段映射 vs 建表脚本 ---------- */
const schemaSrc = fs.readFileSync(path.join(ROOT, 'sql', '01-schema.sql'), 'utf8');
const tableColumns = {};
for (const m of schemaSrc.matchAll(/CREATE TABLE `(\w+)` \(([\s\S]*?)\n\) ENGINE/g)) {
    const cols = new Set();
    for (const line of m[2].split('\n')) {
        const col = line.match(/^\s*`(\w+)`\s+(BIGINT|VARCHAR|TINYINT|INT|DECIMAL|DATETIME|DATE|TIME|TEXT|LONGTEXT|CHAR|DOUBLE|FLOAT)/);
        if (col) cols.add(col[1]);
    }
    tableColumns[m[1]] = cols;
}

const entitySrc = fs.readFileSync(path.join(SERVER, 'dao', 'entities.js'), 'utf8');
const entityBlocks = [...entitySrc.matchAll(/^    (\w+):\s*\{/gm)];
entityBlocks.forEach((block, i) => {
    const start = block.index;
    const end = i + 1 < entityBlocks.length ? entityBlocks[i + 1].index : entitySrc.length;
    const chunk = entitySrc.slice(start, end);
    const tableMatch = chunk.match(/table:\s*'(\w+)'/);
    if (!tableMatch) return;
    const table = tableMatch[1];
    if (!tableColumns[table]) {
        problems.push('实体 ' + block[1] + ' 指向的表不存在：' + table);
        return;
    }
    const colBlock = chunk.match(/columns:\s*\{([\s\S]*?)\}/);
    if (!colBlock) return;
    for (const m of colBlock[1].matchAll(/(\w+):\s*'(\w+)'/g)) {
        if (!tableColumns[table].has(m[2])) {
            problems.push('字段映射错误：' + block[1] + '.' + m[1] + ' → ' + table + '.' + m[2] + '（该列不存在）');
        }
    }
});

/* ---------- 输出 ---------- */
console.log('后端自检：JS ' + jsFiles.length + ' 个，路由 ' + routes.length + ' 条，' +
    '前端接口用例 ' + FRONTEND_CALLS.length + ' 个，权限码 ' + usedPerms.size + ' 个，实体 ' + entityBlocks.length + ' 个');
if (problems.length) {
    console.log('\n发现问题（' + problems.length + ' 条）：');
    problems.forEach((p) => console.log('  × ' + p));
    process.exit(1);
}
console.log('\n结论：后端静态自检全部通过');
