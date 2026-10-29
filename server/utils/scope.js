/**
 * 数据范围控制（学生端 / 教师端）
 * ---------------------------------------------------------------------
 * 学生账号：只能看到自己的课表、考勤、缴费、档案、作品、成绩
 * 教师账号：只能看到自己的授课、课表、评价；学生名单仍可查看（简化处理）
 * 管理端账号不受限制。
 * 判定依据来自 JWT 中的 studentId / teacherId（登录时按账号关联出来）。
 */
function isStudent(req) {
    return !!(req.user && req.user.studentId);
}

function isTeacher(req) {
    return !isStudent(req) && !!(req.user && req.user.teacherId);
}

function byStudent(req, query) {
    return isStudent(req) ? Object.assign({}, query, { studentId: req.user.studentId }) : query;
}

function byTeacher(req, query) {
    return isTeacher(req) ? Object.assign({}, query, { teacherId: req.user.teacherId }) : query;
}

module.exports = { isStudent: isStudent, isTeacher: isTeacher, byStudent: byStudent, byTeacher: byTeacher };
