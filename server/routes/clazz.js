/** 接口层：班级管理（班级信息 / 课表管理） */
const express = require('express');
const h = require('../utils/asyncHandler');
const { auth, requirePerm } = require('../middlewares/auth');
const svc = require('../services/clazzService');
const scope = require('../utils/scope');

const router = express.Router();

router.get('/classes', auth, requirePerm('clazz:list'), h(async (req, res) => {
    res.ok(await svc.classes.list(req.query));
}));
router.get('/classes/:id', auth, requirePerm('clazz:list'), h(async (req, res) => {
    res.ok(await svc.classes.get(req.params.id));
}));
router.post('/classes', auth, requirePerm('clazz:add'), h(async (req, res) => {
    res.ok(await svc.classes.create(req.body), '新增成功');
}));
router.put('/classes/:id', auth, requirePerm('clazz:edit'), h(async (req, res) => {
    res.ok(await svc.classes.update(req.params.id, req.body), '保存成功');
}));
router.delete('/classes/:id', auth, requirePerm('clazz:delete'), h(async (req, res) => {
    res.ok(await svc.classes.remove(req.params.id), '删除成功');
}));

router.get('/schedules', auth, requirePerm('schedule:list'), h(async (req, res) => {
    /* 学生看本班课表，教师看自己的课表，管理端看全部 */
    var query = req.query;
    if (scope.isStudent(req) && req.user.classId) query = Object.assign({}, query, { classId: req.user.classId });
    res.ok(await svc.schedules.list(scope.byTeacher(req, query)));
}));
router.post('/schedules', auth, requirePerm('schedule:list'), h(async (req, res) => {
    res.ok(await svc.schedules.create(req.body), '排课成功');
}));
router.put('/schedules/:id', auth, requirePerm('schedule:list'), h(async (req, res) => {
    res.ok(await svc.schedules.update(req.params.id, req.body), '保存成功');
}));
router.delete('/schedules/:id', auth, requirePerm('schedule:list'), h(async (req, res) => {
    res.ok(await svc.schedules.remove(req.params.id), '删除成功');
}));

module.exports = router;
