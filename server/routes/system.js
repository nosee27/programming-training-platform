/** 接口层：系统管理（用户 / 角色 / 权限） */
const express = require('express');
const h = require('../utils/asyncHandler');
const { auth, requirePerm } = require('../middlewares/auth');
const svc = require('../services/systemService');

const router = express.Router();

/* ------------------------------ 用户管理 ------------------------------ */
router.get('/users', auth, requirePerm('system:user:list'), h(async (req, res) => {
    res.ok(await svc.users.list(req.query));
}));
router.get('/users/:id', auth, requirePerm('system:user:list'), h(async (req, res) => {
    res.ok(await svc.users.get(req.params.id));
}));
router.post('/users', auth, requirePerm('system:user:add'), h(async (req, res) => {
    res.ok(await svc.users.create(req.body, { user: req.user }), '新增成功');
}));
router.put('/users/:id', auth, requirePerm('system:user:edit'), h(async (req, res) => {
    res.ok(await svc.users.update(req.params.id, req.body, { user: req.user }), '保存成功');
}));
router.delete('/users/:id', auth, requirePerm('system:user:delete'), h(async (req, res) => {
    res.ok(await svc.users.remove(req.params.id), '删除成功');
}));
router.post('/users/:id/reset-password', auth, requirePerm('system:user:reset'), h(async (req, res) => {
    res.ok(await svc.resetPassword(req.params.id, req.body.password), '密码已重置');
}));
router.put('/users/:id/roles', auth, requirePerm('system:user:edit'), h(async (req, res) => {
    res.ok(await svc.assignRoles(req.params.id, req.body.roleIds), '角色已更新');
}));

/* ------------------------------ 角色管理 ------------------------------ */
router.get('/roles', auth, requirePerm('system:role:list'), h(async (req, res) => {
    res.ok(await svc.roles.list(req.query));
}));
router.post('/roles', auth, requirePerm('system:role:add'), h(async (req, res) => {
    res.ok(await svc.roles.create(req.body), '新增成功');
}));
router.put('/roles/:id', auth, requirePerm('system:role:edit'), h(async (req, res) => {
    res.ok(await svc.roles.update(req.params.id, req.body), '保存成功');
}));
router.delete('/roles/:id', auth, requirePerm('system:role:delete'), h(async (req, res) => {
    res.ok(await svc.roles.remove(req.params.id), '删除成功');
}));
router.get('/roles/:id/permissions', auth, requirePerm('system:role:list'), h(async (req, res) => {
    res.ok(await svc.rolePermissionIds(req.params.id));
}));
router.put('/roles/:id/permissions', auth, requirePerm('system:role:grant'), h(async (req, res) => {
    res.ok(await svc.grantPermissions(req.params.id, req.body.permissionIds), '授权成功');
}));

/* ------------------------------ 权限管理 ------------------------------ */
router.get('/permissions', auth, requirePerm('system:permission:list'), h(async (req, res) => {
    res.ok(await svc.permissions.list(req.query));
}));
router.post('/permissions', auth, requirePerm('system:permission:add'), h(async (req, res) => {
    res.ok(await svc.permissions.create(req.body), '新增成功');
}));
router.put('/permissions/:id', auth, requirePerm('system:permission:edit'), h(async (req, res) => {
    res.ok(await svc.permissions.update(req.params.id, req.body), '保存成功');
}));
router.delete('/permissions/:id', auth, requirePerm('system:permission:delete'), h(async (req, res) => {
    res.ok(await svc.permissions.remove(req.params.id), '删除成功');
}));

module.exports = router;
