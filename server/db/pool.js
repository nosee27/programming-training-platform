/**
 * 数据库连接池（第三层「数据库」的统一入口）
 * 业务代码一律通过 query / withTransaction 访问数据库，不直接创建连接。
 */
const mysql = require('mysql2/promise');
const config = require('../config');

const pool = mysql.createPool(config.db);

async function query(sql, params = []) {
    const [rows] = await pool.query(sql, params);
    return rows;
}

async function queryOne(sql, params = []) {
    const rows = await query(sql, params);
    return rows[0] || null;
}

/**
 * 事务封装：把多条 SQL 放进同一个事务，失败自动回滚
 * 这是三层架构中「事务处理封装层」最直接的体现
 */
async function withTransaction(handler) {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        const result = await handler({
            query: async (sql, params = []) => {
                const [rows] = await conn.query(sql, params);
                return rows;
            },
            queryOne: async (sql, params = []) => {
                const [rows] = await conn.query(sql, params);
                return rows[0] || null;
            }
        });
        await conn.commit();
        return result;
    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }
}

async function ping() {
    const conn = await pool.getConnection();
    try {
        await conn.ping();
        return true;
    } finally {
        conn.release();
    }
}

module.exports = { pool, query, queryOne, withTransaction, ping };
