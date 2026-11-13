const assert = require('node:assert');
const {
    DEFAULT_ATLASPAGS_BASE_URL,
    DEFAULT_ATLASPAGS_PUBLIC_KEY,
    DEFAULT_ATLASPAGS_SECRET_KEY,
    ACTIVE_PAYMENT_GATEWAYS,
    normalizeGatewayAlias,
    buildAtlaspagsConfig,
    buildPaymentsConfig,
    resolveGatewayFromPayload
} = require('../lib/payment-gateway-config');
const {
    cleanApiKey,
    resolveBaseUrl,
    resolveChargeEndpoint,
    resolveTransactionEndpoint,
    resolvePingEndpoint,
    resolvePublicConfigEndpoint,
    resolveAtlaspagsCreateResponse,
    requestCreateTransaction,
    requestTransactionById,
    requestAtlaspagsPing,
    getAtlaspagsStatus,
    isAtlaspagsPaidStatus,
    isAtlaspagsPendingStatus,
    isAtlaspagsRefundedStatus,
    isAtlaspagsRefusedStatus,
    mapAtlaspagsStatusToUtmify,
    verifyAtlasWebhookSignature,
    isValidCPF,
    generateValidCPF,
    ensureValidCPF
} = require('../lib/atlaspags-provider');

async function runTests() {
    console.log('--- TEST 1: Config and Aliases ---');
    assert.strictEqual(DEFAULT_ATLASPAGS_BASE_URL, 'https://atlaspags.com');
    assert.strictEqual(DEFAULT_ATLASPAGS_PUBLIC_KEY, 'atlas_pk_live_VYdeybn7heQiSaw573dnCbIj');
    assert.strictEqual(DEFAULT_ATLASPAGS_SECRET_KEY, 'atlas_sk_live_ER1UyXK0qFjarGNHFBtmoiwHuG6vfSiM');
    assert.ok(ACTIVE_PAYMENT_GATEWAYS.includes('atlaspags'));

    assert.strictEqual(normalizeGatewayAlias('atlaspags'), 'atlaspags');
    assert.strictEqual(normalizeGatewayAlias('atlaspag'), 'atlaspags');
    assert.strictEqual(normalizeGatewayAlias('atlas'), 'atlaspags');
    assert.strictEqual(normalizeGatewayAlias('atlaspay'), 'atlaspags');

    const config = buildAtlaspagsConfig({});
    assert.strictEqual(config.gateway, 'atlaspags');
    assert.strictEqual(config.apiKey, 'atlas_sk_live_ER1UyXK0qFjarGNHFBtmoiwHuG6vfSiM');
    assert.strictEqual(config.publicKey, 'atlas_pk_live_VYdeybn7heQiSaw573dnCbIj');
    assert.strictEqual(config.baseUrl, 'https://atlaspags.com');

    const payments = buildPaymentsConfig({
        activeGateway: 'atlaspags',
        gateways: {
            atlaspags: { enabled: true }
        }
    });
    assert.strictEqual(payments.activeGateway, 'atlaspags');
    assert.strictEqual(payments.gateways.atlaspags.enabled, true);

    const fromPayload = resolveGatewayFromPayload({ gateway: 'atlaspags' });
    assert.strictEqual(fromPayload, 'atlaspags');
    console.log('✓ Config and aliases passed');

    console.log('--- TEST 2: URL Endpoints Resolution ---');
    assert.strictEqual(resolveBaseUrl({ baseUrl: 'https://atlaspags.com' }), 'https://atlaspags.com/api/v1');
    assert.strictEqual(resolveBaseUrl({ baseUrl: 'https://atlaspags.com/api' }), 'https://atlaspags.com/api/v1');
    assert.strictEqual(resolveBaseUrl({ baseUrl: 'https://atlaspags.com/api/v1' }), 'https://atlaspags.com/api/v1');
    assert.strictEqual(resolveChargeEndpoint({ baseUrl: 'https://atlaspags.com' }), 'https://atlaspags.com/api/v1/charges');
    assert.strictEqual(resolveTransactionEndpoint({ baseUrl: 'https://atlaspags.com' }, 'ch_123'), 'https://atlaspags.com/api/v1/charges/ch_123');
    assert.strictEqual(resolvePingEndpoint({ baseUrl: 'https://atlaspags.com' }), 'https://atlaspags.com/api/v1/ping');
    assert.strictEqual(resolvePublicConfigEndpoint({ baseUrl: 'https://atlaspags.com', publicKey: 'pk_test' }), 'https://atlaspags.com/api/v1/public/config?key=pk_test');
    console.log('✓ Endpoints resolution passed');

    console.log('--- TEST 3: CPF Validation & Generation ---');
    const validCpf = generateValidCPF();
    assert.strictEqual(validCpf.length, 11);
    assert.ok(isValidCPF(validCpf));
    assert.strictEqual(isValidCPF('11111111111'), false);
    assert.strictEqual(isValidCPF('00000000000'), false);
    assert.strictEqual(isValidCPF('12345678900'), false);
    assert.ok(isValidCPF('52998224725')); // known valid test CPF
    assert.ok(isValidCPF(ensureValidCPF('11111111111')));
    assert.strictEqual(ensureValidCPF('52998224725'), '52998224725');
    console.log('✓ CPF helper functions passed');

    console.log('--- TEST 4: Response & Status Parsing ---');
    const sampleResponse = {
        id: 'c123456',
        status: 'pending',
        amount: 19.90,
        fee: 1.50,
        pix: {
            code: '00020126...',
            qr_code_image: 'data:image/svg+xml;charset=utf-8,%3Csvg%20...'
        }
    };
    const parsed = resolveAtlaspagsCreateResponse(sampleResponse);
    assert.strictEqual(parsed.txid, 'c123456');
    assert.strictEqual(parsed.paymentCode, '00020126...');
    assert.strictEqual(parsed.status, 'pending');
    assert.strictEqual(parsed.amount, 19.90);
    assert.strictEqual(parsed.fee, 1.50);
    assert.strictEqual(parsed.paymentQrUrl, sampleResponse.pix.qr_code_image);

    assert.ok(isAtlaspagsPaidStatus('paid'));
    assert.ok(isAtlaspagsPaidStatus('PAID'));
    assert.ok(isAtlaspagsPendingStatus('pending'));
    assert.ok(isAtlaspagsRefundedStatus('refunded'));
    assert.ok(isAtlaspagsRefusedStatus('expired'));
    assert.ok(isAtlaspagsRefusedStatus('failed'));
    assert.strictEqual(mapAtlaspagsStatusToUtmify('paid'), 'paid');
    assert.strictEqual(mapAtlaspagsStatusToUtmify('pending'), 'waiting_payment');
    assert.strictEqual(mapAtlaspagsStatusToUtmify('refunded'), 'refunded');
    assert.strictEqual(mapAtlaspagsStatusToUtmify('failed'), 'refused');
    console.log('✓ Response & status parsing passed');

    console.log('--- TEST 5: Live API Ping ---');
    const pingResult = await requestAtlaspagsPing(config);
    assert.strictEqual(pingResult.response?.status, 200);
    assert.strictEqual(pingResult.data?.ok, true);
    assert.strictEqual(pingResult.data?.livemode, true);
    console.log('✓ Live API Ping OK (200, livemode=true)');

    console.log('--- TEST 6: Live API PIX Creation & Query ---');
    const testCpf = generateValidCPF();
    const testRef = `test-unit-${Date.now()}`;
    const createResult = await requestCreateTransaction(config, {
        amount: 5.00,
        method: 'pix',
        customer: {
            name: 'Teste Unitario Antigravity',
            email: 'teste@example.com',
            document: testCpf,
            phone: '11999999999'
        },
        description: 'Bag',
        checkout_url: 'https://entregadoresifood.vercel.app/checkout',
        external_id: testRef
    }, { idempotencyKey: testRef });

    assert.strictEqual(createResult.response?.status, 200, `Create PIX failed with status ${createResult.response?.status}`);
    assert.ok(createResult.data?.id, 'Expected charge ID in response');
    assert.ok(createResult.data?.pix?.code, 'Expected pix.code in response');
    console.log(`✓ Live PIX Charge created: ${createResult.data.id}`);

    const queryResult = await requestTransactionById(config, createResult.data.id);
    assert.strictEqual(queryResult.response?.status, 200);
    assert.strictEqual(queryResult.data?.id, createResult.data.id);
    assert.strictEqual(queryResult.data?.status, 'pending');
    console.log(`✓ Live PIX Charge queried successfully (status=${queryResult.data.status})`);

    console.log('\n=======================================');
    console.log('ALL ATLASPAGS INTEGRATION TESTS PASSED!');
    console.log('=======================================');
}

runTests().catch((err) => {
    console.error('Test failed:', err);
    process.exit(1);
});
