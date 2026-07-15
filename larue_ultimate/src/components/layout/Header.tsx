import { useState, useEffect } from 'react';
import { Menu, X, LogIn, User } from 'lucide-react';

interface CustomerSession {
  id: string;
  email: string;
  name: string;
}

interface HeaderProps {
  activeTab: 'larue' | 'admin';
  onTabChange: (tab: 'larue' | 'admin') => void;
  isAdmin: boolean;
  customer: CustomerSession | null;
  onLoginClick: () => void;
  onSignUpClick: () => void;
  onCustomerDashClick: () => void;
  onValmClick?: () => void;
}

const NAV_LINKS = [
  { label: 'Servicios', id: 'servicios' },
  { label: 'Galería', id: 'galeria' },
  { label: 'Citas', id: 'citas' },
];

export default function Header({
  activeTab, onTabChange,
  isAdmin, customer, onLoginClick, onSignUpClick, onCustomerDashClick,
}: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const scrollTo = (id: string) => {
    setMenuOpen(false);
    if (activeTab !== 'larue') onTabChange('larue');
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }, activeTab !== 'larue' ? 100 : 0);
  };

  const isLoggedIn = isAdmin || !!customer;

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      style={{
        backgroundColor: scrolled ? 'rgba(250,249,246,0.96)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(26,26,26,0.08)' : 'none',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between h-20">

        {/* Logo */}
        <button onClick={() => onTabChange('larue')} className="flex items-center shrink-0">
          <img
            src="/images/logos-buenos-main.png"
            alt="La Rue Salon & Spa"
            className={`h-10 w-auto object-contain transition-all duration-300 ${scrolled ? '' : 'brightness-0 invert'}`}
          />
        </button>

        {/* Nav — desktop */}
        <nav className="hidden md:flex items-center gap-10">
          {NAV_LINKS.map((link) => (
            <button
              key={link.id}
              onClick={() => scrollTo(link.id)}
              className={`text-xs tracking-[0.2em] uppercase font-medium transition-colors duration-300 ${
                scrolled ? 'text-[#1a1a1a]/70 hover:text-[#8B7355]' : 'text-white/85 hover:text-white'
              }`}
            >
              {link.label}
            </button>
          ))}
          {isAdmin && (
            <button
              onClick={() => onTabChange('admin')}
              className={`text-xs tracking-[0.2em] uppercase font-medium transition-colors duration-300 ${
                activeTab === 'admin'
                  ? 'text-[#8B7355]'
                  : scrolled ? 'text-[#1a1a1a]/70 hover:text-[#8B7355]' : 'text-white/85 hover:text-white'
              }`}
            >
              Admin
            </button>
          )}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-3 shrink-0">
          {customer && (
            <button
              onClick={onCustomerDashClick}
              className={`hidden md:flex items-center gap-2 text-xs font-medium px-4 py-2 border transition-all duration-300 ${
                scrolled
                  ? 'border-[#1a1a1a]/20 text-[#1a1a1a]/70 hover:border-[#8B7355] hover:text-[#8B7355]'
                  : 'border-white/30 text-white/80 hover:border-white hover:text-white'
              }`}
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                scrolled ? 'bg-[#1a1a1a]/10 text-[#1a1a1a]' : 'bg-white/20 text-white'
              }`}>
                {customer.name.charAt(0).toUpperCase()}
              </div>
              {customer.name.split(' ')[0]}
            </button>
          )}

          {!isLoggedIn && (
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={onLoginClick}
                className={`flex items-center gap-1.5 text-xs tracking-[0.1em] uppercase font-medium px-4 py-2 border transition-all duration-300 ${
                  scrolled
                    ? 'border-[#1a1a1a]/20 text-[#1a1a1a]/70 hover:border-[#8B7355] hover:text-[#8B7355]'
                    : 'border-white/30 text-white/80 hover:border-white hover:text-white'
                }`}
              >
                <LogIn size={12} />
                Ingresar
              </button>
              <button
                onClick={() => scrollTo('citas')}
                className={`text-xs tracking-[0.15em] uppercase font-medium px-5 py-2.5 transition-all duration-300 ${
                  scrolled
                    ? 'bg-[#1a1a1a] text-[#FAF9F6] hover:bg-[#8B7355]'
                    : 'bg-white/15 text-white hover:bg-white hover:text-[#1a1a1a]'
                }`}
              >
                Reservar
              </button>
            </div>
          )}

          {/* Mobile toggle */}
          <button
            className={`md:hidden p-1.5 transition-colors ${scrolled ? 'text-[#1a1a1a]' : 'text-white'}`}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      <div
        className="md:hidden overflow-hidden transition-all duration-500"
        style={{
          maxHeight: menuOpen ? '480px' : '0',
          backgroundColor: 'rgba(250,249,246,0.98)',
        }}
      >
        <div className="px-6 py-8 flex flex-col gap-6 border-t border-[#1a1a1a]/8">
          {NAV_LINKS.map((link) => (
            <button
              key={link.id}
              onClick={() => scrollTo(link.id)}
              className="text-left text-sm tracking-[0.2em] uppercase font-medium text-[#1a1a1a] hover:text-[#8B7355] transition-colors"
            >
              {link.label}
            </button>
          ))}
          {isAdmin && (
            <button
              onClick={() => { onTabChange('admin'); setMenuOpen(false); }}
              className="text-left text-sm tracking-[0.2em] uppercase font-medium text-[#8B7355]"
            >
              Admin Panel
            </button>
          )}

          {customer && (
            <button
              onClick={() => { onCustomerDashClick(); setMenuOpen(false); }}
              className="flex items-center gap-3 text-left text-sm font-medium text-[#1a1a1a]/80 border border-[#1a1a1a]/15 px-4 py-3"
            >
              <div className="w-7 h-7 rounded-full bg-[#1a1a1a]/10 flex items-center justify-center font-bold text-xs">
                {customer.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-[#1a1a1a] text-xs">{customer.name}</p>
                <p className="text-[#1a1a1a]/40 text-[10px]">Ver mis citas</p>
              </div>
            </button>
          )}

          {!isLoggedIn && (
            <div className="flex flex-col gap-3 pt-2">
              <button
                onClick={() => { onLoginClick(); setMenuOpen(false); }}
                className="flex items-center gap-2 text-sm tracking-[0.1em] uppercase font-medium text-[#1a1a1a]/80 border border-[#1a1a1a]/20 px-4 py-3 hover:border-[#8B7355] hover:text-[#8B7355] transition-colors"
              >
                <LogIn size={14} /> Iniciar Sesión
              </button>
              <button
                onClick={() => { scrollTo('citas'); }}
                className="flex items-center justify-center gap-2 text-sm tracking-[0.1em] uppercase font-medium bg-[#1a1a1a] text-[#FAF9F6] px-4 py-3 hover:bg-[#8B7355] transition-colors"
              >
                <User size={14} /> Reservar Cita
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
