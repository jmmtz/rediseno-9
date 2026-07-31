import { useState, useMemo } from 'react';
import { Send, Users, Calendar, Eye, X, Check } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Coupon, Appointment, Service } from '../../types';

interface CouponTargetingProps {
  coupons: Coupon[];
  appointments: Appointment[];
  services?: Service[];
}

interface TargetClient {
  phone: string;
  name: string;
  lastVisit: Date | null;
  visitCount: number;
  daysSinceLastVisit: number | null;
}

export default function CouponTargeting({ coupons, appointments }: CouponTargetingProps) {
  const [targetMode, setTargetMode] = useState<'last_visit' | 'frequency'>('last_visit');
  const [weeksBack, setWeeksBack] = useState(4);
  const [minVisitsPerWeeks, setMinVisitsPerWeeks] = useState(1);
  const [frequencyWeeks, setFrequencyWeeks] = useState(5);
  const [selectedCoupon, setSelectedCoupon] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);
  const [excluded, setExcluded] = useState<Set<string>>(new Set());
  const [sending, setSending] = useState(false);

  const activeCoupons = coupons.filter(c => c.is_active);

  const targetClients = useMemo<TargetClient[]>(() => {
    const clientMap = new Map<string, TargetClient>();

    appointments.forEach(a => {
      if (a.status !== 'completada') return;
      const key = a.client_phone || a.client_email;
      if (!key) return;

      const existing = clientMap.get(key);
      const visitDate = new Date(a.appointment_date);
      if (!existing) {
        clientMap.set(key, {
          phone: a.client_phone,
          name: a.client_name,
          lastVisit: visitDate,
          visitCount: 1,
          daysSinceLastVisit: Math.floor((Date.now() - visitDate.getTime()) / (1000 * 60 * 60 * 24)),
        });
      } else {
        existing.visitCount++;
        if (!existing.lastVisit || visitDate > existing.lastVisit) {
          existing.lastVisit = visitDate;
          existing.daysSinceLastVisit = Math.floor((Date.now() - visitDate.getTime()) / (1000 * 60 * 60 * 24));
        }
      }
    });

    let result = Array.from(clientMap.values());

    if (targetMode === 'last_visit') {
      const maxDays = weeksBack * 7;
      result = result.filter(c => c.daysSinceLastVisit !== null && c.daysSinceLastVisit <= maxDays);
    } else if (targetMode === 'frequency') {
      result = result.filter(c => {
        if (c.daysSinceLastVisit === null) return false;
        const visitsPerWeek = c.visitCount / frequencyWeeks;
        return visitsPerWeek >= (minVisitsPerWeeks / frequencyWeeks) && c.visitCount >= 1;
      });
    }

    return result.sort((a, b) => (b.daysSinceLastVisit ?? 999) - (a.daysSinceLastVisit ?? 999));
  }, [appointments, targetMode, weeksBack, frequencyWeeks, minVisitsPerWeeks]);

  const finalRecipients = targetClients.filter(c => !excluded.has(c.phone || c.name));

  async function sendWhatsAppMessages() {
    setSending(true);
    const coupon = coupons.find(c => c.id === selectedCoupon);
    if (!coupon) {
      alert('Selecciona un cupón');
      setSending(false);
      return;
    }

    const { data: creds } = await supabase.rpc('get_twilio_creds');
    if (!creds || !creds.length) {
      alert('Twilio no está configurado todavía. Cuando se configuren los mensajes preestablecidos de Twilio, esta función enviará los mensajes automáticamente.');
      setSending(false);
      return;
    }

    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/whatsapp-messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        action: 'send_coupon',
        coupon_code: coupon.code,
        recipients: finalRecipients.map(r => r.phone).filter(Boolean),
      }),
    });

    if (response.ok) {
      const result = await response.json();
      alert(`Mensajes enviados: ${result.sent ?? finalRecipients.length}`);
    } else {
      alert('Error al enviar mensajes. Verifica la configuración de Twilio.');
    }
    setSending(false);
    setShowPreview(false);
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Send size={16} className="text-amber-700" />
        <p className="text-sm font-medium text-amber-900">Enviar cupón por WhatsApp</p>
      </div>
      <p className="text-xs text-amber-700">Selecciona clientes según su frecuencia de visitas y envíales un cupón automáticamente.</p>

      {/* Coupon selection */}
      <div>
        <label className="block text-xs text-amber-800 font-medium mb-1">Cupón a enviar</label>
        <select value={selectedCoupon} onChange={(e) => setSelectedCoupon(e.target.value)} className="w-full text-sm border border-amber-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-amber-500">
          <option value="">Selecciona un cupón...</option>
          {activeCoupons.map(c => (
            <option key={c.id} value={c.id}>{c.code} — {c.discount_type === 'percent' ? `${c.discount_value}%` : `$${c.discount_value}`}</option>
          ))}
        </select>
      </div>

      {/* Target mode */}
      <div>
        <label className="block text-xs text-amber-800 font-medium mb-1">¿A quién enviar?</label>
        <div className="flex gap-2">
          <button type="button" onClick={() => setTargetMode('last_visit')}
            className={`flex-1 py-2 text-xs font-medium rounded-lg border transition-all ${targetMode === 'last_visit' ? 'border-amber-500 bg-white text-amber-800' : 'border-amber-200 bg-amber-50 text-amber-600'}`}>
            <Calendar size={12} className="inline mr-1" />
            Última visita
          </button>
          <button type="button" onClick={() => setTargetMode('frequency')}
            className={`flex-1 py-2 text-xs font-medium rounded-lg border transition-all ${targetMode === 'frequency' ? 'border-amber-500 bg-white text-amber-800' : 'border-amber-200 bg-amber-50 text-amber-600'}`}>
            <Users size={12} className="inline mr-1" />
            Frecuencia
          </button>
        </div>
      </div>

      {targetMode === 'last_visit' ? (
        <div>
          <label className="block text-xs text-amber-800 font-medium mb-1">Clientes que visitaron en las últimas semanas</label>
          <input type="range" min={1} max={12} value={weeksBack} onChange={(e) => setWeeksBack(+e.target.value)} className="w-full accent-amber-600" />
          <div className="flex justify-between text-[10px] text-amber-600">
            <span>1 sem</span>
            <span className="font-medium">{weeksBack} semanas</span>
            <span>12 sem</span>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div>
            <label className="block text-xs text-amber-800 font-medium mb-1">Al menos N visitas cada X semanas</label>
            <div className="flex gap-2">
              <input type="number" min={1} value={minVisitsPerWeeks} onChange={(e) => setMinVisitsPerWeeks(+e.target.value)} placeholder="1" className="w-20 text-sm border border-amber-200 rounded-lg px-2 py-1.5 bg-white" />
              <span className="text-xs text-amber-600 self-center">visitas cada</span>
              <input type="number" min={1} value={frequencyWeeks} onChange={(e) => setFrequencyWeeks(+e.target.value)} placeholder="5" className="w-20 text-sm border border-amber-200 rounded-lg px-2 py-1.5 bg-white" />
              <span className="text-xs text-amber-600 self-center">semanas</span>
            </div>
          </div>
        </div>
      )}

      {/* Preview button */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => { setShowPreview(true); setExcluded(new Set()); }}
          disabled={!selectedCoupon || targetClients.length === 0}
          className="flex-1 bg-amber-600 hover:bg-amber-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
        >
          <Eye size={14} />
          Ver destinatarios ({targetClients.length})
        </button>
      </div>

      {/* Preview modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setShowPreview(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-3 flex items-center justify-between">
              <h4 className="text-sm font-semibold text-gray-900">Destinatarios ({finalRecipients.length})</h4>
              <button onClick={() => setShowPreview(false)} className="text-gray-400 hover:text-gray-700"><X size={18} /></button>
            </div>
            <div className="p-4 space-y-2">
              <p className="text-xs text-gray-500">Desmarca a quienes no quieras enviar el mensaje:</p>
              {targetClients.map(c => {
                const isExcluded = excluded.has(c.phone || c.name);
                return (
                  <label key={c.phone || c.name} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!isExcluded}
                      onChange={() => {
                        const key = c.phone || c.name;
                        setExcluded(prev => {
                          const next = new Set(prev);
                          if (isExcluded) next.delete(key);
                          else next.add(key);
                          return next;
                        });
                      }}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{c.name}</p>
                      <p className="text-xs text-gray-500">{c.phone} · {c.visitCount} visitas · {c.daysSinceLastVisit}d sin venir</p>
                    </div>
                    {isExcluded ? <X size={14} className="text-gray-300" /> : <Check size={14} className="text-green-500" />}
                  </label>
                );
              })}
            </div>
            <div className="sticky bottom-0 bg-white border-t border-gray-100 px-5 py-3 flex gap-2">
              <button onClick={() => setShowPreview(false)} className="flex-1 bg-gray-100 text-gray-600 text-sm py-2 rounded-lg">Cancelar</button>
              <button
                onClick={sendWhatsAppMessages}
                disabled={sending || finalRecipients.length === 0}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-40 text-white text-sm font-semibold py-2 rounded-lg flex items-center justify-center gap-1.5"
              >
                <Send size={14} />
                {sending ? 'Enviando...' : `Enviar a ${finalRecipients.length}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
