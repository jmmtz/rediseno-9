import { useState, useEffect } from 'react';
import { ChevronDown, Scissors, Sparkles, Hand, Heart, Palette, Star, Droplets } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Service } from '../../types';

const images = {
  color1: '/images/4721a771-2fdb-4184-bd67-6bf5376abd6e.JPG',
  color2: '/images/41745add-f988-4be9-aa1b-9fc96225b06e.JPG',
  color3: '/images/cd827f77-4bbd-4eed-b9aa-32d31137263b.JPG',
  makeup1: '/images/4c8319b3-c30b-41b0-b998-6f860af23de5.JPG',
  makeup2: '/images/7f892cac-94d1-4023-9bc0-b4f5a951822e.JPG',
  makeup3: '/images/76fd356d-6254-4ae0-bcfa-461cc8db4632.JPG',
  cut1: '/images/a3b9c8cd-1ba5-4b82-a08b-94d3b7ec92fe.JPG',
  cut2: '/images/abd52b7c-de27-4c79-a38c-301c8e31d609.JPG',
  spa1: '/images/940d04e4-3714-4998-92fc-98e0ad3c796c.JPG',
  spa2: '/images/bc15a3dd-da05-4799-9700-2b213c2fc619.JPG',
  style1: '/images/ad0bddf1-ba27-4999-9362-597c2b5f24e3.JPG',
  style2: '/images/ff725c1d-1c9b-49e4-8b93-0ed4ae470c95.JPG',
};

interface ServiceGroup {
  id: string;
  icon: React.ReactNode;
  title: string;
  categories: string[];
  previewImages: string[];
  subGroups?: { label: string; category: string }[];
}

const SERVICE_GROUPS: ServiceGroup[] = [
  {
    id: 'coloracion',
    icon: <Palette size={18} />,
    title: 'Coloración Premium',
    categories: ['coloracion'],
    previewImages: [images.color1, images.color2, images.color3],
  },
  {
    id: 'corte',
    icon: <Scissors size={18} />,
    title: 'Corte',
    categories: ['corte'],
    previewImages: [images.cut1, images.cut2, images.style2],
  },
  {
    id: 'depilacion',
    icon: <Sparkles size={18} />,
    title: 'Depilaciones',
    categories: ['depilacion'],
    previewImages: [images.spa1, images.spa2, images.style1],
  },
  {
    id: 'tratamientos',
    icon: <Droplets size={18} />,
    title: 'Tratamientos Capilares',
    categories: ['tratamiento_hidratante', 'tratamiento_antifreeze'],
    previewImages: [images.color2, images.color3, images.style1],
    subGroups: [
      { label: 'Hidratantes', category: 'tratamiento_hidratante' },
      { label: 'Antifreeze', category: 'tratamiento_antifreeze' },
    ],
  },
  {
    id: 'maquillaje',
    icon: <Star size={18} />,
    title: 'Maquillaje y Peinado',
    categories: ['maquillaje'],
    previewImages: [images.makeup1, images.makeup2, images.makeup3],
  },
  {
    id: 'manos_pies',
    icon: <Hand size={18} />,
    title: 'Manos y Pies',
    categories: ['manos_pies'],
    previewImages: [images.spa1, images.spa2, images.style1],
  },
  {
    id: 'faciales',
    icon: <Heart size={18} />,
    title: 'Faciales y Bienestar',
    categories: ['facial'],
    previewImages: [images.spa1, images.spa2, images.style1],
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
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const header = useScrollReveal();

  useEffect(() => {
    supabase.from('services').select('*').eq('is_active', true).then(({ data }) => {
      if (data) setServices(data);
    });
  }, []);

  function getServices(categories: string[]) {
    return services.filter((s) => categories.includes(s.category));
  }

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
          {SERVICE_GROUPS.map((group, i) => {
            const isOpen = activeGroup === group.id;
            const groupServices = getServices(group.categories);

            return (
              <div
                key={group.id}
                className="border-t border-[#1a1a1a]/10"
                style={{
                  opacity: header.visible ? 1 : 0,
                  transform: header.visible ? 'translateY(0)' : 'translateY(20px)',
                  transition: `opacity 0.8s ease-out ${i * 80}ms, transform 0.8s ease-out ${i * 80}ms`,
                }}
              >
                {/* Category row */}
                <div
                  className="flex items-center justify-between py-7 cursor-pointer group"
                  onClick={() => setActiveGroup(isOpen ? null : group.id)}
                >
                  <div className="flex items-center gap-6">
                    <span className="text-[#8B7355] group-hover:scale-110 transition-transform duration-300">{group.icon}</span>
                    <h3 className="font-cormorant text-2xl lg:text-3xl font-light text-[#1a1a1a] group-hover:text-[#8B7355] transition-colors duration-300">
                      {group.title}
                    </h3>
                  </div>
                  <ChevronDown
                    size={16}
                    className="text-[#1a1a1a]/50 transition-transform duration-500"
                    style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  />
                </div>

                {/* Expanded panel */}
                <div
                  className="overflow-hidden transition-all duration-700 ease-in-out"
                  style={{ maxHeight: isOpen ? '800px' : '0' }}
                >
                  <div className="pb-10 grid grid-cols-1 lg:grid-cols-5 gap-8">
                    {/* Services list */}
                    <div className="lg:col-span-2">
                      {group.subGroups ? (
                        group.subGroups.map((sub) => {
                          const subServices = services.filter((s) => s.category === sub.category);
                          return (
                            <div key={sub.label} className="mb-5">
                              <p className="text-xs tracking-[0.2em] uppercase text-[#8B7355] font-medium mb-2">{sub.label}</p>
                              <div className="space-y-2">
                                {subServices.map((svc) => (
                                  <ServiceButton key={svc.id} service={svc} onBook={onBookService} />
                                ))}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="space-y-2">
                          {groupServices.map((svc) => (
                            <ServiceButton key={svc.id} service={svc} onBook={onBookService} />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Preview images */}
                    <div className="lg:col-span-3 grid grid-cols-3 gap-3">
                      {group.previewImages.map((img, j) => (
                        <div key={j} className="overflow-hidden aspect-[3/4]">
                          <img
                            src={img}
                            alt={group.title}
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

function ServiceButton({ service, onBook }: { service: Service; onBook: (s: Service) => void }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onBook(service); }}
      className="w-full text-left group/svc flex items-center justify-between px-4 py-3 border border-[#1a1a1a]/10 hover:border-[#1a1a1a] hover:bg-[#1a1a1a] transition-all duration-200"
    >
      <span className="text-sm text-[#1a1a1a] group-hover/svc:text-[#FAF9F6] font-medium transition-colors duration-200">
        {service.name}
      </span>
      <div className="flex items-center gap-3 shrink-0">
        {service.price_min > 0 && (
          <span className="text-xs text-[#5a5a5a] group-hover/svc:text-[#FAF9F6]/60 transition-colors duration-200">
            ${service.price_min.toLocaleString()}
          </span>
        )}
        <span className="text-xs tracking-[0.15em] uppercase text-[#8B7355] group-hover/svc:text-[#FAF9F6]/60 transition-colors duration-200">
          Reservar
        </span>
      </div>
    </button>
  );
}
