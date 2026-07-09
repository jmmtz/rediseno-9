import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from 'npm:stripe@17.7.0';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY')!;
const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;
const stripe = new Stripe(stripeSecret, {
  appInfo: { name: 'Bolt Integration', version: '1.0.0' },
});

const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

Deno.serve(async (req) => {
  try {
    if (req.method === 'OPTIONS') return new Response(null, { status: 204 });
    if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

    const signature = req.headers.get('stripe-signature');
    if (!signature) return new Response('No signature found', { status: 400 });

    const body = await req.text();

    let event: Stripe.Event;
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, stripeWebhookSecret);
    } catch (error: any) {
      console.error(`Webhook signature verification failed: ${error.message}`);
      return new Response(`Webhook signature verification failed: ${error.message}`, { status: 400 });
    }

    EdgeRuntime.waitUntil(handleEvent(event));
    return Response.json({ received: true });
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function handleEvent(event: Stripe.Event) {
  const stripeData = event?.data?.object ?? {};
  if (!stripeData) return;

  // ── Salon appointment payment confirmation ────────────────────────────────
  if (event.type === 'checkout.session.completed') {
    const session = stripeData as Stripe.Checkout.Session;
    const appointmentId = session.metadata?.appointment_id;

    if (appointmentId) {
      // Confirm the salon appointment
      const { error: apptErr } = await supabase
        .from('appointments')
        .update({
          status: 'confirmada',
          payment_status: 'pagado',
          payment_intent_id: typeof session.payment_intent === 'string'
            ? session.payment_intent
            : session.payment_intent?.id ?? '',
          updated_at: new Date().toISOString(),
        })
        .eq('id', appointmentId);

      if (apptErr) {
        console.error('Error confirming appointment:', apptErr);
      } else {
        console.info(`Appointment ${appointmentId} confirmed via Stripe`);
      }

      // Increment coupon used_count if applicable
      const couponCode = session.metadata?.coupon_code;
      if (couponCode) {
        const { data: coupon } = await supabase
          .from('coupons')
          .select('id, used_count')
          .eq('code', couponCode)
          .maybeSingle();
        if (coupon) {
          await supabase
            .from('coupons')
            .update({ used_count: coupon.used_count + 1 })
            .eq('id', coupon.id);
        }
      }
      return;
    }

    // ── Standard subscription / one-time order flow ───────────────────────
    if (!('customer' in stripeData)) return;

    const { mode, payment_status } = session;
    const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id;
    if (!customerId) return;

    if (mode === 'subscription') {
      console.info(`Starting subscription sync for customer: ${customerId}`);
      await syncCustomerFromStripe(customerId);
    } else if (mode === 'payment' && payment_status === 'paid') {
      try {
        const { id: checkout_session_id, payment_intent, amount_subtotal, amount_total, currency } = session;
        const { error: orderError } = await supabase.from('stripe_orders').insert({
          checkout_session_id,
          payment_intent_id: payment_intent,
          customer_id: customerId,
          amount_subtotal,
          amount_total,
          currency,
          payment_status,
          status: 'completed',
        });
        if (orderError) console.error('Error inserting order:', orderError);
        else console.info(`Processed one-time payment for session: ${checkout_session_id}`);
      } catch (error) {
        console.error('Error processing one-time payment:', error);
      }
    }
    return;
  }

  // ── Subscription events ───────────────────────────────────────────────────
  if (!('customer' in stripeData)) return;
  if (event.type === 'payment_intent.succeeded' && (stripeData as Stripe.PaymentIntent).invoice === null) return;

  const { customer: customerId } = stripeData as { customer: string };
  if (!customerId || typeof customerId !== 'string') {
    console.error(`No customer on event: ${event.type}`);
    return;
  }

  const isSubscription = event.type !== 'checkout.session.completed';
  if (isSubscription) {
    console.info(`Starting subscription sync for customer: ${customerId}`);
    await syncCustomerFromStripe(customerId);
  }
}

async function syncCustomerFromStripe(customerId: string) {
  try {
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      limit: 1,
      status: 'all',
      expand: ['data.default_payment_method'],
    });

    if (subscriptions.data.length === 0) {
      const { error } = await supabase.from('stripe_subscriptions').upsert(
        { customer_id: customerId, subscription_status: 'not_started' },
        { onConflict: 'customer_id' },
      );
      if (error) console.error('Error updating subscription status:', error);
      return;
    }

    const subscription = subscriptions.data[0];
    const { error } = await supabase.from('stripe_subscriptions').upsert(
      {
        customer_id: customerId,
        subscription_id: subscription.id,
        price_id: subscription.items.data[0].price.id,
        current_period_start: subscription.current_period_start,
        current_period_end: subscription.current_period_end,
        cancel_at_period_end: subscription.cancel_at_period_end,
        ...(subscription.default_payment_method && typeof subscription.default_payment_method !== 'string'
          ? {
              payment_method_brand: subscription.default_payment_method.card?.brand ?? null,
              payment_method_last4: subscription.default_payment_method.card?.last4 ?? null,
            }
          : {}),
        status: subscription.status,
      },
      { onConflict: 'customer_id' },
    );
    if (error) console.error('Error syncing subscription:', error);
    else console.info(`Synced subscription for customer: ${customerId}`);
  } catch (error) {
    console.error(`Failed to sync subscription for customer ${customerId}:`, error);
    throw error;
  }
}
