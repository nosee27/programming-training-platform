/** 接口层：登录与个人中心（Express 路由只做「收参 → 调服务 → 统一响应」） */
const express = require('express');
const h = require('../utils/asyncHandler');
const { auth } = require('../middlewares/auth');
const authService = require('../services/authService');

const router = express.Router();

/** 一键登录：界面不出现用户名 / 密码 / 角色选择 */
router.post('/one-key-login', h(async (req, res) => {
    res.ok(await authService.oneKeyLogin(req), '登录成功');
}));

router.get('/profile', auth, h(async (req, res) => {
    res.ok(await authService.profile(req.user.id));
}));

router.get('/menus', auth, h(async (req, res) => {
    res.ok({ permissions: req.user.perms, roleCodes: req.user.roleCodes });
}));

router.put('/profile', auth, h(async (req, res) => {
    res.ok(await authService.updateProfile(req.user.id, req.body), '资料已保存');
}));

router.post('/change-password', auth, h(async (req, res) => {
    res.ok(await authService.changePassword(req.user.id, req.body.oldPassword, req.body.newPassword), '密码修改成功');
}));

module.exports = router;
