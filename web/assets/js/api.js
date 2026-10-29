/* =====================================================================
   请求封装：优先请求后端 Express 接口，失败时自动降级到演示数据
   统一响应体：{ code: 0, message: 'ok', data: ... }   code === 0 视为成功
   ===================================================================== */
(function () {
    'use strict';

    var cfg = window.JP_CONFIG;

    function buildUrl(path, params) {
        var url = cfg.apiBase.replace(/\/$/, '') + '/' + String(path).replace(/^\//, '');
        if (params) {
            var qs = Object.keys(params)
                .filter(function (k) { return params[k] !== undefined && params[k] !== null && params[k] !== ''; })
                .map(function (k) { return encodeURIComponent(k) + '=' + encodeURIComponent(params[k]); })
                .join('&');
            if (qs) url += (url.indexOf('?') > -1 ? '&' : '?') + qs;
        }
        return url;
    }

    function realRequest(path, options) {
        var controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
        var timer = controller ? setTimeout(function () { controller.abort(); }, cfg.timeout) : null;
        var headers = { 'Content-Type': 'application/json' };
        var token = localStorage.getItem('jp_token');
        if (token) headers.Authorization = 'Bearer ' + token;

        return fetch(buildUrl(path, options.params), {
            method: options.method,
            headers: headers,
            body: options.body ? JSON.stringify(options.body) : undefined,
            signal: controller ? controller.signal : undefined
        }).then(function (res) {
            if (timer) clearTimeout(timer);
            if (!res.ok) throw new Error('HTTP ' + res.status);
            return res.json();
        });
    }

    window.JP = window.JP || {};
    JP.api = {
        usedMock: false,
        request: function (path, options) {
            options = options || {};
            options.method = (options.method || 'GET').toUpperCase();

            if (cfg.useMock === true) {
                JP.api.usedMock = true;
                return Promise.resolve(window.JP_mock.handle(path, options.method, options.params, options.body));
            }

            return realRequest(path, options).catch(function (err) {
                if (cfg.useMock === false) throw err;
                /* auto：后端未启动 / 超时 / 返回非 JSON → 降级到演示数据 */
                JP.api.usedMock = true;
                return window.JP_mock.handle(path, options.method, options.params, options.body);
            }).then(function (res) {
                if (!res || typeof res.code === 'undefined') throw new Error('响应格式不正确');
                if (res.code !== 0) throw new Error(res.message || '请求失败');
                return res.data;
            });
        },
        get: function (path, params) { return JP.api.request(path, { method: 'GET', params: params }); },
        post: function (path, body) { return JP.api.request(path, { method: 'POST', body: body }); },
        put: function (path, body) { return JP.api.request(path, { method: 'PUT', body: body }); },
        del: function (path, params) { return JP.api.request(path, { method: 'DELETE', params: params }); }
    };
})();
