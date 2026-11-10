const fetchFn = global.fetch
    ? global.fetch.bind(global)
    : (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.SUPABASE_PROJECT_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE || '';
const CLONE_EVENTS_TABLE = process.env.SUPABASE_CLONE_EVENTS_TABLE || 'security_clone_events';
const APP_PUBLIC_URL = process.env.APP_PUBLIC_URL || 'https://ifoodparceiro.vercel.app';
const DEFAULT_ALLOWED_HOSTS = ['entregadoresifood.vercel.app', 'ifoodparceiro.vercel.app', 'ifoodbag.com.br', 'www.ifoodbag.com.br', 'ifoodbag.vercel.app', 'localhost', '127.0.0.1'];

function parseList(value) {
    return String(value || '')
        .split(',')
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean);
}

function normalizeHost(value) {
    const raw = String(value || '').split(',')[0].trim().toLowerCase();
    if (!raw) return '';
    try {
        if (raw.startsWith('http://') || raw.startsWith('https://')) {
            return new URL(raw).hostname.toLowerCase();
        }
    } catch (_error) {
        return '';
    }
    return raw.split('/')[0].split(':')[0];
}

function getOfficialHosts() {
    const configured = parseList(process.env.APP_ALLOWED_HOSTS).map(normalizeHost).filter(Boolean);
    const fromPublicUrl = normalizeHost(APP_PUBLIC_URL);
    return Array.from(new Set([...DEFAULT_ALLOWED_HOSTS, fromPublicUrl, ...configured].filter(Boolean)));
}

function isAllowedHost(host) {
    const normalized = normalizeHost(host);
    if (!normalized) return false;
    return getOfficialHosts().some((allowed) => {
        if (allowed.startsWith('*.')) return normalized.endsWith(allowed.slice(1));
        return normalized === allowed;
    });
}

function firstHeader(req, name) {
    const value = req?.headers?.[name.toLowerCase()] || req?.headers?.[name] || '';
    if (Array.isArray(value)) return value[0] || '';
    return String(value || '');
}

function clientIp(req) {
    const forwarded = firstHeader(req, 'x-forwarded-for');
    if (forwarded) return forwarded.split(',')[0].trim();
    return req?.socket?.remoteAddress || '';
}

function toText(value, maxLen = 500) {
    const text = String(value || '').trim();
    if (!text) return '';
    return text.length > maxLen ? text.slice(0, maxLen) : text;
}

function scoreCloneEvent(event) {
    let score = 0;
    if (event.reported_host && !isAllowedHost(event.reported_host)) score += 55;
    if (event.event_type === 'clone_beacon') score += 15;
    if (event.event_type === 'asset_hotlink') score += 20;
    if (event.event_type === 'api_probe') score += 40;
    if (event.page === 'pix' || event.page === 'checkout') score += 20;
    if (!event.referrer && !event.origin) score += 8;
    if (/bot|crawler|spider|headless|python|curl|wget|httpclient/i.test(event.user_agent || '')) score += 25;
    return Math.min(score, 100);
}

function buildCloneEvent(input = {}, req = null) {
    const hostFromRequest = normalizeHost(firstHeader(req, 'x-forwarded-host') || firstHeader(req, 'host'));
    const reportedHost = normalizeHost(input.host || input.hostname || input.reported_host);
    const officialHost = normalizeHost(input.officialHost || input.official_host || APP_PUBLIC_URL);
    const event = {
        event_type: toText(input.eventType || input.event_type || 'clone_beacon', 80),
        page: toText(input.page || '', 80),
        reported_host: reportedHost,
        official_host: officialHost || hostFromRequest,
        href: toText(input.href || input.url || '', 1000),
        referrer: toText(input.referrer || firstHeader(req, 'referer'), 1000),
        origin: toText(input.origin || firstHeader(req, 'origin'), 300),
        source_url: toText(input.sourceUrl || input.source_url || '', 1000),
        screen: toText(input.screen || '', 80),
        timezone: toText(input.timezone || '', 120),
        language: toText(input.language || '', 80),
        user_agent: toText(firstHeader(req, 'user-agent') || input.userAgent || input.user_agent, 500),
        client_ip: toText(clientIp(req), 120),
        payload: {
            requestHost: hostFromRequest,
            query: input
        }
    };
    event.risk_score = scoreCloneEvent(event);
    return event;
}

async function recordCloneEvent(input = {}, req = null) {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
        return { ok: false, reason: 'missing_supabase_config' };
    }

    const event = buildCloneEvent(input, req);
    if (!event.reported_host || isAllowedHost(event.reported_host)) {
        return { ok: true, skipped: true, reason: 'allowed_or_missing_host' };
    }

    let response;
    try {
        response = await fetchFn(`${SUPABASE_URL}/rest/v1/${CLONE_EVENTS_TABLE}`, {
            method: 'POST',
            headers: {
                apikey: SUPABASE_SERVICE_KEY,
                Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
                'Content-Type': 'application/json',
                Prefer: 'return=minimal'
            },
            body: JSON.stringify([event])
        });
    } catch (error) {
        return { ok: false, reason: 'network_error', detail: error?.message || String(error) };
    }

    if (!response.ok) {
        const detail = await response.text().catch(() => '');
        return { ok: false, reason: 'supabase_error', detail };
    }

    return { ok: true };
}

async function listCloneEvents({ limit = 1000 } = {}) {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
        return { ok: false, reason: 'missing_supabase_config', events: [] };
    }

    const safeLimit = Math.min(Math.max(Number(limit) || 1000, 1), 5000);
    const endpoint = `${SUPABASE_URL}/rest/v1/${CLONE_EVENTS_TABLE}?select=*&order=created_at.desc&limit=${safeLimit}`;
    let response;
    try {
        response = await fetchFn(endpoint, {
            headers: {
                apikey: SUPABASE_SERVICE_KEY,
                Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`
            }
        });
    } catch (error) {
        return { ok: false, reason: 'network_error', detail: error?.message || String(error), events: [] };
    }

    if (!response.ok) {
        const detail = await response.text().catch(() => '');
        return { ok: false, reason: 'supabase_error', detail, events: [] };
    }

    const events = await response.json().catch(() => []);
    return { ok: true, events: Array.isArray(events) ? events : [] };
}

module.exports = {
    buildCloneEvent,
    getOfficialHosts,
    isAllowedHost,
    listCloneEvents,
    recordCloneEvent
};
