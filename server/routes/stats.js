/** 接口层：工作台统计与待办 */
const express = require('express');
const h = require('../utils/asyncHandler');
const { auth } = require('../middlewares/auth');
const svc = require('../services/statsService');
const { requirePerm } = require('../middlewares/auth');

const router = express.Router();

/* 全校经营指标属于管理端数据，必须校验 dashboard:view，不能只校验登录 */
router.get('/stats/overview', auth, requirePerm('dashboard:view'), h(async (req, res) => {
    res.ok(await svc.overview());
}));

router.get('/todos', auth, requirePerm('dashboard:view'), h(async (req, res) => {
    res.ok(await svc.todos());
}));

module.exports = router;
