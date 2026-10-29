/** 业务服务层：新闻中心（平台公告 / 行业资讯 / 赛事动态） */
const db = require('../db/pool');
const { createCrud, badRequest, notFound } = require('./crudService');
const lookup = require('../dao/lookupDao');

const news = createCrud('news', {
    required: ['title'],
    async beforeSave(data, ctx) {
        /* 分类：前端传分类编码（notice / industry / match），这里解析成外键 */
        if (data.categoryCode) {
            const id = await lookup.categoryIdByCode(data.categoryCode);
            if (!id) throw badRequest('新闻分类不存在：' + data.categoryCode);
            data.categoryId = id;
            delete data.categoryCode;
        }
        if (ctx.mode === 'create') {
            if (data.publisherId === undefined && ctx.user) data.publisherId = ctx.user.id;
            if (!data.publishTime && String(data.status || 1) === '1') {
                data.publishTime = new Date();
            }
        }
    }
});

/** 新闻详情：浏览量 +1（真实业务里的写操作） */
async function detailAndCount(id) {
    const row = await news.get(id);
    await db.query('UPDATE news SET view_count = view_count + 1 WHERE id = ?', [id]);
    row.viewCount = Number(row.viewCount || 0) + 1;
    return row;
}

/** 置顶 / 取消置顶 */
async function toggleTop(id, isTop) {
    const row = await news.get(id);
    await db.query('UPDATE news SET is_top = ? WHERE id = ?', [isTop ? 1 : 0, row.id]);
    return { id: row.id, isTop: isTop ? 1 : 0 };
}

/** 发布 / 下线 */
async function changeStatus(id, status) {
    const row = await news.get(id);
    const value = Number(status);
    if ([0, 1, 2].indexOf(value) === -1) throw badRequest('状态只能是 0 草稿 / 1 已发布 / 2 已下线');
    if (value === 1) {
        await db.query('UPDATE news SET status = 1, publish_time = IFNULL(publish_time, NOW()) WHERE id = ?', [row.id]);
    } else {
        await db.query('UPDATE news SET status = ? WHERE id = ?', [value, row.id]);
    }
    return news.get(row.id);
}

async function categories() {
    const rows = await db.query(
        'SELECT id, category_code AS categoryCode, category_name AS categoryName FROM news_category WHERE status = 1 ORDER BY sort_order ASC'
    );
    return { list: rows, total: rows.length };
}

/** 新闻列表：附带各分类数量，供前端 Tab 显示 */
async function categoryCount() {
    const rows = await db.query(
        'SELECT nc.category_code AS categoryCode, COUNT(n.id) AS count ' +
        'FROM news_category nc LEFT JOIN news n ON n.category_id = nc.id AND n.deleted = 0 ' +
        'GROUP BY nc.category_code'
    );
    const result = { all: 0 };
    rows.forEach((r) => {
        result[r.categoryCode] = Number(r.count);
        result.all += Number(r.count);
    });
    return result;
}

module.exports = {
    news: news,
    detailAndCount: detailAndCount,
    toggleTop: toggleTop,
    changeStatus: changeStatus,
    categories: categories,
    categoryCount: categoryCount,
    notFound: notFound
};
