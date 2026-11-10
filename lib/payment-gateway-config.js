const DEFAULT_GHOSTSPAY_BASE_URL = 'https://api.ghostspaysv2.com/functions/v1';
const DEFAULT_SUNIZE_BASE_URL = 'https://api.sunize.com.br/v1';
const DEFAULT_PARADISE_BASE_URL = 'https://multi.paradisepags.com';
const DEFAULT_ATOMOPAY_BASE_URL = 'https://api.atomopay.com.br/api/public/v1';
const DEFAULT_BRAVOPAY_BASE_URL = 'https://bravopay.club/api/v1';
const DEFAULT_CLOWNPAY_BASE_URL = 'https://app.clownspay.com';
const DEFAULT_PINGUPAG_BASE_URL = 'https://api.pingupag.com';
const DEFAULT_LUMEAPAG_BASE_URL = 'https://lumeapag.com/api';
const DEFAULT_ACTIVE_GATEWAY = 'ghostspay';
const ACTIVE_PAYMENT_GATEWAYS = ['ghostspay', 'sunize', 'paradise', 'atomopay', 'bravopay', 'clownpay', 'pingupag', 'lumeapag'];
const LEGACY_PAYMENT_GATEWAYS = ['ativushub'];
const SUPPORTED_GATEWAYS = new Set([...ACTIVE_PAYMENT_GATEWAYS, ...LEGACY_PAYMENT_GATEWAYS]);
const ACTIVE_GATEWAY_FALLBACKS = {
    lumeapag: ['lumeapag', 'pingupag', 'paradise', 'ghostspay', 'sunize', 'atomopay', 'bravopay', 'clownpay'],
    clownpay: ['clownpay', 'ghostspay', 'sunize', 'paradise', 'atomopay', 'bravopay', 'pingupag', 'lumeapag'],
    pingupag: ['pingupag', 'lumeapag', 'paradise', 'ghostspay', 'sunize', 'atomopay', 'bravopay', 'clownpay'],
    ghostspay: ['ghostspay', 'sunize', 'paradise', 'atomopay', 'bravopay', 'pingupag', 'lumeapag'],
    sunize: ['sunize', 'ghostspay', 'paradise', 'atomopay', 'bravopay', 'pingupag', 'lumeapag'],
    paradise: ['paradise', 'pingupag', 'lumeapag', 'ghostspay', 'sunize', 'atomopay', 'bravopay'],
    atomopay: ['atomopay', 'ghostspay', 'sunize', 'paradise', 'bravopay', 'pingupag', 'lumeapag'],
    bravopay: ['bravopay', 'ghostspay', 'sunize', 'paradise', 'atomopay', 'pingupag', 'lumeapag']
};

function toText(value) {
    return String(value || '').trim();
}

function envBoolean(name, fallback = false) {
    const raw = toText(process.env[name]).toLowerCase();
    if (!raw) return fallback;
    return raw === '1' || raw === 'true' || raw === 'yes' || raw === 'on';
}

function looksLikeBase64Token(value) {
    const text = toText(value);
    if (!text || text.length < 8) return false;
    if (!/^[A-Za-z0-9+/=]+$/.test(text)) return false;
    return text.length % 4 === 0;
}

function removeBasicPrefix(value) {
    const text = toText(value);
    if (!text) return '';
    if (text.toLowerCase().startsWith('basic ')) {
        return text.slice(6).trim();
    }
    return text;
}

function toBase64(value) {
    return Buffer.from(String(value || ''), 'utf8').toString('base64');
}

function normalizeGatewayAlias(value) {
    const raw = toText(value).toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!raw) return '';
    const aliases = {
        ativus: 'ativushub',
        ativushub: 'ativushub',
        ghostspay: 'ghostspay',
        ghostpay: 'ghostspay',
        ghosts: 'ghostspay',
        sunize: 'sunize',
        sunizepay: 'sunize',
        clownpay: 'clownpay',
        clownspay: 'clownpay',
        pingupag: 'pingupag',
        pingu: 'pingupag',
        pingupags: 'pingupag',
        pingupay: 'pingupag',
        paradise: 'paradise',
        paradisepix: 'paradise',
        paradisepags: 'paradise',
        paradisepay: 'paradise',
        atomopay: 'atomopay',
        atomopaypix: 'atomopay',
        atomopix: 'atomopay',
        atomo: 'atomopay',
        bravopay: 'bravopay',
        bravo: 'bravopay',
        bravopix: 'bravopay',
        bravopaypix: 'bravopay',
        lumeapag: 'lumeapag',
        lumea: 'lumeapag',
        lumeapags: 'lumeapag',
        lumeapay: 'lumeapag',
        lumeapix: 'lumeapag'
    };
    return aliases[raw] || raw;
}

function normalizeActiveGatewayId(value, fallback = DEFAULT_ACTIVE_GATEWAY) {
    const normalized = normalizeGatewayAlias(value);
    if (ACTIVE_PAYMENT_GATEWAYS.includes(normalized)) return normalized;
    const fallbackNormalized = normalizeGatewayAlias(fallback);
    return ACTIVE_PAYMENT_GATEWAYS.includes(fallbackNormalized) ? fallbackNormalized : DEFAULT_ACTIVE_GATEWAY;
}

function normalizeGatewayId(value, fallback = DEFAULT_ACTIVE_GATEWAY) {
    const normalized = normalizeGatewayAlias(value);
    if (SUPPORTED_GATEWAYS.has(normalized)) return normalized;
    const fallbackNormalized = normalizeGatewayAlias(fallback);
    if (!fallbackNormalized) return '';
    return normalizeActiveGatewayId(fallback);
}

function isLegacyGateway(gateway) {
    return LEGACY_PAYMENT_GATEWAYS.includes(normalizeGatewayAlias(gateway));
}

function getGatewayPriority(requested, fallback = DEFAULT_ACTIVE_GATEWAY) {
    const primary = normalizeActiveGatewayId(requested, fallback);
    const priority = ACTIVE_GATEWAY_FALLBACKS[primary] || ACTIVE_GATEWAY_FALLBACKS[DEFAULT_ACTIVE_GATEWAY];
    return [...new Set([...(priority || []), ...ACTIVE_PAYMENT_GATEWAYS])];
}

function normalizeGatewayOrder(value, fallback = DEFAULT_ACTIVE_GATEWAY) {
    const rawList = Array.isArray(value)
        ? value
        : String(value || '')
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean);
    const order = [];
    for (const item of rawList) {
        const normalized = normalizeGatewayAlias(item);
        if (ACTIVE_PAYMENT_GATEWAYS.includes(normalized) && !order.includes(normalized)) {
            order.push(normalized);
        }
    }
    const fallbackPriority = getGatewayPriority(fallback, fallback);
    return [...new Set([...order, ...fallbackPriority, ...ACTIVE_PAYMENT_GATEWAYS])];
}

function buildGhostspayConfig(raw = {}) {
    const settingsBasic = removeBasicPrefix(raw.basicAuth || raw.apiKeyBase64 || raw.token);
    const envBasic = removeBasicPrefix(process.env.GHOSTSPAY_BASIC_AUTH || process.env.GHOSTSPAY_API_KEY_BASE64 || '');
    const secretKey = toText(raw.secretKey) || toText(process.env.GHOSTSPAY_SECRET_KEY);
    const companyId = toText(raw.companyId) || toText(process.env.GHOSTSPAY_COMPANY_ID);
    const basicAuthBase64 = settingsBasic || envBasic;

    const webhookToken = toText(raw.webhookToken) || toText(process.env.GHOSTSPAY_WEBHOOK_TOKEN);

    return {
        enabled: raw.enabled === true || envBoolean('GHOSTSPAY_ENABLED', false),
        baseUrl: toText(raw.baseUrl) || toText(process.env.GHOSTSPAY_BASE_URL) || DEFAULT_GHOSTSPAY_BASE_URL,
        basicAuthBase64,
        secretKey,
        companyId,
        postbackUrl: toText(raw.postbackUrl) || toText(process.env.GHOSTSPAY_POSTBACK_URL),
        webhookToken,
        webhookTokenRequired: raw.webhookTokenRequired !== undefined
            ? !!raw.webhookTokenRequired
            : envBoolean('GHOSTSPAY_WEBHOOK_TOKEN_REQUIRED', false),
        timeoutMs: Number(raw.timeoutMs || process.env.GHOSTSPAY_TIMEOUT_MS || 12000)
    };
}

function buildSunizeConfig(raw = {}) {
    const webhookToken = toText(raw.webhookToken) || toText(process.env.SUNIZE_WEBHOOK_TOKEN);
    return {
        enabled: raw.enabled === true || envBoolean('SUNIZE_ENABLED', false),
        baseUrl: toText(raw.baseUrl) || toText(process.env.SUNIZE_BASE_URL) || DEFAULT_SUNIZE_BASE_URL,
        apiKey:
            toText(raw.apiKey) ||
            toText(raw.xApiKey) ||
            toText(process.env.SUNIZE_API_KEY),
        apiSecret:
            toText(raw.apiSecret) ||
            toText(raw.xApiSecret) ||
            toText(process.env.SUNIZE_API_SECRET),
        postbackUrl: toText(raw.postbackUrl) || toText(process.env.SUNIZE_POSTBACK_URL),
        webhookToken,
        webhookTokenRequired: raw.webhookTokenRequired !== undefined
            ? !!raw.webhookTokenRequired
            : envBoolean('SUNIZE_WEBHOOK_TOKEN_REQUIRED', false),
        timeoutMs: Number(raw.timeoutMs || process.env.SUNIZE_TIMEOUT_MS || 12000)
    };
}

function buildParadiseConfig(raw = {}) {
    const webhookToken = toText(raw.webhookToken) || toText(process.env.PARADISE_WEBHOOK_TOKEN);
    const apiKey = toText(raw.apiKey) || toText(raw.xApiKey) || toText(process.env.PARADISE_API_KEY);
    const productHash = toText(raw.productHash) || toText(process.env.PARADISE_PRODUCT_HASH);
    const source = toText(raw.source) || toText(process.env.PARADISE_SOURCE) || (productHash ? '' : 'api_externa');

    return {
        enabled: raw.enabled === true || envBoolean('PARADISE_ENABLED', false),
        baseUrl: toText(raw.baseUrl) || toText(process.env.PARADISE_BASE_URL) || DEFAULT_PARADISE_BASE_URL,
        apiKey,
        productHash,
        source,
        orderbumpHash: toText(raw.orderbumpHash) || toText(process.env.PARADISE_ORDERBUMP_HASH),
        description: toText(raw.description) || toText(process.env.PARADISE_DESCRIPTION),
        postbackUrl: toText(raw.postbackUrl) || toText(process.env.PARADISE_POSTBACK_URL),
        webhookToken,
        webhookTokenRequired: raw.webhookTokenRequired !== undefined
            ? !!raw.webhookTokenRequired
            : envBoolean('PARADISE_WEBHOOK_TOKEN_REQUIRED', false),
        timeoutMs: Number(raw.timeoutMs || process.env.PARADISE_TIMEOUT_MS || 12000)
    };
}

function buildPingupagConfig(raw = {}) {
    const webhookToken = toText(raw.webhookToken) || toText(process.env.PINGUPAG_WEBHOOK_TOKEN);
    const apiKey = toText(raw.apiKey) || toText(raw.xApiKey) || toText(process.env.PINGUPAG_API_KEY);
    const productHash = toText(raw.productHash) || toText(process.env.PINGUPAG_PRODUCT_HASH);
    const source = toText(raw.source) || toText(process.env.PINGUPAG_SOURCE) || (productHash ? '' : 'api_externa');

    return {
        gateway: 'pingupag',
        enabled: raw.enabled === true || envBoolean('PINGUPAG_ENABLED', false),
        baseUrl: toText(raw.baseUrl) || toText(process.env.PINGUPAG_BASE_URL) || DEFAULT_PINGUPAG_BASE_URL,
        apiKey,
        productHash,
        source,
        orderbumpHash: toText(raw.orderbumpHash) || toText(process.env.PINGUPAG_ORDERBUMP_HASH),
        description: toText(raw.description) || toText(process.env.PINGUPAG_DESCRIPTION),
        postbackUrl: toText(raw.postbackUrl) || toText(process.env.PINGUPAG_POSTBACK_URL),
        webhookToken,
        webhookTokenRequired: raw.webhookTokenRequired !== undefined
            ? !!raw.webhookTokenRequired
            : envBoolean('PINGUPAG_WEBHOOK_TOKEN_REQUIRED', false),
        timeoutMs: Number(raw.timeoutMs || process.env.PINGUPAG_TIMEOUT_MS || 12000)
    };
}

function buildLumeapagConfig(raw = {}) {
    const webhookToken = toText(raw.webhookToken) || toText(process.env.LUMEAPAG_WEBHOOK_TOKEN);
    const apiKey = toText(raw.apiKey) || toText(raw.xApiKey) || toText(process.env.LUMEAPAG_API_KEY);
    const productHash = toText(raw.productHash) || toText(process.env.LUMEAPAG_PRODUCT_HASH);
    const source = toText(raw.source) || toText(process.env.LUMEAPAG_SOURCE) || (productHash ? '' : 'api_externa');

    return {
        gateway: 'lumeapag',
        enabled: raw.enabled === true || envBoolean('LUMEAPAG_ENABLED', false),
        baseUrl: toText(raw.baseUrl) || toText(process.env.LUMEAPAG_BASE_URL) || DEFAULT_LUMEAPAG_BASE_URL,
        apiKey,
        productHash,
        source,
        orderbumpHash: toText(raw.orderbumpHash) || toText(process.env.LUMEAPAG_ORDERBUMP_HASH),
        description: toText(raw.description) || toText(process.env.LUMEAPAG_DESCRIPTION),
        postbackUrl: toText(raw.postbackUrl) || toText(process.env.LUMEAPAG_POSTBACK_URL),
        webhookToken,
        webhookTokenRequired: raw.webhookTokenRequired !== undefined
            ? !!raw.webhookTokenRequired
            : envBoolean('LUMEAPAG_WEBHOOK_TOKEN_REQUIRED', false),
        timeoutMs: Number(raw.timeoutMs || process.env.LUMEAPAG_TIMEOUT_MS || 12000)
    };
}

function buildClownPayConfig(raw = {}) {
    const webhookToken = toText(raw.webhookToken) || toText(process.env.CLOWNPAY_WEBHOOK_TOKEN);
    const apiKey = toText(raw.apiKey) || toText(raw.xApiKey) || toText(process.env.CLOWNPAY_API_KEY);
    const productHash = toText(raw.productHash) || toText(process.env.CLOWNPAY_PRODUCT_HASH);
    const source = toText(raw.source) || toText(process.env.CLOWNPAY_SOURCE) || (productHash ? '' : 'api_externa');

    return {
        gateway: 'clownpay',
        subaccountApiKey: toText(raw.subaccountApiKey),
        enabled: raw.enabled === true || envBoolean('CLOWNPAY_ENABLED', false),
        baseUrl: toText(raw.baseUrl) || toText(process.env.CLOWNPAY_BASE_URL) || DEFAULT_CLOWNPAY_BASE_URL,
        apiKey,
        productHash,
        source,
        orderbumpHash: toText(raw.orderbumpHash) || toText(process.env.CLOWNPAY_ORDERBUMP_HASH),
        description: toText(raw.description) || toText(process.env.CLOWNPAY_DESCRIPTION),
        postbackUrl: toText(raw.postbackUrl) || toText(process.env.CLOWNPAY_POSTBACK_URL),
        webhookToken,
        webhookTokenRequired: raw.webhookTokenRequired !== undefined
            ? !!raw.webhookTokenRequired
            : envBoolean('CLOWNPAY_WEBHOOK_TOKEN_REQUIRED', false),
        timeoutMs: Number(raw.timeoutMs || process.env.CLOWNPAY_TIMEOUT_MS || 12000)
    };
}

function buildAtomopayConfig(raw = {}) {
    const webhookToken =
        toText(raw.webhookToken) ||
        toText(raw.webhook_token) ||
        toText(process.env.ATOMOPAY_WEBHOOK_TOKEN);
    return {
        enabled: raw.enabled === true || envBoolean('ATOMOPAY_ENABLED', false),
        baseUrl: toText(raw.baseUrl) || toText(process.env.ATOMOPAY_BASE_URL) || DEFAULT_ATOMOPAY_BASE_URL,
        apiToken:
            toText(raw.apiToken) ||
            toText(raw.api_token) ||
            toText(raw.token) ||
            toText(process.env.ATOMOPAY_API_TOKEN),
        offerHash:
            toText(raw.offerHash) ||
            toText(raw.offer_hash) ||
            toText(process.env.ATOMOPAY_OFFER_HASH),
        productHash:
            toText(raw.productHash) ||
            toText(raw.product_hash) ||
            toText(process.env.ATOMOPAY_PRODUCT_HASH),
        iofOfferHash:
            toText(raw.iofOfferHash) ||
            toText(raw.iof_offer_hash) ||
            toText(process.env.ATOMOPAY_IOF_OFFER_HASH),
        iofProductHash:
            toText(raw.iofProductHash) ||
            toText(raw.iof_product_hash) ||
            toText(process.env.ATOMOPAY_IOF_PRODUCT_HASH),
        correiosOfferHash:
            toText(raw.correiosOfferHash) ||
            toText(raw.correios_offer_hash) ||
            toText(process.env.ATOMOPAY_CORREIOS_OFFER_HASH),
        correiosProductHash:
            toText(raw.correiosProductHash) ||
            toText(raw.correios_product_hash) ||
            toText(process.env.ATOMOPAY_CORREIOS_PRODUCT_HASH),
        expressoOfferHash:
            toText(raw.expressoOfferHash) ||
            toText(raw.expresso_offer_hash) ||
            toText(process.env.ATOMOPAY_EXPRESSO_OFFER_HASH),
        expressoProductHash:
            toText(raw.expressoProductHash) ||
            toText(raw.expresso_product_hash) ||
            toText(process.env.ATOMOPAY_EXPRESSO_PRODUCT_HASH),
        postbackUrl:
            toText(raw.postbackUrl) ||
            toText(raw.postback_url) ||
            toText(process.env.ATOMOPAY_POSTBACK_URL),
        webhookToken,
        webhookTokenRequired: raw.webhookTokenRequired !== undefined
            ? !!raw.webhookTokenRequired
            : envBoolean('ATOMOPAY_WEBHOOK_TOKEN_REQUIRED', true),
        timeoutMs: Number(raw.timeoutMs || process.env.ATOMOPAY_TIMEOUT_MS || 12000)
    };
}

function buildBravoPayConfig(raw = {}) {
    const webhookSecret =
        toText(raw.webhookSecret) ||
        toText(raw.webhook_secret) ||
        toText(raw.webhookToken);
    return {
        enabled: raw.enabled === true,
        baseUrl:
            toText(raw.baseUrl) ||
            toText(raw.base_url) ||
            DEFAULT_BRAVOPAY_BASE_URL,
        apiKey:
            toText(raw.apiKey) ||
            toText(raw.api_key) ||
            toText(raw.token),
        webhookSecret,
        webhookToken: webhookSecret,
        webhookTokenRequired: raw.webhookTokenRequired !== undefined
            ? !!raw.webhookTokenRequired
            : true,
        timeoutMs: Number(raw.timeoutMs || 12000),
        expiresIn: Number(raw.expiresIn || raw.expires_in || 3600),
        description:
            toText(raw.description)
    };
}

function buildEnabledGatewaysMap(payments = {}) {
    const gateways = payments && typeof payments === 'object' ? (payments.gateways || {}) : {};
    return {
        ghostspay: gateways.ghostspay?.enabled === true,
        sunize: gateways.sunize?.enabled === true,
        clownpay: gateways.clownpay?.enabled === true,
        paradise: gateways.paradise?.enabled === true,
        pingupag: gateways.pingupag?.enabled === true,
        lumeapag: gateways.lumeapag?.enabled === true,
        atomopay: gateways.atomopay?.enabled === true,
        bravopay: gateways.bravopay?.enabled === true
    };
}

function resolveGatewayWithFallback(requested, payments = {}, options = {}) {
    const activeGateway = normalizeActiveGatewayId(
        options.fallback || payments?.activeGateway || DEFAULT_ACTIVE_GATEWAY,
        DEFAULT_ACTIVE_GATEWAY
    );
    const enabledByGateway = options.enabledByGateway || buildEnabledGatewaysMap(payments);
    const allowDisabled = options.allowDisabled === true;
    const configuredOrder = normalizeGatewayOrder(payments?.gatewayOrder || [], activeGateway);
    const requestedGateway = requested
        ? normalizeActiveGatewayId(requested, activeGateway)
        : '';
    const priority = requestedGateway
        ? [...new Set([requestedGateway, ...configuredOrder])]
        : configuredOrder;

    for (const gateway of priority) {
        if (allowDisabled || enabledByGateway[gateway]) {
            return gateway;
        }
    }

    return activeGateway;
}

function buildPaymentsConfig(raw = {}) {
    const gatewaysRaw = raw && typeof raw === 'object' ? (raw.gateways || {}) : {};
    const ghostspay = buildGhostspayConfig(gatewaysRaw.ghostspay || raw.ghostspay || {});
    const sunize = buildSunizeConfig(gatewaysRaw.sunize || raw.sunize || {});
    const clownpay = buildClownPayConfig(gatewaysRaw.clownpay || raw.clownpay || {});
    const paradise = buildParadiseConfig(gatewaysRaw.paradise || raw.paradise || {});
    const pingupag = buildPingupagConfig(gatewaysRaw.pingupag || raw.pingupag || {});
    const lumeapag = buildLumeapagConfig(gatewaysRaw.lumeapag || raw.lumeapag || {});
    const atomopay = buildAtomopayConfig(gatewaysRaw.atomopay || raw.atomopay || {});
    const bravopay = buildBravoPayConfig(gatewaysRaw.bravopay || raw.bravopay || {});
    const rawActiveGateway = normalizeActiveGatewayId(raw.activeGateway || process.env.PAYMENTS_ACTIVE_GATEWAY || DEFAULT_ACTIVE_GATEWAY);
    const gatewayOrder = normalizeGatewayOrder(raw.gatewayOrder || raw.priority || [], rawActiveGateway);

    const payments = {
        activeGateway: rawActiveGateway,
        gatewayOrder,
        gateways: {
            ghostspay,
            sunize,
            clownpay,
            paradise,
            pingupag,
            lumeapag,
            atomopay,
            bravopay
        }
    };

    const enabledByGateway = buildEnabledGatewaysMap(payments);
    payments.activeGateway = resolveGatewayWithFallback('', payments, { enabledByGateway });
    return payments;
}

function resolveGatewayFromPayload(payload = {}, fallback = DEFAULT_ACTIVE_GATEWAY) {
    const p = payload && typeof payload === 'object' ? payload : {};
    const candidates = [
        p.gateway,
        p.provider,
        p.pixGateway,
        p.paymentGateway,
        p.pix?.gateway,
        p.atomopay?.gateway,
        p.bravopay?.gateway,
        p.lumeapag?.gateway,
        p.metadata?.gateway,
        p.payload?.gateway,
        p.payload?.pixGateway
    ];
    for (const candidate of candidates) {
        const normalized = normalizeGatewayAlias(candidate);
        if (SUPPORTED_GATEWAYS.has(normalized)) return normalized;
    }
    if (p.atomopay && typeof p.atomopay === 'object' && String(p.atomopay.hash || p.atomopay.transaction_hash || '').trim()) {
        return 'atomopay';
    }
    if (p.bravopay && typeof p.bravopay === 'object' && String(p.bravopay.id || p.bravopay.transactionId || '').trim()) {
        return 'bravopay';
    }
    return normalizeGatewayId('', fallback);
}

function mergePaymentSettings(base = {}, incoming = {}) {
    const merged = {
        ...base,
        ...incoming
    };
    return buildPaymentsConfig(merged);
}

module.exports = {
    DEFAULT_ACTIVE_GATEWAY,
    DEFAULT_GHOSTSPAY_BASE_URL,
    DEFAULT_SUNIZE_BASE_URL,
    DEFAULT_PARADISE_BASE_URL,
    DEFAULT_PINGUPAG_BASE_URL,
    DEFAULT_ATOMOPAY_BASE_URL,
    DEFAULT_BRAVOPAY_BASE_URL,
    ACTIVE_PAYMENT_GATEWAYS,
    LEGACY_PAYMENT_GATEWAYS,
    ACTIVE_GATEWAY_FALLBACKS,
    SUPPORTED_GATEWAYS,
    toText,
    envBoolean,
    looksLikeBase64Token,
    removeBasicPrefix,
    toBase64,
    normalizeGatewayAlias,
    normalizeGatewayId,
    normalizeActiveGatewayId,
    normalizeGatewayOrder,
    isLegacyGateway,
    getGatewayPriority,
    buildGhostspayConfig,
    buildSunizeConfig,
    buildClownPayConfig,
    DEFAULT_CLOWNPAY_BASE_URL,
    buildParadiseConfig,
    buildPingupagConfig,
    buildAtomopayConfig,
    buildBravoPayConfig,
    buildEnabledGatewaysMap,
    resolveGatewayWithFallback,
    buildPaymentsConfig,
    mergePaymentSettings,
    resolveGatewayFromPayload
};
