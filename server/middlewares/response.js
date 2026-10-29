/**
 * 统一响应体：{ code, message, data }
 * code === 0 表示成功，与前端 assets/js/api.js 的约定一致
 */
module.exports = function responseMiddleware(req, res, next) {
    res.ok = function (data = null, message = 'ok') {
        res.json({ code: 0, message, data });
    };
    res.fail = function (message = '操作失败', code = 500, httpStatus = 200) {
        res.status(httpStatus).json({ code, message, data: null });
    };
    next();
};
