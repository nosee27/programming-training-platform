#!/usr/bin/env node
/**
 * 从 routes/*.js 生成接口清单文档（docs/03-后端接口清单.md）
 * 好处：接口改了文档自动跟着变，不会出现「文档和代码两张皮」。
 *
 * 用法：node tools/gen-api-doc.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const routeDir = path.join(ROOT, 'server', 'routes');
const outFile = path.join(ROOT, 'docs', '03-后端接口清单.md');

const MODULE_TITLES = {
    auth: '登录与个人中心',
    system: '系统管理（用户 / 角色 / 权限）',
    news: '新闻中心',
    student: '学生管理（基本信息 / 考勤 / 缴费 / 档案 / 作品）',
    teaching: '教师管理（基本信息 / 授课安排 / 教学评价）',
    course: '课程管理（课程信息 / 课程大纲）',
    clazz: '班级管理（班级信息 / 课表管理）',
    score: '成绩管理（录入 / 查询 / 统计）',
    courseware: '课件资源（列表 / 上传 / 分类）',
    stats: '工作台统计与待办'
};

const indexSrc = fs.readFileSync(path.join(routeDir, 'index.js'), 'utf8');
const prefixMap = {};
for (const m of indexSrc.matchAll(/router\.use\('([^']*)',\s*require\('\.\/([\w-]+)'\)\)/g)) {
    prefixMap[m[2]] = m[1] === '/' ? '' : m[1];
}

const lines = [];
lines.push('# 后端接口清单（自动生成）');
lines.push('');
lines.push('> 本文档由 `node tools/gen-api-doc.js` 从 `server/routes/*.js` 自动生成，请勿手工编辑。');
lines.push('> 统一响应体：`{ "code": 0, "message": "ok", "data": ... }`，`code === 0` 表示成功。');
lines.push('> 除一键登录外，所有接口都需要请求头 `Authorization: Bearer <token>`。');
lines.push('');
lines.push('基础地址：`http://localhost:3000/api`');
lines.push('');

let total = 0;
for (const name of Object.keys(MODULE_TITLES)) {
    const file = path.join(routeDir, name + '.js');
    if (!fs.existsSync(file)) continue;
    const src = fs.readFileSync(file, 'utf8');
    const prefix = prefixMap[name] || '';
    const rows = [];

    /* 逐条路由抓取：方法、路径、权限码、调用的服务方法、成功提示 */
    for (const m of src.matchAll(/router\.(get|post|put|delete)\('([^']+)'([\s\S]*?)\n\}\)\);/g)) {
        const method = m[1].toUpperCase();
        const routePath = m[2];
        const body = m[3];
        const permMatch = body.match(/requirePerm\('([^']+)'\)/);
        const callMatch = body.match(/await\s+([\w.]+)\(/);
        const msgMatch = body.match(/res\.ok\([^)]*,\s*'([^']+)'\)/);
        rows.push([
            method,
            '`/api' + prefix + routePath + '`',
            permMatch ? '`' + permMatch[1] + '`' : '登录即可',
            callMatch ? callMatch[1] : '-',
            msgMatch ? msgMatch[1] : '-'
        ]);
    }

    if (!rows.length) continue;
    total += rows.length;
    lines.push('## ' + MODULE_TITLES[name]);
    lines.push('');
    lines.push('| 方法 | 路径 | 所需权限 | 服务方法 | 成功提示 |');
    lines.push('| --- | --- | --- | --- | --- |');
    rows.forEach((r) => lines.push('| ' + r.join(' | ') + ' |'));
    lines.push('');
}

lines.push('## 说明');
lines.push('');
lines.push('- 权限码与数据库 `sys_permission.permission_code` 一一对应，超级管理员在 JWT 中的权限为 `["*"]`（放行全部）。');
lines.push('- 分页参数统一为 `page` / `size` / `keyword`，返回 `{ list, total, page, size }`。');
lines.push('- 删除接口默认是**逻辑删除**（`deleted = 1`），考勤、评价、授课安排、课程大纲等关联表为物理删除。');
lines.push('- 缴费、成绩、考勤等写操作在服务层使用事务与唯一键 UPSERT，详见 `server/services/*.js`。');
lines.push('');
lines.push('接口总数：**' + total + ' 条**（由脚本统计）');

fs.writeFileSync(outFile, lines.join('\n') + '\n', 'utf8');
console.log('已生成接口文档：' + path.relative(ROOT, outFile) + '（共 ' + total + ' 条接口）');
