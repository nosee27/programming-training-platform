/** 接口层：课件资源（列表 / 上传 / 下载计数 / 分类） */
const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const h = require('../utils/asyncHandler');
const config = require('../config');
const { auth, requirePerm } = require('../middlewares/auth');
const svc = require('../services/coursewareService');

const router = express.Router();

/* 上传目录：不存在则自动创建（相对 server/ 目录） */
const uploadRoot = path.resolve(__dirname, '..', config.uploadDir);
fs.mkdirSync(path.join(uploadRoot, 'courseware'), { recursive: true });

const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, path.join(uploadRoot, 'courseware'));
    },
    filename(req, file, cb) {
        const ext = path.extname(file.originalname);
        const stamp = Date.now() + '-' + Math.round(Math.random() * 1e6);
        cb(null, stamp + ext);
    }
});
const upload = multer({
    storage: storage,
    limits: { fileSize: 200 * 1024 * 1024 }        // 单文件 200MB
});

router.get('/courseware-categories', auth, requirePerm('courseware:list'), h(async (req, res) => {
    res.ok(await svc.categories());
}));
router.get('/coursewares', auth, requirePerm('courseware:list'), h(async (req, res) => {
    res.ok(await svc.coursewares.list(req.query));
}));
router.get('/coursewares/:id', auth, requirePerm('courseware:list'), h(async (req, res) => {
    res.ok(await svc.coursewares.get(req.params.id));
}));
router.post('/coursewares', auth, requirePerm('courseware:upload'), h(async (req, res) => {
    res.ok(await svc.coursewares.create(req.body, { user: req.user }), '上传成功');
}));
router.put('/coursewares/:id', auth, requirePerm('courseware:upload'), h(async (req, res) => {
    res.ok(await svc.coursewares.update(req.params.id, req.body, { user: req.user }), '保存成功');
}));
router.delete('/coursewares/:id', auth, requirePerm('courseware:delete'), h(async (req, res) => {
    res.ok(await svc.coursewares.remove(req.params.id), '删除成功');
}));
router.post('/coursewares/:id/download', auth, requirePerm('courseware:download'), h(async (req, res) => {
    res.ok(await svc.incrementDownload(req.params.id), '开始下载');
}));

/** 文件上传：返回可直接写入 file_url 的地址 */
router.post('/uploads/courseware', auth, requirePerm('courseware:upload'),
    upload.single('file'),
    h(async (req, res) => {
        if (!req.file) return res.fail('未接收到文件（表单字段名应为 file）', 400);
        res.ok({
            fileUrl: '/' + config.uploadDir + '/courseware/' + req.file.filename,
            originalName: req.file.originalname,
            fileType: path.extname(req.file.originalname).replace('.', '').toLowerCase(),
            fileSize: req.file.size
        }, '上传成功');
    })
);

module.exports = router;
