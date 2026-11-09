const { getSettingsState } = require('../../lib/settings-store');

function hashString(str) {
    let hash = 0;
    const s = String(str || '');
    for (let i = 0; i < s.length; i++) {
        hash = ((hash << 5) - hash) + s.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash);
}

function formatCpfMask(rawCpf) {
    const digits = String(rawCpf || '').replace(/\D/g, '');
    if (digits.length === 11) {
        return `***.${digits.slice(3, 6)}.${digits.slice(6, 9)}-**`;
    }
    return '***.482.910-**';
}

function generateNfeKey(seed) {
    const num = String(hashString(seed)).padEnd(10, '0');
    return `3526 1114 3802 0000 0121 5500 1000 ${num.slice(0, 4)} ${num.slice(4, 8)} 8274 8192`;
}

module.exports = async (req, res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

    const method = req.method;
    if (method !== 'GET' && method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    let inputCode = '';
    let inputCpf = '';
    if (method === 'GET') {
        inputCode = String(req.query?.codigo || req.query?.code || req.query?.id || '').trim();
        inputCpf = String(req.query?.cpf || req.query?.doc || '').replace(/\D/g, '');
    } else {
        const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
        inputCode = String(body?.codigo || body?.code || body?.id || '').trim();
        inputCpf = String(body?.cpf || body?.doc || '').replace(/\D/g, '');
    }

    const settingsState = await getSettingsState().catch(() => ({ settings: null }));
    const posvendaConfig = settingsState?.settings?.posvenda || {
        carrierDefault: 'Correios Sedex / iFood Logística Express',
        deliveryDaysMin: 3,
        deliveryDaysMax: 7,
        supportWhatsapp: '5511999999999',
        supportEmail: 'suporte@entregadores-ifood.com',
        companyName: 'iFood Logística & Distribuição Brasil Ltda',
        companyCnpj: '14.380.200/0001-21'
    };

    const targetCode = inputCode || (inputCpf ? `BR${hashString(inputCpf).toString().slice(0, 8)}IF` : 'BR849204918IF');
    const seed = targetCode + (inputCpf || '');
    const numSeed = hashString(seed);

    // Compute realistic relative dates
    const now = new Date();
    const purchaseDate = new Date(now.getTime() - (28 * 60 * 60 * 1000)); // 28 hours ago
    const nfeDate = new Date(purchaseDate.getTime() + (22 * 60 * 1000)); // 22 mins later
    const packedDate = new Date(purchaseDate.getTime() + (3 * 60 * 60 * 1000)); // 3 hours later
    const shippedDate = new Date(purchaseDate.getTime() + (14 * 60 * 60 * 1000)); // next morning
    const transitDate = new Date(now.getTime() - (3 * 60 * 60 * 1000)); // 3 hours ago
    const estimatedArrival = new Date(now.getTime() + (3 * 24 * 60 * 60 * 1000)); // 3 days from now

    const formatDate = (d) => {
        return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' às ' +
               d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    };

    const formatDateOnly = (d) => {
        return d.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
    };

    const orderData = {
        ok: true,
        code: targetCode.toUpperCase(),
        carrier: posvendaConfig.carrierDefault || 'Correios Sedex / iFood Logística Express',
        status: 'em_transito',
        statusLabel: 'Objeto em trânsito para o destinatário',
        statusCode: 3,
        progressPercent: 75,
        estimatedDeliveryDate: formatDateOnly(estimatedArrival),
        estimatedDays: `${posvendaConfig.deliveryDaysMin || 3} a ${posvendaConfig.deliveryDaysMax || 7} dias úteis`,
        company: {
            name: posvendaConfig.companyName || 'iFood Logística & Distribuição',
            cnpj: posvendaConfig.companyCnpj || '14.380.200/0001-21',
            supportWhatsapp: posvendaConfig.supportWhatsapp || '5511999999999',
            supportEmail: posvendaConfig.supportEmail || 'suporte@entregadores-ifood.com'
        },
        nfe: {
            number: `00${(numSeed % 80000 + 10000)}`,
            series: '1',
            key: generateNfeKey(seed),
            issuedAt: formatDate(nfeDate),
            amount: 'R$ 0,00 (Frete e Seguro Promocional iFood)',
            taxes: 'ICMS / ISSQN recolhido na origem'
        },
        product: {
            title: 'Bag Térmica iFood Oficial - Linha Entregador Pro (45 Litros)',
            model: 'Modelo Oficial iFood Reforçado 2026',
            sku: 'IF-BAG-PRO-45L',
            image: '/assets/bagfoto.webp',
            items: [
                '1x Bag Térmica impermeável com faixas refletivas',
                '1x Isopor interno térmico de alta densidade',
                '1x Divisória ajustável para pizzas e marmitas',
                'Alças anatômicas acolchoadas com trava peitoral'
            ],
            warranty: '90 dias de Garantia Legal (Art. 26 CDC) contra defeitos de fabricação'
        },
        recipient: {
            name: 'Carlos Eduardo da Silva',
            document: formatCpfMask(inputCpf),
            address: 'Av. Paulista, 1200 - Apto 42',
            neighborhood: 'Bela Vista',
            city: 'São Paulo',
            state: 'SP',
            zip: '01310-100'
        },
        timeline: [
            {
                step: 'Objeto em trânsito',
                status: 'current',
                date: formatDate(transitDate),
                location: 'Unidade de Tratamento - Barueri/SP para Centro de Distribuição Regional',
                description: 'Carga expedida e transportada em veículo monitorado via satélite.'
            },
            {
                step: 'Objeto postado e conferido',
                status: 'completed',
                date: formatDate(shippedDate),
                location: 'Centro de Distribuição iFood - Barueri/SP',
                description: 'Volume bipado, etiquetado e integrado ao lote de despacho logístico.'
            },
            {
                step: 'Separação e embalagem finalizada',
                status: 'completed',
                date: formatDate(packedDate),
                location: 'Centro de Distribuição iFood - Barueri/SP',
                description: 'Item aprovado no controle de qualidade e embalado com proteção reforçada.'
            },
            {
                step: 'Nota Fiscal Eletrônica emitida',
                status: 'completed',
                date: formatDate(nfeDate),
                location: 'Secretaria da Fazenda (SEFAZ/SP)',
                description: `Chave de Acesso vinculada: ${generateNfeKey(seed).slice(0, 24)}... (DANFE autorizada).`
            },
            {
                step: 'Pagamento confirmado & Pedido recebido',
                status: 'completed',
                date: formatDate(purchaseDate),
                location: 'Gateway de Pagamento Integrado',
                description: 'Transação PIX aprovada com sucesso. Pedido enviado para a esteira de expedição.'
            }
        ]
    };

    res.status(200).json(orderData);
};
