/** 接口层：学生管理（基本信息 / 考勤 / 缴费 / 学习档案 / 作品） */
const express = require('express');
const h = require('../utils/asyncHandler');
const { auth, requirePerm } = require('../middlewares/auth');
const svc = require('../services/studentService');
const scope = require('../utils/scope');

const router = express.Router();

/* ------------------------------ 基本信息 ------------------------------ */
router.get('/students', auth, requirePerm('student:basic:list'), h(async (req, res) => {
    res.ok(await svc.students.list(scope.byStudent(req, req.query)));
}));
router.get('/students/:id', auth, requirePerm('student:basic:list'), h(async (req, res) => {
    res.ok(await svc.students.get(req.params.id));
}));
router.post('/students', auth, requirePerm('student:basic:add'), h(async (req, res) => {
    res.ok(await svc.createStudent(req.body, { user: req.user }), '新增成功');
}));
router.put('/students/:id', auth, requirePerm('student:basic:edit'), h(async (req, res) => {
    res.ok(await svc.updateStudent(req.params.id, req.body, { user: req.user }), '保存成功');
}));
router.delete('/students/:id', auth, requirePerm('student:basic:delete'), h(async (req, res) => {
    res.ok(await svc.removeStudent(req.params.id), '删除成功');
}));

/* ------------------------------- 学生考勤 ------------------------------- */
router.get('/attendances', auth, requirePerm('student:attendance:list'), h(async (req, res) => {
    res.ok(await svc.attendances.list(scope.byTeacher(req, scope.byStudent(req, req.query))));
}));
router.post('/attendances', auth, requirePerm('student:attendance:list'), h(async (req, res) => {
    res.ok(await svc.saveAttendance(Object.assign({ teacherId: req.user.id }, req.body)), '考勤已保存');
}));
router.put('/attendances/:id', auth, requirePerm('student:attendance:list'), h(async (req, res) => {
    res.ok(await svc.attendances.update(req.params.id, req.body), '保存成功');
}));
router.delete('/attendances/:id', auth, requirePerm('student:attendance:list'), h(async (req, res) => {
    res.ok(await svc.attendances.remove(req.params.id), '删除成功');
}));

/* ------------------------------- 缴费管理 ------------------------------- */
router.get('/payments', auth, requirePerm('student:payment:list'), h(async (req, res) => {
    res.ok(await svc.payments.list(scope.byStudent(req, req.query)));
}));
router.post('/payments', auth, requirePerm('student:payment:list'), h(async (req, res) => {
    res.ok(await svc.createPayment(req.body, { user: req.user }), '缴费单已创建');
}));
router.put('/payments/:id', auth, requirePerm('student:payment:list'), h(async (req, res) => {
    res.ok(await svc.payments.update(req.params.id, req.body, { user: req.user }), '保存成功');
}));
router.post('/payments/:id/confirm', auth, requirePerm('student:payment:list'), h(async (req, res) => {
    res.ok(await svc.confirmPayment(req.params.id, req.body.amount, req.body.payMethod, { user: req.user }), '收款成功');
}));
router.delete('/payments/:id', auth, requirePerm('student:payment:list'), h(async (req, res) => {
    res.ok(await svc.payments.remove(req.params.id), '删除成功');
}));

/* ---------------------------- 学习档案 / 作品 ---------------------------- */
router.get('/archives', auth, requirePerm('student:archive:list'), h(async (req, res) => {
    res.ok(await svc.archives.list(scope.byStudent(req, req.query)));
}));
router.post('/archives', auth, requirePerm('student:archive:list'), h(async (req, res) => {
    res.ok(await svc.archives.create(req.body), '新增成功');
}));
router.put('/archives/:id', auth, requirePerm('student:archive:list'), h(async (req, res) => {
    res.ok(await svc.archives.update(req.params.id, req.body), '保存成功');
}));
router.delete('/archives/:id', auth, requirePerm('student:archive:list'), h(async (req, res) => {
    res.ok(await svc.archives.remove(req.params.id), '删除成功');
}));

router.get('/works', auth, requirePerm('student:work:list'), h(async (req, res) => {
    res.ok(await svc.works.list(scope.byStudent(req, req.query)));
}));
router.post('/works', auth, requirePerm('student:work:list'), h(async (req, res) => {
    res.ok(await svc.works.create(req.body), '登记成功');
}));
router.put('/works/:id', auth, requirePerm('student:work:list'), h(async (req, res) => {
    res.ok(await svc.works.update(req.params.id, req.body), '保存成功');
}));
router.post('/works/:id/comment', auth, requirePerm('student:work:list'), h(async (req, res) => {
    res.ok(await svc.commentWork(req.params.id, req.body), '点评成功');
}));
router.delete('/works/:id', auth, requirePerm('student:work:list'), h(async (req, res) => {
    res.ok(await svc.works.remove(req.params.id), '删除成功');
}));

module.exports = router;
