/* =====================================================================
   页面框架：顶部 Header（Logo / 折叠按钮 / 子系统切换 / 消息 / 个人中心）
             侧边栏（子系统切换块 + 用户区 + 父子菜单树）
             面包屑（父系统 / 子系统 / 当前页面）
   ===================================================================== */
(function () {
    'use strict';

    var cfg = window.JP_CONFIG;
    var html = document.documentElement;
    var root = html.getAttribute('data-root') || '';
    var pageKey = html.getAttribute('data-page') || '';
    var pageTitle = html.getAttribute('data-title') || '';

    function ls(key, def) {
        var v = localStorage.getItem(key);
        return v === null ? def : v;
    }

    var currentSubsystem = ls('jp_subsystem', cfg.defaultSubsystem);
    function subsystem() {
        return (window.JP_SUBSYSTEMS || []).filter(function (s) { return s.key === currentSubsystem; })[0] || window.JP_SUBSYSTEMS[0];
    }
    function menusOfCurrent() {
        var s = subsystem();
        return subsystemMenus(s);
    }

    function subsystemMenus(s) {
        return s.key === 'teach' ? (window.JP_MENU || []) : (s.menus || []);
    }

    /** 当前账号在该端是否至少有一个可访问菜单（用于置灰无权限的端） */
    function subsystemAccessible(s) {
        return subsystemMenus(s).some(function (m) {
            if (m.perm && !JP.session.hasPerm(m.perm)) return false;
            if (!m.children || !m.children.length) return true;
            return m.children.some(function (c) { return !c.perm || JP.session.hasPerm(c.perm); });
        });
    }

    /* ------------------------------ 消息 ------------------------------ */
    var messages = [
        { type: '待办', text: '有 2 名学员缴费未缴清，请及时跟进', time: '10 分钟前', color: 'orange' },
        { type: '考勤', text: '2603 班今日有 1 条缺勤记录待确认', time: '1 小时前', color: 'red' },
        { type: '作品', text: '何雨欣提交了作品《待办事项清单工具》，待点评', time: '昨天 21:45', color: 'blue' },
        { type: '公告', text: '第十四届蓝桥杯省赛成绩已公布', time: '10-08 09:30', color: 'green' }
    ];

    /* ---------------------------- 顶部 Header ---------------------------- */
    function renderHeader() {
        var el = document.getElementById('jpHeader');
        if (!el) return;
        var s = subsystem();
        el.innerHTML =
            '<div class="jp-logo">' +
            '  <span class="jp-logo__mark">🌐</span>' +
            '  <span class="jp-logo__text">' + JP.ui.esc(cfg.brand) + '</span>' +
            '</div>' +
            '<button class="jp-hamburger" type="button" id="jpToggle" title="折叠 / 展开侧边栏">' +
            '  <span></span><span></span><span></span>' +
            '</button>' +
            '<button class="jp-header__entry" type="button" id="jpSubsystemSwitch" style="margin-left:14px">' +
            '  <span>' + s.icon + '</span><span>' + JP.ui.esc(s.name) + '</span><span style="font-size:10px">▾</span>' +
            '</button>' +
            '<div class="jp-header__right">' +
            '  <button class="jp-header__entry" type="button" id="jpEnterCoding">🖥️<span>进入编程环境</span></button>' +
            '  <div class="jp-user" id="jpMsgWrap">' +
            '    <button class="jp-header__entry" type="button" id="jpMsgBtn">🔔<span>消息</span>' +
            '      <span class="jp-badge" style="background:#ff6a00">' + messages.length + '</span></button>' +
            '    <div class="jp-user__menu" id="jpMsgMenu" style="min-width:300px"></div>' +
            '  </div>' +
            '  <div class="jp-user" id="jpUserWrap">' +
            '    <button class="jp-user__trigger" type="button" id="jpUserBtn">' +
            '      <span class="jp-user__avatar">' + JP.ui.esc((JP.session.user.name || '用户').substring(0, 1)) + '</span>' +
            '      <span>' + JP.ui.esc(JP.session.user.name || '未登录') + '</span><span style="font-size:10px">▾</span>' +
            '    </button>' +
            '    <div class="jp-user__menu" id="jpUserMenu"></div>' +
            '  </div>' +
            '</div>';

        /* 折叠 */
        el.querySelector('#jpToggle').addEventListener('click', function () {
            var layout = document.querySelector('.jp-layout');
            var collapsed = layout.classList.toggle('is-collapsed');
            localStorage.setItem('jp_collapsed', collapsed ? '1' : '0');
        });

        /* 子系统切换 */
        el.querySelector('#jpSubsystemSwitch').addEventListener('click', openSubsystemModal);

        /* 进入编程环境（切到编程环境子系统） */
        el.querySelector('#jpEnterCoding').addEventListener('click', function () {
            switchSubsystem('code');
        });

        /* 消息中心 */
        var msgBtn = el.querySelector('#jpMsgBtn');
        var msgMenu = el.querySelector('#jpMsgMenu');
        msgMenu.innerHTML = messages.map(function (m) {
            return '<div style="padding:10px 16px;border-bottom:1px solid #f2f3f6;white-space:normal">' +
                '<div style="margin-bottom:4px">' + JP.ui.tag(m.type, m.color) +
                '<span style="color:#8a9099;font-size:12px;margin-left:8px">' + m.time + '</span></div>' +
                '<div style="font-size:13px;line-height:1.5;color:#333">' + JP.ui.esc(m.text) + '</div></div>';
        }).join('') + '<div style="padding:8px 16px;text-align:center;font-size:13px;color:#0e9c86;cursor:pointer" id="jpMsgAll">查看全部消息</div>';
        msgBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            el.querySelector('#jpUserMenu').classList.remove('is-open');
            msgMenu.classList.toggle('is-open');
        });
        msgMenu.addEventListener('click', function (e) {
            if (e.target.id === 'jpMsgAll') { JP.ui.toast('消息中心页面待迭代补充'); msgMenu.classList.remove('is-open'); }
            e.stopPropagation();
        });

        /* 个人中心下拉 */
        var userBtn = el.querySelector('#jpUserBtn');
        var userMenu = el.querySelector('#jpUserMenu');
        userMenu.innerHTML = (window.JP_USER_MENU || []).map(function (item, i) {
            if (item.perm && !JP.session.hasPerm(item.perm)) return '';
            return '<button type="button" data-index="' + i + '">' + JP.ui.esc(item.name) + '</button>';
        }).join('');
        userBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            msgMenu.classList.remove('is-open');
            userMenu.classList.toggle('is-open');
        });
        userMenu.addEventListener('click', function (e) {
            var btn = e.target.closest('button');
            if (!btn) return;
            var item = (window.JP_USER_MENU || [])[parseInt(btn.getAttribute('data-index'), 10)];
            userMenu.classList.remove('is-open');
            if (item.action === 'logout') {
                JP.ui.confirm({
                    title: '退出登录', message: '确定要退出当前账号吗？',
                    onOk: function () { JP.session.logout(); }
                });
            } else if (item.action === 'vip') {
                openVipModal();
            } else if (item.path) {
                location.href = root + item.path;
            }
        });

        document.addEventListener('click', function () {
            msgMenu.classList.remove('is-open');
            userMenu.classList.remove('is-open');
        });
    }

    /* ------------------------------ 侧边栏 ------------------------------ */
    function renderSidebar() {
        var el = document.getElementById('jpSidebar');
        if (!el) return;
        var s = subsystem();
        var user = JP.session.user || {};

        var html2 =
            '<div class="jp-side-user">' +
            '  <div class="jp-side-user__name"><span>' + JP.ui.esc(user.name || '未登录') + '</span><span class="jp-side-user__crown">👑</span></div>' +
            '  <div class="jp-side-user__expire">' + JP.ui.esc(user.expireDate || '--') + '到期 <span class="renew" id="jpRenew">续费&gt;&gt;</span></div>' +
            '  <button class="jp-side-user__vip" type="button" id="jpVipBtn">查看会员权益</button>' +
            '</div>';

        /* 子系统切换块（父系统 → 子系统） */
        html2 +=
            '<div style="padding:12px 14px;border-bottom:1px solid #3a3f4a;cursor:pointer" id="jpSideSubsystem">' +
            '  <div style="display:flex;align-items:center;gap:8px;font-size:13px;color:#9aa0a6">当前子系统' +
            '    <span style="margin-left:auto;color:#f7b545">切换 ▾</span></div>' +
            '  <div style="margin-top:6px;display:flex;align-items:center;gap:8px;color:#fff;font-size:15px;font-weight:600">' +
            '    <span>' + s.icon + '</span><span>' + JP.ui.esc(s.name) + '</span>' +
            '    <span class="jp-tag" style="margin-left:auto;' + (s.ready ? '' : 'color:#f0a02a;border-color:#8a6d1f;background:rgba(240,160,42,.12)') + '">' +
            (s.ready ? '已启用' : '演示') + '</span>' +
            '  </div>' +
            '</div>';

        /* 菜单树 */
        html2 += '<ul class="jp-menu">';
        menusOfCurrent().forEach(function (item) {
            if (item.perm && !JP.session.hasPerm(item.perm)) return;
            if (item.children && item.children.length) {
                var kids = item.children.filter(function (c) { return !c.perm || JP.session.hasPerm(c.perm); });
                if (!kids.length) return;
                var open = kids.some(function (c) { return c.key === pageKey; });
                html2 += '<li class="jp-menu__item' + (open ? ' is-open' : '') + '" data-key="' + item.key + '">' +
                    '<div class="jp-menu__link"><span class="jp-menu__icon">' + item.icon + '</span>' +
                    '<span class="jp-menu__text">' + JP.ui.esc(item.name) + '</span><span class="jp-menu__arrow">▼</span></div>' +
                    '<ul class="jp-menu__sub">';
                kids.forEach(function (c) {
                    html2 += '<li class="jp-menu__child' + (c.key === pageKey ? ' is-active' : '') + '" data-key="' + c.key + '" data-path="' + JP.ui.esc(c.path || '') + '">' +
                        '<div class="jp-menu__link"><span class="jp-menu__text">' + JP.ui.esc(c.name) + '</span></div></li>';
                });
                html2 += '</ul></li>';
            } else {
                html2 += '<li class="jp-menu__item' + (item.key === pageKey ? ' is-active' : '') + '" data-key="' + item.key + '" data-path="' + JP.ui.esc(item.path || '') + '">' +
                    '<div class="jp-menu__link"><span class="jp-menu__icon">' + item.icon + '</span>' +
                    '<span class="jp-menu__text">' + JP.ui.esc(item.name) + '</span>' +
                    (item.badge ? '<span class="jp-badge" style="margin-left:8px">' + item.badge + '</span>' : '') +
                    '</div></li>';
            }
        });
        html2 += '</ul>';
        el.innerHTML = html2;

        /* 折叠状态还原 */
        if (localStorage.getItem('jp_collapsed') === '1') {
            document.querySelector('.jp-layout').classList.add('is-collapsed');
        }

        el.querySelector('#jpVipBtn').addEventListener('click', openVipModal);
        el.querySelector('#jpRenew').addEventListener('click', function () {
            JP.ui.toast('续费功能待迭代补充（可对接订单管理子系统）');
        });
        el.querySelector('#jpSideSubsystem').addEventListener('click', openSubsystemModal);

        /* 菜单交互：父菜单展开/收起，子菜单跳转 */
        el.querySelectorAll('.jp-menu__item').forEach(function (li) {
            var link = li.querySelector('.jp-menu__link');
            link.addEventListener('click', function () {
                var path = li.getAttribute('data-path');
                if (path) { location.href = root + path; return; }
                var isOpen = li.classList.contains('is-open');
                el.querySelectorAll('.jp-menu__item').forEach(function (other) { other.classList.remove('is-open'); });
                if (!isOpen) li.classList.add('is-open');
            });
        });
        el.querySelectorAll('.jp-menu__child').forEach(function (li) {
            li.querySelector('.jp-menu__link').addEventListener('click', function (e) {
                e.stopPropagation();
                var path = li.getAttribute('data-path');
                if (path) location.href = root + path;
            });
        });
    }

    /* --------------------------- 会员权益弹窗 --------------------------- */
    function openVipModal() {
        var user = JP.session.user || {};
        JP.ui.modal({
            title: '会员权益',
            body:
                '<div class="jp-desc">' +
                '<div class="jp-desc__k">账号</div><div class="jp-desc__v">' + JP.ui.esc(user.username || '-') + '</div>' +
                '<div class="jp-desc__k">昵称</div><div class="jp-desc__v">' + JP.ui.esc(user.name || '-') + ' 👑</div>' +
                '<div class="jp-desc__k">当前角色</div><div class="jp-desc__v">' + JP.ui.esc(user.roleName || '-') + '</div>' +
                '<div class="jp-desc__k">会员等级</div><div class="jp-desc__v">' + JP.ui.esc(user.memberLevel || '普通') + '</div>' +
                '<div class="jp-desc__k">到期时间</div><div class="jp-desc__v">' + JP.ui.esc(user.expireDate || '-') + '</div>' +
                '</div>' +
                '<div class="jp-section-title" style="margin-top:18px">当前权益</div>' +
                '<ul style="line-height:2;color:#666;font-size:13px">' +
                '<li>· 全部教学管理模块（学生 / 教师 / 课程 / 班级 / 成绩 / 课件）</li>' +
                '<li>· 新闻中心三类动态查看与发布</li>' +
                '<li>· 课件资源上传与下载</li>' +
                '<li>· 编程环境、评测考试、我的题库子系统入口</li>' +
                '</ul>' +
                '<div style="margin-top:14px;font-size:12px;color:#8a9099">如需变更权益方案，请联系平台管理员在「角色管理」中调整权限。</div>',
            buttons: [
                { text: '关闭' },
                { text: '去续费', type: 'primary', onClick: function (m) { m.close(); JP.ui.toast('续费功能待迭代补充'); } }
            ]
        });
    }

    /* --------------------------- 子系统切换弹窗 --------------------------- */
    function openSubsystemModal() {
        var list = window.JP_SUBSYSTEMS || [];
        var body = '<div style="font-size:13px;color:#8a9099;margin-bottom:14px">父系统：<b style="color:#333">' +
            JP.ui.esc(cfg.projectName) + '</b>（' + JP.ui.esc(cfg.brand) + '）</div>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">';
        list.forEach(function (s) {
            var active = s.key === currentSubsystem;
            var ok = subsystemAccessible(s);
            body += '<div data-key="' + s.key + '" style="padding:14px;border:1px solid ' + (active ? '#0e9c86' : '#e9ebef') +
                ';border-radius:6px;cursor:' + (ok ? 'pointer' : 'not-allowed') + ';opacity:' + (ok ? '1' : '.55') +
                ';background:' + (active ? '#f0faf8' : '#fff') + '">' +
                '<div style="display:flex;align-items:center;gap:8px;font-weight:600;font-size:15px">' +
                '<span>' + s.icon + '</span><span>' + JP.ui.esc(s.name) + '</span>' +
                (ok ? (active ? '<span class="jp-tag" style="margin-left:auto">当前</span>' : '')
                    : '<span class="jp-tag jp-tag--gray" style="margin-left:auto">无权限</span>') +
                '</div>' +
                '<div style="margin-top:8px;font-size:12px;color:#8a9099;line-height:1.6">' + JP.ui.esc(s.desc) + '</div>' +
                '<div style="margin-top:10px;font-size:13px;color:#0e9c86">' + (active ? '正在使用' : '进入子系统 →') + '</div>' +
                '</div>';
        });
        body += '</div><div style="margin-top:14px;font-size:12px;color:#8a9099">说明：标「演示」的子系统为父平台下的独立业务入口，当前迭代仅提供入口与占位页面。</div>';

        var m = JP.ui.modal({ title: '切换子系统', width: 'wide', body: body, buttons: [{ text: '关闭' }] });
        m.el.querySelectorAll('[data-key]').forEach(function (card) {
            card.addEventListener('click', function () {
                var target = (window.JP_SUBSYSTEMS || []).filter(function (s) { return s.key === card.getAttribute('data-key'); })[0];
                if (target && !subsystemAccessible(target)) {
                    JP.ui.toast('当前账号（' + ((JP.session.user || {}).roleName || '未登录') + '）无权进入「' + target.name + '」', 'error');
                    return;
                }
                switchSubsystem(card.getAttribute('data-key'));
                m.close();
            });
        });
    }

    function switchSubsystem(key) {
        var target = (window.JP_SUBSYSTEMS || []).filter(function (s) { return s.key === key; })[0];
        if (!target) return;
        if (key === currentSubsystem) { JP.ui.toast('当前已处于「' + target.name + '」'); return; }
        localStorage.setItem('jp_subsystem', key);
        if (target.ready) {
            location.href = root + (target.home || cfg.home);
        } else {
            location.href = root + 'pages/common/coming-soon.html?m=' + encodeURIComponent(target.name) +
                '&sub=' + encodeURIComponent(key);
        }
    }

    /* ------------------------------ 面包屑 ------------------------------ */
    function renderBreadcrumb() {
        var main = document.querySelector('.jp-main');
        if (!main || document.querySelector('.jp-breadcrumb')) return;
        var s = subsystem();
        var trail = ['🏠 ' + cfg.projectName, s.icon + ' ' + s.name];
        if (pageTitle) trail.push(pageTitle);
        var div = document.createElement('div');
        div.className = 'jp-breadcrumb';
        div.textContent = trail.join('  /  ');
        main.insertBefore(div, main.firstChild);
    }

    /* 演示账号：切换到学生端 / 教师端时，一键把身份也切过去 */
    var PORTAL_ACCOUNT = { admin: 'admin', student: 's2026001', teacher: 't1001' };
    var PORTAL_LABEL = { admin: '教学管理', student: '学生端', teacher: '教师端' };
    var PORTAL_ROLE = { admin: '管理员', student: '学员', teacher: '教师' };

    function currentPortal() {
        var u = JP.session.user || {};
        if (u.portal) return u.portal;
        if (u.studentId) return 'student';
        if (u.teacherId) return 'teacher';
        return 'admin';
    }

    /**
     * 身份与端不一致时给出明确提示
     * 管理员切到学生端 / 教师端时，数据范围不受限，必须让使用者知道，
     * 否则会误以为「学生端能看到别人的数据」。
     */
    function renderScopeTip() {
        var main = document.querySelector('.jp-main');
        if (!main || document.querySelector('.jp-scope-tip')) return;
        var want = currentSubsystem === 'student' ? 'student' : (currentSubsystem === 'teacher' ? 'teacher' : 'admin');
        var mine = currentPortal();
        if (want === mine) return;

        /* 两个方向都要覆盖：管理员看业务端（数据不受限）；教师/学员看管理端（只有部分权限） */
        var adminViewing = mine === 'admin';
        var myRole = PORTAL_ROLE[mine] || mine;
        var tipText = adminViewing
            ? '当前以 <b>管理员身份</b> 浏览' + PORTAL_LABEL[want] + '：数据范围不受限，可以看到全部学员记录（管理员本来就拥有全量数据权限）。'
            : '当前以 <b>' + myRole + '身份</b> 浏览' + PORTAL_LABEL[want] + '：菜单和数据都按' + myRole +
              '权限呈现，看不到全量学员数据。若要看全部数据，请切换为管理员身份。';

        var div = document.createElement('div');
        div.className = 'jp-demo-tip jp-scope-tip';
        div.style.background = '#eef6ff';
        div.style.borderColor = '#bcd6f2';
        div.style.color = '#3a76c4';
        div.innerHTML = '<span>👀</span><span>' + tipText + '</span>' +
            '<button class="jp-btn jp-btn--sm" type="button" id="jpSwitchIdentity" style="margin-left:auto">切换为' +
            (PORTAL_ROLE[want] || '') + '身份</button>';
        main.insertBefore(div, main.firstChild);

        var btn = div.querySelector('#jpSwitchIdentity');
        if (btn) {
            btn.addEventListener('click', function () {
                var demo = PORTAL_ACCOUNT[want];
                if (!demo) return;
                JP.api.post('auth/one-key-login?as=' + demo, {}).then(function (data) {
                    localStorage.setItem('jp_token', data.token);
                    localStorage.setItem('jp_user', JSON.stringify(data.user || {}));
                    localStorage.setItem('jp_permissions', JSON.stringify(data.permissions || []));
                    localStorage.setItem('jp_subsystem', data.user.portal || 'teach');
                    JP.ui.toast('已切换为「' + data.user.name + ' / ' + data.user.roleName + '」', 'success');
                    /* 切换身份后要落到对应端的首页，不能统一跳管理端工作台（学生/教师没有 dashboard:view 权限） */
                    var targetPortal = (window.JP_SUBSYSTEMS || []).filter(function (s) { return s.key === data.user.portal; })[0];
                    setTimeout(function () { location.href = root + ((targetPortal && targetPortal.home) || cfg.home); }, 700);
                }).catch(function (err) { JP.ui.toast('切换失败：' + err.message, 'error'); });
            });
        }
    }

    JP.layout = {
        subsystem: subsystem,
        switchSubsystem: switchSubsystem,
        openVipModal: openVipModal,
        openSubsystemModal: openSubsystemModal,
        refresh: function () { renderHeader(); renderSidebar(); }
    };

    renderHeader();
    renderSidebar();
    renderBreadcrumb();
    renderScopeTip();
    if (window.JP.api) JP.ui.markDemo();
})();
