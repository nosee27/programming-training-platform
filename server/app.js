/**
 * 编程培训平台管理平台 · 后端入口
 * ---------------------------------------------------------------------
 * 三层架构落点：
 *   第一层 表现层      —— web/ 下的纯 HTML/CSS/JS 页面（由本服务托管）
 *   第二层 事务处理封装层 —— routes/（接口）→ services/（业务与事务）→ dao/（数据访问）
 *   第三层 数据库      —— MySQL 8.0（连接池见 db/pool.js）
 */
const express = require('express');
const cors = require('cors');
const path = require('path');

const config = require('./config');
const db = require('./db/pool');
const response = require('./middlewares/response');
const routes = require('./routes');
const { notFound, errorHandler } = require('./middlewares/error');

const app = express();

app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(response);

/* 健康检查：部署后先访问这个地址确认服务与数据库是否就绪 */
app.get('/api/health', async (req, res) => {
    try {
        await db.ping();
        res.ok({ server: 'ok', database: 'ok', time: new Date().toISOString() });
    } catch (err) {
        res.fail('数据库不可用：' + err.message, 500);
    }
});

/* 业务接口 */
app.use('/api', routes);

/* 前端静态资源：直接用本服务访问 http://localhost:3000/login.html 即可 */
app.use('/', express.static(path.resolve(__dirname, '..', 'web')));
app.use('/uploads', express.static(path.resolve(__dirname, config.uploadDir)));

/* 未匹配到的 /api 返回统一 404；其他路径回落到登录页 */
app.use('/api', notFound);
app.use((req, res) => {
    res.redirect('/login.html');
});

app.use(errorHandler);

app.listen(config.port, async () => {
    console.log('----------------------------------------------------------');
    console.log('  编程培训平台管理平台 · 后端已启动');
    console.log('  接口地址 : http://localhost:' + config.port + '/api');
    console.log('  前端页面 : http://localhost:' + config.port + '/login.html');
    console.log('  健康检查 : http://localhost:' + config.port + '/api/health');
    console.log('----------------------------------------------------------');
    try {
        await db.ping();
        console.log('[数据库] 连接成功：' + config.db.database + '@' + config.db.host + ':' + config.db.port);
    } catch (err) {
        console.error('[数据库] 连接失败：' + err.message);
        console.error('       请确认 MySQL 已启动，并已执行 sql/01-schema.sql 与 sql/02-seed.sql');
        console.error('       前端仍可独立演示（会自动降级到内置演示数据）');
    }
});

module.exports = app;
