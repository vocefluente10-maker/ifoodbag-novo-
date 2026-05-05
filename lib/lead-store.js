const fetchFn = global.fetch
    ? global.fetch.bind(global)
    : (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.SUPABASE_PROJECT_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE || '';
const SUPABASE_LEADS_TABLE = process.env.SUPABASE_LEADS_TABLE || 'leads';

const TERMINAL_EVENTS = new Set(['pix_confirmed', 'pix_refunded', 'pix_refused']);
const STAGE_SCORE = {
    home: 1,
    quiz: 2,
    personal: 3,
    cep: 4,
    processing: 5,
    success: 6,
    checkout: 7,
    orderbump: 8,
    pix: 9,
    upsell_iof: 10,
    'upsell-iof': 10,
    upsell_correios: 11,
    'upsell-correios': 11,
    upsell: 12,
    complete: 13
};

function toText(value, maxLen = 255) {
    const txt = String(value || '').trim();
    if (!txt) return null;
    return txt.length > maxLen ? txt.slice(0, maxLen) : txt;
}

function toDigits(value, maxLen = 32) {
    const txt = String(value || '').replace(/\D/g, '');
    if (!txt) return null;
    return txt.length > maxLen ? txt.slice(0, maxLen) : txt;
}

function toNumber(value) {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
}

function toBoolean(value) {
    return value === true || value === 'true' || value === 1 || value === '1';
}

function ensureSessionId(input) {
    const provided =
        input?.sessionId ||
        input?.session_id ||
        input?.leadSession ||
        input?.lead_session ||
        null;

    return toText(provided, 80);
}

function asObject(input) {
    return input && typeof input === 'object' && !Array.isArray(input) ? input : {};
}

function normalizeAdPlatformSource(value = '') {
    const raw = String(value || '').trim().toLowerCase();
    if (!raw) return null;
    if (raw === 'meta' || raw === 'facebook' || raw === 'fb' || raw === 'instagram' || raw === 'ig') return 'FB';
    if (raw === 'tiktok' || raw === 'tt' || raw === 'tik tok' || raw === 'tik_tok') return 'TikTok';
    return null;
}

function inferAdPlatform(input = {}, req = null) {
    const utm = asObject(input?.utm);
    const explicit = normalizeAdPlatformSource(input?.ad_platform || utm?.ad_platform || input?.utm_source || utm?.utm_source);
    if (explicit) return explicit;

    const referrer = String(input?.referrer || utm?.referrer || req?.headers?.referer || req?.headers?.referrer || '').trim().toLowerCase();
    const userAgent = String(input?.userAgent || input?.user_agent || req?.headers?.['user-agent'] || '').trim().toLowerCase();
    if (referrer.includes('tiktok') || userAgent.includes('tiktok') || userAgent.includes('bytedance') || userAgent.includes('musical_ly')) {
        return 'TikTok';
    }
    if (
        referrer.includes('facebook') ||
        referrer.includes('instagram') ||
        referrer.includes('meta') ||
        userAgent.includes('instagram') ||
        userAgent.includes('fb_iab') ||
        userAgent.includes('fban') ||
        userAgent.includes('fbav') ||
        userAgent.includes('fbios')
    ) {
        return 'FB';
    }
    return null;
}

function pickText(...values) {
    for (const value of values) {
        const text = toText(value, 120);
        if (text) return text;
    }
    return null;
}

function hasMeaningfulLeadData(record) {
    return Boolean(
        record.name ||
        record.cpf ||
        record.email ||
        record.phone ||
        record.cep ||
        record.address_line ||
        record.shipping_id ||
        record.pix_txid ||
        record.pix_amount ||
        record.utm_source ||
        record.utm_campaign ||
        record.utm_term ||
        record.utm_content ||
        record.fbclid ||
        record.ttclid ||
        record.gclid
    );
}

function scoreEvent(eventName) {
    const ev = String(eventName || '').trim().toLowerCase();
    if (!ev) return 0;
    if (TERMINAL_EVENTS.has(ev)) return 100;
    if (ev.startsWith('pix_')) return 80;
    if (ev.includes('frete')) return 60;
    if (ev.includes('cep')) return 50;
    if (ev.includes('personal') || ev.includes('dados')) return 40;
    if (ev.includes('view')) return 10;
    return 15;
}

function scoreStage(stageName) {
    const st = String(stageName || '').trim().toLowerCase();
    return STAGE_SCORE[st] || 0;
}

function pruneNullish(input) {
    const out = {};
    Object.entries(input || {}).forEach(([key, value]) => {
        if (value === null || value === undefined) return;
        out[key] = value;
    });
    return out;
}

function mergeTrackingPayload(input = {}, existingPayload = {}) {
    const incoming = asObject(input);
    const existing = asObject(existingPayload);
    const merged = {
        ...existing,
        ...incoming
    };

    ['utm', 'personal', 'address', 'extra', 'shipping', 'bump', 'pix', 'metadata'].forEach((key) => {
        const next = {
            ...asObject(existing[key]),
            ...asObject(incoming[key])
        };
        if (Object.keys(next).length > 0) {
            merged[key] = next;
        } else {
            delete merged[key];
        }
    });

    return merged;
}

function hasAnyTrackingFields(input = {}) {
    const utm = asObject(input?.utm);
    return Boolean(
        pickText(input?.utm_source, utm?.utm_source, utm?.src, input?.src) ||
        pickText(input?.utm_campaign, utm?.utm_campaign, utm?.campaign, utm?.campaign_id, utm?.sck, input?.campaign, input?.campaign_id, input?.sck) ||
        pickText(input?.utm_term, utm?.utm_term, utm?.term, utm?.adset, utm?.adset_id, input?.adset, input?.adset_id) ||
        pickText(input?.utm_content, utm?.utm_content, utm?.content, utm?.ad_id, utm?.placement, input?.ad_id, input?.placement) ||
        pickText(input?.fbclid, utm?.fbclid) ||
        pickText(input?.ttclid, utm?.ttclid) ||
        pickText(input?.gclid, utm?.gclid) ||
        inferAdPlatform(input)
    );
}

function inheritTrackingPayload(input = {}, sourceLead = null) {
    const incoming = asObject(input);
    const sourcePayload = asObject(sourceLead?.payload);
    const sourceUtm = asObject(sourcePayload?.utm);
    if (!sourceLead) return incoming;

    const next = { ...incoming };
    next.utm = {
        ...sourceUtm,
        ...asObject(incoming.utm)
    };

    if (!next.utm_source) next.utm_source = sourceLead?.utm_source || sourceUtm?.utm_source || sourcePayload?.utm_source || sourceUtm?.src || null;
    if (!next.utm_medium) next.utm_medium = sourceLead?.utm_medium || sourceUtm?.utm_medium || sourcePayload?.utm_medium || null;
    if (!next.utm_campaign) next.utm_campaign = sourceLead?.utm_campaign || sourceUtm?.utm_campaign || sourcePayload?.utm_campaign || sourceUtm?.campaign || sourceUtm?.sck || null;
    if (!next.utm_term) next.utm_term = sourceLead?.utm_term || sourceUtm?.utm_term || sourcePayload?.utm_term || sourceUtm?.term || null;
    if (!next.utm_content) next.utm_content = sourceLead?.utm_content || sourceUtm?.utm_content || sourcePayload?.utm_content || sourceUtm?.content || null;
    if (!next.gclid) next.gclid = sourceLead?.gclid || sourceUtm?.gclid || sourcePayload?.gclid || null;
    if (!next.fbclid) next.fbclid = sourceLead?.fbclid || sourceUtm?.fbclid || sourcePayload?.fbclid || null;
    if (!next.ttclid) next.ttclid = sourceLead?.ttclid || sourceUtm?.ttclid || sourcePayload?.ttclid || null;
    if (!next.referrer) next.referrer = sourceLead?.referrer || sourceUtm?.referrer || sourcePayload?.referrer || null;
    if (!next.landing_page) next.landing_page = sourceLead?.landing_page || sourceUtm?.landing_page || sourcePayload?.landing_page || null;

    if (!next.utm?.utm_source) next.utm.utm_source = next.utm_source;
    if (!next.utm?.utm_medium) next.utm.utm_medium = next.utm_medium;
    if (!next.utm?.utm_campaign) next.utm.utm_campaign = next.utm_campaign;
    if (!next.utm?.utm_term) next.utm.utm_term = next.utm_term;
    if (!next.utm?.utm_content) next.utm.utm_content = next.utm_content;
    if (!next.utm?.gclid) next.utm.gclid = next.gclid;
    if (!next.utm?.fbclid) next.utm.fbclid = next.fbclid;
    if (!next.utm?.ttclid) next.utm.ttclid = next.ttclid;
    if (!next.utm?.referrer) next.utm.referrer = next.referrer;
    if (!next.utm?.landing_page) next.utm.landing_page = next.landing_page;

    return next;
}

function buildLeadRecord(input = {}, req = null) {
    const nowIso = new Date().toISOString();
    const personal = input.personal && typeof input.personal === 'object' ? input.personal : {};
    const address = input.address && typeof input.address === 'object' ? input.address : {};
    const extra = input.extra && typeof input.extra === 'object' ? input.extra : {};
    const shipping = input.shipping && typeof input.shipping === 'object' ? input.shipping : {};
    const bump = input.bump && typeof input.bump === 'object' ? input.bump : {};
    const pix = input.pix && typeof input.pix === 'object' ? input.pix : {};
    const utm = input.utm && typeof input.utm === 'object' ? input.utm : {};
    const bumpSelected = toBoolean(input.bumpSelected ?? bump.selected ?? false);
    const bumpPrice = bumpSelected ? toNumber(input.bumpPrice ?? bump.price) : 0;

    const street = toText(address.street || address.streetLine || '', 240);
    const cityLine = toText(address.cityLine || '', 140);
    const city = toText(address.city || cityLine.split('-')[0] || '', 100);
    const state = toText(address.state || cityLine.split('-')[1] || '', 20);

    const forwardedFor = req?.headers?.['x-forwarded-for'];
    const clientIp = typeof forwardedFor === 'string' && forwardedFor
        ? forwardedFor.split(',')[0].trim()
        : req?.socket?.remoteAddress || '';

    return {
        session_id: ensureSessionId(input),
        stage: toText(input.stage, 60),
        last_event: toText(input.event || input.lastEvent, 80),
        name: toText(personal.name, 160),
        cpf: toDigits(personal.cpf, 14),
        email: toText(personal.email, 180),
        phone: toDigits(personal.phoneDigits || personal.phone, 20),
        cep: toDigits(address.cep, 10),
        address_line: toText(street, 240),
        number: toText(extra.number, 40),
        complement: toText(extra.complement, 120),
        neighborhood: toText(address.neighborhood, 120),
        city,
        state,
        reference: toText(extra.reference, 140),
        shipping_id: toText(shipping.id, 40),
        shipping_name: toText(shipping.name, 120),
        shipping_price: toNumber(shipping.price),
        bump_selected: bumpSelected,
        bump_price: bumpPrice,
        pix_txid: toText(input.pixTxid || pix.idTransaction, 120),
        pix_amount: toNumber(input.pixAmount || pix.amount || input.amount),
        utm_source: pickText(utm.utm_source, input.utm_source, utm.src, input.src, inferAdPlatform(input, req)),
        utm_medium: pickText(utm.utm_medium, input.utm_medium),
        utm_campaign: pickText(utm.utm_campaign, input.utm_campaign, utm.campaign, input.campaign, utm.campaign_id, input.campaign_id, utm.sck, input.sck),
        utm_term: pickText(utm.utm_term, input.utm_term, utm.term, input.term, utm.adset, input.adset, utm.adset_id, input.adset_id),
        utm_content: pickText(utm.utm_content, input.utm_content, utm.content, input.content, utm.ad_id, input.ad_id, utm.placement, input.placement),
        gclid: pickText(utm.gclid, input.gclid),
        fbclid: pickText(utm.fbclid, input.fbclid),
        ttclid: pickText(utm.ttclid, input.ttclid),
        referrer: toText(utm.referrer || input.referrer, 240),
        landing_page: toText(utm.landing_page || input.landing_page, 240),
        source_url: toText(input.sourceUrl, 300),
        user_agent: toText(req?.headers?.['user-agent'] || input.userAgent, 300),
        client_ip: toText(clientIp || input.clientIp, 80),
        updated_at: nowIso,
        payload: input
    };
}

async function upsertLead(input = {}, req = null) {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
        return { ok: false, reason: 'missing_supabase_config' };
    }

    const initialRecord = buildLeadRecord(input, req);
    if (!initialRecord.session_id) {
        return { ok: false, reason: 'missing_session_id' };
    }
    const existingRes = await getLeadBySessionId(initialRecord.session_id).catch(() => ({ ok: false, data: null }));
    const existing = existingRes?.ok ? existingRes.data : null;
    let mergedInput = mergeTrackingPayload(input, existing?.payload);
    if (!hasAnyTrackingFields(mergedInput)) {
        const identityLeadRes = await findLeadByIdentity({
            cpf: mergedInput?.personal?.cpf || input?.personal?.cpf || existing?.cpf || '',
            email: mergedInput?.personal?.email || input?.personal?.email || existing?.email || '',
            phone: mergedInput?.personal?.phoneDigits || mergedInput?.personal?.phone || input?.personal?.phoneDigits || input?.personal?.phone || existing?.phone || ''
        }).catch(() => ({ ok: false, data: null }));
        const identityLead = identityLeadRes?.ok ? identityLeadRes.data : null;
        if (identityLead && String(identityLead?.session_id || '').trim() !== initialRecord.session_id) {
            mergedInput = inheritTrackingPayload(mergedInput, identityLead);
        }
    }
    const record = buildLeadRecord(mergedInput, req);
    if (!hasMeaningfulLeadData(record)) {
        return { ok: false, reason: 'skipped_no_data' };
    }
    if (existing) {
        const existingPayload = asObject(existing?.payload);
        const incomingPix = asObject(mergedInput?.pix);
        const existingTxid = toText(
            existing?.pix_txid ||
            existingPayload?.pixTxid ||
            existingPayload?.pix?.idTransaction ||
            existingPayload?.pix?.txid,
            120
        );
        const incomingTxid = toText(
            record?.pix_txid ||
            mergedInput?.pixTxid ||
            incomingPix?.idTransaction ||
            incomingPix?.txid,
            120
        );
        const txidChanged = Boolean(incomingTxid && existingTxid !== incomingTxid);

        const incomingEvent = record.last_event;
        const currentEvent = existing.last_event;
        if (!txidChanged && scoreEvent(currentEvent) > scoreEvent(incomingEvent)) {
            record.last_event = currentEvent;
        }
        if (!txidChanged && scoreStage(existing.stage) > scoreStage(record.stage)) {
            record.stage = existing.stage;
        }
    }

    const endpoint = `${SUPABASE_URL}/rest/v1/${SUPABASE_LEADS_TABLE}?on_conflict=session_id`;
    const payload = pruneNullish(record);

    let response;
    try {
        response = await fetchFn(endpoint, {
            method: 'POST',
            headers: {
                apikey: SUPABASE_SERVICE_KEY,
                Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
                'Content-Type': 'application/json',
                Prefer: 'resolution=merge-duplicates,return=minimal'
            },
            body: JSON.stringify([payload])
        });
    } catch (error) {
        return {
            ok: false,
            reason: 'network_error',
            detail: error?.message || String(error)
        };
    }

    if (!response.ok) {
        const detail = await response.text().catch(() => '');
        return {
            ok: false,
            reason: 'supabase_error',
            status: response.status,
            detail
        };
    }

    return { ok: true };
}

module.exports = {
    upsertLead,
    updateLeadByPixTxid,
    getLeadByPixTxid,
    updateLeadBySessionId,
    getLeadBySessionId,
    findLeadByIdentity
};

async function updateLeadByPixTxid(txid, fields = {}, options = {}) {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
        return { ok: false, reason: 'missing_supabase_config' };
    }

    const cleanTxid = String(txid || '').trim();
    if (!cleanTxid) {
        return { ok: false, reason: 'missing_txid' };
    }

    const payload = {
        ...fields
    };
    if (options?.touchUpdatedAt !== false) {
        payload.updated_at = new Date().toISOString();
    }

    const endpoint = `${SUPABASE_URL}/rest/v1/${SUPABASE_LEADS_TABLE}?pix_txid=eq.${encodeURIComponent(cleanTxid)}`;

    let response;
    try {
        response = await fetchFn(endpoint, {
            method: 'PATCH',
            headers: {
                apikey: SUPABASE_SERVICE_KEY,
                Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
                'Content-Type': 'application/json',
                Prefer: 'return=representation'
            },
            body: JSON.stringify(payload)
        });
    } catch (error) {
        return {
            ok: false,
            reason: 'network_error',
            detail: error?.message || String(error)
        };
    }

    if (!response.ok) {
        const detail = await response.text().catch(() => '');
        return {
            ok: false,
            reason: 'supabase_error',
            status: response.status,
            detail
        };
    }

    const data = await response.json().catch(() => []);
    return { ok: true, count: Array.isArray(data) ? data.length : 0 };
}

async function getLeadByPixTxid(txid) {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
        return { ok: false, reason: 'missing_supabase_config' };
    }

    const cleanTxid = String(txid || '').trim();
    if (!cleanTxid) {
        return { ok: false, reason: 'missing_txid' };
    }

    const endpoint = `${SUPABASE_URL}/rest/v1/${SUPABASE_LEADS_TABLE}?pix_txid=eq.${encodeURIComponent(cleanTxid)}&select=*`;
    let response;
    try {
        response = await fetchFn(endpoint, {
            headers: {
                apikey: SUPABASE_SERVICE_KEY,
                Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        return {
            ok: false,
            reason: 'network_error',
            detail: error?.message || String(error)
        };
    }

    if (!response.ok) {
        const detail = await response.text().catch(() => '');
        return { ok: false, reason: 'supabase_error', status: response.status, detail };
    }

    const data = await response.json().catch(() => []);
    return { ok: true, data: Array.isArray(data) ? data[0] : null };
}

async function updateLeadBySessionId(sessionId, fields = {}, options = {}) {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
        return { ok: false, reason: 'missing_supabase_config' };
    }

    const cleanSession = String(sessionId || '').trim();
    if (!cleanSession) {
        return { ok: false, reason: 'missing_session_id' };
    }

    const payload = {
        ...fields
    };
    if (options?.touchUpdatedAt !== false) {
        payload.updated_at = new Date().toISOString();
    }

    const endpoint = `${SUPABASE_URL}/rest/v1/${SUPABASE_LEADS_TABLE}?session_id=eq.${encodeURIComponent(cleanSession)}`;
    let response;
    try {
        response = await fetchFn(endpoint, {
            method: 'PATCH',
            headers: {
                apikey: SUPABASE_SERVICE_KEY,
                Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
                'Content-Type': 'application/json',
                Prefer: 'return=representation'
            },
            body: JSON.stringify(payload)
        });
    } catch (error) {
        return {
            ok: false,
            reason: 'network_error',
            detail: error?.message || String(error)
        };
    }

    if (!response.ok) {
        const detail = await response.text().catch(() => '');
        return {
            ok: false,
            reason: 'supabase_error',
            status: response.status,
            detail
        };
    }

    const data = await response.json().catch(() => []);
    return { ok: true, count: Array.isArray(data) ? data.length : 0 };
}

async function getLeadBySessionId(sessionId) {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
        return { ok: false, reason: 'missing_supabase_config' };
    }

    const cleanSession = String(sessionId || '').trim();
    if (!cleanSession) {
        return { ok: false, reason: 'missing_session_id' };
    }

    const endpoint = `${SUPABASE_URL}/rest/v1/${SUPABASE_LEADS_TABLE}?session_id=eq.${encodeURIComponent(cleanSession)}&select=*`;
    let response;
    try {
        response = await fetchFn(endpoint, {
            headers: {
                apikey: SUPABASE_SERVICE_KEY,
                Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        return {
            ok: false,
            reason: 'network_error',
            detail: error?.message || String(error)
        };
    }

    if (!response.ok) {
        const detail = await response.text().catch(() => '');
        return { ok: false, reason: 'supabase_error', status: response.status, detail };
    }

    const data = await response.json().catch(() => []);
    return { ok: true, data: Array.isArray(data) ? data[0] : null };
}

async function findLeadByIdentity(identity = {}) {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
        return { ok: false, reason: 'missing_supabase_config' };
    }

    const cpf = toDigits(identity.cpf || '', 14);
    const email = toText(identity.email || '', 180);
    const phone = toDigits(identity.phone || '', 20);

    const url = new URL(`${SUPABASE_URL}/rest/v1/${SUPABASE_LEADS_TABLE}`);
    url.searchParams.set('select', '*');
    url.searchParams.set('order', 'updated_at.desc');
    url.searchParams.set('limit', '1');
    if (cpf) {
        url.searchParams.set('cpf', `eq.${cpf}`);
    } else if (email) {
        url.searchParams.set('email', `eq.${email}`);
    } else if (phone) {
        url.searchParams.set('phone', `eq.${phone}`);
    } else {
        return { ok: false, reason: 'missing_identity' };
    }

    let response;
    try {
        response = await fetchFn(url.toString(), {
            headers: {
                apikey: SUPABASE_SERVICE_KEY,
                Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        return {
            ok: false,
            reason: 'network_error',
            detail: error?.message || String(error),
            data: null
        };
    }
    if (!response.ok) {
        const detail = await response.text().catch(() => '');
        return { ok: false, reason: 'supabase_error', status: response.status, detail };
    }
    const data = await response.json().catch(() => []);
    return { ok: true, data: Array.isArray(data) ? data[0] : null };
}
