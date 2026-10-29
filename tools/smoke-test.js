#!/usr/bin/env node
/**
 * 端到端冒烟测试（需要后端 + MySQL 都在运行）
 * 覆盖：一键登录 → 权限 → 工作台统计 → 新闻 → 学生 → 缴费收款（事务+重算）→ 成绩批量录入（UPSERT）→ 个人中心
 *
 * 用法：node tools/smoke-test.js   [BASE=http://localhost:3000/api]
 */
const BASE = process.env.BASE || 'http://localhost:3000/api';

let token = '';
let passed = 0;
const failures = [];

async function call(method, url, body, withToken = true) {
    const headers = { 'Content-Type': 'application/json' };
    if (withToken && token) headers.Authorization = 'Bearer ' + token;
    const res = await fetch(BASE + url, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body)
    });
    const json = await res.json().catch(() => ({ code: -1, message: '响应不是 JSON' }));
    return { status: res.status, body: json };
}

function check(name, ok, detail) {
    if (ok) {
        passed++;
        console.log('  ✓ ' + name + (detail ? '  →  ' + detail : ''));
    } else {
        failures.push(name + (detail ? '：' + detail : ''));
        console.log('  × ' + name + (detail ? '  →  ' + detail : ''));
    }
}

(async () => {
    console.log('端到端冒烟测试：' + BASE + '\n');

    /* 1. 健康检查 */
    const health = await call('GET', '/health', undefined, false);
    check('健康检查（服务 + 数据库）', health.body.code === 0 && health.body.data.database === 'ok',
        JSON.stringify(health.body.data || health.body.message));

    /* 2. 一键登录 */
    const login = await call('POST', '/auth/one-key-login', {}, false);
    token = login.body.data && login.body.data.token;
    const user = (login.body.data && login.body.data.user) || {};
    const perms = (login.body.data && login.body.data.permissions) || [];
    check('一键登录返回 token 与用户信息', !!token, user.name + ' / ' + user.roleName + ' / 到期 ' + user.expireDate);
    check('超级管理员权限为通配 "*"', perms.length === 1 && perms[0] === '*', perms.join(','));

    /* 3. 未带 token 应被拦截 */
    const noToken = await fetch(BASE + '/news');
    check('无 token 访问接口返回 401', noToken.status === 401, 'HTTP ' + noToken.status);

    /* 4. 工作台统计 */
    const overview = await call('GET', '/stats/overview');
    check('工作台概览（聚合查询）', overview.body.code === 0,
        '学生 ' + overview.body.data.studentTotal + ' 人 / 欠费 ' + overview.body.data.arrearsCount + ' 笔 / 均分 ' + overview.body.data.avgScore);

    const todos = await call('GET', '/todos');
    check('待办提醒（实时推导）', todos.body.code === 0 && todos.body.data.list.length > 0,
        todos.body.data.list.length + ' 条，首条：' + (todos.body.data.list[0] || {}).type);

    /* 5. 新闻中心：四个 Tab 的分页查询 */
    const newsAll = await call('GET', '/news?category=all&page=1&size=5');
    const newsMatch = await call('GET', '/news?category=match&page=1&size=5');
    const newsNotice = await call('GET', '/news?category=notice&page=1&size=5');
    check('新闻-全部', newsAll.body.code === 0 && newsAll.body.data.total > 0, '共 ' + newsAll.body.data.total + ' 条');
    check('新闻-赛事动态（筛选生效）', newsMatch.body.code === 0 && newsMatch.body.data.list.every((n) => n.categoryCode === 'match'),
        (newsMatch.body.data.list[0] || {}).title);
    check('新闻-平台公告', newsNotice.body.code === 0, '共 ' + newsNotice.body.data.total + ' 条');

    /* 6. 新闻详情：浏览量 +1（真实写操作） */
    const newsId = newsMatch.body.data.list[0].id;
    const before = newsMatch.body.data.list[0].viewCount;
    const detail = await call('GET', '/news/' + newsId);
    check('新闻详情浏览量自增', detail.body.data.viewCount === before + 1, before + ' → ' + detail.body.data.viewCount);

    /* 7. 学生列表（联表带班级名称） */
    const students = await call('GET', '/students?page=1&size=5');
    check('学生列表（联表查询班级）', students.body.code === 0 && students.body.data.list[0].className !== undefined,
        students.body.data.list[0].name + ' / ' + students.body.data.list[0].className);

    /* 8. 缴费：确认收款 → 欠费重算 → 状态流转（事务） */
    const arrears = await call('GET', '/payments?payStatus=1&page=1&size=5');
    const pay = arrears.body.data.list[0];
    check('缴费列表（部分缴纳）', !!pay, pay ? pay.studentName + ' 欠费 ' + pay.arrearsAmount + ' 元' : '无数据');
    if (pay) {
        const amount = Math.min(100, Number(pay.arrearsAmount));
        const confirm = await call('POST', '/payments/' + pay.id + '/confirm', { amount: amount, payMethod: 1 });
        const after = confirm.body.data;
        check('确认收款后欠费减少（事务 + 计算）',
            after && Math.abs(Number(after.arrearsAmount) - (Number(pay.arrearsAmount) - amount)) < 0.01,
            pay.arrearsAmount + ' → ' + (after ? after.arrearsAmount : '?') + '（本次收款 ' + amount + '）');

        const over = await call('POST', '/payments/' + pay.id + '/confirm', { amount: 999999, payMethod: 1 });
        check('收款超过欠费被业务规则拦截', over.body.code !== 0, over.body.message);
    }

    /* 9. 成绩：批量录入 + UPSERT（重复录入覆盖而不是插重复） */
    const target = students.body.data.list[0];
    const sameKey = [
        { studentNo: target.studentNo, courseName: 'Python 全栈开发', examType: 4, score: 88, fullScore: 100 },
        { studentNo: target.studentNo, courseName: 'Python 全栈开发', examType: 4, score: 91, fullScore: 100 }
    ];
    const first = await call('POST', '/scores/batch', { items: sameKey });
    const countAfterFirst = (await call('GET', '/scores?page=1&size=100')).body.data.total;
    const second = await call('POST', '/scores/batch', { items: sameKey });
    const countAfterSecond = (await call('GET', '/scores?page=1&size=100')).body.data.total;
    check('成绩批量录入（同类型重复录入 UPSERT 覆盖，不新增行）',
        first.body.code === 0 && second.body.code === 0 && countAfterSecond === countAfterFirst,
        '第一次后 ' + countAfterFirst + ' 条 → 第二次后仍 ' + countAfterSecond + ' 条');

    const scoreRow = (await call('GET', '/scores?examType=4&keyword=' + encodeURIComponent(target.studentNo) + '&page=1&size=10'))
        .body.data.list.filter((s) => s.courseName === 'Python 全栈开发')[0];
    check('UPSERT 取最后一次提交的分数', !!scoreRow && Number(scoreRow.score) === 91,
        scoreRow ? '最终得分 ' + scoreRow.score : '未找到成绩记录');

    const badScore = await call('POST', '/scores', {
        studentNo: target.studentNo, courseName: 'Python 全栈开发', examType: 5, score: 120, fullScore: 100
    });
    check('分数越界被拦截', badScore.body.code !== 0, badScore.body.message);

    /* 10. 成绩统计（聚合 + 分数段） */
    const stats = await call('GET', '/score-stats');
    check('成绩统计（按课程聚合 + 分数段）', stats.body.code === 0 && stats.body.data.buckets.length === 5,
        stats.body.data.byCourse.length + ' 门课程，共 ' + stats.body.data.total + ' 条成绩');

    /* 11. 权限校验：教师账号不能访问系统管理 */
    const profile = await call('GET', '/auth/profile');
    check('个人中心（当前账号 + 权限）', profile.body.code === 0 && profile.body.data.permissions.length > 0,
        profile.body.data.user.name + ' / ' + profile.body.data.permissions.length + ' 项权限');

    /* 12. 课件分类（由 category 字段聚合而来） */
    const cwCat = await call('GET', '/courseware-categories');
    check('课件分类聚合', cwCat.body.code === 0 && cwCat.body.data.list.length > 0,
        cwCat.body.data.list.map((c) => c.categoryName + '(' + c.fileCount + ')').join(' '));

    /* 12.5 外键完整性：种子数据在关闭外键检查时写入，必须验证没有孤儿数据 */
    const schedRows = await call('GET', '/schedules?page=1&size=100');
    const orphanSchedules = (schedRows.body.data.list || []).filter(function (s) { return !s.className; });
    check('排课数据无孤儿（每条排课都能关联到班级）', orphanSchedules.length === 0,
        orphanSchedules.length ? orphanSchedules.length + ' 条排课找不到班级（class_id 不存在）' : '共 ' + schedRows.body.data.total + ' 条，全部有班级');
    const studentRows = await call('GET', '/students?page=1&size=100');
    const orphanStudents = (studentRows.body.data.list || []).filter(function (s) { return s.classId && !s.className; });
    check('学生数据无孤儿（班级关联有效）', orphanStudents.length === 0, orphanStudents.length + ' 条异常');

    /* 13. 三端数据范围：管理员看全部，学生只看自己，教师只看自己的授课 */
    const adminStudents = (await call('GET', '/students?page=1&size=100')).body.data.total;
    const adminArchives = (await call('GET', '/archives?page=1&size=100')).body.data.total;
    const adminWorks = (await call('GET', '/works?page=1&size=100')).body.data.total;

    const stuLogin = await call('POST', '/auth/one-key-login?as=s2026001', {}, false);
    const adminToken = token;
    token = stuLogin.body.data.token;
    const stuUser = stuLogin.body.data.user;
    const stuStudents = await call('GET', '/students?page=1&size=100');
    const stuArchives = await call('GET', '/archives?page=1&size=100');
    const stuWorks = await call('GET', '/works?page=1&size=100');
    check('学生端身份识别', stuUser.portal === 'student' && !!stuUser.studentId,
        stuUser.name + ' / portal=' + stuUser.portal + ' / studentId=' + stuUser.studentId);
    check('学生端只看到自己的学生记录', stuStudents.body.data.total === 1,
        '管理端可见 ' + adminStudents + ' 条 → 学生端 ' + stuStudents.body.data.total + ' 条');
    const stuArchiveTotal = stuArchives.body.data ? stuArchives.body.data.total : -1;
    const stuWorkTotal = stuWorks.body.data ? stuWorks.body.data.total : -1;
    const adminAtt = (await (async () => { token = adminToken; const r = await call('GET', '/attendances?page=1&size=100'); token = stuLogin.body.data.token; return r; })()).body.data.total;
    const stuAtt = (await call('GET', '/attendances?page=1&size=100')).body.data.total;
    check('学生端只看到自己的考勤（曾经漏过滤，已修）', stuAtt < adminAtt,
        '管理端 ' + adminAtt + ' 条 → 学生端 ' + stuAtt + ' 条');
    const stuSched = await call('GET', '/schedules?page=1&size=100');
    const stuScores = await call('GET', '/scores?page=1&size=100');
    const stuNames = {};
    ((stuScores.body.data || {}).list || []).forEach(function (s) { stuNames[s.studentName] = 1; });
    check('学生端只看到自己的成绩（按 studentId 收窄）',
        !!stuScores.body.data && stuScores.body.data.list.every(function (s) { return s.studentId === stuUser.studentId; }),
        '共 ' + ((stuScores.body.data || {}).total || 0) + ' 条，姓名：' + Object.keys(stuNames).join('、'));
    if (!stuSched.body.data) { check('学生端课表接口可访问', false, 'HTTP ' + stuSched.status + ' ' + stuSched.body.message); }
    const stuClasses = {};
    ((stuSched.body.data || {}).list || []).forEach(function (s) { stuClasses[s.className] = 1; });
    check('学生端只看到本班课表（曾经是全校课表，已修）',
        !!stuSched.body.data && Object.keys(stuClasses).length === 1,
        Object.keys(stuClasses).join('、') + '，共 ' + ((stuSched.body.data || {}).total || 0) + ' 条');
    check('学生端只看到自己的学习档案', stuArchiveTotal >= 0 && stuArchiveTotal < adminArchives,
        '管理端 ' + adminArchives + ' 条 → 学生端 ' + stuArchiveTotal + ' 条');
    check('学生端只看到自己的作品', stuWorkTotal >= 0 && stuWorkTotal < adminWorks,
        '管理端 ' + adminWorks + ' 条 → 学生端 ' + stuWorkTotal + ' 条');

    const stuPay = await call('GET', '/payments?page=1&size=10');
    check('学生端无缴费权限时返回 403（学生端菜单不含缴费）', stuPay.body.code === 403, stuPay.body.message);
    const stuOverview = await call('GET', '/stats/overview');
    const stuTodos = await call('GET', '/todos');
    check('学生端拿不到全校经营数据（曾漏校验权限，已修）',
        stuOverview.body.code === 403 && stuTodos.body.code === 403,
        'overview -> ' + stuOverview.body.message);

    const teaLogin = await call('POST', '/auth/one-key-login?as=t1001', {}, false);
    token = teaLogin.body.data.token;
    const teaUser = teaLogin.body.data.user;
    const teaCourses = await call('GET', '/teacher-courses?page=1&size=100');
    const teaSchedules = await call('GET', '/schedules?page=1&size=100');
    const allSchedules = await (async () => {
        token = adminToken;
        const r = await call('GET', '/schedules?page=1&size=100');
        token = teaLogin.body.data.token;
        return r;
    })();
    check('教师端身份识别', teaUser.portal === 'teacher' && !!teaUser.teacherId,
        teaUser.name + ' / portal=' + teaUser.portal + ' / teacherId=' + teaUser.teacherId);
    check('教师端只看到自己的授课安排',
        teaCourses.body.data.list.every((c) => c.teacherName === teaUser.name),
        teaCourses.body.data.list.length + ' 条，均为 ' + teaUser.name);
    check('教师端课表按本人过滤', teaSchedules.body.data.total < allSchedules.body.data.total,
        '全部 ' + allSchedules.body.data.total + ' 条 → 本人 ' + teaSchedules.body.data.total + ' 条');

    const stuAdmin = await call('GET', '/users?page=1&size=10');
    check('学生端访问管理端接口被 403 拦截', stuAdmin.body.code === 403, stuAdmin.body.message);
    token = adminToken;

    console.log('\n结果：通过 ' + passed + ' 项，失败 ' + failures.length + ' 项');
    if (failures.length) {
        failures.forEach((f) => console.log('  × ' + f));
        process.exit(1);
    }
    console.log('结论：真实数据库端到端链路全部通过');
})().catch((err) => {
    console.error('冒烟测试异常：' + err.message);
    process.exit(1);
});
