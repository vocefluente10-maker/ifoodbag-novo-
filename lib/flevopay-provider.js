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
        .replace(/^X-API-Key:\s*/i, '')
        .replace(/^Bearer\s*/i, '')
        .trim();
}

function cleanAccountId(raw = '') {
    return String(raw || '').replace(/\D/g, '').trim();
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
    params.set('gateway', 'flevopay');
    if (token) params.set('token', token);
    return `${protocol}://${host}/api/pix/webhook?${params.toString()}`;
}

function resolveBaseUrl(config = {}) {
    let base = String(config.baseUrl || '').replace(/\/+$/, '').trim();
    if (!base) base = 'https://app.flevopag.com';
    return base;
}

function resolveChargeEndpoint(config = {}) {
    const base = resolveBaseUrl(config);
    if (base.endsWith('/api/v1/transaction')) return base;
    if (base.endsWith('/api/v1')) return `${base}/transaction`;
    if (base.endsWith('/api')) return `${base}/v1/transaction`;
    return `${base}/api/v1/transaction`;
}

function resolveQueryEndpoint(config = {}, transactionId = '') {
    const base = resolveBaseUrl(config);
    let root = base;
    if (root.endsWith('/api/v1/transaction')) root = root.replace(/\/transaction$/, '');
    else if (root.endsWith('/api/v1')) { /* ok */ }
    else if (root.endsWith('/api')) root = `${root}/v1`;
    else root = `${root}/api/v1`;
    return `${root}/query?action=get_transaction&id=${encodeURIComponent(String(transactionId || '').trim())}`;
}

function buildHeaders(config = {}, extra = {}) {
    const apiKey = cleanApiKey(config.apiKey || config.secretKey);
    const accountId = cleanAccountId(config.accountId);
    const headers = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-API-Key': apiKey
    };
    if (accountId) {
        headers['X-Account-Id'] = accountId;
    }
    Object.entries(extra || {}).forEach(([k, v]) => {
        const val = toText(v);
        if (val) headers[k] = val;
    });
    return headers;
}

function hasFlevopayCredentials(config = {}) {
    return Boolean(cleanApiKey(config.apiKey || config.secretKey));
}

function resolveFlevopayCreateResponse(data = {}) {
    const item = data?.data && typeof data.data === 'object' ? data.data : data;
    const txid = toText(item.transaction_id || item.id || data.transaction_id || data.id);
    const externalId = toText(item.id || item.external_id || item.reference || data.id || data.external_id);
    const paymentCode = toText(
        item.qr_code ||
        item.pix_code ||
        item.pixCode ||
        item.qrcode ||
        item.paymentCode ||
        data.qr_code ||
        data.pix_code
    );
    const qrBase64 = toText(
        item.qr_code_base64 ||
        item.qrcode_base64 ||
        item.qrCodeBase64 ||
        data.qr_code_base64
    );

    let paymentCodeBase64 = '';
    let paymentQrUrl = '';

    if (qrBase64.startsWith('data:image')) {
        paymentQrUrl = qrBase64;
        if (qrBase64.startsWith('data:image/png;base64,')) {
            paymentCodeBase64 = qrBase64.replace(/^data:image\/png;base64,/, '');
        } else {
            paymentCodeBase64 = qrBase64;
        }
    } else if (qrBase64.startsWith('http://') || qrBase64.startsWith('https://')) {
        paymentQrUrl = qrBase64;
    } else if (qrBase64) {
        paymentCodeBase64 = qrBase64;
    }

    const rawStatus = toText(item.payment_status || item.status || data.payment_status || data.status || 'pending').toLowerCase();
    const amountInCents = Number(item.amount || data.amount || 0);
    const amount = Number((amountInCents / 100).toFixed(2));
    const fee = Number(item.fee || data.fee || 0);

    return {
        txid,
        paymentCode,
        paymentCodeBase64,
        paymentQrUrl,
        status: rawStatus,
        amount,
        amountInCents,
        fee,
        externalId: externalId || txid
    };
}

async function requestCreateTransaction(config = {}, payload = {}, options = {}) {
    const endpoint = resolveChargeEndpoint(config);
    const timeoutMs = Number(config.timeoutMs || 12000);
    const headers = buildHeaders(config, options.headers || {});

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

    const endpoint = resolveQueryEndpoint(config, txid);
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

function getFlevopayStatus(item = {}) {
    return toText(
        item?.payment_status ||
        item?.status ||
        item?.raw_status ||
        item?.transaction_status ||
        ''
    ).toLowerCase();
}

function isFlevopayPaidStatus(status = '') {
    const s = toText(status).toLowerCase();
    return s === 'approved' || s === 'paid' || s === 'completed' || s === 'concluded' || s === 'success';
}

function isFlevopayPendingStatus(status = '') {
    const s = toText(status).toLowerCase();
    return s === 'pending' || s === 'waiting_payment' || s === 'processing' || s === 'under_review' || s === 'in_process';
}

function isFlevopayRefundedStatus(status = '') {
    const s = toText(status).toLowerCase();
    return s === 'refunded' || s === 'charged_back' || s === 'chargeback';
}

function isFlevopayRefusedStatus(status = '') {
    const s = toText(status).toLowerCase();
    return s === 'failed' || s === 'refused' || s === 'rejected' || s === 'canceled' || s === 'cancelled' || s === 'expired';
}

function mapFlevopayStatusToUtmify(status = '') {
    const s = toText(status).toLowerCase();
    if (isFlevopayPaidStatus(s)) return 'paid';
    if (isFlevopayRefundedStatus(s)) return 'refunded';
    if (isFlevopayRefusedStatus(s)) return 'refused';
    return 'waiting_payment';
}

module.exports = {
    cleanApiKey,
    cleanAccountId,
    hasFlevopayCredentials,
    resolvePostbackUrl,
    resolveBaseUrl,
    resolveChargeEndpoint,
    resolveQueryEndpoint,
    resolveFlevopayCreateResponse,
    requestCreateTransaction,
    requestTransactionById,
    getFlevopayStatus,
    isFlevopayPaidStatus,
    isFlevopayPendingStatus,
    isFlevopayRefundedStatus,
    isFlevopayRefusedStatus,
    mapFlevopayStatusToUtmify
};
