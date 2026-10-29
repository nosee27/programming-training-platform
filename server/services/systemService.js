/** 业务服务层：系统管理（用户 / 角色 / 权限） */
const bcrypt = require('bcryptjs');
const db = require('../db/pool');
const { createCrud, badRequest } = require('./crudService');
const authDao = require('../dao/authDao');

/** 用户：新增时生成密码哈希（一键登录不校验密码，密码用于后续扩展） */
const users = createCrud('users', {
    required: ['username', 'realName'],
    async beforeSave(data) {
        if (data.password) data.password = bcrypt.hashSync(String(data.password), 10);
    }
});

const roles = createCrud('roles', { required: ['roleName', 'roleCode'] });
const permissions = createCrud('permissions', { required: ['permissionName', 'permissionCode'] });

/** 角色授权：整体替换该角色的权限集合（事务） */
async function grantPermissions(roleId, permissionIds) {
    if (!Array.isArray(permissionIds)) throw badRequest('permissionIds 必须是数组');
    await roles.get(roleId);
    return authDao.grantRolePermissions(roleId, permissionIds.map((v) => Number(v)));
}

/** 用户分配角色（多对多，整体替换，走事务） */
async function assignRoles(adminId, roleIds) {
    if (!Array.isArray(roleIds)) throw badRequest('roleIds 必须是数组');
    await users.get(adminId);
    return db.withTransaction(async (conn) => {
        await conn.query('DELETE FROM sys_admin_role WHERE admin_id = ?', [adminId]);
        for (const rid of roleIds) {
            await conn.query('INSERT INTO sys_admin_role (admin_id, role_id) VALUES (?, ?)', [adminId, Number(rid)]);
        }
        return { adminId: adminId, count: roleIds.length };
    });
}

/** 重置密码 */
async function resetPassword(adminId, newPassword) {
    await users.get(adminId);
    const hash = bcrypt.hashSync(String(newPassword || '123456'), 10);
    await db.query('UPDATE sys_admin SET password = ? WHERE id = ?', [hash, adminId]);
    return { id: adminId };
}

async function rolePermissionIds(roleId) {
    await roles.get(roleId);
    return { roleId: roleId, permissionIds: await authDao.listRolePermissionIds(roleId) };
}

module.exports = {
    users: users,
    roles: roles,
    permissions: permissions,
    grantPermissions: grantPermissions,
    assignRoles: assignRoles,
    resetPassword: resetPassword,
    rolePermissionIds: rolePermissionIds
};
