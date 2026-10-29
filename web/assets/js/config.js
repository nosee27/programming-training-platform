/* =====================================================================
   全局配置 · 父系统与三端（管理端 / 学生端 / 教师端）
   ---------------------------------------------------------------------
   父系统「编程培训平台管理平台（江京教育）」
      ├─ 教学管理  管理端：系统管理、教师、学生、课程、班级、成绩、课件、新闻
      ├─ 学生端    学生自助：我的课表 / 考勤 / 成绩 / 档案 / 作品 / 课件
      └─ 教师端    教师工作台：我的授课 / 学生考勤 / 成绩录入 / 教学评价 / 作品点评
   ⚠️ 红线：任何菜单都不得出现「奖学金」；新闻中心只有四个 Tab。
   ===================================================================== */

window.JP_CONFIG = {
    brand: '江京教育',
    projectName: '编程培训平台管理平台',
    /* 由 Express 托管页面时走同源 /api；用其它方式打开则指向本机后端端口
       （3000 被其它软件占用，本项目后端固定使用 3001） */
    apiBase: location.port === '3001' ? '/api' : 'http://localhost:3001/api',
    /* file:// 直接打开时立刻使用内置演示数据；由 Express 托管时优先后端、失败再降级 */
    useMock: location.protocol === 'file:' ? true : 'auto',
    timeout: 2500,
    home: 'pages/dashboard/index.html',
    pageSize: 10,
    defaultSubsystem: 'teach'
};

/* =====================================================================
   三个端（侧边栏顶部与 Header 均可切换；无权限的端会置灰）
   ===================================================================== */
window.JP_SUBSYSTEMS = [
    {
        key: 'teach', name: '教学管理', icon: '🎓',
        desc: '管理端：系统管理 / 教师 / 学生 / 课程 / 班级 / 成绩 / 课件 / 新闻', ready: true
    },
    {
        key: 'student', name: '学生端', icon: '🧑‍🎓', home: 'pages/dashboard/student.html',
        desc: '学生自助：我的课表、我的考勤、我的成绩、学习档案、我的作品、课件下载', ready: true,
        menus: [
            { key: 'stu-home', name: '我的主页', icon: '🏠', path: 'pages/dashboard/student.html', perm: 'news:list' },
            { key: 'stu-score', name: '我的成绩', icon: '📊', path: 'pages/score/index.html', perm: 'score:list' },
            { key: 'stu-schedule', name: '我的课表', icon: '🗓️', path: 'pages/clazz/schedule.html', perm: 'schedule:list' },
            { key: 'stu-attendance', name: '我的考勤', icon: '✅', path: 'pages/student/attendance.html', perm: 'student:attendance:list' },
            { key: 'stu-archive', name: '学习档案', icon: '📈', path: 'pages/student/archive.html', perm: 'student:archive:list' },
            { key: 'stu-work', name: '我的作品', icon: '💡', path: 'pages/student/works.html', perm: 'student:work:list' },
            { key: 'stu-courseware', name: '课件下载', icon: '📁', path: 'pages/courseware/index.html', perm: 'courseware:list' },
            { key: 'stu-news', name: '新闻中心', icon: '📋', path: 'pages/news/index.html', perm: 'news:list' },
            { key: 'stu-profile', name: '个人中心', icon: '👤', path: 'pages/account/profile.html', perm: '' }
        ]
    },
    {
        key: 'teacher', name: '教师端', icon: '👨‍🏫', home: 'pages/dashboard/teacher.html',
        desc: '教师工作台：我的授课、学员考勤、成绩录入、教学评价、作品点评', ready: true,
        menus: [
            { key: 'tea-home', name: '教师工作台', icon: '🏠', path: 'pages/dashboard/teacher.html', perm: 'news:list' },
            { key: 'tea-course', name: '我的授课', icon: '📘', path: 'pages/teacher/course.html', perm: 'teacher:course:list' },
            { key: 'tea-schedule', name: '我的课表', icon: '🗓️', path: 'pages/clazz/schedule.html', perm: 'schedule:list' },
            { key: 'tea-attendance', name: '学员考勤', icon: '✅', path: 'pages/student/attendance.html', perm: 'student:attendance:list' },
            { key: 'tea-score', name: '成绩录入', icon: '📝', path: 'pages/score/add.html', perm: 'score:add' },
            { key: 'tea-score-list', name: '成绩查询', icon: '📊', path: 'pages/score/index.html', perm: 'score:list' },
            { key: 'tea-eval', name: '教学评价', icon: '⭐', path: 'pages/teacher/evaluation.html', perm: 'teacher:list' },
            { key: 'tea-archive', name: '学员档案', icon: '📈', path: 'pages/student/archive.html', perm: 'student:archive:list' },
            { key: 'tea-work', name: '作品点评', icon: '💡', path: 'pages/student/works.html', perm: 'student:work:list' },
            { key: 'tea-courseware', name: '课件资源', icon: '📁', path: 'pages/courseware/index.html', perm: 'courseware:list' },
            { key: 'tea-news', name: '新闻中心', icon: '📋', path: 'pages/news/index.html', perm: 'news:list' },
            { key: 'tea-profile', name: '个人中心', icon: '👤', path: 'pages/account/profile.html', perm: '' }
        ]
    }
];

/* =====================================================================
   教学管理（管理端）菜单树
   key  : 与页面 <html data-page="..."> 对应，用于选中态高亮
   perm : 权限编码，登录后无此权限的菜单不渲染
   ===================================================================== */
window.JP_MENU = [
    { key: 'dashboard', name: '工作台', icon: '🏠', path: 'pages/dashboard/index.html', perm: 'news:list' },
    {
        key: 'system', name: '系统管理', icon: '⚙️', perm: 'system',
        children: [
            { key: 'system-user', name: '用户管理', path: 'pages/system/user.html', perm: 'system:user:list' },
            { key: 'system-role', name: '角色管理', path: 'pages/system/role.html', perm: 'system:role:list' },
            { key: 'system-permission', name: '权限管理', path: 'pages/system/permission.html', perm: 'system:permission:list' }
        ]
    },
    { key: 'news', name: '新闻中心', icon: '📋', path: 'pages/news/index.html', perm: 'news:list' },
    {
        key: 'courseware', name: '课件资源', icon: '📁', perm: 'courseware:list',
        children: [
            { key: 'courseware-list', name: '课件列表', path: 'pages/courseware/index.html', perm: 'courseware:list' },
            { key: 'courseware-category', name: '课件分类', path: 'pages/courseware/category.html', perm: 'courseware:list' }
        ]
    },
    {
        key: 'teacher', name: '教师管理', icon: '👨‍🏫', perm: 'teacher:list',
        children: [
            { key: 'teacher-basic', name: '基本信息', path: 'pages/teacher/basic.html', perm: 'teacher:list' },
            { key: 'teacher-course', name: '授课安排', path: 'pages/teacher/course.html', perm: 'teacher:course:list' },
            { key: 'teacher-evaluation', name: '教学评价', path: 'pages/teacher/evaluation.html', perm: 'teacher:list' }
        ]
    },
    {
        key: 'student', name: '学生管理', icon: '🎓', perm: 'student',
        children: [
            { key: 'student-basic', name: '基本信息', path: 'pages/student/basic.html', perm: 'student:basic:list' },
            { key: 'student-attendance', name: '学生考勤', path: 'pages/student/attendance.html', perm: 'student:attendance:list' },
            { key: 'student-payment', name: '缴费管理', path: 'pages/student/payment.html', perm: 'student:payment:list' },
            { key: 'student-archive', name: '学生学习档案', path: 'pages/student/archive.html', perm: 'student:archive:list' },
            { key: 'student-works', name: '学生作品', path: 'pages/student/works.html', perm: 'student:work:list' }
        ]
    },
    {
        key: 'course', name: '课程管理', icon: '📘', perm: 'course:list',
        children: [
            { key: 'course-list', name: '课程信息', path: 'pages/course/index.html', perm: 'course:list' },
            { key: 'course-chapter', name: '课程大纲', path: 'pages/course/chapter.html', perm: 'course:chapter:list' }
        ]
    },
    {
        key: 'clazz', name: '班级管理', icon: '🏫', perm: 'clazz:list',
        children: [
            { key: 'clazz-list', name: '班级信息', path: 'pages/clazz/index.html', perm: 'clazz:list' },
            { key: 'clazz-member', name: '班级成员', path: 'pages/clazz/member.html', perm: 'student:basic:list' },
            { key: 'clazz-schedule', name: '课表管理', path: 'pages/clazz/schedule.html', perm: 'schedule:list' }
        ]
    },
    {
        key: 'score', name: '成绩管理', icon: '📊', perm: 'score:list',
        children: [
            { key: 'score-add', name: '成绩录入', path: 'pages/score/add.html', perm: 'score:add' },
            { key: 'score-list', name: '成绩查询 / 导出', path: 'pages/score/index.html', perm: 'score:list' },
            { key: 'score-stat', name: '成绩统计', path: 'pages/score/stat.html', perm: 'score:stat' }
        ]
    }
];

/* 个人中心下拉菜单（右上角） */
window.JP_USER_MENU = [
    { key: 'account-profile', name: '👤 个人中心', path: 'pages/account/profile.html', perm: '' },
    { key: 'account-password', name: '🔑 修改密码', path: 'pages/account/profile.html?tab=password', perm: '' },
    { key: 'account-vip', name: '💎 会员权益', action: 'vip', perm: '' },
    { key: 'account-logout', name: '🚪 退出登录', action: 'logout', perm: '' }
];
