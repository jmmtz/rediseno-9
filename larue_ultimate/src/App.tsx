import { useState, useEffect, useRef } from 'react';
import { supabase } from './lib/supabase';
import type { Service } from './types';

import Header from './components/layout/Header';
import Hero from './components/larue/Hero';
import Services from './components/larue/Services';
import Gallery from './components/larue/Gallery';
import Footer from './components/larue/Footer';
import BookingWizard from './components/larue/BookingWizard';
import AdminDashboard from './components/admin/AdminDashboard';
import AuthModal from './components/auth/AuthModal';
import CustomerDashboard from './components/auth/CustomerDashboard';

type AppTab = 'larue' | 'admin';
interface CustomerSession { id: string; email: string; name: string; }
interface PendingBooking {
  client_name: string;
  client_phone: string;
  service_name: string;
  appointment_date: string;
  appointment_time: string;
  staff_name: string;
  depositAmount: number;
}

// ── Stripe payment success modal ─────────────────────────────────────────────
function StripeSuccessModal({ booking, onClose }: { booking: PendingBooking; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#FBFBF9] rounded-2xl w-full max-w-md shadow-2xl border border-gray-100 p-8 text-center">
        <div className="w-20 h-20 rounded-full bg-[#FFFBE6] flex items-center justify-center mx-auto mb-5">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#C9A000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </div>
        <h2 className="text-gray-900 text-xl font-semibold mb-2">¡Pago Confirmado!</h2>
        <p className="text-gray-500 text-sm mb-6">
          Tu anticipo fue procesado exitosamente. Tu cita está reservada.
        </p>
        <div className="bg-[#FBFBF9] border border-gray-100 rounded-xl p-4 text-left space-y-2 mb-6">
          {[
            ['Cliente', booking.client_name],
            ['Servicio', booking.service_name],
            ['Fecha', booking.appointment_date],
            ['Hora', booking.appointment_time],
            ['Especialista', booking.staff_name],
            ['Anticipo pagado', `$${booking.depositAmount?.toLocaleString()} MXN`],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between text-sm">
              <span className="text-gray-400">{label}</span>
              <span className="text-gray-900 font-medium">{value}</span>
            </div>
          ))}
        </div>
        <p className="text-gray-400 text-xs mb-5">
          Para cambios o cancelaciones contáctanos por WhatsApp al (871) 750-7681.
        </p>
        <button
          onClick={onClose}
          className="w-full bg-black hover:bg-neutral-800 text-white font-semibold py-3.5 rounded-none transition-colors"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}

// ── Scroll reveal helper ─────────────────────────────────────────────────────
function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

// ── Stats strip ──────────────────────────────────────────────────────────────
const STATS = [
  { value: '10+', label: 'Años de Experiencia' },
  { value: '5,000+', label: 'Clientas Satisfechas' },
  { value: '20+', label: 'Técnicas Especializadas' },
  { value: '8', label: 'Premios de Industria' },
];

function StatsStrip() {
  const { ref, visible } = useScrollReveal();
  return (
    <section className="py-16 border-y border-[#1a1a1a]/8 bg-[#FAF9F6]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div
          ref={ref}
          className="flex flex-col md:flex-row items-center justify-between gap-10"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
          }}
        >
          {STATS.map(({ value, label }, i) => (
            <div
              key={label}
              className="text-center flex-1"
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <p className="font-cormorant text-4xl lg:text-5xl font-light text-[#1a1a1a] mb-2">{value}</p>
              <p className="text-xs tracking-[0.2em] uppercase text-[#8B7355] font-medium">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Booking CTA section ──────────────────────────────────────────────────────
function CitasSection({ onBookClick }: { onBookClick: () => void }) {
  const { ref, visible } = useScrollReveal();
  return (
    <section id="citas" className="py-24 lg:py-36 bg-[#1a1a1a]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center">
        <div
          ref={ref}
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(24px)',
            transition: 'opacity 0.9s ease-out, transform 0.9s ease-out',
          }}
        >
          <p className="text-xs tracking-[0.4em] uppercase text-[#C9A96E] font-medium mb-6">Reserva tu lugar</p>
          <h2 className="font-cormorant text-5xl lg:text-7xl font-light text-[#FAF9F6] leading-none mb-8">
            Tu transformación<br /><em className="text-[#FAF9F6]/75">comienza aquí</em>
          </h2>
          <p className="text-sm text-[#FAF9F6]/55 font-light max-w-md mx-auto leading-relaxed mb-12">
            Agenda tu cita en línea. Elige el servicio, el horario y el estilista que prefieras — en minutos.
          </p>
          <button
            onClick={onBookClick}
            className="inline-block text-xs tracking-[0.3em] uppercase bg-[#FAF9F6] text-[#1a1a1a] px-12 py-5 font-medium hover:bg-[#C9A96E] hover:text-[#FAF9F6] transition-all duration-500"
          >
            Agendar Cita Ahora
          </button>
        </div>
      </div>
    </section>
  );
}

// ── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [activeTab, setActiveTab]         = useState<AppTab>('larue');
  const [isAdmin, setIsAdmin]             = useState(false);
  const [customer, setCustomer]           = useState<CustomerSession | null>(null);
  const [checkingAuth, setCheckingAuth]   = useState(true);
  const authResolved = useRef(false);

  const [showBooking, setShowBooking]           = useState(false);
  const [preselectedService, setPreselectedService] = useState<Service | null>(null);
  const [showAuthModal, setShowAuthModal]       = useState(false);
  const [authModalView, setAuthModalView]       = useState<'login' | 'signup'>('login');
  const [showCustomerDash, setShowCustomerDash] = useState(false);
  const [stripeBooking, setStripeBooking]       = useState<PendingBooking | null>(null);

  // Handle Stripe return (success or cancel)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const appointmentId = params.get('appointment_id');
    const cancelled = params.get('cancelled') === '1';

    if (!appointmentId) return;

    // Clean URL immediately
    window.history.replaceState({}, '', window.location.pathname);

    const raw = localStorage.getItem('larue_pending_booking');
    localStorage.removeItem('larue_pending_booking');

    if (cancelled) {
      // Delete the pending appointment silently
      supabase.from('appointments').delete().eq('id', appointmentId).eq('status', 'pendiente').then(() => {});
    } else {
      // Payment succeeded — show confirmation from saved booking data
      if (raw) {
        try {
          setStripeBooking(JSON.parse(raw) as PendingBooking);
        } catch {}
      } else {
        // Fallback: show a generic success message
        setStripeBooking({ client_name: '', service_name: 'tu servicio', appointment_date: '', appointment_time: '', staff_name: '', depositAmount: 0 });
      }
    }
  }, []);

  async function resolveUserRole(userId: string, email: string) {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role, full_name')
      .eq('id', userId)
      .maybeSingle();

    if (error) console.error('[App] resolveUserRole error:', error);

    if (profile?.role === 'admin') {
      setIsAdmin(true);
      setCustomer(null);
      setActiveTab('admin');
    } else {
      setIsAdmin(false);
      setCustomer({
        id: userId,
        email,
        name: profile?.full_name || email.split('@')[0],
      });
    }
    if (!authResolved.current) {
      authResolved.current = true;
      setCheckingAuth(false);
    }
  }

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        if (session?.user) {
          await resolveUserRole(session.user.id, session.user.email ?? '');
        } else {
          setIsAdmin(false);
          setCustomer(null);
          if (!authResolved.current) {
            authResolved.current = true;
            setCheckingAuth(false);
          }
        }
      })();
    });
    return () => subscription.unsubscribe();
  }, []);

  function handleTabChange(tab: AppTab) {
    if (tab === 'admin' && !isAdmin) {
      setAuthModalView('login');
      setShowAuthModal(true);
      return;
    }
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleAuthSuccess(_role: 'admin' | 'customer') {
    setShowAuthModal(false);
  }

  function handleBookService(service: Service) {
    setPreselectedService(service);
    setShowBooking(true);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setIsAdmin(false);
    setCustomer(null);
    setActiveTab('larue');
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
        <div className="w-8 h-8 border border-[#1a1a1a]/20 border-t-[#8B7355] rounded-full animate-spin" />
      </div>
    );
  }

  if (activeTab === 'admin' && isAdmin) {
    return <AdminDashboard onLogout={handleLogout} />;
  }

  return (
    <div className="bg-[#FAF9F6] text-[#1a1a1a]">
      <Header
        activeTab={activeTab}
        onTabChange={handleTabChange}
        isAdmin={isAdmin}
        customer={customer}
        onLoginClick={() => { setAuthModalView('login'); setShowAuthModal(true); }}
        onSignUpClick={() => { setAuthModalView('signup'); setShowAuthModal(true); }}
        onCustomerDashClick={() => setShowCustomerDash(true)}
      />

      <Hero onBookClick={() => setShowBooking(true)} />
      <StatsStrip />
      <Services onBookService={handleBookService} />
      <Gallery />
      <CitasSection onBookClick={() => setShowBooking(true)} />
      <Footer />

      {isAdmin && (
        <div className="fixed bottom-6 right-6 z-40">
          <button
            onClick={() => handleTabChange('admin')}
            className="bg-[#8B7355] hover:bg-[#5a4a35] text-[#FAF9F6] text-xs tracking-[0.15em] uppercase font-medium px-5 py-3 shadow-lg transition-colors duration-300"
          >
            Admin Panel
          </button>
        </div>
      )}

      {showBooking && (
        <BookingWizard
          onClose={() => { setShowBooking(false); setPreselectedService(null); }}
          preselectedService={preselectedService}
          customerSession={customer}
        />
      )}

      {showAuthModal && (
        <AuthModal
          initialView={authModalView}
          onClose={() => setShowAuthModal(false)}
          onAuthSuccess={handleAuthSuccess}
        />
      )}

      {showCustomerDash && customer && (
        <CustomerDashboard
          userId={customer.id}
          userEmail={customer.email}
          userName={customer.name}
          onClose={() => setShowCustomerDash(false)}
          onLogout={() => { setShowCustomerDash(false); handleLogout(); }}
          onBookNow={() => setShowBooking(true)}
        />
      )}

      {stripeBooking && (
        <StripeSuccessModal
          booking={stripeBooking}
          onClose={() => setStripeBooking(null)}
        />
      )}
    </div>
  );
}
