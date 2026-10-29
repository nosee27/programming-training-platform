#!/usr/bin/env node
/**
 * 演示数据（mock API）契约自检
 * 在没有后端、没有浏览器的环境里，验证每个页面调用的接口都能返回预期结构。
 *
 * 用法：node tools/check-api.js
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const WEB = path.resolve(__dirname, '..', 'web');
const JS = path.join(WEB, 'assets', 'js');

/* 最小浏览器环境桩 */
const store = {};
const sandbox = {
    console,
    setTimeout,
    clearTimeout,
    AbortController,
    fetch: () => Promise.reject(new Error('offline')),   // 模拟后端未启动 → 自动降级到演示数据
    location: { port: '3000', pathname: '/login.html', protocol: 'http:', search: '' },
    localStorage: {
        getItem: (k) => (k in store ? store[k] : null),
        setItem: (k, v) => { store[k] = String(v); },
        removeItem: (k) => { delete store[k]; }
    }
};
sandbox.window = sandbox;
sandbox.globalThis = sandbox;
vm.createContext(sandbox);

for (const f of ['config.js', 'mock-data.js', 'api.js']) {
    vm.runInContext(fs.readFileSync(path.join(JS, f), 'utf8'), sandbox, { filename: f });
}

const JP = sandbox.JP;
const problems = [];

/* 每个页面实际调用的接口 + 期望字段 */
const CASES = [
    ['GET', 'news', { category: 'all', page: 1, size: 5 }, ['list', 'total']],
    ['GET', 'news', { category: 'notice', page: 1, size: 5 }, ['list', 'total']],
    ['GET', 'news', { category: 'industry', page: 1, size: 5 }, ['list', 'total']],
    ['GET', 'news', { category: 'match', page: 1, size: 5 }, ['list', 'total']],
    ['GET', 'news', { category: 'all', page: 2, size: 5, keyword: '蓝桥' }, ['list', 'total']],
    ['GET', 'stats/overview', {}, ['studentTotal', 'inClass', 'arrearsCount', 'arrearsAmount', 'avgScore']],
    ['GET', 'todos', {}, ['list', 'total']],
    ['GET', 'users', { page: 1, size: 10 }, ['list', 'total']],
    ['GET', 'roles', { page: 1, size: 10 }, ['list', 'total']],
    ['GET', 'permissions', { page: 1, size: 12, type: '3' }, ['list', 'total']],
    ['GET', 'teachers', { page: 1, size: 10, status: '1' }, ['list', 'total']],
    ['GET', 'teacher-courses', { page: 1, size: 10 }, ['list', 'total']],
    ['GET', 'evaluations', { page: 1, size: 50, evalType: '1' }, ['list', 'total']],
    ['GET', 'students', { page: 1, size: 10, className: 'Python 全栈 2603 班' }, ['list', 'total']],
    ['GET', 'attendances', { page: 1, size: 10, attendType: '5' }, ['list', 'total']],
    ['GET', 'payments', { page: 1, size: 10, payStatus: '1' }, ['list', 'total']],
    ['GET', 'archives', { page: 1, size: 10 }, ['list', 'total']],
    ['GET', 'works', { page: 1, size: 10, workType: '1' }, ['list', 'total']],
    ['GET', 'courses', { page: 1, size: 10, status: '1' }, ['list', 'total']],
    ['GET', 'course-chapters', { page: 1, size: 10, courseName: 'Python 全栈开发' }, ['list', 'total']],
    ['GET', 'classes', { page: 1, size: 10, status: '1' }, ['list', 'total']],
    ['GET', 'schedules', { page: 1, size: 10, weekday: '6' }, ['list', 'total']],
    ['GET', 'scores', { page: 1, size: 10, examType: '1' }, ['list', 'total']],
    ['GET', 'coursewares', { page: 1, size: 10, categoryName: '课件讲义' }, ['list', 'total']],
    ['GET', 'courseware-categories', { page: 1, size: 10 }, ['list', 'total']],
    ['GET', 'score-stats', {}, ['byCourse', 'buckets', 'total']]
];

(async () => {
    /* 1. 一键登录 */
    const login = await JP.api.post('auth/one-key-login', {});
    for (const key of ['token', 'user', 'permissions']) {
        if (!login[key]) problems.push(`一键登录返回缺少字段：${key}`);
    }
    if (!login.permissions || !login.permissions.length) problems.push('一键登录未返回权限码');
    const perms = login.permissions || [];

    /* 2. 逐页接口契约 */
    for (const [method, url, params, fields] of CASES) {
        try {
            const data = method === 'POST' ? await JP.api.post(url, params) : await JP.api.get(url, params);
            for (const f of fields) {
                if (data[f] === undefined) problems.push(`${url} 返回缺少字段：${f}`);
            }
            if (data.list !== undefined && !Array.isArray(data.list)) {
                problems.push(`${url} 的 list 不是数组`);
            }
        } catch (e) {
            problems.push(`${url} 调用失败：${e.message}`);
        }
    }

    /* 3. 页面用到的权限码是否都在演示权限清单里（否则菜单/按钮会被误隐藏） */
    const used = new Set();
    const collect = (items) => items.forEach((m) => {
        if (m.perm) used.add(m.perm);
        if (m.children) collect(m.children);
    });
    collect(sandbox.JP_MENU);
    (sandbox.JP_MENU || []).forEach((m) => (m.children || []).forEach((c) => c.perm && used.add(c.perm)));
    for (const p of used) {
        if (!perms.includes(p)) problems.push(`菜单权限码未包含在演示权限中：${p}`);
    }

    /* 4. 各子系统菜单是否都能解析 */
    for (const s of sandbox.JP_SUBSYSTEMS) {
        if (!s.key || !s.name) problems.push(`子系统定义不完整：${JSON.stringify(s)}`);
    }

    console.log(`接口自检：${CASES.length} 个接口用例 + 一键登录 + ${used.size} 个菜单权限码`);
    if (problems.length) {
        console.log(`\n发现问题（${problems.length} 条）：`);
        problems.forEach((p) => console.log('  × ' + p));
        process.exit(1);
    }
    console.log('\n结论：演示数据接口契约全部通过');
})();
