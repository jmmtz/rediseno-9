import { useState, useEffect } from 'react';

const SLIDES = [
  '/images/0108ffd1-3140-48e8-994e-cd5cf422e400.JPG',
  '/images/abd52b7c-de27-4c79-a38c-301c8e31d609.JPG',
  '/images/e3cacf9c-255d-45d6-8a06-c9241bb86726.JPG',
  '/images/e5a71c0b-8cbc-47ff-8be2-3ecfd4560672.JPG',
  '/images/41745add-f988-4be9-aa1b-9fc96225b06e.JPG',
  '/images/ff725c1d-1c9b-49e4-8b93-0ed4ae470c95.JPG',
  '/images/cd827f77-4bbd-4eed-b9aa-32d31137263b.JPG',
  '/images/940d04e4-3714-4998-92fc-98e0ad3c796c.JPG',
];

const INTERVAL = 5000;

interface HeroProps {
  onBookClick: () => void;
}

export default function Hero({ onBookClick }: HeroProps) {
  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setPrev(current);
      setTransitioning(true);
      setCurrent(c => (c + 1) % SLIDES.length);
      setTimeout(() => {
        setPrev(null);
        setTransitioning(false);
      }, 1400);
    }, INTERVAL);
    return () => clearInterval(timer);
  }, [current]);

  return (
    <section id="inicio" className="relative h-screen min-h-[700px] flex overflow-hidden">

      {/* Slideshow backgrounds */}
      {SLIDES.map((src, i) => (
        <div
          key={src}
          className="absolute inset-0 transition-opacity duration-[1400ms] ease-in-out"
          style={{
            opacity: i === current ? 1 : i === prev && transitioning ? 0 : 0,
            zIndex: i === current ? 1 : i === prev ? 2 : 0,
          }}
        >
          <img
            src={src}
            alt=""
            className="w-full h-full object-cover"
            style={{
              animation: i === current ? 'slowZoom 14s ease-in-out infinite alternate' : 'none',
            }}
          />
        </div>
      ))}

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-[#1a1a1a]/55" style={{ zIndex: 3 }} />

      {/* Content */}
      <div className="relative flex flex-col items-center justify-center text-center px-6 w-full" style={{ zIndex: 4 }}>

        <p className="animate-fade-in-up animation-delay-200 text-[#C9A96E] text-xs tracking-[0.4em] uppercase font-medium mb-10">
          Torreón, Coahuila
        </p>

        {/* Logo */}
        <div className="animate-fade-in-up animation-delay-400 mb-10">
          <img
            src="/IMG_4562.PNG"
            alt="La Rue Salon & Spa"
            className="h-28 md:h-40 lg:h-52 w-auto object-contain"
            style={{ filter: 'invert(1)', mixBlendMode: 'screen' }}
          />
        </div>

        <p className="animate-fade-in-up animation-delay-600 text-white/60 text-sm md:text-base font-light max-w-md leading-relaxed mb-12">
          Salon & Spa de lujo en Torreón. Cabello, maquillaje, faciales y bienestar en un solo lugar.
        </p>

        <div className="animate-fade-in-up animation-delay-600 flex flex-col sm:flex-row gap-4 items-center">
          <button
            onClick={onBookClick}
            className="text-xs tracking-[0.3em] uppercase bg-[#FAF9F6] text-[#1a1a1a] px-10 py-4 font-medium hover:bg-[#8B7355] hover:text-[#FAF9F6] transition-all duration-500"
          >
            Agendar Cita
          </button>
          <a
            href="#servicios"
            onClick={(e) => { e.preventDefault(); document.getElementById('servicios')?.scrollIntoView({ behavior: 'smooth' }); }}
            className="text-xs tracking-[0.3em] uppercase border border-white/40 text-white/80 px-10 py-4 font-medium hover:border-white hover:text-white transition-all duration-300"
          >
            Nuestros Servicios
          </a>
        </div>

        {/* Slide dots */}
        <div className="absolute bottom-16 flex gap-2">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => { setPrev(current); setTransitioning(true); setCurrent(i); setTimeout(() => { setPrev(null); setTransitioning(false); }, 1400); }}
              className="transition-all duration-300"
              style={{
                width: i === current ? 24 : 6,
                height: 6,
                borderRadius: 3,
                background: i === current ? '#C9A96E' : 'rgba(255,255,255,0.35)',
              }}
            />
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 animate-bounce-slow flex flex-col items-center gap-2" style={{ zIndex: 4 }}>
        <div className="w-px h-10 bg-gradient-to-b from-white/50 to-transparent" />
      </div>
    </section>
  );
}
