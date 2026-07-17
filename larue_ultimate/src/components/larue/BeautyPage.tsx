import { useState, useEffect } from 'react';
import { Sparkles, ShoppingBag } from 'lucide-react';

export default function BeautyPage() {
  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="min-h-[70vh] flex items-center justify-center bg-gradient-to-b from-[#F5F2EE] to-[#FAF9F6] px-6">
        <div className="max-w-2xl text-center">
          <div className="inline-flex items-center gap-2 mb-6">
            <Sparkles size={16} className="text-[#8B7355]" />
            <span className="text-xs tracking-[0.35em] uppercase text-[#8B7355] font-medium">LaRue Beauty</span>
            <Sparkles size={16} className="text-[#8B7355]" />
          </div>
          <h1 className="font-cormorant text-5xl lg:text-7xl font-light text-[#1a1a1a] leading-tight mb-6">
            Cosmética<br /><em>artesanal</em>
          </h1>
          <p className="text-sm text-[#5a5a5a] font-light leading-relaxed max-w-md mx-auto mb-10">
            Una colección curada de productos de belleza seleccionados personalmente por nuestro equipo. Próximamente disponible en nuestra tienda en línea.
          </p>
          <div className="inline-flex items-center gap-3 px-6 py-3 border border-[#1a1a1a]/15 bg-white/50">
            <ShoppingBag size={16} className="text-[#8B7355]" />
            <span className="text-xs tracking-[0.2em] uppercase text-[#1a1a1a]/60 font-medium">Próximamente</span>
          </div>
        </div>
      </section>

      {/* Coming soon section */}
      <section className="py-20 px-6 bg-[#FAF9F6]">
        <div className="max-w-4xl mx-auto text-center">
          <div className="h-px w-16 bg-[#C9A96E]/40 mx-auto mb-8" />
          <h2 className="font-cormorant text-3xl lg:text-4xl font-light text-[#1a1a1a] mb-4">
            Estamos preparando algo especial
          </h2>
          <p className="text-sm text-[#5a5a5a] font-light leading-relaxed max-w-lg mx-auto">
            Nuestra tienda de cosméticos estará disponible muy pronto. Mientras tanto, visítanos en el salón para conocer nuestros productos en persona.
          </p>
          <div className="flex items-center justify-center gap-3 mt-8">
            <div className="h-px w-6 bg-[#C9A96E]/50" />
            <span className="text-[10px] tracking-[0.4em] uppercase text-[#8B7355]/70 font-medium">
              LaRue Beauty
            </span>
            <div className="h-px w-6 bg-[#C9A96E]/50" />
          </div>
        </div>
      </section>
    </div>
  );
}
