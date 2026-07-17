import { Instagram, Facebook, Phone, MapPin, Clock } from 'lucide-react';

export default function Footer() {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#1a1a1a] text-[#FAF9F6] py-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">

          {/* Brand */}
          <div className="md:col-span-2">
            <img src="/images/logos-buenos-negro.png" alt="La Rue" className="h-12 w-auto object-contain mb-6" />
            <p className="text-sm text-[#FAF9F6]/55 font-light leading-relaxed max-w-sm">
              Un refugio de belleza y bienestar donde cada detalle está pensado para ofrecerte una experiencia sin igual. Lujo silencioso, cuidado genuino.
            </p>
            <div className="flex items-center gap-5 mt-8">
              <a href="https://instagram.com/la.rue.salon" target="_blank" rel="noreferrer"
                className="text-[#FAF9F6]/45 hover:text-[#C9A96E] transition-colors duration-300">
                <Instagram size={18} />
              </a>
              <a href="https://facebook.com/la.rue.salon" target="_blank" rel="noreferrer"
                className="text-[#FAF9F6]/45 hover:text-[#C9A96E] transition-colors duration-300">
                <Facebook size={18} />
              </a>
              <a href="tel:+528717507681"
                className="text-[#FAF9F6]/45 hover:text-[#C9A96E] transition-colors duration-300">
                <Phone size={18} />
              </a>
            </div>
          </div>

          {/* Servicios */}
          <div>
            <p className="text-xs tracking-[0.25em] uppercase text-[#FAF9F6]/35 font-medium mb-6">Servicios</p>
            <ul className="space-y-3 text-sm text-[#FAF9F6]/55 font-light">
              {['Coloración Premium', 'Corte & Peinado', 'Maquillaje', 'Faciales & Spa', 'Terapia Sensorial', 'Luz Roja LED'].map((s) => (
                <li key={s}>
                  <button onClick={() => scrollTo('servicios')}
                    className="hover:text-[#C9A96E] transition-colors duration-300 text-left">
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <p className="text-xs tracking-[0.25em] uppercase text-[#FAF9F6]/35 font-medium mb-6">Contacto</p>
            <ul className="space-y-5 text-sm text-[#FAF9F6]/55 font-light">
              <li className="flex items-start gap-3">
                <Clock size={13} className="text-[#C9A96E] mt-0.5 shrink-0" />
                <span>Lun–Sáb 9:00–19:00<br />Dom 10:00–16:00</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={13} className="text-[#C9A96E] mt-0.5 shrink-0" />
                <span>Blvd. Independencia 3817-Loc 1<br />Residencial el Fresno<br />27018 Torreón, Coah.</span>
              </li>
              <li className="flex items-start gap-3">
                <Phone size={13} className="text-[#C9A96E] mt-0.5 shrink-0" />
                <a href="tel:+528717507681" className="hover:text-[#C9A96E] transition-colors duration-300">
                  (871) 750-7681
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#FAF9F6]/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#FAF9F6]/25 font-light tracking-wide">
            © {new Date().getFullYear()} La Rue Salon & Spa. Todos los derechos reservados.
          </p>
          <p className="text-xs text-[#FAF9F6]/25 font-light tracking-wide">
            Torreón, Coahuila, México
          </p>
        </div>
      </div>
    </footer>
  );
}
