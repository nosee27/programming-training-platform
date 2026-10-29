/* =====================================================================
   演示数据（后端未启动时自动启用，保证前端可以独立演示 / 答辩）
   数据口径与 sql/02-seed.sql 保持一致；权限清单仅列出主要权限，
   完整权限树以数据库种子数据为准。
   ⚠️ 本文件不得出现「奖学金」相关任何内容。
   ===================================================================== */
(function () {
    'use strict';

    function pad(n) { return n < 10 ? '0' + n : '' + n; }

    /* ------------------------- 新闻（含参考图两条） ------------------------- */
    var newsCategories = [
        { code: 'notice', name: '平台公告' },
        { code: 'industry', name: '行业资讯' },
        { code: 'match', name: '赛事动态' }
    ];

    var news = [
        { id: 1, title: '第十四届蓝桥杯大赛省赛成绩公布', categoryCode: 'match', isTop: 1, author: '江京教育', source: '教务处', viewCount: 128, status: 1, publishTime: '2026-10-08 09:30', summary: '本届省赛我校共有 26 名学员获奖，其中一等奖 5 名。' },
        { id: 2, title: '2026全国青少年信息学奥林匹克联赛报名开启', categoryCode: 'match', isTop: 0, author: '江京教育', source: '赛事组委会', viewCount: 96, status: 1, publishTime: '2026-10-05 10:00', summary: '报名时间为 10 月 15 日至 10 月 31 日。' },
        { id: 3, title: '国庆假期教学安排通知', categoryCode: 'notice', isTop: 0, author: '江京教育', source: '教务处', viewCount: 156, status: 1, publishTime: '2026-09-28 16:20', summary: '10 月 1 日至 10 月 3 日停课，10 月 4 日起按周末课表正常上课。' },
        { id: 4, title: '2026 年编程教育行业人才需求报告发布', categoryCode: 'industry', isTop: 0, author: '行业观察', source: '行业研究院', viewCount: 74, status: 1, publishTime: '2026-09-20 14:00', summary: '青少年编程教师岗位需求同比增长 18%。' },
        { id: 5, title: '蓝桥杯青少年组线上模拟赛通知', categoryCode: 'match', isTop: 1, author: '江京教育', source: '赛事组委会', viewCount: 211, status: 1, publishTime: '2026-09-18 09:00', summary: '模拟赛将于 9 月 26 日 19:00 在线上举行。' },
        { id: 6, title: '平台功能更新：新增学生作品展示模块', categoryCode: 'notice', isTop: 0, author: '江京教育', source: '产品组', viewCount: 132, status: 1, publishTime: '2026-09-12 11:30', summary: '学生作品支持公开展示与教师点评。' },
        { id: 7, title: '青少年编程能力等级测评启动报名', categoryCode: 'industry', isTop: 0, author: '行业观察', source: '测评中心', viewCount: 88, status: 1, publishTime: '2026-09-08 15:10', summary: '本年度测评报名通道已开启。' },
        { id: 8, title: '关于调整 2603 班课表的通知', categoryCode: 'notice', isTop: 0, author: '江京教育', source: '教务处', viewCount: 67, status: 1, publishTime: '2026-09-02 10:40', summary: '周三答疑课调整至周四下午同一时段。' },
        { id: 9, title: '江京教育学员在省青少年信息学奥赛中获奖', categoryCode: 'match', isTop: 0, author: '江京教育', source: '教务处', viewCount: 175, status: 1, publishTime: '2026-08-26 17:00', summary: '共 12 名学员分获一、二、三等奖。' },
        { id: 10, title: '少儿编程课程融入人工智能通识内容', categoryCode: 'industry', isTop: 0, author: '行业观察', source: '行业研究院', viewCount: 59, status: 1, publishTime: '2026-08-18 09:20', summary: '多家机构在新学期课程中加入 AI 通识模块。' },
        { id: 11, title: '新学期开课温馨提示', categoryCode: 'notice', isTop: 0, author: '江京教育', source: '教务处', viewCount: 143, status: 1, publishTime: '2026-08-15 08:50', summary: '请学员提前 10 分钟到教室并携带学习用品。' }
    ];

    /* ------------------------------ 系统管理 ------------------------------ */
    var roles = [
        { id: 1, roleName: '超级管理员', roleCode: 'SUPER_ADMIN', description: '拥有全部菜单与按钮权限', sortOrder: 1, status: 1, userCount: 1 },
        { id: 2, roleName: '教务管理员', roleCode: 'EDU_ADMIN', description: '负责课程、班级、学生与新闻的日常运营', sortOrder: 2, status: 1, userCount: 1 },
        { id: 3, roleName: '教师', roleCode: 'TEACHER', description: '查看所带班级学生，录入成绩与评价', sortOrder: 3, status: 1, userCount: 1 },
        { id: 4, roleName: '学生', roleCode: 'STUDENT', description: '仅可查看本人档案、成绩、考勤与作品', sortOrder: 4, status: 1, userCount: 1 }
    ];

    var users = [
        { id: 1, username: 'admin', realName: '覃艳', phone: '13800000000', roleNames: '超级管理员', memberLevel: 'VIP', expireDate: '2026-11-12', status: 1, lastLoginTime: '2026-10-12 08:36', createTime: '2026-01-06 09:00' },
        { id: 2, username: 'jiaowu', realName: '王教务', phone: '13800000001', roleNames: '教务管理员', memberLevel: 'VIP', expireDate: '2026-11-12', status: 1, lastLoginTime: '2026-10-11 17:20', createTime: '2026-01-06 09:10' },
        { id: 3, username: 't1001', realName: '王建国', phone: '13800000002', roleNames: '教师', memberLevel: 'VIP', expireDate: '2026-11-12', status: 1, lastLoginTime: '2026-10-11 09:05', createTime: '2026-03-01 10:00' },
        { id: 4, username: 's2026001', realName: '陈思远', phone: '13800000003', roleNames: '学生', memberLevel: 'VIP', expireDate: '2026-11-12', status: 1, lastLoginTime: '2026-10-10 20:15', createTime: '2026-03-01 10:20' },
        { id: 5, username: 't1002', realName: '李慧敏', phone: '13800000011', roleNames: '教师', memberLevel: 'VIP', expireDate: '2026-11-12', status: 1, lastLoginTime: '2026-10-09 14:02', createTime: '2026-03-05 09:30' },
        { id: 6, username: 's2026005', realName: '周航', phone: '13800000005', roleNames: '学生', memberLevel: 'VIP', expireDate: '2026-11-12', status: 1, lastLoginTime: '2026-10-08 19:40', createTime: '2026-03-09 11:00' },
        { id: 7, username: 'zhangsan', realName: '张三', phone: '13800000021', roleNames: '教务管理员', memberLevel: '普通', expireDate: '2026-12-31', status: 1, lastLoginTime: '2026-09-28 10:11', createTime: '2026-06-11 15:20' },
        { id: 8, username: 'lisi', realName: '李四', phone: '13800000022', roleNames: '教师', memberLevel: '普通', expireDate: '2026-12-31', status: 1, lastLoginTime: '2026-09-26 08:45', createTime: '2026-06-12 09:00' },
        { id: 9, username: 'wangwu', realName: '王五', phone: '13800000023', roleNames: '学生', memberLevel: '普通', expireDate: '2026-12-31', status: 1, lastLoginTime: '2026-09-20 21:30', createTime: '2026-06-18 16:40' },
        { id: 10, username: 'zhaoliu', realName: '赵六', phone: '13800000024', roleNames: '教师', memberLevel: '普通', expireDate: '2026-10-01', status: 0, lastLoginTime: '2026-08-30 09:15', createTime: '2026-06-20 10:10' },
        { id: 11, username: 'sunqi', realName: '孙七', phone: '13800000025', roleNames: '学生', memberLevel: '普通', expireDate: '2026-10-01', status: 0, lastLoginTime: '2026-08-29 18:05', createTime: '2026-06-22 14:25' },
        { id: 12, username: 'zhouba', realName: '周八', phone: '13800000026', roleNames: '教务管理员', memberLevel: 'VIP', expireDate: '2027-01-31', status: 1, lastLoginTime: '2026-10-07 11:50', createTime: '2026-07-02 09:35' }
    ];

    var permissions = [
        { id: 1, parentId: 0, parentName: '顶级', permissionName: '系统管理', permissionCode: 'system', type: 1, path: '-', sortOrder: 1, status: 1 },
        { id: 101, parentId: 1, parentName: '系统管理', permissionName: '用户管理', permissionCode: 'system:user:list', type: 2, path: 'pages/system/user.html', sortOrder: 1, status: 1 },
        { id: 102, parentId: 1, parentName: '系统管理', permissionName: '角色管理', permissionCode: 'system:role:list', type: 2, path: 'pages/system/role.html', sortOrder: 2, status: 1 },
        { id: 103, parentId: 1, parentName: '系统管理', permissionName: '权限管理', permissionCode: 'system:permission:list', type: 2, path: 'pages/system/permission.html', sortOrder: 3, status: 1 },
        { id: 1001, parentId: 101, parentName: '用户管理', permissionName: '新增用户', permissionCode: 'system:user:add', type: 3, path: '-', sortOrder: 1, status: 1 },
        { id: 1002, parentId: 101, parentName: '用户管理', permissionName: '编辑用户', permissionCode: 'system:user:edit', type: 3, path: '-', sortOrder: 2, status: 1 },
        { id: 1003, parentId: 101, parentName: '用户管理', permissionName: '删除用户', permissionCode: 'system:user:delete', type: 3, path: '-', sortOrder: 3, status: 1 },
        { id: 1004, parentId: 101, parentName: '用户管理', permissionName: '重置密码', permissionCode: 'system:user:reset', type: 3, path: '-', sortOrder: 4, status: 1 },
        { id: 1011, parentId: 102, parentName: '角色管理', permissionName: '新增角色', permissionCode: 'system:role:add', type: 3, path: '-', sortOrder: 1, status: 1 },
        { id: 1013, parentId: 102, parentName: '角色管理', permissionName: '角色授权', permissionCode: 'system:role:grant', type: 3, path: '-', sortOrder: 3, status: 1 },
        { id: 1021, parentId: 103, parentName: '权限管理', permissionName: '新增权限', permissionCode: 'system:permission:add', type: 3, path: '-', sortOrder: 1, status: 1 },
        { id: 2, parentId: 0, parentName: '顶级', permissionName: '新闻中心', permissionCode: 'news:list', type: 2, path: 'pages/news/index.html', sortOrder: 2, status: 1 },
        { id: 201, parentId: 2, parentName: '新闻中心', permissionName: '新闻发布', permissionCode: 'news:add', type: 3, path: '-', sortOrder: 1, status: 1 },
        { id: 202, parentId: 2, parentName: '新闻中心', permissionName: '新闻编辑', permissionCode: 'news:edit', type: 3, path: '-', sortOrder: 2, status: 1 },
        { id: 3, parentId: 0, parentName: '顶级', permissionName: '教师管理', permissionCode: 'teacher:list', type: 2, path: 'pages/teacher/basic.html', sortOrder: 3, status: 1 },
        { id: 304, parentId: 3, parentName: '教师管理', permissionName: '授课安排', permissionCode: 'teacher:course:list', type: 2, path: 'pages/teacher/course.html', sortOrder: 4, status: 1 },
        { id: 4, parentId: 0, parentName: '顶级', permissionName: '学生管理', permissionCode: 'student', type: 1, path: '-', sortOrder: 4, status: 1 },
        { id: 401, parentId: 4, parentName: '学生管理', permissionName: '基本信息', permissionCode: 'student:basic:list', type: 2, path: 'pages/student/basic.html', sortOrder: 1, status: 1 },
        { id: 402, parentId: 4, parentName: '学生管理', permissionName: '学生考勤', permissionCode: 'student:attendance:list', type: 2, path: 'pages/student/attendance.html', sortOrder: 2, status: 1 },
        { id: 403, parentId: 4, parentName: '学生管理', permissionName: '缴费管理', permissionCode: 'student:payment:list', type: 2, path: 'pages/student/payment.html', sortOrder: 3, status: 1 },
        { id: 404, parentId: 4, parentName: '学生管理', permissionName: '学生学习档案', permissionCode: 'student:archive:list', type: 2, path: 'pages/student/archive.html', sortOrder: 4, status: 1 },
        { id: 405, parentId: 4, parentName: '学生管理', permissionName: '学生作品', permissionCode: 'student:work:list', type: 2, path: 'pages/student/works.html', sortOrder: 5, status: 1 },
        { id: 4101, parentId: 401, parentName: '基本信息', permissionName: '新增学生', permissionCode: 'student:basic:add', type: 3, path: '-', sortOrder: 1, status: 1 },
        { id: 4102, parentId: 401, parentName: '基本信息', permissionName: '编辑学生', permissionCode: 'student:basic:edit', type: 3, path: '-', sortOrder: 2, status: 1 },
        { id: 5, parentId: 0, parentName: '顶级', permissionName: '课程管理', permissionCode: 'course:list', type: 2, path: 'pages/common/coming-soon.html', sortOrder: 5, status: 1 },
        { id: 6, parentId: 0, parentName: '顶级', permissionName: '班级管理', permissionCode: 'clazz:list', type: 2, path: 'pages/common/coming-soon.html', sortOrder: 6, status: 1 },
        { id: 7, parentId: 0, parentName: '顶级', permissionName: '成绩管理', permissionCode: 'score:list', type: 2, path: 'pages/common/coming-soon.html', sortOrder: 7, status: 1 },
        { id: 8, parentId: 0, parentName: '顶级', permissionName: '课件资源', permissionCode: 'courseware:list', type: 2, path: 'pages/courseware/index.html', sortOrder: 8, status: 1 },
        { id: 1012, parentId: 102, parentName: '角色管理', permissionName: '编辑角色', permissionCode: 'system:role:edit', type: 3, path: '-', sortOrder: 2, status: 1 },
        { id: 1014, parentId: 102, parentName: '角色管理', permissionName: '删除角色', permissionCode: 'system:role:delete', type: 3, path: '-', sortOrder: 4, status: 1 },
        { id: 1022, parentId: 103, parentName: '权限管理', permissionName: '编辑权限', permissionCode: 'system:permission:edit', type: 3, path: '-', sortOrder: 2, status: 1 },
        { id: 1023, parentId: 103, parentName: '权限管理', permissionName: '删除权限', permissionCode: 'system:permission:delete', type: 3, path: '-', sortOrder: 3, status: 1 },
        { id: 203, parentId: 2, parentName: '新闻中心', permissionName: '新闻删除', permissionCode: 'news:delete', type: 3, path: '-', sortOrder: 3, status: 1 },
        { id: 204, parentId: 2, parentName: '新闻中心', permissionName: '新闻置顶', permissionCode: 'news:top', type: 3, path: '-', sortOrder: 4, status: 1 },
        { id: 301, parentId: 3, parentName: '教师管理', permissionName: '新增教师', permissionCode: 'teacher:add', type: 3, path: '-', sortOrder: 1, status: 1 },
        { id: 302, parentId: 3, parentName: '教师管理', permissionName: '编辑教师', permissionCode: 'teacher:edit', type: 3, path: '-', sortOrder: 2, status: 1 },
        { id: 303, parentId: 3, parentName: '教师管理', permissionName: '删除教师', permissionCode: 'teacher:delete', type: 3, path: '-', sortOrder: 3, status: 1 },
        { id: 4103, parentId: 401, parentName: '基本信息', permissionName: '删除学生', permissionCode: 'student:basic:delete', type: 3, path: '-', sortOrder: 3, status: 1 },
        { id: 4104, parentId: 401, parentName: '基本信息', permissionName: '导出学生', permissionCode: 'student:basic:export', type: 3, path: '-', sortOrder: 4, status: 1 },
        { id: 501, parentId: 5, parentName: '课程管理', permissionName: '新增课程', permissionCode: 'course:add', type: 3, path: '-', sortOrder: 1, status: 1 },
        { id: 502, parentId: 5, parentName: '课程管理', permissionName: '编辑课程', permissionCode: 'course:edit', type: 3, path: '-', sortOrder: 2, status: 1 },
        { id: 503, parentId: 5, parentName: '课程管理', permissionName: '删除课程', permissionCode: 'course:delete', type: 3, path: '-', sortOrder: 3, status: 1 },
        { id: 504, parentId: 5, parentName: '课程管理', permissionName: '课程大纲', permissionCode: 'course:chapter:list', type: 2, path: 'pages/course/chapter.html', sortOrder: 4, status: 1 },
        { id: 601, parentId: 6, parentName: '班级管理', permissionName: '新增班级', permissionCode: 'clazz:add', type: 3, path: '-', sortOrder: 1, status: 1 },
        { id: 602, parentId: 6, parentName: '班级管理', permissionName: '编辑班级', permissionCode: 'clazz:edit', type: 3, path: '-', sortOrder: 2, status: 1 },
        { id: 603, parentId: 6, parentName: '班级管理', permissionName: '删除班级', permissionCode: 'clazz:delete', type: 3, path: '-', sortOrder: 3, status: 1 },
        { id: 604, parentId: 6, parentName: '班级管理', permissionName: '课表管理', permissionCode: 'schedule:list', type: 2, path: 'pages/clazz/schedule.html', sortOrder: 4, status: 1 },
        { id: 701, parentId: 7, parentName: '成绩管理', permissionName: '成绩录入', permissionCode: 'score:add', type: 3, path: '-', sortOrder: 1, status: 1 },
        { id: 702, parentId: 7, parentName: '成绩管理', permissionName: '成绩修改', permissionCode: 'score:edit', type: 3, path: '-', sortOrder: 2, status: 1 },
        { id: 703, parentId: 7, parentName: '成绩管理', permissionName: '成绩删除', permissionCode: 'score:delete', type: 3, path: '-', sortOrder: 3, status: 1 },
        { id: 704, parentId: 7, parentName: '成绩管理', permissionName: '成绩统计', permissionCode: 'score:stat', type: 3, path: '-', sortOrder: 4, status: 1 },
        { id: 705, parentId: 7, parentName: '成绩管理', permissionName: '成绩导出', permissionCode: 'score:export', type: 3, path: '-', sortOrder: 5, status: 1 },
        { id: 801, parentId: 8, parentName: '课件资源', permissionName: '课件上传', permissionCode: 'courseware:upload', type: 3, path: '-', sortOrder: 1, status: 1 },
        { id: 802, parentId: 8, parentName: '课件资源', permissionName: '课件下载', permissionCode: 'courseware:download', type: 3, path: '-', sortOrder: 2, status: 1 },
        { id: 803, parentId: 8, parentName: '课件资源', permissionName: '课件删除', permissionCode: 'courseware:delete', type: 3, path: '-', sortOrder: 3, status: 1 },
        { id: 9, parentId: 0, parentName: '顶级', permissionName: '工作台', permissionCode: 'dashboard:view', type: 2, path: 'pages/dashboard/index.html', sortOrder: 0, status: 1 }
    ];

    /* -------------------------------- 教师 -------------------------------- */
    var teachers = [
        { id: 1, teacherNo: 'T1001', name: '王建国', gender: 1, title: '高级讲师', majorDirection: 'Python / 算法竞赛', education: '硕士', phone: '13800000010', entryDate: '2021-03-01', status: 1, classNames: 'Python 全栈 2603 班' },
        { id: 2, teacherNo: 'T1002', name: '李慧敏', gender: 2, title: '讲师', majorDirection: '前端开发 / 数据结构', education: '本科', phone: '13800000011', entryDate: '2022-07-15', status: 1, classNames: '算法竞赛 2601 班' },
        { id: 3, teacherNo: 'T1003', name: '张伟', gender: 1, title: '高级讲师', majorDirection: 'Java / 后端开发', education: '硕士', phone: '13800000012', entryDate: '2020-09-01', status: 1, classNames: '-' },
        { id: 4, teacherNo: 'T1004', name: '刘婷', gender: 2, title: '讲师', majorDirection: 'Scratch / 少儿编程', education: '本科', phone: '13800000013', entryDate: '2023-02-20', status: 1, classNames: '-' },
        { id: 5, teacherNo: 'T1005', name: '陈鹏', gender: 1, title: '助教', majorDirection: 'Python 基础', education: '本科', phone: '13800000014', entryDate: '2024-07-01', status: 1, classNames: '-' },
        { id: 6, teacherNo: 'T1006', name: '赵敏', gender: 2, title: '讲师', majorDirection: '人工智能通识', education: '硕士', phone: '13800000015', entryDate: '2023-09-01', status: 0, classNames: '-' }
    ];

    var teacherCourses = [
        { id: 1, teacherName: '王建国', courseName: 'Python 全栈开发', className: 'Python 全栈 2603 班', term: '2026春', totalHours: 120, roleType: 1 },
        { id: 2, teacherName: '王建国', courseName: 'Python 全栈开发', className: 'Python 全栈 2603 班', term: '2026春', totalHours: 0, roleType: 3 },
        { id: 3, teacherName: '李慧敏', courseName: '算法与程序设计竞赛', className: '算法竞赛 2601 班', term: '2026春', totalHours: 80, roleType: 1 },
        { id: 4, teacherName: '李慧敏', courseName: '算法与程序设计竞赛', className: '算法竞赛 2601 班', term: '2026春', totalHours: 0, roleType: 3 },
        { id: 5, teacherName: '张伟', courseName: 'Java 后端开发', className: '-', term: '2026秋', totalHours: 96, roleType: 1 },
        { id: 6, teacherName: '刘婷', courseName: '少儿编程启蒙', className: '-', term: '2026秋', totalHours: 48, roleType: 1 }
    ];

    var evaluations = [
        { id: 1, evalType: 1, teacherName: '王建国', studentName: '陈思远', courseName: 'Python 全栈开发', score: 9.5, content: '老师讲解细致，代码示例很多，课后答疑也很及时。', evalDate: '2026-06-20' },
        { id: 2, evalType: 1, teacherName: '李慧敏', studentName: '孙梦琪', courseName: '算法与程序设计竞赛', score: 9.0, content: '竞赛训练安排合理，模拟赛复盘收获很大。', evalDate: '2026-06-21' },
        { id: 3, evalType: 2, teacherName: '王建国', studentName: '-', courseName: 'Python 全栈开发', score: 9.2, content: '教学督导听课评价：课堂节奏清晰，重难点突出。', evalDate: '2026-05-18' },
        { id: 4, evalType: 1, teacherName: '王建国', studentName: '林小雨', courseName: 'Python 全栈开发', score: 9.6, content: '作业点评很认真，能指出具体改进方向。', evalDate: '2026-06-22' },
        { id: 5, evalType: 1, teacherName: '张伟', studentName: '-', courseName: 'Java 后端开发', score: 8.8, content: '课程内容充实，节奏稍快，希望能多留练习时间。', evalDate: '2026-06-25' },
        { id: 6, evalType: 2, teacherName: '李慧敏', studentName: '-', courseName: '算法与程序设计竞赛', score: 9.3, content: '教学督导评价：板书与演示结合得当。', evalDate: '2026-05-20' }
    ];

    /* -------------------------------- 学生 -------------------------------- */
    var students = [
        { id: 1, studentNo: 'S2026001', name: '陈思远', gender: 1, className: 'Python 全栈 2603 班', phone: '13900000001', guardianName: '陈国强', guardianPhone: '13900001001', enrollDate: '2026-03-01', source: '线上推广', status: 1 },
        { id: 2, studentNo: 'S2026002', name: '林小雨', gender: 2, className: 'Python 全栈 2603 班', phone: '13900000002', guardianName: '林美华', guardianPhone: '13900001002', enrollDate: '2026-03-01', source: '老学员推荐', status: 1 },
        { id: 3, studentNo: 'S2026003', name: '赵子豪', gender: 1, className: 'Python 全栈 2603 班', phone: '13900000003', guardianName: '赵伟', guardianPhone: '13900001003', enrollDate: '2026-03-02', source: '线下活动', status: 1 },
        { id: 4, studentNo: 'S2026004', name: '孙梦琪', gender: 2, className: 'Python 全栈 2603 班', phone: '13900000004', guardianName: '孙立平', guardianPhone: '13900001004', enrollDate: '2026-03-02', source: '线上推广', status: 1 },
        { id: 5, studentNo: 'S2026005', name: '周航', gender: 1, className: '算法竞赛 2601 班', phone: '13900000005', guardianName: '周建明', guardianPhone: '13900001005', enrollDate: '2026-03-09', source: '学校合作', status: 1 },
        { id: 6, studentNo: 'S2026006', name: '吴佳怡', gender: 2, className: '算法竞赛 2601 班', phone: '13900000006', guardianName: '吴丽', guardianPhone: '13900001006', enrollDate: '2026-03-09', source: '老学员推荐', status: 1 },
        { id: 7, studentNo: 'S2026007', name: '郑浩', gender: 1, className: 'Python 全栈 2603 班', phone: '13900000007', guardianName: '郑建', guardianPhone: '13900001007', enrollDate: '2026-03-15', source: '线上推广', status: 1 },
        { id: 8, studentNo: 'S2026008', name: '黄雅琴', gender: 2, className: '算法竞赛 2601 班', phone: '13900000008', guardianName: '黄志强', guardianPhone: '13900001008', enrollDate: '2026-03-16', source: '线下活动', status: 1 },
        { id: 9, studentNo: 'S2026009', name: '马俊', gender: 1, className: 'Python 全栈 2603 班', phone: '13900000009', guardianName: '马海涛', guardianPhone: '13900001009', enrollDate: '2026-04-01', source: '老学员推荐', status: 2 },
        { id: 10, studentNo: 'S2026010', name: '许静', gender: 2, className: '算法竞赛 2601 班', phone: '13900000010', guardianName: '许明', guardianPhone: '13900001010', enrollDate: '2026-04-06', source: '学校合作', status: 3 },
        { id: 11, studentNo: 'S2026011', name: '郭磊', gender: 1, className: '-', phone: '13900000011', guardianName: '郭强', guardianPhone: '13900001011', enrollDate: '2026-05-08', source: '线上推广', status: 1 },
        { id: 12, studentNo: 'S2026012', name: '何雨欣', gender: 2, className: 'Python 全栈 2603 班', phone: '13900000012', guardianName: '何伟', guardianPhone: '13900001012', enrollDate: '2026-05-10', source: '线下活动', status: 1 }
    ];

    var attendances = [
        { id: 1, studentNo: 'S2026001', studentName: '陈思远', className: 'Python 全栈 2603 班', courseName: 'Python 全栈开发', attendDate: '2026-06-06', attendType: 1, checkTime: '09:02', remark: '-' },
        { id: 2, studentNo: 'S2026002', studentName: '林小雨', className: 'Python 全栈 2603 班', courseName: 'Python 全栈开发', attendDate: '2026-06-06', attendType: 2, checkTime: '09:15', remark: '迟到 15 分钟' },
        { id: 3, studentNo: 'S2026003', studentName: '赵子豪', className: 'Python 全栈 2603 班', courseName: 'Python 全栈开发', attendDate: '2026-06-06', attendType: 5, checkTime: '-', remark: '病假，家长已提前请假' },
        { id: 4, studentNo: 'S2026004', studentName: '孙梦琪', className: 'Python 全栈 2603 班', courseName: 'Python 全栈开发', attendDate: '2026-06-06', attendType: 1, checkTime: '08:55', remark: '-' },
        { id: 5, studentNo: 'S2026005', studentName: '周航', className: '算法竞赛 2601 班', courseName: '算法与程序设计竞赛', attendDate: '2026-06-07', attendType: 1, checkTime: '14:01', remark: '-' },
        { id: 6, studentNo: 'S2026006', studentName: '吴佳怡', className: '算法竞赛 2601 班', courseName: '算法与程序设计竞赛', attendDate: '2026-06-07', attendType: 4, checkTime: '-', remark: '事假' },
        { id: 7, studentNo: 'S2026001', studentName: '陈思远', className: 'Python 全栈 2603 班', courseName: 'Python 全栈开发', attendDate: '2026-06-13', attendType: 1, checkTime: '08:58', remark: '-' },
        { id: 8, studentNo: 'S2026002', studentName: '林小雨', className: 'Python 全栈 2603 班', courseName: 'Python 全栈开发', attendDate: '2026-06-13', attendType: 3, checkTime: '10:30', remark: '早退' },
        { id: 9, studentNo: 'S2026007', studentName: '郑浩', className: 'Python 全栈 2603 班', courseName: 'Python 全栈开发', attendDate: '2026-06-13', attendType: 1, checkTime: '09:00', remark: '-' },
        { id: 10, studentNo: 'S2026008', studentName: '黄雅琴', className: '算法竞赛 2601 班', courseName: '算法与程序设计竞赛', attendDate: '2026-06-14', attendType: 2, checkTime: '14:12', remark: '迟到 12 分钟' },
        { id: 11, studentNo: 'S2026012', studentName: '何雨欣', className: 'Python 全栈 2603 班', courseName: 'Python 全栈开发', attendDate: '2026-06-20', attendType: 1, checkTime: '08:50', remark: '-' },
        { id: 12, studentNo: 'S2026004', studentName: '孙梦琪', className: 'Python 全栈 2603 班', courseName: 'Python 全栈开发', attendDate: '2026-06-20', attendType: 1, checkTime: '08:52', remark: '-' }
    ];

    var payments = [
        { id: 1, studentNo: 'S2026001', studentName: '陈思远', orderNo: 'JF20260301001', courseName: 'Python 全栈开发', payType: 1, shouldAmount: 8800, discountAmount: 300, paidAmount: 8500, arrearsAmount: 0, payStatus: 2, payMethod: 1, payTime: '2026-03-01 10:12', operatorName: '王教务', remark: '开学优惠 300 元' },
        { id: 2, studentNo: 'S2026002', studentName: '林小雨', orderNo: 'JF20260301002', courseName: 'Python 全栈开发', payType: 1, shouldAmount: 8800, discountAmount: 0, paidAmount: 5000, arrearsAmount: 3800, payStatus: 1, payMethod: 2, payTime: '2026-03-02 15:40', operatorName: '王教务', remark: '分期首付' },
        { id: 3, studentNo: 'S2026003', studentName: '赵子豪', orderNo: 'JF20260301003', courseName: 'Python 全栈开发', payType: 1, shouldAmount: 8800, discountAmount: 0, paidAmount: 8800, arrearsAmount: 0, payStatus: 2, payMethod: 3, payTime: '2026-03-01 09:05', operatorName: '王教务', remark: '现金缴费' },
        { id: 4, studentNo: 'S2026004', studentName: '孙梦琪', orderNo: 'JF20260301004', courseName: 'Python 全栈开发', payType: 1, shouldAmount: 8800, discountAmount: 500, paidAmount: 8300, arrearsAmount: 0, payStatus: 2, payMethod: 1, payTime: '2026-03-05 11:00', operatorName: '王教务', remark: '老学员推荐优惠 500 元' },
        { id: 5, studentNo: 'S2026005', studentName: '周航', orderNo: 'JF20260309001', courseName: '算法与程序设计竞赛', payType: 1, shouldAmount: 6800, discountAmount: 0, paidAmount: 3000, arrearsAmount: 3800, payStatus: 1, payMethod: 4, payTime: '2026-03-09 16:20', operatorName: '王教务', remark: '银行转账首付' },
        { id: 6, studentNo: 'S2026006', studentName: '吴佳怡', orderNo: 'JF20260309002', courseName: '算法与程序设计竞赛', payType: 1, shouldAmount: 6800, discountAmount: 0, paidAmount: 6800, arrearsAmount: 0, payStatus: 2, payMethod: 2, payTime: '2026-03-10 10:00', operatorName: '王教务', remark: '一次性缴清' },
        { id: 7, studentNo: 'S2026007', studentName: '郑浩', orderNo: 'JF20260315001', courseName: 'Python 全栈开发', payType: 1, shouldAmount: 8800, discountAmount: 0, paidAmount: 0, arrearsAmount: 8800, payStatus: 0, payMethod: null, payTime: '-', operatorName: '王教务', remark: '待缴费' },
        { id: 8, studentNo: 'S2026009', studentName: '马俊', orderNo: 'JF20260401001', courseName: 'Python 全栈开发', payType: 3, shouldAmount: 1200, discountAmount: 0, paidAmount: 1200, arrearsAmount: 0, payStatus: 2, payMethod: 1, payTime: '2026-04-01 09:30', operatorName: '王教务', remark: '课时补费' }
    ];

    var archives = [
        { id: 1, studentNo: 'S2026001', studentName: '陈思远', courseName: 'Python 全栈开发', stageNo: 1, stageName: 'Python 基础', studyHours: 32, assessScore: 92, abilityTags: '变量/循环/函数/调试', teacherComment: '基础扎实，代码规范良好，能独立完成课后练习。', archiveDate: '2026-04-25' },
        { id: 2, studentNo: 'S2026001', studentName: '陈思远', courseName: 'Python 全栈开发', stageNo: 2, stageName: 'Python 进阶', studyHours: 36, assessScore: 89.5, abilityTags: '列表推导/文件IO/异常处理', teacherComment: '逻辑清晰，建议加强异常处理的边界考虑。', archiveDate: '2026-06-30' },
        { id: 3, studentNo: 'S2026002', studentName: '林小雨', courseName: 'Python 全栈开发', stageNo: 1, stageName: 'Python 基础', studyHours: 28, assessScore: 88.5, abilityTags: '变量/循环/函数', teacherComment: '进步明显，作业提交及时。', archiveDate: '2026-05-05' },
        { id: 4, studentNo: 'S2026003', studentName: '赵子豪', courseName: 'Python 全栈开发', stageNo: 1, stageName: 'Python 基础', studyHours: 24, assessScore: 76, abilityTags: '变量/循环', teacherComment: '出勤有缺漏，建议课后补齐练习。', archiveDate: '2026-05-05' },
        { id: 5, studentNo: 'S2026004', studentName: '孙梦琪', courseName: 'Python 全栈开发', stageNo: 1, stageName: 'Python 基础', studyHours: 34, assessScore: 95, abilityTags: '变量/循环/函数/调试', teacherComment: '思维活跃，常主动帮助同学。', archiveDate: '2026-04-28' },
        { id: 6, studentNo: 'S2026005', studentName: '周航', courseName: '算法与程序设计竞赛', stageNo: 1, stageName: '算法基础', studyHours: 30, assessScore: 85, abilityTags: '枚举/排序/查找', teacherComment: '基础算法掌握良好，建议增加刷题量。', archiveDate: '2026-05-31' },
        { id: 7, studentNo: 'S2026006', studentName: '吴佳怡', courseName: '算法与程序设计竞赛', stageNo: 1, stageName: '算法基础', studyHours: 30, assessScore: 90.5, abilityTags: '枚举/排序/查找/递归', teacherComment: '思路清晰，模拟赛表现稳定。', archiveDate: '2026-06-01' },
        { id: 8, studentNo: 'S2026007', studentName: '郑浩', courseName: 'Python 全栈开发', stageNo: 1, stageName: 'Python 基础', studyHours: 26, assessScore: 82, abilityTags: '变量/循环/函数', teacherComment: '课堂参与度高，建议加强独立调试能力。', archiveDate: '2026-06-05' }
    ];

    var works = [
        { id: 1, studentNo: 'S2026001', studentName: '陈思远', courseName: 'Python 全栈开发', title: '学生成绩统计小工具', workType: 1, description: '读取 CSV 成绩文件并输出平均分与排名。', teacherComment: '结构清晰，建议增加异常提示与参数校验。', score: 94.5, isPublic: 1, submitTime: '2026-06-25 20:30' },
        { id: 2, studentNo: 'S2026004', studentName: '孙梦琪', courseName: 'Python 全栈开发', title: '个人博客静态页面', workType: 1, description: '手写 HTML/CSS 实现响应式个人博客。', teacherComment: '布局还原度高，注意移动端断点细节。', score: 92, isPublic: 1, submitTime: '2026-06-26 21:10' },
        { id: 3, studentNo: 'S2026002', studentName: '林小雨', courseName: 'Python 全栈开发', title: '猜数字游戏', workType: 1, description: '控制台猜数字小游戏。', teacherComment: '交互设计有趣，代码可再拆分函数复用。', score: 88, isPublic: 1, submitTime: '2026-06-27 19:05' },
        { id: 4, studentNo: 'S2026005', studentName: '周航', courseName: '算法与程序设计竞赛', title: '二分查找可视化演示', workType: 1, description: '用动画演示二分查找的过程。', teacherComment: '可视化效果好，建议补充时间复杂度说明。', score: 90.5, isPublic: 0, submitTime: '2026-07-02 18:40' },
        { id: 5, studentNo: 'S2026007', studentName: '郑浩', courseName: 'Python 全栈开发', title: '课程表管理小程序', workType: 1, description: '基于列表与字典实现课程表增删改查。', teacherComment: '功能完整，注意输入校验。', score: 86, isPublic: 1, submitTime: '2026-07-05 20:00' },
        { id: 6, studentNo: 'S2026006', studentName: '吴佳怡', courseName: '算法与程序设计竞赛', title: '排序算法对比实验报告', workType: 3, description: '对比冒泡、快排、归并的运行耗时。', teacherComment: '数据充分，图表清晰。', score: 91, isPublic: 1, submitTime: '2026-07-08 16:20' },
        { id: 7, studentNo: 'S2026012', studentName: '何雨欣', courseName: 'Python 全栈开发', title: '待办事项清单工具', workType: 1, description: '命令行待办事项管理工具。', teacherComment: '-', score: null, isPublic: 0, submitTime: '2026-07-10 21:45' }
    ];

    /* ----------------------------- 课程 / 大纲 ----------------------------- */
    var courses = [
        { id: 1, courseCode: 'C2601', courseName: 'Python 全栈开发', category: 'Python', credit: 6.0, totalHours: 120, price: 8800, status: 1, clazzCount: 1, chapterCount: 5 },
        { id: 2, courseCode: 'C2602', courseName: '算法与程序设计竞赛', category: '算法竞赛', credit: 4.0, totalHours: 80, price: 6800, status: 1, clazzCount: 1, chapterCount: 1 },
        { id: 3, courseCode: 'C2603', courseName: '前端开发实战', category: '前端', credit: 4.0, totalHours: 72, price: 6200, status: 1, clazzCount: 0, chapterCount: 1 },
        { id: 4, courseCode: 'C2604', courseName: 'Java 后端开发', category: 'Java', credit: 5.0, totalHours: 96, price: 7800, status: 1, clazzCount: 0, chapterCount: 0 },
        { id: 5, courseCode: 'C2605', courseName: '少儿编程启蒙（Scratch）', category: '少儿编程', credit: 3.0, totalHours: 48, price: 3800, status: 1, clazzCount: 0, chapterCount: 0 },
        { id: 6, courseCode: 'C2606', courseName: '人工智能通识', category: '人工智能', credit: 3.0, totalHours: 40, price: 4200, status: 0, clazzCount: 0, chapterCount: 0 }
    ];

    var chapters = [
        { id: 1, courseName: 'Python 全栈开发', parentName: '-', chapterName: '第一章 Python 基础语法', hours: 24, sortOrder: 1, content: '变量、数据类型、运算符、条件与循环' },
        { id: 2, courseName: 'Python 全栈开发', parentName: '第一章 Python 基础语法', chapterName: '1.1 变量与数据类型', hours: 8, sortOrder: 1, content: 'int / float / str / bool 与类型转换' },
        { id: 3, courseName: 'Python 全栈开发', parentName: '第一章 Python 基础语法', chapterName: '1.2 流程控制', hours: 8, sortOrder: 2, content: 'if / for / while 与循环嵌套' },
        { id: 4, courseName: 'Python 全栈开发', parentName: '第一章 Python 基础语法', chapterName: '1.3 函数与模块', hours: 8, sortOrder: 3, content: '函数定义、参数、作用域与模块导入' },
        { id: 5, courseName: 'Python 全栈开发', parentName: '-', chapterName: '第二章 面向对象与文件操作', hours: 32, sortOrder: 2, content: '类与对象、文件读写、异常处理' },
        { id: 6, courseName: '算法与程序设计竞赛', parentName: '-', chapterName: '第一章 基础算法', hours: 32, sortOrder: 1, content: '枚举、排序、查找、递归' },
        { id: 7, courseName: '前端开发实战', parentName: '-', chapterName: '第一章 页面结构与样式', hours: 24, sortOrder: 1, content: 'HTML5 语义化标签与 CSS3 布局' }
    ];

    /* ------------------------------- 班级 / 课表 ------------------------------- */
    var clazzes = [
        { id: 1, classCode: 'P2603', className: 'Python 全栈 2603 班', courseName: 'Python 全栈开发', headTeacherName: '王建国', classroom: 'A301', startDate: '2026-03-02', endDate: '2026-09-30', capacity: 30, studentCount: 7, status: 1, remark: '周末班，周六上午 + 周三下午上课' },
        { id: 2, classCode: 'A2601', className: '算法竞赛 2601 班', courseName: '算法与程序设计竞赛', headTeacherName: '李慧敏', classroom: 'B202', startDate: '2026-03-09', endDate: '2026-07-31', capacity: 25, studentCount: 4, status: 1, remark: '竞赛集训班' },
        { id: 3, classCode: 'P2604', className: 'Python 全栈 2604 班', courseName: 'Python 全栈开发', headTeacherName: '王建国', classroom: 'A302', startDate: '2026-09-07', endDate: '2027-03-31', capacity: 30, studentCount: 0, status: 0, remark: '秋季新班，招生中' },
        { id: 4, classCode: 'F2601', className: '前端实战 2601 班', courseName: '前端开发实战', headTeacherName: '李慧敏', classroom: 'A303', startDate: '2026-09-14', endDate: '2026-12-31', capacity: 25, studentCount: 0, status: 0, remark: '周末班' },
        { id: 5, classCode: 'P2501', className: 'Python 全栈 2501 班', courseName: 'Python 全栈开发', headTeacherName: '王建国', classroom: 'A301', startDate: '2025-09-01', endDate: '2026-02-28', capacity: 30, studentCount: 0, status: 2, remark: '已结业' }
    ];

    var schedules = [
        { id: 1, className: 'Python 全栈 2603 班', courseName: 'Python 全栈开发', teacherName: '王建国', classroom: 'A301', weekday: 6, lessonStart: '09:00', lessonEnd: '11:00', term: '2026春', remark: '周六上午正课' },
        { id: 2, className: 'Python 全栈 2603 班', courseName: 'Python 全栈开发', teacherName: '王建国', classroom: 'A301', weekday: 3, lessonStart: '14:00', lessonEnd: '16:00', term: '2026春', remark: '周三下午答疑课' },
        { id: 3, className: '算法竞赛 2601 班', courseName: '算法与程序设计竞赛', teacherName: '李慧敏', classroom: 'B202', weekday: 6, lessonStart: '14:00', lessonEnd: '17:00', term: '2026春', remark: '周六下午竞赛训练' },
        { id: 4, className: '算法竞赛 2601 班', courseName: '算法与程序设计竞赛', teacherName: '李慧敏', classroom: 'B202', weekday: 7, lessonStart: '09:00', lessonEnd: '12:00', term: '2026春', remark: '周日上午模拟赛' },
        { id: 5, className: '前端实战 2601 班', courseName: '前端开发实战', teacherName: '李慧敏', classroom: 'A303', weekday: 6, lessonStart: '09:00', lessonEnd: '12:00', term: '2026秋', remark: '周六上午' },
        { id: 6, className: 'Python 全栈 2604 班', courseName: 'Python 全栈开发', teacherName: '王建国', classroom: 'A302', weekday: 7, lessonStart: '14:00', lessonEnd: '17:00', term: '2026秋', remark: '周日下午' }
    ];

    /* -------------------------------- 成绩 -------------------------------- */
    var scores = [
        { id: 1, studentNo: 'S2026001', studentName: '陈思远', className: 'Python 全栈 2603 班', courseName: 'Python 全栈开发', examType: 1, score: 92.0, fullScore: 100.0, examDate: '2026-04-20', teacherName: '王建国', remark: '阶段一测验' },
        { id: 2, studentNo: 'S2026002', studentName: '林小雨', className: 'Python 全栈 2603 班', courseName: 'Python 全栈开发', examType: 1, score: 88.5, fullScore: 100.0, examDate: '2026-04-20', teacherName: '王建国', remark: '-' },
        { id: 3, studentNo: 'S2026003', studentName: '赵子豪', className: 'Python 全栈 2603 班', courseName: 'Python 全栈开发', examType: 1, score: 76.0, fullScore: 100.0, examDate: '2026-04-20', teacherName: '王建国', remark: '-' },
        { id: 4, studentNo: 'S2026004', studentName: '孙梦琪', className: 'Python 全栈 2603 班', courseName: 'Python 全栈开发', examType: 1, score: 95.0, fullScore: 100.0, examDate: '2026-04-20', teacherName: '王建国', remark: '-' },
        { id: 5, studentNo: 'S2026001', studentName: '陈思远', className: 'Python 全栈 2603 班', courseName: 'Python 全栈开发', examType: 3, score: 89.0, fullScore: 100.0, examDate: '2026-06-28', teacherName: '王建国', remark: '期末考核' },
        { id: 6, studentNo: 'S2026002', studentName: '林小雨', className: 'Python 全栈 2603 班', courseName: 'Python 全栈开发', examType: 3, score: 91.5, fullScore: 100.0, examDate: '2026-06-28', teacherName: '王建国', remark: '-' },
        { id: 7, studentNo: 'S2026003', studentName: '赵子豪', className: 'Python 全栈 2603 班', courseName: 'Python 全栈开发', examType: 3, score: 80.5, fullScore: 100.0, examDate: '2026-06-28', teacherName: '王建国', remark: '-' },
        { id: 8, studentNo: 'S2026004', studentName: '孙梦琪', className: 'Python 全栈 2603 班', courseName: 'Python 全栈开发', examType: 3, score: 93.5, fullScore: 100.0, examDate: '2026-06-28', teacherName: '王建国', remark: '-' },
        { id: 9, studentNo: 'S2026005', studentName: '周航', className: '算法竞赛 2601 班', courseName: '算法与程序设计竞赛', examType: 2, score: 85.0, fullScore: 100.0, examDate: '2026-05-30', teacherName: '李慧敏', remark: '期中模拟赛' },
        { id: 10, studentNo: 'S2026006', studentName: '吴佳怡', className: '算法竞赛 2601 班', courseName: '算法与程序设计竞赛', examType: 2, score: 90.5, fullScore: 100.0, examDate: '2026-05-30', teacherName: '李慧敏', remark: '-' },
        { id: 11, studentNo: 'S2026007', studentName: '郑浩', className: 'Python 全栈 2603 班', courseName: 'Python 全栈开发', examType: 1, score: 82.0, fullScore: 100.0, examDate: '2026-04-20', teacherName: '王建国', remark: '-' },
        { id: 12, studentNo: 'S2026012', studentName: '何雨欣', className: 'Python 全栈 2603 班', courseName: 'Python 全栈开发', examType: 1, score: 87.5, fullScore: 100.0, examDate: '2026-04-20', teacherName: '王建国', remark: '-' }
    ];

    /* ------------------------------ 课件资源 ------------------------------ */
    var coursewares = [
        { id: 1, title: 'Python 基础语法课件（第 1-3 章）', courseName: 'Python 全栈开发', categoryName: '课件讲义', fileType: 'pdf', fileSizeText: '2.30 MB', uploaderName: '王教务', downloadCount: 86, createTime: '2026-03-05 10:20' },
        { id: 2, title: 'Python 面向对象讲义', courseName: 'Python 全栈开发', categoryName: '课件讲义', fileType: 'pptx', fileSizeText: '5.00 MB', uploaderName: '王教务', downloadCount: 54, createTime: '2026-04-11 15:40' },
        { id: 3, title: '算法竞赛入门题单', courseName: '算法与程序设计竞赛', categoryName: '练习题库', fileType: 'pdf', fileSizeText: '1.00 MB', uploaderName: '覃艳', downloadCount: 73, createTime: '2026-03-12 09:15' },
        { id: 4, title: '前端实战案例源码', courseName: '前端开发实战', categoryName: '源码素材', fileType: 'zip', fileSizeText: '8.00 MB', uploaderName: '王教务', downloadCount: 41, createTime: '2026-05-08 16:02' },
        { id: 5, title: 'Python 期末复习提纲', courseName: 'Python 全栈开发', categoryName: '复习资料', fileType: 'pdf', fileSizeText: '860 KB', uploaderName: '王建国', downloadCount: 92, createTime: '2026-06-18 11:30' },
        { id: 6, title: '蓝桥杯历年真题解析', courseName: '算法与程序设计竞赛', categoryName: '练习题库', fileType: 'pdf', fileSizeText: '3.40 MB', uploaderName: '李慧敏', downloadCount: 128, createTime: '2026-06-25 14:50' },
        { id: 7, title: '学生作品展示模板', courseName: '-', categoryName: '源码素材', fileType: 'zip', fileSizeText: '1.20 MB', uploaderName: '覃艳', downloadCount: 19, createTime: '2026-07-03 09:40' },
        { id: 8, title: '课堂录屏：递归与分治', courseName: '算法与程序设计竞赛', categoryName: '课堂录屏', fileType: 'mp4', fileSizeText: '186 MB', uploaderName: '李慧敏', downloadCount: 37, createTime: '2026-07-12 20:10' }
    ];

    var coursewareCategories = [
        { id: 1, categoryName: '课件讲义', fileCount: 2, remark: '课堂教学用 PPT / PDF' },
        { id: 2, categoryName: '练习题库', fileCount: 2, remark: '课后练习与竞赛题单' },
        { id: 3, categoryName: '源码素材', fileCount: 2, remark: '案例代码与模板' },
        { id: 4, categoryName: '复习资料', fileCount: 1, remark: '考前复习提纲' },
        { id: 5, categoryName: '课堂录屏', fileCount: 1, remark: '课程回放视频' }
    ];

    /* ------------------------- 工作台待办 / 最近动态 ------------------------- */
    var todos = [
        { id: 1, type: '缴费', content: '林小雨、周航的缴费单仍未缴清，合计欠费 7600 元', level: '紧急', time: '今天 09:12' },
        { id: 2, type: '考勤', content: '2603 班 6 月 13 日有 1 条早退记录待班主任确认', level: '普通', time: '昨天 17:30' },
        { id: 3, type: '作品', content: '何雨欣提交作品《待办事项清单工具》，等待教师点评', level: '普通', time: '昨天 21:45' },
        { id: 4, type: '课程', content: 'Python 全栈 2604 班正在招生，尚未分配课表', level: '提醒', time: '10-10 10:00' }
    ];

    /* ------------------------------- 工具函数 ------------------------------- */
    function paginate(list, page, size) {
        page = parseInt(page, 10) || 1;
        size = parseInt(size, 10) || 10;
        var start = (page - 1) * size;
        return { list: list.slice(start, start + size), total: list.length, page: page, size: size };
    }

    function like(value, keyword) {
        if (!keyword) return true;
        return String(value == null ? '' : value).toLowerCase().indexOf(String(keyword).toLowerCase()) > -1;
    }

    function filterByKeyword(list, keyword, fields) {
        if (!keyword) return list;
        return list.filter(function (row) {
            return fields.some(function (f) { return like(row[f], keyword); });
        });
    }

    var ALL_PERMISSION_CODES = permissions.map(function (p) { return p.permissionCode; });

    /* ------------------------------- 模拟路由 ------------------------------- */
    window.JP_mockData = {
        newsCategories: newsCategories, news: news, roles: roles, users: users, permissions: permissions,
        teachers: teachers, teacherCourses: teacherCourses, evaluations: evaluations,
        students: students, attendances: attendances, payments: payments, archives: archives, works: works,
        courses: courses, chapters: chapters, clazzes: clazzes, schedules: schedules, scores: scores,
        coursewares: coursewares, coursewareCategories: coursewareCategories, todos: todos
    };

    window.JP_mock = {
        handle: function (path, method, params, body) {
            params = params || {};
            method = (method || 'GET').toUpperCase();
            var p = path.replace(/^\/+/, '');

            if (method === 'POST' && p === 'auth/one-key-login') {
                var user = users[0];
                return {
                    code: 0, message: '登录成功',
                    data: {
                        token: 'mock-jwt-token-' + Date.now(),
                        user: {
                            id: user.id, name: user.realName, username: user.username,
                            avatarText: user.realName.substring(0, 1),
                            roleName: user.roleNames, memberLevel: user.memberLevel,
                            expireDate: user.expireDate
                        },
                        permissions: ALL_PERMISSION_CODES
                    }
                };
            }

            if (method === 'GET' && p === 'news') {
                var rows = news.slice();
                if (params.category && params.category !== 'all') {
                    rows = rows.filter(function (n) { return n.categoryCode === params.category; });
                }
                rows = filterByKeyword(rows, params.keyword, ['title', 'summary', 'author', 'source']);
                rows.sort(function (a, b) {
                    if (a.isTop !== b.isTop) return b.isTop - a.isTop;
                    return a.publishTime < b.publishTime ? 1 : -1;
                });
                rows = rows.map(function (n) {
                    var cat = newsCategories.filter(function (c) { return c.code === n.categoryCode; })[0] || {};
                    return Object.assign({}, n, { categoryName: cat.name || '-' });
                });
                return { code: 0, message: 'ok', data: paginate(rows, params.page, params.size || 5) };
            }

            if (method === 'GET' && p === 'users') {
                return { code: 0, message: 'ok', data: paginate(filterByKeyword(users, params.keyword, ['username', 'realName', 'phone', 'roleNames']), params.page, params.size) };
            }
            if (method === 'GET' && p === 'roles') {
                return { code: 0, message: 'ok', data: paginate(filterByKeyword(roles, params.keyword, ['roleName', 'roleCode', 'description']), params.page, params.size) };
            }
            /* 角色授权：GET 返回该角色已授权限 id，PUT 返回保存结果（演示模式不做持久化） */
            var rolePerm = p.match(/^roles\/(\d+)\/permissions$/);
            if (rolePerm) {
                var rid = Number(rolePerm[1]);
                var ids = rid === 1
                    ? permissions.map(function (x) { return x.id; })
                    : permissions.filter(function (x) { return x.type <= 2; }).map(function (x) { return x.id; });
                if (method === 'GET') return { code: 0, message: 'ok', data: { roleId: rid, permissionIds: ids } };
                return { code: 0, message: '演示模式：未持久化', data: { roleId: rid, count: (body && body.permissionIds ? body.permissionIds.length : 0) } };
            }
            if (method === 'GET' && p === 'permissions') {
                var pm = filterByKeyword(permissions, params.keyword, ['permissionName', 'permissionCode', 'parentName']);
                if (params.type) pm = pm.filter(function (x) { return String(x.type) === String(params.type); });
                return { code: 0, message: 'ok', data: paginate(pm, params.page, params.size || 12) };
            }
            if (method === 'GET' && p === 'teachers') {
                return { code: 0, message: 'ok', data: paginate(filterByKeyword(teachers, params.keyword, ['name', 'teacherNo', 'majorDirection', 'title']), params.page, params.size) };
            }
            if (method === 'GET' && p === 'teacher-courses') {
                return { code: 0, message: 'ok', data: paginate(filterByKeyword(teacherCourses, params.keyword, ['teacherName', 'courseName', 'className']), params.page, params.size) };
            }
            if (method === 'GET' && p === 'evaluations') {
                return { code: 0, message: 'ok', data: paginate(filterByKeyword(evaluations, params.keyword, ['teacherName', 'studentName', 'courseName', 'content']), params.page, params.size) };
            }
            if (method === 'GET' && p === 'students') {
                var st = filterByKeyword(students, params.keyword, ['name', 'studentNo', 'className', 'phone']);
                if (params.status) st = st.filter(function (s) { return String(s.status) === String(params.status); });
                if (params.className) st = st.filter(function (s) { return s.className === params.className; });
                return { code: 0, message: 'ok', data: paginate(st, params.page, params.size) };
            }
            if (method === 'GET' && p === 'attendances') {
                var at = filterByKeyword(attendances, params.keyword, ['studentName', 'studentNo', 'className', 'courseName']);
                if (params.attendType) at = at.filter(function (a) { return String(a.attendType) === String(params.attendType); });
                return { code: 0, message: 'ok', data: paginate(at, params.page, params.size) };
            }
            if (method === 'GET' && p === 'payments') {
                var py = filterByKeyword(payments, params.keyword, ['studentName', 'studentNo', 'orderNo', 'courseName']);
                if (params.payStatus !== undefined && params.payStatus !== '' && params.payStatus !== null) {
                    py = py.filter(function (a) { return String(a.payStatus) === String(params.payStatus); });
                }
                return { code: 0, message: 'ok', data: paginate(py, params.page, params.size) };
            }
            if (method === 'GET' && p === 'archives') {
                return { code: 0, message: 'ok', data: paginate(filterByKeyword(archives, params.keyword, ['studentName', 'studentNo', 'courseName', 'stageName']), params.page, params.size) };
            }
            if (method === 'GET' && p === 'works') {
                return { code: 0, message: 'ok', data: paginate(filterByKeyword(works, params.keyword, ['studentName', 'studentNo', 'title', 'courseName']), params.page, params.size) };
            }
            if (method === 'GET' && p === 'courses') {
                return { code: 0, message: 'ok', data: paginate(filterByKeyword(courses, params.keyword, ['courseName', 'courseCode', 'category']), params.page, params.size) };
            }
            if (method === 'GET' && p === 'course-chapters') {
                var ch = filterByKeyword(chapters, params.keyword, ['courseName', 'chapterName', 'parentName']);
                if (params.courseName) ch = ch.filter(function (c) { return c.courseName === params.courseName; });
                return { code: 0, message: 'ok', data: paginate(ch, params.page, params.size) };
            }
            if (method === 'GET' && p === 'classes') {
                var cz = filterByKeyword(clazzes, params.keyword, ['className', 'classCode', 'courseName', 'headTeacherName']);
                if (params.status !== undefined && params.status !== '' && params.status !== null) {
                    cz = cz.filter(function (c) { return String(c.status) === String(params.status); });
                }
                return { code: 0, message: 'ok', data: paginate(cz, params.page, params.size) };
            }
            if (method === 'GET' && p === 'schedules') {
                var sc = filterByKeyword(schedules, params.keyword, ['className', 'courseName', 'teacherName', 'classroom']);
                if (params.weekday) sc = sc.filter(function (s) { return String(s.weekday) === String(params.weekday); });
                return { code: 0, message: 'ok', data: paginate(sc, params.page, params.size) };
            }
            if (method === 'GET' && p === 'scores') {
                var se = filterByKeyword(scores, params.keyword, ['studentName', 'studentNo', 'courseName', 'className']);
                if (params.examType) se = se.filter(function (s) { return String(s.examType) === String(params.examType); });
                return { code: 0, message: 'ok', data: paginate(se, params.page, params.size) };
            }
            if (method === 'GET' && p === 'coursewares') {
                var cw = filterByKeyword(coursewares, params.keyword, ['title', 'courseName', 'categoryName', 'uploaderName']);
                if (params.categoryName) cw = cw.filter(function (c) { return c.categoryName === params.categoryName; });
                return { code: 0, message: 'ok', data: paginate(cw, params.page, params.size) };
            }
            if (method === 'GET' && p === 'courseware-categories') {
                return { code: 0, message: 'ok', data: paginate(filterByKeyword(coursewareCategories, params.keyword, ['categoryName', 'remark']), params.page, params.size) };
            }
            if (method === 'GET' && p === 'todos') {
                return { code: 0, message: 'ok', data: paginate(todos, params.page, params.size) };
            }
            if (method === 'GET' && p === 'score-stats') {
                /* 按课程统计平均分 / 最高分 / 最低分 / 及格率 */
                var byCourse = {};
                scores.forEach(function (s) {
                    var k = s.courseName;
                    byCourse[k] = byCourse[k] || { courseName: k, count: 0, sum: 0, max: -1, min: 999, pass: 0 };
                    var item = byCourse[k];
                    item.count += 1;
                    item.sum += Number(s.score);
                    item.max = Math.max(item.max, Number(s.score));
                    item.min = Math.min(item.min, Number(s.score));
                    if (Number(s.score) / Number(s.fullScore) >= 0.6) item.pass += 1;
                });
                var statRows = Object.keys(byCourse).map(function (k) {
                    var it = byCourse[k];
                    return {
                        courseName: it.courseName,
                        count: it.count,
                        avg: Math.round(it.sum / it.count * 10) / 10,
                        max: it.max,
                        min: it.min,
                        passRate: Math.round(it.pass / it.count * 1000) / 10
                    };
                });
                /* 按分数段分布，用于成绩统计页的柱状图 */
                var buckets = [
                    { label: '90 分以上', min: 90, max: 101, count: 0 },
                    { label: '80-89 分', min: 80, max: 90, count: 0 },
                    { label: '70-79 分', min: 70, max: 80, count: 0 },
                    { label: '60-69 分', min: 60, max: 70, count: 0 },
                    { label: '60 分以下', min: -1, max: 60, count: 0 }
                ];
                scores.forEach(function (s) {
                    var v = Number(s.score);
                    for (var i = 0; i < buckets.length; i++) {
                        if (v >= buckets[i].min && v < buckets[i].max) { buckets[i].count += 1; break; }
                    }
                });
                return { code: 0, message: 'ok', data: { byCourse: statRows, buckets: buckets, total: scores.length } };
            }
            if (method === 'GET' && p === 'stats/overview') {
                var inClass = students.filter(function (s) { return s.status === 1 && s.className !== '-'; }).length;
                var arrears = payments.filter(function (p2) { return p2.arrearsAmount > 0; }).length;
                var arrearsAmount = payments.reduce(function (sum, p3) { return sum + Number(p3.arrearsAmount || 0); }, 0);
                var scoreValues = archives.map(function (a) { return Number(a.assessScore); });
                var avg = scoreValues.reduce(function (a, b) { return a + b; }, 0) / (scoreValues.length || 1);
                return {
                    code: 0, message: 'ok',
                    data: {
                        studentTotal: students.length,
                        inClass: inClass,
                        arrearsCount: arrears,
                        arrearsAmount: arrearsAmount,
                        avgScore: Math.round(avg * 10) / 10,
                        teacherTotal: teachers.length,
                        newsTotal: news.length
                    }
                };
            }

            if (method !== 'GET') {
                return { code: 0, message: '演示模式下数据未持久化', data: Object.assign({}, body || {}) };
            }
            return { code: 404, message: '演示数据中没有该接口：' + path, data: null };
        }
    };
})();
