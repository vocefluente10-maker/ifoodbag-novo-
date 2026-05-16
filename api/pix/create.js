const { upsertLead, getLeadBySessionId } = require('../../lib/lead-store');
const { ensurePublicAccess } = require('../../lib/public-access');
const { enqueueDispatch, processDispatchQueue } = require('../../lib/dispatch-queue');
const {
    normalizeGatewayOrder,
    normalizeActiveGatewayId,
    normalizeGatewayId
} = require('../../lib/payment-gateway-config');
const { getPaymentsConfig } = require('../../lib/payments-config-store');
const {
    requestCreateTransaction: requestGhostspayCreate,
    requestTransactionById: requestGhostspayStatus,
    resolvePostbackUrl: resolveGhostspayPostbackUrl
} = require('../../lib/ghostspay-provider');
const {
    requestCreateTransaction: requestSunizeCreate,
    requestTransactionById: requestSunizeStatus
} = require('../../lib/sunize-provider');
const { getSunizeStatus } = require('../../lib/sunize-status');
const {
    requestCreateTransaction: requestParadiseCreate,
    requestTransactionById: requestParadiseStatus,
    resolvePostbackUrl: resolveParadisePostbackUrl
} = require('../../lib/paradise-provider');
const { getParadiseStatus } = require('../../lib/paradise-status');
const {
    requestCreateTransaction: requestAtomopayCreate,
    requestTransactionById: requestAtomopayStatus,
    resolvePostbackUrl: resolveAtomopayPostbackUrl
} = require('../../lib/atomopay-provider');
const {
    describeAtomopayPayload,
    getAtomopayStatus,
    resolveAtomopayPixPayload
} = require('../../lib/atomopay-status');
const { mergePaymentHistory } = require('../../lib/lead-payment-history');

function resolveGateway(rawBody = {}, payments = {}) {
    const candidates = resolveGatewayCandidates(rawBody, payments);
    return candidates[0] || '';
}

function resolveGatewayCandidates(rawBody = {}, payments = {}) {
    const requested = rawBody.gateway || rawBody.paymentGateway || '';
    const configuredOrder = normalizeGatewayOrder(payments.gatewayOrder || [], payments.activeGateway);
    const priority = requested
        ? [...new Set([normalizeActiveGatewayId(requested, payments.activeGateway), ...configuredOrder])]
        : configuredOrder;
    const isEnabled = (gateway) => (payments?.gateways?.[gateway] || {}).enabled === true;
    const hasGatewayCredentials = (gateway) => {
        const config = payments?.gateways?.[gateway] || {};
        if (gateway === 'ghostspay') return hasGhostspayCredentials(config);
        if (gateway === 'sunize') return hasSunizeCredentials(config);
        if (gateway === 'paradise') return hasParadiseCredentials(config);
        if (gateway === 'atomopay') return hasAtomopayCredentials(config);
        return false;
    };

    const enabledWithCredentials = [];
    for (const gateway of priority) {
        if (isEnabled(gateway) && hasGatewayCredentials(gateway)) {
            enabledWithCredentials.push(gateway);
        }
    }
    if (enabledWithCredentials.length > 0) {
        return enabledWithCredentials;
    }

    const enabledGateways = [];
    for (const gateway of priority) {
        if (isEnabled(gateway)) enabledGateways.push(gateway);
    }
    if (enabledGateways.length > 0) {
        return enabledGateways;
    }

    const allDisabled = priority.every((gateway) => !isEnabled(gateway));
    if (allDisabled) {
        const operationalFallback = ['ghostspay', 'sunize', 'paradise', 'atomopay'];
        const credentialFallbacks = [];
        for (const gateway of operationalFallback) {
            if (hasGatewayCredentials(gateway)) credentialFallbacks.push(gateway);
        }
        return credentialFallbacks.length > 0 ? credentialFallbacks : ['ghostspay'];
    }

    return [];
}

function hasGhostspayCredentials(config = {}) {
    return Boolean(
        String(config.basicAuthBase64 || '').trim() ||
        (String(config.secretKey || '').trim() && String(config.companyId || '').trim())
    );
}

function hasSunizeCredentials(config = {}) {
    return Boolean(
        String(config.apiKey || '').trim() &&
        String(config.apiSecret || '').trim()
    );
}

function hasParadiseCredentials(config = {}) {
    return Boolean(String(config.apiKey || '').trim());
}

function hasAtomopayCredentials(config = {}) {
    return Boolean(
        String(config.apiToken || '').trim() &&
        String(config.offerHash || '').trim() &&
        String(config.productHash || '').trim()
    );
}

function sanitizeDigits(value = '') {
    return String(value || '').replace(/\D/g, '');
}

function extractIp(req) {
    const forwarded = req?.headers?.['x-forwarded-for'];
    if (typeof forwarded === 'string' && forwarded.length > 0) {
        return forwarded.split(',')[0].trim();
    }
    return req?.socket?.remoteAddress || '';
}

function toE164Phone(value = '') {
    const digits = String(value || '').replace(/\D/g, '');
    if (!digits) return '';
    if (digits.startsWith('55') && digits.length >= 12) {
        return `+${digits}`;
    }
    return `+55${digits}`;
}

function resolveDocumentType(document = '') {
    const digits = String(document || '').replace(/\D/g, '');
    return digits.length > 11 ? 'CNPJ' : 'CPF';
}

function pickText(...values) {
    for (const value of values) {
        if (value === undefined || value === null) continue;
        const text = String(value).trim();
        if (text) return text;
    }
    return '';
}

function buildSunizeUtmFields(rawBody = {}) {
    const fields = {
        utm_source: pickText(rawBody?.utm?.utm_source, rawBody?.utm_source),
        utm_medium: pickText(rawBody?.utm?.utm_medium, rawBody?.utm_medium),
        utm_campaign: pickText(rawBody?.utm?.utm_campaign, rawBody?.utm_campaign),
        utm_term: pickText(rawBody?.utm?.utm_term, rawBody?.utm_term),
        utm_content: pickText(rawBody?.utm?.utm_content, rawBody?.utm_content),
        src: pickText(rawBody?.utm?.src, rawBody?.src),
        sck: pickText(rawBody?.utm?.sck, rawBody?.sck),
        fbclid: pickText(rawBody?.utm?.fbclid, rawBody?.fbclid),
        gclid: pickText(rawBody?.utm?.gclid, rawBody?.gclid),
        ttclid: pickText(rawBody?.utm?.ttclid, rawBody?.ttclid)
    };
    return Object.fromEntries(Object.entries(fields).filter(([, value]) => Boolean(String(value || '').trim())));
}

function buildAtomopayTrackingFields(rawBody = {}) {
    const fields = {
        src: pickText(rawBody?.utm?.src, rawBody?.src),
        utm_source: pickText(rawBody?.utm?.utm_source, rawBody?.utm_source),
        utm_medium: pickText(rawBody?.utm?.utm_medium, rawBody?.utm_medium),
        utm_campaign: pickText(rawBody?.utm?.utm_campaign, rawBody?.utm_campaign),
        utm_term: pickText(rawBody?.utm?.utm_term, rawBody?.utm_term),
        utm_content: pickText(rawBody?.utm?.utm_content, rawBody?.utm_content)
    };
    return Object.fromEntries(Object.entries(fields).filter(([, value]) => Boolean(String(value || '').trim())));
}

function resolveAtomopayProductConfig(gatewayConfig = {}, shipping = {}, upsellEnabled = false, upsell = null) {
    const shippingId = String(shipping?.id || '').trim().toLowerCase();
    const upsellKind = String(upsell?.kind || '').trim().toLowerCase();
    const useIof = shippingId === 'taxa_iof_bag' || upsellKind === 'taxa_iof_bag';
    const useCorreios = shippingId === 'taxa_objeto_grande_correios' || upsellKind === 'taxa_objeto_grande_correios';
    const useExpresso = shippingId === 'expresso_1dia' || upsellKind === 'expresso_1dia' || (upsellEnabled && upsellKind === 'frete_1dia');

    let offerHash = String(gatewayConfig.offerHash || '').trim();
    let productHash = String(gatewayConfig.productHash || '').trim();
    let variant = 'base';

    if (useIof) {
        offerHash = String(gatewayConfig.iofOfferHash || offerHash).trim();
        productHash = String(gatewayConfig.iofProductHash || productHash).trim();
        variant = 'iof';
    } else if (useCorreios) {
        offerHash = String(gatewayConfig.correiosOfferHash || offerHash).trim();
        productHash = String(gatewayConfig.correiosProductHash || productHash).trim();
        variant = 'correios';
    } else if (useExpresso) {
        offerHash = String(gatewayConfig.expressoOfferHash || offerHash).trim();
        productHash = String(gatewayConfig.expressoProductHash || productHash).trim();
        variant = 'expresso';
    }

    return {
        offerHash,
        productHash,
        variant
    };
}

const ATOMOPAY_PUBLIC_PRODUCT_NAME = 'Formula Revitalizante';

function resolveAtomopayItemTitle() {
    return ATOMOPAY_PUBLIC_PRODUCT_NAME;
}

function resolveAtomopayCustomerName(value = '') {
    const text = String(value || '').trim();
    if (!text || /^cliente\s+ifood$/i.test(text)) {
        return `Cliente ${ATOMOPAY_PUBLIC_PRODUCT_NAME}`;
    }
    return text.replace(/\bifood\b/gi, ATOMOPAY_PUBLIC_PRODUCT_NAME);
}

function resolveAtomopayCustomerEmail(value = '') {
    const text = String(value || '').trim();
    if (!text) return text;
    return text.replace(/@ifoodbag\.app$/i, '@formularevitalizante.app');
}

function redactUrlSecrets(value = '') {
    const text = String(value || '').trim();
    if (!text) return '';
    try {
        const url = new URL(text);
        ['token', 'api_token', 'apiToken', 'secret'].forEach((key) => {
            if (url.searchParams.has(key)) url.searchParams.set(key, '__SECRET_SET__');
        });
        return url.toString();
    } catch (_error) {
        return text.replace(/([?&](?:token|api_token|apiToken|secret)=)[^&]+/gi, '$1__SECRET_SET__');
    }
}

function sanitizeAtomopayCreatePayload(payload = {}) {
    const body = asObject(payload);
    return {
        ...body,
        postback_url: redactUrlSecrets(body.postback_url)
    };
}

function sanitizeAtomopayCreateResponse(data = {}) {
    const root = asObject(data);
    const nested = asObject(root.data);
    const source = Object.keys(nested).length ? nested : root;
    return {
        success: root.success,
        hash: pickText(source.hash, root.hash, root.transaction_hash, root.transactionHash),
        status: pickText(source.status, root.status),
        amount: source.amount ?? root.amount ?? null,
        payment_method: pickText(source.payment_method, source.paymentMethod, root.payment_method, root.paymentMethod),
        qr_code: pickText(source.qr_code, source.qrCode, root.qr_code, root.qrCode),
        pix_code: pickText(source.pix_code, source.pixCode, root.pix_code, root.pixCode),
        expires_at: pickText(source.expires_at, source.expiresAt, root.expires_at, root.expiresAt),
        created_at: pickText(source.created_at, source.createdAt, root.created_at, root.createdAt)
    };
}

function sanitizeEventId(value = '', maxLen = 120) {
    const clean = String(value || '').trim();
    if (!clean) return '';
    return clean.slice(0, maxLen);
}

function sanitizeSessionToken(value = '', maxLen = 48) {
    const clean = String(value || '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');
    if (!clean) return 'session';
    return clean.slice(0, maxLen);
}

function buildAddPaymentInfoEventId(sessionId = '') {
    return `api_${sanitizeSessionToken(sessionId)}`;
}

function toBrlAmount(value) {
    if (value === undefined || value === null || value === '') return 0;
    const raw = String(value).trim();
    if (!raw) return 0;
    const normalized = raw.replace(',', '.');
    const num = Number(normalized);
    if (!Number.isFinite(num)) return 0;
    const hasDecimalMark = /[.,]/.test(raw);
    if (hasDecimalMark) return Number(num.toFixed(2));
    if (Number.isInteger(num) && Math.abs(num) >= 100) {
        return Number((num / 100).toFixed(2));
    }
    return Number(num.toFixed(2));
}

function asObject(input) {
    return input && typeof input === 'object' && !Array.isArray(input) ? input : {};
}

const ECONOMICO_SHIPPING_PRICE = 18.86;
const LEGACY_ECONOMICO_SHIPPING_PRICE = 19.9;

function isEconomicoShipping(shipping = {}) {
    return String(shipping?.id || '').trim().toLowerCase() === 'economico';
}

function normalizeGatewayShippingPrice(shipping = {}, fallbackPrice = 0) {
    const price = toBrlAmount(fallbackPrice);
    if (!isEconomicoShipping(shipping)) return price;

    const base = toBrlAmount(shipping?.basePrice || shipping?.originalPrice || price);
    const hasLegacyValue = (
        Math.abs(base - LEGACY_ECONOMICO_SHIPPING_PRICE) <= 0.01 ||
        Math.abs(price - LEGACY_ECONOMICO_SHIPPING_PRICE) <= 0.01
    );
    if (!hasLegacyValue) return price;

    const discount = Math.max(0, Number((base - price).toFixed(2)));
    return Number(Math.max(0, ECONOMICO_SHIPPING_PRICE - discount).toFixed(2));
}

function normalizeGatewayShippingBasePrice(shipping = {}, shippingPrice = 0) {
    const base = toBrlAmount(shipping?.basePrice || shipping?.originalPrice || shippingPrice);
    if (isEconomicoShipping(shipping) && Math.abs(base - LEGACY_ECONOMICO_SHIPPING_PRICE) <= 0.01) {
        return ECONOMICO_SHIPPING_PRICE;
    }
    return base || toBrlAmount(shippingPrice);
}

const REWARD_CATALOG = {
    bag: {
        id: 'bag',
        name: 'Bag do iFood',
        extraPrice: 0
    },
    bau: {
        id: 'bau',
        name: 'Ba\u00fa do iFood',
        extraPrice: 39.9
    },
    kit_entregador: {
        id: 'kit_entregador',
        name: 'Kit Entregador iFood',
        extraPrice: 97.9
    }
};

function resolveReward(rawReward = null) {
    const source = rawReward && typeof rawReward === 'object' && !Array.isArray(rawReward)
        ? rawReward
        : { id: rawReward };
    const id = pickText(source?.id, source).toLowerCase();
    const reward = REWARD_CATALOG[id] || REWARD_CATALOG.bag;
    return {
        ...reward,
        extraPrice: toBrlAmount(reward.extraPrice)
    };
}

function looksLikePixCopyPaste(value = '') {
    const text = String(value || '').trim();
    if (!text) return false;
    if (text.startsWith('000201') && text.length >= 30) return true;
    return /br\.gov\.bcb\.pix/i.test(text);
}

function resolveGhostspayResponse(data = {}) {
    const root = asObject(data);
    const nested = asObject(root.data);
    const transaction = asObject(root.transaction);
    const payment = asObject(root.payment);
    const pix = asObject(
        root.pix ||
        nested.pix ||
        transaction.pix ||
        payment.pix
    );

    const txid = pickText(
        root.id,
        root.transactionId,
        root.transaction_id,
        root.txid,
        nested.id,
        nested.transactionId,
        nested.transaction_id,
        nested.txid,
        transaction.id,
        payment.id,
        pix.id,
        pix.txid
    );
    let paymentCode = pickText(
        pix.qrcodeText,
        pix.qrCodeText,
        pix.qrcode_text,
        pix.qr_code_text,
        pix.brCode,
        pix.br_code,
        pix.code,
        pix.copyPaste,
        pix.copy_paste,
        pix.emv,
        pix.payload,
        pix.pixCode,
        pix.pix_code,
        root.paymentCode,
        nested.paymentCode,
        root.qrcodeText,
        nested.qrcodeText,
        transaction.qrcodeText,
        payment.qrcodeText,
        root.copyPaste,
        nested.copyPaste
    );
    let qrRaw = pickText(
        pix.qrcode,
        pix.qrCode,
        pix.qrcodeImage,
        pix.qrCodeImage,
        pix.qrcodeBase64,
        pix.qrCodeBase64,
        pix.qr_code_base64,
        pix.image,
        pix.imageBase64,
        pix.base64,
        root.qrcode,
        nested.qrcode,
        root.qrCode,
        nested.qrCode,
        root.qrcodeBase64,
        nested.qrcodeBase64,
        root.qrCodeBase64,
        nested.qrCodeBase64
    );
    const qrUrl = pickText(
        pix.qrcodeUrl,
        pix.qrCodeUrl,
        pix.qrcode_url,
        pix.qr_code_url,
        root.qrcodeUrl,
        nested.qrcodeUrl
    );

    if (!paymentCode && looksLikePixCopyPaste(qrRaw)) {
        paymentCode = qrRaw;
        qrRaw = '';
    }

    let paymentCodeBase64 = '';
    let paymentQrUrl = '';
    if (qrUrl) {
        paymentQrUrl = qrUrl;
    } else if (qrRaw) {
        if (/^https?:\/\//i.test(qrRaw) || qrRaw.startsWith('data:image')) {
            paymentQrUrl = qrRaw;
        } else {
            paymentCodeBase64 = qrRaw;
        }
    }

    const status = pickText(root.status, nested.status, transaction.status, payment.status);
    return { txid, paymentCode, paymentCodeBase64, paymentQrUrl, status };
}

function resolveSunizeResponse(data = {}) {
    const txid = String(
        data?.id ||
        data?.transaction_id ||
        data?.transactionId ||
        data?.data?.id ||
        ''
    ).trim();
    const paymentCode = String(
        data?.pix?.payload ||
        data?.pix?.copyPaste ||
        data?.pix?.copy_paste ||
        data?.pixPayload ||
        ''
    ).trim();
    const qrRaw = String(
        data?.pix?.qrcode ||
        data?.pix?.qrCode ||
        data?.pix?.qr_code ||
        data?.pix?.qrcodeBase64 ||
        data?.pix?.qrCodeBase64 ||
        data?.pix?.qr_code_base64 ||
        ''
    ).trim();
    const qrUrl = String(
        data?.pix?.qrcode_url ||
        data?.pix?.qrCodeUrl ||
        data?.pix?.qr_code_url ||
        ''
    ).trim();
    const externalId = String(data?.external_id || data?.externalId || '').trim();
    const status = getSunizeStatus(data);

    let paymentCodeBase64 = '';
    let paymentQrUrl = '';
    if (qrUrl) {
        paymentQrUrl = qrUrl;
    } else if (qrRaw) {
        if (/^https?:\/\//i.test(qrRaw) || qrRaw.startsWith('data:image')) {
            paymentQrUrl = qrRaw;
        } else {
            paymentCodeBase64 = qrRaw;
        }
    }

    return { txid, paymentCode, paymentCodeBase64, paymentQrUrl, status, externalId };
}

function resolveParadiseResponse(data = {}) {
    const root = asObject(data);
    const nested = asObject(root.data);
    const txid = pickText(
        root.transaction_id,
        root.transactionId,
        nested.transaction_id,
        nested.transactionId,
        root.id,
        nested.id
    );
    const externalId = pickText(
        root.id,
        root.external_id,
        root.externalId,
        root.reference,
        nested.id,
        nested.external_id,
        nested.externalId,
        nested.reference
    );
    const paymentCode = pickText(
        root.qr_code,
        root.pix_code,
        nested.qr_code,
        nested.pix_code
    );
    const qrRaw = pickText(
        root.qr_code_base64,
        root.qrcode_base64,
        root.qrCodeBase64,
        nested.qr_code_base64,
        nested.qrcode_base64,
        nested.qrCodeBase64
    );
    let paymentCodeBase64 = '';
    let paymentQrUrl = '';
    if (qrRaw) {
        if (/^https?:\/\//i.test(qrRaw) || qrRaw.startsWith('data:image')) {
            paymentQrUrl = qrRaw;
        } else {
            paymentCodeBase64 = qrRaw;
        }
    }
    const status = pickText(root.status, nested.status, root.raw_status, nested.raw_status);
    return {
        txid: String(txid || '').trim(),
        paymentCode: String(paymentCode || '').trim(),
        paymentCodeBase64: String(paymentCodeBase64 || '').trim(),
        paymentQrUrl: String(paymentQrUrl || '').trim(),
        status: String(status || '').trim(),
        externalId: String(externalId || '').trim()
    };
}

function resolveAtomopayResponse(data = {}) {
    const resolved = resolveAtomopayPixPayload(data);
    return {
        txid: String(resolved.txid || '').trim(),
        paymentCode: String(resolved.paymentCode || '').trim(),
        paymentCodeBase64: String(resolved.paymentCodeBase64 || '').trim(),
        paymentQrUrl: String(resolved.paymentQrUrl || '').trim(),
        status: String(resolved.status || '').trim(),
        externalId: ''
    };
}

async function hydrateAtomopayVisual(gatewayConfig, txid, attempts = 4) {
    const cleanTxid = String(txid || '').trim();
    if (!cleanTxid) {
        return {
            paymentCode: '',
            paymentCodeBase64: '',
            paymentQrUrl: '',
            status: '',
            externalId: '',
            debug: {
                attempts: []
            }
        };
    }

    let latest = {
        paymentCode: '',
        paymentCodeBase64: '',
        paymentQrUrl: '',
        status: '',
        externalId: '',
        debug: {
            attempts: []
        }
    };
    for (let attempt = 0; attempt < attempts; attempt += 1) {
        const timeoutMs = Math.max(
            1200,
            Math.min(Number(gatewayConfig?.timeoutMs || 12000), attempt === 0 ? 3500 : 5000)
        );
        const quickConfig = {
            ...gatewayConfig,
            timeoutMs
        };
        const { response, data } = await requestAtomopayStatus(quickConfig, cleanTxid).catch(() => ({
            response: { ok: false },
            data: {}
        }));
        latest.debug.attempts.push({
            attempt: attempt + 1,
            statusCode: Number(response?.status || 0),
            ok: response?.ok === true,
            shape: describeAtomopayPayload(data || {})
        });
        if (response?.ok) {
            latest = {
                ...resolveAtomopayResponse(data || {}),
                debug: latest.debug
            };
            if (latest.paymentCode || latest.paymentCodeBase64 || latest.paymentQrUrl) {
                return latest;
            }
        }
        if (attempt < (attempts - 1)) {
            await new Promise((resolve) => setTimeout(resolve, 350 * (attempt + 1)));
        }
    }
    return latest;
}

function normalizeStatus(value = '') {
    return String(value || '')
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/-+/g, '_');
}

function isTerminalPixStatus(value = '') {
    const status = normalizeStatus(value);
    if (!status) return false;
    return (
        status === 'paid' ||
        status === 'pix_confirmed' ||
        status === 'approved' ||
        status === 'completed' ||
        status === 'refunded' ||
        status === 'pix_refunded' ||
        status === 'refused' ||
        status === 'pix_refused' ||
        status === 'failed' ||
        status === 'cancelled' ||
        status === 'canceled' ||
        status === 'expired' ||
        status === 'chargeback' ||
        status === 'chargedback'
    );
}

const PIX_CREATE_INFLIGHT = globalThis.__ifbPixCreateInflightMap || new Map();
if (!globalThis.__ifbPixCreateInflightMap) {
    globalThis.__ifbPixCreateInflightMap = PIX_CREATE_INFLIGHT;
}
const PIX_CREATE_INFLIGHT_TTL_MS = 25000;

function buildPixCreateInflightKey({ sessionId, gateway, shippingId, rewardId, totalAmount, upsellEnabled }) {
    const cleanSession = String(sessionId || '').trim();
    if (!cleanSession) return '';
    return [
        cleanSession,
        String(normalizeActiveGatewayId(gateway) || 'ghostspay'),
        String(shippingId || '').trim(),
        String(rewardId || '').trim(),
        Number(totalAmount || 0).toFixed(2),
        upsellEnabled ? 'upsell' : 'base'
    ].join('|');
}

function normalizeParadiseCreateStatus(value = '') {
    const status = normalizeStatus(value);
    if (!status || status === 'success') return 'waiting_payment';
    return status;
}

function getPixCreateInflight(key) {
    if (!key) return null;
    const entry = PIX_CREATE_INFLIGHT.get(key);
    if (!entry) return null;
    if (Number(entry.expiresAt || 0) <= Date.now()) {
        PIX_CREATE_INFLIGHT.delete(key);
        return null;
    }
    return entry;
}

function beginPixCreateInflight(key) {
    if (!key) return null;
    let resolvePromise;
    let rejectPromise;
    const promise = new Promise((resolve, reject) => {
        resolvePromise = resolve;
        rejectPromise = reject;
    });
    const entry = {
        key,
        promise,
        resolve: resolvePromise,
        reject: rejectPromise,
        expiresAt: Date.now() + PIX_CREATE_INFLIGHT_TTL_MS
    };
    PIX_CREATE_INFLIGHT.set(key, entry);
    return entry;
}

function finishPixCreateInflight(key, entry, result, error) {
    if (!key || !entry) return;
    const current = PIX_CREATE_INFLIGHT.get(key);
    if (current === entry) {
        PIX_CREATE_INFLIGHT.delete(key);
    }
    if (error) {
        try {
            entry.resolve({
                ok: false,
                error: error?.message || String(error)
            });
        } catch (_error) {
            // Ignore duplicate resolutions.
        }
        return;
    }
    try {
        entry.resolve(result);
    } catch (_error) {
        // Ignore duplicate resolves.
    }
}

async function hydratePixVisualByGateway(gateway, gatewayConfig, txid) {
    if (!txid) {
        return { paymentCode: '', paymentCodeBase64: '', paymentQrUrl: '', status: '', externalId: '' };
    }

    if (gateway === 'ghostspay') {
        const quickConfig = {
            ...gatewayConfig,
            timeoutMs: Math.max(1200, Math.min(Number(gatewayConfig?.timeoutMs || 12000), 3500))
        };
        const { response, data } = await requestGhostspayStatus(quickConfig, txid).catch(() => ({
            response: { ok: false },
            data: {}
        }));
        if (response?.ok) return resolveGhostspayResponse(data || {});
        return { paymentCode: '', paymentCodeBase64: '', paymentQrUrl: '', status: '', externalId: '' };
    }

    if (gateway === 'sunize') {
        const quickConfig = {
            ...gatewayConfig,
            timeoutMs: Math.max(1200, Math.min(Number(gatewayConfig?.timeoutMs || 12000), 3500))
        };
        const { response, data } = await requestSunizeStatus(quickConfig, txid).catch(() => ({
            response: { ok: false },
            data: {}
        }));
        if (response?.ok) return resolveSunizeResponse(data || {});
        return { paymentCode: '', paymentCodeBase64: '', paymentQrUrl: '', status: '', externalId: '' };
    }

    if (gateway === 'paradise') {
        const quickConfig = {
            ...gatewayConfig,
            timeoutMs: Math.max(1200, Math.min(Number(gatewayConfig?.timeoutMs || 12000), 3500))
        };
        const { response, data } = await requestParadiseStatus(quickConfig, txid).catch(() => ({
            response: { ok: false },
            data: {}
        }));
        if (response?.ok) return resolveParadiseResponse(data || {});
        return { paymentCode: '', paymentCodeBase64: '', paymentQrUrl: '', status: '', externalId: '' };
    }

    if (gateway === 'atomopay') {
        return hydrateAtomopayVisual(gatewayConfig, txid, 4);
    }

    return { paymentCode: '', paymentCodeBase64: '', paymentQrUrl: '', status: '', externalId: '' };
}

async function findReusablePixBySession({
    sessionId,
    gateway,
    gatewayConfig,
    totalAmount,
    shippingId,
    rewardId,
    upsellEnabled
}) {
    const cleanSession = String(sessionId || '').trim();
    if (!cleanSession) return null;

    const bySession = await getLeadBySessionId(cleanSession).catch(() => ({ ok: false, data: null }));
    const lead = bySession?.ok ? bySession.data : null;
    if (!lead) return null;

    const payload = asObject(lead.payload);
    const storedGateway = normalizeGatewayId(
        payload.gateway ||
        payload.pixGateway ||
        payload.paymentGateway ||
        lead.gateway ||
        gateway
    );
    if (storedGateway !== gateway) return null;

    const txid = pickText(
        lead.pix_txid,
        payload.pixTxid,
        payload.pix?.idTransaction,
        payload.pix?.txid
    );
    if (!txid) return null;

    const lastEvent = String(lead.last_event || '').trim().toLowerCase();
    const statusRaw = pickText(
        payload.pixStatus,
        payload.pix?.status,
        payload.pix?.statusRaw,
        lastEvent
    );
    if (
        payload.pixPaidAt ||
        payload.pixRefundedAt ||
        payload.pixRefusedAt ||
        lastEvent === 'pix_confirmed' ||
        lastEvent === 'pix_refunded' ||
        lastEvent === 'pix_refused' ||
        isTerminalPixStatus(statusRaw)
    ) {
        return null;
    }

    const createdAtRaw = pickText(
        payload.pixCreatedAt,
        payload.pix?.createdAt,
        lead.updated_at,
        lead.created_at
    );
    const createdAtMs = Date.parse(createdAtRaw);
    if (Number.isFinite(createdAtMs) && (Date.now() - createdAtMs) > (20 * 60 * 1000)) {
        return null;
    }

    const storedAmount = Number(payload.pixAmount || lead.pix_amount || payload.pix?.amount || 0);
    if (storedAmount > 0 && totalAmount > 0 && Math.abs(storedAmount - totalAmount) > 0.01) {
        return null;
    }

    const storedShippingId = pickText(payload.shipping?.id, payload.shippingId, lead.shipping_id);
    if (shippingId && storedShippingId && String(shippingId) !== String(storedShippingId)) {
        return null;
    }

    const storedRewardId = pickText(payload.reward?.id, payload.rewardId, lead.reward_id);
    if (rewardId && String(storedRewardId || '') !== String(rewardId)) {
        return null;
    }

    const storedUpsell = Boolean(payload?.upsell?.enabled || payload?.isUpsell);
    if (storedUpsell !== Boolean(upsellEnabled)) return null;

    const normalizedReward = resolveReward(storedRewardId || rewardId || 'bag');
    const rewardExtraPrice = Boolean(upsellEnabled) ? 0 : toBrlAmount(normalizedReward.extraPrice);

    let paymentCode = pickText(payload?.pix?.paymentCode, payload.paymentCode);
    let paymentCodeBase64 = pickText(payload?.pix?.paymentCodeBase64, payload.paymentCodeBase64);
    let paymentQrUrl = pickText(payload?.pix?.paymentQrUrl, payload.paymentQrUrl);
    let externalId = pickText(payload.pixExternalId, payload?.pix?.externalId);
    let status = statusRaw;

    if (!paymentCode && !paymentCodeBase64 && !paymentQrUrl) {
        const hydrated = await hydratePixVisualByGateway(gateway, gatewayConfig, txid);
        paymentCode = pickText(paymentCode, hydrated.paymentCode);
        paymentCodeBase64 = pickText(paymentCodeBase64, hydrated.paymentCodeBase64);
        paymentQrUrl = pickText(paymentQrUrl, hydrated.paymentQrUrl);
        externalId = pickText(externalId, hydrated.externalId);
        status = pickText(status, hydrated.status);
    }

    return {
        idTransaction: txid,
        paymentCode,
        paymentCodeBase64,
        paymentQrUrl,
        status: status || 'waiting_payment',
        amount: totalAmount > 0 ? totalAmount : storedAmount,
        gateway,
        externalId,
        rewardId: normalizedReward.id,
        rewardName: normalizedReward.name,
        rewardExtraPrice,
        reused: true
    };
}

module.exports = async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');

    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }
    if (!await ensurePublicAccess(req, res, { requireSession: true })) {
        return;
    }

    try {
        let rawBody = {};
        try {
            rawBody = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
        } catch (_error) {
            return res.status(400).json({ error: 'JSON invalido no corpo da requisicao.' });
        }

        let payments = null;
        try {
            payments = await getPaymentsConfig();
        } catch (_error) {
            return res.status(503).json({ error: 'Configuracao de pagamentos indisponivel. Tente novamente.' });
        }
        const gatewayCandidates = resolveGatewayCandidates(rawBody, payments);
        let gateway = gatewayCandidates[0] || resolveGateway(rawBody, payments);
        let gatewayConfig = payments?.gateways?.[gateway] || {};

        const { amount, personal = {}, address = {}, extra = {}, shipping = {}, reward: rawReward = null, bump, upsell = null } = rawBody;
        const value = toBrlAmount(amount);
        const upsellEnabled = Boolean(upsell && upsell.enabled);
        const normalizedReward = resolveReward(rawReward);
        const rewardExtraPrice = upsellEnabled ? 0 : toBrlAmount(normalizedReward.extraPrice);
        const sessionId = String(rawBody?.sessionId || rawBody?.session_id || '').trim();
        const addPaymentInfoEventId = sanitizeEventId(rawBody?.addPaymentInfoEventId || rawBody?.eventId)
            || buildAddPaymentInfoEventId(sessionId);

        const name = String(personal.name || '').trim();
        const cpf = sanitizeDigits(personal.cpf || '');
        const email = String(personal.email || '').trim();
        const phone = sanitizeDigits(personal.phoneDigits || personal.phone || '');

        if (!name || !cpf || !email || !phone) {
            return res.status(400).json({ error: 'Dados pessoais incompletos.' });
        }

        const street = String(address.street || '').trim() || String(address.streetLine || '').split(',')[0]?.trim() || '';
        const neighborhood =
            String(address.neighborhood || '').trim() ||
            String(address.streetLine || '').split(',')[1]?.trim() ||
            '';
        const city = String(address.city || '').trim() || String(address.cityLine || '').split('-')[0]?.trim() || '';
        const state = String(address.state || '').trim() || String(address.cityLine || '').split('-')[1]?.trim() || '';
        const zipCode = sanitizeDigits(address.cep || '');

        const streetNumber = extra?.noNumber ? 'S/N' : String(extra?.number || '').trim() || 'S/N';
        const complement = extra?.noComplement ? 'Sem complemento' : String(extra?.complement || '').trim() || 'Sem complemento';

        let shippingPrice = normalizeGatewayShippingPrice(shipping, shipping?.price || 0);
        let bumpPrice = bump?.price ? toBrlAmount(bump.price) : 0;
        if (bump?.selected === false) bumpPrice = 0;
        let totalAmount = Number((shippingPrice + rewardExtraPrice + bumpPrice).toFixed(2));
        let usedAmountFallback = false;
        if (totalAmount <= 0 && value > 0) {
            totalAmount = Number(value.toFixed(2));
            if (shippingPrice <= 0) {
                shippingPrice = Number(Math.max(0, totalAmount - rewardExtraPrice - bumpPrice).toFixed(2));
                usedAmountFallback = true;
            }
        }
        const gatewayShippingPrice = usedAmountFallback
            ? normalizeGatewayShippingPrice({ ...shipping, price: shippingPrice }, shippingPrice)
            : shippingPrice;
        if (usedAmountFallback && gatewayShippingPrice !== shippingPrice) {
            shippingPrice = gatewayShippingPrice;
            totalAmount = Number((shippingPrice + rewardExtraPrice + bumpPrice).toFixed(2));
        }
        if (!totalAmount || totalAmount <= 0) {
            return res.status(400).json({ error: 'Valor do frete invalido.' });
        }
        const shippingBasePrice = normalizeGatewayShippingBasePrice(shipping, shippingPrice);
        const normalizedShipping = {
            ...(shipping || {}),
            id: String(shipping?.id || '').trim() || 'frete',
            name: String(shipping?.name || '').trim() || 'Frete Bag iFood',
            price: shippingPrice,
            basePrice: shippingBasePrice,
            originalPrice: shippingBasePrice
        };
        const normalizedBump = {
            selected: bumpPrice > 0,
            title: String(bump?.title || 'Seguro Bag').trim() || 'Seguro Bag',
            price: bumpPrice
        };
        const orderId = sessionId || `order_${Date.now()}`;
        const pixCreateInflightKey = buildPixCreateInflightKey({
            sessionId,
            gateway,
            shippingId: String(normalizedShipping?.id || '').trim(),
            rewardId: String(normalizedReward?.id || '').trim(),
            totalAmount,
            upsellEnabled
        });
        const existingCreateInflight = getPixCreateInflight(pixCreateInflightKey);
        if (existingCreateInflight) {
            const inflightResult = await existingCreateInflight.promise.catch(() => null);
            if (inflightResult?.payload) {
                return res.status(200).json(inflightResult.payload);
            }
        }

        const items = [
            {
                title: 'Frete Bag do iFood',
                quantity: 1,
                unitPrice: Number(shippingPrice.toFixed(2)),
                tangible: false
            }
        ];

        if (rewardExtraPrice > 0) {
            items.push({
                title: normalizedReward.name,
                quantity: 1,
                unitPrice: Number(rewardExtraPrice.toFixed(2)),
                tangible: false
            });
        }

        if (bumpPrice > 0) {
            items.push({
                title: bump.title || 'Seguro Bag',
                quantity: 1,
                unitPrice: Number(bumpPrice.toFixed(2)),
                tangible: false
            });
        }

        let reusable = null;
        let reusableGateway = gateway;
        for (const candidateGateway of gatewayCandidates.length ? gatewayCandidates : [gateway]) {
            const candidateConfig = payments?.gateways?.[candidateGateway] || {};
            const candidateReusable = await findReusablePixBySession({
                sessionId,
                gateway: candidateGateway,
                gatewayConfig: candidateConfig,
                totalAmount,
                shippingId: String(normalizedShipping?.id || '').trim(),
                rewardId: String(normalizedReward?.id || '').trim(),
                upsellEnabled
            });
            if (candidateReusable) {
                reusable = candidateReusable;
                reusableGateway = candidateGateway;
                break;
            }
        }
        if (reusable) {
            gateway = reusableGateway;
            gatewayConfig = payments?.gateways?.[gateway] || {};
            // Reused PIX should still ensure UTMify has the pending order snapshot.
            const reusableTxid = String(reusable.idTransaction || '').trim();
            const reusableUtmJob = {
                channel: 'utmfy',
                eventName: upsellEnabled ? 'upsell_pix_created' : 'pix_created',
                dedupeKey: reusableTxid ? `utmfy:pix_created:${gateway}:${upsellEnabled ? 'upsell' : 'base'}:${reusableTxid}` : null,
                payload: {
                    orderId: reusableTxid || orderId,
                    amount: Number(reusable.amount || totalAmount || 0),
                    sessionId: sessionId || '',
                    personal,
                    shipping: normalizedShipping,
                    reward: normalizedReward,
                    bump: normalizedBump.selected ? normalizedBump : null,
                    utm: rawBody.utm || {},
                    txid: reusableTxid,
                    gateway,
                    createdAt: new Date().toISOString(),
                    status: 'waiting_payment',
                    upsell: upsellEnabled ? {
                        enabled: true,
                        kind: String(upsell?.kind || 'frete_1dia'),
                        title: String(upsell?.title || 'Prioridade de envio'),
                        price: Number(upsell?.price || totalAmount || 0)
                    } : null
                }
            };
            const queued = await enqueueDispatch(reusableUtmJob).catch(() => null);
            if (queued?.ok || queued?.fallback) {
                processDispatchQueue(6).catch(() => null);
            }
            return res.status(200).json(reusable);
        }

        const createInflightEntry = beginPixCreateInflight(pixCreateInflightKey);
        let createInflightResult = null;
        let createInflightError = null;

        try {
            let response;
            let data;
            let txid = '';
            let paymentCode = '';
            let paymentCodeBase64 = '';
            let paymentQrUrl = '';
            let statusRaw = '';
            let externalId = '';
            let providerSnapshot = null;
            const gatewayFailures = [];
            const rememberGatewayFailure = (failedGateway, code, failedResponse = null, failedData = null) => {
                const statusCode = Number(failedResponse?.status || 0);
                const detail = String(
                    failedData?.error ||
                    failedData?.message ||
                    failedData?.status ||
                    failedData?.detail ||
                    ''
                ).slice(0, 240);
                gatewayFailures.push({
                    gateway: failedGateway,
                    code,
                    statusCode,
                    detail
                });
                createInflightError = new Error(code);
                console.warn('[pix] gateway create attempt failed', {
                    gateway: failedGateway,
                    code,
                    status: statusCode,
                    detail
                });
            };

            for (const candidateGateway of gatewayCandidates.length ? gatewayCandidates : [gateway]) {
                gateway = candidateGateway;
                gatewayConfig = payments?.gateways?.[gateway] || {};
                response = null;
                data = null;
                txid = '';
                paymentCode = '';
                paymentCodeBase64 = '';
                paymentQrUrl = '';
                statusRaw = '';
                externalId = '';
                providerSnapshot = null;

                if (gateway === 'ghostspay') {
                if (!hasGhostspayCredentials(gatewayConfig)) {
                    rememberGatewayFailure(gateway, 'ghostspay_missing_credentials');
                    continue;
                }

            const ghostItems = items.map((item) => ({
                title: item.title,
                quantity: Number(item.quantity || 1),
                unitPrice: Math.max(1, Math.round(Number(item.unitPrice || 0) * 100))
            }));
            const ghostPayload = {
                customer: {
                    name,
                    email,
                    phone,
                    document: {
                        number: cpf,
                        type: 'CPF'
                    }
                },
                paymentMethod: 'PIX',
                amount: Math.max(1, Math.round(totalAmount * 100)),
                items: ghostItems,
                pix: {
                    expiresInDays: 2
                },
                postbackUrl: resolveGhostspayPostbackUrl(req, gatewayConfig),
                ip: extractIp(req),
                description: upsellEnabled ? 'Pedido iFood Bag - Upsell' : 'Pedido iFood Bag',
                metadata: {
                    gateway: 'ghostspay',
                    orderId,
                    shippingId: normalizedShipping?.id || '',
                    shippingName: normalizedShipping?.name || '',
                    cep: zipCode,
                    reference: extra?.reference || '',
                    bumpSelected: normalizedBump.selected,
                    bumpPrice: normalizedBump.price,
                    upsellEnabled,
                    upsellKind: upsellEnabled ? String(upsell?.kind || 'frete_1dia') : '',
                    upsellTitle: upsellEnabled ? String(upsell?.title || 'Prioridade de envio') : '',
                    upsellPrice: upsellEnabled ? Number(upsell?.price || 0) : 0,
                    previousTxid: upsellEnabled ? String(upsell?.previousTxid || '') : '',
                    utm_source: rawBody?.utm?.utm_source || '',
                    utm_medium: rawBody?.utm?.utm_medium || '',
                    utm_campaign: rawBody?.utm?.utm_campaign || '',
                    utm_term: rawBody?.utm?.utm_term || '',
                    utm_content: rawBody?.utm?.utm_content || '',
                    src: rawBody?.utm?.src || '',
                    sck: rawBody?.utm?.sck || ''
                }
            };

                ({ response, data } = await requestGhostspayCreate(gatewayConfig, ghostPayload));
                if (!response?.ok) {
                    rememberGatewayFailure(gateway, 'ghostspay_create_failed', response, data);
                    continue;
                }

                const ghostData = resolveGhostspayResponse(data);
                txid = ghostData.txid;
                paymentCode = ghostData.paymentCode;
                paymentCodeBase64 = ghostData.paymentCodeBase64;
                paymentQrUrl = ghostData.paymentQrUrl;
                statusRaw = ghostData.status;

                // Some GhostsPay accounts return PIX details asynchronously; hydrate quickly by txid.
                if (txid && !paymentCode && !paymentCodeBase64 && !paymentQrUrl) {
                    const quickStatusTimeout = Math.max(
                        650,
                        Math.min(Number(gatewayConfig.timeoutMs || 12000), 900)
                    );
                    const quickConfig = {
                        ...gatewayConfig,
                        timeoutMs: quickStatusTimeout
                    };
                    const quickStatus = await requestGhostspayStatus(quickConfig, txid).catch(() => ({
                        response: { ok: false },
                        data: {}
                    }));
                    if (quickStatus?.response?.ok) {
                        const fromStatus = resolveGhostspayResponse(quickStatus.data || {});
                        paymentCode = paymentCode || fromStatus.paymentCode;
                        paymentCodeBase64 = paymentCodeBase64 || fromStatus.paymentCodeBase64;
                        paymentQrUrl = paymentQrUrl || fromStatus.paymentQrUrl;
                        statusRaw = statusRaw || fromStatus.status;
                    }
                }
            } else if (gateway === 'sunize') {
                if (!hasSunizeCredentials(gatewayConfig)) {
                    rememberGatewayFailure(gateway, 'sunize_missing_credentials');
                    continue;
                }

                const documentType = resolveDocumentType(cpf);
                const phoneE164 = toE164Phone(phone);
                const externalIdBase = upsellEnabled ? `${orderId}-upsell` : orderId;
                externalId = `${externalIdBase}-${Date.now()}`;

                const sunizeItems = items.map((item, index) => ({
                    id: `${normalizedShipping?.id || 'item'}-${index + 1}`,
                    title: String(item.title || 'Item'),
                    description: String(item.title || 'Item'),
                    price: Number(Number(item.unitPrice || 0).toFixed(2)),
                    quantity: Number(item.quantity || 1),
                    is_physical: false
                }));

                const sunizeUtmFields = buildSunizeUtmFields(rawBody);
                const hasSunizeUtmFields = Object.keys(sunizeUtmFields).length > 0;
                const sunizeMetadata = {
                    orderId,
                    sessionId: sessionId || orderId,
                    ...sunizeUtmFields
                };
                const sunizePayloadBase = {
                    external_id: externalId,
                    total_amount: Number(totalAmount.toFixed(2)),
                    payment_method: 'PIX',
                    items: sunizeItems,
                    ip: extractIp(req),
                    customer: {
                        name,
                        email,
                        phone: phoneE164,
                        document_type: documentType,
                        document: cpf
                    }
                };
                const sunizePayload = {
                    ...sunizePayloadBase,
                    ...sunizeUtmFields,
                    metadata: sunizeMetadata
                };

                ({ response, data } = await requestSunizeCreate(gatewayConfig, sunizePayload));
                const shouldRetryWithoutTopLevelUtm = (
                    Number(response?.status || 0) === 400 &&
                    hasSunizeUtmFields &&
                    (!response?.ok || data?.hasError === true)
                );
                const shouldRetryWithoutMetadata = (
                    Number(response?.status || 0) === 400 &&
                    (!response?.ok || data?.hasError === true)
                );
                let retriedWithoutMetadata = false;
                if (shouldRetryWithoutTopLevelUtm) {
                    const metadataOnlyPayload = {
                        ...sunizePayloadBase,
                        metadata: sunizeMetadata
                    };
                    const metadataRetry = await requestSunizeCreate(gatewayConfig, metadataOnlyPayload);
                    if (metadataRetry?.response?.ok && metadataRetry?.data?.hasError !== true) {
                        response = metadataRetry.response;
                        data = metadataRetry.data;
                    } else if (Number(metadataRetry?.response?.status || 0) === 400) {
                        const fallbackRetry = await requestSunizeCreate(gatewayConfig, sunizePayloadBase);
                        retriedWithoutMetadata = true;
                        if (fallbackRetry?.response?.ok && fallbackRetry?.data?.hasError !== true) {
                            response = fallbackRetry.response;
                            data = fallbackRetry.data;
                        } else {
                            response = metadataRetry?.response || fallbackRetry?.response || response;
                            data = metadataRetry?.data || fallbackRetry?.data || data;
                        }
                    } else {
                        response = metadataRetry?.response || response;
                        data = metadataRetry?.data || data;
                    }
                }
                if (!retriedWithoutMetadata && shouldRetryWithoutMetadata && Number(response?.status || 0) === 400) {
                    const fallbackRetry = await requestSunizeCreate(gatewayConfig, sunizePayloadBase);
                    retriedWithoutMetadata = true;
                    if (fallbackRetry?.response?.ok && fallbackRetry?.data?.hasError !== true) {
                        response = fallbackRetry.response;
                        data = fallbackRetry.data;
                    } else {
                        response = fallbackRetry?.response || response;
                        data = fallbackRetry?.data || data;
                    }
                }
                if (!response?.ok) {
                    rememberGatewayFailure(gateway, 'sunize_create_failed', response, data);
                    continue;
                }
                if (data?.hasError === true) {
                    rememberGatewayFailure(gateway, 'sunize_create_error', response, data);
                    continue;
                }

                const sunizeData = resolveSunizeResponse(data);
                txid = sunizeData.txid;
                paymentCode = sunizeData.paymentCode;
                paymentCodeBase64 = sunizeData.paymentCodeBase64;
                paymentQrUrl = sunizeData.paymentQrUrl;
                statusRaw = sunizeData.status;
                externalId = sunizeData.externalId || externalId;
            } else if (gateway === 'paradise') {
                if (!hasParadiseCredentials(gatewayConfig)) {
                    console.warn('[pix] paradise missing credentials', {
                        hasApiKey: Boolean(String(gatewayConfig.apiKey || '').trim()),
                        baseUrl: String(gatewayConfig.baseUrl || '').trim()
                    });
                    rememberGatewayFailure(gateway, 'paradise_missing_credentials');
                    continue;
                }

                const paradiseReferenceBase = upsellEnabled ? `${orderId}-upsell` : orderId;
                externalId = `${paradiseReferenceBase}-${Date.now()}`;

                const paradisePayload = {
                    amount: Math.max(1, Math.round(totalAmount * 100)),
                    description: String(
                        gatewayConfig.description ||
                        (upsellEnabled ? 'Pedido iFood Bag - Upsell' : 'Pedido iFood Bag')
                    ).trim(),
                    reference: externalId,
                    customer: {
                        name,
                        email,
                        document: cpf,
                        phone
                    },
                    postback_url: resolveParadisePostbackUrl(req, gatewayConfig),
                    tracking: {
                        gateway: 'paradise',
                        orderId,
                        sessionId: sessionId || orderId,
                        utm_source: rawBody?.utm?.utm_source || '',
                        utm_medium: rawBody?.utm?.utm_medium || '',
                        utm_campaign: rawBody?.utm?.utm_campaign || '',
                        utm_term: rawBody?.utm?.utm_term || '',
                        utm_content: rawBody?.utm?.utm_content || '',
                        src: rawBody?.utm?.src || '',
                        sck: rawBody?.utm?.sck || '',
                        fbclid: rawBody?.utm?.fbclid || rawBody?.fbclid || '',
                        gclid: rawBody?.utm?.gclid || '',
                        ttclid: rawBody?.utm?.ttclid || ''
                    }
                };
                if (String(gatewayConfig.productHash || '').trim()) {
                    paradisePayload.productHash = String(gatewayConfig.productHash).trim();
                } else {
                    paradisePayload.source = String(gatewayConfig.source || 'api_externa').trim() || 'api_externa';
                }
                if (normalizedBump.selected && String(gatewayConfig.orderbumpHash || '').trim()) {
                    paradisePayload.orderbump = String(gatewayConfig.orderbumpHash).trim();
                }

                ({ response, data } = await requestParadiseCreate(gatewayConfig, paradisePayload));
                if (!response?.ok || data?.success === false || String(data?.status || '').toLowerCase() === 'error') {
                    console.warn('[pix] paradise create failed', {
                        status: Number(response?.status || 0),
                        detail: data?.error || data?.message || data?.status || '',
                        reference: externalId,
                        hasProductHash: Boolean(String(paradisePayload.productHash || '').trim()),
                        source: String(paradisePayload.source || '').trim(),
                        hasTracking: Boolean(paradisePayload.tracking && Object.keys(paradisePayload.tracking).length)
                    });
                    rememberGatewayFailure(gateway, 'paradise_create_failed', response, data);
                    continue;
                }

                const paradiseData = resolveParadiseResponse(data);
                txid = paradiseData.txid;
                paymentCode = paradiseData.paymentCode;
                paymentCodeBase64 = paradiseData.paymentCodeBase64;
                paymentQrUrl = paradiseData.paymentQrUrl;
                statusRaw = normalizeParadiseCreateStatus(paradiseData.status || getParadiseStatus(data));
                externalId = paradiseData.externalId || externalId;

                if (txid && !paymentCode && !paymentCodeBase64 && !paymentQrUrl) {
                    const quickStatusTimeout = Math.max(
                        650,
                        Math.min(Number(gatewayConfig.timeoutMs || 12000), 900)
                    );
                    const quickConfig = {
                        ...gatewayConfig,
                        timeoutMs: quickStatusTimeout
                    };
                    const quickStatus = await requestParadiseStatus(quickConfig, txid).catch(() => ({
                        response: { ok: false },
                        data: {}
                    }));
                    if (quickStatus?.response?.ok) {
                        const fromStatus = resolveParadiseResponse(quickStatus.data || {});
                        const normalizedQuickStatus = normalizeParadiseCreateStatus(fromStatus.status);
                        paymentCode = paymentCode || fromStatus.paymentCode;
                        paymentCodeBase64 = paymentCodeBase64 || fromStatus.paymentCodeBase64;
                        paymentQrUrl = paymentQrUrl || fromStatus.paymentQrUrl;
                        if (!statusRaw || statusRaw === 'waiting_payment' || statusRaw === 'pending') {
                            statusRaw = normalizedQuickStatus;
                        }
                    }
                }
            } else if (gateway === 'atomopay') {
                const atomopayProduct = resolveAtomopayProductConfig(
                    gatewayConfig,
                    normalizedShipping,
                    upsellEnabled,
                    upsell
                );
                if (!hasAtomopayCredentials({
                    ...gatewayConfig,
                    offerHash: atomopayProduct.offerHash,
                    productHash: atomopayProduct.productHash
                })) {
                    console.warn('[pix] atomopay missing credentials', {
                        hasApiToken: Boolean(String(gatewayConfig.apiToken || '').trim()),
                        hasOfferHash: Boolean(String(atomopayProduct.offerHash || '').trim()),
                        hasProductHash: Boolean(String(atomopayProduct.productHash || '').trim()),
                        variant: atomopayProduct.variant
                    });
                    rememberGatewayFailure(gateway, 'atomopay_missing_credentials');
                    continue;
                }

                const atomopayTracking = buildAtomopayTrackingFields(rawBody);
                const amountCents = Math.max(1, Math.round(totalAmount * 100));
                const atomopayCustomer = {
                    name: resolveAtomopayCustomerName(name),
                    email: resolveAtomopayCustomerEmail(email),
                    phone_number: phone,
                    document: cpf
                };
                if (street) atomopayCustomer.street_name = street;
                if (streetNumber) atomopayCustomer.number = streetNumber;
                if (complement) atomopayCustomer.complement = complement;
                if (neighborhood) atomopayCustomer.neighborhood = neighborhood;
                if (city) atomopayCustomer.city = city;
                if (state) atomopayCustomer.state = state;
                if (zipCode) atomopayCustomer.zip_code = zipCode;

                const atomopayPayload = {
                    amount: amountCents,
                    offer_hash: atomopayProduct.offerHash,
                    payment_method: 'pix',
                    customer: atomopayCustomer,
                    cart: [
                        {
                            product_hash: atomopayProduct.productHash,
                            title: resolveAtomopayItemTitle(normalizedShipping, upsellEnabled, upsell, {
                                ...normalizedReward,
                                extraPrice: rewardExtraPrice
                            }, normalizedBump),
                            price: amountCents,
                            quantity: 1,
                            operation_type: 1,
                            tangible: false
                        }
                    ],
                    expire_in_days: 2,
                    transaction_origin: 'api',
                    postback_url: resolveAtomopayPostbackUrl(req, gatewayConfig, {
                        order_id: orderId,
                        session_id: sessionId || orderId
                    })
                };
                if (Object.keys(atomopayTracking).length > 0) {
                    atomopayPayload.tracking = atomopayTracking;
                }

                ({ response, data } = await requestAtomopayCreate(gatewayConfig, atomopayPayload));
                if (!response?.ok || data?.success === false) {
                    console.warn('[pix] atomopay create failed', {
                        status: Number(response?.status || 0),
                        detail: data?.error || data?.message || data?.status || '',
                        variant: atomopayProduct.variant
                    });
                    rememberGatewayFailure(gateway, 'atomopay_create_failed', response, data);
                    continue;
                }

                const atomopayData = resolveAtomopayResponse(data);
                const atomopayCreateShape = describeAtomopayPayload(data || {});
                txid = atomopayData.txid;
                paymentCode = atomopayData.paymentCode;
                paymentCodeBase64 = atomopayData.paymentCodeBase64;
                paymentQrUrl = atomopayData.paymentQrUrl;
                statusRaw = atomopayData.status || getAtomopayStatus(data) || 'pending';
                let atomopayHydrateDebug = null;
                providerSnapshot = {
                    gateway: 'atomopay',
                    hash: txid,
                    status: statusRaw || 'pending',
                    amountCents,
                    offerHash: atomopayProduct.offerHash,
                    productHash: atomopayProduct.productHash,
                    variant: atomopayProduct.variant,
                    createPayload: sanitizeAtomopayCreatePayload(atomopayPayload),
                    createResponse: sanitizeAtomopayCreateResponse(data || {})
                };

                if (txid && !paymentCode && !paymentCodeBase64 && !paymentQrUrl) {
                    const hydrated = await hydrateAtomopayVisual(gatewayConfig, txid, 4);
                    atomopayHydrateDebug = hydrated.debug || null;
                    paymentCode = paymentCode || hydrated.paymentCode;
                    paymentCodeBase64 = paymentCodeBase64 || hydrated.paymentCodeBase64;
                    paymentQrUrl = paymentQrUrl || hydrated.paymentQrUrl;
                    if (!statusRaw || statusRaw === 'waiting_payment' || statusRaw === 'pending') {
                        statusRaw = hydrated.status || statusRaw || 'pending';
                    }
                }
                if (txid && !paymentCode && !paymentCodeBase64 && !paymentQrUrl) {
                    console.warn('[pix] atomopay missing pix visual after create', {
                        txid,
                        statusRaw,
                        createShape: atomopayCreateShape,
                        hydratedDebug: atomopayHydrateDebug
                    });
                }
                if (providerSnapshot) {
                    providerSnapshot.hash = txid || providerSnapshot.hash;
                    providerSnapshot.status = statusRaw || providerSnapshot.status;
                }
            } else {
                rememberGatewayFailure(gateway, 'gateway_unavailable');
                continue;
            }

                if (!txid) {
                    rememberGatewayFailure(gateway, 'missing_txid', response, data);
                    continue;
                }
                if (!paymentCode && !paymentCodeBase64 && !paymentQrUrl) {
                    rememberGatewayFailure(gateway, 'missing_pix_visual', response, data);
                    continue;
                }
                break;
            }

            if (!txid || (!paymentCode && !paymentCodeBase64 && !paymentQrUrl)) {
                const lastFailure = gatewayFailures[gatewayFailures.length - 1] || {};
                const statusCode = Number(lastFailure.statusCode || 0);
                createInflightError = createInflightError || new Error(lastFailure.code || 'pix_create_failed');
                return res.status(statusCode >= 500 ? statusCode : 502).json({
                    error: 'Falha ao gerar o PIX em todos os gateways disponiveis.',
                    detail: {
                        requestedGateway: normalizeActiveGatewayId(rawBody.gateway || rawBody.paymentGateway || payments?.activeGateway),
                        attempts: gatewayFailures
                    }
                });
            }

            const pixCreatedAt = new Date().toISOString();

            const existingLead = sessionId
                ? (await getLeadBySessionId(sessionId).catch(() => ({ ok: false, data: null })))?.data
                : null;
            const paymentHistoryPayload = mergePaymentHistory(existingLead?.payload, {
                txid,
                gateway,
                status: statusRaw || 'pending',
                amount: totalAmount,
                createdAt: pixCreatedAt,
                changedAt: pixCreatedAt,
                shipping: normalizedShipping,
                reward: normalizedReward,
                upsell: upsellEnabled ? {
                    enabled: true,
                    kind: String(upsell?.kind || 'frete_1dia'),
                    title: String(upsell?.title || 'Prioridade de envio'),
                    previousTxid: String(upsell?.previousTxid || '')
                } : null,
                bump: normalizedBump.selected ? normalizedBump : null
            });

            await upsertLead({
                ...(rawBody || {}),
                addPaymentInfoEventId,
                shipping: normalizedShipping,
                reward: normalizedReward,
                bump: normalizedBump,
                rewardId: normalizedReward.id,
                rewardName: normalizedReward.name,
                rewardExtraPrice,
                gateway,
                pixGateway: gateway,
                paymentGateway: gateway,
                event: upsellEnabled ? 'upsell_pix_created' : 'pix_created',
                stage: upsellEnabled ? 'upsell' : 'pix',
                pixTxid: txid,
                pixAmount: totalAmount,
                pixCreatedAt,
                pixStatusChangedAt: pixCreatedAt,
                pixStatus: statusRaw || 'waiting_payment',
                // A new PIX must clear terminal markers from any previous transaction in the same session.
                pixPaidAt: null,
                pixRefundedAt: null,
                pixRefusedAt: null,
                pixExternalId: externalId || undefined,
                paymentCode: paymentCode || undefined,
                paymentCodeBase64: paymentCodeBase64 || undefined,
                paymentQrUrl: paymentQrUrl || undefined,
                paymentHistory: paymentHistoryPayload.paymentHistory,
                ...(providerSnapshot ? { atomopay: providerSnapshot } : {}),
                pix: {
                    ...asObject(rawBody?.pix),
                    idTransaction: txid,
                    paymentCode,
                    paymentCodeBase64,
                    paymentQrUrl,
                    status: statusRaw || 'waiting_payment',
                    gateway,
                    amount: totalAmount,
                    createdAt: pixCreatedAt,
                    paidAt: null,
                    refundedAt: null,
                    refusedAt: null,
                    externalId: externalId || undefined,
                    rewardId: normalizedReward.id,
                    rewardName: normalizedReward.name,
                    rewardExtraPrice
                },
                upsell: upsellEnabled ? {
                    enabled: true,
                    kind: String(upsell?.kind || 'frete_1dia'),
                    title: String(upsell?.title || 'Prioridade de envio'),
                    price: Number(upsell?.price || totalAmount),
                    previousTxid: String(upsell?.previousTxid || '')
                } : null
            }, req).catch(() => null);

            const utmOrderId = txid || orderId;
            const utmJob = {
                channel: 'utmfy',
                eventName: upsellEnabled ? 'upsell_pix_created' : 'pix_created',
                dedupeKey: txid ? `utmfy:pix_created:${gateway}:${upsellEnabled ? 'upsell' : 'base'}:${txid}` : null,
                payload: {
                    orderId: utmOrderId,
                    eventId: addPaymentInfoEventId,
                    amount: totalAmount,
                    sessionId: sessionId || '',
                    personal,
                    shipping: normalizedShipping,
                    reward: normalizedReward,
                    bump: normalizedBump.selected ? normalizedBump : null,
                    utm: rawBody.utm || {},
                    txid,
                    gateway,
                    createdAt: pixCreatedAt,
                    status: 'waiting_payment',
                    upsell: upsellEnabled ? {
                        enabled: true,
                        kind: String(upsell?.kind || 'frete_1dia'),
                        title: String(upsell?.title || 'Prioridade de envio'),
                        price: Number(upsell?.price || totalAmount)
                    } : null
                }
            };
            const pushPayload = {
                txid,
                orderId: utmOrderId,
                amount: totalAmount,
                customerName: name,
                customerEmail: email,
                shippingName: normalizedShipping?.name || '',
                rewardId: normalizedReward.id,
                rewardName: normalizedReward.name,
                rewardExtraPrice,
                cep: zipCode,
                utm: rawBody.utm || {},
                utm_source: rawBody?.utm?.utm_source || rawBody?.utm_source || '',
                utm_campaign: rawBody?.utm?.utm_campaign || rawBody?.utm_campaign || '',
                utm_term: rawBody?.utm?.utm_term || rawBody?.utm_term || '',
                utm_content: rawBody?.utm?.utm_content || rawBody?.utm_content || '',
                campaign: rawBody?.utm?.utm_campaign || rawBody?.utm_campaign || '',
                adset: (
                    rawBody?.utm?.utm_adset ||
                    rawBody?.utm?.adset ||
                    rawBody?.utm?.utm_content ||
                    rawBody?.utm_adset ||
                    rawBody?.utm_content ||
                    ''
                ),
                gateway,
                isUpsell: upsellEnabled
            };
            const pushKind = upsellEnabled ? 'upsell_pix_created' : 'pix_created';
            const pushJob = {
                channel: 'pushcut',
                kind: pushKind,
                dedupeKey: txid ? `pushcut:pix_created:${gateway}:${txid}` : null,
                payload: pushPayload
            };

            const [utmQueued, pushQueued] = await Promise.all([
                enqueueDispatch(utmJob).catch(() => null),
                enqueueDispatch(pushJob).catch(() => null)
            ]);
            const shouldProcessQueue = Boolean(
                utmQueued?.ok || utmQueued?.fallback ||
                pushQueued?.ok || pushQueued?.fallback
            );

            const responsePayload = {
                idTransaction: txid,
                paymentCode,
                paymentCodeBase64,
                paymentQrUrl,
                status: statusRaw || '',
                amount: totalAmount,
                gateway,
                externalId,
                rewardId: normalizedReward.id,
                rewardName: normalizedReward.name,
                rewardExtraPrice
            };
            createInflightResult = responsePayload;
            res.status(200).json(responsePayload);

            // Jobs are enqueued before response; queue processing runs asynchronously.
            (async () => {
                if (shouldProcessQueue) {
                    await processDispatchQueue(12).catch(() => null);
                }
            })().catch((error) => {
                console.error('[pix] side effect error', { message: error?.message || String(error) });
            });

            return;
        } finally {
            if (createInflightEntry) {
                if (createInflightResult) {
                    finishPixCreateInflight(pixCreateInflightKey, createInflightEntry, {
                        ok: true,
                        payload: createInflightResult
                    });
                } else {
                    finishPixCreateInflight(
                        pixCreateInflightKey,
                        createInflightEntry,
                        null,
                        createInflightError || new Error('pix_create_not_completed')
                    );
                }
            }
        }
    } catch (error) {
        console.error('[pix] unexpected error', { message: error.message || String(error) });
        return res.status(500).json({
            error: 'Erro ao gerar o PIX.',
            detail: error.message || String(error)
        });
    }
};
