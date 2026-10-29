/** 分页参数解析：page / size / keyword 统一处理 */
function parsePage(query = {}, defaultSize = 10, maxSize = 100) {
    let page = parseInt(query.page, 10);
    let size = parseInt(query.size, 10);
    if (!page || page < 1) page = 1;
    if (!size || size < 1) size = defaultSize;
    if (size > maxSize) size = maxSize;
    return {
        page: page,
        size: size,
        offset: (page - 1) * size,
        keyword: (query.keyword || '').trim()
    };
}

function pageResult(list, total, pager) {
    return { list: list, total: Number(total) || 0, page: pager.page, size: pager.size };
}

module.exports = { parsePage, pageResult };
