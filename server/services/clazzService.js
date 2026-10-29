/** 业务服务层：班级域（班级信息 / 课表管理） */
const { createCrud, badRequest } = require('./crudService');
const lookup = require('../dao/lookupDao');

const classes = createCrud('classes', {
    required: ['classCode', 'className'],
    async beforeSave(data, ctx) {
        if (data.courseName !== undefined) {
            const id = await lookup.courseIdByName(data.courseName);
            if (!id) throw badRequest('课程不存在：' + data.courseName);
            data.courseId = id;
            delete data.courseName;
        }
        if (data.headTeacherName !== undefined) {
            data.headTeacherId = data.headTeacherName && data.headTeacherName !== '-'
                ? await lookup.teacherIdByName(data.headTeacherName)
                : null;
            delete data.headTeacherName;
        }
        if (ctx.mode === 'create' && data.status === undefined) data.status = 0;
    }
});

const schedules = createCrud('schedules', {
    required: ['className', 'courseName', 'teacherName', 'weekday', 'lessonStart', 'lessonEnd'],
    async beforeSave(data) {
        if (data.className !== undefined) {
            const id = await lookup.classIdByName(data.className);
            if (!id) throw badRequest('班级不存在：' + data.className);
            data.classId = id;
            delete data.className;
        }
        if (data.courseName !== undefined) {
            const id = await lookup.courseIdByName(data.courseName);
            if (!id) throw badRequest('课程不存在：' + data.courseName);
            data.courseId = id;
            delete data.courseName;
        }
        if (data.teacherName !== undefined) {
            const id = await lookup.teacherIdByName(data.teacherName);
            if (!id) throw badRequest('教师不存在：' + data.teacherName);
            data.teacherId = id;
            delete data.teacherName;
        }
    }
});

module.exports = { classes: classes, schedules: schedules };
