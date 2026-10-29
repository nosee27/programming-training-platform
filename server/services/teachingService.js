/** 业务服务层：教师域（基本信息 / 授课安排 / 教学评价） */
const { createCrud, badRequest } = require('./crudService');
const lookup = require('../dao/lookupDao');

const teachers = createCrud('teachers', {
    required: ['teacherNo', 'name'],
    async beforeSave(data, ctx) {
        if (ctx.mode === 'create' && data.status === undefined) data.status = 1;
    }
});

const teacherCourses = createCrud('teacherCourses', {
    required: ['teacherName', 'courseName'],
    async beforeSave(data) {
        if (data.teacherName !== undefined) {
            const id = await lookup.teacherIdByName(data.teacherName);
            if (!id) throw badRequest('教师不存在：' + data.teacherName);
            data.teacherId = id;
            delete data.teacherName;
        }
        if (data.courseName !== undefined) {
            const id = await lookup.courseIdByName(data.courseName);
            if (!id) throw badRequest('课程不存在：' + data.courseName);
            data.courseId = id;
            delete data.courseName;
        }
        if (data.className !== undefined) {
            data.classId = data.className && data.className !== '-' ? await lookup.classIdByName(data.className) : null;
            delete data.className;
        }
    }
});

const evaluations = createCrud('evaluations', {
    required: ['teacherName', 'score'],
    async beforeSave(data, ctx) {
        if (data.teacherName !== undefined) {
            const id = await lookup.teacherIdByName(data.teacherName);
            if (!id) throw badRequest('教师不存在：' + data.teacherName);
            data.teacherId = id;
            delete data.teacherName;
        }
        if (data.studentName !== undefined) {
            data.studentId = data.studentName && data.studentName !== '-' ? await lookup.studentIdByNoOrId(data.studentName) : null;
            delete data.studentName;
        }
        if (data.courseName !== undefined) {
            data.courseId = data.courseName && data.courseName !== '-' ? await lookup.courseIdByName(data.courseName) : null;
            delete data.courseName;
        }
        if (ctx.mode === 'create' && !data.evalDate) data.evalDate = new Date();
    }
});

module.exports = { teachers: teachers, teacherCourses: teacherCourses, evaluations: evaluations };
