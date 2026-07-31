import { useState, useEffect } from 'react';
import { X, Calendar, Clock, Tag, Phone, Mail, User, Bell, BellOff } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Appointment, Coupon, Service } from '../../types';

interface ClientInfoModalProps {
  clientId: string | null;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  services: Service[];
  onClose: () => void;
}

interface ClientDetail {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  created_at: string;
}

export default function ClientInfoModal({ clientId, clientName, clientPhone, clientEmail, services: _services, onClose }: ClientInfoModalProps) {
  const [client, setClient] = useState<ClientDetail | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!clientId) return;
    (async () => {
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', clientId).maybeSingle();
      if (profile) setClient(profile as ClientDetail);

      const { data: appts } = await supabase.from('appointments').select('*').eq('client_id', clientId).order('appointment_date', { ascending: false });
      if (appts) setAppointments(appts as Appointment[]);

      if (profile) {
        const { data: cps } = await supabase.from('coupons').select('*').or(`service_id.is.null,service_id.eq.${clientId}`).eq('is_active', true);
        if (cps) setCoupons(cps as Coupon[]);
      }
      setLoading(false);
    })();
  }, [clientId]);

  const lastVisit = appointments.find(a => a.status === 'completada');
  const lastVisitDate = lastVisit ? new Date(lastVisit.appointment_date) : null;
  const daysSinceLastVisit = lastVisitDate ? Math.floor((Date.now() - lastVisitDate.getTime()) / (1000 * 60 * 60 * 24)) : null;

  const completedCount = appointments.filter(a => a.status === 'completada').length;
  const totalSpent = appointments.filter(a => a.payment_status === 'pagado').reduce((sum, a) => sum + (a.payment_amount || 0), 0);

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Información del Cliente</h3>
            <p className="text-sm text-gray-500">{clientName}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 p-1.5 rounded-lg hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <div className="p-6 text-center text-gray-400 text-sm">Cargando...</div>
        ) : (
          <div className="p-6 space-y-5">
            {/* Client info */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <User size={15} className="text-gray-400" />
                <span className="text-gray-500">Nombre:</span>
                <span className="text-gray-900 font-medium">{client?.full_name || clientName}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone size={15} className="text-gray-400" />
                <span className="text-gray-500">Teléfono:</span>
                <span className="text-gray-900 font-medium">{client?.phone || clientPhone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail size={15} className="text-gray-400" />
                <span className="text-gray-500">Correo:</span>
                <span className="text-gray-900 font-medium">{client?.email || clientEmail}</span>
              </div>
              {client && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar size={15} className="text-gray-400" />
                  <span className="text-gray-500">Cliente desde:</span>
                  <span className="text-gray-900 font-medium">{new Date(client.created_at).toLocaleDateString('es-MX')}</span>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-blue-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-blue-700">{completedCount}</p>
                <p className="text-[10px] text-blue-600 mt-0.5">Citas completadas</p>
              </div>
              <div className="bg-green-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-green-700">${totalSpent.toLocaleString()}</p>
                <p className="text-[10px] text-green-600 mt-0.5">Total gastado</p>
              </div>
              <div className="bg-amber-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-amber-700">{daysSinceLastVisit !== null ? `${daysSinceLastVisit}d` : '—'}</p>
                <p className="text-[10px] text-amber-600 mt-0.5">Días sin venir</p>
              </div>
            </div>

            {/* Appointments history */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Calendar size={15} className="text-gray-400" /> Historial de Citas
              </h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {appointments.length === 0 ? (
                  <p className="text-sm text-gray-400 py-2">Sin citas registradas</p>
                ) : appointments.map(a => {
                  return (
                    <div key={a.id} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3 text-xs">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{a.service_name}</p>
                        <div className="flex items-center gap-2 text-gray-500 mt-0.5">
                          <Clock size={11} />
                          <span>{new Date(a.appointment_date + 'T' + a.appointment_time).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                        </div>
                      </div>
                      <div className="text-right space-y-0.5">
                        <span className={`block text-[10px] px-2 py-0.5 rounded ${a.status === 'completada' ? 'bg-green-100 text-green-700' : a.status === 'cancelada' ? 'bg-red-100 text-red-700' : a.status === 'no_show' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>{a.status}</span>
                        <span className="block text-gray-500">{a.payment_status === 'pagado' ? `$${a.payment_amount?.toLocaleString()}` : 'Pendiente'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Coupons */}
            {coupons.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Tag size={15} className="text-gray-400" /> Cupones Asignados
                </h4>
                <div className="space-y-2">
                  {coupons.map(c => (
                    <div key={c.id} className="flex items-center justify-between bg-amber-50 border border-amber-100 rounded-lg p-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{c.code}</p>
                        <p className="text-xs text-gray-500">{c.discount_type === 'percent' ? `${c.discount_value}% descuento` : `$${c.discount_value} MXN descuento`}</p>
                      </div>
                      <Bell size={14} className="text-amber-600" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Scheduled messages placeholder */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Bell size={15} className="text-gray-400" /> Mensajes Programados
              </h4>
              <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-500 flex items-center gap-2">
                <BellOff size={14} className="text-gray-400" />
                <span>No hay mensajes programados (cuando se configure Twilio, aparecerán aquí)</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
