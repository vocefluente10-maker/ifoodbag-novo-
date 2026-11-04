const express = require('express');
const path = require('path');
const fs = require('fs');
const { upsertLead } = require('./lib/lead-store');
const { ensureAllowedRequest, issueSessionCookie } = require('./lib/request-guard');
const { getSettings, getSettingsState, saveSettings, defaultSettings } = require('./lib/settings-store');
const { verifyAdminPassword, issueAdminCookie, verifyAdminCookie, requireAdmin } = require('./lib/admin-auth');
const { sendUtmfy } = require('./lib/utmfy');
const { upsertPageview } = require('./lib/pageviews-store');
const siteSessionHandler = require('./api/site/session');
const siteConfigHandler = require('./api/site/config');
const leadTrackHandler = require('./api/lead/track');
const leadPageviewHandler = require('./api/lead/pageview');
const pixCreateHandler = require('./api/pix/create');
const pixStatusHandler = require('./api/pix/status');
const pixWebhookHandler = require('./api/pix/webhook');
const remarketingRecoveryHandler = require('./api/remarketing/recovery');
const smsMaisWebhookHandler = require('./api/smsmais/webhook');
const adminApiHandler = require('./lib/admin-api-handler');
const clonePixelHandler = require('./api/security/clone-pixel');

const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
    require('dotenv').config({ path: envPath });
}

const app = express();
const PORT = process.env.PORT || 3000;

const fetchFn = global.fetch
    ? global.fetch.bind(global)
    : (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

app.use(express.json({ limit: '1mb' }));
app.use(express.static(__dirname));

// Keep local Express behavior aligned with the serverless API handlers.
app.post('/api/pix/create', (req, res) => pixCreateHandler(req, res));
app.post('/api/pix/status', (req, res) => pixStatusHandler(req, res));
app.post('/api/pix/webhook', (req, res) => pixWebhookHandler(req, res));
app.all('/api/remarketing/recovery', (req, res) => remarketingRecoveryHandler(req, res));
app.post('/api/smsmais/webhook', (req, res) => smsMaisWebhookHandler(req, res));
app.all('/api/admin/*', (req, res) => adminApiHandler(req, res));
app.all('/api/site/session', (req, res) => siteSessionHandler(req, res));
app.all('/api/site/config', (req, res) => siteConfigHandler(req, res));
app.all('/api/lead/track', (req, res) => leadTrackHandler(req, res));
app.all('/api/lead/pageview', (req, res) => leadPageviewHandler(req, res));
app.all('/api/security/clone-pixel', (req, res) => clonePixelHandler(req, res));

app.get('/', (_req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/admin', (_req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

app.get('/admin/tracking', (_req, res) => {
    res.sendFile(path.join(__dirname, 'admin-tracking.html'));
});

app.get('/admin/utmfy', (_req, res) => {
    res.sendFile(path.join(__dirname, 'admin-utmfy.html'));
});

app.get('/admin/smsmais', (_req, res) => {
    res.sendFile(path.join(__dirname, 'admin-smsmais.html'));
});

app.get('/admin/gateways', (_req, res) => {
    res.sendFile(path.join(__dirname, 'admin-gateways.html'));
});

app.get('/admin/upsell', (_req, res) => {
    res.sendFile(path.join(__dirname, 'admin-upsell.html'));
});

app.get('/admin/pages', (_req, res) => {
    res.sendFile(path.join(__dirname, 'admin-pages.html'));
});

app.get('/admin/publico', (_req, res) => {
    res.sendFile(path.join(__dirname, 'admin-publico.html'));
});

app.get('/admin/vendas', (_req, res) => {
    res.sendFile(path.join(__dirname, 'admin-sales.html'));
});

app.get('/admin/backredirects', (_req, res) => {
    res.sendFile(path.join(__dirname, 'admin-backredirects.html'));
});

app.get('/admin/leads', (_req, res) => {
    res.sendFile(path.join(__dirname, 'admin-leads.html'));
});

app.get('/admin/clonadores', (_req, res) => {
    res.sendFile(path.join(__dirname, 'admin-clonadores.html'));
});

const funnelRoutes = {
    '/quiz': 'quiz.html',
    '/dados': 'dados.html',
    '/endereco': 'endereco.html',
    '/processando': 'processando.html',
    '/sucesso': 'sucesso.html',
    '/checkout': 'checkout.html',
    '/orderbump': 'orderbump.html',
    '/pix-loading': 'pix-loading.html',
    '/pix': 'pix.html',
    '/remarketing': 'remarketing.html',
    '/upsell-iof': 'upsell-iof.html',
    '/upsell-correios': 'upsell-correios.html',
    '/upsell': 'upsell.html'
};

for (const [routePath, fileName] of Object.entries(funnelRoutes)) {
    app.get(routePath, (_req, res) => {
        res.sendFile(path.join(__dirname, fileName));
    });
}

app.post('/api/admin/utmfy-test', async (req, res) => {
    if (!ensureAllowedRequest(req, res, { requireSession: false })) {
        return;
    }
    if (!requireAdmin(req, res)) return;

    const result = await sendUtmfy('admin_test', {
        source: 'admin',
        timestamp: new Date().toISOString()
    });

    if (!result.ok) {
        res.status(400).json({ error: 'Falha ao enviar evento.', detail: result });
        return;
    }

    res.status(200).json({ ok: true });
});

app.post('/api/admin/utmfy-sale', async (req, res) => {
    if (!ensureAllowedRequest(req, res, { requireSession: false })) {
        return;
    }
    if (!requireAdmin(req, res)) return;

    const amount = 56.1;
    const payload = {
        event: 'purchase',
        amount,
        currency: 'BRL',
        order_id: `manual-${Date.now()}`,
        source: 'admin_manual',
        created_at: new Date().toISOString()
    };

    const result = await sendUtmfy('purchase', payload);
    if (!result.ok) {
        res.status(400).json({ error: 'Falha ao enviar venda.', detail: result });
        return;
    }

    res.status(200).json({ ok: true, amount });
});

app.post('/api/lead/track', async (req, res) => {
    if (!ensureAllowedRequest(req, res, { requireSession: true })) {
        return;
    }

    try {
        const body = req.body || {};
        const result = await upsertLead(body, req);
        if (!result.ok && (result.reason === 'missing_supabase_config' || result.reason === 'skipped_no_data')) {
            return res.status(202).json({ ok: false, reason: result.reason });
        }
        if (!result.ok) {
            return res.status(502).json({ ok: false, reason: result.reason, detail: result.detail || '' });
        }

        return res.json({ ok: true });
    } catch (error) {
        return res.status(500).json({ ok: false, error: error.message || String(error) });
    }
});

app.post('/api/lead/pageview', async (req, res) => {
    if (!ensureAllowedRequest(req, res, { requireSession: true })) {
        return;
    }
    const result = await upsertPageview(req.body?.sessionId, req.body?.page);
    if (!result.ok && result.reason === 'missing_supabase_config') {
        res.status(202).json({ ok: false, reason: result.reason });
        return;
    }
    if (!result.ok) {
        res.status(502).json({ ok: false, reason: result.reason, detail: result.detail || '' });
        return;
    }
    res.json({ ok: true });
});

app.get('/api/site/session', (req, res) => {
    if (!ensureAllowedRequest(req, res, { requireSession: false })) {
        return;
    }
    issueSessionCookie(req, res);
    return res.json({ ok: true });
});

app.get('/api/site/config', async (req, res) => {
    if (!ensureAllowedRequest(req, res, { requireSession: false })) {
        return;
    }
    const settingsState = await getSettingsState({ strict: true });
    if (!settingsState?.ok || !settingsState?.settings) {
        res.status(503).json({ error: 'config_unavailable' });
        return;
    }
    const settings = settingsState.settings;
    const pixel = settings.pixel || {};
    const tiktokPixel = settings.tiktokPixel || {};
    const features = settings.features || {};
    res.json({
        pixel: {
            enabled: !!pixel.enabled,
            id: pixel.id || '',
            backupId: pixel.backupId || '',
            events: pixel.events || {}
        },
        tiktokPixel: {
            enabled: !!tiktokPixel.enabled,
            id: tiktokPixel.id || '',
            events: tiktokPixel.events || {}
        },
        features
    });
});

app.post('/api/admin/login', async (req, res) => {
    if (!ensureAllowedRequest(req, res, { requireSession: false })) {
        return;
    }
    if (!verifyAdminPassword(req.body?.password || '')) {
        res.status(401).json({ error: 'Senha invalida.' });
        return;
    }
    issueAdminCookie(res);
    res.json({ ok: true });
});

app.get('/api/admin/me', async (req, res) => {
    if (!ensureAllowedRequest(req, res, { requireSession: false })) {
        return;
    }
    if (!verifyAdminCookie(req)) {
        res.status(401).json({ ok: false });
        return;
    }
    res.json({ ok: true });
});

app.get('/api/admin/settings', async (req, res) => {
    if (!ensureAllowedRequest(req, res, { requireSession: false })) {
        return;
    }
    if (!requireAdmin(req, res)) return;
    const settingsState = await getSettingsState({ strict: true });
    if (!settingsState?.ok || !settingsState?.settings || settingsState.source !== 'supabase') {
        res.status(503).json({ error: 'Falha ao carregar configuracao. Recarregue o painel.' });
        return;
    }
    res.json({
        ...settingsState.settings,
        _meta: {
            source: settingsState.source,
            updatedAt: String(settingsState.updatedAt || '').trim(),
            stale: !!settingsState.stale
        }
    });
});

app.post('/api/admin/settings', async (req, res) => {
    if (!ensureAllowedRequest(req, res, { requireSession: false })) {
        return;
    }
    if (!requireAdmin(req, res)) return;
    const currentState = await getSettingsState({ strict: true }).catch(() => ({ ok: false, settings: null, source: 'none' }));
    if (!currentState?.ok || !currentState?.settings || currentState.source !== 'supabase') {
        res.status(503).json({ error: 'Falha ao carregar configuracao atual. Recarregue antes de salvar.' });
        return;
    }
    const baseUpdatedAt = String(req.body?._meta?.baseUpdatedAt || '').trim();
    const currentUpdatedAt = String(currentState.updatedAt || '').trim();
    if (currentUpdatedAt && (!baseUpdatedAt || baseUpdatedAt !== currentUpdatedAt)) {
        res.status(409).json({ error: 'Configuracao desatualizada. Recarregue o painel antes de salvar.' });
        return;
    }
    const safeBody = Object.fromEntries(Object.entries(req.body || {}).filter(([key]) => key !== '_meta'));
    const hasPixelSection = safeBody.pixel && typeof safeBody.pixel === 'object';
    const hasTikTokPixelSection = safeBody.tiktokPixel && typeof safeBody.tiktokPixel === 'object';
    const hasUtmfySection = safeBody.utmfy && typeof safeBody.utmfy === 'object';
    const currentSaved = currentState.settings || {};
    const payload = {
        ...defaultSettings,
        ...safeBody,
        pixel: hasPixelSection
            ? {
                ...defaultSettings.pixel,
                ...(currentSaved?.pixel || {}),
                ...(safeBody?.pixel || {}),
                id: String(safeBody?.pixel?.id || '').trim(),
                backupId: String(safeBody?.pixel?.backupId || '').trim()
            }
            : {
                ...defaultSettings.pixel,
                ...(currentSaved?.pixel || {})
            },
        tiktokPixel: hasTikTokPixelSection
            ? { ...defaultSettings.tiktokPixel, ...(currentSaved?.tiktokPixel || {}), ...(safeBody?.tiktokPixel || {}) }
            : { ...defaultSettings.tiktokPixel, ...(currentSaved?.tiktokPixel || {}) },
        utmfy: hasUtmfySection
            ? { ...defaultSettings.utmfy, ...(currentSaved?.utmfy || {}), ...(safeBody?.utmfy || {}) }
            : { ...defaultSettings.utmfy, ...(currentSaved?.utmfy || {}) },
        payments: {
            ...defaultSettings.payments,
            ...(currentSaved?.payments || {}),
            ...(safeBody?.payments || {})
        },
        pushcut: {
            ...defaultSettings.pushcut,
            ...(currentSaved?.pushcut || {}),
            ...(safeBody?.pushcut || {})
        },
        features: {
            ...defaultSettings.features,
            ...(currentSaved?.features || {}),
            ...(safeBody?.features || {})
        }
    };
    const result = await saveSettings(payload);
    if (!result.ok) {
        res.status(502).json({ error: 'Falha ao salvar configuracao.' });
        return;
    }
    res.json({ ok: true, updatedAt: String(result.updatedAt || '').trim() });
});

app.get('/api/admin/leads', async (req, res) => {
    if (!ensureAllowedRequest(req, res, { requireSession: false })) {
        return;
    }
    if (!requireAdmin(req, res)) return;

    const SUPABASE_URL = process.env.SUPABASE_URL || process.env.SUPABASE_PROJECT_URL || '';
    const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE || '';
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
        res.status(500).json({ error: 'Supabase nao configurado.' });
        return;
    }

    const url = new URL(`${SUPABASE_URL}/rest/v1/leads_readable`);
    const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 200);
    const offset = Math.max(Number(req.query.offset) || 0, 0);
    const query = String(req.query.q || '').trim();

    url.searchParams.set('select', '*');
    url.searchParams.set('order', 'updated_at.desc');
    url.searchParams.set('limit', String(limit));
    url.searchParams.set('offset', String(offset));

    if (query) {
        const ilike = `%${query.replace(/%/g, '')}%`;
        url.searchParams.set('or', `nome.ilike.${ilike},email.ilike.${ilike},telefone.ilike.${ilike},cpf.ilike.${ilike}`);
    }

    const response = await fetchFn(url.toString(), {
        headers: {
            apikey: SUPABASE_SERVICE_KEY,
            Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        const detail = await response.text().catch(() => '');
        res.status(502).json({ error: 'Falha ao buscar leads.', detail });
        return;
    }

    const data = await response.json().catch(() => []);
    res.json({ data });
});

app.get('/api/admin/pages', async (req, res) => {
    if (!ensureAllowedRequest(req, res, { requireSession: false })) {
        return;
    }
    if (!requireAdmin(req, res)) return;

    const SUPABASE_URL = process.env.SUPABASE_URL || process.env.SUPABASE_PROJECT_URL || '';
    const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE || '';
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
        res.status(500).json({ error: 'Supabase nao configurado.' });
        return;
    }

    const response = await fetchFn(`${SUPABASE_URL}/rest/v1/pageview_counts?select=*`, {
        headers: {
            apikey: SUPABASE_SERVICE_KEY,
            Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        const detail = await response.text().catch(() => '');
        res.status(502).json({ error: 'Falha ao buscar paginas.', detail });
        return;
    }

    const data = await response.json().catch(() => []);
    res.json({ data });
});

app.get('/api/admin/backredirects', async (req, res) => {
    if (!ensureAllowedRequest(req, res, { requireSession: false })) {
        return;
    }
    if (!requireAdmin(req, res)) return;

    const SUPABASE_URL = process.env.SUPABASE_URL || process.env.SUPABASE_PROJECT_URL || '';
    const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE || '';
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
        res.status(500).json({ error: 'Supabase nao configurado.' });
        return;
    }

    const response = await fetchFn(`${SUPABASE_URL}/rest/v1/pageview_counts?select=*`, {
        headers: {
            apikey: SUPABASE_SERVICE_KEY,
            Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        const detail = await response.text().catch(() => '');
        res.status(502).json({ error: 'Falha ao buscar dados de backredirect.', detail });
        return;
    }

    const rows = await response.json().catch(() => []);
    const totalsByPage = new Map(
        (Array.isArray(rows) ? rows : []).map((row) => [
            String(row?.page || '').trim().toLowerCase(),
            Number(row?.total) || 0
        ])
    );

    const prefix = 'backredirect_';
    const data = [];
    totalsByPage.forEach((backTotal, pageKey) => {
        if (!pageKey.startsWith(prefix)) return;
        const page = pageKey.slice(prefix.length);
        if (!page) return;
        const pageViews = Number(totalsByPage.get(page) || 0);
        const rate = pageViews > 0
            ? Math.round((Number(backTotal || 0) / pageViews) * 1000) / 10
            : 0;
        data.push({
            page,
            backTotal: Number(backTotal || 0),
            pageViews,
            rate
        });
    });

    data.sort((a, b) => {
        if (b.backTotal !== a.backTotal) return b.backTotal - a.backTotal;
        if (b.rate !== a.rate) return b.rate - a.rate;
        return a.page.localeCompare(b.page);
    });

    const totalBack = data.reduce((sum, row) => sum + Number(row.backTotal || 0), 0);
    const totalViews = data.reduce((sum, row) => sum + Number(row.pageViews || 0), 0);
    const avgRate = totalViews > 0 ? Math.round((totalBack / totalViews) * 1000) / 10 : 0;

    res.json({
        data,
        summary: {
            totalBack,
            totalViews,
            avgRate
        }
    });
});

app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
});

app.listen(PORT, () => {
    console.log(`Servidor ativo em http://localhost:${PORT}`);
});
