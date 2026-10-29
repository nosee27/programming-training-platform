/**
 * 第二层·数据访问层（DAO）通用实现
 * ---------------------------------------------------------------------
 * 所有 SQL 都用占位符（?）传参，字段名来自 entities.js 的白名单，
 * 不存在字符串拼接导致的 SQL 注入风险。
 */
const db = require('../db/pool');

function buildWhere(entity, query = {}) {
    const alias = entity.alias;
    const parts = [];
    const params = [];

    if (entity.softDelete) parts.push(alias + '.deleted = 0');

    if (query.keyword && entity.search && entity.search.length) {
        const like = '%' + query.keyword + '%';
        parts.push('(' + entity.search.map((col) => col + ' LIKE ?').join(' OR ') + ')');
        entity.search.forEach(() => params.push(like));
    }

    Object.keys(entity.filters || {}).forEach((key) => {
        const raw = query[key];
        if (raw === undefined || raw === null || raw === '') return;
        const cond = entity.filters[key](raw);
        if (!cond) return;
        parts.push(cond[0]);
        (cond[1] || []).forEach((v) => params.push(v));
    });

    return { sql: parts.length ? 'WHERE ' + parts.join(' AND ') : '', params: params };
}

async function findPage(entity, query = {}) {
    const where = buildWhere(entity, query);
    const order = entity.order || entity.alias + '.id ASC';
    const totalRow = await db.queryOne(
        'SELECT COUNT(*) AS total FROM ' + entity.table + ' ' + entity.alias + ' ' + (entity.joins || '') + ' ' + where.sql,
        where.params
    );
    const list = await db.query(
        'SELECT ' + entity.select + ' FROM ' + entity.table + ' ' + entity.alias + ' ' + (entity.joins || '') + ' ' +
        where.sql + ' ORDER BY ' + order + ' LIMIT ?, ?',
        where.params.concat([query.offset || 0, query.size || 10])
    );
    return { list: list, total: totalRow ? totalRow.total : 0 };
}

async function findAll(entity, query = {}) {
    const where = buildWhere(entity, query);
    return db.query(
        'SELECT ' + entity.select + ' FROM ' + entity.table + ' ' + entity.alias + ' ' + (entity.joins || '') + ' ' +
        where.sql + ' ORDER BY ' + (entity.order || entity.alias + '.id ASC'),
        where.params
    );
}

/**
 * 用指定执行器（连接池 或 事务连接）查询单条
 * 事务里更新完必须用同一个连接回读，否则会因为隔离级别读到旧值
 */
async function findByIdUsing(entity, id, queryOne) {
    const alias = entity.alias;
    const where = entity.softDelete
        ? 'WHERE ' + alias + '.deleted = 0 AND ' + alias + '.id = ?'
        : 'WHERE ' + alias + '.id = ?';
    return queryOne(
        'SELECT ' + entity.select + ' FROM ' + entity.table + ' ' + entity.alias + ' ' + (entity.joins || '') + ' ' + where,
        [id]
    );
}

async function findById(entity, id) {
    return findByIdUsing(entity, id, db.queryOne);
}

/** 只保留实体声明过的字段，避免前端多传字段导致越权写入 */
function pickColumns(entity, data = {}) {
    const cols = [];
    const values = [];
    Object.keys(entity.columns || {}).forEach((key) => {
        if (data[key] === undefined) return;
        cols.push(entity.columns[key]);
        values.push(data[key] === '' ? null : data[key]);
    });
    return { cols: cols, values: values };
}

async function insert(entity, data) {
    const picked = pickColumns(entity, data);
    if (!picked.cols.length) throw new Error('没有可写入的字段');
    const placeholders = picked.cols.map(() => '?').join(', ');
    const result = await db.query(
        'INSERT INTO ' + entity.table + ' (' + picked.cols.map((c) => '`' + c + '`').join(', ') + ') VALUES (' + placeholders + ')',
        picked.values
    );
    return { id: result.insertId, affected: result.affectedRows };
}

async function update(entity, id, data) {
    const picked = pickColumns(entity, data);
    if (!picked.cols.length) throw new Error('没有可更新的字段');
    const sets = picked.cols.map((c) => '`' + c + '` = ?').join(', ');
    const result = await db.query(
        'UPDATE ' + entity.table + ' SET ' + sets + ' WHERE id = ?',
        picked.values.concat([id])
    );
    return { affected: result.affectedRows };
}

async function remove(entity, id) {
    const sql = entity.softDelete
        ? 'UPDATE ' + entity.table + ' SET deleted = 1 WHERE id = ?'
        : 'DELETE FROM ' + entity.table + ' WHERE id = ?';
    const result = await db.query(sql, [id]);
    return { affected: result.affectedRows };
}

module.exports = {
    buildWhere: buildWhere,
    findPage: findPage,
    findAll: findAll,
    findById: findById,
    findByIdUsing: findByIdUsing,
    insert: insert,
    update: update,
    remove: remove,
    pickColumns: pickColumns
};
