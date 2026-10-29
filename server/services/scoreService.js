/** 业务服务层：成绩域（录入 / 查询 / 统计） */
const db = require('../db/pool');
const { createCrud, badRequest } = require('./crudService');
const lookup = require('../dao/lookupDao');
const statsDao = require('../dao/statsDao');

const scores = createCrud('scores', {
    required: ['examType', 'score'],
    async beforeSave(data) {
        if (data.studentNo !== undefined) {
            const id = await lookup.studentIdByNoOrId(data.studentNo);
            if (!id) throw badRequest('学号不存在：' + data.studentNo);
            data.studentId = id;
            delete data.studentNo;
        }
        if (data.courseName !== undefined) {
            const id = await lookup.courseIdByName(data.courseName);
            if (!id) throw badRequest('课程不存在：' + data.courseName);
            data.courseId = id;
            delete data.courseName;
        }
        if (data.teacherName !== undefined && data.teacherName) {
            data.teacherId = await lookup.teacherIdByName(data.teacherName);
            delete data.teacherName;
        }
    }
});

/**
 * 批量 / 单条录入成绩
 * 依赖唯一键 uk_score(student_id, course_id, exam_type)：
 * 同一学生同一课程的同类考试只保留一条，重复录入自动覆盖。
 */
async function saveScores(payload, ctx) {
    const rows = Array.isArray(payload.items) ? payload.items : [payload];
    const saved = [];
    for (const item of rows) {
        const studentId = item.studentId || await lookup.studentIdByNoOrId(item.studentNo);
        if (!studentId) throw badRequest('学号不存在：' + item.studentNo);
        const courseId = item.courseId || await lookup.courseIdByName(item.courseName);
        if (!courseId) throw badRequest('课程不存在：' + item.courseName);
        const fullScore = Number(item.fullScore || 100);
        const score = Number(item.score);
        if (isNaN(score) || score < 0 || score > fullScore) {
            throw badRequest('得分必须在 0 ~ ' + fullScore + ' 之间（学生：' + (item.studentName || item.studentNo) + '）');
        }
        const student = await db.queryOne('SELECT class_id AS classId FROM student WHERE id = ?', [studentId]);

        await db.query(
            'INSERT INTO score (student_id, course_id, class_id, exam_type, score, full_score, exam_date, teacher_id, remark) ' +
            'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) ' +
            'ON DUPLICATE KEY UPDATE score = VALUES(score), full_score = VALUES(full_score), ' +
            'exam_date = VALUES(exam_date), teacher_id = VALUES(teacher_id), remark = VALUES(remark), deleted = 0',
            [
                studentId, courseId, student ? student.classId : null, item.examType || 1,
                score, fullScore, item.examDate || new Date(),
                item.teacherId || (ctx && ctx.user ? ctx.user.id : null), item.remark || null
            ]
        );
        saved.push({ studentId: studentId, studentName: item.studentName, score: score });
    }
    return { saved: saved.length, items: saved };
}

/** 某个学生的成绩曲线（学习档案页 / 家长会材料用） */
async function byStudent(studentNo) {
    const studentId = await lookup.studentIdByNoOrId(studentNo);
    if (!studentId) throw badRequest('学号不存在：' + studentNo);
    const rows = await db.query(
        'SELECT co.course_name AS courseName, sc.exam_type AS examType, sc.score, sc.full_score AS fullScore, sc.exam_date AS examDate ' +
        'FROM score sc JOIN course co ON co.id = sc.course_id ' +
        'WHERE sc.deleted = 0 AND sc.student_id = ? ORDER BY sc.exam_date ASC',
        [studentId]
    );
    return { list: rows, total: rows.length };
}

async function stats() {
    return statsDao.scoreStats();
}

module.exports = { scores: scores, saveScores: saveScores, byStudent: byStudent, stats: stats };
