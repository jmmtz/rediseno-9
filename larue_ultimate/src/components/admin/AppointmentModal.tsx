import { useState } from 'react';
import { X, AlertTriangle, MessageSquare, UserCheck, XCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Appointment, Staff } from '../../types';

interface AppointmentModalProps {
  appointment: Appointment;
  staff: Staff[];
  onClose: () => void;
  onRefresh: () => void;
}

export default function AppointmentModal({ appointment, staff, onClose, onRefresh }: AppointmentModalProps) {
  const [view, setView] = useState<'main' | 'cancel'>('main');
  const [cancelSilent, setCancelSilent] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [newStaffId, setNewStaffId] = useState(appointment.staff_id || '');
  const [loading, setLoading] = useState(false);

  async function markNoShow() {
    setLoading(true);
    await supabase.from('appointments').update({ status: 'no_show', updated_at: new Date().toISOString() }).eq('id', appointment.id);
    onRefresh();
    onClose();
    setLoading(false);
  }

  async function markComplete() {
    setLoading(true);
    await supabase.from('appointments').update({ status: 'completada', updated_at: new Date().toISOString() }).eq('id', appointment.id);
    onRefresh();
    onClose();
    setLoading(false);
  }

  async function reassignStaff() {
    if (!newStaffId) return;
    setLoading(true);
    const chosen = staff.find((s) => s.id === newStaffId);
    await supabase.from('appointments').update({
      staff_id: newStaffId,
      staff_name: chosen?.name || 'Cualquier Profesional',
      updated_at: new Date().toISOString(),
    }).eq('id', appointment.id);
    onRefresh();
    onClose();
    setLoading(false);
  }

  async function cancelAppointment() {
    setLoading(true);
    await supabase.from('appointments').update({
      status: 'cancelada',
      cancellation_reason: cancelSilent ? '' : cancelReason,
      notified_cancellation: !cancelSilent,
      updated_at: new Date().toISOString(),
    }).eq('id', appointment.id);
    onRefresh();
    onClose();
    setLoading(false);
  }

  const statusColors: Record<string, string> = {
    confirmada: 'bg-green-50 text-green-700 border border-green-200',
    completada: 'bg-blue-50 text-blue-700 border border-blue-200',
    cancelada: 'bg-red-50 text-red-700 border border-red-200',
    no_show: 'bg-orange-50 text-orange-700 border border-orange-200',
    pendiente: 'bg-amber-50 text-amber-700 border border-amber-200',
  };

  const inputCls = "bg-[#FBFBF9] border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-[#111111] focus:ring-2 focus:ring-[#111111]/20 focus:outline-none text-sm transition-all";

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#FBFBF9] border border-gray-100 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-gray-900 font-semibold">Gestionar Cita</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Appointment info */}
          <div className="bg-[#FBFBF9] border border-gray-100 rounded-xl p-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-900 font-semibold">{appointment.client_name}</span>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[appointment.status]}`}>
                {appointment.status}
              </span>
            </div>
            <p className="text-gray-600 text-sm">{appointment.service_name}</p>
            <p className="text-gray-500 text-sm">{appointment.appointment_date} — {appointment.appointment_time}</p>
            <p className="text-gray-500 text-sm">Profesional: {appointment.staff_name}</p>
            <p className="text-gray-500 text-sm">Tel: {appointment.client_phone}</p>
            {appointment.payment_amount > 0 && (
              <p className="text-[#C9A000] font-semibold text-sm">Anticipo pagado: ${appointment.payment_amount.toLocaleString()} MXN</p>
            )}
          </div>

          {view === 'main' && appointment.status === 'confirmada' && (
            <>
              {/* Reassign staff */}
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Cambiar Especialista</label>
                <div className="flex gap-2">
                  <select
                    value={newStaffId}
                    onChange={(e) => setNewStaffId(e.target.value)}
                    className={`flex-1 ${inputCls}`}
                  >
                    <option value="">Cualquier Profesional</option>
                    {staff.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                  <button
                    onClick={reassignStaff}
                    disabled={loading}
                    className="bg-black hover:bg-neutral-800 text-white text-xs font-semibold px-4 py-2 rounded-none transition-colors flex items-center gap-1.5"
                  >
                    <UserCheck size={14} />
                    Asignar
                  </button>
                </div>
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={markComplete}
                  disabled={loading}
                  className="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-medium py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <UserCheck size={16} />
                  Completada
                </button>
                <button
                  onClick={markNoShow}
                  disabled={loading}
                  className="bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 font-medium py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <AlertTriangle size={16} />
                  No Show
                </button>
              </div>
              <button
                onClick={() => setView('cancel')}
                className="w-full bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-medium py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
              >
                <XCircle size={16} />
                Cancelar Cita
              </button>
            </>
          )}

          {view === 'cancel' && (
            <div className="space-y-4">
              <p className="text-gray-500 text-sm">¿Cómo deseas cancelar esta cita?</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => { setCancelSilent(true); }}
                  className={`py-3 rounded-xl text-sm font-medium border transition-colors ${cancelSilent ? 'bg-red-50 border-red-300 text-red-700' : 'bg-[#FBFBF9] border-gray-200 text-gray-500 hover:border-gray-300'}`}
                >
                  Cancelar en Silencio
                </button>
                <button
                  onClick={() => { setCancelSilent(false); }}
                  className={`py-3 rounded-xl text-sm font-medium border transition-colors ${!cancelSilent ? 'bg-orange-50 border-orange-300 text-orange-700' : 'bg-[#FBFBF9] border-gray-200 text-gray-500 hover:border-gray-300'}`}
                >
                  Notificar Cliente
                </button>
              </div>
              {!cancelSilent && (
                <div>
                  <label className="flex items-center gap-1 text-xs text-gray-500 mb-1.5">
                    <MessageSquare size={12} />
                    Motivo de cancelación (se enviará por WhatsApp)
                  </label>
                  <textarea
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Ej: Falla eléctrica, el salón estará cerrado hoy..."
                    rows={3}
                    className="w-full bg-[#FBFBF9] border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-[#111111] focus:ring-2 focus:ring-[#111111]/20 focus:outline-none text-sm resize-none transition-all"
                  />
                </div>
              )}
              <div className="flex gap-3">
                <button onClick={() => setView('main')} className="flex-1 bg-[#FBFBF9] hover:bg-gray-100 text-gray-600 py-3 rounded-xl text-sm transition-colors border border-gray-200">
                  Volver
                </button>
                <button
                  onClick={cancelAppointment}
                  disabled={loading || (!cancelSilent && !cancelReason.trim())}
                  className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-40 text-white font-medium py-3 rounded-xl text-sm transition-colors"
                >
                  {loading ? '...' : 'Confirmar Cancelación'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
