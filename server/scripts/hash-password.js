#!/usr/bin/env node
/**
 * 生成 bcrypt 密码哈希，用于替换 sys_admin.password 里的占位值
 * 用法：node scripts/hash-password.js 123456
 */
const bcrypt = require('bcryptjs');

const plain = process.argv[2] || '123456';
const hash = bcrypt.hashSync(plain, 10);

console.log('明文密码：' + plain);
console.log('bcrypt 哈希：' + hash);
console.log('');
console.log('可直接执行 SQL 覆盖默认账号密码：');
console.log("UPDATE sys_admin SET password = '" + hash + "' WHERE username = 'admin';");
