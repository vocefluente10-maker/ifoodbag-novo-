const {
    updateLeadByPixTxid,
    getLeadByPixTxid,
    updateLeadBySessionId,
    getLeadBySessionId,
    findLeadByIdentity
} = require('../../lib/lead-store');
const { enqueueDispatch, processDispatchQueue } = require('../../lib/dispatch-queue');
const {
    normalizeActiveGatewayId,
    resolveGatewayWithFallback
} = require('../../lib/payment-gateway-config');
const { verifyWebhookSignature: verifyBravoPayWebhookSignature } = require('../../lib/bravopay-provider');
const { getPaymentsConfig } = require('../../lib/payments-config-store');
const { getSettings } = require('../../lib/settings-store');
const { sendPostSaleDeliveryEmail } = require('../../lib/email-sender');
const { buildPurchaseDispatchJobs } = require('../../lib/meta-capi');
const {
    getGhostspayTxid,
    getGhostspayStatus,
    getGhostspayAmount,
    getGhostspayUpdatedAt,
    isGhostspayPaidStatus,
    isGhostspayRefundedStatus,
    isGhostspayRefusedStatus,
    isGhostspayChargebackStatus,
    mapGhostspayStatusToUtmify
} = require('../../lib/ghostspay-status');
const {
    getSunizeTxid,
    getSunizeExternalId,
    getSunizeStatus,
    getSunizeUpdatedAt,
    getSunizeAmount,
    isSunizePaidStatus,
    isSunizeRefundedStatus,
    isSunizeRefusedStatus,
    mapSunizeStatusToUtmify
} = require('../../lib/sunize-status');
const {
    getParadiseTxid,
    getParadiseExternalId,
    getParadiseStatus,
    getParadiseUpdatedAt,
    getParadiseAmount,
    isParadisePaidStatus,
    isParadiseRefundedStatus,
    isParadiseChargebackStatus,
    isParadiseRefusedStatus,
    mapParadiseStatusToUtmify
} = require('../../lib/paradise-status');
const {
    getAtomopayTxid,
    getAtomopayStatus,
    hasAtomopayPaidMarker,
    getAtomopayUpdatedAt,
    getAtomopayAmount,
    getAtomopayTracking,
    getAtomopayCustomer,
    isAtomopayPaidStatus,
    isAtomopayPendingStatus,
    isAtomopayRefundedStatus,
    isAtomopayRefusedStatus,
    isAtomopayChargebackStatus,
    mapAtomopayStatusToUtmify
} = require('../../lib/atomopay-status');
const {
    getBravoPayTxid,
    getBravoPayExternalReference,
    getBravoPayStatus,
    getBravoPayUpdatedAt,
    getBravoPayAmount,
    getBravoPayFee,
    getBravoPayNet,
    getBravoPayTracking,
    getBravoPayCustomer,
    isBravoPayPaidStatus,
    isBravoPayPendingStatus,
    isBravoPayRefundedStatus,
    isBravoPayRefusedStatus,
    isBravoPayChargebackStatus,
    mapBravoPayStatusToUtmify
} = require('../../lib/bravopay-status');
const { mergePaymentHistory } = require('../../lib/lead-payment-history');

function deriveSessionIdFromGatewayReference(value = '') {
    let text = String(value || '').trim();
    if (!text) return '';
    text = text.replace(/-\d{10,}$/, '');
    text = text.replace(/-upsell$/, '');
    return text;
}

function normalizeDate(value) {
    if (!value && value !== 0) return null;
    if (value instanceof Date && !Number.isNaN(value.getTime())) return value.toISOString();
    if (typeof value === 'number') {
        const ms = value > 1e12 ? value : value * 1000;
        const d = new Date(ms);
        return Number.isNaN(d.getTime()) ? null : d.toISOString();
    }
    const str = String(value || '').trim();
    if (!str) return null;
    const saoPauloNaiveMatch = str.match(
        /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,6}))?$/
    );
    if (saoPauloNaiveMatch) {
        const [, year, month, day, hour, minute, second, fraction = ''] = saoPauloNaiveMatch;
        const milliseconds = Number(String(fraction || '').padEnd(3, '0').slice(0, 3) || 0);
        const utcMs = Date.UTC(
            Number(year),
            Number(month) - 1,
            Number(day),
            Number(hour) + 3,
            Number(minute),
            Number(second),
            milliseconds
        );
        const d = new Date(utcMs);
        return Number.isNaN(d.getTime()) ? null : d.toISOString();
    }
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(str)) {
        const d = new Date(str.replace(' ', 'T'));
        if (!Number.isNaN(d.getTime())) return d.toISOString();
    }
    const d = new Date(str);
    return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function asObject(input) {
    return input && typeof input === 'object' && !Array.isArray(input) ? input : {};
}

function firstQueryText(value) {
    const raw = Array.isArray(value) ? value[0] : value;
    return String(raw || '').trim();
}

function getLeadCurrentPixTxid(leadData) {
    const payload = asObject(leadData?.payload);
    return String(
        leadData?.pix_txid ||
        payload?.pixTxid ||
        payload?.pix?.idTransaction ||
        payload?.pix?.idtransaction ||
        payload?.pix?.txid ||
        ''
    ).trim();
}

function hasStaleSessionPixConflict(leadData, incomingTxid = '') {
    const requestedTxid = String(incomingTxid || '').trim();
    if (!leadData || !requestedTxid) return false;
    const currentTxid = getLeadCurrentPixTxid(leadData);
    return Boolean(currentTxid) && currentTxid !== requestedTxid;
}

function mergeLeadPayload(basePayload, patch) {
    return {
        ...asObject(basePayload),
        ...Object.fromEntries(
            Object.entries(asObject(patch)).filter(([, value]) => value !== undefined)
        )
    };
}

function normalizeStatusKey(value) {
    return String(value || '')
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '_');
}

function normalizeIso(value) {
    return normalizeDate(value) || '';
}

function lifecycleRank(eventName) {
    const name = String(eventName || '').trim().toLowerCase();
    if (!name) return 0;
    if (name === 'pix_pending' || name === 'pix_created' || name === 'upsell_pix_created') return 1;
    if (name === 'pix_confirmed' || name === 'upsell_pix_confirmed') return 2;
    if (name === 'pix_refused' || name === 'pix_failed') return 3;
    if (name === 'pix_refunded') return 4;
    return 0;
}

function isLifecycleRegression(previousEvent, nextEvent) {
    const prevRank = lifecycleRank(previousEvent);
    const nextRank = lifecycleRank(nextEvent);
    if (!prevRank || !nextRank) return false;
    return nextRank < prevRank;
}

function buildWebhookSignature({ gateway, eventId, txid, orderId, statusRaw, statusChangedAt }) {
    const base = [
        String(gateway || '').trim(),
        String(txid || orderId || '').trim(),
        normalizeStatusKey(statusRaw),
        normalizeIso(statusChangedAt)
    ].join('|');
    const evt = String(eventId || '').trim();
    return evt ? `${gateway}|evt:${evt}` : base;
}

function isDuplicateForLead(leadData, { webhookSignature, statusRaw, statusChangedAt, lastEvent }) {
    if (!leadData || !webhookSignature) return false;
    const payload = asObject(leadData.payload);
    if (String(payload.lastWebhookSignature || '') === webhookSignature) return true;

    const currentStatus = normalizeStatusKey(payload.pixStatus);
    const incomingStatus = normalizeStatusKey(statusRaw);
    const currentChangedAt = normalizeIso(payload.pixStatusChangedAt);
    const incomingChangedAt = normalizeIso(statusChangedAt);
    const currentEvent = String(leadData.last_event || '').trim().toLowerCase();
    const incomingEvent = String(lastEvent || '').trim().toLowerCase();
    const terminalEvents = new Set(['pix_confirmed', 'pix_refunded', 'pix_refused']);

    if (
        terminalEvents.has(currentEvent) &&
        currentEvent === incomingEvent &&
        currentStatus &&
        currentStatus === incomingStatus
    ) {
        return true;
    }

    return (
        currentStatus &&
        currentStatus === incomingStatus &&
        currentChangedAt &&
        currentChangedAt === incomingChangedAt &&
        currentEvent === incomingEvent
    );
}

function isUpsellLead(leadData) {
    const payload = asObject(leadData?.payload);
    const shippingId = String(leadData?.shipping_id || payload?.shipping?.id || payload?.shippingId || '').trim().toLowerCase();
    const shippingName = String(leadData?.shipping_name || payload?.shipping?.name || payload?.shippingName || '').trim().toLowerCase();
    if (payload?.upsell?.enabled === true || payload?.isUpsell === true) return true;
    if (shippingId === 'expresso_1dia' || shippingId === 'taxa_iof_bag' || shippingId === 'taxa_objeto_grande_correios') return true;
    return /adiantamento|prioridade|expresso|iof|correios|objeto_grande|objeto grande/.test(shippingName);
}

function looksLikeGhostspayWebhook(payload = {}) {
    const hasEvent = !!String(payload?.id || '').trim();
    const hasObject = !!String(payload?.objectId || payload?.data?.id || '').trim();
    const hasStatus = !!String(payload?.data?.status || payload?.status || '').trim();
    return hasEvent && hasObject && hasStatus;
}

function looksLikeSunizeWebhook(payload = {}) {
    const hasParadiseMarkers =
        Object.prototype.hasOwnProperty.call(payload || {}, 'pix_code') ||
        Object.prototype.hasOwnProperty.call(payload || {}, 'webhook_type') ||
        Object.prototype.hasOwnProperty.call(payload || {}, 'tracking') ||
        Object.prototype.hasOwnProperty.call(payload || {}, 'raw_status');
    if (hasParadiseMarkers) return false;

    const hasTx = !!String(payload?.id || payload?.transaction_id || payload?.transactionId || '').trim();
    const status = String(payload?.status || '').trim().toUpperCase();
    const hasStatus = ['PENDING', 'AUTHORIZED', 'FAILED', 'CHARGEBACK', 'IN_DISPUTE'].includes(status);
    const hasPaymentMethod = String(payload?.payment_method || payload?.paymentMethod || '').trim().toUpperCase() === 'PIX';
    const hasExternalId = !!String(payload?.external_id || payload?.externalId || '').trim();
    return hasTx && hasStatus && (hasPaymentMethod || hasExternalId);
}

function appendPaymentHistory(payload, {
    leadData = null,
    txid = '',
    gateway = '',
    statusRaw = '',
    amount = 0,
    changedAt = '',
    createdAt = '',
    body = null,
    evt = null
} = {}) {
    return mergePaymentHistory(payload, {
        txid,
        gateway,
        status: statusRaw,
        amount,
        changedAt,
        createdAt,
        shipping: asObject(leadData?.payload)?.shipping || {
            id: leadData?.shipping_id || '',
            name: leadData?.shipping_name || ''
        },
        reward: asObject(leadData?.payload)?.reward || null,
        upsell: asObject(leadData?.payload)?.upsell || null,
        bump: leadData?.bump_selected ? {
            selected: true,
            title: asObject(leadData?.payload)?.bump?.title || 'Seguro Bag',
            price: leadData?.bump_price
        } : null,
        payload: mergeLeadPayload(payload, {
            shipping: asObject(leadData?.payload)?.shipping,
            reward: asObject(leadData?.payload)?.reward,
            upsell: asObject(leadData?.payload)?.upsell,
            bump: asObject(leadData?.payload)?.bump,
            pix: asObject(body)?.pix,
            atomopay: evt ? buildAtomopayWebhookPayloadPatch(payload, evt, body) : undefined
        })
    });
}

function looksLikeParadiseWebhook(payload = {}) {
    const hasTx = !!String(payload?.transaction_id || payload?.transactionId || '').trim();
    const hasExternal = !!String(payload?.external_id || payload?.externalId || '').trim();
    const hasStatus = !!String(payload?.status || payload?.raw_status || '').trim();
    const hasMarker =
        Object.prototype.hasOwnProperty.call(payload || {}, 'pix_code') ||
        Object.prototype.hasOwnProperty.call(payload || {}, 'webhook_type') ||
        Object.prototype.hasOwnProperty.call(payload || {}, 'tracking') ||
        Object.prototype.hasOwnProperty.call(payload || {}, 'raw_status');
    return hasStatus && (hasTx || hasExternal) && hasMarker;
}

function hasAtomopayDocumentedTransactionKey(payload = {}) {
    const root = asObject(payload);
    const nested = asObject(root.data);
    const transaction = asObject(root.transaction || nested.transaction);
    const payment = asObject(root.payment || nested.payment);
    return Boolean(String(
        root.transaction_hash ||
        root.transactionHash ||
        root.hash ||
        nested.transaction_hash ||
        nested.transactionHash ||
        nested.hash ||
        transaction.transaction_hash ||
        transaction.transactionHash ||
        transaction.hash ||
        payment.transaction_hash ||
        payment.transactionHash ||
        payment.hash ||
        ''
    ).trim());
}

function looksLikeAtomopayWebhook(payload = {}) {
    if (!hasAtomopayDocumentedTransactionKey(payload)) return false;
    const hasTx = !!getAtomopayTxid(payload);
    const status = getAtomopayStatus(payload);
    const hasStatus = Boolean(
        status &&
        (
            isAtomopayPendingStatus(status) ||
            isAtomopayPaidStatus(status) ||
            isAtomopayRefundedStatus(status) ||
            isAtomopayRefusedStatus(status) ||
            isAtomopayChargebackStatus(status)
        )
    );
    const paymentMethod = String(
        payload?.payment_method ||
        payload?.paymentMethod ||
        payload?.data?.payment_method ||
        payload?.data?.paymentMethod ||
        payload?.transaction?.payment_method ||
        payload?.payment?.payment_method ||
        ''
    ).trim().toLowerCase();
    return hasTx && hasStatus && (!paymentMethod || paymentMethod === 'pix');
}

function looksLikeBravoPayWebhook(payload = {}) {
    const type = String(payload?.type || '').trim().toLowerCase();
    const data = asObject(payload?.data);
    const hasEvent = /^transaction\./.test(type);
    const hasTx = Boolean(String(data?.id || '').trim());
    const hasObject = String(data?.object || '').trim().toLowerCase() === 'transaction';
    return hasEvent && hasTx && hasObject;
}

function normalizeMoneyToBrl(value) {
    if (value === undefined || value === null || value === '') return 0;
    const raw = String(value).trim();
    if (!raw) return 0;
    const normalized = raw.replace(',', '.');
    const amount = Number(normalized);
    if (!Number.isFinite(amount)) return 0;
    const hasDecimalMark = /[.,]/.test(raw);
    if (hasDecimalMark) return Number(amount.toFixed(2));
    if (Number.isInteger(amount) && Math.abs(amount) >= 100) {
        return Number((amount / 100).toFixed(2));
    }
    return Number(amount.toFixed(2));
}

function buildLeadRewardSnapshot(payload = {}) {
    const reward = asObject(payload?.reward);
    const rewardId = String(reward?.id || payload?.rewardId || '').trim();
    const rewardName = String(reward?.name || reward?.title || payload?.rewardName || '').trim();
    const rewardPrice = normalizeMoneyToBrl(
        reward?.checkoutExtraPrice ??
        reward?.extraPrice ??
        reward?.price ??
        reward?.successDisplayPrice ??
        payload?.rewardExtraPrice ??
        0
    );
    if (!rewardId && !rewardName && rewardPrice <= 0) return null;
    return {
        id: rewardId || 'produto_ifood',
        name: rewardName || 'Produto iFood',
        checkoutExtraPrice: rewardPrice
    };
}

function buildAtomopayWebhookPayloadPatch(basePayload, evt = {}, rawBody = {}) {
    if (evt?.gateway !== 'atomopay') return {};
    const current = asObject(asObject(basePayload).atomopay);
    const amount = Number(evt.amount || 0);
    return {
        atomopay: {
            ...current,
            gateway: 'atomopay',
            hash: String(evt.txid || current.hash || '').trim(),
            status: String(evt.statusRaw || current.status || '').trim(),
            amountCents: Number.isFinite(amount) && amount > 0
                ? Math.round(amount * 100)
                : current.amountCents,
            lastWebhook: rawBody
        }
    };
}

function buildBravoPayWebhookPayloadPatch(basePayload, evt = {}, rawBody = {}) {
    if (evt?.gateway !== 'bravopay') return {};
    const current = asObject(asObject(basePayload).bravopay);
    const amount = Number(evt.amount || 0);
    return {
        bravopay: {
            ...current,
            gateway: 'bravopay',
            id: String(evt.txid || current.id || '').trim(),
            status: String(evt.statusRaw || current.status || '').trim(),
            amountCents: Number.isFinite(amount) && amount > 0
                ? Math.round(amount * 100)
                : current.amountCents,
            lastWebhook: rawBody
        }
    };
}

function extractGatewayEvent(gateway, body = {}, query = {}) {
    if (gateway === 'sunize') {
        const txid = getSunizeTxid(body);
        const statusRaw = getSunizeStatus(body);
        const utmifyStatus = mapSunizeStatusToUtmify(statusRaw);
        const isPaid = isSunizePaidStatus(statusRaw);
        const isRefunded = isSunizeRefundedStatus(statusRaw);
        const isRefused = isSunizeRefusedStatus(statusRaw);
        const amount = getSunizeAmount(body);
        const metadata = asObject(body?.metadata);
        const customer = asObject(body?.customer);
        const sessionOrderId = String(
            getSunizeExternalId(body) ||
            metadata?.orderId ||
            metadata?.externalreference ||
            ''
        ).trim();
        const statusChangedAt =
            normalizeDate(getSunizeUpdatedAt(body)) ||
            normalizeDate(body?.paid_at) ||
            normalizeDate(body?.paidAt) ||
            new Date().toISOString();
        const pixCreatedAtFromGateway =
            normalizeDate(body?.created_at) ||
            normalizeDate(body?.createdAt) ||
            null;
        const lastEvent = isPaid ? 'pix_confirmed' : isRefunded ? 'pix_refunded' : isRefused ? 'pix_refused' : 'pix_pending';

        return {
            gateway,
            txid,
            statusRaw,
            utmifyStatus,
            isPaid,
            isRefunded,
            isRefused,
            amount,
            gatewayFee: 0,
            userCommission: amount,
            sessionOrderId,
            statusChangedAt,
            pixCreatedAtFromGateway,
            lastEvent,
            webhookEventId: '',
            fallbackIdentity: {
                cpf: String(customer?.document || '').trim(),
                email: String(customer?.email || '').trim(),
                phone: String(customer?.phone || '').trim()
            },
            fallbackPersonal: {
                name: String(customer?.name || '').trim(),
                email: String(customer?.email || '').trim(),
                cpf: String(customer?.document || '').trim(),
                phone: String(customer?.phone || '').trim()
            },
            fallbackAddress: {
                street: '',
                neighborhood: '',
                city: '',
                state: '',
                cep: ''
            },
            fallbackUtm: {
                utm_source: String(body?.utm_source || metadata?.utm_source || '').trim(),
                utm_medium: String(body?.utm_medium || metadata?.utm_medium || '').trim(),
                utm_campaign: String(body?.utm_campaign || metadata?.utm_campaign || '').trim(),
                utm_term: String(body?.utm_term || metadata?.utm_term || '').trim(),
                utm_content: String(body?.utm_content || metadata?.utm_content || '').trim(),
                src: String(body?.src || metadata?.src || '').trim(),
                sck: String(body?.sck || metadata?.sck || '').trim(),
                fbclid: String(body?.fbclid || metadata?.fbclid || '').trim(),
                gclid: String(body?.gclid || metadata?.gclid || '').trim(),
                ttclid: String(body?.ttclid || metadata?.ttclid || '').trim()
            }
        };
    }

    if (gateway === 'paradise' || gateway === 'clownpay' || gateway === 'pingupag' || gateway === 'lumeapag') {
        const txid = getParadiseTxid(body);
        const statusRaw = getParadiseStatus(body);
        const utmifyStatus = mapParadiseStatusToUtmify(statusRaw);
        const isPaid = isParadisePaidStatus(statusRaw);
        const isRefunded = isParadiseRefundedStatus(statusRaw);
        const isRefused = isParadiseRefusedStatus(statusRaw) || isParadiseChargebackStatus(statusRaw);
        const amount = gateway === 'clownpay' ? Number(body.amount) / 100 : getParadiseAmount(body);
        const metadata = asObject(body?.metadata);
        const tracking = asObject(body?.tracking);
        const customer = asObject(body?.customer);
        const paradiseExternalId = getParadiseExternalId(body);
        const sessionOrderId = String(
            metadata?.sessionId ||
            tracking?.sessionId ||
            metadata?.orderId ||
            tracking?.orderId ||
            deriveSessionIdFromGatewayReference(paradiseExternalId) ||
            paradiseExternalId ||
            ''
        ).trim();
        const statusChangedAt =
            normalizeDate(getParadiseUpdatedAt(body)) ||
            normalizeDate(body?.timestamp) ||
            normalizeDate(body?.updated_at) ||
            new Date().toISOString();
        const pixCreatedAtFromGateway =
            normalizeDate(body?.created_at) ||
            normalizeDate(body?.createdAt) ||
            null;
        const lastEvent = isPaid ? 'pix_confirmed' : isRefunded ? 'pix_refunded' : isRefused ? 'pix_refused' : 'pix_pending';
        const gatewayFee = normalizeMoneyToBrl(
            body?.fee ||
            body?.gateway_fee ||
            body?.gatewayFee ||
            0
        );
        const userCommission = Math.max(0, Number((amount - gatewayFee).toFixed(2)));

        return {
            gateway,
            txid,
            statusRaw,
            utmifyStatus,
            isPaid,
            isRefunded,
            isRefused,
            amount,
            gatewayFee,
            userCommission,
            sessionOrderId,
            statusChangedAt,
            pixCreatedAtFromGateway,
            lastEvent,
            webhookEventId: String(body?.webhook_id || body?.event_id || '').trim(),
            fallbackIdentity: {
                cpf: String(customer?.document || '').trim(),
                email: String(customer?.email || '').trim(),
                phone: String(customer?.phone || '').trim()
            },
            fallbackPersonal: {
                name: String(customer?.name || '').trim(),
                email: String(customer?.email || '').trim(),
                cpf: String(customer?.document || '').trim(),
                phone: String(customer?.phone || '').trim()
            },
            fallbackAddress: {
                street: '',
                neighborhood: '',
                city: '',
                state: '',
                cep: ''
            },
            fallbackUtm: {
                utm_source: String(tracking?.utm_source || metadata?.utm_source || '').trim(),
                utm_medium: String(tracking?.utm_medium || metadata?.utm_medium || '').trim(),
                utm_campaign: String(tracking?.utm_campaign || metadata?.utm_campaign || '').trim(),
                utm_term: String(tracking?.utm_term || metadata?.utm_term || '').trim(),
                utm_content: String(tracking?.utm_content || metadata?.utm_content || '').trim(),
                src: String(tracking?.src || metadata?.src || '').trim(),
                sck: String(tracking?.sck || metadata?.sck || '').trim(),
                fbclid: String(tracking?.fbclid || metadata?.fbclid || '').trim(),
                gclid: String(tracking?.gclid || metadata?.gclid || '').trim(),
                ttclid: String(tracking?.ttclid || metadata?.ttclid || '').trim()
            }
        };
    }

    if (gateway === 'atomopay') {
        const txid = getAtomopayTxid(body);
        let statusRaw = getAtomopayStatus(body);
        const paidByMarker = hasAtomopayPaidMarker(body);
        if (paidByMarker && !isAtomopayPaidStatus(statusRaw)) {
            statusRaw = 'paid';
        }
        const utmifyStatus = mapAtomopayStatusToUtmify(statusRaw);
        const isPaid = isAtomopayPaidStatus(statusRaw) || paidByMarker;
        const isRefunded = isAtomopayRefundedStatus(statusRaw);
        const isRefused = isAtomopayRefusedStatus(statusRaw) || isAtomopayChargebackStatus(statusRaw);
        const amount = getAtomopayAmount(body);
        const tracking = asObject(getAtomopayTracking(body));
        const customer = asObject(getAtomopayCustomer(body));
        const sessionOrderId = String(
            firstQueryText(query?.session_id) ||
            firstQueryText(query?.sessionId) ||
            firstQueryText(query?.order_id) ||
            firstQueryText(query?.orderId) ||
            tracking?.orderId ||
            tracking?.sessionId ||
            tracking?.session_id ||
            ''
        ).trim();
        const statusChangedAt =
            normalizeDate(getAtomopayUpdatedAt(body)) ||
            normalizeDate(body?.paid_at) ||
            normalizeDate(body?.data?.paid_at) ||
            new Date().toISOString();
        const pixCreatedAtFromGateway =
            normalizeDate(body?.created_at) ||
            normalizeDate(body?.createdAt) ||
            normalizeDate(body?.data?.created_at) ||
            normalizeDate(body?.data?.createdAt) ||
            null;
        const lastEvent = isPaid ? 'pix_confirmed' : isRefunded ? 'pix_refunded' : isRefused ? 'pix_refused' : 'pix_pending';

        return {
            gateway,
            txid,
            statusRaw,
            utmifyStatus,
            isPaid,
            isRefunded,
            isRefused,
            amount,
            gatewayFee: 0,
            userCommission: amount,
            sessionOrderId,
            statusChangedAt,
            pixCreatedAtFromGateway,
            lastEvent,
            webhookEventId: '',
            fallbackIdentity: {
                cpf: String(customer?.document || '').trim(),
                email: String(customer?.email || '').trim(),
                phone: String(customer?.phone || customer?.phone_number || '').trim()
            },
            fallbackPersonal: {
                name: String(customer?.name || '').trim(),
                email: String(customer?.email || '').trim(),
                cpf: String(customer?.document || '').trim(),
                phone: String(customer?.phone || customer?.phone_number || '').trim()
            },
            fallbackAddress: {
                street: String(customer?.street_name || '').trim(),
                neighborhood: String(customer?.neighborhood || '').trim(),
                city: String(customer?.city || '').trim(),
                state: String(customer?.state || '').trim(),
                cep: String(customer?.zip_code || '').trim()
            },
            fallbackUtm: {
                utm_source: String(tracking?.utm_source || '').trim(),
                utm_medium: String(tracking?.utm_medium || '').trim(),
                utm_campaign: String(tracking?.utm_campaign || '').trim(),
                utm_term: String(tracking?.utm_term || '').trim(),
                utm_content: String(tracking?.utm_content || '').trim(),
                src: String(tracking?.src || '').trim(),
                sck: ''
            }
        };
    }

    if (gateway === 'bravopay') {
        const txid = getBravoPayTxid(body);
        const statusRaw = getBravoPayStatus(body);
        const utmifyStatus = mapBravoPayStatusToUtmify(statusRaw);
        const isPaid = isBravoPayPaidStatus(statusRaw);
        const isRefunded = isBravoPayRefundedStatus(statusRaw);
        const isRefused = isBravoPayRefusedStatus(statusRaw) || isBravoPayChargebackStatus(statusRaw);
        const amount = getBravoPayAmount(body);
        const gatewayFee = getBravoPayFee(body);
        const net = getBravoPayNet(body);
        const tracking = asObject(getBravoPayTracking(body));
        const customer = asObject(getBravoPayCustomer(body));
        const externalReference = getBravoPayExternalReference(body);
        const sessionOrderId = String(
            tracking?.orderId ||
            tracking?.sessionId ||
            deriveSessionIdFromGatewayReference(externalReference) ||
            externalReference ||
            ''
        ).trim();
        const statusChangedAt =
            normalizeDate(getBravoPayUpdatedAt(body)) ||
            normalizeDate(body?.created_at) ||
            new Date().toISOString();
        const pixCreatedAtFromGateway =
            normalizeDate(asObject(body?.data)?.created_at) ||
            normalizeDate(body?.created_at) ||
            null;
        const lastEvent = isPaid ? 'pix_confirmed' : isRefunded ? 'pix_refunded' : isRefused ? 'pix_refused' : 'pix_pending';

        return {
            gateway,
            txid,
            statusRaw,
            utmifyStatus,
            isPaid,
            isRefunded,
            isRefused,
            amount,
            gatewayFee,
            userCommission: net > 0 ? net : Math.max(0, Number((amount - gatewayFee).toFixed(2))),
            sessionOrderId,
            statusChangedAt,
            pixCreatedAtFromGateway,
            lastEvent,
            webhookEventId: String(body?.id || '').trim(),
            fallbackIdentity: {
                cpf: String(customer?.cpf || '').trim(),
                email: String(customer?.email || '').trim(),
                phone: String(customer?.phone || '').trim()
            },
            fallbackPersonal: {
                name: String(customer?.name || '').trim(),
                email: String(customer?.email || '').trim(),
                cpf: String(customer?.cpf || '').trim(),
                phone: String(customer?.phone || '').trim()
            },
            fallbackAddress: {
                street: '',
                neighborhood: '',
                city: '',
                state: '',
                cep: ''
            },
            fallbackUtm: {
                utm_source: String(tracking?.utm_source || tracking?.source || '').trim(),
                utm_medium: String(tracking?.utm_medium || tracking?.medium || '').trim(),
                utm_campaign: String(tracking?.utm_campaign || tracking?.campaign || '').trim(),
                utm_term: String(tracking?.utm_term || tracking?.term || '').trim(),
                utm_content: String(tracking?.utm_content || tracking?.content || '').trim(),
                fbclid: String(tracking?.fbclid || '').trim(),
                gclid: String(tracking?.gclid || '').trim(),
                ttclid: String(tracking?.ttclid || '').trim()
            }
        };
    }

    if (gateway === 'ghostspay') {
        const txid = getGhostspayTxid(body);
        const statusRaw = getGhostspayStatus(body);
        const utmifyStatus = mapGhostspayStatusToUtmify(statusRaw);
        const isPaid = isGhostspayPaidStatus(statusRaw);
        const isRefunded = isGhostspayRefundedStatus(statusRaw);
        const isRefused = isGhostspayRefusedStatus(statusRaw) || isGhostspayChargebackStatus(statusRaw);
        const amount = getGhostspayAmount(body);
        const metadata = asObject(body?.data?.metadata);
        const customer = asObject(body?.data?.customer);
        const document = asObject(customer?.document);
        const sessionOrderId = String(
            metadata?.orderId ||
            metadata?.externalreference ||
            body?.data?.externalreference ||
            body?.data?.external_reference ||
            body?.objectId ||
            ''
        ).trim();
        const statusChangedAt =
            normalizeDate(getGhostspayUpdatedAt(body)) ||
            normalizeDate(body?.data?.paidAt) ||
            normalizeDate(body?.data?.updatedAt) ||
            new Date().toISOString();
        const pixCreatedAtFromGateway =
            normalizeDate(body?.data?.createdAt) ||
            normalizeDate(body?.createdAt) ||
            null;
        const lastEvent = isPaid ? 'pix_confirmed' : isRefunded ? 'pix_refunded' : isRefused ? 'pix_refused' : 'pix_pending';
        const gatewayFee = normalizeMoneyToBrl(body?.data?.gatewayFee || body?.data?.fee || 0);
        const userCommission = Math.max(0, Number((amount - gatewayFee).toFixed(2)));

        return {
            gateway,
            txid,
            statusRaw,
            utmifyStatus,
            isPaid,
            isRefunded,
            isRefused,
            amount,
            gatewayFee,
            userCommission,
            sessionOrderId,
            statusChangedAt,
            pixCreatedAtFromGateway,
            lastEvent,
            webhookEventId: String(body?.id || '').trim(),
            fallbackIdentity: {
                cpf: String(document?.number || '').trim(),
                email: String(customer?.email || '').trim(),
                phone: String(customer?.phone || '').trim()
            },
            fallbackPersonal: {
                name: String(customer?.name || '').trim(),
                email: String(customer?.email || '').trim(),
                cpf: String(document?.number || '').trim(),
                phone: String(customer?.phone || '').trim()
            },
            fallbackAddress: {
                street: '',
                neighborhood: '',
                city: '',
                state: '',
                cep: ''
            },
            fallbackUtm: {
                utm_source: String(metadata?.utm_source || '').trim(),
                utm_medium: String(metadata?.utm_medium || '').trim(),
                utm_campaign: String(metadata?.utm_campaign || '').trim(),
                utm_term: String(metadata?.utm_term || '').trim(),
                utm_content: String(metadata?.utm_content || '').trim(),
                src: String(metadata?.src || '').trim(),
                sck: String(metadata?.sck || '').trim(),
                fbclid: String(metadata?.fbclid || '').trim(),
                gclid: String(metadata?.gclid || '').trim(),
                ttclid: String(metadata?.ttclid || '').trim()
            }
        };
    }

    return {
        gateway,
        txid: '',
        statusRaw: '',
        utmifyStatus: 'waiting_payment',
        isPaid: false,
        isRefunded: false,
        isRefused: false,
        amount: 0,
        gatewayFee: 0,
        userCommission: 0,
        sessionOrderId: '',
        statusChangedAt: new Date().toISOString(),
        pixCreatedAtFromGateway: null,
        lastEvent: 'pix_pending',
        webhookEventId: '',
        fallbackIdentity: { cpf: '', email: '', phone: '' },
        fallbackPersonal: { name: '', email: '', cpf: '', phone: '' },
        fallbackAddress: { street: '', neighborhood: '', city: '', state: '', cep: '' },
        fallbackUtm: {}
    };
}

function resolveWebhookGateway(query = {}, body = {}, payments = {}) {
    const requestedRaw = String(query.gateway || query.provider || body.gateway || body.provider || '').trim();
    if (requestedRaw) {
        return normalizeActiveGatewayId(requestedRaw, payments.activeGateway);
    }
    if (looksLikeParadiseWebhook(body)) return 'paradise';
    if (looksLikeSunizeWebhook(body)) return 'sunize';
    if (looksLikeBravoPayWebhook(body)) return 'bravopay';
    if (looksLikeGhostspayWebhook(body)) return 'ghostspay';
    if (looksLikeAtomopayWebhook(body)) return 'atomopay';
    return resolveGatewayWithFallback(payments.activeGateway, payments);
}

async function readRawBody(req) {
    if (typeof req.body === 'string') return req.body;
    if (req.body && typeof req.body === 'object' && Object.keys(req.body).length > 0) {
        return JSON.stringify(req.body);
    }
    const chunks = [];
    for await (const chunk of req) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    return Buffer.concat(chunks).toString('utf8');
}

const pixWebhookHandler = async (req, res) => {
    if (req.method !== 'POST') {
        res.status(405).json({ status: 'method_not_allowed' });
        return;
    }

    let body = {};
    let rawBody = '';
    try {
        rawBody = await readRawBody(req);
        body = rawBody ? JSON.parse(rawBody || '{}') : {};
    } catch (_error) {
        body = {};
    }

    const payments = await getPaymentsConfig();
    const gateway = resolveWebhookGateway(req.query || {}, body, payments);
    const gatewayConfig = payments?.gateways?.[gateway] || {};

    if (gateway === 'bravopay') {
        const signature = String(req.headers?.['x-bravopay-signature'] || '').trim();
        const secret = String(gatewayConfig.webhookSecret || gatewayConfig.webhookToken || '').trim();
        if (!secret || !verifyBravoPayWebhookSignature(rawBody, signature, secret)) {
            res.status(401).json({ status: 'invalid_signature' });
            return;
        }
    } else {
        const token = String(req.query?.token || '').trim();
        const headerToken = String(req.headers?.['x-webhook-token'] || '').trim();
        const expectedToken = String(gatewayConfig.webhookToken || '').trim();
        const tokenRequired = gatewayConfig.webhookTokenRequired !== false;
        const tokenOk = !tokenRequired
            ? true
            : expectedToken
                ? ((token && token === expectedToken) || (headerToken && headerToken === expectedToken))
                : true;
        if (!tokenOk) {
            res.status(401).json({ status: 'unauthorized' });
            return;
        }
    }

    if (gateway === 'clownpay') {
        try {
            body = await require('../../lib/clownpay-provider').verifyWebhook({ ...gatewayConfig, account: req.query?.account === 'subaccount' ? 'subaccount' : 'main' }, body);
            const stored = await getLeadByPixTxid(body.transaction_id);
            if (!stored?.ok || !stored.data) throw new Error('transaction_not_saved');
            const saved = asObject(stored.data.payload);
            const savedGateway = saved.pixGateway || saved.gateway || saved.pix?.gateway;
            const savedReference = saved.pixExternalId || saved.pix?.externalId;
            const savedAmount = Number(saved.pix?.amount);
            if (savedGateway !== 'clownpay' || savedReference !== body.external_id ||
                !Number.isFinite(savedAmount) || Math.round(savedAmount * 100) !== Number(body.amount)) {
                throw new Error('transaction_mismatch');
            }
        } catch (_error) {
            res.status(503).json({ status: 'verification_failed' });
            return;
        }
    }

    const evt = extractGatewayEvent(gateway, body, req.query || {});
    const txid = evt.txid;
    const statusRaw = evt.statusRaw;
    const utmifyStatus = evt.utmifyStatus;
    const isPaid = evt.isPaid;
    const isRefunded = evt.isRefunded;
    const isRefused = evt.isRefused;
    const amount = evt.amount;
    const gatewayFee = evt.gatewayFee;
    const userCommission = evt.userCommission;
    const sessionOrderId = evt.sessionOrderId;
    const statusChangedAt = evt.statusChangedAt;
    const pixCreatedAtFromGateway = evt.pixCreatedAtFromGateway;
    const lastEvent = evt.lastEvent;
    const webhookSignature = buildWebhookSignature({
        gateway,
        eventId: evt.webhookEventId,
        txid,
        orderId: sessionOrderId,
        statusRaw,
        statusChangedAt
    });

    let previousLastEvent = '';
    let previousEventCaptured = false;
    const rememberPreviousEvent = (lead) => {
        if (previousEventCaptured || !lead) return;
        previousEventCaptured = true;
        previousLastEvent = String(lead.last_event || '').trim().toLowerCase();
    };

    let leadData = null;
    if (txid) {
        const lead = await getLeadByPixTxid(txid).catch(() => ({ ok: false, data: null }));
        leadData = lead?.ok ? lead.data : null;
        if (!leadData && sessionOrderId) {
            const bySessionBefore = await getLeadBySessionId(sessionOrderId).catch(() => ({ ok: false, data: null }));
            const sessionLead = bySessionBefore?.ok ? bySessionBefore.data : null;
            if (hasStaleSessionPixConflict(sessionLead, txid)) {
                res.status(200).json({ status: 'stale_txid_ignored', gateway, txid });
                return;
            }
            leadData = sessionLead;
        }
        rememberPreviousEvent(leadData);

        if (isLifecycleRegression(previousLastEvent, lastEvent)) {
            res.status(200).json({ status: 'regression_ignored', gateway });
            return;
        }

        if (isDuplicateForLead(leadData, { webhookSignature, statusRaw, statusChangedAt, lastEvent })) {
            res.status(200).json({ status: 'duplicate_ignored' });
            return;
        }

        let payloadPatch = mergeLeadPayload(leadData?.payload, {
            gateway,
            pixGateway: gateway,
            paymentGateway: gateway,
            pixTxid: txid,
            pixStatus: statusRaw || null,
            pixStatusChangedAt: statusChangedAt,
            pixCreatedAt: asObject(leadData?.payload).pixCreatedAt || pixCreatedAtFromGateway || leadData?.created_at || undefined,
            pixPaidAt: isPaid ? statusChangedAt : undefined,
            pixRefundedAt: isRefunded ? statusChangedAt : undefined,
            pixRefusedAt: isRefused ? statusChangedAt : undefined,
            lastWebhookSignature: webhookSignature || undefined,
            ...buildAtomopayWebhookPayloadPatch(leadData?.payload, evt, body),
            ...buildBravoPayWebhookPayloadPatch(leadData?.payload, evt, body)
        });
        payloadPatch = appendPaymentHistory(payloadPatch, {
            leadData,
            txid,
            gateway,
            statusRaw,
            amount,
            changedAt: statusChangedAt,
            createdAt: pixCreatedAtFromGateway || leadData?.created_at,
            body,
            evt
        });
        const upByTx = await updateLeadByPixTxid(txid, {
            last_event: lastEvent,
            stage: 'pix',
            payload: payloadPatch
        }).catch(() => ({ ok: false, count: 0 }));
        if ((!upByTx?.ok || Number(upByTx?.count || 0) === 0) && sessionOrderId) {
            const bySessionBefore = leadData || (await getLeadBySessionId(sessionOrderId).catch(() => ({ ok: false, data: null })))?.data;
            if (!hasStaleSessionPixConflict(bySessionBefore, txid)) {
                let sessionPayloadPatch = mergeLeadPayload(bySessionBefore?.payload, {
                    gateway,
                    pixGateway: gateway,
                    paymentGateway: gateway,
                    pixTxid: txid,
                    pixStatus: statusRaw || null,
                    pixStatusChangedAt: statusChangedAt,
                    pixCreatedAt: asObject(bySessionBefore?.payload).pixCreatedAt || pixCreatedAtFromGateway || bySessionBefore?.created_at || undefined,
                    pixPaidAt: isPaid ? statusChangedAt : undefined,
                    pixRefundedAt: isRefunded ? statusChangedAt : undefined,
                    pixRefusedAt: isRefused ? statusChangedAt : undefined,
                    lastWebhookSignature: webhookSignature || undefined,
                    ...buildAtomopayWebhookPayloadPatch(bySessionBefore?.payload, evt, body),
                    ...buildBravoPayWebhookPayloadPatch(bySessionBefore?.payload, evt, body)
                });
                sessionPayloadPatch = appendPaymentHistory(sessionPayloadPatch, {
                    leadData: bySessionBefore,
                    txid,
                    gateway,
                    statusRaw,
                    amount,
                    changedAt: statusChangedAt,
                    createdAt: pixCreatedAtFromGateway || bySessionBefore?.created_at,
                    body,
                    evt
                });
                await updateLeadBySessionId(sessionOrderId, {
                    last_event: lastEvent,
                    stage: 'pix',
                    payload: sessionPayloadPatch
                }).catch(() => ({ ok: false, count: 0 }));
            }
        }
        const refreshed = await getLeadByPixTxid(txid).catch(() => ({ ok: false, data: null }));
        leadData = refreshed?.ok ? refreshed.data : null;
        if (!leadData && sessionOrderId) {
            const bySessionAfter = await getLeadBySessionId(sessionOrderId).catch(() => ({ ok: false, data: null }));
            const sessionLead = bySessionAfter?.ok ? bySessionAfter.data : null;
            if (!hasStaleSessionPixConflict(sessionLead, txid)) {
                leadData = sessionLead;
            }
        }
        rememberPreviousEvent(leadData);
    } else if (sessionOrderId) {
        const bySessionBefore = await getLeadBySessionId(sessionOrderId).catch(() => ({ ok: false, data: null }));
        const leadBefore = bySessionBefore?.ok ? bySessionBefore.data : null;
        rememberPreviousEvent(leadBefore);

        if (isLifecycleRegression(previousLastEvent, lastEvent)) {
            res.status(200).json({ status: 'regression_ignored', gateway });
            return;
        }

        if (isDuplicateForLead(leadBefore, { webhookSignature, statusRaw, statusChangedAt, lastEvent })) {
            res.status(200).json({ status: 'duplicate_ignored' });
            return;
        }
        let payloadPatch = mergeLeadPayload(leadBefore?.payload, {
            gateway,
            pixGateway: gateway,
            paymentGateway: gateway,
            pixStatus: statusRaw || null,
            pixStatusChangedAt: statusChangedAt,
            pixCreatedAt: asObject(leadBefore?.payload).pixCreatedAt || pixCreatedAtFromGateway || leadBefore?.created_at || undefined,
            pixPaidAt: isPaid ? statusChangedAt : undefined,
            pixRefundedAt: isRefunded ? statusChangedAt : undefined,
            pixRefusedAt: isRefused ? statusChangedAt : undefined,
            lastWebhookSignature: webhookSignature || undefined,
            ...buildAtomopayWebhookPayloadPatch(leadBefore?.payload, evt, body),
            ...buildBravoPayWebhookPayloadPatch(leadBefore?.payload, evt, body)
        });
        payloadPatch = appendPaymentHistory(payloadPatch, {
            leadData: leadBefore,
            txid,
            gateway,
            statusRaw,
            amount,
            changedAt: statusChangedAt,
            createdAt: pixCreatedAtFromGateway || leadBefore?.created_at,
            body,
            evt
        });
        await updateLeadBySessionId(sessionOrderId, {
            last_event: lastEvent,
            stage: 'pix',
            payload: payloadPatch
        }).catch(() => ({ ok: false, count: 0 }));
        const bySession = await getLeadBySessionId(sessionOrderId).catch(() => ({ ok: false, data: null }));
        leadData = bySession?.ok ? bySession.data : null;
        rememberPreviousEvent(leadData);
    }

    if (!leadData) {
        const byIdentity = await findLeadByIdentity(evt.fallbackIdentity || {}).catch(() => ({ ok: false, data: null }));
        if (byIdentity?.ok && byIdentity?.data) {
            leadData = byIdentity.data;
            if (hasStaleSessionPixConflict(leadData, txid)) {
                res.status(200).json({ status: 'stale_txid_ignored', gateway, txid });
                return;
            }
            rememberPreviousEvent(leadData);
            if (isLifecycleRegression(previousLastEvent, lastEvent)) {
                res.status(200).json({ status: 'regression_ignored', gateway });
                return;
            }
            if (isDuplicateForLead(leadData, { webhookSignature, statusRaw, statusChangedAt, lastEvent })) {
                res.status(200).json({ status: 'duplicate_ignored' });
                return;
            }
            let payloadPatch = mergeLeadPayload(leadData?.payload, {
                gateway,
                pixGateway: gateway,
                paymentGateway: gateway,
                pixTxid: txid || asObject(leadData?.payload).pixTxid || undefined,
                pixStatus: statusRaw || null,
                pixStatusChangedAt: statusChangedAt,
                pixCreatedAt: asObject(leadData?.payload).pixCreatedAt || pixCreatedAtFromGateway || leadData?.created_at || undefined,
                pixPaidAt: isPaid ? statusChangedAt : undefined,
                pixRefundedAt: isRefunded ? statusChangedAt : undefined,
                pixRefusedAt: isRefused ? statusChangedAt : undefined,
                lastWebhookSignature: webhookSignature || undefined,
                ...buildAtomopayWebhookPayloadPatch(leadData?.payload, evt, body),
                ...buildBravoPayWebhookPayloadPatch(leadData?.payload, evt, body)
            });
            payloadPatch = appendPaymentHistory(payloadPatch, {
                leadData,
                txid,
                gateway,
                statusRaw,
                amount,
                changedAt: statusChangedAt,
                createdAt: pixCreatedAtFromGateway || leadData?.created_at,
                body,
                evt
            });
            await updateLeadBySessionId(leadData.session_id, {
                last_event: lastEvent,
                stage: 'pix',
                payload: payloadPatch
            }).catch(() => ({ ok: false, count: 0 }));
        }
    }

    const leadUtm = leadData?.payload?.utm || {};
    const leadPayload = asObject(leadData?.payload);
    const leadTxid = String(
        leadData?.pix_txid ||
        leadPayload?.pixTxid ||
        leadPayload?.pix?.idTransaction ||
        leadPayload?.pix?.idtransaction ||
        ''
    ).trim();
    const effectiveTxid = String(txid || leadTxid || '').trim();
    const leadMatchesTxid = !txid || (leadTxid && leadTxid === txid);
    const normalizedEventAmount = normalizeMoneyToBrl(amount);
    const amountFromLead = leadMatchesTxid
        ? normalizeMoneyToBrl(
            leadPayload?.pixAmount ||
            leadData?.pix_amount ||
            leadPayload?.pix?.amount ||
            0
        )
        : 0;
    const fallbackLeadAmount = leadMatchesTxid
        ? normalizeMoneyToBrl(
            Number(leadData?.shipping_price || 0) + Number(leadData?.bump_price || 0)
        )
        : 0;
    const eventAmount = normalizedEventAmount > 0
        ? normalizedEventAmount
        : amountFromLead > 0
            ? amountFromLead
            : fallbackLeadAmount;
    const orderId =
        String(
            leadData?.session_id ||
            sessionOrderId ||
            body?.external_id ||
            body?.externalId ||
            body?.tracking?.orderId ||
            body?.metadata?.orderId ||
            body?.orderId ||
            effectiveTxid ||
            ''
        ).trim();

    const upsellEvent = isUpsellLead(leadData);
    const rewardSnapshot = upsellEvent ? null : buildLeadRewardSnapshot(leadPayload);
    const eventName = isPaid
        ? (upsellEvent ? 'upsell_pix_confirmed' : 'pix_confirmed')
        : isRefunded
            ? 'pix_refunded'
            : isRefused
                ? 'pix_failed'
                : (upsellEvent ? 'upsell_pix_created' : 'pix_created');
    const dedupeBase = effectiveTxid || orderId || 'unknown';
    const isTerminalUpdate = Boolean(isPaid || isRefunded || isRefused);
    const shouldSendUtmStatus =
        Boolean(orderId || effectiveTxid) &&
        previousLastEvent !== lastEvent &&
        isTerminalUpdate;
    const shouldTriggerPaidSideEffects = Boolean(isPaid && effectiveTxid) && previousLastEvent !== 'pix_confirmed';
    let shouldProcessQueue = false;

    if (shouldSendUtmStatus) {
        const utmPayload = {
            event: 'pix_status',
            orderId: effectiveTxid || orderId,
            txid: effectiveTxid,
            gateway,
            status: utmifyStatus,
            amount: eventAmount,
            personal: leadData ? {
                name: leadData.name,
                email: leadData.email,
                cpf: leadData.cpf,
                phoneDigits: leadData.phone
            } : evt.fallbackPersonal,
            address: leadData ? {
                street: leadData.address_line,
                neighborhood: leadData.neighborhood,
                city: leadData.city,
                state: leadData.state,
                cep: leadData.cep
            } : evt.fallbackAddress,
            shipping: leadData ? {
                id: leadData.shipping_id,
                name: leadData.shipping_name,
                price: leadData.shipping_price
            } : null,
            reward: rewardSnapshot,
            bump: leadData && leadData.bump_selected ? {
                title: 'Seguro Bag',
                price: leadData.bump_price
            } : null,
            upsell: upsellEvent ? {
                enabled: true,
                kind: leadPayload?.upsell?.kind || 'frete_1dia',
                title: leadPayload?.upsell?.title || leadData?.shipping_name || 'Prioridade de envio',
                price: Number(leadPayload?.upsell?.price || leadData?.shipping_price || eventAmount || 0)
            } : null,
            utm: leadData ? {
                utm_source: leadData.utm_source,
                utm_medium: leadData.utm_medium,
                utm_campaign: leadData.utm_campaign,
                utm_term: leadData.utm_term,
                utm_content: leadData.utm_content,
                gclid: leadData.gclid,
                fbclid: leadData.fbclid,
                ttclid: leadData.ttclid,
                src: leadUtm.src,
                sck: leadUtm.sck
            } : evt.fallbackUtm,
            payload: body,
            client_ip: req?.headers?.['x-forwarded-for']
                ? String(req.headers['x-forwarded-for']).split(',')[0].trim()
                : req?.socket?.remoteAddress || '',
            user_agent: req?.headers?.['user-agent'] || '',
            createdAt: leadData?.payload?.pixCreatedAt || leadData?.created_at || pixCreatedAtFromGateway || statusChangedAt,
            approvedDate: isPaid ? (leadData?.payload?.pixPaidAt || statusChangedAt) : null,
            refundedAt: isRefunded ? (leadData?.payload?.pixRefundedAt || statusChangedAt) : null,
            gatewayFeeInCents: Math.round(Number(gatewayFee || 0) * 100),
            userCommissionInCents: Math.round(Number(userCommission || 0) * 100),
            totalPriceInCents: Math.round(Number(eventAmount || 0) * 100)
        };

        const utmJob = {
            channel: 'utmfy',
            eventName,
            dedupeKey: `utmfy:status:${gateway}:${dedupeBase}:${upsellEvent ? 'upsell' : 'base'}:${utmifyStatus}`,
            payload: utmPayload
        };
        const queued = await enqueueDispatch(utmJob).catch(() => null);
        if (queued?.ok || queued?.fallback) {
            shouldProcessQueue = true;
        }
    }

    if (shouldTriggerPaidSideEffects) {
        const orderIdForPush = String(
            leadData?.session_id ||
            sessionOrderId ||
            body?.external_id ||
            body?.externalId ||
            body?.tracking?.orderId ||
            body?.metadata?.orderId ||
            body?.orderId ||
            ''
        ).trim();
        const pushPayload = {
            txid: effectiveTxid,
            orderId: effectiveTxid || orderIdForPush,
            status: statusRaw || 'confirmed',
            amount: eventAmount,
            gateway,
            customerName: leadData?.name || evt.fallbackPersonal?.name || '',
            customerEmail: leadData?.email || evt.fallbackPersonal?.email || '',
            cep: leadData?.cep || '',
            shippingName: leadData?.shipping_name || '',
            utm: {
                utm_source: leadData?.utm_source || leadUtm?.utm_source || evt.fallbackUtm?.utm_source || evt.fallbackUtm?.src || '',
                utm_medium: leadData?.utm_medium || leadUtm?.utm_medium || evt.fallbackUtm?.utm_medium || '',
                utm_campaign: (
                    leadData?.utm_campaign ||
                    leadUtm?.utm_campaign ||
                    evt.fallbackUtm?.utm_campaign ||
                    evt.fallbackUtm?.campaign ||
                    evt.fallbackUtm?.sck ||
                    ''
                ),
                utm_term: leadData?.utm_term || leadUtm?.utm_term || evt.fallbackUtm?.utm_term || evt.fallbackUtm?.term || '',
                utm_content: (
                    leadData?.utm_content ||
                    leadUtm?.utm_content ||
                    evt.fallbackUtm?.utm_content ||
                    evt.fallbackUtm?.utm_adset ||
                    evt.fallbackUtm?.adset ||
                    evt.fallbackUtm?.content ||
                    ''
                )
            },
            source: leadData?.utm_source || leadUtm?.utm_source || evt.fallbackUtm?.utm_source || evt.fallbackUtm?.src || '',
            campaign: (
                leadData?.utm_campaign ||
                leadUtm?.utm_campaign ||
                evt.fallbackUtm?.utm_campaign ||
                evt.fallbackUtm?.campaign ||
                evt.fallbackUtm?.sck ||
                ''
            ),
            adset: (
                leadData?.utm_content ||
                leadUtm?.utm_content ||
                evt.fallbackUtm?.utm_content ||
                evt.fallbackUtm?.utm_adset ||
                evt.fallbackUtm?.adset ||
                evt.fallbackUtm?.content ||
                ''
            ),
            isUpsell: upsellEvent
        };
        const pushKind = upsellEvent ? 'upsell_pix_confirmed' : 'pix_confirmed';
        const pushQueued = await enqueueDispatch({
            channel: 'pushcut',
            kind: pushKind,
            dedupeKey: `pushcut:pix_confirmed:${gateway}:${effectiveTxid}`,
            payload: pushPayload
        }).catch(() => null);
        if (pushQueued?.ok || pushQueued?.fallback) {
            shouldProcessQueue = true;
        }

        const settings = await getSettings().catch(() => ({}));
        const pixelJobs = buildPurchaseDispatchJobs({
            leadData,
            amount: eventAmount,
            txid: effectiveTxid,
            gateway,
            isUpsell: upsellEvent,
            statusChangedAt,
            clientIp: req?.headers?.['x-forwarded-for']
                ? String(req.headers['x-forwarded-for']).split(',')[0].trim()
                : req?.socket?.remoteAddress || '',
            userAgent: req?.headers?.['user-agent'] || ''
        }, settings);
        if (pixelJobs.length) {
            const pixelResults = await Promise.all(
                pixelJobs.map((job) => enqueueDispatch(job).catch(() => null))
            );
            if (pixelResults.some((item) => item?.ok || item?.fallback)) {
                shouldProcessQueue = true;
            }
        }

        // Automatic Post-Sale Delivery Email Dispatch (Front-end: Bag, Baú ou Kit)
        if (!upsellEvent && leadData) {
            sendPostSaleDeliveryEmail(leadData, {
                txid: effectiveTxid,
                amount: eventAmount,
                reward: rewardSnapshot,
                offerLabel: 'front'
            }).catch((err) => console.error('Erro ao disparar email de pos-venda:', err));
        }
    }

    if (shouldProcessQueue) {
        await processDispatchQueue(12).catch(() => null);
    }

    res.status(200).json({ status: 'success', gateway });
};

module.exports = pixWebhookHandler;
module.exports.config = {
    api: {
        bodyParser: false
    }
};
