import { useState, useEffect } from 'react';
import { Menu, X, LogIn, User } from 'lucide-react';

interface CustomerSession {
  id: string;
  email: string;
  name: string;
}

export type SectionTab = 'salon' | 'beauty' | 'art' | 'admin';

interface HeaderProps {
  activeTab: SectionTab;
  onTabChange: (tab: SectionTab) => void;
  isAdmin: boolean;
  customer: CustomerSession | null;
  onLoginClick: () => void;
  onCustomerDashClick: () => void;
}

const NAV_TABS: { label: string; tab: SectionTab }[] = [
  { label: 'Salón y Spa', tab: 'salon' },
  { label: 'Beauty', tab: 'beauty' },
  { label: 'LaRue Art', tab: 'art' },
];

export default function Header({
  activeTab, onTabChange,
  isAdmin, customer, onLoginClick, onCustomerDashClick,
}: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const isLight = activeTab === 'beauty' || activeTab === 'art' || activeTab === 'admin';

  const scrollTo = (id: string) => {
    setMenuOpen(false);
    if (activeTab !== 'salon') {
      onTabChange('salon');
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleTabClick = (tab: SectionTab) => {
    setMenuOpen(false);
    onTabChange(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isLoggedIn = isAdmin || !!customer;
  const useDarkText = scrolled || isLight;

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      style={{
        backgroundColor: useDarkText ? 'rgba(250,249,246,0.96)' : 'transparent',
        backdropFilter: useDarkText ? 'blur(12px)' : 'none',
        borderBottom: useDarkText ? '1px solid rgba(26,26,26,0.08)' : 'none',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between h-20">

        {/* Logo */}
        <button onClick={() => handleTabClick('salon')} className="flex items-center shrink-0">
          <img
            src={useDarkText ? '/images/logos-buenos-main.png' : '/images/logos-buenos-negro.png'}
            alt="La Rue Salon & Spa"
            className="h-10 w-auto object-contain transition-all duration-300"
          />
        </button>

        {/* Nav — desktop */}
        <nav className="hidden md:flex items-center gap-10">
          {NAV_TABS.map((nav) => (
            <button
              key={nav.tab}
              onClick={() => handleTabClick(nav.tab)}
              className={`text-xs tracking-[0.2em] uppercase font-medium transition-colors duration-300 ${
                activeTab === nav.tab
                  ? 'text-[#8B7355]'
                  : useDarkText
                    ? 'text-[#1a1a1a]/70 hover:text-[#8B7355]'
                    : 'text-white/85 hover:text-white'
              }`}
            >
              {nav.label}
            </button>
          ))}

          {isAdmin && (
            <button
              onClick={() => handleTabClick('admin')}
              className={`text-xs tracking-[0.2em] uppercase font-medium transition-colors duration-300 ${
                activeTab === 'admin'
                  ? 'text-[#8B7355]'
                  : useDarkText ? 'text-[#1a1a1a]/70 hover:text-[#8B7355]' : 'text-white/85 hover:text-white'
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
                useDarkText
                  ? 'border-[#1a1a1a]/20 text-[#1a1a1a]/70 hover:border-[#8B7355] hover:text-[#8B7355]'
                  : 'border-white/30 text-white/80 hover:border-white hover:text-white'
              }`}
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                useDarkText ? 'bg-[#1a1a1a]/10 text-[#1a1a1a]' : 'bg-white/20 text-white'
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
                  useDarkText
                    ? 'border-[#1a1a1a]/20 text-[#1a1a1a]/70 hover:border-[#8B7355] hover:text-[#8B7355]'
                    : 'border-white/30 text-white/80 hover:border-white hover:text-white'
                }`}
              >
                <LogIn size={12} />
                Ingresar
              </button>
              {activeTab === 'salon' && (
                <button
                  onClick={() => scrollTo('citas')}
                  className={`text-xs tracking-[0.15em] uppercase font-medium px-5 py-2.5 transition-all duration-300 ${
                    useDarkText
                      ? 'bg-[#1a1a1a] text-[#FAF9F6] hover:bg-[#8B7355]'
                      : 'bg-white/15 text-white hover:bg-white hover:text-[#1a1a1a]'
                  }`}
                >
                  Reservar
                </button>
              )}
            </div>
          )}

          {/* Mobile toggle */}
          <button
            className={`md:hidden p-1.5 transition-colors ${useDarkText ? 'text-[#1a1a1a]' : 'text-white'}`}
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
          maxHeight: menuOpen ? '520px' : '0',
          backgroundColor: 'rgba(250,249,246,0.98)',
        }}
      >
        <div className="px-6 py-8 flex flex-col gap-6 border-t border-[#1a1a1a]/8">
          {NAV_TABS.map((nav) => (
            <button
              key={nav.tab}
              onClick={() => handleTabClick(nav.tab)}
              className={`text-left text-sm tracking-[0.2em] uppercase font-medium transition-colors ${
                activeTab === nav.tab ? 'text-[#8B7355]' : 'text-[#1a1a1a] hover:text-[#8B7355]'
              }`}
            >
              {nav.label}
            </button>
          ))}

          {isAdmin && (
            <button
              onClick={() => handleTabClick('admin')}
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
              {activeTab === 'salon' && (
                <button
                  onClick={() => { scrollTo('citas'); }}
                  className="flex items-center justify-center gap-2 text-sm tracking-[0.1em] uppercase font-medium bg-[#1a1a1a] text-[#FAF9F6] px-4 py-3 hover:bg-[#8B7355] transition-colors"
                >
                  <User size={14} /> Reservar Cita
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
