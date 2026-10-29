/**
 * 第二层·业务服务层（通用 CRUD）
 * ---------------------------------------------------------------------
 * 各模块服务 = 通用 CRUD + 自己的业务钩子（beforeSave / afterSave），
 * 这样既避免重复代码，又能把「名称转主键」「状态推导」这类业务规则集中在服务层。
 */
const baseDao = require('../dao/baseDao');
const entities = require('../dao/entities');
const { parsePage, pageResult } = require('../utils/pager');

function notFound(message) {
    const err = new Error(message || '记录不存在');
    err.status = 404;
    return err;
}

function badRequest(message) {
    const err = new Error(message);
    err.status = 400;
    return err;
}

function createCrud(entityKey, options = {}) {
    const entity = entities[entityKey];
    if (!entity) throw new Error('未定义的实体：' + entityKey);

    const service = {
        entity: entity,

        async list(query = {}) {
            const pager = parsePage(query, options.defaultSize || 10);
            const params = Object.assign({}, query, pager);
            const data = await baseDao.findPage(entity, params);
            return pageResult(data.list, data.total, pager);
        },

        async get(id) {
            const row = await baseDao.findById(entity, id);
            if (!row) throw notFound('记录不存在或已被删除（id=' + id + '）');
            return row;
        },

        async create(payload = {}, ctx = {}) {
            const data = Object.assign({}, payload);
            if (options.beforeSave) await options.beforeSave(data, Object.assign({ mode: 'create' }, ctx));
            if (options.required) {
                options.required.forEach((field) => {
                    if (data[field] === undefined || data[field] === null || data[field] === '') {
                        throw badRequest('缺少必填字段：' + field);
                    }
                });
            }
            const result = await baseDao.insert(entity, data);
            return service.get(result.id);
        },

        async update(id, payload = {}, ctx = {}) {
            await service.get(id);
            const data = Object.assign({}, payload);
            delete data.id;
            if (options.beforeSave) await options.beforeSave(data, Object.assign({ mode: 'update', id: id }, ctx));
            await baseDao.update(entity, id, data);
            return service.get(id);
        },

        async remove(id) {
            await service.get(id);
            await baseDao.remove(entity, id);
            return { id: id };
        }
    };

    return service;
}

module.exports = { createCrud: createCrud, badRequest: badRequest, notFound: notFound };
