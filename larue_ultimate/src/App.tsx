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

  const [showBooking, setShowBooking]         = useState(false);
  const [preselectedService, setPreselectedService] = useState<Service | null>(null);
  const [showAuthModal, setShowAuthModal]     = useState(false);
  const [authModalView, setAuthModalView]     = useState<'login' | 'signup'>('login');
  const [showCustomerDash, setShowCustomerDash] = useState(false);

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

  // Loading spinner
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
        <div className="w-8 h-8 border border-[#1a1a1a]/20 border-t-[#8B7355] rounded-full animate-spin" />
      </div>
    );
  }

  // Admin panel
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

      {/* Admin FAB */}
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
    </div>
  );
}
