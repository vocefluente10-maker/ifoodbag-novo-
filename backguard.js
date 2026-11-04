(function () {
    try {
        if (window.__ifbEarlyBackGuardInit) return;
        window.__ifbEarlyBackGuardInit = true;

        var path = String(window.location.pathname || '/');
        if (/^\/admin(\/|$)/i.test(path)) return;
        if (/^\/api(\/|$)/i.test(path)) return;
        if (/\/upsell/i.test(path)) return;

        var url = path + (window.location.search || '') + (window.location.hash || '');
        var token = String(Date.now()) + '_' + Math.random().toString(36).slice(2, 8);
        var depth = 20;
        var refillAt = 0;
        var isMainBackGuardActive = function () {
            return window.__ifoodBackRedirectInit === true;
        };

        var normalizePath = function (rawUrl) {
            try {
                var parsed = new URL(String(rawUrl || ''), window.location.origin);
                return parsed.pathname + parsed.search;
            } catch (_error) {
                return String(rawUrl || '').trim();
            }
        };

        var currentPath = function () {
            return window.location.pathname + (window.location.search || '');
        };

        var parseStorageJson = function (key) {
            try {
                var raw = window.localStorage ? window.localStorage.getItem(key) : '';
                if (!raw) return null;
                return JSON.parse(raw);
            } catch (_error) {
                return null;
            }
        };

        var isShippingSelectionComplete = function (shipping) {
            if (!shipping || typeof shipping !== 'object') return false;
            var shippingId = String(shipping.id || '').trim();
            var shippingPrice = Number(shipping.price || 0);
            var selectedAt = Number(shipping.selectedAt || 0);
            if (!shippingId) return false;
            if (!isFinite(shippingPrice) || shippingPrice < 0) return false;
            if (!selectedAt || isNaN(selectedAt)) return false;
            return true;
        };

        var isPixPaidStatus = function (pix) {
            if (!pix || typeof pix !== 'object') return false;
            if (pix.upsellPaid === true || pix.paidAt) return true;
            var status = String(pix.status || pix.statusRaw || pix.status_transaction || '').toLowerCase();
            return /paid|approved|confirm|completed|success|conclu|aprov/.test(status);
        };

        var resolvePaidPixTarget = function (pix) {
            if (!pix || typeof pix !== 'object' || !isPixPaidStatus(pix)) return '';
            var explicitTarget = String(pix.upsell && pix.upsell.targetAfterPaid ? pix.upsell.targetAfterPaid : '').trim();
            if (explicitTarget) return explicitTarget;

            var isUpsellPix = !!(pix.isUpsell || (pix.upsell && pix.upsell.enabled));
            if (!isUpsellPix) {
                var isUpsellNew = true;
                try {
                    var cachedPref = window.localStorage ? window.localStorage.getItem('ifoodbag.upsellNew') : null;
                    if (cachedPref === 'false') isUpsellNew = false;
                } catch (_e) {}
                return isUpsellNew ? '/upsell-iof' : '/upsell-iof-antigo';
            }

            var kind = String((pix.upsell && pix.upsell.kind) || '').toLowerCase();
            var hints = [
                String(pix.shippingId || '').toLowerCase(),
                String(pix.shippingName || '').toLowerCase(),
                String((pix.upsell && pix.upsell.title) || '').toLowerCase()
            ].join(' ');
            if (/iof/.test(kind) || /iof/.test(hints)) return '/upsell-correios';
            if (/correios|objeto_grande|objeto grande/.test(kind) || /correios|objeto_grande|objeto grande/.test(hints)) return '/upsell';

            return '/upsell?paid=1';
        };

        var resolveEarlyBackTarget = function () {
            try {
                if (typeof window.__ifbResolveBackRedirect === 'function') {
                    var resolved = String(window.__ifbResolveBackRedirect() || '').trim();
                    if (resolved) return resolved;
                }
            } catch (_error) {
                // Fall through to checkout fallback.
            }

            try {
                var personal = parseStorageJson('ifoodbag.personal') || {};
                var address = parseStorageJson('ifoodbag.address') || null;
                var shipping = parseStorageJson('ifoodbag.shipping') || null;
                var pix = parseStorageJson('ifoodbag.pix') || null;
                var hasPersonal =
                    !!String(personal.name || '').trim() &&
                    !!String(personal.cpf || '').trim() &&
                    !!String(personal.birth || '').trim() &&
                    !!String(personal.email || '').trim() &&
                    !!String(personal.phone || '').trim();
                var vslCompleted = window.localStorage && window.localStorage.getItem('ifoodbag.vslCompleted') === '1';
                var pixPaid = isPixPaidStatus(pix);
                var pixPending = !!pix && !pixPaid;
                var pathname = String(window.location.pathname || '').toLowerCase();
                var onOrderbump = /\/orderbump(?:\.html)?$/i.test(pathname);
                var onCheckout = /\/checkout(?:\.html)?$/i.test(pathname);
                var onHome = pathname === '/' || /\/index(?:\.html)?$/i.test(pathname);

                if (onHome && !hasPersonal && !address && !shipping && !pix) return '/quiz';

                if (!vslCompleted && hasPersonal && address) return '/processando';
                if (pixPending) return '/pix';
                if (pixPaid) return resolvePaidPixTarget(pix) || '/upsell-iof';
                if (onOrderbump && isShippingSelectionComplete(shipping)) {
                    try {
                        var coupon = parseStorageJson('ifoodbag.coupon') || null;
                        var amountOff = Number(coupon && coupon.amountOff ? coupon.amountOff : 0);
                        var discountRate = Number(coupon && coupon.discount ? coupon.discount : 0);
                        var couponValue = amountOff > 0
                            ? amountOff
                            : (discountRate > 0 ? Math.round((25.9 * discountRate) * 100) / 100 : 0);
                        if (couponValue <= 0 && window.localStorage) {
                            window.localStorage.setItem('ifoodbag.coupon', JSON.stringify({
                                code: 'FRETE5',
                                amountOff: 5,
                                appliedAt: Date.now(),
                                source: 'orderbump_back_auto',
                                backOfferLevel: 1
                            }));
                        }
                        if (window.sessionStorage) {
                            window.sessionStorage.setItem('ifoodbag.orderbumpBackAutoPix', '1');
                        }
                    } catch (_error3) {
                        // Ignore session storage restrictions.
                    }
                    return '/pix';
                }
                if (onOrderbump && !isShippingSelectionComplete(shipping)) {
                    return '/checkout?forceFrete=1';
                }
                if (onCheckout && isShippingSelectionComplete(shipping)) {
                    return '/checkout?dc=1&ebr=' + String(Date.now());
                }
                if (shipping) return '/orderbump';
            } catch (_error2) {
                // Ignore storage parsing issues.
            }

            var params = new URLSearchParams(window.location.search || '');
            params.set('dc', '1');
            var query = params.toString();
            return '/checkout' + (query ? ('?' + query) : '');
        };

        var resolveDistinctEarlyBackTarget = function () {
            var target = resolveEarlyBackTarget();
            var targetPath = normalizePath(target);
            var current = currentPath();
            if (targetPath && targetPath !== current) return target;

            var params = new URLSearchParams(window.location.search || '');
            params.set('dc', '1');
            params.set('forceFrete', '1');
            params.set('ebr', String(Date.now()));
            var query = params.toString();
            return '/checkout' + (query ? ('?' + query) : '');
        };

        var refill = function (force) {
            if (window.__ifbAllowUnload) return;
            if (isMainBackGuardActive()) return;
            var now = Date.now();
            if (!force && (now - refillAt) < 80) return;
            refillAt = now;
            var state = history.state || {};
            var step = Number(state.step || 0);
            if (!force && state.ifbEarly === true && state.token === token && step >= depth) return;
            history.replaceState({ ifbEarly: true, token: token, step: 0 }, '', url);
            for (var i = 1; i <= depth; i += 1) {
                history.pushState({ ifbEarly: true, token: token, step: i }, '', url);
            }
        };

        var runBackRedirect = function (event) {
            if (window.__ifbAllowUnload) return;
            if (isMainBackGuardActive()) {
                if (window.__ifbEarlyRedirectTimer) {
                    window.clearTimeout(window.__ifbEarlyRedirectTimer);
                    window.__ifbEarlyRedirectTimer = null;
                }
                return;
            }
            var eventState = (event && typeof event === 'object' ? (event.state || {}) : {}) || {};
            var hasGuardState = eventState.ifbEarly === true && eventState.token === token;
            if (event && event.type === 'popstate' && !hasGuardState) {
                refill(true);
                return;
            }
            window.__ifbEarlyBackAttempt = true;
            refill(true);
            if (window.__ifoodBackRedirectInit) return;
            if (window.__ifbEarlyRedirectTimer) return;

            window.__ifbEarlyRedirectTimer = window.setTimeout(function () {
                window.__ifbEarlyRedirectTimer = null;
                if (window.__ifbAllowUnload) return;
                if (isMainBackGuardActive()) return;
                if (window.__ifoodBackRedirectInit) return;

                var target = resolveDistinctEarlyBackTarget();
                var targetPath = normalizePath(target);
                if (!targetPath) return;

                window.__ifbAllowUnload = true;
                window.location.replace(target);
            }, 220);
        };

        refill(true);

        window.addEventListener('popstate', runBackRedirect);
        window.addEventListener('pageshow', function () {
            if (window.__ifbAllowUnload) return;
            if (isMainBackGuardActive()) return;
            refill(false);
        });
        window.addEventListener('hashchange', function () {
            if (window.__ifbAllowUnload) return;
            if (isMainBackGuardActive()) return;
            refill(true);
        });
        window.addEventListener('focus', function () {
            if (window.__ifbAllowUnload) return;
            if (isMainBackGuardActive()) return;
            refill(false);
        });
        window.addEventListener('visibilitychange', function () {
            if (window.__ifbAllowUnload) return;
            if (isMainBackGuardActive()) return;
            if (document.visibilityState === 'visible') refill(false);
        });
    } catch (_error) {
        // Ignore browser restrictions around History API.
    }
})();
