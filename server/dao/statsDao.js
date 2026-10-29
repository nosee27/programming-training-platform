/** 工作台概览、待办提醒、成绩统计、课件分类等聚合查询 */
const db = require('../db/pool');

async function overview() {
    const row = await db.queryOne(
        'SELECT ' +
        '(SELECT COUNT(*) FROM student WHERE deleted = 0) AS studentTotal, ' +
        '(SELECT COUNT(*) FROM student WHERE deleted = 0 AND status = 1 AND class_id IS NOT NULL) AS inClass, ' +
        '(SELECT COUNT(*) FROM payment WHERE deleted = 0 AND arrears_amount > 0) AS arrearsCount, ' +
        '(SELECT IFNULL(SUM(arrears_amount), 0) FROM payment WHERE deleted = 0 AND arrears_amount > 0) AS arrearsAmount, ' +
        '(SELECT IFNULL(ROUND(AVG(assess_score), 1), 0) FROM study_archive WHERE deleted = 0 AND assess_score IS NOT NULL) AS avgScore, ' +
        '(SELECT COUNT(*) FROM teacher WHERE deleted = 0) AS teacherTotal, ' +
        '(SELECT COUNT(*) FROM news WHERE deleted = 0) AS newsTotal'
    );
    return {
        studentTotal: Number(row.studentTotal),
        inClass: Number(row.inClass),
        arrearsCount: Number(row.arrearsCount),
        arrearsAmount: Number(row.arrearsAmount),
        avgScore: Number(row.avgScore),
        teacherTotal: Number(row.teacherTotal),
        newsTotal: Number(row.newsTotal)
    };
}

/** 待办提醒：由业务数据实时推导，不额外建表 */
async function todos() {
    const list = [];

    const arrears = await db.query(
        'SELECT s.name AS studentName, p.order_no AS orderNo, p.arrears_amount AS arrears ' +
        'FROM payment p JOIN student s ON s.id = p.student_id ' +
        'WHERE p.deleted = 0 AND p.arrears_amount > 0 ORDER BY p.arrears_amount DESC LIMIT 3'
    );
    if (arrears.length) {
        const names = arrears.map((a) => a.studentName).join('、');
        const sum = arrears.reduce((s, a) => s + Number(a.arrears), 0);
        list.push({
            id: 1, type: '缴费', level: '紧急',
            content: names + ' 等学员缴费单仍未缴清，合计欠费 ' + sum.toFixed(2) + ' 元',
            time: '实时'
        });
    }

    const abnormal = await db.queryOne(
        'SELECT attend_date AS d, COUNT(*) AS c FROM attendance ' +
        'WHERE attend_type IN (2, 3, 5) GROUP BY attend_date ORDER BY attend_date DESC LIMIT 1'
    );
    if (abnormal) {
        list.push({
            id: 2, type: '考勤', level: '普通',
            content: abnormal.d + ' 共有 ' + abnormal.c + ' 条异常考勤（迟到 / 早退 / 缺勤）待班主任确认',
            time: '最新考勤日'
        });
    }

    const pendingWorks = await db.queryOne(
        'SELECT COUNT(*) AS c FROM student_work WHERE deleted = 0 AND (score IS NULL OR teacher_comment IS NULL OR teacher_comment = \'-\')'
    );
    if (pendingWorks && Number(pendingWorks.c) > 0) {
        list.push({
            id: 3, type: '作品', level: '普通',
            content: '有 ' + pendingWorks.c + ' 份学生作品等待教师点评',
            time: '实时'
        });
    }

    const recruiting = await db.queryOne('SELECT COUNT(*) AS c FROM clazz WHERE deleted = 0 AND status = 0');
    if (recruiting && Number(recruiting.c) > 0) {
        list.push({
            id: 4, type: '课程', level: '提醒',
            content: recruiting.c + ' 个班级处于「未开班（招生中）」状态，请及时安排课表',
            time: '实时'
        });
    }

    return { list: list, total: list.length, page: 1, size: list.length || 1 };
}

/** 成绩统计：按课程聚合 + 分数段分布 */
async function scoreStats() {
    const byCourse = await db.query(
        'SELECT co.course_name AS courseName, COUNT(*) AS count, ' +
        'ROUND(AVG(sc.score), 1) AS avg, MAX(sc.score) AS max, MIN(sc.score) AS min, ' +
        'ROUND(SUM(CASE WHEN sc.score / sc.full_score >= 0.6 THEN 1 ELSE 0 END) / COUNT(*) * 100, 1) AS passRate ' +
        'FROM score sc JOIN course co ON co.id = sc.course_id ' +
        'WHERE sc.deleted = 0 GROUP BY co.course_name ORDER BY count DESC'
    );

    const bucketRows = await db.queryOne(
        'SELECT ' +
        'SUM(CASE WHEN score >= 90 THEN 1 ELSE 0 END) AS b1, ' +
        'SUM(CASE WHEN score >= 80 AND score < 90 THEN 1 ELSE 0 END) AS b2, ' +
        'SUM(CASE WHEN score >= 70 AND score < 80 THEN 1 ELSE 0 END) AS b3, ' +
        'SUM(CASE WHEN score >= 60 AND score < 70 THEN 1 ELSE 0 END) AS b4, ' +
        'SUM(CASE WHEN score < 60 THEN 1 ELSE 0 END) AS b5, ' +
        'COUNT(*) AS total FROM score WHERE deleted = 0'
    );

    return {
        byCourse: byCourse,
        buckets: [
            { label: '90 分以上', count: Number(bucketRows.b1 || 0) },
            { label: '80-89 分', count: Number(bucketRows.b2 || 0) },
            { label: '70-79 分', count: Number(bucketRows.b3 || 0) },
            { label: '60-69 分', count: Number(bucketRows.b4 || 0) },
            { label: '60 分以下', count: Number(bucketRows.b5 || 0) }
        ],
        total: Number(bucketRows.total || 0)
    };
}

/** 课件分类（由课件表的 category 列聚合而来，不单独建表） */
async function coursewareCategories() {
    const rows = await db.query(
        'SELECT category, COUNT(*) AS fileCount FROM courseware ' +
        'WHERE deleted = 0 AND category IS NOT NULL GROUP BY category ORDER BY fileCount DESC'
    );
    const remarks = {
        '课件讲义': '课堂教学用 PPT / PDF',
        '练习题库': '课后练习与竞赛题单',
        '源码素材': '案例代码与模板',
        '复习资料': '考前复习提纲',
        '课堂录屏': '课程回放视频'
    };
    return {
        list: rows.map((r, i) => ({
            id: i + 1,
            categoryName: r.category,
            fileCount: Number(r.fileCount),
            remark: remarks[r.category] || ''
        })),
        total: rows.length
    };
}

module.exports = {
    overview: overview,
    todos: todos,
    scoreStats: scoreStats,
    coursewareCategories: coursewareCategories
};
