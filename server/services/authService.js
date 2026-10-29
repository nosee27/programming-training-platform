/** 业务服务层：一键登录 */
const jwt = require('jsonwebtoken');
const config = require('../config');
const authDao = require('../dao/authDao');
const bcrypt = require('bcryptjs');
const db = require('../db/pool');

async function oneKeyLogin(req) {
    /* 演示用：?as=t1001 可切换到教师账号、?as=s2026001 切换到学生账号（登录页仍然只有一个按钮） */
    const asUsername = req && req.query ? req.query.as : '';
    let account = asUsername ? await authDao.findByUsername(asUsername) : null;
    if (!account) account = await authDao.findByUsername(config.defaultLoginUsername);
    if (!account) account = await authDao.findDefaultAccount();
    if (!account) {
        const err = new Error('系统中还没有可用账号，请先执行 sql/01-schema.sql 与 sql/02-seed.sql 初始化数据');
        err.status = 500;
        throw err;
    }

    const roles = await authDao.findRoles(account.id);
    const roleCodes = roles.map((r) => r.roleCode);
    const permissions = await authDao.findPermissionCodes(account.id, roleCodes);

    /* 账号 → 业务身份绑定，用于数据范围控制 */
    const studentRow = await authDao.findStudentIdByAccount(account.username);
    const studentId = studentRow ? studentRow.id : null;
    const studentClassId = studentRow ? studentRow.classId : null;
    const teacherId = studentId ? null : await authDao.findTeacherIdByAccount(account.username);
    const portal = studentId ? 'student' : (teacherId ? 'teacher' : 'admin');

    const token = jwt.sign(
        {
            id: account.id,
            username: account.username,
            name: account.realName,
            roleCodes: roleCodes,
            perms: permissions,
            studentId: studentId,
            classId: studentClassId,
            teacherId: teacherId,
            portal: portal
        },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
    );

    await authDao.touchLogin(account.id, req && (req.ip || req.connection.remoteAddress));

    return {
        token: token,
        user: {
            id: account.id,
            username: account.username,
            name: account.realName,
            avatarText: (account.realName || '用户').substring(0, 1),
            avatar: account.avatar,
            phone: account.phone,
            email: account.email,
            roleName: roles.map((r) => r.roleName).join(' / ') || '-',
            roleCodes: roleCodes,
            portal: portal,
            studentId: studentId,
            classId: studentClassId,
            teacherId: teacherId,
            memberLevel: account.memberLevel,
            expireDate: account.expireDate
        },
        permissions: permissions
    };
}

/** 个人中心：重新拉取当前账号信息与权限 */
async function profile(adminId) {
    const account = await authDao.findById(adminId);
    if (!account) {
        const err = new Error('账号不存在');
        err.status = 404;
        throw err;
    }
    const roles = await authDao.findRoles(account.id);
    const roleCodes = roles.map((r) => r.roleCode);
    return {
        user: {
            id: account.id,
            username: account.username,
            name: account.realName,
            roleName: roles.map((r) => r.roleName).join(' / '),
            memberLevel: account.memberLevel,
            expireDate: account.expireDate
        },
        permissions: await authDao.findPermissionCodes(account.id, roleCodes)
    };
}

async function updateProfile(adminId, payload) {
    const fields = [];
    const values = [];
    [['realName', 'real_name'], ['phone', 'phone'], ['email', 'email'], ['avatar', 'avatar']].forEach(function (pair) {
        if (payload[pair[0]] !== undefined && payload[pair[0]] !== '') {
            fields.push(pair[1] + ' = ?');
            values.push(payload[pair[0]]);
        }
    });
    if (!fields.length) {
        const err = new Error('没有需要更新的资料字段');
        err.status = 400;
        throw err;
    }
    values.push(adminId);
    await db.query('UPDATE sys_admin SET ' + fields.join(', ') + ' WHERE id = ?', values);
    return profile(adminId);
}

/**
 * 修改密码
 * 种子数据里的 password 是占位值（一键登录并不校验密码），
 * 因此库中还不是合法 bcrypt 哈希时直接设置新密码；已是真实哈希则必须校验原密码。
 */
async function changePassword(adminId, oldPassword, newPassword) {
    if (!newPassword || String(newPassword).length < 6) {
        const err = new Error('新密码至少 6 位');
        err.status = 400;
        throw err;
    }
    const row = await db.queryOne('SELECT password FROM sys_admin WHERE id = ?', [adminId]);
    if (!row) {
        const err = new Error('账号不存在');
        err.status = 404;
        throw err;
    }
    const isHashed = /^\$2[aby]\$/.test(row.password || '');
    if (isHashed && !bcrypt.compareSync(String(oldPassword || ''), row.password)) {
        const err = new Error('原密码不正确');
        err.status = 400;
        throw err;
    }
    await db.query('UPDATE sys_admin SET password = ? WHERE id = ?', [bcrypt.hashSync(String(newPassword), 10), adminId]);
    return { id: adminId, verifiedOldPassword: isHashed };
}

module.exports = {
    oneKeyLogin: oneKeyLogin,
    profile: profile,
    updateProfile: updateProfile,
    changePassword: changePassword
};
