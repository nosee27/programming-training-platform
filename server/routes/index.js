/** 接口层入口：把各模块路由挂到 /api 下 */
const express = require('express');

const router = express.Router();

router.use('/auth', require('./auth'));
router.use('/', require('./system'));
router.use('/', require('./news'));
router.use('/', require('./student'));
router.use('/', require('./teaching'));
router.use('/', require('./course'));
router.use('/', require('./clazz'));
router.use('/', require('./score'));
router.use('/', require('./courseware'));
router.use('/', require('./stats'));

router.get('/', (req, res) => {
    res.ok({
        name: '编程培训平台管理平台 · 后端接口',
        modules: ['系统管理', '新闻中心', '教师管理', '学生管理', '课程管理', '班级管理', '成绩管理', '课件资源'],
        docs: '接口清单见 docs/03-后端接口清单.md'
    });
});

module.exports = router;
