// supabase/functions/stripe-webhook/index.ts
// Supabase Edge Function: Stripe Webhook Handler (Phase 18.3)
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import Stripe from "https://esm.sh/stripe@12.0.0?target=deno"

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2022-11-15',
  httpClient: Stripe.createFetchHttpClient(),
})

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '' // Important: Bypass RLS for level upgrade
)

serve(async (req) => {
  try {
    const signature = req.headers.get('stripe-signature')
    if (!signature) throw new Error('Missing stripe-signature')

    const body = await req.text()
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? ''
    )

    console.log(`[The Vault] Handling webhook event: ${event.type}`)

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any
      const userId = session.client_reference_id

      if (userId) {
        console.log(`[The Vault] Payment Success. Upgrading user ${userId} to PAID_PRO (Level 10)`)

        // 1. Upgrade User Level
        const { error: profileError } = await supabaseAdmin
          .from('profiles')
          .update({ access_level: 10 })
          .eq('id', userId)

        if (profileError) throw profileError

        // 2. Log Transaction
        const { error: transError } = await supabaseAdmin
          .from('transactions')
          .upsert(
            {
              stripe_session_id: session.id,
              user_id: userId,
              product_id: session.metadata?.product_id ?? 'deep_report',
              amount_total: session.amount_total,
              currency: session.currency,
              status: 'completed'
            },
            {
              onConflict: 'stripe_session_id'
            }
          )

        if (transError) throw transError
      }
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 })
  } catch (err) {
    console.error(`[The Vault] Webhook Error: ${err.message}`)
    return new Response(JSON.stringify({ error: err.message }), { status: 400 })
  }
})
