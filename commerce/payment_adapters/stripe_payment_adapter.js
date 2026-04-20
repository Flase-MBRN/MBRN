import { getSupabaseClient } from '../../bridges/supabase/client.js';

export const stripePaymentAdapter = {
  async createCheckoutSession(priceId) {
    const client = getSupabaseClient();
    if (!client) {
      return { success: false, error: 'Bezahlvorgang erfordert eine Cloud-Verbindung.' };
    }

    try {
      const { data, error } = await client.functions.invoke('stripe-checkout', {
        body: { priceId }
      });

      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      console.error('[StripeAdapter] Checkout Session creation failed:', err);
      return { success: false, error: err.message };
    }
  },

  async verifySession(sessionId) {
    const client = getSupabaseClient();
    if (!client) {
      return { success: false, error: 'Verification requires cloud connection' };
    }

    if (!sessionId || typeof sessionId !== 'string') {
      return { success: false, error: 'Invalid sessionId provided' };
    }

    try {
      const { data, error } = await client
        .from('transactions')
        .select('id, status, user_id, product_id, amount_total, currency, stripe_session_id, created_at')
        .eq('stripe_session_id', sessionId)
        .in('status', ['succeeded', 'complete', 'paid', 'completed'])
        .single();

      if (error || !data) {
        return {
          success: false,
          error: 'Session not found or payment not completed',
          code: 'SESSION_INVALID'
        };
      }

      return {
        success: true,
        data: {
          sessionId,
          verified: true,
          transaction: data,
          verifiedAt: new Date().toISOString()
        }
      };
    } catch (err) {
      console.error('[StripeAdapter] Session verification failed:', err);
      return { success: false, error: err.message, code: 'VERIFICATION_ERROR' };
    }
  }
};
