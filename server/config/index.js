/**
 * 配置层：统一读取环境变量，避免业务代码里散落 process.env
 */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

module.exports = {
    port: Number(process.env.PORT || 3000),
    db: {
        host: process.env.DB_HOST || '127.0.0.1',
        port: Number(process.env.DB_PORT || 3306),
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'program_training_platform',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        charset: 'utf8mb4',
        dateStrings: true
    },
    jwt: {
        secret: process.env.JWT_SECRET || 'jiangjing-education-platform-secret',
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    },
    defaultLoginUsername: process.env.DEFAULT_LOGIN_USERNAME || 'admin',
    uploadDir: process.env.UPLOAD_DIR || 'uploads'
};
