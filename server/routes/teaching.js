/** 接口层：教师管理（基本信息 / 授课安排 / 教学评价） */
const express = require('express');
const h = require('../utils/asyncHandler');
const { auth, requirePerm } = require('../middlewares/auth');
const svc = require('../services/teachingService');
const scope = require('../utils/scope');

const router = express.Router();

router.get('/teachers', auth, requirePerm('teacher:list'), h(async (req, res) => {
    res.ok(await svc.teachers.list(scope.isTeacher(req) ? Object.assign({}, req.query, { id: req.user.teacherId }) : req.query));
}));
router.get('/teachers/:id', auth, requirePerm('teacher:list'), h(async (req, res) => {
    res.ok(await svc.teachers.get(req.params.id));
}));
router.post('/teachers', auth, requirePerm('teacher:add'), h(async (req, res) => {
    res.ok(await svc.teachers.create(req.body), '新增成功');
}));
router.put('/teachers/:id', auth, requirePerm('teacher:edit'), h(async (req, res) => {
    res.ok(await svc.teachers.update(req.params.id, req.body), '保存成功');
}));
router.delete('/teachers/:id', auth, requirePerm('teacher:delete'), h(async (req, res) => {
    res.ok(await svc.teachers.remove(req.params.id), '删除成功');
}));

router.get('/teacher-courses', auth, requirePerm('teacher:course:list'), h(async (req, res) => {
    res.ok(await svc.teacherCourses.list(scope.byTeacher(req, req.query)));
}));
router.post('/teacher-courses', auth, requirePerm('teacher:course:list'), h(async (req, res) => {
    res.ok(await svc.teacherCourses.create(req.body), '安排成功');
}));
router.put('/teacher-courses/:id', auth, requirePerm('teacher:course:list'), h(async (req, res) => {
    res.ok(await svc.teacherCourses.update(req.params.id, req.body), '保存成功');
}));
router.delete('/teacher-courses/:id', auth, requirePerm('teacher:course:list'), h(async (req, res) => {
    res.ok(await svc.teacherCourses.remove(req.params.id), '删除成功');
}));

router.get('/evaluations', auth, requirePerm('teacher:list'), h(async (req, res) => {
    res.ok(await svc.evaluations.list(scope.byTeacher(req, req.query)));
}));
router.post('/evaluations', auth, requirePerm('teacher:list'), h(async (req, res) => {
    res.ok(await svc.evaluations.create(req.body), '新增成功');
}));
router.put('/evaluations/:id', auth, requirePerm('teacher:list'), h(async (req, res) => {
    res.ok(await svc.evaluations.update(req.params.id, req.body), '保存成功');
}));
router.delete('/evaluations/:id', auth, requirePerm('teacher:list'), h(async (req, res) => {
    res.ok(await svc.evaluations.remove(req.params.id), '删除成功');
}));

module.exports = router;
