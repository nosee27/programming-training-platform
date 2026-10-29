/** 404 与全局异常处理 */
function notFound(req, res) {
    res.fail('接口不存在：' + req.method + ' ' + req.originalUrl, 404, 404);
}

function errorHandler(err, req, res, next) {
    if (res.headersSent) return next(err);
    /* 4xx 属于正常的业务拦截（比如收款超过欠费），只记 5xx，避免日志噪音 */
    if (!err.status || err.status >= 500) {
        console.error('[接口异常]', req.method, req.originalUrl, '-', err.message);
    }

    if (err.code === 'ER_DUP_ENTRY') return res.fail('数据重复：' + err.sqlMessage, 400);
    if (err.code === 'ER_NO_REFERENCED_ROW_2') return res.fail('关联数据不存在，请检查外键字段', 400);
    if (err.code === 'ER_ROW_IS_REFERENCED_2') return res.fail('该数据已被其他记录引用，无法删除', 400);
    if (err.code === 'ECONNREFUSED' || err.code === 'PROTOCOL_CONNECTION_LOST') {
        return res.fail('数据库连接失败，请检查 MySQL 是否启动、.env 配置是否正确', 500);
    }
    res.fail(err.message || '服务器内部错误', err.status || 500);
}

module.exports = { notFound, errorHandler };
