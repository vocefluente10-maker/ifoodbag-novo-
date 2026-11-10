const { getPaymentsConfig } = require('./payments-config-store');
const { resolveRecoveryOffer } = require('./remarketing-recovery');
const { normalizePaymentHistoryStatus } = require('./lead-payment-history');
const { requestTransactionById: requestGhostspayStatus } = require('./ghostspay-provider');
const { requestTransactionById: requestSunizeStatus } = require('./sunize-provider');
const {
    requestTransactionById: requestParadiseStatus,
    requestTransactionByReference: requestParadiseByReference
} = require('./paradise-provider');
const { requestTransactionById: requestAtomopayStatus } = require('./atomopay-provider');
const { requestTransactionById: requestBravoPayStatus } = require('./bravopay-provider');
const {
    getGhostspayStatus,
    isGhostspayPaidStatus,
    isGhostspayRefundedStatus,
    isGhostspayChargebackStatus
} = require('./ghostspay-status');
const {
    getSunizeStatus,
    isSunizePaidStatus,
    isSunizeRefundedStatus
} = require('./sunize-status');
const {
    getParadiseStatus,
    isParadisePaidStatus,
    isParadiseRefundedStatus,
    isParadiseChargebackStatus
} = require('./paradise-status');
const {
    getAtomopayStatus,
    hasAtomopayPaidMarker,
    isAtomopayPaidStatus,
    isAtomopayRefundedStatus,
    isAtomopayChargebackStatus
} = require('./atomopay-status');
const {
    getBravoPayStatus,
    isBravoPayPaidStatus,
    isBravoPayRefundedStatus,
    isBravoPayChargebackStatus
} = require('./bravopay-status');

const REMARKETING_SMS_KIND = 'remarketing_payment_pending';
const DEFAULT_REMARKETING_DELAY_MINUTES = 10;
const DEFAULT_REMARKETING_MESSAGE = 'Oi {primeiro_nome}, seu pagamento de {preco} ficou pendente. Retome aqui: {link}';
const REMARKETING_SMS_VARIABLES = Object.freeze([
    { key: 'nome', label: 'Nome completo' },
    { key: 'primeiro_nome', label: 'Primeiro nome' },
    { key: 'telefone', label: 'Telefone' },
    { key: 'email', label: 'E-mail' },
    { key: 'preco', label: 'Valor do Pix' },
    { key: 'preco_original', label: 'Valor original' },
    { key: 'preco_com_desconto', label: 'Valor com desconto' },
    { key: 'desconto', label: 'Percentual de desconto' },
    { key: 'produto', label: 'Produto ou oferta' },
    { key: 'frete', label: 'Frete escolhido' },
    { key: 'valor_frete', label: 'Valor do frete' },
    { key: 'cidade', label: 'Cidade' },
    { key: 'estado', label: 'Estado' },
    { key: 'cep', label: 'CEP' },
    { key: 'txid', label: 'ID do Pix' },
    { key: 'session_id', label: 'Sessao do lead' },
    { key: 'link', label: 'Link de remarketing' }
]);

function asObject(value) {
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function pickText(...values) {
    for (const value of values) {
        const text = String(value ?? '').trim();
        if (text) return text;
    }
    return '';
}

function normalizeDelayMinutes(value) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return DEFAULT_REMARKETING_DELAY_MINUTES;
    return Math.min(Math.max(Math.round(parsed), 1), 1440);
}

function normalizeBaseUrl(value = '') {
    try {
        const url = new URL(String(value || '').trim());
        const localHost = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
        if (url.protocol !== 'https:' && !(url.protocol === 'http:' && localHost)) return '';
        return `${url.protocol}//${url.host}`;
    } catch (_error) {
        return '';
    }
}

function resolveRequestBaseUrl(req = {}) {
    const forwardedProto = pickText(req?.headers?.['x-forwarded-proto']).split(',')[0].trim();
    const protocol = forwardedProto || (process.env.NODE_ENV === 'production' ? 'https' : 'http');
    const host = pickText(req?.headers?.['x-forwarded-host'], req?.headers?.host).split(',')[0].trim();
    const fromRequest = normalizeBaseUrl(host ? `${protocol}://${host}` : '');
    return fromRequest || normalizeBaseUrl(process.env.APP_PUBLIC_URL || '');
}

function buildRemarketingUrl(baseUrl, sessionId) {
    const base = normalizeBaseUrl(baseUrl);
    const cleanSessionId = String(sessionId || '').trim();
    if (!base || !cleanSessionId) return '';
    return `${base}/remarketing?sessionId=${encodeURIComponent(cleanSessionId)}`;
}

function normalizeMessageText(value = '') {
    return String(value || '')
        .replace(/[\r\n]+/g, ' ')
        .replace(/\s{2,}/g, ' ')
        .trim();
}

function formatMoney(value) {
    const amount = Number(value);
    if (!Number.isFinite(amount)) return 'R$ 0,00';
    return amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }).replace(/\u00a0/g, ' ');
}

function buildRemarketingTemplateValues(lead = {}, offer = {}, link = '') {
    const payload = asObject(lead?.payload);
    const personal = asObject(payload?.personal);
    const shipping = asObject(payload?.shipping);
    const fullName = pickText(offer?.customerName, personal?.name, lead?.name, 'cliente');
    const firstName = fullName.split(/\s+/)[0] || 'cliente';
    const originalAmount = Number(offer?.originalAmount || lead?.pix_amount || payload?.pixAmount || 0);
    const discountedAmount = Number(offer?.discountedAmount || originalAmount || 0);
    const discountPercent = Number(offer?.discountPercent || 0);
    return {
        nome: fullName,
        name: fullName,
        primeiro_nome: firstName,
        telefone: pickText(lead?.phone, personal?.phone, personal?.phoneDigits),
        email: pickText(lead?.email, personal?.email),
        preco: formatMoney(originalAmount),
        preco_original: formatMoney(originalAmount),
        preco_com_desconto: formatMoney(discountedAmount),
        desconto: `${discountPercent}%`,
        produto: pickText(offer?.offerName, payload?.rewardName, asObject(payload?.reward)?.name, 'Pedido selecionado'),
        frete: pickText(shipping?.name, lead?.shipping_name, 'Nao informado'),
        valor_frete: formatMoney(shipping?.price ?? lead?.shipping_price ?? 0),
        cidade: pickText(lead?.city, asObject(payload?.address)?.city),
        estado: pickText(lead?.state, asObject(payload?.address)?.state),
        cep: pickText(lead?.cep, asObject(payload?.address)?.cep),
        txid: pickText(offer?.txid, lead?.pix_txid),
        session_id: pickText(offer?.sessionId, lead?.session_id, payload?.sessionId),
        link: String(link || '').trim()
    };
}

function renderRemarketingMessage(template, values = {}) {
    const cleanLink = String(values?.link || '').trim();
    if (!cleanLink || cleanLink.length > 160) return '';
    const rawTemplate = normalizeMessageText(template || DEFAULT_REMARKETING_MESSAGE);
    const withoutLink = normalizeMessageText(
        rawTemplate
            .replace(/\{([a-z0-9_]+)\}/gi, (match, key) => {
                if (String(key).toLowerCase() === 'link') return '';
                const normalizedKey = String(key).toLowerCase();
                const value = values?.[normalizedKey] ?? (normalizedKey === 'nome' ? values?.name : undefined);
                return value === undefined || value === null ? match : String(value);
            })
            .replace(/\{link\}/gi, '')
    );
    const availableTextLength = Math.max(0, 160 - cleanLink.length - 1);
    const text = withoutLink.slice(0, availableTextLength).trim().replace(/[,:;.!?\-]+$/g, '').trim();
    return text ? `${text} ${cleanLink}` : cleanLink;
}

function leadHasAnyPaidPayment(lead = {}) {
    const payload = asObject(lead?.payload);
    if (
        payload.pixPaidAt ||
        payload.pixRefundedAt ||
        /pix_(?:confirmed|paid|refunded)|pagamento_confirmado/i.test(String(lead?.last_event || ''))
    ) {
        return true;
    }
    const history = Array.isArray(payload.paymentHistory) ? payload.paymentHistory : [];
    return history.some((entry) => {
        const item = asObject(entry);
        return Boolean(
            item.paidAt ||
            item.refundedAt ||
            normalizePaymentHistoryStatus(item.status) === 'paid'
        );
    });
}

function buildRemarketingSmsJob({ sessionId = '', txid = '', createdAt = '', baseUrl = '', delayMinutes = 10 } = {}) {
    const cleanSessionId = String(sessionId || '').trim();
    const cleanTxid = String(txid || '').trim();
    const publicBaseUrl = normalizeBaseUrl(baseUrl);
    if (!cleanSessionId || !cleanTxid || !publicBaseUrl) return null;
    const createdAtMs = Date.parse(String(createdAt || '')) || Date.now();
    const scheduledAt = new Date(createdAtMs + normalizeDelayMinutes(delayMinutes) * 60 * 1000).toISOString();
    return {
        channel: 'smsmais',
        eventName: REMARKETING_SMS_KIND,
        kind: REMARKETING_SMS_KIND,
        dedupeKey: `smsmais:remarketing:${cleanSessionId}:${cleanTxid}`,
        scheduledAt,
        payload: {
            sessionId: cleanSessionId,
            txid: cleanTxid,
            baseUrl: publicBaseUrl
        }
    };
}

function shouldBackfillRemarketingSms(offer = {}, activatedAt = '', delayMinutes = 10, nowMs = Date.now()) {
    const createdAtMs = Date.parse(String(offer?.createdAt || ''));
    const activatedAtMs = Date.parse(String(activatedAt || ''));
    return Boolean(
        offer?.canRecover && offer?.status === 'pending' && offer?.sessionId && offer?.txid &&
        Number.isFinite(createdAtMs) && Number.isFinite(activatedAtMs) &&
        createdAtMs >= activatedAtMs &&
        createdAtMs + normalizeDelayMinutes(delayMinutes) * 60 * 1000 <= nowMs
    );
}

function prepareRemarketingSms({ lead = {}, smsConfig = {}, baseUrl = '' } = {}) {
    if (smsConfig?.remarketingEnabled !== true) {
        return { ok: true, skipped: true, reason: 'remarketing_disabled' };
    }
    if (leadHasAnyPaidPayment(lead)) {
        return { ok: true, skipped: true, reason: 'lead_already_paid' };
    }
    const offer = resolveRecoveryOffer(lead);
    if (!offer?.canRecover || offer.status !== 'pending') {
        return { ok: true, skipped: true, reason: 'no_pending_payment' };
    }
    const recoveryUrl = buildRemarketingUrl(baseUrl, offer.sessionId);
    const phone = pickText(lead?.phone, asObject(lead?.payload)?.personal?.phone, asObject(lead?.payload)?.personal?.phoneDigits);
    if (!phone) return { ok: true, skipped: true, reason: 'lead_without_phone' };
    const variables = buildRemarketingTemplateValues(lead, offer, recoveryUrl);
    const message = renderRemarketingMessage(smsConfig?.remarketingMessage, variables);
    if (!message) return { ok: false, reason: 'invalid_remarketing_message' };
    return {
        ok: true,
        payload: {
            to: phone,
            message,
            externalId: `remarketing-${offer.sessionId}-${offer.txid}`
        },
        offer,
        variables
    };
}

function paidResult(status, paid) {
    const normalizedStatus = String(status || '').trim().toLowerCase();
    if (!normalizedStatus) return { ok: false, reason: 'unknown_payment_status' };
    return {
        ok: true,
        paid: paid === true,
        pending: /waiting|pending|created|processing|open|unpaid|active/.test(normalizedStatus),
        status: normalizedStatus
    };
}

async function checkLivePaymentPaid(lead = {}, paymentsOverride = null, requestersOverride = {}) {
    if (leadHasAnyPaidPayment(lead)) return paidResult('paid_in_lead', true);
    const offer = resolveRecoveryOffer(lead);
    if (!offer?.txid || !offer?.gateway) return { ok: false, reason: 'missing_payment_reference' };
    const gateway = String(offer.gateway || '').trim().toLowerCase();
    const payments = paymentsOverride || await getPaymentsConfig();
    const config = {
        ...(payments?.gateways?.[gateway] || {}),
        timeoutMs: Math.min(Math.max(Number(payments?.gateways?.[gateway]?.timeoutMs || 7000), 2500), 7000)
    };

    try {
        if (gateway === 'ghostspay') {
            const requester = requestersOverride.ghostspay || requestGhostspayStatus;
            const { response, data } = await requester(config, offer.txid);
            if (!response?.ok) return { ok: false, reason: `ghostspay_status_${response?.status || 0}` };
            const status = getGhostspayStatus(data);
            return paidResult(status, isGhostspayPaidStatus(status) || isGhostspayRefundedStatus(status) || isGhostspayChargebackStatus(status));
        }
        if (gateway === 'sunize') {
            const requester = requestersOverride.sunize || requestSunizeStatus;
            const { response, data } = await requester(config, offer.txid);
            if (!response?.ok) return { ok: false, reason: `sunize_status_${response?.status || 0}` };
            const status = getSunizeStatus(data);
            return paidResult(status, isSunizePaidStatus(status) || isSunizeRefundedStatus(status));
        }
        if (gateway === 'paradise' || gateway === 'clownpay' || gateway === 'pingupag' || gateway === 'lumeapag') {
            const requester = requestersOverride[gateway] || requestParadiseStatus;
            const referenceRequester = requestersOverride[`${gateway}ByReference`] || requestParadiseByReference;
            let result = await requester(config, offer.txid);
            if (!result?.response?.ok && Number(result?.response?.status || 0) === 404) {
                const payload = asObject(lead?.payload);
                const externalRef = pickText(payload.pixExternalId, payload?.pix?.externalId);
                if (externalRef) result = await referenceRequester(config, externalRef);
            }
            if (!result?.response?.ok) return { ok: false, reason: `${gateway}_status_${result?.response?.status || 0}` };
            const data = Array.isArray(result.data) ? (result.data[0] || {}) : (result.data || {});
            const status = getParadiseStatus(data);
            return paidResult(status, isParadisePaidStatus(status) || isParadiseRefundedStatus(status) || isParadiseChargebackStatus(status));
        }
        if (gateway === 'atomopay') {
            const requester = requestersOverride.atomopay || requestAtomopayStatus;
            const { response, data } = await requester(config, offer.txid);
            if (!response?.ok) return { ok: false, reason: `atomopay_status_${response?.status || 0}` };
            const status = getAtomopayStatus(data);
            return paidResult(status, hasAtomopayPaidMarker(data) || isAtomopayPaidStatus(status) || isAtomopayRefundedStatus(status) || isAtomopayChargebackStatus(status));
        }
        if (gateway === 'bravopay') {
            const requester = requestersOverride.bravopay || requestBravoPayStatus;
            const { response, data } = await requester(config, offer.txid);
            if (!response?.ok) return { ok: false, reason: `bravopay_status_${response?.status || 0}` };
            const status = getBravoPayStatus(data);
            return paidResult(status, isBravoPayPaidStatus(status) || isBravoPayRefundedStatus(status) || isBravoPayChargebackStatus(status));
        }
        return { ok: false, reason: 'unsupported_payment_gateway' };
    } catch (error) {
        return { ok: false, reason: error?.message || 'payment_status_check_failed' };
    }
}

module.exports = {
    REMARKETING_SMS_KIND,
    DEFAULT_REMARKETING_DELAY_MINUTES,
    DEFAULT_REMARKETING_MESSAGE,
    REMARKETING_SMS_VARIABLES,
    normalizeDelayMinutes,
    normalizeBaseUrl,
    resolveRequestBaseUrl,
    buildRemarketingUrl,
    buildRemarketingTemplateValues,
    renderRemarketingMessage,
    leadHasAnyPaidPayment,
    buildRemarketingSmsJob,
    shouldBackfillRemarketingSms,
    prepareRemarketingSms,
    checkLivePaymentPaid
};
