/** 统一捕获 async 路由里的异常，交给全局错误中间件处理 */
module.exports = function asyncHandler(fn) {
    return function (req, res, next) {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
