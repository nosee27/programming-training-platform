/** 业务服务层：工作台与统计 */
const statsDao = require('../dao/statsDao');

module.exports = {
    overview: () => statsDao.overview(),
    todos: () => statsDao.todos(),
    scoreStats: () => statsDao.scoreStats()
};
