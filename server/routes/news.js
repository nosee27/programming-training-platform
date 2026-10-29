/** 接口层：新闻中心（全部 / 平台公告 / 行业资讯 / 赛事动态） */
const express = require('express');
const h = require('../utils/asyncHandler');
const { auth, requirePerm } = require('../middlewares/auth');
const svc = require('../services/newsService');

const router = express.Router();

/* 注意：具名路由必须放在 /news/:id 之前，否则会被参数路由吃掉 */
router.get('/news/categories', auth, requirePerm('news:list'), h(async (req, res) => {
    res.ok(await svc.categories());
}));
router.get('/news/category-count', auth, requirePerm('news:list'), h(async (req, res) => {
    res.ok(await svc.categoryCount());
}));

router.get('/news', auth, requirePerm('news:list'), h(async (req, res) => {
    res.ok(await svc.news.list(req.query));
}));
router.get('/news/:id', auth, requirePerm('news:list'), h(async (req, res) => {
    res.ok(await svc.detailAndCount(req.params.id));
}));
router.post('/news', auth, requirePerm('news:add'), h(async (req, res) => {
    res.ok(await svc.news.create(req.body, { user: req.user }), '发布成功');
}));
router.put('/news/:id', auth, requirePerm('news:edit'), h(async (req, res) => {
    res.ok(await svc.news.update(req.params.id, req.body, { user: req.user }), '保存成功');
}));
router.put('/news/:id/top', auth, requirePerm('news:top'), h(async (req, res) => {
    res.ok(await svc.toggleTop(req.params.id, req.body.isTop), '操作成功');
}));
router.put('/news/:id/status', auth, requirePerm('news:edit'), h(async (req, res) => {
    res.ok(await svc.changeStatus(req.params.id, req.body.status), '状态已更新');
}));
router.delete('/news/:id', auth, requirePerm('news:delete'), h(async (req, res) => {
    res.ok(await svc.news.remove(req.params.id), '删除成功');
}));

module.exports = router;
