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
        .replace(/^Bearer\s*/i, '')
        .replace(/^X-Api-Key:\s*/i, '')
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
    params.set('gateway', 'atlaspags');
    if (token) params.set('token', token);
    return `${protocol}://${host}/api/pix/webhook?${params.toString()}`;
}

function resolveBaseUrl(config = {}) {
    let base = String(config.baseUrl || '').replace(/\/+$/, '').trim();
    if (!base) base = 'https://atlaspags.com';
    if (!base.endsWith('/api/v1')) {
        base = base.endsWith('/api') ? `${base}/v1` : `${base}/api/v1`;
    }
    return base;
}

function resolveChargeEndpoint(config = {}) {
    const base = resolveBaseUrl(config);
    return `${base}/charges`;
}

function resolveTransactionEndpoint(config = {}, transactionId = '') {
    const base = resolveBaseUrl(config);
    return `${base}/charges/${encodeURIComponent(String(transactionId || '').trim())}`;
}

function resolvePingEndpoint(config = {}) {
    const base = resolveBaseUrl(config);
    return `${base}/ping`;
}

function resolvePublicConfigEndpoint(config = {}, publicKey = '') {
    const base = resolveBaseUrl(config);
    const key = cleanApiKey(publicKey || config.publicKey);
    return `${base}/public/config?key=${encodeURIComponent(key)}`;
}

function buildHeaders(config = {}, extra = {}) {
    const secretKey = cleanApiKey(config.apiKey || config.secretKey);
    const headers = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${secretKey}`
    };
    Object.entries(extra || {}).forEach(([k, v]) => {
        const val = toText(v);
        if (val) headers[k] = val;
    });
    return headers;
}

function hasAtlaspagsCredentials(config = {}) {
    return Boolean(cleanApiKey(config.apiKey || config.secretKey));
}

function resolveAtlaspagsCreateResponse(data = {}) {
    const item = data?.data && typeof data.data === 'object' ? data.data : data;
    const txid = toText(item.id || item.chargeId || item.charge_id || data.id);
    const pixData = item.pix && typeof item.pix === 'object' ? item.pix : (data.pix || {});
    const paymentCode = toText(pixData.code || pixData.qrcode || pixData.payment_code || item.paymentCode || item.pixCode);
    const qrImage = toText(pixData.qr_code_image || pixData.qrCodeImage || pixData.qrcode_base64 || pixData.qr_code);

    let paymentCodeBase64 = '';
    let paymentQrUrl = '';

    if (qrImage.startsWith('data:image')) {
        paymentQrUrl = qrImage;
        if (qrImage.startsWith('data:image/png;base64,')) {
            paymentCodeBase64 = qrImage.replace(/^data:image\/png;base64,/, '');
        } else {
            paymentCodeBase64 = qrImage;
        }
    } else if (qrImage.startsWith('http://') || qrImage.startsWith('https://')) {
        paymentQrUrl = qrImage;
    } else if (qrImage) {
        paymentCodeBase64 = qrImage;
    }

    const status = toText(item.status || data.status || 'pending').toLowerCase();
    const amount = Number(item.amount || data.amount || 0);
    const fee = Number(item.fee || data.fee || 0);

    return {
        txid,
        paymentCode,
        paymentCodeBase64,
        paymentQrUrl,
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
        payload.external_id ||
        payload.metadata?.orderId ||
        payload.metadata?.externalId
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

async function requestAtlaspagsPing(config = {}) {
    const endpoint = resolvePingEndpoint(config);
    const timeoutMs = Number(config.timeoutMs || 8000);
    const headers = buildHeaders(config);
    return fetchWithTimeout(endpoint, { method: 'GET', headers }, timeoutMs);
}

function getAtlaspagsStatus(data = {}) {
    const item = data?.data && typeof data.data === 'object' ? data.data : data;
    return String(item.status || data.status || '').trim().toLowerCase();
}

function isAtlaspagsPaidStatus(status = '') {
    const s = String(status || '').trim().toLowerCase();
    return s === 'paid' || s === 'pago' || s === 'confirmed' || s === 'completed';
}

function isAtlaspagsRefundedStatus(status = '') {
    const s = String(status || '').trim().toLowerCase();
    return s === 'refunded' || s === 'reembolsado' || s === 'chargeback';
}

function isAtlaspagsRefusedStatus(status = '') {
    const s = String(status || '').trim().toLowerCase();
    return s === 'failed' || s === 'expired' || s === 'cancelled' || s === 'recusado';
}

function isAtlaspagsPendingStatus(status = '') {
    const s = String(status || '').trim().toLowerCase();
    return s === 'pending' || s === 'pendente' || s === 'waiting';
}

function mapAtlaspagsStatusToUtmify(status = '') {
    if (isAtlaspagsPaidStatus(status)) return 'paid';
    if (isAtlaspagsRefundedStatus(status)) return 'refunded';
    if (isAtlaspagsRefusedStatus(status)) return 'refused';
    return 'waiting_payment';
}

function verifyAtlasWebhookSignature(rawBody = '', header = '', secret = '', toleranceSeconds = 300) {
    const cleanHeader = toText(header);
    const cleanSecret = toText(secret);
    if (!cleanHeader || !cleanSecret) return false;

    try {
        const parts = Object.fromEntries(cleanHeader.split(',').map((p) => p.split('=')));
        const t = Number(parts.t);
        if (!t || !parts.v1) return false;
        if (Math.abs(Date.now() / 1000 - t) > toleranceSeconds) return false;

        const expected = crypto
            .createHmac('sha256', cleanSecret)
            .update(`${t}.${String(rawBody || '')}`)
            .digest('hex');

        const a = Buffer.from(expected);
        const b = Buffer.from(parts.v1);
        return a.length === b.length && crypto.timingSafeEqual(a, b);
    } catch (_error) {
        return false;
    }
}

function isValidCPF(str) {
    const cpf = String(str || '').replace(/\D/g, '');
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
    let sum = 0;
    for (let i = 0; i < 9; i++) sum += parseInt(cpf.charAt(i), 10) * (10 - i);
    let rev = 11 - (sum % 11);
    if (rev === 10 || rev === 11) rev = 0;
    if (rev !== parseInt(cpf.charAt(9), 10)) return false;
    sum = 0;
    for (let i = 0; i < 10; i++) sum += parseInt(cpf.charAt(i), 10) * (11 - i);
    rev = 11 - (sum % 11);
    if (rev === 10 || rev === 11) rev = 0;
    return rev === parseInt(cpf.charAt(10), 10);
}

function generateValidCPF() {
    const n = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10));
    let d1 = n.reduce((acc, digit, idx) => acc + digit * (10 - idx), 0) % 11;
    d1 = d1 < 2 ? 0 : 11 - d1;
    n.push(d1);
    let d2 = n.reduce((acc, digit, idx) => acc + digit * (11 - idx), 0) % 11;
    d2 = d2 < 2 ? 0 : 11 - d2;
    n.push(d2);
    return n.join('');
}

function ensureValidCPF(raw) {
    const digits = String(raw || '').replace(/\D/g, '');
    if (isValidCPF(digits)) return digits;
    return generateValidCPF();
}

module.exports = {
    cleanApiKey,
    hasAtlaspagsCredentials,
    resolvePostbackUrl,
    resolveBaseUrl,
    resolveChargeEndpoint,
    resolveTransactionEndpoint,
    resolvePingEndpoint,
    resolvePublicConfigEndpoint,
    resolveAtlaspagsCreateResponse,
    requestCreateTransaction,
    requestTransactionById,
    requestAtlaspagsPing,
    getAtlaspagsStatus,
    isAtlaspagsPaidStatus,
    isAtlaspagsRefundedStatus,
    isAtlaspagsRefusedStatus,
    isAtlaspagsPendingStatus,
    mapAtlaspagsStatusToUtmify,
    verifyAtlasWebhookSignature,
    isValidCPF,
    generateValidCPF,
    ensureValidCPF
};
