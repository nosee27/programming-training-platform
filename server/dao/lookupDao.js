/**
 * 名称 → 主键 的解析
 * 前端表单里填的是「班级名称 / 课程名称 / 学号」这类可读值，
 * 由这里统一解析成外键 id，业务层不用到处写子查询。
 */
const db = require('../db/pool');

async function one(sql, params) {
    const row = await db.queryOne(sql, params);
    return row ? row.id : null;
}

const studentIdByNo = (no) => one('SELECT id FROM student WHERE deleted = 0 AND student_no = ? LIMIT 1', [no]);
const courseIdByName = (name) => one('SELECT id FROM course WHERE deleted = 0 AND course_name = ? LIMIT 1', [name]);
const classIdByName = (name) => one('SELECT id FROM clazz WHERE deleted = 0 AND class_name = ? LIMIT 1', [name]);
const teacherIdByName = (name) => one('SELECT id FROM teacher WHERE deleted = 0 AND name = ? LIMIT 1', [name]);
const adminIdByName = (name) => one('SELECT id FROM sys_admin WHERE deleted = 0 AND real_name = ? LIMIT 1', [name]);
const categoryIdByCode = (code) => one('SELECT id FROM news_category WHERE category_code = ? LIMIT 1', [code]);
const studentIdByNoOrId = (v) => (/^\d+$/.test(String(v)) ? Promise.resolve(Number(v)) : studentIdByNo(v));

module.exports = {
    studentIdByNo: studentIdByNo,
    studentIdByNoOrId: studentIdByNoOrId,
    courseIdByName: courseIdByName,
    classIdByName: classIdByName,
    teacherIdByName: teacherIdByName,
    adminIdByName: adminIdByName,
    categoryIdByCode: categoryIdByCode
};
