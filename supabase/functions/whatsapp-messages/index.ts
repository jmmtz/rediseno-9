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

const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID') ?? '';
const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN') ?? '';
const TWILIO_WHATSAPP_NUMBER = Deno.env.get('TWILIO_WHATSAPP_NUMBER') ?? '';

async function getTwilioCreds(): Promise<{ sid: string; token: string; number: string }> {
  let sid = TWILIO_ACCOUNT_SID;
  let token = TWILIO_AUTH_TOKEN;
  let number = TWILIO_WHATSAPP_NUMBER;

  if (!sid || !token || !number) {
    const { data, error } = await supabase.rpc('get_twilio_creds');

    if (error) throw new Error('No se pudieron leer las credenciales de Twilio: ' + error.message);
    if (!data) throw new Error('Credenciales de Twilio no encontradas en vault');

    sid = data.sid;
    token = data.token;
    number = data.number;
  }

  return { sid, token, number };
}

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

// ─── Twilio WhatsApp sending ────────────────────────────────────────────

function normalizePhone(phone: string): string {
  let cleaned = phone.replace(/[^0-9+]/g, '');
  if (cleaned.startsWith('+')) return cleaned;
  if (cleaned.startsWith('52')) return '+' + cleaned;
  if (cleaned.length === 10) return '+52' + cleaned;
  if (cleaned.length === 11 && cleaned.startsWith('1')) return '+52' + cleaned.slice(1);
  return '+52' + cleaned;
}

async function sendTwilioWhatsApp(
  to: string,
  templateName: string,
  params: string[]
): Promise<{ success: boolean; error?: string }> {
  let accountSid: string, authToken: string, whatsappNumber: string;
  try {
    const creds = await getTwilioCreds();
    accountSid = creds.sid;
    authToken = creds.token;
    whatsappNumber = creds.number;
  } catch (err) {
    console.warn('Twilio credentials error:', err.message);
    return { success: false, error: err.message };
  }

  if (!accountSid || !authToken || !whatsappNumber) {
    console.warn('Twilio credentials not configured — message not sent. Template:', templateName, 'Params:', params);
    return { success: false, error: 'Twilio no configurado' };
  }

  const toFormatted = to.startsWith('whatsapp:') ? to : `whatsapp:${to.startsWith('+') ? to : '+' + to}`;
  const fromFormatted = whatsappNumber.startsWith('whatsapp:')
    ? whatsappNumber
    : `whatsapp:${whatsappNumber.startsWith('+') ? whatsappNumber : '+' + whatsappNumber}`;

  const body = new URLSearchParams();
  body.set('To', toFormatted);
  body.set('From', fromFormatted);
  body.set('ContentSid', templateName);

  // Twilio Content API uses ContentVariables as a JSON object mapping {{1}} -> "value"
  const contentVariables: Record<string, string> = {};
  params.forEach((val, i) => {
    contentVariables[String(i + 1)] = val;
  });
  body.set('ContentVariables', JSON.stringify(contentVariables));

  try {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(`${accountSid}:${authToken}`),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    if (!resp.ok) {
      const errBody = await resp.text();
      console.error('Twilio API error:', errBody);
      return { success: false, error: errBody };
    }

    return { success: true };
  } catch (err) {
    console.error('sendTwilioWhatsApp error:', err);
    return { success: false, error: err.message };
  }
}

// ─── Template definitions ────────────────────────────────────────────────

interface TemplateParams {
  client_name?: string;
  service_name?: string;
  appointment_date?: string;
  appointment_time?: string;
  staff_name?: string;
  salon_name?: string;
}

const TEMPLATES = {
  confirmation: 'HX6c010b4b1344cc9c76ff569726a05998',
  reminder: 'HXa10d2e63a7b20499a73ec1924a853b9d',
  staff_notification: 'HX570f8f17abed49275110fbb8ca4ccbc2',
};

function getTemplateParams(type: string, p: TemplateParams): string[] {
  const name = p.client_name || '';
  const date = formatDate(p.appointment_date);
  const time = formatTime(p.appointment_time);
  const service = p.service_name || '';
  const staff = p.staff_name || '';

  switch (type) {
    case 'confirmation':
      // {{1}}=clienta, {{2}}=fecha, {{3}}=hora, {{4}}=servicio
      return [name, date, time, service];
    case 'reminder':
      // {{1}}=clienta, {{2}}=fecha, {{3}}=hora, {{4}}=servicio
      return [name, date, time, service];
    case 'staff_notification':
      // {{1}}=estilista, {{2}}=fecha, {{3}}=hora, {{4}}=clienta, {{5}}=servicio
      return [staff, date, time, name, service];
    default:
      return [];
  }
}

const MONTHS_ES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];

function formatDate(dateStr?: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  if (isNaN(d.getTime())) return dateStr;
  return `${d.getDate()} de ${MONTHS_ES[d.getMonth()]}`;
}

function formatTime(timeStr?: string): string {
  if (!timeStr) return '';
  const match = timeStr.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return timeStr;
  let hour = parseInt(match[1]);
  const minute = match[2];
  const period = hour >= 12 ? 'PM' : 'AM';
  if (hour === 0) hour = 12;
  else if (hour > 12) hour -= 12;
  return `${hour}:${minute} ${period}`;
}

// ─── Send all messages for a new appointment ─────────────────────────────

async function sendAppointmentMessages(appointmentId: string) {
  const { data: appt, error } = await supabase
    .from('appointments')
    .select(`
      id, client_name, client_phone, appointment_date, appointment_time, status,
      service_name, staff_id, staff_name
    `)
    .eq('id', appointmentId)
    .maybeSingle();

  if (error || !appt) return json({ error: 'Cita no encontrada' }, 404);
  if (appt.status !== 'confirmada') return json({ error: 'La cita no está confirmada' }, 400);

  // Fetch staff phone separately
  let staffPhone: string | null = null;
  if (appt.staff_id) {
    const { data: staffRow } = await supabase
      .from('staff')
      .select('phone')
      .eq('id', appt.staff_id)
      .maybeSingle();
    staffPhone = staffRow?.phone ?? null;
  }

  const params: TemplateParams = {
    client_name: appt.client_name,
    service_name: appt.service_name,
    appointment_date: appt.appointment_date,
    appointment_time: appt.appointment_time,
    staff_name: appt.staff_name,
  };

  const results: any = {};

  // 1. Confirmation to client
  if (appt.client_phone) {
    const tplParams = getTemplateParams('confirmation', params);
    const res = await sendTwilioWhatsApp(normalizePhone(appt.client_phone), TEMPLATES.confirmation, tplParams);
    results.confirmation = res;
    await logMessage(appointmentId, appt.client_phone, 'confirmation', res);
  }

  // 2. Staff notification (only if staff has phone)
  if (staffPhone) {
    const tplParams = getTemplateParams('staff_notification', params);
    const res = await sendTwilioWhatsApp(normalizePhone(staffPhone), TEMPLATES.staff_notification, tplParams);
    results.staff_notification = res;
    await logMessage(appointmentId, staffPhone, 'staff_notification', res);
  } else {
    results.staff_notification = { success: false, error: 'Estilista sin teléfono registrado' };
  }

  // 3. Schedule reminder
  await scheduleReminder(appointmentId, appt.appointment_date, appt.appointment_time);

  return json({ success: true, results });
}

// ─── Send a single message (direct action) ───────────────────────────────

async function sendMessage(type: string, phone: string, templateParams: TemplateParams) {
  if (!phone) return json({ error: 'Teléfono requerido' }, 400);

  const templateKey = type as keyof typeof TEMPLATES;
  if (!TEMPLATES[templateKey]) return json({ error: 'Tipo de mensaje no válido' }, 400);

  const tplParams = getTemplateParams(type, templateParams);
  const res = await sendTwilioWhatsApp(normalizePhone(phone), TEMPLATES[templateKey], tplParams);
  return json({ success: res.success, error: res.error });
}

// ─── Smart Reminder Logic ────────────────────────────────────────────────

async function scheduleReminder(appointmentId: string, dateStr: string, timeStr: string) {
  const apptDateTime = new Date(`${dateStr}T${timeStr}:00`);
  const now = new Date();
  const hoursUntilAppt = (apptDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

  let reminderDateTime: Date | null = null;

  if (hoursUntilAppt < 3) {
    return;
  } else if (hoursUntilAppt < 24) {
    reminderDateTime = new Date(apptDateTime.getTime() - 2 * 60 * 60 * 1000);
  } else if (hoursUntilAppt < 48) {
    reminderDateTime = new Date(apptDateTime.getTime() - 6 * 60 * 60 * 1000);
  } else {
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
      id, appointment_id, phone, message_type
    `)
    .eq('message_type', 'reminder')
    .eq('status', 'scheduled')
    .lte('sent_at', now);

  if (!pending || pending.length === 0) return json({ sent: 0 });

  let sentCount = 0;
  for (const entry of pending) {
    const { data: appt } = await supabase
      .from('appointments')
      .select('client_name, client_phone, appointment_date, appointment_time, service_name, staff_name, status')
      .eq('id', entry.appointment_id)
      .maybeSingle();

    if (!appt || appt.status !== 'confirmada') {
      await supabase.from('whatsapp_messages').update({ status: 'cancelled' }).eq('id', entry.id);
      continue;
    }

    const params: TemplateParams = {
      client_name: appt.client_name,
      service_name: appt.service_name,
      appointment_date: appt.appointment_date,
      appointment_time: appt.appointment_time,
      staff_name: appt.staff_name,
    };

    const tplParams = getTemplateParams('reminder', params);
    const phone = appt.client_phone;
    const res = await sendTwilioWhatsApp(normalizePhone(phone), TEMPLATES.reminder, tplParams);

    await supabase.from('whatsapp_messages')
      .update({ status: res.success ? 'sent' : 'failed', phone })
      .eq('id', entry.id);

    if (res.success) sentCount++;
  }

  return json({ sent: sentCount });
}

// ─── Helpers ─────────────────────────────────────────────────────────────

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
