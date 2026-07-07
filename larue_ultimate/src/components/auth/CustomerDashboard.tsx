import { useState, useEffect } from 'react';
import { X, Calendar, Clock, LogOut } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Appointment } from '../../types';

interface CustomerDashboardProps {
  userId: string;
  userEmail: string;
  userName: string;
  onClose: () => void;
  onLogout: () => void;
  onBookNow: () => void;
}

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  confirmada:  { label: 'Confirmada',  cls: 'bg-green-50 text-green-700 border-green-200' },
  completada:  { label: 'Completada',  cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  cancelada:   { label: 'Cancelada',   cls: 'bg-red-50 text-red-700 border-red-200' },
  no_show:     { label: 'No Show',     cls: 'bg-orange-50 text-orange-700 border-orange-200' },
  pendiente:   { label: 'Pendiente',   cls: 'bg-amber-50 text-amber-700 border-amber-200' },
};

export default function CustomerDashboard({ userId, userEmail, userName, onClose, onLogout, onBookNow }: CustomerDashboardProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data } = await supabase
        .from('appointments')
        .select('*')
        .eq('client_id', userId)
        .order('appointment_date', { ascending: false })
        .limit(50);
      if (data) setAppointments(data);
      setLoading(false);
    }
    load();
  }, [userId]);

  const upcoming = appointments.filter((a) => a.status === 'confirmada' || a.status === 'pendiente');
  const past = appointments.filter((a) => a.status !== 'confirmada' && a.status !== 'pendiente');

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-[#FBFBF9] w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl shadow-2xl border border-gray-100 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#FFFBE6] flex items-center justify-center text-[#C9A000] font-bold text-sm shrink-0">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-gray-900 font-semibold text-sm leading-tight">{userName}</p>
              <p className="text-gray-400 text-xs">{userEmail}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onLogout}
              className="text-gray-400 hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-red-50"
              title="Cerrar sesión"
            >
              <LogOut size={16} />
            </button>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors p-1.5 rounded-lg hover:bg-[#FBFBF9]">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Title */}
        <div className="px-5 pt-4 pb-1 shrink-0">
          <p className="text-gray-900 font-semibold text-sm flex items-center gap-2">
            <Calendar size={16} className="text-[#C9A000]" />
            Mis Citas
            {upcoming.length > 0 && (
              <span className="text-xs px-1.5 py-0.5 rounded-full font-bold bg-[#111111] text-white">
                {upcoming.length}
              </span>
            )}
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 pb-5">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-7 h-7 border-2 border-[#111111]/30 border-t-[#111111] rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-5 pt-3">
              {upcoming.length > 0 && (
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2">Próximas</p>
                  <div className="space-y-2">
                    {upcoming.map((a) => <AppointmentCard key={a.id} appt={a} />)}
                  </div>
                </div>
              )}

              {past.length > 0 && (
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2">Historial</p>
                  <div className="space-y-2">
                    {past.map((a) => <AppointmentCard key={a.id} appt={a} />)}
                  </div>
                </div>
              )}

              {appointments.length === 0 && (
                <div className="text-center py-12">
                  <Calendar size={40} className="text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm font-medium">No tienes citas registradas</p>
                  <p className="text-gray-400 text-xs mt-1 mb-4">Agenda tu primera cita con nosotros</p>
                  <button
                    onClick={() => { onClose(); onBookNow(); }}
                    className="bg-black hover:bg-neutral-800 text-white text-sm font-semibold px-5 py-2.5 rounded-none transition-colors"
                  >
                    Agendar Cita
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AppointmentCard({ appt }: { appt: Appointment }) {
  const s = STATUS_LABEL[appt.status] ?? { label: appt.status, cls: 'bg-[#FBFBF9] text-gray-600 border-gray-200' };
  return (
    <div className="bg-[#FBFBF9] border border-gray-100 rounded-xl p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-gray-900 font-semibold text-sm truncate">{appt.service_name}</p>
          <p className="text-gray-500 text-xs mt-0.5">con {appt.staff_name}</p>
        </div>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full border shrink-0 ${s.cls}`}>{s.label}</span>
      </div>
      <div className="flex items-center gap-4 mt-2.5">
        <div className="flex items-center gap-1.5 text-gray-400 text-xs">
          <Calendar size={12} />
          {new Date(appt.appointment_date + 'T12:00').toLocaleDateString('es-MX', { weekday: 'short', month: 'short', day: 'numeric' })}
        </div>
        <div className="flex items-center gap-1.5 text-gray-400 text-xs">
          <Clock size={12} />
          {appt.appointment_time.slice(0, 5)}
        </div>
        {appt.payment_amount > 0 && (
          <span className="text-[#C9A000] text-xs font-medium ml-auto">Anticipo: ${appt.payment_amount.toLocaleString()}</span>
        )}
      </div>
    </div>
  );
}
