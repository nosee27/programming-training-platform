#!/usr/bin/env node
/**
 * 前端静态自检（无需浏览器）
 *   1. 所有 JS 语法检查（vm.Script 编译，不执行）
 *   2. web/assets/js/config.js 中每个菜单 path 是否都有对应文件
 *   3. 红线词扫描：奖学金 / 管理系统（注释里的「禁止说明」单独提示）
 *   4. 每个页面是否都引入了必需的公共脚本
 *
 * 用法：node tools/check-web.js
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const WEB = path.resolve(__dirname, '..', 'web');
const problems = [];
const notes = [];
let jsCount = 0;
let htmlCount = 0;

function walk(dir, out = []) {
    for (const name of fs.readdirSync(dir)) {
        const full = path.join(dir, name);
        const stat = fs.statSync(full);
        if (stat.isDirectory()) walk(full, out);
        else out.push(full);
    }
    return out;
}

const files = walk(WEB);

/* ---------- 1. JS 语法检查 ---------- */
for (const f of files.filter((f) => f.endsWith('.js'))) {
    jsCount++;
    const code = fs.readFileSync(f, 'utf8');
    try {
        new vm.Script(code, { filename: f });
    } catch (e) {
        problems.push(`JS 语法错误：${path.relative(WEB, f)} → ${e.message}`);
    }
}

/* ---------- 2. 菜单路径存在性 ---------- */
const configPath = path.join(WEB, 'assets', 'js', 'config.js');
const config = fs.readFileSync(configPath, 'utf8');
const paths = [...config.matchAll(/path:\s*'([^']+)'/g)].map((m) => m[1]);
for (const p of new Set(paths)) {
    const clean = p.split('?')[0];
    const target = path.join(WEB, clean);
    if (!fs.existsSync(target)) problems.push(`菜单路径不存在：${p}`);
}

/* ---------- 3. 红线词扫描 ---------- */
const RED_LINES = ['奖学金', '管理系统'];
for (const f of files.filter((f) => /\.(html|js|css)$/.test(f))) {
    const lines = fs.readFileSync(f, 'utf8').split(/\r?\n/);
    /* 是否处于块注释内部（含 JS 块注释与 HTML 注释） */
    let inBlock = false;
    lines.forEach((line, i) => {
        const wasInBlock = inBlock;
        if (line.includes('/*') && !line.includes('*/')) inBlock = true;
        if (line.includes('<!--') && !line.includes('-->')) inBlock = true;
        if (line.includes('*/') || line.includes('-->')) inBlock = false;
        for (const word of RED_LINES) {
            if (!line.includes(word)) continue;
            const t = line.trim();
            const isComment = wasInBlock || inBlock ||
                t.startsWith('//') || t.startsWith('*') || t.startsWith('/*') || t.startsWith('<!--') || t.startsWith('⚠');
            const where = `${path.relative(WEB, f)}:${i + 1}`;
            if (isComment) notes.push(`${where} 注释中出现「${word}」（禁止说明语境）`);
            else problems.push(`${where} 出现红线词「${word}」：${t.slice(0, 80)}`);
        }
    });
}

/* ---------- 4. 页面公共脚本引入检查 ---------- */
const REQUIRED = ['assets/js/config.js', 'assets/js/api.js', 'assets/js/components.js', 'assets/js/layout.js'];
for (const f of files.filter((f) => f.endsWith('.html'))) {
    const rel = path.relative(WEB, f).split(path.sep).join('/');
    if (rel === 'login.html' || rel === 'index.html') continue;
    htmlCount++;
    const html = fs.readFileSync(f, 'utf8');
    for (const need of REQUIRED) {
        const base = need.split('/').pop();
        if (!html.includes(base)) problems.push(`${rel} 缺少公共脚本：${base}`);
    }
    if (!html.includes('auth-guard.js')) problems.push(`${rel} 缺少路由守卫：auth-guard.js`);
    if (!html.includes('data-page=')) problems.push(`${rel} <html> 缺少 data-page 属性`);
}

/* ---------- 5. 页面内联脚本语法检查 ---------- */
let inlineCount = 0;
for (const f of files.filter((f) => f.endsWith('.html'))) {
    const html = fs.readFileSync(f, 'utf8');
    for (const m of html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)) {
        const code = m[1].trim();
        if (!code) continue;
        inlineCount++;
        try {
            new vm.Script(code, { filename: path.relative(WEB, f) + ' (inline)' });
        } catch (e) {
            problems.push(`内联脚本语法错误：${path.relative(WEB, f)} → ${e.message}`);
        }
    }
}

/* ---------- 输出 ---------- */
console.log(`检查完成：JS ${jsCount} 个，页面 ${htmlCount} 个，内联脚本 ${inlineCount} 段，菜单路径 ${new Set(paths).size} 条`);
if (notes.length) {
    console.log(`\n提示（${notes.length} 条）：`);
    notes.forEach((n) => console.log('  · ' + n));
}
if (problems.length) {
    console.log(`\n发现问题（${problems.length} 条）：`);
    problems.forEach((p) => console.log('  × ' + p));
    process.exit(1);
}
console.log('\n结论：前端静态自检全部通过');
