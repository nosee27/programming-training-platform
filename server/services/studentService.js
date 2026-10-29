/**
 * 业务服务层：学生域
 *   基本信息 / 学生考勤 / 缴费管理 / 学生学习档案 / 学生作品
 * 这里集中体现业务规则与事务边界：
 *   · 表单里的「班级名称、课程名称、学号」统一解析成外键
 *   · 学生增删改后同步维护 clazz.student_count 冗余字段
 *   · 缴费金额、欠费、缴费状态由服务层计算
 *   · 考勤与成绩按唯一键 UPSERT，避免重复录入
 */
const db = require('../db/pool');
const { createCrud, badRequest } = require('./crudService');
const lookup = require('../dao/lookupDao');
const baseDao = require('../dao/baseDao');

/* ------------------------------ 一、基本信息 ------------------------------ */
const students = createCrud('students', {
    required: ['studentNo', 'name'],
    async beforeSave(data, ctx) {
        if (data.className !== undefined) {
            if (!data.className || data.className === '-') {
                data.classId = null;
            } else {
                const id = await lookup.classIdByName(data.className);
                if (!id) throw badRequest('班级不存在：' + data.className);
                data.classId = id;
            }
            delete data.className;
        }
        if (ctx.mode === 'create' && !data.enrollDate) data.enrollDate = new Date();
    }
});

/** 重算班级在读人数（冗余字段由业务层维护） */
async function refreshClassCount(classIds) {
    const ids = classIds.filter((id) => id !== null && id !== undefined);
    if (!ids.length) return;
    await db.query(
        'UPDATE clazz c SET student_count = (' +
        '  SELECT COUNT(*) FROM student s WHERE s.class_id = c.id AND s.deleted = 0 AND s.status = 1' +
        ') WHERE c.id IN (' + ids.map(() => '?').join(', ') + ')',
        ids
    );
}

async function createStudent(payload, ctx) {
    const row = await students.create(payload, ctx);
    await refreshClassCount([row.classId]);
    return row;
}

async function updateStudent(id, payload, ctx) {
    const before = await students.get(id);
    const row = await students.update(id, payload, ctx);
    await refreshClassCount([before.classId, row.classId]);
    return row;
}

async function removeStudent(id) {
    const before = await students.get(id);
    const result = await students.remove(id);
    await refreshClassCount([before.classId]);
    return result;
}

/* ------------------------------- 二、学生考勤 ------------------------------- */
const attendances = createCrud('attendances', {
    required: ['attendDate'],
    async beforeSave(data) {
        if (data.studentNo !== undefined) {
            const id = await lookup.studentIdByNoOrId(data.studentNo);
            if (!id) throw badRequest('学号不存在：' + data.studentNo);
            data.studentId = id;
            delete data.studentNo;
        }
        if (data.courseName !== undefined) {
            const id = await lookup.courseIdByName(data.courseName);
            if (!id) throw badRequest('课程不存在：' + data.courseName);
            data.courseId = id;
            delete data.courseName;
        }
        if (data.className !== undefined && data.className) {
            data.classId = await lookup.classIdByName(data.className);
            delete data.className;
        }
    }
});

/** 按「学生 + 课程 + 日期」唯一键 UPSERT，重复录入直接覆盖 */
async function saveAttendance(payload) {
    if (!payload.studentNo && !payload.studentId) throw badRequest('缺少学生');
    if (!payload.attendDate) throw badRequest('缺少考勤日期');
    const studentId = payload.studentId || await lookup.studentIdByNoOrId(payload.studentNo);
    const courseId = payload.courseId || await lookup.courseIdByName(payload.courseName);
    if (!studentId || !courseId) throw badRequest('学生或课程不存在');
    const student = await db.queryOne('SELECT class_id AS classId FROM student WHERE id = ?', [studentId]);

    await db.query(
        'INSERT INTO attendance (student_id, class_id, course_id, teacher_id, attend_date, attend_type, check_time, remark) ' +
        'VALUES (?, ?, ?, ?, ?, ?, ?, ?) ' +
        'ON DUPLICATE KEY UPDATE attend_type = VALUES(attend_type), check_time = VALUES(check_time), remark = VALUES(remark)',
        [
            studentId,
            payload.classId || (student ? student.classId : null),
            courseId,
            payload.teacherId || null,
            payload.attendDate,
            payload.attendType || 1,
            payload.checkTime || null,
            payload.remark || null
        ]
    );
    const row = await db.queryOne(
        'SELECT id FROM attendance WHERE student_id = ? AND course_id = ? AND attend_date = ?',
        [studentId, courseId, payload.attendDate]
    );
    return attendances.get(row.id);
}

/* ------------------------------- 三、缴费管理 ------------------------------- */
const payments = createCrud('payments', {
    required: [],
    async beforeSave(data) {
        if (data.studentNo !== undefined) {
            const id = await lookup.studentIdByNoOrId(data.studentNo);
            if (!id) throw badRequest('学号不存在：' + data.studentNo);
            data.studentId = id;
            delete data.studentNo;
        }
        if (data.courseName !== undefined) {
            const id = await lookup.courseIdByName(data.courseName);
            if (!id) throw badRequest('课程不存在：' + data.courseName);
            data.courseId = id;
            delete data.courseName;
        }
    }
});

function calcPayStatus(should, discount, paid) {
    const payable = Number(should || 0) - Number(discount || 0);
    const paidAmount = Number(paid || 0);
    const arrears = Math.max(payable - paidAmount, 0);
    let status = 0;                       // 0 未缴
    if (arrears <= 0 && paidAmount > 0) status = 2;   // 2 已缴清
    else if (paidAmount > 0) status = 1;              // 1 部分缴纳
    return { arrears: Number(arrears.toFixed(2)), status: status };
}

async function nextOrderNo() {
    const d = new Date();
    const stamp = '' + d.getFullYear() + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0');
    const row = await db.queryOne(
        "SELECT COUNT(*) AS c FROM payment WHERE order_no LIKE ?",
        ['JF' + stamp + '%']
    );
    return 'JF' + stamp + String(Number(row.c) + 1).padStart(3, '0');
}

/** 新增缴费单：自动生成单号、计算欠费与状态（放在事务里） */
async function createPayment(payload, ctx) {
    return db.withTransaction(async (conn) => {
        const studentId = payload.studentId || await lookup.studentIdByNoOrId(payload.studentNo);
        if (!studentId) throw badRequest('学号不存在：' + payload.studentNo);
        const courseId = payload.courseName ? await lookup.courseIdByName(payload.courseName) : (payload.courseId || null);
        const student = await conn.queryOne('SELECT class_id AS classId FROM student WHERE id = ?', [studentId]);

        const should = Number(payload.shouldAmount || 0);
        const discount = Number(payload.discountAmount || 0);
        const paid = Number(payload.paidAmount || 0);
        const calc = calcPayStatus(should, discount, paid);
        const orderNo = payload.orderNo || await nextOrderNo();
        const payTime = paid > 0 ? (payload.payTime || new Date()) : null;

        const result = await conn.query(
            'INSERT INTO payment (student_id, order_no, course_id, class_id, pay_type, should_amount, discount_amount, ' +
            'paid_amount, arrears_amount, pay_status, pay_method, pay_time, operator_id, remark) ' +
            'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
                studentId, orderNo, courseId,
                payload.classId || (student ? student.classId : null),
                payload.payType || 1, should, discount, paid, calc.arrears, calc.status,
                payload.payMethod || null, payTime,
                (ctx && ctx.user ? ctx.user.id : null), payload.remark || null
            ]
        );
        /* 事务内回读：必须用同一个连接，否则读不到未提交的写入 */
        return baseDao.findByIdUsing(payments.entity, result.insertId, conn.queryOne);
    });
}

/** 确认收款：追加实收金额并重算欠费与状态（事务 + 行级校验） */
async function confirmPayment(id, amount, payMethod, ctx) {
    const pay = await payments.get(id);
    const add = Number(amount);
    if (!add || add <= 0) throw badRequest('收款金额必须大于 0');
    if (add > Number(pay.arrearsAmount)) throw badRequest('收款金额不能大于欠费金额（当前欠费 ' + pay.arrearsAmount + ' 元）');

    return db.withTransaction(async (conn) => {
        const paid = Number(pay.paidAmount) + add;
        const calc = calcPayStatus(pay.shouldAmount, pay.discountAmount, paid);
        await conn.query(
            'UPDATE payment SET paid_amount = ?, arrears_amount = ?, pay_status = ?, pay_method = ?, ' +
            'pay_time = NOW(), operator_id = ? WHERE id = ?',
            [paid, calc.arrears, calc.status, payMethod || pay.payMethod || null, (ctx && ctx.user ? ctx.user.id : null), pay.id]
        );
        return baseDao.findByIdUsing(payments.entity, pay.id, conn.queryOne);
    });
}

/* ---------------------------- 四、学习档案 / 作品 ---------------------------- */
const archives = createCrud('archives', {
    required: ['stageName', 'stageNo'],
    async beforeSave(data) {
        if (data.studentNo !== undefined) {
            const id = await lookup.studentIdByNoOrId(data.studentNo);
            if (!id) throw badRequest('学号不存在：' + data.studentNo);
            data.studentId = id;
            delete data.studentNo;
        }
        if (data.courseName !== undefined) {
            const id = await lookup.courseIdByName(data.courseName);
            if (!id) throw badRequest('课程不存在：' + data.courseName);
            data.courseId = id;
            delete data.courseName;
        }
    }
});

const works = createCrud('works', {
    required: ['title'],
    async beforeSave(data, ctx) {
        if (data.studentNo !== undefined) {
            const id = await lookup.studentIdByNoOrId(data.studentNo);
            if (!id) throw badRequest('学号不存在：' + data.studentNo);
            data.studentId = id;
            delete data.studentNo;
        }
        if (data.courseName !== undefined && data.courseName) {
            data.courseId = await lookup.courseIdByName(data.courseName);
            delete data.courseName;
        }
        if (ctx.mode === 'create' && !data.submitTime) data.submitTime = new Date();
    }
});

/** 作品点评 */
async function commentWork(id, payload) {
    const row = await works.get(id);
    await db.query(
        'UPDATE student_work SET teacher_comment = ?, score = ? WHERE id = ?',
        [payload.teacherComment || null, payload.score === undefined || payload.score === '' ? null : payload.score, row.id]
    );
    return works.get(row.id);
}

module.exports = {
    students: students,
    createStudent: createStudent,
    updateStudent: updateStudent,
    removeStudent: removeStudent,
    attendances: attendances,
    saveAttendance: saveAttendance,
    payments: payments,
    createPayment: createPayment,
    confirmPayment: confirmPayment,
    archives: archives,
    works: works,
    commentWork: commentWork
};
