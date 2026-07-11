import { useState, useEffect } from 'react';
import { X, Clock, User, CheckCircle, AlertCircle, ChevronLeft, ChevronRight, Lock, ExternalLink } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Service, Staff, Coupon, TrafficMode } from '../../types';

const MONTH_NAMES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const DAY_NAMES = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];

const LS_KEY = 'larue_client_info';

function loadSavedClient() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveClientInfo(name: string, phone: string, email: string) {
  try { localStorage.setItem(LS_KEY, JSON.stringify({ name, phone, email })); } catch {}
}

function CalendarPicker({ selected, onChange }: { selected: string; onChange: (d: string) => void }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const canGoPrev = viewYear > today.getFullYear() || viewMonth > today.getMonth();

  function prevMonth() {
    if (!canGoPrev) return;
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }

  const cells: (number | null)[] = [
    ...Array(firstDayOfWeek).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const todayISO = today.toISOString().split('T')[0];

  function toISO(day: number) {
    return `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  function isPast(day: number) {
    const d = new Date(viewYear, viewMonth, day);
    d.setHours(0, 0, 0, 0);
    return d < today;
  }

  return (
    <div className="bg-[#FBFBF9] rounded-2xl border border-gray-100 overflow-hidden shadow-sm select-none">
      <div className="flex items-center justify-between px-4 py-3 bg-[#FBFBF9] border-b border-gray-100">
        <button type="button" onClick={prevMonth} disabled={!canGoPrev} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#FBFBF9] disabled:opacity-25 transition-colors">
          <ChevronLeft size={16} className="text-gray-600" />
        </button>
        <p className="text-gray-900 font-semibold text-sm">{MONTH_NAMES[viewMonth]} {viewYear}</p>
        <button type="button" onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#FBFBF9] transition-colors">
          <ChevronRight size={16} className="text-gray-600" />
        </button>
      </div>
      <div className="grid grid-cols-7 px-3 pt-2">
        {DAY_NAMES.map((d) => (
          <div key={d} className="text-center text-[10px] font-semibold text-gray-400 uppercase tracking-wide py-1.5">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 px-3 pb-3 gap-y-1">
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} />;
          const iso = toISO(day);
          const past = isPast(day);
          const isSelected = iso === selected;
          const isToday = iso === todayISO;
          return (
            <button
              type="button"
              key={iso}
              disabled={past}
              onClick={() => onChange(iso)}
              className={`mx-auto w-9 h-9 rounded-full text-sm font-medium flex items-center justify-center transition-all duration-150
                ${isSelected ? 'bg-[#111111] text-white font-bold shadow-sm'
                  : isToday && !past ? 'bg-[#FFFBE6] text-[#C9A000] font-semibold border border-[#111111]'
                  : past ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-[#FFFBE6] hover:text-[#C9A000]'}`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface CustomerSession { id: string; email: string; name: string; }
interface BookingWizardProps {
  onClose: () => void;
  preselectedService?: Service | null;
  customerSession?: CustomerSession | null;
}

const TIME_SLOTS = [
  '09:00','09:30','10:00','10:30','11:00','11:30',
  '12:00','12:30','13:00','13:30','14:00','14:30',
  '15:00','15:30','16:00','16:30','17:00','17:30','18:00','18:30',
];

type Step = 'datetime' | 'service' | 'stylist' | 'info' | 'payment' | 'confirm';

export default function BookingWizard({ onClose, preselectedService, customerSession }: BookingWizardProps) {
  const [step, setStep] = useState<Step>('datetime');
  const [services, setServices] = useState<Service[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [trafficMode, setTrafficMode] = useState<TrafficMode>('low');
  const [trafficFee, setTrafficFee] = useState(200);

  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedService, setSelectedService] = useState<Service | null>(preselectedService || null);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [anyProfessional, setAnyProfessional] = useState(false);
  const [autoAssignedStaff, setAutoAssignedStaff] = useState<Staff | null>(null);
  const [bookedSlots, setBookedSlots] = useState<Set<string>>(new Set());
  const [bookedStaffBySlot, setBookedStaffBySlot] = useState<Record<string, string[]>>({});

  const saved = loadSavedClient();
  const [clientName, setClientName] = useState(customerSession?.name || saved?.name || '');
  const [clientPhone, setClientPhone] = useState(saved?.phone || '');
  const [clientEmail, setClientEmail] = useState(customerSession?.email || saved?.email || '');
  const [notes, setNotes] = useState('');

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  useEffect(() => {
    supabase.from('services').select('*').eq('is_active', true).then(({ data }) => { if (data) setServices(data); });
    supabase.from('staff').select('*').eq('is_active', true).then(({ data }) => { if (data) setStaff(data); });
    supabase.from('app_settings').select('key,value').in('key', ['traffic_mode', 'traffic_fee']).then(({ data }) => {
      data?.forEach((row) => {
        if (row.key === 'traffic_mode') setTrafficMode(row.value as TrafficMode);
        if (row.key === 'traffic_fee') setTrafficFee(parseInt(row.value) || 200);
      });
    });
  }, []);

  // Fetch booked slots for selected date to block unavailable times
  useEffect(() => {
    if (!selectedDate || staff.length === 0) return;
    supabase
      .from('appointments')
      .select('appointment_time, staff_id')
      .eq('appointment_date', selectedDate)
      .not('status', 'in', '("cancelada")')
      .then(({ data }) => {
        const bySlot: Record<string, string[]> = {};
        data?.forEach((a) => {
          const t = a.appointment_time?.slice(0, 5);
          if (!t) return;
          if (!bySlot[t]) bySlot[t] = [];
          if (a.staff_id) bySlot[t].push(a.staff_id);
        });
        // A slot is fully blocked only when every active staff member has a booking there
        const activeCount = staff.length;
        const blocked = new Set(
          Object.entries(bySlot)
            .filter(([, ids]) => ids.length >= activeCount)
            .map(([t]) => t)
        );
        setBookedSlots(blocked);
        setBookedStaffBySlot(bySlot);
      });
  }, [selectedDate, staff]);

  // Filter staff to those who have the selected service in their service_ids
  const eligibleStaff = selectedService
    ? staff.filter((s) => {
        const ids: string[] = (s as Staff & { service_ids?: string[] }).service_ids ?? [];
        return ids.length === 0 || ids.includes(selectedService.id);
      })
    : staff;

  // For the stylist step, exclude staff already booked at selected time+date
  const availableStaff = selectedTime
    ? eligibleStaff.filter((s) => !(bookedStaffBySlot[selectedTime] ?? []).includes(s.id))
    : eligibleStaff;

  // Compute which time slots are available for the selected date
  const todayISO = new Date().toISOString().split('T')[0];
  const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();
  const availableTimeSlots = TIME_SLOTS.filter((t) => {
    if (bookedSlots.has(t)) return false;
    if (selectedDate === todayISO) {
      const [h, m] = t.split(':').map(Number);
      if (h * 60 + m <= nowMinutes) return false;
    }
    return true;
  });

  const servicePrice = selectedService ? selectedService.price_min : 0;
  const effectiveTraffic: TrafficMode = appliedCoupon?.requires_full_payment ? 'high' : trafficMode;

  const getDepositAmount = () => {
    if (effectiveTraffic === 'high') return servicePrice;
    if (effectiveTraffic === 'medium') return trafficFee;
    return 0;
  };

  const getCouponDiscount = () => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.discount_type === 'flat') return appliedCoupon.discount_value;
    return Math.round(servicePrice * appliedCoupon.discount_value / 100);
  };

  const depositAmount = Math.max(0, getDepositAmount() - getCouponDiscount());
  const requiresPayment = depositAmount > 0;

  const trafficBanner = (() => {
    if (appliedCoupon?.requires_full_payment) return { show: true, type: 'maintenance', msg: 'Este cupón de mantenimiento requiere el pago completo del servicio para confirmar tu cita.' };
    if (effectiveTraffic === 'high') return { show: true, type: 'high', msg: '¡Días de alta demanda! Para asegurar tu servicio hoy, se requiere el pago total por adelantado.' };
    if (effectiveTraffic === 'medium') return { show: true, type: 'medium', msg: `Debido al flujo de citas, se requiere un anticipo de $${trafficFee} MXN para congelar tu horario.` };
    return { show: false, type: 'low', msg: '' };
  })();

  async function autoAssignStaff(): Promise<Staff | null> {
    if (!selectedDate) return null;
    const counts: Record<string, number> = {};
    eligibleStaff.forEach((s) => { counts[s.id] = 0; });

    const { data: dayAppts } = await supabase
      .from('appointments')
      .select('staff_id')
      .eq('appointment_date', selectedDate)
      .not('status', 'eq', 'cancelada');

    dayAppts?.forEach((a) => {
      if (a.staff_id && counts[a.staff_id] !== undefined) counts[a.staff_id]++;
    });

    const sorted = eligibleStaff.slice().sort((a, b) => (counts[a.id] ?? 0) - (counts[b.id] ?? 0));
    return sorted[0] ?? null;
  }

  async function applyCoupon() {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError('');
    const { data } = await supabase.from('coupons').select('*')
      .eq('code', couponCode.trim().toUpperCase()).eq('is_active', true).maybeSingle();

    if (!data) {
      setCouponError('Código inválido o expirado. Verifica que el código esté escrito correctamente.');
    } else if (data.expires_at && new Date(data.expires_at) < new Date()) {
      setCouponError('Este cupón ha expirado y ya no es válido.');
    } else if (data.max_uses !== null && data.used_count >= data.max_uses) {
      setCouponError('Este cupón ya alcanzó su límite de usos y no puede aplicarse.');
    } else if (data.service_id && selectedService && data.service_id !== selectedService.id) {
      const { data: svcData } = await supabase.from('services').select('name').eq('id', data.service_id).maybeSingle();
      setCouponError(`Este cupón solo aplica para el servicio "${svcData?.name ?? 'otro servicio'}". No es válido para ${selectedService.name}.`);
    } else {
      setAppliedCoupon(data);
    }
    setCouponLoading(false);
  }

  async function processPaymentAndBook() {
    setPaymentLoading(true);
    setPaymentError('');

    let assignedStaff = selectedStaff;
    if (anyProfessional) {
      const auto = await autoAssignStaff();
      setAutoAssignedStaff(auto);
      assignedStaff = auto;
    }

    const staffName = anyProfessional
      ? (assignedStaff ? `${assignedStaff.name} (auto)` : 'Cualquier Profesional')
      : assignedStaff?.name || 'Cualquier Profesional';

    const bookingBase = {
      client_id: customerSession?.id || null,
      client_name: clientName,
      client_phone: clientPhone,
      client_email: clientEmail,
      service_id: selectedService?.id || null,
      service_name: selectedService?.name || '',
      staff_id: assignedStaff?.id || null,
      staff_name: staffName,
      appointment_date: selectedDate,
      appointment_time: selectedTime,
      coupon_code: appliedCoupon?.code || '',
      coupon_discount: getCouponDiscount(),
      notes,
    };

    if (!requiresPayment) {
      // No anticipo — guardar cita directamente
      try {
        const { error } = await supabase.from('appointments').insert({
          ...bookingBase,
          status: 'confirmada',
          payment_status: 'pendiente',
          payment_amount: 0,
          payment_intent_id: '',
        });
        if (error) throw error;
        if (appliedCoupon) {
          await supabase.from('coupons').update({ used_count: appliedCoupon.used_count + 1 }).eq('id', appliedCoupon.id);
        }
        saveClientInfo(clientName, clientPhone, clientEmail);
        setStep('confirm');
      } catch {
        setPaymentError('Error al procesar. Intenta de nuevo.');
      }
      setPaymentLoading(false);
      return;
    }

    // Anticipo requerido — redirigir a Stripe Checkout
    saveClientInfo(clientName, clientPhone, clientEmail);
    localStorage.setItem('larue_pending_booking', JSON.stringify({
      ...bookingBase,
      depositAmount,
      serviceName: selectedService?.name,
      formattedDate: selectedDate,
      formattedTime: selectedTime,
    }));

    const baseUrl = window.location.origin + window.location.pathname;

    try {
      const { data, error } = await supabase.functions.invoke('salon-payment', {
        body: {
          amount_mxn: depositAmount,
          description: `Anticipo — ${selectedService?.name || 'Servicio'} · La Rue Salon`,
          success_url: baseUrl,
          cancel_url: baseUrl,
          booking: { ...bookingBase, payment_amount: depositAmount },
        },
      });
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data?.error || 'No se recibió URL de pago');
      }
    } catch (err: any) {
      setPaymentError(err.message || 'Error al iniciar el pago. Intenta de nuevo.');
      setPaymentLoading(false);
    }
  }

  function formatSelectedDate(iso: string) {
    if (!iso) return '';
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' });
  }

  const stepOrder: Step[] = ['datetime', 'service', 'stylist', 'info', 'payment', 'confirm'];
  const currentIndex = stepOrder.indexOf(step);
  const goBack = () => { if (currentIndex > 0) setStep(stepOrder[currentIndex - 1]); };

  const inputCls = "w-full bg-[#FBFBF9] border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-[#111111] focus:ring-2 focus:ring-[#111111]/20 focus:outline-none transition-all text-sm";
  const canProceedDateTime = selectedDate && selectedTime;
  const canProceedService = selectedService;
  const canProceedStylist = anyProfessional || selectedStaff;
  const canProceedInfo = clientName.trim() && clientPhone.trim();

  const finalStaffName = anyProfessional
    ? (autoAssignedStaff ? `Asignada automáticamente por el salón` : 'Cualquier Profesional')
    : selectedStaff?.name || 'Cualquier Profesional';

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#FBFBF9] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100">

        {/* Header */}
        <div className="sticky top-0 bg-[#FBFBF9] border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div className="flex items-center gap-3">
            {step !== 'datetime' && step !== 'confirm' && (
              <button onClick={goBack} className="text-gray-400 hover:text-gray-700 transition-colors">
                <ChevronLeft size={20} />
              </button>
            )}
            <div>
              <h2 className="text-gray-900 font-semibold text-base">Agendar Cita</h2>
              <p className="text-gray-400 text-xs">La Rue Salon & Spa</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors p-1">
            <X size={20} />
          </button>
        </div>

        {/* Progress bar */}
        {step !== 'confirm' && (
          <div className="px-6 pt-5 pb-2 flex gap-1.5">
            {(['datetime','service','stylist','info','payment'] as Step[]).map((s, i) => (
              <div key={s} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= currentIndex ? 'bg-[#111111]' : 'bg-gray-100'}`} />
            ))}
          </div>
        )}

        <div className="px-6 py-6">

          {/* STEP 1: Date & Time */}
          {step === 'datetime' && (
            <div className="space-y-5">
              <p className="text-sm font-semibold text-gray-800">Selecciona una fecha</p>
              <CalendarPicker selected={selectedDate} onChange={(d) => { setSelectedDate(d); setSelectedTime(''); }} />
              {selectedDate && (
                <div className="flex items-center gap-2 px-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#111111]" />
                  <p className="text-xs text-[#C9A000] font-medium capitalize">{formatSelectedDate(selectedDate)}</p>
                </div>
              )}
              {selectedDate && (
                <div>
                  <p className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Clock size={14} className="text-[#C9A000]" /> Selecciona un horario
                  </p>
                  {availableTimeSlots.length === 0 ? (
                    <p className="text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm">
                      No hay horarios disponibles para esta fecha. Por favor selecciona otro día.
                    </p>
                  ) : (
                    <div className="grid grid-cols-4 gap-2">
                      {availableTimeSlots.map((time) => (
                        <button
                          key={time}
                          type="button"
                          onClick={() => setSelectedTime(time)}
                          className={`py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                            selectedTime === time
                              ? 'bg-[#111111] text-white shadow-sm font-bold'
                              : 'bg-[#FBFBF9] border border-gray-200 text-gray-600 hover:border-[#111111] hover:bg-[#FFFBE6]'
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              <button
                type="button"
                onClick={() => setStep('service')}
                disabled={!canProceedDateTime}
                className="w-full bg-black hover:bg-neutral-800 disabled:bg-gray-100 disabled:text-gray-400 text-white font-semibold py-3.5 rounded-none transition-all duration-200"
              >
                Continuar
              </button>
            </div>
          )}

          {/* STEP 2: Service */}
          {step === 'service' && (
            <div className="space-y-4">
              <p className="text-gray-500 text-sm">Selecciona el servicio deseado</p>
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {services.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => { setSelectedService(service); setSelectedStaff(null); }}
                    className={`w-full text-left px-4 py-3.5 rounded-xl border-2 transition-all duration-200 ${
                      selectedService?.id === service.id
                        ? 'border-[#111111] bg-[#FFFBE6]'
                        : 'border-gray-100 bg-[#FBFBF9] hover:border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-gray-900 font-medium text-sm">{service.name}</p>
                        <p className="text-gray-400 text-xs mt-0.5">{service.duration_minutes} min</p>
                      </div>
                      <p className="text-gray-900 font-bold text-sm">${service.price_min.toLocaleString()}+</p>
                    </div>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setStep('stylist')}
                disabled={!canProceedService}
                className="w-full bg-black hover:bg-neutral-800 disabled:bg-gray-100 disabled:text-gray-400 text-white font-semibold py-3.5 rounded-none transition-all"
              >
                Continuar
              </button>
            </div>
          )}

          {/* STEP 3: Stylist */}
          {step === 'stylist' && (
            <div className="space-y-3">
              <p className="text-gray-500 text-sm">Elige a tu profesional</p>
              {availableStaff.length === 0 && (
                <p className="text-amber-600 text-xs bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                  No hay especialistas disponibles en ese horario. Por favor selecciona otra hora o fecha.
                </p>
              )}
              {/* Auto-assign option */}
              <button
                onClick={() => { setAnyProfessional(true); setSelectedStaff(null); }}
                className={`w-full text-left px-4 py-3.5 rounded-xl border-2 transition-all duration-200 ${
                  anyProfessional ? 'border-[#111111] bg-[#FFFBE6]' : 'border-gray-100 bg-[#FBFBF9] hover:border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#111111]/20 flex items-center justify-center">
                    <User size={16} className="text-[#C9A000]" />
                  </div>
                  <p className="text-gray-900 font-medium text-sm">Cualquiera (Asignación Automática)</p>
                </div>
              </button>

              {availableStaff.map((s) => (
                <button
                  key={s.id}
                  onClick={() => { setSelectedStaff(s); setAnyProfessional(false); }}
                  className={`w-full text-left px-4 py-3.5 rounded-xl border-2 transition-all duration-200 ${
                    !anyProfessional && selectedStaff?.id === s.id
                      ? 'border-[#111111] bg-[#FFFBE6]'
                      : 'border-gray-100 bg-[#FBFBF9] hover:border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {(s as Staff & { avatar_url?: string }).avatar_url ? (
                      <img src={(s as Staff & { avatar_url?: string }).avatar_url} alt={s.name} className="w-9 h-9 rounded-full object-cover border border-gray-200" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-bold text-sm">
                        {s.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="text-gray-900 font-medium text-sm">{s.name}</p>
                      <p className="text-gray-400 text-xs">{s.specialty}</p>
                    </div>
                  </div>
                </button>
              ))}

              <button
                onClick={() => setStep('info')}
                disabled={!canProceedStylist}
                className="w-full bg-black hover:bg-neutral-800 disabled:bg-gray-100 disabled:text-gray-400 text-white font-semibold py-3.5 rounded-none transition-all"
              >
                Continuar
              </button>
            </div>
          )}

          {/* STEP 4: Info */}
          {step === 'info' && (
            <div className="space-y-4">
              <p className="text-gray-500 text-sm">Tus datos de contacto</p>
              {saved && (
                <div className="bg-[#FFFBE6] border border-[#111111]/30 rounded-xl px-4 py-2.5 text-xs text-[#C9A000]">
                  Datos prellenados de tu última visita. Puedes editarlos.
                </div>
              )}
              {[
                { label: 'Nombre completo *', value: clientName, set: setClientName, placeholder: 'Tu nombre' },
                { label: 'Teléfono *', value: clientPhone, set: setClientPhone, placeholder: '871 000 0000' },
                { label: 'Email (opcional)', value: clientEmail, set: setClientEmail, placeholder: 'correo@ejemplo.com' },
              ].map((field) => (
                <div key={field.label}>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">{field.label}</label>
                  <input value={field.value} onChange={(e) => field.set(e.target.value)} placeholder={field.placeholder} className={inputCls} />
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Notas adicionales</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ej: alergias, preferencias..." rows={2} className={`${inputCls} resize-none`} />
              </div>
              <button
                onClick={() => setStep('payment')}
                disabled={!canProceedInfo}
                className="w-full bg-black hover:bg-neutral-800 disabled:bg-gray-100 disabled:text-gray-400 text-white font-semibold py-3.5 rounded-none transition-all"
              >
                Continuar
              </button>
            </div>
          )}

          {/* STEP 5: Payment */}
          {step === 'payment' && (
            <div className="space-y-5">
              {trafficBanner.show && (
                <div className={`rounded-xl p-4 border ${
                  trafficBanner.type === 'high' || trafficBanner.type === 'maintenance'
                    ? 'bg-red-50 border-red-200 text-red-700'
                    : 'bg-amber-50 border-amber-200 text-amber-700'
                }`}>
                  <div className="flex gap-2">
                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                    <p className="text-xs leading-relaxed font-medium">{trafficBanner.msg}</p>
                  </div>
                </div>
              )}

              {/* Summary */}
              <div className="bg-[#FBFBF9] rounded-xl p-4 space-y-2 border border-gray-100">
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-3 font-medium">Resumen de cita</p>
                {[
                  ['Servicio', selectedService?.name],
                  ['Fecha', `${selectedDate} — ${selectedTime}`],
                  ['Profesional', anyProfessional ? 'Asignación automática' : selectedStaff?.name],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span className="text-gray-400">{label}</span>
                    <span className="text-gray-900 font-medium">{value}</span>
                  </div>
                ))}
                {appliedCoupon && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Descuento ({appliedCoupon.code})</span>
                    <span className="text-green-600 font-medium">-${getCouponDiscount().toLocaleString()}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-gray-200 flex justify-between font-semibold">
                  <span className="text-gray-700">
                    {effectiveTraffic === 'high' || appliedCoupon?.requires_full_payment
                      ? 'Pago total hoy'
                      : effectiveTraffic === 'medium' ? 'Anticipo requerido' : 'A pagar en salón'}
                  </span>
                  <span className="text-gray-900 text-lg">
                    {requiresPayment ? `$${depositAmount.toLocaleString()} MXN` : '$0 MXN'}
                  </span>
                </div>
              </div>

              {/* Coupon */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Código de descuento</label>
                <div className="flex gap-2">
                  <input
                    value={couponCode}
                    onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponError(''); setAppliedCoupon(null); }}
                    placeholder="CÓDIGO"
                    className={`${inputCls} font-mono`}
                  />
                  <button
                    onClick={applyCoupon}
                    disabled={couponLoading}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 whitespace-nowrap"
                  >
                    {couponLoading ? '...' : 'Aplicar'}
                  </button>
                </div>
                {couponError && (
                  <div className="flex items-start gap-2 mt-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
                    <AlertCircle size={14} className="text-red-500 mt-0.5 shrink-0" />
                    <p className="text-red-600 text-xs leading-relaxed">{couponError}</p>
                  </div>
                )}
                {appliedCoupon && (
                  <p className="text-green-600 text-xs mt-1.5 font-medium flex items-center gap-1">
                    <CheckCircle size={13} /> Cupón aplicado correctamente
                  </p>
                )}
              </div>

              {/* Stripe payment button or free confirm */}
              {requiresPayment && (
                <div className="bg-[#FBFBF9] border border-gray-100 rounded-xl p-4 flex items-start gap-3">
                  <Lock size={15} className="text-[#C9A000] mt-0.5 shrink-0" />
                  <p className="text-gray-500 text-xs leading-relaxed">
                    Serás redirigida a Stripe, la plataforma de pagos segura, para completar tu anticipo con tarjeta. Una vez confirmado el pago, tu cita queda reservada.
                  </p>
                </div>
              )}

              {paymentError && (
                <p className="text-red-500 text-xs flex items-center gap-1">
                  <AlertCircle size={12} /> {paymentError}
                </p>
              )}

              <button
                onClick={processPaymentAndBook}
                disabled={paymentLoading}
                className="w-full bg-black hover:bg-neutral-800 disabled:opacity-50 text-white font-semibold py-3.5 rounded-none transition-all flex items-center justify-center gap-2"
              >
                {paymentLoading
                  ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> {requiresPayment ? 'Redirigiendo a Stripe...' : 'Procesando...'}</>
                  : requiresPayment
                    ? <><ExternalLink size={16} /> Pagar ${depositAmount.toLocaleString()} MXN con Stripe</>
                    : 'Confirmar Cita (sin anticipo)'}
              </button>
            </div>
          )}

          {/* STEP 6: Confirm */}
          {step === 'confirm' && (
            <div className="text-center space-y-6 py-4">
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-full bg-[#FFFBE6] flex items-center justify-center">
                  <CheckCircle size={40} className="text-[#C9A000]" />
                </div>
              </div>
              <div>
                <h3 className="text-gray-900 text-xl font-semibold mb-2">¡Cita Confirmada!</h3>
                <p className="text-gray-500 text-sm">Hola {clientName}, tu cita ha sido agendada exitosamente.</p>
              </div>
              <div className="bg-[#FBFBF9] rounded-xl p-4 text-left space-y-2 border border-gray-100">
                {[
                  ['Servicio', selectedService?.name],
                  ['Fecha', formatSelectedDate(selectedDate)],
                  ['Hora', selectedTime],
                  ['Profesional', anyProfessional ? (autoAssignedStaff?.name ? `${autoAssignedStaff.name} (asignada por el salón)` : 'Asignada automáticamente por el salón') : selectedStaff?.name],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span className="text-gray-400">{label}</span>
                    <span className="text-gray-900 font-medium">{value}</span>
                  </div>
                ))}
                <p className="text-xs text-gray-400 pt-2 border-t border-gray-200">
                  Recibirás un recordatorio por WhatsApp 24 horas antes.
                </p>
              </div>

              {/* Locked booking notice */}
              <div className="flex items-start gap-3 bg-[#FBFBF9] border border-gray-200 rounded-xl px-4 py-3 text-left">
                <Lock size={16} className="text-gray-400 mt-0.5 shrink-0" />
                <p className="text-gray-500 text-xs leading-relaxed">
                  Para cambios o cancelaciones, contacta directamente por nuestro WhatsApp de atención personal.
                </p>
              </div>

              <button
                onClick={onClose}
                className="w-full bg-black hover:bg-neutral-800 text-white font-semibold py-3.5 rounded-none transition-colors"
              >
                Cerrar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
