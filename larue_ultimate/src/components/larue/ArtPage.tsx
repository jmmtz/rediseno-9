import { Palette } from 'lucide-react';

export default function ArtPage() {
  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="min-h-[70vh] flex items-center justify-center bg-gradient-to-b from-[#F5F2EE] to-[#FAF9F6] px-6">
        <div className="max-w-2xl text-center">
          <div className="inline-flex items-center gap-2 mb-6">
            <Palette size={16} className="text-[#8B7355]" />
            <span className="text-xs tracking-[0.35em] uppercase text-[#8B7355] font-medium">LaRue Art</span>
          </div>
          <h1 className="font-cormorant text-5xl lg:text-7xl font-light text-[#1a1a1a] leading-tight mb-6">
            Arte que<br /><em>cuenta historias</em>
          </h1>
          <p className="text-sm text-[#5a5a5a] font-light leading-relaxed max-w-md mx-auto mb-10">
            Una colección de piezas originales creadas con pasión. Pronto podrás explorar y adquirir nuestras obras desde aquí.
          </p>
          <div className="inline-flex items-center gap-3 px-6 py-3 border border-[#1a1a1a]/15 bg-white/50">
            <Palette size={16} className="text-[#8B7355]" />
            <span className="text-xs tracking-[0.2em] uppercase text-[#1a1a1a]/60 font-medium">Visítanos pronto</span>
          </div>
        </div>
      </section>

      {/* Coming soon */}
      <section className="py-20 px-6 bg-[#FAF9F6]">
        <div className="max-w-4xl mx-auto text-center">
          <div className="h-px w-16 bg-[#C9A96E]/40 mx-auto mb-8" />
          <h2 className="font-cormorant text-3xl lg:text-4xl font-light text-[#1a1a1a] mb-4">
            Aún no tenemos piezas disponibles
          </h2>
          <p className="text-sm text-[#5a5a5a] font-light leading-relaxed max-w-lg mx-auto">
            Estamos trabajando en nuestra colección de arte. Visítanos pronto para descubrir las nuevas creaciones que estarán disponibles.
          </p>
          <div className="flex items-center justify-center gap-3 mt-8">
            <div className="h-px w-6 bg-[#C9A96E]/50" />
            <span className="text-[10px] tracking-[0.4em] uppercase text-[#8B7355]/70 font-medium">
              LaRue Art
            </span>
            <div className="h-px w-6 bg-[#C9A96E]/50" />
          </div>
        </div>
      </section>
    </div>
  );
}
