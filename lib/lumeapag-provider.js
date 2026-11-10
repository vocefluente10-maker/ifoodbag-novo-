const crypto = require('node:crypto');
const { toText } = require('./payment-gateway-config');

const fetchFn = global.fetch
    ? global.fetch.bind(global)
    : (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

async function parseResponseData(response) {
    const text = await response.text().catch(() => '');
    if (!text) return {};
    try {
        return JSON.parse(text);
    } catch (_error) {
        return { message: text };
    }
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 12000) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const response = await fetchFn(url, {
            ...options,
            signal: controller.signal
        });
        const data = await parseResponseData(response);
        return { response, data };
    } finally {
        clearTimeout(timeout);
    }
}

function cleanApiKey(raw = '') {
    return String(raw || '')
        .replace(/^X-Api-Key:\s*/i, '')
        .replace(/^Bearer\s*/i, '')
        .trim();
}

function resolveHostAndProtocol(req) {
    const host = String(req?.headers?.['x-forwarded-host'] || req?.headers?.host || 'localhost:3000').trim();
    const forwardedProto = String(req?.headers?.['x-forwarded-proto'] || '').trim().toLowerCase();
    const protocol = forwardedProto === 'http' || forwardedProto === 'https' ? forwardedProto : 'https';
    return { host, protocol };
}

function resolvePostbackUrl(req, config = {}) {
    if (toText(config.postbackUrl)) return toText(config.postbackUrl);
    const { host, protocol } = resolveHostAndProtocol(req);
    const token = toText(config.webhookToken);
    const params = new URLSearchParams();
    params.set('gateway', 'lumeapag');
    if (token) params.set('token', token);
    return `${protocol}://${host}/api/pix/webhook?${params.toString()}`;
}

function resolveBaseUrl(config = {}) {
    let base = String(config.baseUrl || '').replace(/\/+$/, '').trim();
    if (!base) base = 'https://lumeapag.com/api';
    return base;
}

function resolveChargeEndpoint(config = {}) {
    const base = resolveBaseUrl(config);
    if (base.endsWith('/gateway/charges') || base.endsWith('/charges')) return base;
    if (base.endsWith('/gateway')) return `${base}/charges`;
    if (base.endsWith('/api')) return `${base}/gateway/charges`;
    return `${base}/api/gateway/charges`;
}

function resolveTransactionEndpoint(config = {}, transactionId = '') {
    const base = resolveBaseUrl(config);
    let root = base;
    if (root.endsWith('/gateway/charges')) root = root.replace(/\/charges$/, '');
    else if (!root.includes('/gateway')) {
        root = root.endsWith('/api') ? `${root}/gateway` : `${root}/api/gateway`;
    }
    return `${root}/transactions/${encodeURIComponent(String(transactionId || '').trim())}`;
}

function buildHeaders(config = {}, extra = {}) {
    const key = cleanApiKey(config.apiKey);
    const headers = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Api-Key': key,
        'x-api-key': key
    };
    Object.entries(extra || {}).forEach(([k, v]) => {
        const val = toText(v);
        if (val) headers[k] = val;
    });
    return headers;
}

function hasLumeapagCredentials(config = {}) {
    return Boolean(cleanApiKey(config.apiKey));
}

function resolveLumeapagCreateResponse(data = {}) {
    const item = data?.data && typeof data.data === 'object' ? data.data : data;
    const txid = toText(
        item.transactionId ||
        item.transaction_id ||
        item.id ||
        data.transactionId ||
        data.id
    );
    const paymentCode = toText(
        item.pixCode ||
        item.pix_code ||
        item.qr_code ||
        item.qrCode ||
        item.payment_code ||
        data.pixCode ||
        data.qr_code
    );
    const paymentCodeBase64 = toText(item.qr_code_base64 || item.qrcode_base64 || item.pixCodeBase64);
    const status = toText(item.status || data.status || 'PENDING');
    const amount = Number(item.amount || data.amount || 0);
    const fee = Number(item.feeAmount || item.fee || data.feeAmount || 0);

    return {
        txid,
        paymentCode,
        paymentCodeBase64,
        paymentQrUrl: '',
        status,
        amount,
        fee,
        externalId: txid
    };
}

async function requestCreateTransaction(config = {}, payload = {}, options = {}) {
    const endpoint = resolveChargeEndpoint(config);
    const timeoutMs = Number(config.timeoutMs || 12000);
    const idempotencyKey = toText(
        options.idempotencyKey ||
        payload.metadata?.orderId ||
        payload.metadata?.externalId ||
        payload.metadata?.pedido
    );
    const headers = buildHeaders(config, idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {});

    let last = null;
    for (let attempt = 0; attempt < 3; attempt += 1) {
        const result = await fetchWithTimeout(endpoint, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload || {})
        }, timeoutMs);
        last = result;
        if (result.response?.ok) return result;

        const status = Number(result.response?.status || 0);
        const retryable = status === 408 || status === 429 || status >= 500 || !status;
        if (!retryable || attempt === 2) return result;
        await new Promise((resolve) => setTimeout(resolve, 450 * (attempt + 1)));
    }

    return last || { response: { ok: false, status: 500 }, data: { error: 'request_failed' } };
}

async function requestTransactionById(config = {}, transactionId = '') {
    const txid = toText(transactionId);
    if (!txid) {
        return { response: { ok: false, status: 400 }, data: { error: 'missing_transaction_id' } };
    }

    const endpoint = resolveTransactionEndpoint(config, txid);
    const timeoutMs = Number(config.timeoutMs || 12000);
    const headers = buildHeaders(config);

    let last = null;
    for (let attempt = 0; attempt < 3; attempt += 1) {
        const result = await fetchWithTimeout(endpoint, {
            method: 'GET',
            headers
        }, timeoutMs);
        last = result;
        if (result.response?.ok || Number(result.response?.status || 0) === 404) return result;

        const status = Number(result.response?.status || 0);
        const retryable = status === 408 || status === 429 || status >= 500 || !status;
        if (!retryable || attempt === 2) return result;
        await new Promise((resolve) => setTimeout(resolve, 450 * (attempt + 1)));
    }

    return last || { response: { ok: false, status: 500 }, data: { error: 'status_failed' } };
}

function getLumeapagStatus(data = {}) {
    const item = data?.data && typeof data.data === 'object' ? data.data : data;
    return String(item.status || data.status || '').trim();
}

function isLumeapagPaidStatus(status = '') {
    const s = String(status || '').trim().toUpperCase();
    return s === 'PAID' || s === 'PAGO' || s === 'CONFIRMED' || s === 'COMPLETED';
}

function isLumeapagRefundedStatus(status = '') {
    const s = String(status || '').trim().toUpperCase();
    return s === 'MED' || s === 'REFUNDED' || s === 'REEMBOLSADO' || s === 'CHARGEBACK';
}

function isLumeapagRefusedStatus(status = '') {
    const s = String(status || '').trim().toUpperCase();
    return s === 'FAILED' || s === 'EXPIRED' || s === 'CANCELLED' || s === 'RECUSADO';
}

function isLumeapagPendingStatus(status = '') {
    const s = String(status || '').trim().toUpperCase();
    return s === 'PENDING' || s === 'PENDENTE' || s === 'WAITING' || s === 'AWAITING_INSTRUCTIONS';
}

function mapLumeapagStatusToUtmify(status = '') {
    if (isLumeapagPaidStatus(status)) return 'paid';
    if (isLumeapagRefundedStatus(status)) return 'refunded';
    if (isLumeapagRefusedStatus(status)) return 'refused';
    return 'waiting_payment';
}

function verifyWebhookSignature(rawBody = '', signature = '', secret = '') {
    const cleanSignature = toText(signature);
    const cleanSecret = toText(secret);
    if (!cleanSignature || !cleanSecret) return false;
    if (!/^[a-f0-9]{64}$/i.test(cleanSignature)) return false;

    const expected = crypto
        .createHmac('sha256', cleanSecret)
        .update(String(rawBody || ''))
        .digest('hex');

    const expectedBuffer = Buffer.from(expected, 'hex');
    const receivedBuffer = Buffer.from(cleanSignature, 'hex');
    if (expectedBuffer.length !== receivedBuffer.length) return false;
    return crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
}

module.exports = {
    cleanApiKey,
    hasLumeapagCredentials,
    resolvePostbackUrl,
    resolveChargeEndpoint,
    resolveTransactionEndpoint,
    resolveLumeapagCreateResponse,
    requestCreateTransaction,
    requestTransactionById,
    getLumeapagStatus,
    isLumeapagPaidStatus,
    isLumeapagRefundedStatus,
    isLumeapagRefusedStatus,
    isLumeapagPendingStatus,
    mapLumeapagStatusToUtmify,
    verifyWebhookSignature
};
