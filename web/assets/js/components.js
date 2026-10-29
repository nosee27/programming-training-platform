/* =====================================================================
   公共 UI 组件（原生 JS 实现，零依赖）
   Toast / Modal / Confirm / 表单弹窗 / Tab 标签页 / 表格 / 分页器 / 字典标签
   ===================================================================== */
(function () {
    'use strict';

    window.JP = window.JP || {};

    /* ------------------------------ 字典表 ------------------------------ */
    var dict = {
        gender: { 1: { t: '男' }, 2: { t: '女' } },
        enableStatus: { 1: { t: '启用', c: 'green' }, 0: { t: '禁用', c: 'gray' } },
        studentStatus: { 1: { t: '在读', c: 'green' }, 2: { t: '已结业', c: 'blue' }, 3: { t: '休学', c: 'orange' }, 4: { t: '退学', c: 'red' } },
        attendType: { 1: { t: '正常', c: 'green' }, 2: { t: '迟到', c: 'orange' }, 3: { t: '早退', c: 'orange' }, 4: { t: '请假', c: 'blue' }, 5: { t: '缺勤', c: 'red' } },
        payStatus: { 0: { t: '未缴', c: 'red' }, 1: { t: '部分缴纳', c: 'orange' }, 2: { t: '已缴清', c: 'green' }, 3: { t: '已退费', c: 'gray' } },
        payType: { 1: { t: '新报名' }, 2: { t: '续费' }, 3: { t: '补费' }, 4: { t: '退费' } },
        payMethod: { 1: { t: '微信' }, 2: { t: '支付宝' }, 3: { t: '现金' }, 4: { t: '银行转账' } },
        workType: { 1: { t: '代码项目' }, 2: { t: '设计稿' }, 3: { t: '文档' }, 4: { t: '视频' } },
        evalType: { 1: { t: '学生评教', c: 'green' }, 2: { t: '督导评教', c: 'blue' } },
        roleType: { 1: { t: '主讲', c: 'green' }, 2: { t: '辅导', c: 'blue' }, 3: { t: '班主任', c: 'orange' } },
        examType: { 1: { t: '阶段测验' }, 2: { t: '期中' }, 3: { t: '期末' }, 4: { t: '作品评分' }, 5: { t: '综合' } },
        permType: { 1: { t: '目录', c: 'orange' }, 2: { t: '菜单', c: 'green' }, 3: { t: '按钮', c: 'blue' } },
        newsStatus: { 0: { t: '草稿', c: 'gray' }, 1: { t: '已发布', c: 'green' }, 2: { t: '已下线', c: 'red' } },
        clazzStatus: { 0: { t: '未开班', c: 'gray' }, 1: { t: '在读', c: 'green' }, 2: { t: '已结业', c: 'blue' } },
        courseStatus: { 0: { t: '已下架', c: 'gray' }, 1: { t: '已上架', c: 'green' } },
        publicFlag: { 0: { t: '仅内部', c: 'gray' }, 1: { t: '公开展示', c: 'green' } }
    };

    function esc(str) {
        if (str === null || str === undefined) return '';
        return String(str)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    /* ------------------------------ Toast ------------------------------ */
    function toast(message, type) {
        var wrap = document.querySelector('.jp-toast-wrap');
        if (!wrap) {
            wrap = document.createElement('div');
            wrap.className = 'jp-toast-wrap';
            document.body.appendChild(wrap);
        }
        var el = document.createElement('div');
        el.className = 'jp-toast' + (type ? ' jp-toast--' + type : '');
        el.textContent = message;
        wrap.appendChild(el);
        setTimeout(function () {
            el.style.transition = 'opacity .2s';
            el.style.opacity = '0';
            setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 200);
        }, 2200);
    }

    /* ------------------------------ Modal ------------------------------ */
    function modal(options) {
        var mask = document.createElement('div');
        mask.className = 'jp-modal-mask';
        var wide = options.width === 'wide' ? ' jp-modal--wide' : '';
        mask.innerHTML =
            '<div class="jp-modal' + wide + '">' +
            '  <div class="jp-modal__head"><span>' + esc(options.title || '提示') + '</span>' +
            '    <button class="jp-modal__close" type="button">×</button></div>' +
            '  <div class="jp-modal__body">' + (options.body || '') + '</div>' +
            '  <div class="jp-modal__foot"></div>' +
            '</div>';

        var foot = mask.querySelector('.jp-modal__foot');
        (options.buttons || [{ text: '关闭' }]).forEach(function (btn) {
            var b = document.createElement('button');
            b.type = 'button';
            b.className = 'jp-btn' + (btn.type === 'primary' ? ' jp-btn--primary' : '') + (btn.type === 'danger' ? ' jp-btn--danger' : '');
            b.textContent = btn.text;
            b.addEventListener('click', function () {
                if (btn.onClick) btn.onClick(api, mask);
                else api.close();
            });
            foot.appendChild(b);
        });

        function close() { if (mask.parentNode) mask.parentNode.removeChild(mask); }
        function onKey(e) { if (e.key === 'Escape') close(); }

        mask.querySelector('.jp-modal__close').addEventListener('click', close);
        mask.addEventListener('click', function (e) { if (e.target === mask) close(); });
        document.addEventListener('keydown', onKey);
        document.body.appendChild(mask);
        if (options.onMount) options.onMount(mask);

        var api = { el: mask, close: function () { document.removeEventListener('keydown', onKey); close(); }, body: mask.querySelector('.jp-modal__body') };
        return api;
    }

    function confirm(options) {
        modal({
            title: options.title || '操作确认',
            body: '<div style="line-height:1.8">' + (options.message || '确定执行该操作吗？') + '</div>',
            buttons: [
                { text: '取消' },
                { text: '确定', type: 'primary', onClick: function (m) { m.close(); if (options.onOk) options.onOk(); } }
            ]
        });
    }

    /* --------------------------- 表单弹窗 --------------------------- */
    function formModal(options) {
        var fields = options.fields || [];
        var values = options.values || {};
        var html = '<form class="jp-form" autocomplete="off"><div class="jp-grid2">';
        fields.forEach(function (f) {
            var val = values[f.key] === undefined || values[f.key] === null ? '' : values[f.key];
            var full = f.full ? ' jp-field--full' : '';
            html += '<div class="jp-field' + full + '">';
            html += '<label class="jp-field__label">' + esc(f.label) + (f.required ? '<span class="req">*</span>' : '') + '</label>';
            if (f.type === 'select') {
                html += '<select class="jp-select" name="' + f.key + '">';
                (f.options || []).forEach(function (o) {
                    html += '<option value="' + esc(o.value) + '"' + (String(o.value) === String(val) ? ' selected' : '') + '>' + esc(o.label) + '</option>';
                });
                html += '</select>';
            } else if (f.type === 'textarea') {
                html += '<textarea class="jp-textarea" name="' + f.key + '" rows="3" placeholder="' + esc(f.placeholder || '') + '">' + esc(val) + '</textarea>';
            } else {
                html += '<input class="jp-input" name="' + f.key + '" type="' + (f.type || 'text') + '" value="' + esc(val) + '" placeholder="' + esc(f.placeholder || '') + '">';
            }
            html += '</div>';
        });
        html += '</div></form>';

        var m = modal({
            title: options.title,
            width: fields.length > 6 ? 'wide' : '',
            body: html,
            buttons: [
                { text: '取消' },
                {
                    text: '保存', type: 'primary',
                    onClick: function (mApi) {
                        var form = mApi.el.querySelector('form');
                        var data = {};
                        var missing = null;
                        fields.forEach(function (f) {
                            var input = form.querySelector('[name="' + f.key + '"]');
                            var v = input ? input.value.trim() : '';
                            if (f.required && !v && !missing) missing = f.label;
                            data[f.key] = v;
                        });
                        if (missing) { toast('请填写「' + missing + '」', 'error'); return; }
                        mApi.close();
                        if (options.onSubmit) options.onSubmit(data);
                    }
                }
            ]
        });
        return m;
    }

    /* --------------------------- 详情弹窗 --------------------------- */
    function detail(title, pairs, extraHtml) {
        var html = '<div class="jp-desc">';
        pairs.forEach(function (p) {
            html += '<div class="jp-desc__k">' + esc(p[0]) + '</div><div class="jp-desc__v">' + (p[1] === undefined || p[1] === null || p[1] === '' ? '-' : p[1]) + '</div>';
        });
        html += '</div>';
        if (extraHtml) html += extraHtml;
        modal({ title: title, body: html, buttons: [{ text: '关闭' }] });
    }

    /* --------------------------- Tab 标签页 --------------------------- */
    function tabs(container, options) {
        var el = typeof container === 'string' ? document.querySelector(container) : container;
        if (!el) return;
        el.classList.add('jp-tabs');
        function render(active) {
            el.innerHTML = options.items.map(function (item) {
                return '<button type="button" class="jp-tabs__item' + (item.value === active ? ' is-active' : '') +
                    '" data-value="' + esc(item.value) + '">' + esc(item.label) + '</button>';
            }).join('');
        }
        render(options.active);
        el.addEventListener('click', function (e) {
            var btn = e.target.closest('.jp-tabs__item');
            if (!btn) return;
            var value = btn.getAttribute('data-value');
            render(value);
            if (options.onChange) options.onChange(value);
        });
    }

    /* ----------------------------- 表格 ----------------------------- */
    function table(container, options) {
        var el = typeof container === 'string' ? document.querySelector(container) : container;
        if (!el) return;
        var columns = options.columns || [];
        var rows = options.rows || [];
        if (!rows.length) {
            el.innerHTML = '<div class="jp-empty"><span class="jp-empty__icon">📭</span>' + esc(options.empty || '暂无数据') + '</div>';
            return;
        }
        var html = '<div class="jp-table-wrap"><table class="jp-table"><thead><tr>';
        columns.forEach(function (c) {
            html += '<th' + (c.width ? ' style="width:' + c.width + '"' : '') + '>' + esc(c.title) + '</th>';
        });
        if (options.actions && options.actions.length) html += '<th style="width:160px">操作</th>';
        html += '</tr></thead><tbody>';
        rows.forEach(function (row, idx) {
            html += '<tr>';
            columns.forEach(function (c) {
                var content = c.render ? c.render(row, idx) : esc(row[c.key]);
                html += '<td class="' + (c.wrap ? 'is-wrap' : '') + '"' + (c.align ? ' style="text-align:' + c.align + '"' : '') + '>' + content + '</td>';
            });
            if (options.actions && options.actions.length) {
                html += '<td><div class="jp-table__actions">';
                options.actions.forEach(function (a, i) {
                    if (a.perm && !JP.session.hasPerm(a.perm)) return;
                    html += '<button type="button" class="jp-btn jp-btn--text" data-action="' + i + '">' + esc(a.text) + '</button>';
                });
                html += '</div></td>';
            }
            html += '</tr>';
        });
        html += '</tbody></table></div>';
        el.innerHTML = html;

        el.querySelectorAll('[data-action]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var tr = btn.closest('tr');
                var index = Array.prototype.indexOf.call(tr.parentNode.children, tr);
                var action = options.actions[parseInt(btn.getAttribute('data-action'), 10)];
                if (action && action.onClick) action.onClick(rows[index], index);
            });
        });
    }

    /* ---------------------------- 分页器 ---------------------------- */
    function pagination(container, options) {
        var el = typeof container === 'string' ? document.querySelector(container) : container;
        if (!el) return;
        var total = options.total || 0;
        var size = options.size || 10;
        var page = options.page || 1;
        var pages = Math.max(1, Math.ceil(total / size));
        if (page > pages) page = pages;

        var list = [];
        if (pages <= 7) {
            for (var i = 1; i <= pages; i++) list.push(i);
        } else {
            list = [1, 2, 3, 4, 5, '...', pages];
            if (page > 5) list = [1, '...', page - 1, page, page + 1, '...', pages];
            if (page > pages - 4) list = [1, '...', pages - 4, pages - 3, pages - 2, pages - 1, pages];
        }

        var html = '<button type="button" class="jp-pager__btn" data-page="' + (page - 1) + '"' + (page <= 1 ? ' disabled' : '') + '>上一页</button>';
        list.forEach(function (p) {
            if (p === '...') html += '<span class="jp-pager__btn" style="border:none;background:none;cursor:default">…</span>';
            else html += '<button type="button" class="jp-pager__btn' + (p === page ? ' is-active' : '') + '" data-page="' + p + '">' + p + '</button>';
        });
        html += '<button type="button" class="jp-pager__btn" data-page="' + (page + 1) + '"' + (page >= pages ? ' disabled' : '') + '>下一页</button>';
        html += '<span class="jp-pager__info">共 ' + total + ' 条 / ' + pages + ' 页</span>';
        el.innerHTML = html;

        el.querySelectorAll('button[data-page]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var p = parseInt(btn.getAttribute('data-page'), 10);
                if (p < 1 || p > pages || p === page) return;
                if (options.onChange) options.onChange(p);
            });
        });
    }

    /* ---------------------------- 小工具 ---------------------------- */
    function tag(text, color) {
        return '<span class="jp-tag' + (color && color !== 'green' ? ' jp-tag--' + color : '') + '">' + esc(text) + '</span>';
    }

    function dictTag(dictName, value) {
        var item = (dict[dictName] || {})[value];
        if (!item) return esc(value === null || value === undefined || value === '' ? '-' : value);
        return tag(item.t, item.c);
    }

    function dictText(dictName, value) {
        var item = (dict[dictName] || {})[value];
        return item ? item.t : (value === null || value === undefined || value === '' ? '-' : value);
    }

    function money(n) {
        if (n === null || n === undefined || n === '') return '-';
        return '¥' + Number(n).toFixed(2);
    }

    function num(n, suffix) {
        if (n === null || n === undefined || n === '') return '-';
        return n + (suffix || '');
    }

    /* 演示数据提示条（后端未启动时提示当前展示的是演示数据） */
    function markDemo() {
        if (!window.JP.api || !JP.api.usedMock) return;
        if (document.querySelector('.jp-demo-tip')) return;
        var card = document.querySelector('.jp-main .jp-card');
        if (!card) return;
        var tip = document.createElement('div');
        tip.className = 'jp-demo-tip';
        tip.innerHTML = '<span>ℹ️</span><span>当前后端接口未连接，页面展示的是<b>内置演示数据</b>（修改 <code>web/assets/js/config.js</code> 的 apiBase 即可对接 Express 接口）。</span>';
        card.insertBefore(tip, card.firstChild);
    }

    JP.ui = {
        esc: esc, toast: toast, modal: modal, confirm: confirm, formModal: formModal, detail: detail,
        tabs: tabs, table: table, pagination: pagination, tag: tag, dictTag: dictTag, dictText: dictText,
        money: money, num: num, dict: dict, markDemo: markDemo
    };
})();
