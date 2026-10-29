/** 业务服务层：课程域（课程信息 / 课程大纲） */
const { createCrud, badRequest } = require('./crudService');
const lookup = require('../dao/lookupDao');

const courses = createCrud('courses', {
    required: ['courseCode', 'courseName'],
    async beforeSave(data, ctx) {
        if (ctx.mode === 'create' && data.status === undefined) data.status = 1;
    }
});

const chapters = createCrud('chapters', {
    required: ['courseName', 'chapterName'],
    async beforeSave(data) {
        if (data.courseName !== undefined) {
            const id = await lookup.courseIdByName(data.courseName);
            if (!id) throw badRequest('课程不存在：' + data.courseName);
            data.courseId = id;
            delete data.courseName;
        }
        if (data.parentName !== undefined) {
            if (!data.parentName || data.parentName === '-') {
                data.parentId = 0;
            } else {
                const row = await require('../db/pool').queryOne(
                    'SELECT id FROM course_chapter WHERE chapter_name = ? LIMIT 1', [data.parentName]
                );
                if (!row) throw badRequest('父章节不存在：' + data.parentName);
                data.parentId = row.id;
            }
            delete data.parentName;
        }
    }
});

module.exports = { courses: courses, chapters: chapters };
