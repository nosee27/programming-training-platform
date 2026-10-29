/** 登录相关的数据访问：账号、角色、权限码 */
const db = require('../db/pool');

const BASE_FIELDS = [
    'a.id', 'a.username', 'a.real_name AS realName', 'a.avatar', 'a.phone', 'a.email',
    'a.member_level AS memberLevel', 'a.expire_date AS expireDate', 'a.status', 'a.remark'
].join(', ');

async function findByUsername(username) {
    return db.queryOne(
        'SELECT ' + BASE_FIELDS + ' FROM sys_admin a WHERE a.deleted = 0 AND a.username = ? LIMIT 1',
        [username]
    );
}

async function findById(id) {
    return db.queryOne(
        'SELECT ' + BASE_FIELDS + ' FROM sys_admin a WHERE a.deleted = 0 AND a.id = ? LIMIT 1',
        [id]
    );
}

/** 默认账号：优先取启用状态、拥有超级管理员角色的账号 */
async function findDefaultAccount() {
    return db.queryOne(
        'SELECT ' + BASE_FIELDS + ', ' +
        '(SELECT COUNT(*) FROM sys_admin_role ar JOIN sys_role r ON r.id = ar.role_id ' +
        " WHERE ar.admin_id = a.id AND r.role_code = 'SUPER_ADMIN') AS isSuper " +
        'FROM sys_admin a WHERE a.deleted = 0 AND a.status = 1 ' +
        'ORDER BY isSuper DESC, a.id ASC LIMIT 1'
    );
}

async function findRoles(adminId) {
    return db.query(
        'SELECT r.id, r.role_name AS roleName, r.role_code AS roleCode ' +
        'FROM sys_admin_role ar JOIN sys_role r ON r.id = ar.role_id ' +
        'WHERE ar.admin_id = ? AND r.status = 1 ORDER BY r.sort_order ASC',
        [adminId]
    );
}

/** 账号 → 学生/教师身份：按学号 / 工号与账号名匹配（学号 S2026001 ↔ 账号 s2026001） */
async function findStudentIdByAccount(username) {
    const row = await db.queryOne(
        'SELECT id, class_id AS classId FROM student WHERE deleted = 0 AND UPPER(student_no) = ? LIMIT 1',
        [String(username || '').toUpperCase()]
    );
    return row || null;
}

async function findTeacherIdByAccount(username) {
    const row = await db.queryOne(
        'SELECT id FROM teacher WHERE deleted = 0 AND UPPER(teacher_no) = ? LIMIT 1',
        [String(username || '').toUpperCase()]
    );
    return row ? row.id : null;
}

/** 该账号拥有的全部权限码；超级管理员返回 ['*'] */
async function findPermissionCodes(adminId, roleCodes) {
    if (roleCodes.indexOf('SUPER_ADMIN') > -1) return ['*'];
    const rows = await db.query(
        'SELECT DISTINCT p.permission_code AS code ' +
        'FROM sys_admin_role ar ' +
        'JOIN sys_role_permission rp ON rp.role_id = ar.role_id ' +
        'JOIN sys_permission p ON p.id = rp.permission_id ' +
        'WHERE ar.admin_id = ? AND p.status = 1',
        [adminId]
    );
    return rows.map((r) => r.code);
}

async function grantRolePermissions(roleId, permissionIds) {
    const db2 = require('../db/pool');
    return db2.withTransaction(async (conn) => {
        await conn.query('DELETE FROM sys_role_permission WHERE role_id = ?', [roleId]);
        for (const pid of permissionIds) {
            await conn.query('INSERT INTO sys_role_permission (role_id, permission_id) VALUES (?, ?)', [roleId, pid]);
        }
        return { roleId: roleId, count: permissionIds.length };
    });
}

async function listRolePermissionIds(roleId) {
    const rows = await db.query('SELECT permission_id AS id FROM sys_role_permission WHERE role_id = ?', [roleId]);
    return rows.map((r) => r.id);
}

async function touchLogin(adminId, ip) {
    await db.query('UPDATE sys_admin SET last_login_time = NOW(), last_login_ip = ? WHERE id = ?', [ip || '', adminId]);
}

module.exports = {
    findByUsername: findByUsername,
    findById: findById,
    findDefaultAccount: findDefaultAccount,
    findRoles: findRoles,
    findStudentIdByAccount: findStudentIdByAccount,
    findTeacherIdByAccount: findTeacherIdByAccount,
    findPermissionCodes: findPermissionCodes,
    grantRolePermissions: grantRolePermissions,
    listRolePermissionIds: listRolePermissionIds,
    touchLogin: touchLogin
};
