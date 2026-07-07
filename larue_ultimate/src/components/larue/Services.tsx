import { useState, useEffect } from 'react';
import { ChevronDown, Scissors, Sparkles, Hand, Heart, Palette, Star } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Service, Promotion } from '../../types';

const images = {
  color1: '/images/4721a771-2fdb-4184-bd67-6bf5376abd6e.JPG',
  color2: '/images/41745add-f988-4be9-aa1b-9fc96225b06e.JPG',
  color3: '/images/cd827f77-4bbd-4eed-b9aa-32d31137263b.JPG',
  makeup1: '/images/4c8319b3-c30b-41b0-b998-6f860af23de5.JPG',
  makeup2: '/images/7f892cac-94d1-4023-9bc0-b4f5a951822e.JPG',
  makeup3: '/images/76fd356d-6254-4ae0-bcfa-461cc8db4632.JPG',
  cut1: '/images/a3b9c8cd-1ba5-4b82-a08b-94d3b7ec92fe.JPG',
  cut2: '/images/abd52b7c-de27-4c79-a38c-301c8e31d609.JPG',
  style4: '/images/ff725c1d-1c9b-49e4-8b93-0ed4ae470c95.JPG',
  spa1: '/images/940d04e4-3714-4998-92fc-98e0ad3c796c.JPG',
  spa2: '/images/bc15a3dd-da05-4799-9700-2b213c2fc619.JPG',
  style1: '/images/ad0bddf1-ba27-4999-9362-597c2b5f24e3.JPG',
};

const STATIC_SERVICES = [
  {
    id: 'coloracion',
    icon: <Palette size={18} />,
    title: 'Coloración Premium',
    subtitle: 'Balayage · Babylights · Rayos · Color Gloss',
    description: 'Técnicas avanzadas de coloración que respetan la integridad del cabello. Desde balayage natural hasta transformaciones bold, cada resultado es una obra de arte personalizada.',
    images: [images.color1, images.color2, images.color3],
    price: 'Desde $1,200',
  },
  {
    id: 'corte',
    icon: <Scissors size={18} />,
    title: 'Corte & Peinado',
    subtitle: 'Corte · Blow Dry · Styling · Mucota',
    description: 'Cortes de autor que potencian tu estructura facial. Técnicas europeas combinadas con tendencias contemporáneas para un resultado que dure y se adapte a tu estilo de vida.',
    images: [images.cut1, images.cut2, images.style4],
    price: 'Desde $350',
  },
  {
    id: 'maquillaje',
    icon: <Star size={18} />,
    title: 'Maquillaje & Peinado',
    subtitle: 'Nupcial · Editorial · Evento · Dermaplane',
    description: 'Maquillaje de alta costura para tus momentos más importantes. Desde looks naturales hasta composiciones editoriales, con productos de primera línea y técnicas de vanguardia.',
    images: [images.makeup1, images.makeup2, images.makeup3],
    price: 'Desde $800',
  },
  {
    id: 'spa',
    icon: <Sparkles size={18} />,
    title: 'Faciales & Bienestar',
    subtitle: 'Facial · Luz Roja LED · Cama Vibroacústica',
    description: 'Rituales de belleza que trascienden el cuidado convencional. Faciales terapéuticos, terapia sensorial y tecnología de última generación para una piel radiante y un bienestar profundo.',
    images: [images.spa1, images.spa2, images.style1],
    price: 'Desde $600',
  },
];

function useScrollReveal() {
  const [ref, setRef] = useState<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!ref) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.08 }
    );
    obs.observe(ref);
    return () => obs.disconnect();
  }, [ref]);
  return { ref: setRef, visible };
}

interface ServicesProps {
  onBookService: (service: Service) => void;
}

export default function Services({ onBookService }: ServicesProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [activeService, setActiveService] = useState<string | null>(null);
  const header = useScrollReveal();

  useEffect(() => {
    supabase.from('services').select('*').eq('is_active', true).then(({ data }) => {
      if (data) setServices(data);
    });
  }, []);

  const scrollToCitas = () => {
    document.getElementById('citas')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Enrich static services with real Supabase price if available
  const enriched = STATIC_SERVICES.map((svc) => {
    const match = services.find((s) =>
      s.category === svc.id ||
      s.name.toLowerCase().includes(svc.id) ||
      svc.id.includes(s.category)
    );
    return { ...svc, realPrice: match ? `Desde $${match.price_min.toLocaleString()}` : svc.price };
  });

  return (
    <section id="servicios" className="py-24 lg:py-36 bg-[#FAF9F6]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">

        {/* Header */}
        <div
          ref={header.ref}
          className="mb-20"
          style={{
            opacity: header.visible ? 1 : 0,
            transform: header.visible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
          }}
        >
          <p className="text-xs tracking-[0.35em] uppercase text-[#8B7355] font-medium mb-4">Nuestros Servicios</p>
          <h2 className="font-cormorant text-4xl lg:text-6xl font-light text-[#1a1a1a] leading-tight max-w-xl">
            El arte de la<br /><em>belleza auténtica</em>
          </h2>
        </div>

        {/* Accordion */}
        <div className="space-y-0">
          {enriched.map((svc, i) => {
            // Find matching real service for booking
            const realService = services.find((s) =>
              s.category === svc.id || s.name.toLowerCase().includes(svc.id) || svc.id.includes(s.category)
            );

            return (
              <div
                key={svc.id}
                className="border-t border-[#1a1a1a]/10 cursor-pointer"
                style={{
                  opacity: header.visible ? 1 : 0,
                  transform: header.visible ? 'translateY(0)' : 'translateY(20px)',
                  transition: `opacity 0.8s ease-out ${i * 80}ms, transform 0.8s ease-out ${i * 80}ms`,
                }}
                onClick={() => setActiveService(activeService === svc.id ? null : svc.id)}
              >
                {/* Row */}
                <div className="flex items-center justify-between py-7 group">
                  <div className="flex items-center gap-6">
                    <span className="text-[#8B7355] group-hover:scale-110 transition-transform duration-300">{svc.icon}</span>
                    <div>
                      <h3 className="font-cormorant text-2xl lg:text-3xl font-light text-[#1a1a1a] group-hover:text-[#8B7355] transition-colors duration-300">
                        {svc.title}
                      </h3>
                      <p className="text-xs tracking-[0.15em] uppercase text-[#8B7355]/70 mt-1 font-medium">{svc.subtitle}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="hidden md:block font-cormorant text-xl text-[#5a5a5a]">{svc.realPrice}</span>
                    <ChevronDown
                      size={16}
                      className="text-[#1a1a1a]/50 transition-transform duration-500"
                      style={{ transform: activeService === svc.id ? 'rotate(180deg)' : 'rotate(0deg)' }}
                    />
                  </div>
                </div>

                {/* Expanded panel */}
                <div
                  className="overflow-hidden transition-all duration-700 ease-in-out"
                  style={{ maxHeight: activeService === svc.id ? '600px' : '0' }}
                >
                  <div className="pb-10 grid grid-cols-1 lg:grid-cols-5 gap-8">
                    <div className="lg:col-span-2 flex flex-col justify-between">
                      <p className="text-sm text-[#5a5a5a] leading-relaxed font-light">{svc.description}</p>
                      <div className="mt-8">
                        <p className="text-xs tracking-[0.2em] uppercase text-[#8B7355] font-medium mb-2">Precio referencial</p>
                        <p className="font-cormorant text-3xl font-light text-[#1a1a1a]">{svc.realPrice}</p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (realService) {
                              onBookService(realService);
                            } else {
                              scrollToCitas();
                            }
                          }}
                          className="mt-6 inline-flex items-center gap-2 text-xs tracking-[0.2em] uppercase border border-[#1a1a1a] px-8 py-3 hover:bg-[#1a1a1a] hover:text-[#FAF9F6] transition-all duration-300"
                        >
                          Reservar
                        </button>
                      </div>
                    </div>
                    <div className="lg:col-span-3 grid grid-cols-3 gap-3">
                      {svc.images.map((img, j) => (
                        <div key={j} className="overflow-hidden aspect-[3/4]">
                          <img
                            src={img}
                            alt={svc.title}
                            className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-700"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          <div className="border-t border-[#1a1a1a]/10" />
        </div>
      </div>
    </section>
  );
}
