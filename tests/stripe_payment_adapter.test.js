import { jest } from '@jest/globals';

async function loadStripeAdapter(client) {
  jest.resetModules();

  await jest.unstable_mockModule('../bridges/supabase/client.js', () => ({
    getSupabaseClient: jest.fn(() => client)
  }));

  const { stripePaymentAdapter } = await import('../commerce/payment_adapters/stripe_payment_adapter.js');
  return stripePaymentAdapter;
}

describe('stripePaymentAdapter', () => {
  test('createCheckoutSession requires a supabase-backed client and invokes the checkout function', async () => {
    const offlineAdapter = await loadStripeAdapter(null);
    await expect(offlineAdapter.createCheckoutSession('price_123')).resolves.toEqual({
      success: false,
      error: 'Bezahlvorgang erfordert eine Cloud-Verbindung.'
    });

    const invoke = jest.fn().mockResolvedValue({ data: { url: 'https://checkout.test' }, error: null });
    const adapter = await loadStripeAdapter({
      functions: {
        invoke
      }
    });

    await expect(adapter.createCheckoutSession('price_123')).resolves.toEqual({
      success: true,
      data: { url: 'https://checkout.test' }
    });
    expect(invoke).toHaveBeenCalledWith('stripe-checkout', {
      body: { priceId: 'price_123' }
    });

    await expect(adapter.createCheckoutSession({
      priceId: 'price_business',
      mode: 'subscription',
      productId: 'business',
      planId: 'business',
      accessLevel: 20
    })).resolves.toEqual({
      success: true,
      data: { url: 'https://checkout.test' }
    });
    expect(invoke).toHaveBeenCalledWith('stripe-checkout', {
      body: {
        priceId: 'price_business',
        mode: 'subscription',
        productId: 'business',
        planId: 'business',
        accessLevel: 20
      }
    });
  });

  test('verifySession validates the input and reads transactions through the provider adapter', async () => {
    const offlineAdapter = await loadStripeAdapter(null);
    await expect(offlineAdapter.verifySession('cs_123')).resolves.toEqual({
      success: false,
      error: 'Verification requires cloud connection'
    });

    const validAdapter = await loadStripeAdapter({
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            in: jest.fn(() => ({
              single: jest.fn().mockResolvedValue({
                data: { id: 'txn_1', status: 'paid', plan_id: 'business' },
                error: null
              })
            }))
          }))
        }))
      }))
    });

    await expect(validAdapter.verifySession('cs_123')).resolves.toEqual({
      success: true,
      data: expect.objectContaining({
        sessionId: 'cs_123',
        verified: true,
        transaction: expect.objectContaining({ plan_id: 'business' })
      })
    });
  });
});
