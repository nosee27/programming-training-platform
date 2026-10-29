/** 接口层：成绩管理（录入 / 查询 / 统计） */
const express = require('express');
const h = require('../utils/asyncHandler');
const { auth, requirePerm } = require('../middlewares/auth');
const svc = require('../services/scoreService');
const scope = require('../utils/scope');

const router = express.Router();

router.get('/score-stats', auth, requirePerm('score:stat'), h(async (req, res) => {
    res.ok(await svc.stats());
}));
router.get('/scores/by-student/:studentNo', auth, requirePerm('score:list'), h(async (req, res) => {
    res.ok(await svc.byStudent(req.params.studentNo));
}));
router.get('/scores', auth, requirePerm('score:list'), h(async (req, res) => {
    res.ok(await svc.scores.list(scope.byTeacher(req, scope.byStudent(req, req.query))));
}));
router.post('/scores', auth, requirePerm('score:add'), h(async (req, res) => {
    res.ok(await svc.saveScores(req.body, { user: req.user }), '成绩已录入');
}));
router.post('/scores/batch', auth, requirePerm('score:add'), h(async (req, res) => {
    res.ok(await svc.saveScores({ items: req.body.items }, { user: req.user }), '成绩已批量录入');
}));
router.put('/scores/:id', auth, requirePerm('score:edit'), h(async (req, res) => {
    res.ok(await svc.scores.update(req.params.id, req.body, { user: req.user }), '保存成功');
}));
router.delete('/scores/:id', auth, requirePerm('score:delete'), h(async (req, res) => {
    res.ok(await svc.scores.remove(req.params.id), '删除成功');
}));

module.exports = router;
