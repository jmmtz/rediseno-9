import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from 'npm:stripe@17.7.0';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!);
const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 200, headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  try {
    const { amount_mxn, description, success_url, cancel_url, booking } = await req.json();

    if (!amount_mxn || amount_mxn <= 0) return json({ error: 'Monto inválido' }, 400);
    if (!booking?.client_name || !booking?.appointment_date || !booking?.appointment_time) {
      return json({ error: 'Datos de cita incompletos' }, 400);
    }

    // Create pending appointment in DB
    const { data: appt, error: apptErr } = await supabase
      .from('appointments')
      .insert({
        ...booking,
        status: 'pendiente',
        payment_status: 'pendiente',
        payment_amount: amount_mxn,
      })
      .select('id')
      .single();

    if (apptErr) throw new Error(`Error al crear cita: ${apptErr.message}`);

    // Build Stripe Checkout Session with dynamic MXN amount
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'mxn',
          unit_amount: Math.round(amount_mxn * 100),
          product_data: {
            name: description,
            description: `${booking.appointment_date} a las ${booking.appointment_time} — La Rue Salon & Spa`,
          },
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${success_url}?appointment_id=${appt.id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${cancel_url}?appointment_id=${appt.id}&cancelled=1`,
      metadata: {
        appointment_id: appt.id,
        coupon_code: booking.coupon_code || '',
      },
      ...(booking.client_email ? { customer_email: booking.client_email } : {}),
      locale: 'es',
    });

    return json({ url: session.url, appointment_id: appt.id });
  } catch (err: any) {
    console.error('salon-payment error:', err);
    return json({ error: err.message }, 500);
  }
});
