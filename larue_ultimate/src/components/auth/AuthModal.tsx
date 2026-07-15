import { useState } from 'react';
import { X, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface AuthModalProps {
  initialView?: 'login' | 'signup';
  onClose: () => void;
  onAuthSuccess: (role: 'admin' | 'customer') => void;
}

export default function AuthModal({ initialView = 'login', onClose, onAuthSuccess }: AuthModalProps) {
  const [view, setView] = useState<'login' | 'signup'>(initialView);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const inputCls = "w-full bg-[#FBFBF9] border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-[#111111] focus:ring-2 focus:ring-[#111111]/20 focus:outline-none text-sm transition-all";

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName.trim()) { setError('Por favor ingresa tu nombre completo.'); return; }
    setLoading(true);
    setError('');

    const { data, error: authError } = await supabase.auth.signUp({ email, password });

    if (authError || !data.user) {
      setError(authError?.message === 'User already registered'
        ? 'Este correo ya está registrado. Inicia sesión.'
        : authError?.message || 'Error al crear la cuenta.');
      setLoading(false);
      return;
    }

    // Insert profile — trigger handle_new_user does this automatically,
    // but we upsert here as a belt-and-suspenders with correct full_name/phone.
    const { error: profileError } = await supabase.from('profiles').upsert({
      id: data.user.id,
      email,
      full_name: fullName,
      phone: phone || '',
      role: 'client',
    }, { onConflict: 'id' });

    if (profileError && profileError.code !== '23505') {
      setError('Error al crear el perfil. Intenta de nuevo.');
      setLoading(false);
      return;
    }

    setSuccess('¡Cuenta creada! Iniciando sesión...');
    setTimeout(() => {
      onAuthSuccess('customer');
    }, 800);
    setLoading(false);
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError || !data.user) {
      setError(authError?.message || 'Correo o contraseña incorrectos.');
      setLoading(false);
      return;
    }

    // Role resolution and redirect handled by onAuthStateChange in App.tsx
    onAuthSuccess('customer');
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#FBFBF9] rounded-2xl w-full max-w-sm shadow-2xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <img src="/images/logos-buenos-negro.png" alt="La Rue" className="h-8 w-auto object-contain" />
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors rounded-full p-1">
            <X size={20} />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex mx-6 mb-6 bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => { setView('login'); setError(''); setSuccess(''); }}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
              view === 'login' ? 'bg-[#FBFBF9] text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            onClick={() => { setView('signup'); setError(''); setSuccess(''); }}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
              view === 'signup' ? 'bg-[#FBFBF9] text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Crear Cuenta
          </button>
        </div>

        <div className="px-6 pb-6">
          {view === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 font-medium mb-1.5">Correo electrónico</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  className={inputCls}
                  required
                  autoComplete="email"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 font-medium mb-1.5">Contraseña</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`${inputCls} pr-11`}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-100 rounded-xl p-3">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black hover:bg-neutral-800 disabled:opacity-50 text-white font-semibold py-3.5 rounded-none transition-all flex items-center justify-center gap-2 text-sm mt-2"
              >
                {loading && <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />}
                {loading ? 'Ingresando...' : 'Iniciar Sesión'}
              </button>

              <p className="text-center text-xs text-gray-400">
                ¿No tienes cuenta?{' '}
                <button type="button" onClick={() => { setView('signup'); setError(''); }} className="text-[#C9A000] font-medium hover:underline">
                  Regístrate
                </button>
              </p>
            </form>
          ) : (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 font-medium mb-1.5">Nombre completo</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="María García"
                  className={inputCls}
                  required
                  autoComplete="name"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 font-medium mb-1.5">Correo electrónico</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  className={inputCls}
                  required
                  autoComplete="email"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 font-medium mb-1.5">Teléfono <span className="text-gray-400">(opcional)</span></label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(871) 000-0000"
                  className={inputCls}
                  autoComplete="tel"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 font-medium mb-1.5">Contraseña</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className={`${inputCls} pr-11`}
                    required
                    minLength={6}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-100 rounded-xl p-3">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              {success && (
                <div className="flex items-center gap-2 text-green-700 text-sm bg-green-50 border border-green-200 rounded-xl p-3">
                  <CheckCircle size={15} className="shrink-0" />
                  <span>{success}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black hover:bg-neutral-800 disabled:opacity-50 text-white font-semibold py-3.5 rounded-none transition-all flex items-center justify-center gap-2 text-sm mt-2"
              >
                {loading && <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />}
                {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
              </button>

              <p className="text-center text-xs text-gray-400">
                ¿Ya tienes cuenta?{' '}
                <button type="button" onClick={() => { setView('login'); setError(''); }} className="text-[#C9A000] font-medium hover:underline">
                  Inicia sesión
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
