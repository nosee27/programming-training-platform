/**
 * 权限中间件
 *   auth        —— 校验 JWT，把用户信息与权限码挂到 req.user
 *   requirePerm —— 校验权限码（对应 sys_permission.permission_code）
 */
const jwt = require('jsonwebtoken');
const config = require('../config');

function auth(req, res, next) {
    const header = req.headers.authorization || '';
    const token = header.indexOf('Bearer ') === 0 ? header.slice(7) : (req.query.token || '');
    if (!token) return res.fail('未登录或登录已过期', 401, 401);
    try {
        req.user = jwt.verify(token, config.jwt.secret);
        next();
    } catch (err) {
        const message = err.name === 'TokenExpiredError' ? '登录已过期，请重新一键登录' : '登录状态无效';
        res.fail(message, 401, 401);
    }
}

function requirePerm(code) {
    return function (req, res, next) {
        if (!code) return next();
        const perms = (req.user && req.user.perms) || [];
        if (perms.indexOf('*') > -1 || perms.indexOf(code) > -1) return next();
        res.fail('无权访问该接口（需要权限：' + code + '）', 403, 403);
    };
}

module.exports = { auth, requirePerm };
