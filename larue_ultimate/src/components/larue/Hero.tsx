interface HeroProps {
  onBookClick: () => void;
}

export default function Hero({ onBookClick }: HeroProps) {
  return (
    <section id="inicio" className="relative h-screen min-h-[700px] flex overflow-hidden">

      {/* Split background — two images side by side */}
      <div className="absolute inset-0 grid grid-cols-2">
        <div className="relative overflow-hidden">
          <img
            src="/images/bd6b63f1-a623-45a0-96c0-37e7623f914b.JPG"
            alt="La Rue"
            className="w-full h-full object-cover animate-slow-zoom"
          />
        </div>
        <div className="relative overflow-hidden">
          <img
            src="/images/e5c3e012-d00f-4e0d-9819-6daf02d8f5e0.JPG"
            alt="La Rue"
            className="w-full h-full object-cover animate-slow-zoom-delay"
          />
        </div>
      </div>

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-[#1a1a1a]/55" />

      {/* Content */}
      <div className="relative z-10 w-full flex flex-col items-center justify-center text-center px-6">
        <p className="animate-fade-in-up animation-delay-200 text-[#C9A96E] text-xs tracking-[0.4em] uppercase font-medium mb-6">
          Torreón, Coahuila
        </p>

        <h1 className="animate-fade-in-up animation-delay-400 font-cormorant text-white text-5xl md:text-7xl lg:text-8xl font-light leading-none tracking-tight mb-8">
          Donde el estilo<br />
          <span className="italic text-white/85">se convierte en arte</span>
        </h1>

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
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 animate-bounce-slow flex flex-col items-center gap-2">
        <div className="w-px h-10 bg-gradient-to-b from-white/50 to-transparent" />
      </div>
    </section>
  );
}
