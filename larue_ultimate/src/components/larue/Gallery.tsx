import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

const galleryImages = [
  { src: '/images/e3cacf9c-255d-45d6-8a06-c9241bb86726.JPG', span: 'row-span-2' },
  { src: '/images/4c8319b3-c30b-41b0-b998-6f860af23de5.JPG' },
  { src: '/images/4721a771-2fdb-4184-bd67-6bf5376abd6e.JPG' },
  { src: '/images/a3b9c8cd-1ba5-4b82-a08b-94d3b7ec92fe.JPG', span: 'row-span-2' },
  { src: '/images/7f892cac-94d1-4023-9bc0-b4f5a951822e.JPG' },
  { src: '/images/ff725c1d-1c9b-49e4-8b93-0ed4ae470c95.JPG' },
  { src: '/images/bc15a3dd-da05-4799-9700-2b213c2fc619.JPG' },
  { src: '/images/cd827f77-4bbd-4eed-b9aa-32d31137263b.JPG' },
  { src: '/images/abd52b7c-de27-4c79-a38c-301c8e31d609.JPG' },
  { src: '/images/940d04e4-3714-4998-92fc-98e0ad3c796c.JPG' },
];

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
  const [lightbox, setLightbox] = useState<string | null>(null);
  const header = useScrollReveal();

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

        {/* Grid editorial */}
        <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[200px] md:auto-rows-[220px] gap-3">
          {galleryImages.map((img, i) => (
            <div
              key={i}
              className={`overflow-hidden cursor-pointer group relative ${img.span ?? ''}`}
              style={{
                opacity: header.visible ? 1 : 0,
                transform: header.visible ? 'translateY(0)' : 'translateY(20px)',
                transition: `opacity 0.7s ease-out ${i * 60}ms, transform 0.7s ease-out ${i * 60}ms`,
              }}
              onClick={() => setLightbox(img.src)}
            >
              <img
                src={img.src}
                alt="La Rue"
                className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-[#1a1a1a]/0 group-hover:bg-[#1a1a1a]/20 transition-all duration-500" />
            </div>
          ))}
        </div>
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
