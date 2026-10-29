/**
 * 实体元数据（表名 / 字段白名单 / 关联查询 / 筛选条件）
 * ---------------------------------------------------------------------
 * 字段命名规则：数据库是 snake_case，对外（接口 / 前端）统一 camelCase。
 * 这里声明的列同时也是写入白名单，未声明的字段一律不允许写入。
 */

/** 等值筛选 */
const eq = (col) => (value) => [col + ' = ?', [value]];

const E = {
    /* ------------------------------ 系统管理 ------------------------------ */
    users: {
        table: 'sys_admin',
        alias: 'a',
        softDelete: true,
        select: [
            'a.id', 'a.username', 'a.real_name AS realName', 'a.avatar', 'a.phone', 'a.email', 'a.gender',
            'a.member_level AS memberLevel', 'a.expire_date AS expireDate', 'a.status',
            'a.last_login_time AS lastLoginTime', 'a.last_login_ip AS lastLoginIp', 'a.remark',
            'a.create_time AS createTime',
            '(SELECT GROUP_CONCAT(r.role_name) FROM sys_admin_role ar JOIN sys_role r ON r.id = ar.role_id WHERE ar.admin_id = a.id) AS roleNames',
            '(SELECT GROUP_CONCAT(r.id) FROM sys_admin_role ar JOIN sys_role r ON r.id = ar.role_id WHERE ar.admin_id = a.id) AS roleIds'
        ].join(', '),
        joins: '',
        search: ['a.username', 'a.real_name', 'a.phone', 'a.email'],
        filters: { status: eq('a.status') },
        order: 'a.id ASC',
        columns: {
            username: 'username', password: 'password', realName: 'real_name', avatar: 'avatar',
            phone: 'phone', email: 'email', gender: 'gender', memberLevel: 'member_level',
            expireDate: 'expire_date', status: 'status', remark: 'remark'
        }
    },

    roles: {
        table: 'sys_role',
        alias: 'r',
        softDelete: false,
        select: [
            'r.id', 'r.role_name AS roleName', 'r.role_code AS roleCode', 'r.description',
            'r.sort_order AS sortOrder', 'r.status', 'r.create_time AS createTime',
            '(SELECT COUNT(*) FROM sys_admin_role ar WHERE ar.role_id = r.id) AS userCount'
        ].join(', '),
        joins: '',
        search: ['r.role_name', 'r.role_code', 'r.description'],
        filters: { status: eq('r.status') },
        order: 'r.sort_order ASC, r.id ASC',
        columns: {
            roleName: 'role_name', roleCode: 'role_code', description: 'description',
            sortOrder: 'sort_order', status: 'status'
        }
    },

    permissions: {
        table: 'sys_permission',
        alias: 'p',
        softDelete: false,
        select: [
            'p.id', 'p.parent_id AS parentId', 'p.permission_name AS permissionName',
            'p.permission_code AS permissionCode', 'p.type', 'p.path', 'p.component', 'p.icon',
            'p.sort_order AS sortOrder', 'p.status', 'p.create_time AS createTime',
            "IFNULL((SELECT pp.permission_name FROM sys_permission pp WHERE pp.id = p.parent_id), '-') AS parentName"
        ].join(', '),
        joins: '',
        search: ['p.permission_name', 'p.permission_code'],
        filters: { type: eq('p.type'), status: eq('p.status') },
        order: 'p.id ASC',
        columns: {
            parentId: 'parent_id', permissionName: 'permission_name', permissionCode: 'permission_code',
            type: 'type', path: 'path', component: 'component', icon: 'icon',
            sortOrder: 'sort_order', status: 'status'
        }
    },

    /* -------------------------------- 教师 -------------------------------- */
    teachers: {
        table: 'teacher',
        alias: 't',
        softDelete: true,
        select: [
            't.id', 't.teacher_no AS teacherNo', 't.name', 't.gender', 't.phone', 't.email', 't.avatar',
            't.title', 't.major_direction AS majorDirection', 't.education', 't.entry_date AS entryDate',
            't.status', 't.intro', 't.create_time AS createTime',
            '(SELECT GROUP_CONCAT(c.class_name) FROM clazz c WHERE c.head_teacher_id = t.id AND c.deleted = 0) AS classNames'
        ].join(', '),
        joins: '',
        search: ['t.name', 't.teacher_no', 't.major_direction', 't.title'],
        filters: { status: eq('t.status'), id: eq('t.id') },
        order: 't.id ASC',
        columns: {
            teacherNo: 'teacher_no', name: 'name', gender: 'gender', phone: 'phone', email: 'email',
            avatar: 'avatar', title: 'title', majorDirection: 'major_direction', education: 'education',
            entryDate: 'entry_date', status: 'status', intro: 'intro'
        }
    },

    teacherCourses: {
        table: 'teacher_course',
        alias: 'tc',
        softDelete: false,
        select: [
            'tc.id', 'tc.teacher_id AS teacherId', 't.name AS teacherName',
            'tc.course_id AS courseId', 'co.course_name AS courseName',
            'tc.class_id AS classId', 'IFNULL(c.class_name, \'-\') AS className',
            'tc.term', 'tc.total_hours AS totalHours', 'tc.role_type AS roleType'
        ].join(', '),
        joins: 'LEFT JOIN teacher t ON t.id = tc.teacher_id LEFT JOIN course co ON co.id = tc.course_id LEFT JOIN clazz c ON c.id = tc.class_id',
        search: ['t.name', 'co.course_name', 'c.class_name'],
        filters: { roleType: eq('tc.role_type'), teacherId: eq('tc.teacher_id') },
        order: 'tc.id ASC',
        columns: {
            teacherId: 'teacher_id', courseId: 'course_id', classId: 'class_id',
            term: 'term', totalHours: 'total_hours', roleType: 'role_type'
        }
    },

    evaluations: {
        table: 'evaluation',
        alias: 'e',
        softDelete: false,
        select: [
            'e.id', 'e.eval_type AS evalType', 'e.teacher_id AS teacherId', 't.name AS teacherName',
            'e.student_id AS studentId', "IFNULL(s.name, '-') AS studentName",
            'e.course_id AS courseId', "IFNULL(co.course_name, '-') AS courseName",
            'e.class_id AS classId', 'e.score', 'e.content', 'e.eval_date AS evalDate'
        ].join(', '),
        joins: 'LEFT JOIN teacher t ON t.id = e.teacher_id LEFT JOIN student s ON s.id = e.student_id LEFT JOIN course co ON co.id = e.course_id',
        search: ['t.name', 's.name', 'co.course_name', 'e.content'],
        filters: { evalType: eq('e.eval_type'), teacherId: eq('e.teacher_id') },
        order: 'e.id DESC',
        columns: {
            evalType: 'eval_type', teacherId: 'teacher_id', studentId: 'student_id',
            courseId: 'course_id', classId: 'class_id', score: 'score', content: 'content', evalDate: 'eval_date'
        }
    },

    /* -------------------------------- 学生 -------------------------------- */
    students: {
        table: 'student',
        alias: 's',
        softDelete: true,
        select: [
            's.id', 's.student_no AS studentNo', 's.name', 's.gender', 's.birth_date AS birthDate',
            's.id_card AS idCard', 's.phone', 's.email', 's.avatar', 's.class_id AS classId',
            "IFNULL(c.class_name, '-') AS className", 's.guardian_name AS guardianName',
            's.guardian_phone AS guardianPhone', 's.address', 's.enroll_date AS enrollDate',
            's.source', 's.status', 's.create_time AS createTime'
        ].join(', '),
        joins: 'LEFT JOIN clazz c ON c.id = s.class_id',
        search: ['s.name', 's.student_no', 's.phone', 'c.class_name'],
        filters: {
            status: eq('s.status'),
            id: eq('s.id'),
            studentId: eq('s.id'),
            className: (v) => (v === '-' ? ['s.class_id IS NULL', []] : ['c.class_name = ?', [v]])
        },
        order: 's.id ASC',
        columns: {
            studentNo: 'student_no', name: 'name', gender: 'gender', birthDate: 'birth_date',
            idCard: 'id_card', phone: 'phone', email: 'email', avatar: 'avatar', classId: 'class_id',
            guardianName: 'guardian_name', guardianPhone: 'guardian_phone', address: 'address',
            enrollDate: 'enroll_date', source: 'source', status: 'status'
        }
    },

    attendances: {
        table: 'attendance',
        alias: 'at',
        softDelete: false,
        select: [
            'at.id', 'at.student_id AS studentId', 's.student_no AS studentNo', 's.name AS studentName',
            'at.class_id AS classId', "IFNULL(c.class_name, '-') AS className",
            'at.course_id AS courseId', 'co.course_name AS courseName', 'at.teacher_id AS teacherId',
            'at.attend_date AS attendDate', 'at.attend_type AS attendType',
            "IFNULL(TIME_FORMAT(at.check_time, '%H:%i'), '-') AS checkTime", 'at.remark'
        ].join(', '),
        joins: 'LEFT JOIN student s ON s.id = at.student_id LEFT JOIN clazz c ON c.id = at.class_id LEFT JOIN course co ON co.id = at.course_id',
        search: ['s.name', 's.student_no', 'c.class_name', 'co.course_name'],
        filters: {
            attendType: eq('at.attend_type'),
            attendDate: eq('at.attend_date'),
            studentId: eq('at.student_id'),
            teacherId: eq('at.teacher_id')
        },
        order: 'at.attend_date DESC, at.id DESC',
        columns: {
            studentId: 'student_id', classId: 'class_id', courseId: 'course_id', teacherId: 'teacher_id',
            attendDate: 'attend_date', attendType: 'attend_type', checkTime: 'check_time', remark: 'remark'
        }
    },

    payments: {
        table: 'payment',
        alias: 'p',
        softDelete: true,
        select: [
            'p.id', 'p.student_id AS studentId', 's.student_no AS studentNo', 's.name AS studentName',
            'p.order_no AS orderNo', 'p.course_id AS courseId', "IFNULL(co.course_name, '-') AS courseName",
            'p.class_id AS classId', 'p.pay_type AS payType', 'p.should_amount AS shouldAmount',
            'p.discount_amount AS discountAmount', 'p.paid_amount AS paidAmount',
            'p.arrears_amount AS arrearsAmount', 'p.pay_status AS payStatus', 'p.pay_method AS payMethod',
            "IFNULL(DATE_FORMAT(p.pay_time, '%Y-%m-%d %H:%i'), '-') AS payTime",
            'p.operator_id AS operatorId', "IFNULL(ad.real_name, '-') AS operatorName", 'p.remark'
        ].join(', '),
        joins: 'LEFT JOIN student s ON s.id = p.student_id LEFT JOIN course co ON co.id = p.course_id LEFT JOIN sys_admin ad ON ad.id = p.operator_id',
        search: ['s.name', 's.student_no', 'p.order_no', 'co.course_name'],
        filters: { payStatus: eq('p.pay_status'), payType: eq('p.pay_type'), studentId: eq('p.student_id') },
        order: 'p.id DESC',
        columns: {
            studentId: 'student_id', orderNo: 'order_no', courseId: 'course_id', classId: 'class_id',
            payType: 'pay_type', shouldAmount: 'should_amount', discountAmount: 'discount_amount',
            paidAmount: 'paid_amount', arrearsAmount: 'arrears_amount', payStatus: 'pay_status',
            payMethod: 'pay_method', payTime: 'pay_time', operatorId: 'operator_id', remark: 'remark'
        }
    },

    archives: {
        table: 'study_archive',
        alias: 'sa',
        softDelete: true,
        select: [
            'sa.id', 'sa.student_id AS studentId', 's.student_no AS studentNo', 's.name AS studentName',
            'sa.class_id AS classId', "IFNULL(c.class_name, '-') AS className",
            'sa.course_id AS courseId', 'co.course_name AS courseName',
            'sa.stage_no AS stageNo', 'sa.stage_name AS stageName', 'sa.study_hours AS studyHours',
            'sa.assess_score AS assessScore', 'sa.ability_tags AS abilityTags',
            'sa.teacher_comment AS teacherComment', 'sa.archive_date AS archiveDate'
        ].join(', '),
        joins: 'LEFT JOIN student s ON s.id = sa.student_id LEFT JOIN clazz c ON c.id = sa.class_id LEFT JOIN course co ON co.id = sa.course_id',
        search: ['s.name', 's.student_no', 'co.course_name', 'sa.stage_name'],
        filters: { studentId: eq('sa.student_id'), stageNo: eq('sa.stage_no') },
        order: 'sa.student_id ASC, sa.stage_no ASC',
        columns: {
            studentId: 'student_id', classId: 'class_id', courseId: 'course_id', stageNo: 'stage_no',
            stageName: 'stage_name', studyHours: 'study_hours', assessScore: 'assess_score',
            abilityTags: 'ability_tags', teacherComment: 'teacher_comment', archiveDate: 'archive_date'
        }
    },

    works: {
        table: 'student_work',
        alias: 'w',
        softDelete: true,
        select: [
            'w.id', 'w.student_id AS studentId', 's.student_no AS studentNo', 's.name AS studentName',
            'w.class_id AS classId', "IFNULL(c.class_name, '-') AS className",
            'w.course_id AS courseId', "IFNULL(co.course_name, '-') AS courseName",
            'w.title', 'w.work_type AS workType', 'w.cover_img AS coverImg', 'w.file_url AS fileUrl',
            'w.description', 'w.teacher_comment AS teacherComment', 'w.score', 'w.is_public AS isPublic',
            "DATE_FORMAT(w.submit_time, '%Y-%m-%d %H:%i') AS submitTime"
        ].join(', '),
        joins: 'LEFT JOIN student s ON s.id = w.student_id LEFT JOIN clazz c ON c.id = w.class_id LEFT JOIN course co ON co.id = w.course_id',
        search: ['s.name', 's.student_no', 'w.title', 'co.course_name'],
        filters: { workType: eq('w.work_type'), isPublic: eq('w.is_public'), studentId: eq('w.student_id') },
        order: 'w.id DESC',
        columns: {
            studentId: 'student_id', classId: 'class_id', courseId: 'course_id', title: 'title',
            workType: 'work_type', coverImg: 'cover_img', fileUrl: 'file_url', description: 'description',
            teacherComment: 'teacher_comment', score: 'score', isPublic: 'is_public', submitTime: 'submit_time'
        }
    },

    /* --------------------------- 课程 / 班级 / 课表 --------------------------- */
    courses: {
        table: 'course',
        alias: 'co',
        softDelete: true,
        select: [
            'co.id', 'co.course_code AS courseCode', 'co.course_name AS courseName', 'co.category',
            'co.credit', 'co.total_hours AS totalHours', 'co.price', 'co.cover_img AS coverImg',
            'co.description', 'co.status', 'co.create_time AS createTime',
            '(SELECT COUNT(*) FROM clazz c WHERE c.course_id = co.id AND c.deleted = 0) AS clazzCount',
            '(SELECT COUNT(*) FROM course_chapter ch WHERE ch.course_id = co.id) AS chapterCount'
        ].join(', '),
        joins: '',
        search: ['co.course_name', 'co.course_code', 'co.category'],
        filters: { status: eq('co.status'), category: eq('co.category') },
        order: 'co.id ASC',
        columns: {
            courseCode: 'course_code', courseName: 'course_name', category: 'category', credit: 'credit',
            totalHours: 'total_hours', price: 'price', coverImg: 'cover_img', description: 'description', status: 'status'
        }
    },

    chapters: {
        table: 'course_chapter',
        alias: 'ch',
        softDelete: false,
        select: [
            'ch.id', 'ch.course_id AS courseId', 'co.course_name AS courseName',
            'ch.parent_id AS parentId', "IFNULL(pc.chapter_name, '-') AS parentName",
            'ch.chapter_name AS chapterName', 'ch.hours', 'ch.sort_order AS sortOrder', 'ch.content'
        ].join(', '),
        joins: 'LEFT JOIN course co ON co.id = ch.course_id LEFT JOIN course_chapter pc ON pc.id = ch.parent_id',
        search: ['co.course_name', 'ch.chapter_name'],
        filters: { courseId: eq('ch.course_id') },
        order: 'ch.course_id ASC, ch.sort_order ASC, ch.id ASC',
        columns: {
            courseId: 'course_id', parentId: 'parent_id', chapterName: 'chapter_name',
            hours: 'hours', sortOrder: 'sort_order', content: 'content'
        }
    },

    classes: {
        table: 'clazz',
        alias: 'c',
        softDelete: true,
        select: [
            'c.id', 'c.class_code AS classCode', 'c.class_name AS className',
            'c.course_id AS courseId', 'co.course_name AS courseName',
            'c.head_teacher_id AS headTeacherId', "IFNULL(t.name, '-') AS headTeacherName",
            'c.classroom', 'c.start_date AS startDate', 'c.end_date AS endDate', 'c.capacity',
            'c.student_count AS studentCount', 'c.status', 'c.remark'
        ].join(', '),
        joins: 'LEFT JOIN course co ON co.id = c.course_id LEFT JOIN teacher t ON t.id = c.head_teacher_id',
        search: ['c.class_name', 'c.class_code', 'co.course_name', 't.name'],
        filters: { status: eq('c.status'), courseId: eq('c.course_id') },
        order: 'c.id ASC',
        columns: {
            classCode: 'class_code', className: 'class_name', courseId: 'course_id',
            headTeacherId: 'head_teacher_id', classroom: 'classroom', startDate: 'start_date',
            endDate: 'end_date', capacity: 'capacity', studentCount: 'student_count',
            status: 'status', remark: 'remark'
        }
    },

    schedules: {
        table: 'schedule',
        alias: 'sc',
        softDelete: true,
        select: [
            'sc.id', 'sc.class_id AS classId', 'c.class_name AS className',
            'sc.course_id AS courseId', 'co.course_name AS courseName',
            'sc.teacher_id AS teacherId', 't.name AS teacherName', 'sc.classroom', 'sc.weekday',
            "TIME_FORMAT(sc.lesson_start, '%H:%i') AS lessonStart",
            "TIME_FORMAT(sc.lesson_end, '%H:%i') AS lessonEnd",
            'sc.term', 'sc.start_date AS startDate', 'sc.end_date AS endDate', 'sc.remark'
        ].join(', '),
        joins: 'LEFT JOIN clazz c ON c.id = sc.class_id LEFT JOIN course co ON co.id = sc.course_id LEFT JOIN teacher t ON t.id = sc.teacher_id',
        search: ['c.class_name', 'co.course_name', 't.name', 'sc.classroom'],
        filters: { weekday: eq('sc.weekday'), term: eq('sc.term'), classId: eq('sc.class_id'), teacherId: eq('sc.teacher_id') },
        order: 'sc.weekday ASC, sc.lesson_start ASC',
        columns: {
            classId: 'class_id', courseId: 'course_id', teacherId: 'teacher_id', classroom: 'classroom',
            weekday: 'weekday', lessonStart: 'lesson_start', lessonEnd: 'lesson_end', term: 'term',
            startDate: 'start_date', endDate: 'end_date', remark: 'remark'
        }
    },

    /* -------------------------------- 成绩 -------------------------------- */
    scores: {
        table: 'score',
        alias: 'sc',
        softDelete: true,
        select: [
            'sc.id', 'sc.student_id AS studentId', 's.student_no AS studentNo', 's.name AS studentName',
            'sc.class_id AS classId', "IFNULL(c.class_name, '-') AS className",
            'sc.course_id AS courseId', 'co.course_name AS courseName', 'sc.exam_type AS examType',
            'sc.score', 'sc.full_score AS fullScore', 'sc.exam_date AS examDate',
            'sc.teacher_id AS teacherId', "IFNULL(t.name, '-') AS teacherName", 'sc.remark'
        ].join(', '),
        joins: 'LEFT JOIN student s ON s.id = sc.student_id LEFT JOIN clazz c ON c.id = sc.class_id LEFT JOIN course co ON co.id = sc.course_id LEFT JOIN teacher t ON t.id = sc.teacher_id',
        search: ['s.name', 's.student_no', 'co.course_name', 'c.class_name'],
        filters: { examType: eq('sc.exam_type'), studentId: eq('sc.student_id'), courseId: eq('sc.course_id'), teacherId: eq('sc.teacher_id') },
        order: 'sc.exam_date DESC, sc.id DESC',
        columns: {
            studentId: 'student_id', courseId: 'course_id', classId: 'class_id', examType: 'exam_type',
            score: 'score', fullScore: 'full_score', examDate: 'exam_date', teacherId: 'teacher_id', remark: 'remark'
        }
    },

    /* ------------------------------ 课件资源 ------------------------------ */
    coursewares: {
        table: 'courseware',
        alias: 'cw',
        softDelete: true,
        select: [
            'cw.id', 'cw.course_id AS courseId', "IFNULL(co.course_name, '-') AS courseName",
            'cw.category', 'cw.category AS categoryName', 'cw.title', 'cw.file_url AS fileUrl',
            'cw.file_type AS fileType', 'cw.file_size AS fileSize',
            "CONCAT(ROUND(cw.file_size / 1048576, 2), ' MB') AS fileSizeText",
            'cw.upload_admin_id AS uploadAdminId', "IFNULL(ad.real_name, '-') AS uploaderName",
            'cw.download_count AS downloadCount', 'cw.status',
            "DATE_FORMAT(cw.create_time, '%Y-%m-%d %H:%i') AS createTime"
        ].join(', '),
        joins: 'LEFT JOIN course co ON co.id = cw.course_id LEFT JOIN sys_admin ad ON ad.id = cw.upload_admin_id',
        search: ['cw.title', 'co.course_name', 'cw.category', 'ad.real_name'],
        filters: { categoryName: eq('cw.category'), status: eq('cw.status'), courseId: eq('cw.course_id') },
        order: 'cw.id DESC',
        columns: {
            courseId: 'course_id', category: 'category', title: 'title', fileUrl: 'file_url',
            fileType: 'file_type', fileSize: 'file_size', uploadAdminId: 'upload_admin_id',
            downloadCount: 'download_count', status: 'status'
        }
    },

    /* -------------------------------- 新闻 -------------------------------- */
    news: {
        table: 'news',
        alias: 'n',
        softDelete: true,
        select: [
            'n.id', 'n.title', 'n.category_id AS categoryId', 'nc.category_code AS categoryCode',
            'nc.category_name AS categoryName', 'n.summary', 'n.content', 'n.cover_img AS coverImg',
            'n.author', 'n.source', 'n.is_top AS isTop', 'n.view_count AS viewCount', 'n.status',
            "DATE_FORMAT(n.publish_time, '%Y-%m-%d %H:%i') AS publishTime",
            'n.publisher_id AS publisherId', "IFNULL(ad.real_name, '-') AS publisherName",
            'n.create_time AS createTime'
        ].join(', '),
        joins: 'LEFT JOIN news_category nc ON nc.id = n.category_id LEFT JOIN sys_admin ad ON ad.id = n.publisher_id',
        search: ['n.title', 'n.summary', 'n.author', 'n.source'],
        filters: {
            /* 前端 Tab：all / notice / industry / match */
            category: (v) => (v === 'all' ? null : ['nc.category_code = ?', [v]]),
            status: eq('n.status')
        },
        order: 'n.is_top DESC, n.publish_time DESC, n.id DESC',
        columns: {
            title: 'title', categoryId: 'category_id', summary: 'summary', content: 'content',
            coverImg: 'cover_img', author: 'author', source: 'source', isTop: 'is_top',
            status: 'status', publishTime: 'publish_time', publisherId: 'publisher_id'
        }
    },

    newsCategories: {
        table: 'news_category',
        alias: 'nc',
        softDelete: false,
        select: 'nc.id, nc.category_code AS categoryCode, nc.category_name AS categoryName, nc.sort_order AS sortOrder, nc.status',
        joins: '',
        search: ['nc.category_name', 'nc.category_code'],
        filters: { status: eq('nc.status') },
        order: 'nc.sort_order ASC',
        columns: {
            categoryCode: 'category_code', categoryName: 'category_name', sortOrder: 'sort_order', status: 'status'
        }
    }
};

module.exports = E;
