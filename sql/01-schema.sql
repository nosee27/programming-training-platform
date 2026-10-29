/* =====================================================================
   编程培训平台管理平台（江京教育）
   01-schema.sql —— 数据库表结构，共 21 张表
   DBMS  : MySQL 8.0
   字符集 : utf8mb4 / utf8mb4_general_ci
   引擎   : InnoDB（支持事务与外键）
   执行   : mysql -u root -p < sql/01-schema.sql

   ⚠️ 本脚本包含 DROP TABLE IF EXISTS，会清空同名表的既有数据。
      仅用于课程作业首次建库或重建，请勿在有正式数据的环境执行。
   ⚠️ 全库禁止出现「奖学金」相关表、字段、注释与数据。
   ===================================================================== */

CREATE DATABASE IF NOT EXISTS `program_training_platform`
    DEFAULT CHARACTER SET utf8mb4
    DEFAULT COLLATE utf8mb4_general_ci;

USE `program_training_platform`;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

/* =====================================================================
   一、系统管理域（5 张表）
   ===================================================================== */

-- 1.1 角色表
DROP TABLE IF EXISTS `sys_role`;
CREATE TABLE `sys_role` (
    `id`          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT       COMMENT '主键',
    `role_name`   VARCHAR(50)     NOT NULL                      COMMENT '角色名称',
    `role_code`   VARCHAR(50)     NOT NULL                      COMMENT '角色编码：SUPER_ADMIN/EDU_ADMIN/TEACHER/STUDENT',
    `description` VARCHAR(255)             DEFAULT NULL         COMMENT '角色描述',
    `sort_order`  INT             NOT NULL DEFAULT 0            COMMENT '显示排序',
    `status`      TINYINT         NOT NULL DEFAULT 1            COMMENT '状态：1启用 0停用',
    `create_time` DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_role_code` (`role_code`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '角色表';

-- 1.2 权限表（目录 / 菜单 / 按钮，parent_id 自关联成树，0 为顶级）
DROP TABLE IF EXISTS `sys_permission`;
CREATE TABLE `sys_permission` (
    `id`              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT   COMMENT '主键',
    `parent_id`       BIGINT UNSIGNED NOT NULL DEFAULT 0        COMMENT '父级权限ID，0表示顶级',
    `permission_name` VARCHAR(50)     NOT NULL                  COMMENT '权限名称（菜单名/按钮名）',
    `permission_code` VARCHAR(100)    NOT NULL                  COMMENT '权限编码，如 system:user:list',
    `type`            TINYINT         NOT NULL DEFAULT 2        COMMENT '类型：1目录 2菜单 3按钮',
    `path`            VARCHAR(200)             DEFAULT NULL     COMMENT '前端页面路径，如 pages/system/user.html',
    `component`       VARCHAR(200)             DEFAULT NULL     COMMENT '页面组件标识（预留）',
    `icon`            VARCHAR(50)              DEFAULT NULL     COMMENT '菜单图标标识',
    `sort_order`      INT             NOT NULL DEFAULT 0        COMMENT '显示排序',
    `status`          TINYINT         NOT NULL DEFAULT 1        COMMENT '状态：1启用 0停用',
    `create_time`     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time`     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_permission_code` (`permission_code`),
    KEY `idx_permission_parent` (`parent_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '权限表';

-- 1.3 管理员表（超管 / 教务 / 教师账号 / 学生账号）
DROP TABLE IF EXISTS `sys_admin`;
CREATE TABLE `sys_admin` (
    `id`              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT   COMMENT '主键',
    `username`        VARCHAR(50)     NOT NULL                  COMMENT '登录账号',
    `password`        VARCHAR(100)    NOT NULL                  COMMENT '密码（bcrypt 加密，一键登录默认不校验）',
    `real_name`       VARCHAR(50)     NOT NULL                  COMMENT '姓名/昵称',
    `avatar`          VARCHAR(255)             DEFAULT NULL     COMMENT '头像地址',
    `phone`           VARCHAR(20)              DEFAULT NULL     COMMENT '手机号',
    `email`           VARCHAR(100)             DEFAULT NULL     COMMENT '邮箱',
    `gender`          TINYINT                  DEFAULT 0        COMMENT '性别：1男 2女 0未知',
    `member_level`    VARCHAR(20)              DEFAULT NULL     COMMENT '会员等级',
    `expire_date`     DATE                     DEFAULT NULL     COMMENT '会员到期时间',
    `status`          TINYINT         NOT NULL DEFAULT 1        COMMENT '状态：1启用 0禁用',
    `last_login_time` DATETIME                 DEFAULT NULL     COMMENT '最后登录时间',
    `last_login_ip`   VARCHAR(50)              DEFAULT NULL     COMMENT '最后登录IP',
    `remark`          VARCHAR(255)             DEFAULT NULL     COMMENT '备注',
    `create_time`     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time`     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted`         TINYINT         NOT NULL DEFAULT 0        COMMENT '逻辑删除：0正常 1已删除',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_admin_username` (`username`),
    KEY `idx_admin_status` (`status`),
    KEY `idx_admin_deleted` (`deleted`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '管理员表';

-- 1.4 管理员-角色关联表
DROP TABLE IF EXISTS `sys_admin_role`;
CREATE TABLE `sys_admin_role` (
    `id`          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT       COMMENT '主键',
    `admin_id`    BIGINT UNSIGNED NOT NULL                      COMMENT '管理员ID',
    `role_id`     BIGINT UNSIGNED NOT NULL                      COMMENT '角色ID',
    `create_time` DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_admin_role` (`admin_id`, `role_id`),
    KEY `idx_ar_role` (`role_id`),
    CONSTRAINT `fk_admin_role_admin` FOREIGN KEY (`admin_id`) REFERENCES `sys_admin` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_admin_role_role`  FOREIGN KEY (`role_id`)  REFERENCES `sys_role`  (`id`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '管理员-角色关联表';

-- 1.5 角色-权限关联表
DROP TABLE IF EXISTS `sys_role_permission`;
CREATE TABLE `sys_role_permission` (
    `id`            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT     COMMENT '主键',
    `role_id`       BIGINT UNSIGNED NOT NULL                    COMMENT '角色ID',
    `permission_id` BIGINT UNSIGNED NOT NULL                    COMMENT '权限ID',
    `create_time`   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_role_permission` (`role_id`, `permission_id`),
    KEY `idx_rp_permission` (`permission_id`),
    CONSTRAINT `fk_rp_role`       FOREIGN KEY (`role_id`)       REFERENCES `sys_role`       (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_rp_permission` FOREIGN KEY (`permission_id`) REFERENCES `sys_permission` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '角色-权限关联表';

/* =====================================================================
   二、教学资源域（6 张表）
   ===================================================================== */

-- 2.1 课程表
DROP TABLE IF EXISTS `course`;
CREATE TABLE `course` (
    `id`           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT      COMMENT '主键',
    `course_code`  VARCHAR(30)     NOT NULL                     COMMENT '课程编号',
    `course_name`  VARCHAR(100)    NOT NULL                     COMMENT '课程名称',
    `category`     VARCHAR(50)              DEFAULT NULL        COMMENT '课程分类：Python/Java/算法竞赛/前端',
    `credit`       DECIMAL(3, 1)   NOT NULL DEFAULT 0.0         COMMENT '学分',
    `total_hours`  INT             NOT NULL DEFAULT 0           COMMENT '总课时',
    `price`        DECIMAL(10, 2)  NOT NULL DEFAULT 0.00        COMMENT '课程价格（元）',
    `cover_img`    VARCHAR(255)             DEFAULT NULL        COMMENT '封面图地址',
    `description`  TEXT                     DEFAULT NULL        COMMENT '课程简介',
    `status`       TINYINT         NOT NULL DEFAULT 1           COMMENT '状态：1上架 0下架',
    `create_time`  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time`  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted`      TINYINT         NOT NULL DEFAULT 0           COMMENT '逻辑删除：0正常 1已删除',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_course_code` (`course_code`),
    KEY `idx_course_name` (`course_name`),
    KEY `idx_course_category` (`category`),
    KEY `idx_course_status` (`status`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '课程表';

-- 2.2 课程大纲表（章 / 节树形结构，0 为章）
DROP TABLE IF EXISTS `course_chapter`;
CREATE TABLE `course_chapter` (
    `id`           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT      COMMENT '主键',
    `course_id`    BIGINT UNSIGNED NOT NULL                     COMMENT '课程ID',
    `parent_id`    BIGINT UNSIGNED NOT NULL DEFAULT 0           COMMENT '父章节ID，0表示章',
    `chapter_name` VARCHAR(100)    NOT NULL                     COMMENT '章节名称',
    `hours`        INT             NOT NULL DEFAULT 0           COMMENT '课时数',
    `sort_order`   INT             NOT NULL DEFAULT 0           COMMENT '排序',
    `content`      TEXT                     DEFAULT NULL        COMMENT '知识点说明',
    `create_time`  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time`  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_chapter_course` (`course_id`),
    KEY `idx_chapter_parent` (`parent_id`),
    CONSTRAINT `fk_chapter_course` FOREIGN KEY (`course_id`) REFERENCES `course` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '课程大纲表';

-- 2.3 教师表
DROP TABLE IF EXISTS `teacher`;
CREATE TABLE `teacher` (
    `id`              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT   COMMENT '主键',
    `teacher_no`      VARCHAR(30)     NOT NULL                  COMMENT '教师工号',
    `name`            VARCHAR(50)     NOT NULL                  COMMENT '姓名',
    `gender`          TINYINT         NOT NULL DEFAULT 1        COMMENT '性别：1男 2女',
    `phone`           VARCHAR(20)              DEFAULT NULL     COMMENT '联系电话',
    `email`           VARCHAR(100)             DEFAULT NULL     COMMENT '邮箱',
    `avatar`          VARCHAR(255)             DEFAULT NULL     COMMENT '头像',
    `title`           VARCHAR(30)              DEFAULT NULL     COMMENT '职称，如 高级讲师',
    `major_direction` VARCHAR(100)             DEFAULT NULL     COMMENT '擅长方向，如 Python/算法竞赛',
    `education`       VARCHAR(30)              DEFAULT NULL     COMMENT '学历',
    `entry_date`      DATE                     DEFAULT NULL     COMMENT '入职日期',
    `status`          TINYINT         NOT NULL DEFAULT 1        COMMENT '状态：1在职 0离职',
    `intro`           TEXT                     DEFAULT NULL     COMMENT '教师简介',
    `create_time`     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time`     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted`         TINYINT         NOT NULL DEFAULT 0        COMMENT '逻辑删除：0正常 1已删除',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_teacher_no` (`teacher_no`),
    KEY `idx_teacher_name` (`name`),
    KEY `idx_teacher_status` (`status`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '教师表';

-- 2.4 班级表（clazz，避开 class 保留字）
DROP TABLE IF EXISTS `clazz`;
CREATE TABLE `clazz` (
    `id`              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT   COMMENT '主键',
    `class_code`      VARCHAR(30)     NOT NULL                  COMMENT '班级编号',
    `class_name`      VARCHAR(100)    NOT NULL                  COMMENT '班级名称',
    `course_id`       BIGINT UNSIGNED NOT NULL                  COMMENT '所属课程ID',
    `head_teacher_id` BIGINT UNSIGNED          DEFAULT NULL     COMMENT '班主任ID',
    `classroom`       VARCHAR(50)              DEFAULT NULL     COMMENT '教室',
    `start_date`      DATE                     DEFAULT NULL     COMMENT '开班日期',
    `end_date`        DATE                     DEFAULT NULL     COMMENT '结课日期',
    `capacity`        INT             NOT NULL DEFAULT 30       COMMENT '计划招生人数',
    `student_count`   INT             NOT NULL DEFAULT 0        COMMENT '在读人数（由学生表统计维护）',
    `status`          TINYINT         NOT NULL DEFAULT 0        COMMENT '状态：0未开班 1在读 2已结业',
    `remark`          VARCHAR(255)             DEFAULT NULL     COMMENT '备注',
    `create_time`     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time`     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted`         TINYINT         NOT NULL DEFAULT 0        COMMENT '逻辑删除：0正常 1已删除',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_class_code` (`class_code`),
    KEY `idx_class_name` (`class_name`),
    KEY `idx_class_course` (`course_id`),
    KEY `idx_class_head_teacher` (`head_teacher_id`),
    KEY `idx_class_status` (`status`),
    CONSTRAINT `fk_class_course`       FOREIGN KEY (`course_id`)       REFERENCES `course`  (`id`),
    CONSTRAINT `fk_class_head_teacher` FOREIGN KEY (`head_teacher_id`) REFERENCES `teacher` (`id`) ON DELETE SET NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '班级表';

-- 2.5 教师授课安排表
DROP TABLE IF EXISTS `teacher_course`;
CREATE TABLE `teacher_course` (
    `id`          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT       COMMENT '主键',
    `teacher_id`  BIGINT UNSIGNED NOT NULL                      COMMENT '教师ID',
    `course_id`   BIGINT UNSIGNED NOT NULL                      COMMENT '课程ID',
    `class_id`    BIGINT UNSIGNED          DEFAULT NULL         COMMENT '班级ID',
    `term`        VARCHAR(20)              DEFAULT NULL         COMMENT '学期，如 2026春',
    `total_hours` INT             NOT NULL DEFAULT 0            COMMENT '承担课时',
    `role_type`   TINYINT         NOT NULL DEFAULT 1            COMMENT '角色：1主讲 2辅导 3班主任',
    `create_time` DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_tc_teacher` (`teacher_id`),
    KEY `idx_tc_course` (`course_id`),
    KEY `idx_tc_class` (`class_id`),
    CONSTRAINT `fk_tc_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `teacher` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_tc_course`  FOREIGN KEY (`course_id`)  REFERENCES `course`  (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_tc_class`   FOREIGN KEY (`class_id`)   REFERENCES `clazz`   (`id`) ON DELETE SET NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '教师授课安排表';

-- 2.6 课件资源表
DROP TABLE IF EXISTS `courseware`;
CREATE TABLE `courseware` (
    `id`              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT   COMMENT '主键',
    `course_id`       BIGINT UNSIGNED          DEFAULT NULL     COMMENT '关联课程ID',
    `category`        VARCHAR(50)              DEFAULT NULL     COMMENT '课件分类：课件讲义/练习题库/源码素材/复习资料/课堂录屏',
    `title`           VARCHAR(100)    NOT NULL                  COMMENT '课件名称',
    `file_url`        VARCHAR(255)    NOT NULL                  COMMENT '文件地址',
    `file_type`       VARCHAR(20)              DEFAULT NULL     COMMENT '文件类型：pdf/pptx/zip/mp4',
    `file_size`       BIGINT          NOT NULL DEFAULT 0        COMMENT '文件大小（字节）',
    `upload_admin_id` BIGINT UNSIGNED          DEFAULT NULL     COMMENT '上传人ID（管理员表）',
    `download_count`  INT             NOT NULL DEFAULT 0        COMMENT '下载次数',
    `status`          TINYINT         NOT NULL DEFAULT 1        COMMENT '状态：1可用 0停用',
    `create_time`     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time`     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted`         TINYINT         NOT NULL DEFAULT 0        COMMENT '逻辑删除：0正常 1已删除',
    PRIMARY KEY (`id`),
    KEY `idx_cw_course` (`course_id`),
    KEY `idx_cw_category` (`category`),
    KEY `idx_cw_title` (`title`),
    CONSTRAINT `fk_cw_course`  FOREIGN KEY (`course_id`)       REFERENCES `course`    (`id`) ON DELETE SET NULL,
    CONSTRAINT `fk_cw_admin`   FOREIGN KEY (`upload_admin_id`) REFERENCES `sys_admin` (`id`) ON DELETE SET NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '课件资源表';

/* =====================================================================
   三、学生域（5 张表）
   ===================================================================== */

-- 3.1 学生表
DROP TABLE IF EXISTS `student`;
CREATE TABLE `student` (
    `id`             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT    COMMENT '主键',
    `student_no`     VARCHAR(30)     NOT NULL                   COMMENT '学号',
    `name`           VARCHAR(50)     NOT NULL                   COMMENT '姓名',
    `gender`         TINYINT         NOT NULL DEFAULT 1         COMMENT '性别：1男 2女',
    `birth_date`     DATE                     DEFAULT NULL      COMMENT '出生日期',
    `id_card`        VARCHAR(18)              DEFAULT NULL      COMMENT '身份证号',
    `phone`          VARCHAR(20)              DEFAULT NULL      COMMENT '联系电话',
    `email`          VARCHAR(100)             DEFAULT NULL      COMMENT '邮箱',
    `avatar`         VARCHAR(255)             DEFAULT NULL      COMMENT '头像',
    `class_id`       BIGINT UNSIGNED          DEFAULT NULL      COMMENT '所属班级ID（未分班为空）',
    `guardian_name`  VARCHAR(50)              DEFAULT NULL      COMMENT '监护人姓名',
    `guardian_phone` VARCHAR(20)              DEFAULT NULL      COMMENT '监护人电话',
    `address`        VARCHAR(255)             DEFAULT NULL      COMMENT '家庭住址',
    `enroll_date`    DATE                     DEFAULT NULL      COMMENT '报名日期',
    `source`         VARCHAR(50)              DEFAULT NULL      COMMENT '报名来源，如 线上推广',
    `status`         TINYINT         NOT NULL DEFAULT 1         COMMENT '状态：1在读 2已结业 3休学 4退学',
    `create_time`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted`        TINYINT         NOT NULL DEFAULT 0         COMMENT '逻辑删除：0正常 1已删除',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_student_no` (`student_no`),
    KEY `idx_student_name` (`name`),
    KEY `idx_student_class` (`class_id`),
    KEY `idx_student_status` (`status`),
    CONSTRAINT `fk_student_class` FOREIGN KEY (`class_id`) REFERENCES `clazz` (`id`) ON DELETE SET NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '学生表';

-- 3.2 学生考勤表（一个学生一门课一天一条）
DROP TABLE IF EXISTS `attendance`;
CREATE TABLE `attendance` (
    `id`          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT       COMMENT '主键',
    `student_id`  BIGINT UNSIGNED NOT NULL                      COMMENT '学生ID',
    `class_id`    BIGINT UNSIGNED          DEFAULT NULL         COMMENT '班级ID',
    `course_id`   BIGINT UNSIGNED NOT NULL                      COMMENT '课程ID',
    `teacher_id`  BIGINT UNSIGNED          DEFAULT NULL         COMMENT '记录教师ID',
    `attend_date` DATE            NOT NULL                      COMMENT '考勤日期',
    `attend_type` TINYINT         NOT NULL DEFAULT 1            COMMENT '类型：1正常 2迟到 3早退 4请假 5缺勤',
    `check_time`  TIME                     DEFAULT NULL         COMMENT '打卡时间',
    `remark`      VARCHAR(255)             DEFAULT NULL         COMMENT '备注（请假原因等）',
    `create_time` DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_attendance` (`student_id`, `course_id`, `attend_date`),
    KEY `idx_att_date` (`attend_date`),
    KEY `idx_att_type` (`attend_type`),
    KEY `idx_att_class` (`class_id`),
    CONSTRAINT `fk_att_student` FOREIGN KEY (`student_id`) REFERENCES `student` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_att_course`  FOREIGN KEY (`course_id`)  REFERENCES `course`  (`id`),
    CONSTRAINT `fk_att_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `teacher` (`id`) ON DELETE SET NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '学生考勤表';

-- 3.3 缴费管理表
DROP TABLE IF EXISTS `payment`;
CREATE TABLE `payment` (
    `id`              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT   COMMENT '主键',
    `student_id`      BIGINT UNSIGNED NOT NULL                  COMMENT '学生ID',
    `order_no`        VARCHAR(40)     NOT NULL                  COMMENT '缴费单号',
    `course_id`       BIGINT UNSIGNED          DEFAULT NULL     COMMENT '课程ID',
    `class_id`        BIGINT UNSIGNED          DEFAULT NULL     COMMENT '班级ID',
    `pay_type`        TINYINT         NOT NULL DEFAULT 1        COMMENT '类型：1新报名 2续费 3补费 4退费',
    `should_amount`   DECIMAL(10, 2)  NOT NULL DEFAULT 0.00     COMMENT '应收金额',
    `discount_amount` DECIMAL(10, 2)  NOT NULL DEFAULT 0.00     COMMENT '优惠金额',
    `paid_amount`     DECIMAL(10, 2)  NOT NULL DEFAULT 0.00     COMMENT '实收金额',
    `arrears_amount`  DECIMAL(10, 2)  NOT NULL DEFAULT 0.00     COMMENT '欠费金额 = 应收 - 优惠 - 实收',
    `pay_status`      TINYINT         NOT NULL DEFAULT 0        COMMENT '状态：0未缴 1部分缴纳 2已缴清 3已退费',
    `pay_method`      TINYINT                  DEFAULT NULL     COMMENT '方式：1微信 2支付宝 3现金 4银行转账',
    `pay_time`        DATETIME                 DEFAULT NULL     COMMENT '缴费时间',
    `operator_id`     BIGINT UNSIGNED          DEFAULT NULL     COMMENT '经办人ID',
    `remark`          VARCHAR(255)             DEFAULT NULL     COMMENT '备注',
    `create_time`     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time`     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted`         TINYINT         NOT NULL DEFAULT 0        COMMENT '逻辑删除：0正常 1已删除',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_payment_order_no` (`order_no`),
    KEY `idx_pay_student` (`student_id`),
    KEY `idx_pay_course` (`course_id`),
    KEY `idx_pay_status` (`pay_status`),
    CONSTRAINT `fk_pay_student`  FOREIGN KEY (`student_id`)  REFERENCES `student`   (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_pay_course`   FOREIGN KEY (`course_id`)   REFERENCES `course`    (`id`) ON DELETE SET NULL,
    CONSTRAINT `fk_pay_admin`    FOREIGN KEY (`operator_id`) REFERENCES `sys_admin` (`id`) ON DELETE SET NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '缴费管理表';

-- 3.4 学生学习档案表
DROP TABLE IF EXISTS `study_archive`;
CREATE TABLE `study_archive` (
    `id`              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT   COMMENT '主键',
    `student_id`      BIGINT UNSIGNED NOT NULL                  COMMENT '学生ID',
    `class_id`        BIGINT UNSIGNED          DEFAULT NULL     COMMENT '班级ID',
    `course_id`       BIGINT UNSIGNED NOT NULL                  COMMENT '课程ID',
    `stage_no`        INT             NOT NULL DEFAULT 1        COMMENT '阶段序号',
    `stage_name`      VARCHAR(50)     NOT NULL                  COMMENT '阶段名称，如 Python基础',
    `study_hours`     DECIMAL(6, 1)   NOT NULL DEFAULT 0.0      COMMENT '该阶段累计课时',
    `assess_score`    DECIMAL(5, 1)            DEFAULT NULL     COMMENT '阶段测评得分',
    `ability_tags`    VARCHAR(255)             DEFAULT NULL     COMMENT '能力标签，如 循环/函数/调试',
    `teacher_comment` VARCHAR(500)             DEFAULT NULL     COMMENT '教师阶段评语',
    `archive_date`    DATE                     DEFAULT NULL     COMMENT '归档日期',
    `create_time`     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time`     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted`         TINYINT         NOT NULL DEFAULT 0        COMMENT '逻辑删除：0正常 1已删除',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_archive` (`student_id`, `course_id`, `stage_no`),
    KEY `idx_archive_class` (`class_id`),
    CONSTRAINT `fk_archive_student` FOREIGN KEY (`student_id`) REFERENCES `student` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_archive_course`  FOREIGN KEY (`course_id`)  REFERENCES `course`  (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '学生学习档案表';

-- 3.5 学生作品表
DROP TABLE IF EXISTS `student_work`;
CREATE TABLE `student_work` (
    `id`              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT   COMMENT '主键',
    `student_id`      BIGINT UNSIGNED NOT NULL                  COMMENT '学生ID',
    `class_id`        BIGINT UNSIGNED          DEFAULT NULL     COMMENT '班级ID',
    `course_id`       BIGINT UNSIGNED          DEFAULT NULL     COMMENT '课程ID',
    `title`           VARCHAR(100)    NOT NULL                  COMMENT '作品名称',
    `work_type`       TINYINT         NOT NULL DEFAULT 1        COMMENT '类型：1代码项目 2设计稿 3文档 4视频',
    `cover_img`       VARCHAR(255)             DEFAULT NULL     COMMENT '封面图',
    `file_url`        VARCHAR(255)             DEFAULT NULL     COMMENT '作品文件/仓库地址',
    `description`     TEXT                     DEFAULT NULL     COMMENT '作品说明',
    `teacher_comment` VARCHAR(500)             DEFAULT NULL     COMMENT '教师点评',
    `score`           DECIMAL(5, 1)            DEFAULT NULL     COMMENT '作品评分',
    `is_public`       TINYINT         NOT NULL DEFAULT 1        COMMENT '是否公开展示：1公开 0仅内部',
    `submit_time`     DATETIME                 DEFAULT NULL     COMMENT '提交时间',
    `create_time`     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time`     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted`         TINYINT         NOT NULL DEFAULT 0        COMMENT '逻辑删除：0正常 1已删除',
    PRIMARY KEY (`id`),
    KEY `idx_work_student` (`student_id`),
    KEY `idx_work_class` (`class_id`),
    KEY `idx_work_type` (`work_type`),
    CONSTRAINT `fk_work_student` FOREIGN KEY (`student_id`) REFERENCES `student` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_work_course`  FOREIGN KEY (`course_id`)  REFERENCES `course`  (`id`) ON DELETE SET NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '学生作品表';

/* =====================================================================
   四、教学运行域（3 张表）
   ===================================================================== */

-- 4.1 课表
DROP TABLE IF EXISTS `schedule`;
CREATE TABLE `schedule` (
    `id`           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT      COMMENT '主键',
    `class_id`     BIGINT UNSIGNED NOT NULL                     COMMENT '班级ID',
    `course_id`    BIGINT UNSIGNED NOT NULL                     COMMENT '课程ID',
    `teacher_id`   BIGINT UNSIGNED NOT NULL                     COMMENT '授课教师ID',
    `classroom`    VARCHAR(50)              DEFAULT NULL        COMMENT '教室',
    `weekday`      TINYINT         NOT NULL DEFAULT 1           COMMENT '星期：1~7',
    `lesson_start` TIME            NOT NULL                     COMMENT '上课时间',
    `lesson_end`   TIME            NOT NULL                     COMMENT '下课时间',
    `term`         VARCHAR(20)              DEFAULT NULL        COMMENT '学期，如 2026春',
    `start_date`   DATE                     DEFAULT NULL        COMMENT '生效日期',
    `end_date`     DATE                     DEFAULT NULL        COMMENT '失效日期',
    `remark`       VARCHAR(255)             DEFAULT NULL        COMMENT '备注',
    `create_time`  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time`  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted`      TINYINT         NOT NULL DEFAULT 0           COMMENT '逻辑删除：0正常 1已删除',
    PRIMARY KEY (`id`),
    KEY `idx_sch_class` (`class_id`),
    KEY `idx_sch_course` (`course_id`),
    KEY `idx_sch_teacher` (`teacher_id`),
    KEY `idx_sch_weekday` (`weekday`),
    CONSTRAINT `fk_sch_class`   FOREIGN KEY (`class_id`)   REFERENCES `clazz`   (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_sch_course`  FOREIGN KEY (`course_id`)  REFERENCES `course`  (`id`),
    CONSTRAINT `fk_sch_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `teacher` (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '课表';

-- 4.2 评价表
DROP TABLE IF EXISTS `evaluation`;
CREATE TABLE `evaluation` (
    `id`          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT       COMMENT '主键',
    `eval_type`   TINYINT         NOT NULL DEFAULT 1            COMMENT '类型：1学生评教 2督导评教',
    `teacher_id`  BIGINT UNSIGNED NOT NULL                      COMMENT '被评教师ID',
    `student_id`  BIGINT UNSIGNED          DEFAULT NULL         COMMENT '评价学生ID（督导评教为空）',
    `course_id`   BIGINT UNSIGNED          DEFAULT NULL         COMMENT '课程ID',
    `class_id`    BIGINT UNSIGNED          DEFAULT NULL         COMMENT '班级ID',
    `score`       DECIMAL(3, 1)   NOT NULL DEFAULT 0.0          COMMENT '评分（满分10分）',
    `content`     TEXT                     DEFAULT NULL         COMMENT '评价内容',
    `eval_date`   DATE                     DEFAULT NULL         COMMENT '评价日期',
    `create_time` DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_eval_teacher` (`teacher_id`),
    KEY `idx_eval_student` (`student_id`),
    KEY `idx_eval_type` (`eval_type`),
    KEY `idx_eval_date` (`eval_date`),
    CONSTRAINT `fk_eval_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `teacher` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_eval_student` FOREIGN KEY (`student_id`) REFERENCES `student` (`id`) ON DELETE SET NULL,
    CONSTRAINT `fk_eval_course`  FOREIGN KEY (`course_id`)  REFERENCES `course`  (`id`) ON DELETE SET NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '评价表';

-- 4.3 成绩表（同一学生同一课程同类考试唯一）
DROP TABLE IF EXISTS `score`;
CREATE TABLE `score` (
    `id`          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT       COMMENT '主键',
    `student_id`  BIGINT UNSIGNED NOT NULL                      COMMENT '学生ID',
    `course_id`   BIGINT UNSIGNED NOT NULL                      COMMENT '课程ID',
    `class_id`    BIGINT UNSIGNED          DEFAULT NULL         COMMENT '班级ID',
    `exam_type`   TINYINT         NOT NULL DEFAULT 1            COMMENT '类型：1阶段测验 2期中 3期末 4作品评分 5综合',
    `score`       DECIMAL(5, 1)   NOT NULL DEFAULT 0.0          COMMENT '得分',
    `full_score`  DECIMAL(5, 1)   NOT NULL DEFAULT 100.0        COMMENT '满分（用于换算百分制）',
    `exam_date`   DATE                     DEFAULT NULL         COMMENT '考核日期',
    `teacher_id`  BIGINT UNSIGNED          DEFAULT NULL         COMMENT '录入教师ID',
    `remark`      VARCHAR(255)             DEFAULT NULL         COMMENT '备注',
    `create_time` DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted`     TINYINT         NOT NULL DEFAULT 0            COMMENT '逻辑删除：0正常 1已删除',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_score` (`student_id`, `course_id`, `exam_type`),
    KEY `idx_score_course` (`course_id`),
    KEY `idx_score_class` (`class_id`),
    KEY `idx_score_type` (`exam_type`),
    CONSTRAINT `fk_score_student` FOREIGN KEY (`student_id`) REFERENCES `student` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_score_course`  FOREIGN KEY (`course_id`)  REFERENCES `course`  (`id`),
    CONSTRAINT `fk_score_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `teacher` (`id`) ON DELETE SET NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '成绩表';

/* =====================================================================
   五、新闻域（2 张表）
   ===================================================================== */

-- 5.1 新闻分类表（仅三类：平台公告 / 行业资讯 / 赛事动态）
DROP TABLE IF EXISTS `news_category`;
CREATE TABLE `news_category` (
    `id`            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT     COMMENT '主键',
    `category_code` VARCHAR(30)     NOT NULL                    COMMENT '分类编码：notice/industry/match',
    `category_name` VARCHAR(50)     NOT NULL                    COMMENT '分类名称：平台公告/行业资讯/赛事动态',
    `sort_order`    INT             NOT NULL DEFAULT 0          COMMENT '排序',
    `status`        TINYINT         NOT NULL DEFAULT 1          COMMENT '状态：1启用 0停用',
    `create_time`   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_category_code` (`category_code`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '新闻分类表';

-- 5.2 新闻表
DROP TABLE IF EXISTS `news`;
CREATE TABLE `news` (
    `id`           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT      COMMENT '主键',
    `title`        VARCHAR(200)    NOT NULL                     COMMENT '新闻标题',
    `category_id`  BIGINT UNSIGNED NOT NULL                     COMMENT '分类ID',
    `summary`      VARCHAR(500)             DEFAULT NULL        COMMENT '摘要',
    `content`      LONGTEXT                 DEFAULT NULL        COMMENT '正文',
    `cover_img`    VARCHAR(255)             DEFAULT NULL        COMMENT '封面图',
    `author`       VARCHAR(50)              DEFAULT NULL        COMMENT '作者',
    `source`       VARCHAR(100)             DEFAULT NULL        COMMENT '来源',
    `is_top`       TINYINT         NOT NULL DEFAULT 0           COMMENT '置顶：1是 0否',
    `view_count`   INT             NOT NULL DEFAULT 0           COMMENT '浏览量',
    `status`       TINYINT         NOT NULL DEFAULT 1           COMMENT '状态：0草稿 1已发布 2已下线',
    `publish_time` DATETIME                 DEFAULT NULL        COMMENT '发布时间',
    `publisher_id` BIGINT UNSIGNED          DEFAULT NULL        COMMENT '发布人ID',
    `create_time`  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time`  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted`      TINYINT         NOT NULL DEFAULT 0           COMMENT '逻辑删除：0正常 1已删除',
    PRIMARY KEY (`id`),
    KEY `idx_news_category` (`category_id`),
    KEY `idx_news_title` (`title`),
    KEY `idx_news_status` (`status`),
    KEY `idx_news_top` (`is_top`),
    KEY `idx_news_publish_time` (`publish_time`),
    CONSTRAINT `fk_news_category`  FOREIGN KEY (`category_id`)  REFERENCES `news_category` (`id`),
    CONSTRAINT `fk_news_publisher` FOREIGN KEY (`publisher_id`) REFERENCES `sys_admin`     (`id`) ON DELETE SET NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '新闻表';

SET FOREIGN_KEY_CHECKS = 1;

/* =====================================================================
   建表完成自检 SQL（可单独执行核对）
   ===================================================================== */
-- SELECT COUNT(*) AS table_count FROM information_schema.tables
--   WHERE table_schema = 'program_training_platform';            -- 期望 21
-- SELECT COUNT(*) AS scholarship_hit FROM information_schema.columns
--   WHERE table_schema = 'program_training_platform' AND comment LIKE '%奖学金%';  -- 期望 0
