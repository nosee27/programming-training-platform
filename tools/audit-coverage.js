#!/usr/bin/env node
/**
 * 覆盖率审计：找出「后端有接口但前端没用」与「前端只弹提示没接后端」的功能
 * 用法：node tools/audit-coverage.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const ROUTE_DIR = path.join(ROOT, 'server', 'routes');
const WEB = path.join(ROOT, 'web');

/* 1. 后端路由表 */
const indexSrc = fs.readFileSync(path.join(ROUTE_DIR, 'index.js'), 'utf8');
const prefix = {};
for (const m of indexSrc.matchAll(/router\.use\('([^']*)',\s*require\('\.\/([\w-]+)'\)\)/g)) {
    prefix[m[2]] = m[1] === '/' ? '' : m[1];
}
const routes = [];
for (const file of fs.readdirSync(ROUTE_DIR)) {
    if (!file.endsWith('.js') || file === 'index.js') continue;
    const src = fs.readFileSync(path.join(ROUTE_DIR, file), 'utf8');
    for (const m of src.matchAll(/router\.(get|post|put|delete)\('([^']+)'/g)) {
        routes.push({
            method: m[1].toUpperCase(),
            path: m[2],
            full: (prefix[file.replace('.js', '')] || '') + m[2]
        });
    }
}

/* 2. 前端源码里出现过的 api 路径 */
const files = [];
(function walk(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) walk(p);
        else if (/\.(js|html)$/.test(e.name)) files.push(p);
    }
})(WEB);
const frontendSrc = files.map((f) => fs.readFileSync(f, 'utf8')).join('\n');

const unused = routes.filter((r) => {
    const needle = r.path.replace(/^\//, '').replace(/\/:id\b/, '').replace(/\/:studentNo\b/, '');
    return !frontendSrc.includes(needle.split('/')[0] + (needle.includes('/') ? '/' + needle.split('/')[1] : ''));
});

/* 3. 前端「只弹提示」的地方 */
const placeholders = [];
for (const f of files.filter((x) => x.endsWith('.html'))) {
    const lines = fs.readFileSync(f, 'utf8').split(/\r?\n/);
    lines.forEach((line, i) => {
        if (/演示模式|待迭代补充|任务已创建|未写入数据库/.test(line)) {
            placeholders.push({
                file: path.relative(WEB, f),
                line: i + 1,
                text: line.trim().replace(/^.*?toast\(/, '').slice(0, 70)
            });
        }
    });
}

console.log('后端接口 ' + routes.length + ' 条；前端未调用的 ' + unused.length + ' 条：');
unused.forEach((r) => console.log('  ' + r.method + ' /api' + r.full));
console.log('\n前端仍为「仅提示」的操作 ' + placeholders.length + ' 处：');
placeholders.forEach((p) => console.log('  ' + p.file + ':' + p.line + '  ' + p.text));
