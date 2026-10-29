/** 接口层：课程管理（课程信息 / 课程大纲） */
const express = require('express');
const h = require('../utils/asyncHandler');
const { auth, requirePerm } = require('../middlewares/auth');
const svc = require('../services/courseService');

const router = express.Router();

router.get('/courses', auth, requirePerm('course:list'), h(async (req, res) => {
    res.ok(await svc.courses.list(req.query));
}));
router.get('/courses/:id', auth, requirePerm('course:list'), h(async (req, res) => {
    res.ok(await svc.courses.get(req.params.id));
}));
router.post('/courses', auth, requirePerm('course:add'), h(async (req, res) => {
    res.ok(await svc.courses.create(req.body), '新增成功');
}));
router.put('/courses/:id', auth, requirePerm('course:edit'), h(async (req, res) => {
    res.ok(await svc.courses.update(req.params.id, req.body), '保存成功');
}));
router.delete('/courses/:id', auth, requirePerm('course:delete'), h(async (req, res) => {
    res.ok(await svc.courses.remove(req.params.id), '删除成功');
}));

router.get('/course-chapters', auth, requirePerm('course:chapter:list'), h(async (req, res) => {
    res.ok(await svc.chapters.list(req.query));
}));
router.post('/course-chapters', auth, requirePerm('course:edit'), h(async (req, res) => {
    res.ok(await svc.chapters.create(req.body), '新增成功');
}));
router.put('/course-chapters/:id', auth, requirePerm('course:edit'), h(async (req, res) => {
    res.ok(await svc.chapters.update(req.params.id, req.body), '保存成功');
}));
router.delete('/course-chapters/:id', auth, requirePerm('course:edit'), h(async (req, res) => {
    res.ok(await svc.chapters.remove(req.params.id), '删除成功');
}));

module.exports = router;
