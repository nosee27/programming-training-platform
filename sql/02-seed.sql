/* =====================================================================
   编程培训平台管理平台（江京教育）
   02-seed.sql —— 初始化种子数据
   执行前提：已执行 01-schema.sql
   执行方式：mysql -u root -p < sql/02-seed.sql

   ⚠️ 本脚本会先清空下列表的既有数据再重新写入，仅用于课程作业初始化。
   ⚠️ 全库禁止出现「奖学金」相关数据，本文件已自检。
   ===================================================================== */

USE `program_training_platform`;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE `sys_role_permission`;
TRUNCATE TABLE `sys_admin_role`;
TRUNCATE TABLE `sys_admin`;
TRUNCATE TABLE `sys_permission`;
TRUNCATE TABLE `sys_role`;
TRUNCATE TABLE `news`;
TRUNCATE TABLE `news_category`;
TRUNCATE TABLE `score`;
TRUNCATE TABLE `evaluation`;
TRUNCATE TABLE `schedule`;
TRUNCATE TABLE `study_archive`;
TRUNCATE TABLE `student_work`;
TRUNCATE TABLE `payment`;
TRUNCATE TABLE `attendance`;
TRUNCATE TABLE `student`;
TRUNCATE TABLE `teacher_course`;
TRUNCATE TABLE `clazz`;
TRUNCATE TABLE `course_chapter`;
TRUNCATE TABLE `courseware`;
TRUNCATE TABLE `course`;
TRUNCATE TABLE `teacher`;

/* ---------------------------------------------------------------------
   1. 角色（4 个）
   --------------------------------------------------------------------- */
INSERT INTO `sys_role` (`id`, `role_name`, `role_code`, `description`, `sort_order`, `status`) VALUES
(1, '超级管理员', 'SUPER_ADMIN', '拥有全部菜单与按钮权限，可维护系统管理', 1, 1),
(2, '教务管理员', 'EDU_ADMIN',   '负责课程、班级、学生与新闻的日常运营', 2, 1),
(3, '教师',       'TEACHER',     '查看所带班级学生，录入成绩与评价', 3, 1),
(4, '学生',       'STUDENT',     '仅可查看本人档案、成绩、考勤与作品', 4, 1);

/* ---------------------------------------------------------------------
   2. 权限树（目录 / 菜单 / 按钮，parent_id = 0 为顶级）
   --------------------------------------------------------------------- */
INSERT INTO `sys_permission` (`id`, `parent_id`, `permission_name`, `permission_code`, `type`, `path`, `icon`, `sort_order`, `status`) VALUES
-- 系统管理
(1,    0,   '系统管理',     'system',                    1, NULL,                              'gear',   1, 1),
(101,  1,   '用户管理',     'system:user:list',          2, 'pages/system/user.html',          NULL,     1, 1),
(102,  1,   '角色管理',     'system:role:list',          2, 'pages/system/role.html',          NULL,     2, 1),
(103,  1,   '权限管理',     'system:permission:list',    2, 'pages/system/permission.html',    NULL,     3, 1),
(1001, 101, '新增用户',     'system:user:add',           3, NULL,                              NULL,     1, 1),
(1002, 101, '编辑用户',     'system:user:edit',          3, NULL,                              NULL,     2, 1),
(1003, 101, '删除用户',     'system:user:delete',        3, NULL,                              NULL,     3, 1),
(1004, 101, '重置密码',     'system:user:reset',         3, NULL,                              NULL,     4, 1),
(1011, 102, '新增角色',     'system:role:add',           3, NULL,                              NULL,     1, 1),
(1012, 102, '编辑角色',     'system:role:edit',          3, NULL,                              NULL,     2, 1),
(1013, 102, '角色授权',     'system:role:grant',         3, NULL,                              NULL,     3, 1),
(1014, 102, '删除角色',     'system:role:delete',        3, NULL,                              NULL,     4, 1),
(1021, 103, '新增权限',     'system:permission:add',     3, NULL,                              NULL,     1, 1),
(1022, 103, '编辑权限',     'system:permission:edit',    3, NULL,                              NULL,     2, 1),
(1023, 103, '删除权限',     'system:permission:delete',  3, NULL,                              NULL,     3, 1),
-- 新闻中心（仅 4 个 Tab：全部 / 平台公告 / 行业资讯 / 赛事动态；「全部」由前端聚合，不占权限记录）
(2,    0,   '新闻中心',     'news:list',                 2, 'pages/news/index.html',           'news',   2, 1),
(201,  2,   '新闻发布',     'news:add',                  3, NULL,                              NULL,     1, 1),
(202,  2,   '新闻编辑',     'news:edit',                 3, NULL,                              NULL,     2, 1),
(203,  2,   '新闻删除',     'news:delete',               3, NULL,                              NULL,     3, 1),
(204,  2,   '新闻置顶',     'news:top',                  3, NULL,                              NULL,     4, 1),
-- 教师管理
(3,    0,   '教师管理',     'teacher:list',              2, 'pages/teacher/index.html',        'teacher', 3, 1),
(301,  3,   '新增教师',     'teacher:add',               3, NULL,                              NULL,     1, 1),
(302,  3,   '编辑教师',     'teacher:edit',              3, NULL,                              NULL,     2, 1),
(303,  3,   '删除教师',     'teacher:delete',            3, NULL,                              NULL,     3, 1),
(304,  3,   '授课安排',     'teacher:course:list',       2, 'pages/teacher/course.html',       NULL,     4, 1),
-- 学生管理
(4,    0,   '学生管理',     'student',                   1, NULL,                              'student', 4, 1),
(401,  4,   '基本信息',     'student:basic:list',        2, 'pages/student/basic.html',        NULL,     1, 1),
(402,  4,   '学生考勤',     'student:attendance:list',   2, 'pages/student/attendance.html',   NULL,     2, 1),
(403,  4,   '缴费管理',     'student:payment:list',      2, 'pages/student/payment.html',      NULL,     3, 1),
(404,  4,   '学生学习档案', 'student:archive:list',      2, 'pages/student/archive.html',      NULL,     4, 1),
(405,  4,   '学生作品',     'student:work:list',         2, 'pages/student/works.html',        NULL,     5, 1),
(4101, 401, '新增学生',     'student:basic:add',         3, NULL,                              NULL,     1, 1),
(4102, 401, '编辑学生',     'student:basic:edit',        3, NULL,                              NULL,     2, 1),
(4103, 401, '删除学生',     'student:basic:delete',      3, NULL,                              NULL,     3, 1),
(4104, 401, '导出学生',     'student:basic:export',      3, NULL,                              NULL,     4, 1),
-- 课程管理
(5,    0,   '课程管理',     'course:list',               2, 'pages/course/index.html',         'course', 5, 1),
(501,  5,   '新增课程',     'course:add',                3, NULL,                              NULL,     1, 1),
(502,  5,   '编辑课程',     'course:edit',               3, NULL,                              NULL,     2, 1),
(503,  5,   '删除课程',     'course:delete',             3, NULL,                              NULL,     3, 1),
(504,  5,   '课程大纲',     'course:chapter:list',       2, 'pages/course/chapter.html',       NULL,     4, 1),
-- 班级管理
(6,    0,   '班级管理',     'clazz:list',                2, 'pages/clazz/index.html',          'clazz',  6, 1),
(601,  6,   '新增班级',     'clazz:add',                 3, NULL,                              NULL,     1, 1),
(602,  6,   '编辑班级',     'clazz:edit',                3, NULL,                              NULL,     2, 1),
(603,  6,   '删除班级',     'clazz:delete',              3, NULL,                              NULL,     3, 1),
(604,  6,   '课表管理',     'schedule:list',             2, 'pages/clazz/schedule.html',       NULL,     4, 1),
-- 成绩管理
(7,    0,   '成绩管理',     'score:list',                2, 'pages/score/index.html',          'score',  7, 1),
(701,  7,   '成绩录入',     'score:add',                 3, NULL,                              NULL,     1, 1),
(702,  7,   '成绩修改',     'score:edit',                3, NULL,                              NULL,     2, 1),
(703,  7,   '成绩删除',     'score:delete',              3, NULL,                              NULL,     3, 1),
(704,  7,   '成绩统计',     'score:stat',                3, NULL,                              NULL,     4, 1),
(705,  7,   '成绩导出',     'score:export',              3, NULL,                              NULL,     5, 1),
-- 课件资源
(8,    0,   '课件资源',     'courseware:list',           2, 'pages/courseware/index.html',     'folder', 8, 1),
(801,  8,   '课件上传',     'courseware:upload',         3, NULL,                              NULL,     1, 1),
(802,  8,   '课件下载',     'courseware:download',       3, NULL,                              NULL,     2, 1),
(803,  8,   '课件删除',     'courseware:delete',         3, NULL,                              NULL,     3, 1),
(9,    0,   '工作台',       'dashboard:view',            2, 'pages/dashboard/index.html',      'home',   0, 1);

/* ---------------------------------------------------------------------
   3. 管理员账号（含一键登录默认账号）
      注意：一键登录不校验密码，password 仅为后续扩展预留占位值，
            可在第 4 轮用 bcryptjs 生成真实哈希后覆盖。
   --------------------------------------------------------------------- */
INSERT INTO `sys_admin` (`id`, `username`, `password`, `real_name`, `avatar`, `phone`, `email`, `gender`, `member_level`, `expire_date`, `status`, `remark`) VALUES
(1, 'admin',   '$2a$10$REPLACE_WITH_REAL_BCRYPT_HASH_0000000000000000000000', '覃艳',   NULL, '13800000000', 'admin@jiangjing.edu.cn',    2, 'VIP', '2026-11-12', 1, '一键登录默认账号（超级管理员），昵称与到期时间与参考图一致'),
(2, 'jiaowu',  '$2a$10$REPLACE_WITH_REAL_BCRYPT_HASH_0000000000000000000000', '王教务', NULL, '13800000001', 'jiaowu@jiangjing.edu.cn',   1, 'VIP', '2026-11-12', 1, '教务管理员账号'),
(3, 't1001',   '$2a$10$REPLACE_WITH_REAL_BCRYPT_HASH_0000000000000000000000', '王建国', NULL, '13800000002', 'wang@jiangjing.edu.cn',     1, 'VIP', '2026-11-12', 1, '教师账号，关联 teacher.id = 1'),
(4, 's2026001','$2a$10$REPLACE_WITH_REAL_BCRYPT_HASH_0000000000000000000000', '陈思远', NULL, '13800000003', 'chen@jiangjing.edu.cn',     1, 'VIP', '2026-11-12', 1, '学生账号，关联 student.id = 1'),
(5, 't1002',   '$2a$10$REPLACE_WITH_REAL_BCRYPT_HASH_0000000000000000000000', '李慧敏', NULL, '13800000011', 'li@jiangjing.edu.cn',       2, 'VIP', '2026-11-12', 1, '教师账号，关联 teacher.id = 2（算法竞赛班）'),
(6, 's2026005','$2a$10$REPLACE_WITH_REAL_BCRYPT_HASH_0000000000000000000000', '周航',   NULL, '13800000005', 'zhou@jiangjing.edu.cn',     1, 'VIP', '2026-11-12', 1, '学生账号，关联 student.id = 5'),
(7, 'zhangsan','$2a$10$REPLACE_WITH_REAL_BCRYPT_HASH_0000000000000000000000', '张三',   NULL, '13800000021', 'zhangsan@jiangjing.edu.cn', 1, '普通', '2026-12-31', 1, '教务管理员账号（演示用）'),
(8, 'lisi',    '$2a$10$REPLACE_WITH_REAL_BCRYPT_HASH_0000000000000000000000', '李四',   NULL, '13800000022', 'lisi@jiangjing.edu.cn',     1, '普通', '2026-12-31', 1, '教师账号（演示用，无工号绑定）'),
(9, 's2026007','$2a$10$REPLACE_WITH_REAL_BCRYPT_HASH_0000000000000000000000', '郑浩',   NULL, '13800000007', 'zhenghao@jiangjing.edu.cn', 1, 'VIP', '2026-11-12', 1, '学生账号，关联 student.id = 7'),
(10, 'zhaoliu','$2a$10$REPLACE_WITH_REAL_BCRYPT_HASH_0000000000000000000000', '赵六',   NULL, '13800000024', 'zhaoliu@jiangjing.edu.cn',  1, '普通', '2026-10-01', 0, '已禁用账号（演示状态筛选）');

/* ---------------------------------------------------------------------
   4. 账号-角色、角色-权限
   --------------------------------------------------------------------- */
INSERT INTO `sys_admin_role` (`admin_id`, `role_id`) VALUES
(1, 1),   -- admin   → 超级管理员
(2, 2),   -- jiaowu  → 教务管理员
(3, 3),   -- t1001   → 教师
(4, 4),   -- s2026001→ 学生
(5, 3),   -- t1002   → 教师
(6, 4),   -- s2026005→ 学生
(7, 2),   -- zhangsan→ 教务管理员
(8, 3),   -- lisi    → 教师
(9, 4),   -- s2026007→ 学生
(10, 3);  -- zhaoliu → 教师（账号已禁用）

-- 超级管理员：全部权限
INSERT INTO `sys_role_permission` (`role_id`, `permission_id`)
SELECT 1, `id` FROM `sys_permission`;

-- 教务管理员：除「权限管理」整块与用户/角色高危按钮外，全部开放
INSERT INTO `sys_role_permission` (`role_id`, `permission_id`)
SELECT 2, `id` FROM `sys_permission`
WHERE `permission_code` NOT LIKE 'system:permission%'
  AND `permission_code` NOT IN (
      'system:user:add', 'system:user:edit', 'system:user:delete', 'system:user:reset',
      'system:role:add', 'system:role:edit', 'system:role:delete'
  );

-- 教师：新闻查看、本人教学内容、所带班级学生数据
INSERT INTO `sys_role_permission` (`role_id`, `permission_id`)
SELECT 3, `id` FROM `sys_permission`
WHERE `permission_code` IN (
    'news:list', 'news:edit',
    'teacher:list', 'teacher:course:list',
    'student:basic:list', 'student:attendance:list', 'student:archive:list', 'student:work:list',
    'course:list', 'course:chapter:list',
    'clazz:list', 'schedule:list',
    'score:list', 'score:add', 'score:edit',
    'courseware:list', 'courseware:upload', 'courseware:download'
);

-- 学生：仅查看本人相关数据
INSERT INTO `sys_role_permission` (`role_id`, `permission_id`)
SELECT 4, `id` FROM `sys_permission`
WHERE `permission_code` IN (
    'news:list',
    'student:basic:list', 'student:attendance:list', 'student:archive:list', 'student:work:list',
    'course:list', 'clazz:list', 'schedule:list', 'score:list',
    'courseware:list', 'courseware:download'
);

/* ---------------------------------------------------------------------
   5. 新闻分类（仅三类）与新闻数据
   --------------------------------------------------------------------- */
INSERT INTO `news_category` (`id`, `category_code`, `category_name`, `sort_order`, `status`) VALUES
(1, 'notice',   '平台公告', 1, 1),
(2, 'industry', '行业资讯', 2, 1),
(3, 'match',    '赛事动态', 3, 1);

INSERT INTO `news` (`id`, `title`, `category_id`, `summary`, `content`, `author`, `source`, `is_top`, `view_count`, `status`, `publish_time`, `publisher_id`) VALUES
(1, '第十四届蓝桥杯大赛省赛成绩公布', 3, '本届省赛我校共有 26 名学员获奖，其中一等奖 5 名。',
 '第十四届蓝桥杯大赛省赛成绩已公布，我校共有 26 名学员获奖，其中一等奖 5 名、二等奖 9 名、三等奖 12 名。获奖证书与成绩单已上传至课件资源，请相关班级学员前往下载。',
 '江京教育', '教务处', 1, 128, 1, '2026-10-08 09:30:00', 1),
(2, '2026全国青少年信息学奥林匹克联赛报名开启', 3, '报名时间为 10 月 15 日至 10 月 31 日，请符合条件的学员及时提交材料。',
 '2026 全国青少年信息学奥林匹克联赛（NOIP）报名通道已开启，报名时间为 10 月 15 日至 10 月 31 日。请有意向的学员在班级群内提交报名材料，由任课教师统一汇总。',
 '江京教育', '赛事组委会', 0, 96, 1, '2026-10-05 10:00:00', 1),
(3, '国庆假期教学安排通知', 1, '10 月 1 日至 10 月 3 日停课，10 月 4 日起按周末课表正常上课。',
 '国庆假期教学安排如下：10 月 1 日至 10 月 3 日全部停课；10 月 4 日起按周末课表正常上课，请各班级学员提前查看课表。',
 '江京教育', '教务处', 0, 156, 1, '2026-09-28 16:20:00', 2),
(4, '2026 年编程教育行业人才需求报告发布', 2, '报告显示少儿与青少年编程教师岗位需求同比增长 18%。',
 '最新发布的行业报告显示，编程教育相关岗位需求持续增长，其中青少年编程教师岗位同比增长 18%，具备算法竞赛指导能力的教师最为紧缺。',
 '行业观察', '行业研究院', 0, 74, 1, '2026-09-20 14:00:00', 2);

/* ---------------------------------------------------------------------
   6. 课程、教师、班级、授课安排、课表
   --------------------------------------------------------------------- */
INSERT INTO `course` (`id`, `course_code`, `course_name`, `category`, `credit`, `total_hours`, `price`, `description`, `status`) VALUES
(1, 'C2601', 'Python 全栈开发',     'Python',     6.0, 120, 8800.00, '从语法基础到 Web 全栈开发的完整课程体系', 1),
(2, 'C2602', '算法与程序设计竞赛',   '算法竞赛',   4.0,  80, 6800.00, '面向蓝桥杯与信息学奥赛的算法训练课程',   1),
(3, 'C2603', '前端开发实战',        '前端',       4.0,  72, 6200.00, 'HTML/CSS/JavaScript 到工程化的实战课程', 1);

INSERT INTO `teacher` (`id`, `teacher_no`, `name`, `gender`, `phone`, `email`, `title`, `major_direction`, `education`, `entry_date`, `status`, `intro`) VALUES
(1, 'T1001', '王建国', 1, '13800000010', 'wang@jiangjing.edu.cn', '高级讲师', 'Python / 算法竞赛', '硕士', '2021-03-01', 1, '十年一线编程教学经验，长期负责算法竞赛集训。'),
(2, 'T1002', '李慧敏', 2, '13800000011', 'li@jiangjing.edu.cn',   '讲师',     '前端开发 / 数据结构', '本科', '2022-07-15', 1, '擅长前端与可视化教学，课程评价长期保持在 9.5 分以上。');

INSERT INTO `course_chapter` (`id`, `course_id`, `parent_id`, `chapter_name`, `hours`, `sort_order`, `content`) VALUES
(1, 1, 0,  '第一章 Python 基础语法', 24, 1, '变量、数据类型、运算符、条件与循环'),
(2, 1, 1,  '1.1 变量与数据类型',      8, 1, 'int / float / str / bool 与类型转换'),
(3, 1, 1,  '1.2 流程控制',           8, 2, 'if / for / while 与循环嵌套'),
(4, 1, 1,  '1.3 函数与模块',         8, 3, '函数定义、参数、作用域与模块导入'),
(5, 1, 0,  '第二章 面向对象与文件操作', 32, 2, '类与对象、文件读写、异常处理'),
(6, 2, 0,  '第一章 基础算法',        32, 1, '枚举、排序、查找、递归'),
(7, 3, 0,  '第一章 页面结构与样式',  24, 1, 'HTML5 语义化标签与 CSS3 布局');

INSERT INTO `clazz` (`id`, `class_code`, `class_name`, `course_id`, `head_teacher_id`, `classroom`, `start_date`, `end_date`, `capacity`, `student_count`, `status`, `remark`) VALUES
(1, 'P2603', 'Python 全栈 2603 班', 1, 1, 'A301', '2026-03-02', '2026-09-30', 30, 4, 1, '周末班，周六上午 + 周三下午上课'),
(2, 'A2601', '算法竞赛 2601 班',   2, 2, 'B202', '2026-03-09', '2026-07-31', 25, 2, 1, '竞赛集训班'),
(3, 'P2604', 'Python 全栈 2604 班', 1, 1, 'A302', '2026-09-07', '2027-03-31', 30, 0, 0, '秋季新班，招生中'),
(4, 'F2601', '前端实战 2601 班',   3, 2, 'A303', '2026-09-14', '2026-12-31', 25, 0, 0, '周末班'),
(5, 'P2501', 'Python 全栈 2501 班', 1, 1, 'A301', '2025-09-01', '2026-02-28', 30, 0, 2, '已结业');

INSERT INTO `teacher_course` (`id`, `teacher_id`, `course_id`, `class_id`, `term`, `total_hours`, `role_type`) VALUES
(1, 1, 1, 1, '2026春', 120, 1),
(2, 1, 1, 1, '2026春',   0, 3),
(3, 2, 2, 2, '2026春',  80, 1),
(4, 2, 2, 2, '2026春',   0, 3);

INSERT INTO `schedule` (`id`, `class_id`, `course_id`, `teacher_id`, `classroom`, `weekday`, `lesson_start`, `lesson_end`, `term`, `start_date`, `end_date`, `remark`) VALUES
(1, 1, 1, 1, 'A301', 6, '09:00:00', '11:00:00', '2026春', '2026-03-02', '2026-09-30', '周六上午正课'),
(2, 1, 1, 1, 'A301', 3, '14:00:00', '16:00:00', '2026春', '2026-03-02', '2026-09-30', '周三下午答疑课'),
(3, 2, 2, 2, 'B202', 6, '14:00:00', '17:00:00', '2026春', '2026-03-09', '2026-07-31', '周六下午竞赛训练'),
(4, 2, 2, 2, 'B202', 7, '09:00:00', '12:00:00', '2026春', '2026-03-09', '2026-07-31', '周日上午模拟赛'),
(5, 4, 3, 2, 'A303', 6, '09:00:00', '12:00:00', '2026秋', '2026-09-14', '2026-12-31', '周六上午正课'),
(6, 3, 1, 1, 'A302', 7, '14:00:00', '17:00:00', '2026秋', '2026-09-07', '2027-03-31', '周日下午正课');

/* ---------------------------------------------------------------------
   7. 学生、考勤、缴费、学习档案、学生作品
   --------------------------------------------------------------------- */
INSERT INTO `student` (`id`, `student_no`, `name`, `gender`, `birth_date`, `phone`, `class_id`, `guardian_name`, `guardian_phone`, `enroll_date`, `source`, `status`) VALUES
(1, 'S2026001', '陈思远', 1, '2010-05-12', '13900000001', 1, '陈国强', '13900001001', '2026-03-01', '线上推广', 1),
(2, 'S2026002', '林小雨', 2, '2011-08-23', '13900000002', 1, '林美华', '13900001002', '2026-03-01', '老学员推荐', 1),
(3, 'S2026003', '赵子豪', 1, '2010-11-02', '13900000003', 1, '赵伟',   '13900001003', '2026-03-02', '线下活动', 1),
(4, 'S2026004', '孙梦琪', 2, '2011-02-17', '13900000004', 1, '孙立平', '13900001004', '2026-03-02', '线上推广', 1),
(5, 'S2026005', '周航',   1, '2009-09-30', '13900000005', 2, '周建明', '13900001005', '2026-03-09', '学校合作', 1),
(6, 'S2026006', '吴佳怡', 2, '2010-06-08', '13900000006', 2, '吴丽',   '13900001006', '2026-03-09', '老学员推荐', 1),
(7, 'S2026007', '郑浩',   1, '2010-03-15', '13900000007', 1, '郑建',   '13900001007', '2026-03-15', '线上推广', 1),
(8, 'S2026008', '黄雅琴', 2, '2011-01-20', '13900000008', 2, '黄志强', '13900001008', '2026-03-16', '线下活动', 1),
(9, 'S2026009', '马俊',   1, '2010-07-04', '13900000009', 1, '马海涛', '13900001009', '2026-04-01', '老学员推荐', 2),
(10, 'S2026010', '许静',  2, '2011-04-11', '13900000010', 2, '许明',   '13900001010', '2026-04-06', '学校合作', 3);

/* 新增学员后重算班级在读人数（口径与业务层 refreshClassCount 一致：仅统计在读） */
UPDATE `clazz` c SET c.student_count = (
    SELECT COUNT(*) FROM `student` s WHERE s.class_id = c.id AND s.deleted = 0 AND s.status = 1
);

INSERT INTO `attendance` (`id`, `student_id`, `class_id`, `course_id`, `teacher_id`, `attend_date`, `attend_type`, `check_time`, `remark`) VALUES
(1, 1, 1, 1, 1, '2026-06-06', 1, '09:02:00', NULL),
(2, 2, 1, 1, 1, '2026-06-06', 2, '09:15:00', '迟到 15 分钟'),
(3, 3, 1, 1, 1, '2026-06-06', 5, NULL,       '病假，家长已提前请假'),
(4, 4, 1, 1, 1, '2026-06-06', 1, '08:55:00', NULL),
(5, 5, 2, 2, 2, '2026-06-07', 1, '14:01:00', NULL),
(6, 6, 2, 2, 2, '2026-06-07', 4, NULL,       '事假'),
(7, 1, 1, 1, 1, '2026-06-13', 1, '08:58:00', NULL),
(8, 2, 1, 1, 1, '2026-06-13', 3, '10:30:00', '早退'),
(9, 7, 1, 1, 1, '2026-06-20', 1, '08:57:00', NULL),
(10, 8, 2, 2, 2, '2026-06-21', 2, '14:10:00', '迟到 10 分钟');

INSERT INTO `payment` (`id`, `student_id`, `order_no`, `course_id`, `class_id`, `pay_type`, `should_amount`, `discount_amount`, `paid_amount`, `arrears_amount`, `pay_status`, `pay_method`, `pay_time`, `operator_id`, `remark`) VALUES
(1, 1, 'JF20260301001', 1, 1, 1, 8800.00, 300.00, 8500.00,    0.00, 2, 1, '2026-03-01 10:12:00', 2, '开学优惠 300 元'),
(2, 2, 'JF20260301002', 1, 1, 1, 8800.00,   0.00, 5000.00, 3800.00, 1, 2, '2026-03-02 15:40:00', 2, '分期首付'),
(3, 3, 'JF20260301003', 1, 1, 1, 8800.00,   0.00, 8800.00,    0.00, 2, 3, '2026-03-01 09:05:00', 2, '现金缴费'),
(4, 4, 'JF20260301004', 1, 1, 1, 8800.00, 500.00, 8300.00,    0.00, 2, 1, '2026-03-05 11:00:00', 2, '老学员推荐优惠 500 元'),
(5, 5, 'JF20260309001', 2, 2, 1, 6800.00,   0.00, 3000.00, 3800.00, 1, 4, '2026-03-09 16:20:00', 2, '银行转账首付'),
(6, 6, 'JF20260309002', 2, 2, 1, 6800.00,   0.00, 6800.00,    0.00, 2, 2, '2026-03-10 10:00:00', 2, '支付宝一次性缴清');

INSERT INTO `study_archive` (`id`, `student_id`, `class_id`, `course_id`, `stage_no`, `stage_name`, `study_hours`, `assess_score`, `ability_tags`, `teacher_comment`, `archive_date`) VALUES
(1, 1, 1, 1, 1, 'Python 基础', 32.0, 92.0, '变量/循环/函数/调试', '基础扎实，代码规范良好，能独立完成课后练习。',     '2026-04-25'),
(2, 1, 1, 1, 2, 'Python 进阶', 36.0, 89.5, '列表推导/文件IO/异常处理', '逻辑清晰，建议加强异常处理的边界考虑。',      '2026-06-30'),
(3, 2, 1, 1, 1, 'Python 基础', 28.0, 88.5, '变量/循环/函数',      '进步明显，作业提交及时。',                        '2026-05-05'),
(4, 3, 1, 1, 1, 'Python 基础', 24.0, 76.0, '变量/循环',           '出勤有缺漏，建议课后补齐练习。',                  '2026-05-05'),
(5, 4, 1, 1, 1, 'Python 基础', 34.0, 95.0, '变量/循环/函数/调试', '思维活跃，常主动帮助同学。',                      '2026-04-28'),
(6, 5, 2, 2, 1, '算法基础',    30.0, 85.0, '枚举/排序/查找',      '基础算法掌握良好，建议增加刷题量。',              '2026-05-31');

INSERT INTO `student_work` (`id`, `student_id`, `class_id`, `course_id`, `title`, `work_type`, `file_url`, `description`, `teacher_comment`, `score`, `is_public`, `submit_time`) VALUES
(1, 1, 1, 1, '学生成绩统计小工具',   1, 'https://gitee.com/demo/score-tool',      '读取 CSV 成绩文件并输出平均分与排名。', '结构清晰，建议增加异常提示与参数校验。', 94.5, 1, '2026-06-25 20:30:00'),
(2, 4, 1, 1, '个人博客静态页面',     1, 'https://gitee.com/demo/my-blog',         '手写 HTML/CSS 实现响应式个人博客。',   '布局还原度高，注意移动端断点细节。',     92.0, 1, '2026-06-26 21:10:00'),
(3, 2, 1, 1, '猜数字游戏',           1, 'https://gitee.com/demo/guess-number',    '控制台猜数字小游戏。',                 '交互设计有趣，代码可再拆分函数复用。',   88.0, 1, '2026-06-27 19:05:00'),
(4, 5, 2, 2, '二分查找可视化演示',   1, 'https://gitee.com/demo/binsearch-demo',  '用动画演示二分查找的过程。',           '可视化效果好，建议补充时间复杂度说明。', 90.5, 0, '2026-07-02 18:40:00');

/* ---------------------------------------------------------------------
   8. 课件资源
   --------------------------------------------------------------------- */
INSERT INTO `courseware` (`id`, `course_id`, `category`, `title`, `file_url`, `file_type`, `file_size`, `upload_admin_id`, `download_count`, `status`) VALUES
(1, 1, '课件讲义', 'Python 基础语法课件（第 1-3 章）', '/uploads/courseware/python-basic-01.pdf', 'pdf',  2411724, 2, 86, 1),
(2, 1, '课件讲义', 'Python 面向对象讲义',              '/uploads/courseware/python-oop.pptx',     'pptx', 5242880, 2, 54, 1),
(3, 2, '练习题库', '算法竞赛入门题单',                 '/uploads/courseware/algorithm-list.pdf',  'pdf',  1048576, 1, 73, 1),
(4, 3, '源码素材', '前端实战案例源码',                 '/uploads/courseware/frontend-demo.zip',   'zip',  8388608, 2, 41, 1),
(5, 1, '复习资料', 'Python 期末复习提纲',              '/uploads/courseware/python-review.pdf',   'pdf',   880640, 3, 92, 1),
(6, 2, '练习题库', '蓝桥杯历年真题解析',               '/uploads/courseware/lanqiao-past.pdf',    'pdf',  3565158, 3, 128, 1),
(7, NULL, '源码素材', '学生作品展示模板',              '/uploads/courseware/work-template.zip',   'zip',  1258291, 1, 19, 1),
(8, 2, '课堂录屏', '课堂录屏：递归与分治',             '/uploads/courseware/recursion.mp4',       'mp4', 195035136, 3, 37, 1);

/* ---------------------------------------------------------------------
   9. 教学评价
   --------------------------------------------------------------------- */
INSERT INTO `evaluation` (`id`, `eval_type`, `teacher_id`, `student_id`, `course_id`, `class_id`, `score`, `content`, `eval_date`) VALUES
(1, 1, 1, 1, 1, 1, 9.5, '老师讲解细致，代码示例很多，课后答疑也很及时。', '2026-06-20'),
(2, 1, 2, 4, 2, 2, 9.0, '竞赛训练安排合理，模拟赛复盘收获很大。',           '2026-06-21'),
(3, 2, 1, NULL, 1, NULL, 9.2, '教学督导听课评价：课堂节奏清晰，重难点突出。', '2026-05-18');

/* ---------------------------------------------------------------------
   10. 成绩
   --------------------------------------------------------------------- */
INSERT INTO `score` (`id`, `student_id`, `course_id`, `class_id`, `exam_type`, `score`, `full_score`, `exam_date`, `teacher_id`, `remark`) VALUES
(1,  1, 1, 1, 1, 92.0, 100.0, '2026-04-20', 1, '阶段一测验'),
(2,  2, 1, 1, 1, 88.5, 100.0, '2026-04-20', 1, NULL),
(3,  3, 1, 1, 1, 76.0, 100.0, '2026-04-20', 1, NULL),
(4,  4, 1, 1, 1, 95.0, 100.0, '2026-04-20', 1, NULL),
(5,  1, 1, 1, 3, 89.0, 100.0, '2026-06-28', 1, '期末考核'),
(6,  2, 1, 1, 3, 91.5, 100.0, '2026-06-28', 1, NULL),
(7,  3, 1, 1, 3, 80.5, 100.0, '2026-06-28', 1, NULL),
(8,  4, 1, 1, 3, 93.5, 100.0, '2026-06-28', 1, NULL),
(9,  5, 2, 2, 2, 85.0, 100.0, '2026-05-30', 2, '期中模拟赛'),
(10, 6, 2, 2, 2, 90.5, 100.0, '2026-05-30', 2, NULL),
(11, 7, 1, 1, 1, 82.0, 100.0, '2026-04-20', 1, '阶段一测验'),
(12, 8, 2, 2, 2, 88.0, 100.0, '2026-05-30', 2, '期中模拟赛');

SET FOREIGN_KEY_CHECKS = 1;

/* ---------------------------------------------------------------------
   初始化自检
   --------------------------------------------------------------------- */
-- SELECT COUNT(*) AS role_count       FROM sys_role;              -- 期望 4
-- SELECT COUNT(*) AS permission_count FROM sys_permission;        -- 期望 55
-- SELECT COUNT(*) AS news_count       FROM news;                  -- 期望 4
-- SELECT SUM(IF(permission_code LIKE 'system:permission%', 1, 0)) FROM sys_role_permission WHERE role_id = 2;  -- 期望 0
