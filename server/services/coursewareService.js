/** 业务服务层：课件资源（列表 / 上传登记 / 分类 / 下载计数） */
const db = require('../db/pool');
const { createCrud, badRequest } = require('./crudService');
const lookup = require('../dao/lookupDao');
const statsDao = require('../dao/statsDao');

/** 把「2.30 MB」这类可读文本换算成字节数 */
function parseSize(text, bytes) {
    if (bytes !== undefined && bytes !== null && bytes !== '') return Number(bytes);
    if (!text) return 0;
    const m = String(text).trim().match(/^([\d.]+)\s*(B|KB|MB|GB|字节)?$/i);
    if (!m) return 0;
    const unit = (m[2] || 'B').toUpperCase();
    const factor = { B: 1, '字节': 1, KB: 1024, MB: 1048576, GB: 1073741824 }[unit] || 1;
    return Math.round(Number(m[1]) * factor);
}

const coursewares = createCrud('coursewares', {
    required: ['title'],
    async beforeSave(data, ctx) {
        if (data.courseName !== undefined) {
            data.courseId = data.courseName && data.courseName !== '-'
                ? await lookup.courseIdByName(data.courseName)
                : null;
            delete data.courseName;
        }
        if (data.fileSizeText !== undefined) {
            data.fileSize = parseSize(data.fileSizeText, data.fileSize);
            delete data.fileSizeText;
        }
        if (ctx.mode === 'create') {
            if (data.uploadAdminId === undefined && ctx.user) data.uploadAdminId = ctx.user.id;
            if (!data.fileUrl) throw badRequest('请先上传文件或填写文件地址');
        }
    }
});

async function incrementDownload(id) {
    const row = await coursewares.get(id);
    await db.query('UPDATE courseware SET download_count = download_count + 1 WHERE id = ?', [id]);
    return { id: row.id, downloadCount: Number(row.downloadCount || 0) + 1, fileUrl: row.fileUrl };
}

async function categories() {
    return statsDao.coursewareCategories();
}

module.exports = {
    coursewares: coursewares,
    incrementDownload: incrementDownload,
    categories: categories,
    parseSize: parseSize
};
