import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface GalleryPhoto {
  id: string;
  url: string;
  display_order: number;
  category: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  coloracion: 'Coloración',
  corte: 'Corte',
  depilacion: 'Depilación Facial',
  tratamientos: 'Tratamientos Capilares',
  maquillaje: 'Maquillaje y Peinado',
  manos_pies: 'Manos y Pies',
  faciales: 'Faciales y Bienestar',
  general: 'Galería',
};

const CATEGORY_ORDER = ['coloracion', 'corte', 'depilacion', 'tratamientos', 'maquillaje', 'manos_pies', 'faciales', 'general'];

function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.08 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

export default function Gallery() {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const header = useScrollReveal();

  useEffect(() => {
    supabase
      .from('gallery_photos')
      .select('id, url, display_order, category')
      .eq('is_active', true)
      .order('display_order', { ascending: true })
      .then(({ data }) => { if (data) setPhotos(data as GalleryPhoto[]); });
  }, []);

  const grouped = CATEGORY_ORDER
    .map((cat) => ({
      category: cat,
      label: CATEGORY_LABELS[cat] || cat,
      photos: photos.filter((p) => (p.category || 'general') === cat),
    }))
    .filter((g) => g.photos.length > 0);

  return (
    <section id="galeria" className="py-24 lg:py-36 bg-[#F5F2EE]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">

        {/* Header */}
        <div
          ref={header.ref}
          className="mb-20 flex flex-col md:flex-row md:items-end justify-between gap-6"
          style={{
            opacity: header.visible ? 1 : 0,
            transform: header.visible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
          }}
        >
          <div>
            <p className="text-xs tracking-[0.35em] uppercase text-[#8B7355] font-medium mb-4">Nuestro Trabajo</p>
            <h2 className="font-cormorant text-4xl lg:text-6xl font-light text-[#1a1a1a] leading-tight">
              Cada resultado,<br /><em>una historia</em>
            </h2>
          </div>
          <p className="text-sm text-[#5a5a5a] font-light max-w-xs leading-relaxed">
            Una curaduría de transformaciones que hablan por sí solas. El estilo es personal; nosotros lo refinamos.
          </p>
        </div>

        {/* Grouped gallery sections */}
        {grouped.map((group, gi) => {
          const withSpan = group.photos.map((p, i) => ({
            ...p,
            span: (i === 0 || i === 3 || i === 7) ? 'row-span-2' : '',
          }));

          return (
            <div key={group.category} className={gi > 0 ? 'mt-16' : ''}>
              {/* Section divider */}
              <div className="flex items-center gap-4 mb-8">
                <div className="h-px flex-1 bg-[#1a1a1a]/10" />
                <h3 className="font-cormorant text-xl lg:text-2xl font-light text-[#1a1a1a] tracking-wide">
                  {group.label}
                </h3>
                <div className="h-px flex-1 bg-[#1a1a1a]/10" />
              </div>

              {/* Photo grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[200px] md:auto-rows-[220px] gap-3">
                {withSpan.map((photo, i) => (
                  <div
                    key={photo.id}
                    className={`overflow-hidden cursor-pointer group relative ${photo.span}`}
                    style={{
                      opacity: header.visible ? 1 : 0,
                      transform: header.visible ? 'translateY(0)' : 'translateY(20px)',
                      transition: `opacity 0.7s ease-out ${i * 60}ms, transform 0.7s ease-out ${i * 60}ms`,
                    }}
                    onClick={() => setLightbox(photo.url)}
                  >
                    <img
                      src={photo.url}
                      alt={group.label}
                      className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-[#1a1a1a]/0 group-hover:bg-[#1a1a1a]/20 transition-all duration-500" />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 bg-[#1a1a1a]/92 z-50 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-6 right-6 text-white/60 hover:text-white transition-colors"
            onClick={() => setLightbox(null)}
          >
            <X size={24} />
          </button>
          <img
            src={lightbox}
            alt="Gallery"
            className="max-h-[90vh] max-w-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </section>
  );
}
