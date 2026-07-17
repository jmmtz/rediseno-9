import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

const WHATSAPP_TOKEN = Deno.env.get('WHATSAPP_TOKEN') ?? '';
const WHATSAPP_PHONE_ID = Deno.env.get('WHATSAPP_PHONE_ID') ?? '';

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
    const { action, appointment_id, phone, message_type, template_params } = await req.json();

    if (action === 'send_message') {
      return await sendMessage(message_type, phone, template_params);
    }

    if (action === 'send_appointment_messages') {
      return await sendAppointmentMessages(appointment_id);
    }

    if (action === 'check_and_send_reminders') {
      return await checkAndSendReminders();
    }

    return json({ error: 'Acción no reconocida' }, 400);
  } catch (err) {
    console.error('whatsapp-messages error:', err);
    return json({ error: err.message }, 500);
  }
});

// ─── Message Templates ─────────────────────────────────────────────────

interface TemplateParams {
  client_name?: string;
  service_name?: string;
  appointment_date?: string;
  appointment_time?: string;
  staff_name?: string;
  salon_name?: string;
}

function buildMessage(type: string, p: TemplateParams): string {
  const salon = p.salon_name || 'La Rue Salon & Spa';
  const date = p.appointment_date || '';
  const time = p.appointment_time || '';
  const name = p.client_name || '';
  const service = p.service_name || '';
  const staff = p.staff_name || '';

  switch (type) {
    case 'confirmation':
      return `Hola ${name}! Tu cita en ${salon} ha sido confirmada.\n\nServicio: ${service}\nFecha: ${date}\nHora: ${time}${staff ? `\nEspecialista: ${staff}` : ''}\n\nTe esperamos! Para cambios o cancelaciones, contáctanos por WhatsApp.`;

    case 'reminder':
      return `Recordatorio: ${name}, tienes una cita en ${salon} mañana.\n\nServicio: ${service}\nFecha: ${date}\nHora: ${time}${staff ? `\nEspecialista: ${staff}` : ''}\n\nTe esperamos! Si necesitas reprogramar, avísanos lo antes posible.`;

    case 'staff_notification':
      return `Nueva cita asignada:\n\nCliente: ${name}\nServicio: ${service}\nFecha: ${date}\nHora: ${time}\n\nPrepárate para recibir a ${name}.`;

    default:
      return '';
  }
}

// ─── Send a single message via WhatsApp Cloud API ────────────────────────

async function sendWhatsAppMessage(phone: string, text: string): Promise<{ success: boolean; error?: string }> {
  if (!WHATSAPP_TOKEN || !WHATSAPP_PHONE_ID) {
    console.warn('WhatsApp credentials not configured — message not sent (would send):', text);
    return { success: false, error: 'WhatsApp no configurado' };
  }

  try {
    const resp = await fetch(`https://graph.facebook.com/v18.0/${WHATSAPP_PHONE_ID}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: phone,
        type: 'text',
        text: { body: text },
      }),
    });

    if (!resp.ok) {
      const errBody = await resp.text();
      console.error('WhatsApp API error:', errBody);
      return { success: false, error: errBody };
    }

    return { success: true };
  } catch (err) {
    console.error('sendWhatsAppMessage error:', err);
    return { success: false, error: err.message };
  }
}

// ─── Send all 3 messages for a new appointment ──────────────────────────

async function sendAppointmentMessages(appointmentId: string) {
  const { data: appt, error } = await supabase
    .from('appointments')
    .select(`
      id, client_name, client_phone, appointment_date, appointment_time, status,
      service:services(name),
      staff:staff(name)
    `)
    .eq('id', appointmentId)
    .maybeSingle();

  if (error || !appt) return json({ error: 'Cita no encontrada' }, 404);
  if (appt.status !== 'confirmada') return json({ error: 'La cita no está confirmada' }, 400);

  const params: TemplateParams = {
    client_name: appt.client_name,
    service_name: (appt.service as any)?.name,
    appointment_date: appt.appointment_date,
    appointment_time: appt.appointment_time,
    staff_name: (appt.staff as any)?.name,
  };

  const results: any = {};

  // 1. Confirmation to client
  if (appt.client_phone) {
    const msg = buildMessage('confirmation', params);
    const res = await sendWhatsAppMessage(appt.client_phone, msg);
    results.confirmation = res;
    await logMessage(appointmentId, appt.client_phone, 'confirmation', res);
  }

  // 2. Staff notification
  const staffPhone = await getStaffPhone(appointmentId);
  if (staffPhone) {
    const msg = buildMessage('staff_notification', params);
    const res = await sendWhatsAppMessage(staffPhone, msg);
    results.staff_notification = res;
    await logMessage(appointmentId, staffPhone, 'staff_notification', res);
  }

  // 3. Schedule reminder (computed based on appointment time)
  await scheduleReminder(appointmentId, appt.appointment_date, appt.appointment_time);

  return json({ success: true, results });
}

// ─── Smart Reminder Logic ────────────────────────────────────────────────

async function scheduleReminder(appointmentId: string, dateStr: string, timeStr: string) {
  const apptDateTime = new Date(`${dateStr}T${timeStr}:00`);
  const now = new Date();
  const hoursUntilAppt = (apptDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

  let reminderDateTime: Date | null = null;

  if (hoursUntilAppt < 3) {
    // Too close to appointment — no reminder
    return;
  } else if (hoursUntilAppt < 24) {
    // Same day — remind 2 hours before
    reminderDateTime = new Date(apptDateTime.getTime() - 2 * 60 * 60 * 1000);
  } else if (hoursUntilAppt < 48) {
    // Made 1 day before — remind 6 hours before
    reminderDateTime = new Date(apptDateTime.getTime() - 6 * 60 * 60 * 1000);
  } else {
    // Made well in advance — remind the day before at 5pm
    const dayBefore = new Date(apptDateTime);
    dayBefore.setDate(dayBefore.getDate() - 1);
    dayBefore.setHours(17, 0, 0, 0);
    reminderDateTime = dayBefore;
  }

  if (reminderDateTime && reminderDateTime > now) {
    await supabase.from('whatsapp_messages').insert({
      appointment_id: appointmentId,
      phone: '',
      message_type: 'reminder',
      template_name: 'reminder',
      status: 'scheduled',
      sent_at: reminderDateTime.toISOString(),
    });
  }
}

// ─── Check and send due reminders ────────────────────────────────────────

async function checkAndSendReminders() {
  const now = new Date().toISOString();

  const { data: pending } = await supabase
    .from('whatsapp_messages')
    .select(`
      id, appointment_id, phone, message_type,
      appointment:appointments(
        client_name, client_phone, appointment_date, appointment_time,
        service:services(name), staff:staff(name), status
      )
    `)
    .eq('message_type', 'reminder')
    .eq('status', 'scheduled')
    .lte('sent_at', now);

  if (!pending || pending.length === 0) return json({ sent: 0 });

  let sentCount = 0;
  for (const entry of pending) {
    const appt = entry.appointment as any;
    if (!appt || appt.status !== 'confirmada') {
      await supabase.from('whatsapp_messages').update({ status: 'cancelled' }).eq('id', entry.id);
      continue;
    }

    const params: TemplateParams = {
      client_name: appt.client_name,
      service_name: appt.service?.name,
      appointment_date: appt.appointment_date,
      appointment_time: appt.appointment_time,
      staff_name: appt.staff?.name,
    };

    const msg = buildMessage('reminder', params);
    const phone = appt.client_phone;
    const res = await sendWhatsAppMessage(phone, msg);

    await supabase.from('whatsapp_messages')
      .update({ status: res.success ? 'sent' : 'failed', phone })
      .eq('id', entry.id);

    if (res.success) sentCount++;
  }

  return json({ sent: sentCount });
}

// ─── Helpers ─────────────────────────────────────────────────────────────

async function getStaffPhone(appointmentId: string): Promise<string | null> {
  const { data } = await supabase
    .from('appointments')
    .select('staff:staff(phone)')
    .eq('id', appointmentId)
    .maybeSingle();
  return (data as any)?.staff?.phone ?? null;
}

async function logMessage(appointmentId: string, phone: string, type: string, res: { success: boolean; error?: string }) {
  await supabase.from('whatsapp_messages').insert({
    appointment_id: appointmentId,
    phone,
    message_type: type,
    template_name: type,
    status: res.success ? 'sent' : 'failed',
    sent_at: new Date().toISOString(),
  });
}
