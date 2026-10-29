/* =====================================================================
   路由守卫（页面级权限控制）
   ---------------------------------------------------------------------
   用法：在页面 <head> 中最先引入，并在 <html> 上声明：
        data-root="../../"          资源与页面相对根路径
        data-page="student-basic"   与 JP_MENU 中的 key 对应（选中态高亮）
        data-perm="student:basic:list"  访问本页所需权限码
        data-title="学生基本信息"        面包屑 / 页面标题
   ===================================================================== */
(function () {
    'use strict';

    var html = document.documentElement;
    var root = html.getAttribute('data-root') || '';

    function read(key) {
        try { return JSON.parse(localStorage.getItem(key)); } catch (e) { return null; }
    }

    var token = localStorage.getItem('jp_token');
    var user = read('jp_user') || {};
    var permissions = read('jp_permissions') || [];

    window.JP = window.JP || {};
    JP.session = {
        token: token,
        user: user,
        permissions: permissions,
        hasPerm: function (code) {
            if (!code) return true;
            return permissions.indexOf('*') > -1 || permissions.indexOf(code) > -1;
        },
        redirectLogin: function () {
            localStorage.removeItem('jp_token');
            localStorage.removeItem('jp_user');
            localStorage.removeItem('jp_permissions');
            location.replace(root + 'login.html');
        },
        logout: function () {
            this.redirectLogin();
        }
    };

    /* 1. 未登录 → 回登录页 */
    if (!token) {
        location.replace(root + 'login.html');
        return;
    }

    /* 2. 已登录但无本页权限 → 渲染 403 提示（不渲染页面内容） */
    var required = html.getAttribute('data-perm');
    if (!JP.session.hasPerm(required)) {
        document.addEventListener('DOMContentLoaded', function () {
            document.body.innerHTML =
                '<div style="padding:80px 20px;text-align:center;font-family:inherit">' +
                '<div style="font-size:40px">🔒</div>' +
                '<h2 style="margin:16px 0 8px;font-size:18px">暂无访问权限</h2>' +
                '<p style="color:#8a9099;margin-bottom:20px">当前账号没有「' + (html.getAttribute('data-title') || required) +
                '」的访问权限（权限码：' + required + '），请联系管理员在「角色管理」中授权。</p>' +
                '<button onclick="location.href=\'' + root + 'pages/news/index.html\'" ' +
                'style="height:34px;padding:0 18px;color:#fff;background:#0e9c86;border:none;border-radius:4px;cursor:pointer">返回首页</button>' +
                '</div>';
        });
    }
})();
