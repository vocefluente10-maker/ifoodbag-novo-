const { ensurePublicAccess } = require('../../lib/public-access');
const { requestTransactionById: requestGhostspayStatus } = require('../../lib/ghostspay-provider');
const { requestTransactionById: requestSunizeStatus } = require('../../lib/sunize-provider');
const {
    requestTransactionById: requestParadiseStatus,
    requestTransactionByReference: requestParadiseByReference
} = require('../../lib/paradise-provider');
const { requestTransactionById: requestAtomopayStatus } = require('../../lib/atomopay-provider');
const { requestTransactionById: requestBravoPayStatus } = require('../../lib/bravopay-provider');
const {
    normalizeActiveGatewayId,
    normalizeGatewayId,
    resolveGatewayWithFallback,
    resolveGatewayFromPayload
} = require('../../lib/payment-gateway-config');
const { getPaymentsConfig } = require('../../lib/payments-config-store');
const {
    getGhostspayStatus,
    getGhostspayUpdatedAt,
    isGhostspayPaidStatus,
    isGhostspayRefundedStatus,
    isGhostspayRefusedStatus,
    isGhostspayChargebackStatus,
    mapGhostspayStatusToUtmify
} = require('../../lib/ghostspay-status');
const {
    getSunizeStatus,
    getSunizeUpdatedAt,
    isSunizePaidStatus,
    isSunizeRefundedStatus,
    isSunizeRefusedStatus,
    mapSunizeStatusToUtmify
} = require('../../lib/sunize-status');
const {
    getParadiseStatus,
    getParadiseUpdatedAt,
    isParadisePaidStatus,
    isParadiseRefundedStatus,
    isParadiseChargebackStatus,
    isParadiseRefusedStatus,
    mapParadiseStatusToUtmify
} = require('../../lib/paradise-status');
const {
    getAtomopayStatus,
    getAtomopayUpdatedAt,
    getAtomopayAmount,
    hasAtomopayPaidMarker,
    isAtomopayPaidStatus,
    isAtomopayRefundedStatus,
    isAtomopayRefusedStatus,
    isAtomopayChargebackStatus,
    mapAtomopayStatusToUtmify,
    resolveAtomopayPixPayload
} = require('../../lib/atomopay-status');
const {
    getBravoPayStatus,
    getBravoPayUpdatedAt,
    getBravoPayAmount,
    isBravoPayPaidStatus,
    isBravoPayRefundedStatus,
    isBravoPayRefusedStatus,
    isBravoPayChargebackStatus,
    mapBravoPayStatusToUtmify,
    resolveBravoPayPixPayload
} = require('../../lib/bravopay-status');
const {
    getLeadByPixTxid,
    getLeadBySessionId,
    updateLeadByPixTxid,
    updateLeadBySessionId
} = require('../../lib/lead-store');
const { enqueueDispatch, processDispatchQueue } = require('../../lib/dispatch-queue');
const { getSettings } = require('../../lib/settings-store');
const { buildPurchaseDispatchJobs } = require('../../lib/meta-capi');
const { mergePaymentHistory } = require('../../lib/lead-payment-history');

function asObject(input) {
    return input && typeof input === 'object' && !Array.isArray(input) ? input : {};
}

function getLeadCurrentPixTxid(leadData) {
    const payload = asObject(leadData?.payload);
    return pickText(
        leadData?.pix_txid,
        payload?.pixTxid,
        payload?.pix?.idTransaction,
        payload?.pix?.idtransaction,
        payload?.pix?.txid
    );
}

function hasStaleSessionPixConflict(leadData, incomingTxid = '') {
    const requestedTxid = String(incomingTxid || '').trim();
    if (!leadData || !requestedTxid) return false;
    const currentTxid = getLeadCurrentPixTxid(leadData);
    return Boolean(currentTxid) && currentTxid !== requestedTxid;
}

function toIsoDate(value) {
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

function normalizeStatus(value) {
    return String(value || '')
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/-+/g, '_');
}

function escapeRegExp(value) {
    return String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function hasStatusToken(status, tokens = []) {
    const normalized = normalizeStatus(status);
    if (!normalized) return false;
    return tokens.some((token) => {
        const clean = normalizeStatus(token);
        if (!clean) return false;
        return new RegExp(`(?:^|_)${escapeRegExp(clean)}(?:$|_)`).test(normalized);
    });
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

function pickText(...values) {
    for (const value of values) {
        if (value === undefined || value === null) continue;
        const text = String(value).trim();
        if (text) return text;
    }
    return '';
}

function buildLeadRewardSnapshot(payload = {}) {
    const reward = asObject(payload?.reward);
    const rewardId = pickText(reward?.id, payload?.rewardId);
    const rewardName = pickText(reward?.name, reward?.title, payload?.rewardName);
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

function looksLikePixCopyPaste(value = '') {
    const text = String(value || '').trim();
    if (!text) return false;
    if (text.startsWith('000201') && text.length >= 30) return true;
    return /br\.gov\.bcb\.pix/i.test(text);
}

function extractPixFieldsForStatus(gateway, payload = {}) {
    if (gateway === 'atomopay') {
        const resolved = resolveAtomopayPixPayload(payload);
        return {
            paymentCode: String(resolved.paymentCode || '').trim(),
            paymentCodeBase64: String(resolved.paymentCodeBase64 || '').trim(),
            paymentQrUrl: String(resolved.paymentQrUrl || '').trim()
        };
    }
    if (gateway === 'bravopay') {
        const resolved = resolveBravoPayPixPayload(payload);
        return {
            paymentCode: String(resolved.paymentCode || '').trim(),
            paymentCodeBase64: String(resolved.paymentCodeBase64 || '').trim(),
            paymentQrUrl: String(resolved.paymentQrUrl || '').trim()
        };
    }

    const root = asObject(payload);
    const nested = asObject(root.data);
    const transaction = asObject(root.transaction);
    const payment = asObject(root.payment);
    const pix = asObject(
        root.pix ||
        nested.pix ||
        transaction.pix ||
        payment.pix
    );

    const isGhost = gateway === 'ghostspay';
    const isSunize = gateway === 'sunize';
    const isParadise = (gateway === 'paradise' || gateway === 'clownpay' || gateway === 'pingupag');
    let paymentCode = '';
    let qrRaw = '';
    let paymentQrUrl = '';

    if (isGhost) {
        paymentCode = pickText(
            pix.qrcodeText,
            pix.qrCodeText,
            pix.copyPaste,
            pix.copy_paste,
            pix.emv,
            pix.payload,
            pix.pixCode,
            pix.pix_code,
            root.paymentCode,
            nested.paymentCode,
            root.copyPaste,
            nested.copyPaste
        );
        qrRaw = pickText(
            pix.qrcode,
            pix.qrCode,
            pix.qrcodeImage,
            pix.qrCodeImage,
            pix.qrcodeBase64,
            pix.qrCodeBase64,
            pix.qr_code_base64,
            pix.image,
            pix.imageBase64,
            root.qrcode,
            nested.qrcode,
            root.qrCode,
            nested.qrCode
        );
        paymentQrUrl = pickText(
            pix.qrcodeUrl,
            pix.qrCodeUrl,
            pix.qrcode_url,
            pix.qr_code_url,
            root.qrcodeUrl,
            nested.qrcodeUrl
        );
    } else if (isSunize) {
        paymentCode = pickText(
            pix.payload,
            pix.copyPaste,
            pix.copy_paste,
            root.pixPayload,
            nested.pixPayload
        );
        qrRaw = pickText(
            pix.qrcode,
            pix.qrCode,
            pix.qr_code,
            pix.qrcodeBase64,
            pix.qrCodeBase64,
            pix.qr_code_base64
        );
        paymentQrUrl = pickText(
            pix.qrcode_url,
            pix.qrCodeUrl,
            pix.qr_code_url
        );
    } else if (isParadise) {
        paymentCode = pickText(
            root.qr_code,
            root.pix_code,
            nested.qr_code,
            nested.pix_code
        );
        qrRaw = pickText(
            root.qr_code_base64,
            root.qrcode_base64,
            root.qrCodeBase64,
            nested.qr_code_base64,
            nested.qrcode_base64,
            nested.qrCodeBase64
        );
    } else {
        paymentCode = pickText(root.paymentCode, root.paymentcode, nested.paymentCode, nested.paymentcode);
        qrRaw = pickText(root.paymentCodeBase64, root.paymentcodebase64, nested.paymentCodeBase64, nested.paymentcodebase64);
        paymentQrUrl = pickText(root.paymentQrUrl, nested.paymentQrUrl);
    }

    if (!paymentCode && looksLikePixCopyPaste(qrRaw)) {
        paymentCode = qrRaw;
        qrRaw = '';
    }

    let paymentCodeBase64 = '';
    if (!paymentQrUrl && qrRaw) {
        if (/^https?:\/\//i.test(qrRaw) || qrRaw.startsWith('data:image')) {
            paymentQrUrl = qrRaw;
        } else {
            paymentCodeBase64 = qrRaw;
        }
    }

    return {
        paymentCode,
        paymentCodeBase64,
        paymentQrUrl
    };
}

function mapUtmifyStatusToFrontend(status) {
    const normalized = normalizeStatus(status);
    if (normalized === 'paid') return 'paid';
    if (normalized === 'refunded') return 'refunded';
    if (normalized === 'refused') return 'refused';
    if (normalized === 'chargedback') return 'refused';
    return 'waiting_payment';
}

function mapGatewayStatusToFrontend(gateway, statusRaw) {
    if (gateway === 'ghostspay') {
        return mapUtmifyStatusToFrontend(mapGhostspayStatusToUtmify(statusRaw));
    }
    if (gateway === 'sunize') {
        return mapUtmifyStatusToFrontend(mapSunizeStatusToUtmify(statusRaw));
    }
    if (gateway === 'paradise' || gateway === 'clownpay' || gateway === 'pingupag') {
        return mapUtmifyStatusToFrontend(mapParadiseStatusToUtmify(statusRaw));
    }
    if (gateway === 'atomopay') {
        return mapUtmifyStatusToFrontend(mapAtomopayStatusToUtmify(statusRaw));
    }
    if (gateway === 'bravopay') {
        return mapUtmifyStatusToFrontend(mapBravoPayStatusToUtmify(statusRaw));
    }
    const normalized = normalizeStatus(statusRaw);
    if (!normalized) return 'waiting_payment';
    if (hasStatusToken(normalized, ['unpaid', 'not_paid', 'nao_pago', 'nao_aprovado', 'unauthorized', 'unconfirmed'])) return 'waiting_payment';
    if (hasStatusToken(normalized, ['refund', 'refunded', 'estorno', 'reembolsado'])) return 'refunded';
    if (hasStatusToken(normalized, ['refused', 'recusado', 'failed', 'failure', 'cancel', 'cancelled', 'canceled', 'expired', 'expirado', 'chargeback', 'chargedback', 'declined', 'rejected'])) return 'refused';
    if (hasStatusToken(normalized, ['paid', 'pago', 'authorized', 'approved', 'aprovado', 'confirmed', 'confirmado', 'completed', 'concluido', 'concluida', 'success', 'successful'])) return 'paid';
    return 'waiting_payment';
}

function deriveLeadStatus(leadData, expectedTxid = '') {
    if (!leadData) return { status: 'waiting_payment', statusRaw: '', gateway: '' };
    const payload = asObject(leadData.payload);
    const lastEvent = normalizeStatus(leadData.last_event);
    const gateway = resolveGatewayFromPayload(payload, '');
    const requestedTxid = String(expectedTxid || '').trim();
    const payloadTxid = pickText(
        leadData?.pix_txid,
        payload?.pixTxid,
        payload?.pix?.idTransaction,
        payload?.pix?.txid
    );
    const txidMatches = !requestedTxid
        ? true
        : Boolean(payloadTxid) && requestedTxid === payloadTxid;

    if (txidMatches && (lastEvent === 'pix_confirmed' || payload.pixPaidAt)) {
        return { status: 'paid', statusRaw: String(payload.pixStatus || 'paid'), gateway };
    }
    if (txidMatches && (lastEvent === 'pix_refunded' || payload.pixRefundedAt)) {
        return { status: 'refunded', statusRaw: String(payload.pixStatus || 'refunded'), gateway };
    }
    if (txidMatches && (lastEvent === 'pix_refused' || payload.pixRefusedAt)) {
        return { status: 'refused', statusRaw: String(payload.pixStatus || 'refused'), gateway };
    }
    if (!txidMatches) {
        return { status: 'waiting_payment', statusRaw: '', gateway };
    }
    const statusRaw = String(payload.pixStatus || payload.status || '');
    const mapped = mapGatewayStatusToFrontend(gateway, statusRaw);
    return { status: mapped, statusRaw, gateway };
}

function isUpsellLead(leadData) {
    const payload = asObject(leadData?.payload);
    const shippingId = String(leadData?.shipping_id || payload?.shipping?.id || payload?.shippingId || '').trim().toLowerCase();
    const shippingName = String(leadData?.shipping_name || payload?.shipping?.name || payload?.shippingName || '').trim().toLowerCase();
    if (payload?.upsell?.enabled === true || payload?.isUpsell === true) return true;
    if (shippingId === 'expresso_1dia' || shippingId === 'taxa_iof_bag' || shippingId === 'taxa_objeto_grande_correios') return true;
    return /adiantamento|prioridade|expresso|iof|correios|objeto_grande|objeto grande/.test(shippingName);
}

function buildAtomopayStatusPayloadPatch(basePayload, txid, statusRaw, changedAtIso, rawPayload = {}) {
    const current = asObject(asObject(basePayload).atomopay);
    const amount = getAtomopayAmount(rawPayload);
    return {
        atomopay: {
            ...current,
            gateway: 'atomopay',
            hash: String(txid || current.hash || '').trim(),
            status: String(statusRaw || current.status || '').trim(),
            amountCents: Number.isFinite(amount) && amount > 0
                ? Math.round(amount * 100)
                : current.amountCents,
            lastReconciledAt: changedAtIso,
            lastStatusResponse: rawPayload
        }
    };
}

function buildBravoPayStatusPayloadPatch(basePayload, txid, statusRaw, changedAtIso, rawPayload = {}) {
    const current = asObject(asObject(basePayload).bravopay);
    const amount = getBravoPayAmount(rawPayload);
    return {
        bravopay: {
            ...current,
            gateway: 'bravopay',
            id: String(txid || current.id || '').trim(),
            status: String(statusRaw || current.status || '').trim(),
            amountCents: Number.isFinite(amount) && amount > 0
                ? Math.round(amount * 100)
                : current.amountCents,
            lastReconciledAt: changedAtIso,
            lastStatusResponse: rawPayload
        }
    };
}

function buildPatchFromGatewayStatus(leadData, txid, gateway, statusRaw, nextStatus, changedAtIso, rawPayload = {}) {
    const payload = asObject(leadData?.payload);
    const mergedPayload = mergePaymentHistory({
        ...payload,
        gateway,
        pixGateway: gateway,
        paymentGateway: gateway,
        pixTxid: txid || payload.pixTxid || undefined,
        pixStatus: statusRaw || payload.pixStatus || null,
        pixStatusChangedAt: changedAtIso,
        pixPaidAt: nextStatus === 'paid' ? (payload.pixPaidAt || changedAtIso) : payload.pixPaidAt || undefined,
        pixRefundedAt: nextStatus === 'refunded' ? (payload.pixRefundedAt || changedAtIso) : payload.pixRefundedAt || undefined,
        pixRefusedAt: nextStatus === 'refused' ? (payload.pixRefusedAt || changedAtIso) : payload.pixRefusedAt || undefined,
        ...(gateway === 'atomopay'
            ? buildAtomopayStatusPayloadPatch(payload, txid, statusRaw, changedAtIso, rawPayload)
            : {}),
        ...(gateway === 'bravopay'
            ? buildBravoPayStatusPayloadPatch(payload, txid, statusRaw, changedAtIso, rawPayload)
            : {})
    }, {
        txid,
        gateway,
        status: statusRaw || nextStatus,
        amount: normalizeMoneyToBrl(
            rawPayload?.amount ||
            rawPayload?.amount_in_reais ||
            rawPayload?.amountInReais ||
            rawPayload?.data?.amount ||
            rawPayload?.data?.amount_in_reais ||
            rawPayload?.data?.amountInReais ||
            rawPayload?.total_amount ||
            rawPayload?.totalAmount ||
            rawPayload?.valor_bruto ||
            rawPayload?.deposito_liquido ||
            payload?.pixAmount ||
            leadData?.pix_amount ||
            payload?.pix?.amount ||
            0
        ),
        changedAt: changedAtIso,
        createdAt: payload?.pixCreatedAt || leadData?.created_at,
        shipping: payload?.shipping || { id: leadData?.shipping_id || '', name: leadData?.shipping_name || '' },
        reward: payload?.reward || null,
        upsell: payload?.upsell || null,
        bump: leadData?.bump_selected ? {
            selected: true,
            title: asObject(payload?.bump)?.title || 'Seguro Bag',
            price: leadData?.bump_price
        } : null
    });
    return {
        last_event:
            nextStatus === 'paid'
                ? 'pix_confirmed'
                : nextStatus === 'refunded'
                    ? 'pix_refunded'
                    : nextStatus === 'refused'
                        ? 'pix_refused'
                        : payload?.last_event || 'pix_pending',
        stage: 'pix',
        payload: mergedPayload
    };
}

async function enqueuePaidSideEffectsFromLead({
    req,
    leadData,
    txid = '',
    gateway = '',
    statusRaw = 'paid',
    changedAtIso = new Date().toISOString()
} = {}) {
    const leadPayload = asObject(leadData?.payload);
    const effectiveTxid = pickText(
        txid,
        leadData?.pix_txid,
        leadPayload?.pixTxid,
        leadPayload?.pix?.idTransaction,
        leadPayload?.pix?.idtransaction,
        leadPayload?.pix?.txid
    );
    if (!leadData || !effectiveTxid) return false;

    const resolvedGateway = normalizeGatewayId(
        gateway ||
        resolveGatewayFromPayload(leadPayload, '') ||
        leadData?.gateway ||
        'atomopay'
    );
    const leadUtm = asObject(leadPayload?.utm);
    const amountFromLead = normalizeMoneyToBrl(
        leadPayload?.pixAmount ||
        leadData?.pix_amount ||
        leadPayload?.pix?.amount ||
        0
    );
    const fallbackLeadAmount = normalizeMoneyToBrl(
        Number(leadData?.shipping_price || 0) + Number(leadData?.bump_price || 0)
    );
    const eventAmount = amountFromLead > 0 ? amountFromLead : fallbackLeadAmount;
    const upsellEvent = isUpsellLead(leadData);
    const rewardSnapshot = upsellEvent ? null : buildLeadRewardSnapshot(leadPayload);
    const orderId = pickText(
        leadData?.session_id,
        leadPayload?.orderId,
        leadPayload?.sessionId,
        effectiveTxid
    );
    const dedupeBase = effectiveTxid || orderId || 'unknown';
    const approvedDate = leadPayload?.pixPaidAt || changedAtIso;
    const clientIp = req?.headers?.['x-forwarded-for']
        ? String(req.headers['x-forwarded-for']).split(',')[0].trim()
        : req?.socket?.remoteAddress || '';
    const userAgent = req?.headers?.['user-agent'] || '';

    let shouldProcessQueue = false;
    const utmQueued = await enqueueDispatch({
        channel: 'utmfy',
        eventName: upsellEvent ? 'upsell_pix_confirmed' : 'pix_confirmed',
        dedupeKey: `utmfy:status:${resolvedGateway}:${dedupeBase}:${upsellEvent ? 'upsell' : 'base'}:paid`,
        payload: {
            event: 'pix_status',
            orderId: effectiveTxid || orderId,
            txid: effectiveTxid,
            gateway: resolvedGateway,
            status: 'paid',
            amount: eventAmount,
            personal: {
                name: leadData.name,
                email: leadData.email,
                cpf: leadData.cpf,
                phoneDigits: leadData.phone
            },
            address: {
                street: leadData.address_line,
                neighborhood: leadData.neighborhood,
                city: leadData.city,
                state: leadData.state,
                cep: leadData.cep
            },
            shipping: {
                id: leadData.shipping_id,
                name: leadData.shipping_name,
                price: leadData.shipping_price
            },
            reward: rewardSnapshot,
            bump: leadData.bump_selected ? {
                title: 'Seguro Bag',
                price: leadData.bump_price
            } : null,
            upsell: upsellEvent ? {
                enabled: true,
                kind: leadPayload?.upsell?.kind || 'frete_1dia',
                title: leadPayload?.upsell?.title || leadData?.shipping_name || 'Prioridade de envio',
                price: Number(leadPayload?.upsell?.price || leadData?.shipping_price || eventAmount || 0)
            } : null,
            utm: {
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
            },
            payload: leadPayload,
            client_ip: clientIp,
            user_agent: userAgent,
            createdAt: leadPayload?.pixCreatedAt || leadData?.created_at || changedAtIso,
            approvedDate,
            refundedAt: null,
            gatewayFeeInCents: 0,
            userCommissionInCents: Math.round(Number(eventAmount || 0) * 100),
            totalPriceInCents: Math.round(Number(eventAmount || 0) * 100)
        }
    }).catch(() => null);
    if (utmQueued?.ok || utmQueued?.fallback) shouldProcessQueue = true;

    const pushQueued = await enqueueDispatch({
        channel: 'pushcut',
        kind: upsellEvent ? 'upsell_pix_confirmed' : 'pix_confirmed',
        dedupeKey: `pushcut:pix_confirmed:${resolvedGateway}:${effectiveTxid}`,
        payload: {
            txid: effectiveTxid,
            orderId: effectiveTxid || orderId,
            status: statusRaw || 'paid',
            amount: eventAmount,
            gateway: resolvedGateway,
            customerName: leadData.name || '',
            customerEmail: leadData.email || '',
            cep: leadData.cep || '',
            shippingName: leadData.shipping_name || '',
            utm: {
                utm_source: leadData.utm_source || leadUtm?.utm_source || leadUtm?.src || '',
                utm_medium: leadData.utm_medium || leadUtm?.utm_medium || '',
                utm_campaign: leadData.utm_campaign || leadUtm?.utm_campaign || leadUtm?.campaign || leadUtm?.sck || '',
                utm_term: leadData.utm_term || leadUtm?.utm_term || leadUtm?.term || '',
                utm_content: (
                    leadData.utm_content ||
                    leadUtm?.utm_content ||
                    leadUtm?.utm_adset ||
                    leadUtm?.adset ||
                    leadUtm?.content ||
                    ''
                )
            },
            source: leadData.utm_source || leadUtm?.utm_source || leadUtm?.src || '',
            campaign: leadData.utm_campaign || leadUtm?.utm_campaign || leadUtm?.campaign || leadUtm?.sck || '',
            adset: (
                leadData.utm_content ||
                leadUtm?.utm_content ||
                leadUtm?.utm_adset ||
                leadUtm?.adset ||
                leadUtm?.content ||
                ''
            ),
            isUpsell: upsellEvent
        }
    }).catch(() => null);
    if (pushQueued?.ok || pushQueued?.fallback) shouldProcessQueue = true;

    const settings = await getSettings().catch(() => ({}));
    const pixelJobs = buildPurchaseDispatchJobs({
        leadData,
        amount: eventAmount,
        txid: effectiveTxid,
        gateway: resolvedGateway,
        isUpsell: upsellEvent,
        statusChangedAt: approvedDate,
        clientIp,
        userAgent
    }, settings);
    if (pixelJobs.length) {
        const pixelResults = await Promise.all(
            pixelJobs.map((job) => enqueueDispatch(job).catch(() => null))
        );
        if (pixelResults.some((item) => item?.ok || item?.fallback)) {
            shouldProcessQueue = true;
        }
    }

    if (shouldProcessQueue) {
        await processDispatchQueue(12).catch(() => null);
    }
    return shouldProcessQueue;
}

function resolveStatusGateway(body = {}, leadData = null, payments = {}) {
    const payload = asObject(leadData?.payload);
    const fromLead = resolveGatewayFromPayload(payload, '');
    if (fromLead === 'ghostspay' || fromLead === 'sunize' || (fromLead === 'paradise' || fromLead === 'clownpay' || fromLead === 'pingupag') || fromLead === 'atomopay') {
        return fromLead;
    }
    const requestedRaw = String(body.gateway || body.paymentGateway || body.provider || '').trim();
    if (requestedRaw) {
        return normalizeActiveGatewayId(requestedRaw, payments.activeGateway);
    }
    return resolveGatewayWithFallback(payments.activeGateway, payments);
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

    let body = {};
    try {
        body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    } catch (_error) {
        res.status(400).json({ error: 'Invalid JSON body.' });
        return;
    }

    const txid = String(
        body?.txid ||
        body?.transaction_id ||
        body?.transactionId ||
        body?.idTransaction ||
        body?.idtransaction ||
        body?.id_transaction ||
        ''
    ).trim();
    const sessionId = String(body?.sessionId || '').trim();
    if (!txid && !sessionId) {
        res.status(400).json({ error: 'txid ou sessionId obrigatorio.' });
        return;
    }

    let leadData = null;
    let sessionFallbackBlocked = false;
    if (txid) {
        const byTxid = await getLeadByPixTxid(txid).catch(() => ({ ok: false, data: null }));
        leadData = byTxid?.ok ? byTxid.data : null;
    }
    if (!leadData && sessionId) {
        const bySession = await getLeadBySessionId(sessionId).catch(() => ({ ok: false, data: null }));
        const sessionLead = bySession?.ok ? bySession.data : null;
        if (hasStaleSessionPixConflict(sessionLead, txid)) {
            sessionFallbackBlocked = true;
        } else {
            leadData = sessionLead;
        }
    }

    const payments = await getPaymentsConfig();
    const leadStatus = deriveLeadStatus(leadData, txid);
    const gateway = resolveStatusGateway(body, leadData, payments);
    const gatewayConfig = payments?.gateways?.[gateway] || {};
    const statusGatewayConfig = {
        ...gatewayConfig,
        ...(gateway === 'clownpay' ? { account: require('../../lib/clownpay-provider').isSubaccountTransaction(txid) ? 'subaccount' : 'main' } : {}),
        timeoutMs: Math.max(
            2500,
            Math.min(
                Number(gatewayConfig?.timeoutMs || 12000),
                gateway === 'ghostspay'
                    ? 6500
                    : (gateway === 'paradise' || gateway === 'clownpay' || gateway === 'pingupag')
                        ? 7000
                        : 7000
            )
        )
    };

    if (leadStatus.status === 'paid') {
        const paidTxid = txid || getLeadCurrentPixTxid(leadData);
        const paidGateway = leadStatus.gateway || gateway;
        if (paidGateway === 'atomopay') {
            await enqueuePaidSideEffectsFromLead({
                req,
                leadData,
                txid: paidTxid,
                gateway: paidGateway,
                statusRaw: leadStatus.statusRaw || 'paid',
                changedAtIso: asObject(leadData?.payload)?.pixPaidAt || new Date().toISOString()
            }).catch(() => null);
        }
        res.status(200).json({
            ok: true,
            status: 'paid',
            statusRaw: leadStatus.statusRaw || 'paid',
            source: 'database',
            gateway: paidGateway,
            txid: paidTxid
        });
        return;
    }

    if (!txid) {
        res.status(200).json({
            ok: true,
            status: leadStatus.status,
            statusRaw: leadStatus.statusRaw || '',
            source: 'database',
            gateway: leadStatus.gateway || gateway,
            txid: ''
        });
        return;
    }

    let response;
    let data;
    let statusRaw = '';
    let changedAtIso = new Date().toISOString();
    let nextStatus = leadStatus.status || 'waiting_payment';
    let paymentCode = '';
    let paymentCodeBase64 = '';
    let paymentQrUrl = '';

    if (gateway === 'ghostspay') {
        ({ response, data } = await requestGhostspayStatus(statusGatewayConfig, txid));
        if (!response?.ok) {
            const status = Number(response?.status || 0);
            res.status(status === 404 ? 200 : 502).json({
                ok: status === 404,
                status: leadStatus.status || 'waiting_payment',
                statusRaw: leadStatus.statusRaw || '',
                txid,
                gateway,
                source: 'database_fallback',
                detail: data?.error || data?.message || ''
            });
            return;
        }

        statusRaw = getGhostspayStatus(data);
        const mapped = mapGhostspayStatusToUtmify(statusRaw);
        nextStatus = isGhostspayPaidStatus(statusRaw)
            ? 'paid'
            : isGhostspayRefundedStatus(statusRaw)
                ? 'refunded'
                : (isGhostspayRefusedStatus(statusRaw) || isGhostspayChargebackStatus(statusRaw))
                    ? 'refused'
                    : mapUtmifyStatusToFrontend(mapped);
        changedAtIso =
            toIsoDate(getGhostspayUpdatedAt(data)) ||
            toIsoDate(data?.paidAt) ||
            toIsoDate(data?.data?.paidAt) ||
            new Date().toISOString();
        ({ paymentCode, paymentCodeBase64, paymentQrUrl } = extractPixFieldsForStatus(gateway, data));
    } else if (gateway === 'sunize') {
        ({ response, data } = await requestSunizeStatus(statusGatewayConfig, txid));
        if (!response?.ok) {
            const status = Number(response?.status || 0);
            res.status(status === 404 ? 200 : 502).json({
                ok: status === 404,
                status: leadStatus.status || 'waiting_payment',
                statusRaw: leadStatus.statusRaw || '',
                txid,
                gateway,
                source: 'database_fallback',
                detail: data?.error || data?.message || ''
            });
            return;
        }

        statusRaw = getSunizeStatus(data);
        const mapped = mapSunizeStatusToUtmify(statusRaw);
        nextStatus = isSunizePaidStatus(statusRaw)
            ? 'paid'
            : isSunizeRefundedStatus(statusRaw)
                ? 'refunded'
                : isSunizeRefusedStatus(statusRaw)
                    ? 'refused'
                    : mapUtmifyStatusToFrontend(mapped);
        changedAtIso =
            toIsoDate(getSunizeUpdatedAt(data)) ||
            toIsoDate(data?.paid_at) ||
            toIsoDate(data?.paidAt) ||
            new Date().toISOString();
        ({ paymentCode, paymentCodeBase64, paymentQrUrl } = extractPixFieldsForStatus(gateway, data));
    } else if (gateway === 'paradise' || gateway === 'clownpay' || gateway === 'pingupag') {
        ({ response, data } = await requestParadiseStatus(statusGatewayConfig, txid));
        if (!response?.ok) {
            const status = Number(response?.status || 0);
            const leadPayload = asObject(leadData?.payload);
            const externalRef = String(
                leadPayload?.pixExternalId ||
                leadPayload?.pix?.externalId ||
                ''
            ).trim();
            if (status === 404 && externalRef) {
                const byRef = await requestParadiseByReference(statusGatewayConfig, externalRef).catch(() => null);
                if (byRef?.response?.ok) {
                    response = byRef.response;
                    data = Array.isArray(byRef.data) ? (byRef.data[0] || {}) : (byRef.data || {});
                }
            }
            if (!response?.ok) {
                res.status(status === 404 ? 200 : 502).json({
                    ok: status === 404,
                    status: leadStatus.status || 'waiting_payment',
                    statusRaw: leadStatus.statusRaw || '',
                    txid,
                    gateway,
                    source: 'database_fallback',
                    detail: data?.error || data?.message || ''
                });
                return;
            }
        }
        if (Array.isArray(data)) {
            data = data[0] || {};
        }

        statusRaw = getParadiseStatus(data);
        const mapped = mapParadiseStatusToUtmify(statusRaw);
        nextStatus = isParadisePaidStatus(statusRaw)
            ? 'paid'
            : isParadiseRefundedStatus(statusRaw)
                ? 'refunded'
                : (isParadiseRefusedStatus(statusRaw) || isParadiseChargebackStatus(statusRaw))
                    ? 'refused'
                    : mapUtmifyStatusToFrontend(mapped);
        changedAtIso =
            toIsoDate(getParadiseUpdatedAt(data)) ||
            toIsoDate(data?.timestamp) ||
            toIsoDate(data?.updated_at) ||
            new Date().toISOString();
        ({ paymentCode, paymentCodeBase64, paymentQrUrl } = extractPixFieldsForStatus(gateway, data));
    } else if (gateway === 'atomopay') {
        ({ response, data } = await requestAtomopayStatus(statusGatewayConfig, txid));
        if (!response?.ok) {
            const status = Number(response?.status || 0);
            res.status(status === 404 ? 200 : 502).json({
                ok: status === 404,
                status: leadStatus.status || 'waiting_payment',
                statusRaw: leadStatus.statusRaw || '',
                txid,
                gateway,
                source: 'database_fallback',
                detail: data?.error || data?.message || ''
            });
            return;
        }

        statusRaw = getAtomopayStatus(data);
        const atomopayPaidByMarker = hasAtomopayPaidMarker(data);
        if (atomopayPaidByMarker && !isAtomopayPaidStatus(statusRaw)) {
            statusRaw = 'paid';
        }
        const mapped = mapAtomopayStatusToUtmify(statusRaw);
        nextStatus = (isAtomopayPaidStatus(statusRaw) || atomopayPaidByMarker)
            ? 'paid'
            : isAtomopayRefundedStatus(statusRaw)
                ? 'refunded'
                : (isAtomopayRefusedStatus(statusRaw) || isAtomopayChargebackStatus(statusRaw))
                    ? 'refused'
                    : mapUtmifyStatusToFrontend(mapped);
        changedAtIso =
            toIsoDate(getAtomopayUpdatedAt(data)) ||
            toIsoDate(data?.paid_at) ||
            toIsoDate(data?.data?.paid_at) ||
            new Date().toISOString();
        ({ paymentCode, paymentCodeBase64, paymentQrUrl } = extractPixFieldsForStatus(gateway, data));
    } else if (gateway === 'bravopay') {
        ({ response, data } = await requestBravoPayStatus(statusGatewayConfig, txid));
        if (!response?.ok) {
            const status = Number(response?.status || 0);
            res.status(status === 404 ? 200 : 502).json({
                ok: status === 404,
                status: leadStatus.status || 'waiting_payment',
                statusRaw: leadStatus.statusRaw || '',
                txid,
                gateway,
                source: 'database_fallback',
                detail: data?.error?.code || data?.error || data?.message || ''
            });
            return;
        }

        statusRaw = getBravoPayStatus(data);
        const mapped = mapBravoPayStatusToUtmify(statusRaw);
        nextStatus = isBravoPayPaidStatus(statusRaw)
            ? 'paid'
            : isBravoPayRefundedStatus(statusRaw)
                ? 'refunded'
                : (isBravoPayRefusedStatus(statusRaw) || isBravoPayChargebackStatus(statusRaw))
                    ? 'refused'
                    : mapUtmifyStatusToFrontend(mapped);
        changedAtIso =
            toIsoDate(getBravoPayUpdatedAt(data)) ||
            toIsoDate(data?.paid_at) ||
            toIsoDate(data?.data?.paid_at) ||
            new Date().toISOString();
        ({ paymentCode, paymentCodeBase64, paymentQrUrl } = extractPixFieldsForStatus(gateway, data));
    } else {
        res.status(503).json({
            ok: false,
            status: leadStatus.status || 'waiting_payment',
            statusRaw: leadStatus.statusRaw || '',
            txid,
            gateway,
            source: 'gateway_unavailable',
            detail: 'gateway_not_supported'
        });
        return;
    }

    let leadUpdated = false;
    if (!sessionFallbackBlocked && (leadData || sessionId)) {
        const patch = buildPatchFromGatewayStatus(leadData, txid, gateway, statusRaw, nextStatus, changedAtIso, data || {});
        let updated = await updateLeadByPixTxid(txid, patch).catch(() => ({ ok: false, count: 0 }));
        if ((!updated?.ok || Number(updated?.count || 0) === 0) && sessionId) {
            const sessionLead = leadData || (await getLeadBySessionId(sessionId).catch(() => ({ ok: false, data: null })))?.data;
            if (!hasStaleSessionPixConflict(sessionLead, txid)) {
                updated = await updateLeadBySessionId(sessionId, patch).catch(() => ({ ok: false, count: 0 }));
            }
        }
        leadUpdated = Boolean(updated?.ok) && Number(updated?.count || 0) > 0;
    }

    const terminalStatus = nextStatus === 'paid' || nextStatus === 'refunded' || nextStatus === 'refused';
    const shouldDispatchTerminalFallback = !sessionFallbackBlocked && terminalStatus && leadStatus.status !== nextStatus;

    if (shouldDispatchTerminalFallback) {
        let latestLead = leadData;
        if (!latestLead || leadUpdated) {
            const refreshedByTxid = await getLeadByPixTxid(txid).catch(() => ({ ok: false, data: null }));
            latestLead = refreshedByTxid?.ok ? refreshedByTxid.data : null;
            if (!latestLead && sessionId) {
                const refreshedBySession = await getLeadBySessionId(sessionId).catch(() => ({ ok: false, data: null }));
                latestLead = refreshedBySession?.ok ? refreshedBySession.data : null;
            }
        }

        const latestPayload = asObject(latestLead?.payload);
        const leadUtm = asObject(latestPayload?.utm);
        const latestLeadTxid = String(
            latestLead?.pix_txid ||
            latestPayload?.pixTxid ||
            latestPayload?.pix?.idTransaction ||
            latestPayload?.pix?.idtransaction ||
            ''
        ).trim();
        const leadMatchesTxid = !txid || (latestLeadTxid && latestLeadTxid === txid);
        const amountFromLead = leadMatchesTxid
            ? normalizeMoneyToBrl(
                latestPayload?.pixAmount ||
                latestLead?.pix_amount ||
                latestPayload?.pix?.amount ||
                0
            )
            : 0;
        const amountFromGateway = gateway === 'clownpay' ? Number(data?.amount || 0) / 100 : normalizeMoneyToBrl(
            data?.amount ||
            data?.amount_in_reais ||
            data?.amountInReais ||
            data?.data?.amount ||
            data?.data?.amount_in_reais ||
            data?.data?.amountInReais ||
            data?.total_amount ||
            data?.totalAmount ||
            data?.valor_bruto ||
            data?.deposito_liquido ||
            0
        );
        const fallbackLeadAmount = leadMatchesTxid
            ? normalizeMoneyToBrl(
                Number(latestLead?.shipping_price || 0) + Number(latestLead?.bump_price || 0)
            )
            : 0;
        const eventAmount = amountFromGateway > 0
            ? amountFromGateway
            : amountFromLead > 0
                ? amountFromLead
                : fallbackLeadAmount;
        const upsellEvent = isUpsellLead(latestLead);
        const rewardSnapshot = upsellEvent ? null : buildLeadRewardSnapshot(latestPayload);
        const utmifyStatus = (gateway === 'paradise' || gateway === 'clownpay' || gateway === 'pingupag')
            ? mapParadiseStatusToUtmify(statusRaw)
            : gateway === 'atomopay'
                ? mapAtomopayStatusToUtmify(statusRaw)
                : gateway === 'bravopay'
                    ? mapBravoPayStatusToUtmify(statusRaw)
            : nextStatus === 'paid'
                ? 'paid'
                : nextStatus === 'refunded'
                    ? 'refunded'
                    : 'refused';
        const eventName = nextStatus === 'paid'
            ? (upsellEvent ? 'upsell_pix_confirmed' : 'pix_confirmed')
            : nextStatus === 'refunded'
                ? 'pix_refunded'
                : 'pix_failed';
        const orderId = String(
            latestLead?.session_id ||
            sessionId ||
            latestPayload?.orderId ||
            latestPayload?.sessionId ||
            txid ||
            ''
        ).trim();
        const dedupeBase = txid || orderId || 'unknown';
        let gatewayFee = 0;
        if (gateway === 'ghostspay') {
            gatewayFee = normalizeMoneyToBrl(
                data?.gatewayFee ||
                data?.fee ||
                data?.data?.gatewayFee ||
                data?.data?.fee ||
                0
            );
        } else if (gateway === 'paradise' || gateway === 'clownpay' || gateway === 'pingupag') {
            gatewayFee = normalizeMoneyToBrl(
                data?.fee ||
                data?.gateway_fee ||
                data?.gatewayFee ||
                data?.data?.fee ||
                data?.data?.gateway_fee ||
                data?.data?.gatewayFee ||
                0
            );
        }
        const userCommission = Math.max(
            0,
            normalizeMoneyToBrl(
                data?.deposito_liquido ||
                data?.valor_liquido ||
                latestPayload?.userCommission ||
                (eventAmount - gatewayFee)
            )
        );

        const utmPayload = {
            event: 'pix_status',
            orderId: txid || orderId,
            txid,
            gateway,
            status: utmifyStatus,
            amount: eventAmount,
            personal: latestLead ? {
                name: latestLead.name,
                email: latestLead.email,
                cpf: latestLead.cpf,
                phoneDigits: latestLead.phone
            } : null,
            address: latestLead ? {
                street: latestLead.address_line,
                neighborhood: latestLead.neighborhood,
                city: latestLead.city,
                state: latestLead.state,
                cep: latestLead.cep
            } : null,
            shipping: latestLead ? {
                id: latestLead.shipping_id,
                name: latestLead.shipping_name,
                price: latestLead.shipping_price
            } : null,
            reward: rewardSnapshot,
            bump: latestLead && latestLead.bump_selected ? {
                title: 'Seguro Bag',
                price: latestLead.bump_price
            } : null,
            upsell: upsellEvent ? {
                enabled: true,
                kind: latestPayload?.upsell?.kind || 'frete_1dia',
                title: latestPayload?.upsell?.title || latestLead?.shipping_name || 'Prioridade de envio',
                price: Number(latestPayload?.upsell?.price || latestLead?.shipping_price || eventAmount || 0)
            } : null,
            utm: latestLead ? {
                utm_source: latestLead.utm_source,
                utm_medium: latestLead.utm_medium,
                utm_campaign: latestLead.utm_campaign,
                utm_term: latestLead.utm_term,
                utm_content: latestLead.utm_content,
                gclid: latestLead.gclid,
                fbclid: latestLead.fbclid,
                ttclid: latestLead.ttclid,
                src: leadUtm.src,
                sck: leadUtm.sck
            } : leadUtm,
            payload: data,
            client_ip: req?.headers?.['x-forwarded-for']
                ? String(req.headers['x-forwarded-for']).split(',')[0].trim()
                : req?.socket?.remoteAddress || '',
            user_agent: req?.headers?.['user-agent'] || '',
            createdAt: latestPayload?.pixCreatedAt || latestLead?.created_at || changedAtIso,
            approvedDate: nextStatus === 'paid' ? (latestPayload?.pixPaidAt || changedAtIso) : null,
            refundedAt: nextStatus === 'refunded' ? (latestPayload?.pixRefundedAt || changedAtIso) : null,
            gatewayFeeInCents: Math.round(Number(gatewayFee || 0) * 100),
            userCommissionInCents: Math.round(Number(userCommission || 0) * 100),
            totalPriceInCents: Math.round(Number(eventAmount || 0) * 100)
        };

        let shouldProcessQueue = false;

        const utmQueued = await enqueueDispatch({
            channel: 'utmfy',
            eventName,
            dedupeKey: `utmfy:status:${gateway}:${dedupeBase}:${upsellEvent ? 'upsell' : 'base'}:${utmifyStatus}`,
            payload: utmPayload
        }).catch(() => null);
        if (utmQueued?.ok || utmQueued?.fallback) {
            shouldProcessQueue = true;
        }

        if (nextStatus === 'paid') {
            const pushKind = upsellEvent ? 'upsell_pix_confirmed' : 'pix_confirmed';
            const pushQueued = await enqueueDispatch({
                channel: 'pushcut',
                kind: pushKind,
                dedupeKey: `pushcut:pix_confirmed:${gateway}:${txid}`,
                payload: {
                    txid,
                    orderId: txid || orderId,
                    status: statusRaw || 'confirmed',
                    amount: eventAmount,
                    gateway,
                    customerName: latestLead?.name || '',
                    customerEmail: latestLead?.email || '',
                    cep: latestLead?.cep || '',
                    shippingName: latestLead?.shipping_name || '',
                    utm: {
                        utm_source: latestLead?.utm_source || leadUtm?.utm_source || leadUtm?.src || '',
                        utm_medium: latestLead?.utm_medium || leadUtm?.utm_medium || '',
                        utm_campaign: latestLead?.utm_campaign || leadUtm?.utm_campaign || leadUtm?.campaign || leadUtm?.sck || '',
                        utm_term: latestLead?.utm_term || leadUtm?.utm_term || leadUtm?.term || '',
                        utm_content: (
                            latestLead?.utm_content ||
                            leadUtm?.utm_content ||
                            leadUtm?.utm_adset ||
                            leadUtm?.adset ||
                            leadUtm?.content ||
                            ''
                        )
                    },
                    source: latestLead?.utm_source || leadUtm?.utm_source || leadUtm?.src || '',
                    campaign: latestLead?.utm_campaign || leadUtm?.utm_campaign || leadUtm?.campaign || leadUtm?.sck || '',
                    adset: (
                        latestLead?.utm_content ||
                        leadUtm?.utm_content ||
                        leadUtm?.utm_adset ||
                        leadUtm?.adset ||
                        leadUtm?.content ||
                        ''
                    ),
                    isUpsell: upsellEvent
                }
            }).catch(() => null);
            if (pushQueued?.ok || pushQueued?.fallback) {
                shouldProcessQueue = true;
            }

            const settings = await getSettings().catch(() => ({}));
            const pixelJobs = buildPurchaseDispatchJobs({
                leadData: latestLead,
                amount: eventAmount,
                txid,
                gateway,
                isUpsell: upsellEvent,
                statusChangedAt: changedAtIso,
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
        }

        if (shouldProcessQueue) {
            await processDispatchQueue(10).catch(() => null);
        }
    }

    res.status(200).json({
        ok: true,
        status: nextStatus,
        statusRaw,
        txid,
        gateway,
        changedAt: changedAtIso,
        source: gateway,
        paymentCode,
        paymentCodeBase64,
        paymentQrUrl
    });
};
