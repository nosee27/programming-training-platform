/* =====================================================================
   列表页通用渲染器
   一个页面只需要声明：接口、列、筛选条件、操作按钮，剩下的表格 / 分页 /
   搜索 / 权限控制全部由这里统一处理。
   ===================================================================== */
(function () {
    'use strict';

    function ensure(container, id, parent) {
        var el = document.getElementById(id);
        if (el) return el;
        el = document.createElement('div');
        el.id = id;
        (parent || document.querySelector('.jp-main .jp-card') || document.body).appendChild(el);
        return el;
    }

    JP.page = JP.page || {};

    JP.page.list = function (cfg) {
        var card = document.querySelector('.jp-main .jp-card') || document.body;
        var toolbarEl = document.getElementById('jpToolbar') || ensure(card, 'jpToolbar', card);
        var tableEl = document.getElementById('jpTable');
        var pagerEl = document.getElementById('jpPager');
        var state = {
            page: 1,
            size: cfg.size || window.JP_CONFIG.pageSize,
            keyword: '',
            filters: {}
        };

        /* -------- 工具条 -------- */
        var toolbarHtml = '';
        if (cfg.search !== false) {
            toolbarHtml += '<input class="jp-input" id="jpKeyword" placeholder="' + JP.ui.esc(cfg.searchPlaceholder || '请输入关键字搜索') + '">';
        }
        (cfg.filters || []).forEach(function (f) {
            toolbarHtml += '<select class="jp-select" id="jpFilter_' + f.key + '">' +
                f.options.map(function (o) { return '<option value="' + JP.ui.esc(o.value) + '">' + JP.ui.esc(o.label) + '</option>'; }).join('') +
                '</select>';
        });
        if (cfg.search !== false) {
            toolbarHtml += '<button class="jp-btn jp-btn--primary" type="button" id="jpSearch">搜索</button>' +
                '<button class="jp-btn" type="button" id="jpReset">重置</button>';
        }
        toolbarHtml += '<span class="jp-toolbar__spacer"></span>';
        (cfg.toolbar || []).forEach(function (btn, i) {
            if (btn.perm && !JP.session.hasPerm(btn.perm)) return;
            toolbarHtml += '<button class="jp-btn ' + (btn.type === 'primary' ? 'jp-btn--primary' : '') + '" type="button" data-tb="' + i + '">' +
                JP.ui.esc(btn.text) + '</button>';
        });
        toolbarEl.className = 'jp-toolbar';
        toolbarEl.innerHTML = toolbarHtml;

        if (cfg.search !== false) {
            var kw = document.getElementById('jpKeyword');
            kw.value = state.keyword;
            document.getElementById('jpSearch').addEventListener('click', function () {
                state.keyword = kw.value.trim(); state.page = 1; load();
            });
            document.getElementById('jpReset').addEventListener('click', function () {
                state.keyword = ''; kw.value = '';
                state.filters = {};
                (cfg.filters || []).forEach(function (f) {
                    var sel = document.getElementById('jpFilter_' + f.key);
                    if (sel) sel.selectedIndex = 0;
                });
                state.page = 1; load();
            });
            kw.addEventListener('keydown', function (e) {
                if (e.key === 'Enter') { state.keyword = kw.value.trim(); state.page = 1; load(); }
            });
        }
        (cfg.filters || []).forEach(function (f) {
            var sel = document.getElementById('jpFilter_' + f.key);
            if (!sel) return;
            sel.addEventListener('change', function () {
                state.filters[f.key] = sel.value; state.page = 1; load();
            });
        });
        toolbarEl.querySelectorAll('[data-tb]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var b = cfg.toolbar[parseInt(btn.getAttribute('data-tb'), 10)];
                if (b && b.onClick) b.onClick(api);
            });
        });

        /* -------- 数据加载 -------- */
        function load() {
            if (tableEl) tableEl.innerHTML = '<div class="jp-loading">数据加载中…</div>';
            var params = Object.assign({ page: state.page, size: state.size, keyword: state.keyword }, state.filters, cfg.params || {});
            JP.api.get(cfg.url, params).then(function (data) {
                var rows = data.list || data.rows || [];
                var total = data.total || 0;
                JP.ui.table(tableEl, { columns: cfg.columns, rows: rows, actions: cfg.actions, empty: cfg.empty });
                JP.ui.pagination(pagerEl, {
                    total: total, page: state.page, size: state.size,
                    onChange: function (p) { state.page = p; load(); }
                });
                JP.ui.markDemo();
                if (cfg.onLoaded) cfg.onLoaded(data);
            }).catch(function (err) {
                if (tableEl) tableEl.innerHTML = '<div class="jp-empty">加载失败：' + JP.ui.esc(err.message) + '</div>';
            });
        }

        var api = {
            state: state,
            reload: load,
            reset: function () { state.page = 1; load(); }
        };
        load();
        return api;
    };

    /* 详情弹窗快捷方法 */
    JP.page.detail = function (title, pairs, extraHtml) { JP.ui.detail(title, pairs, extraHtml); };

    /**
     * 统一的写操作：POST / PUT / DELETE
     *   JP.page.save({ url: '/users', method: 'POST', data: {...}, onDone: fn })
     * 后端未启动时（自动降级到演示数据）只做提示，不假装写成功。
     */
    JP.page.save = function (options) {
        var method = (options.method || 'POST').toUpperCase();
        var call = method === 'PUT' ? JP.api.put : (method === 'DELETE' ? JP.api.del : JP.api.post);
        return call(options.url, options.data).then(function (data) {
            if (JP.api.usedMock) {
                JP.ui.toast('演示模式：当前未连接后端，本次操作未写入数据库');
            } else {
                JP.ui.toast(options.successText || '操作成功', 'success');
            }
            if (options.onDone) options.onDone(data);
            return data;
        }).catch(function (err) {
            JP.ui.toast((options.failText || '操作失败') + '：' + err.message, 'error');
        });
    };

    /* 兼容旧写法 */
    JP.page.fakeSave = function (message) {
        JP.ui.toast(message || '演示模式：数据未写入后端');
    };
})();
