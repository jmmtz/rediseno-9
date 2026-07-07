import { ExternalLink, ArrowRight } from 'lucide-react';

const PRODUCTS = [
  {
    id: 'blush-stick',
    name: 'Blush Stick',
    price: 650,
    comparePrice: null,
    image: '/blush_stick.webp',
    tag: null,
    description: 'Color cremoso de larga duración. Se difumina en segundos.',
  },
  {
    id: 'lip-cheek-duo',
    name: 'Lip + Cheek Duo',
    price: 935,
    comparePrice: 1100,
    image: '/lip_and_cheek_duo.webp',
    tag: 'OFERTA',
    description: 'El combo definitivo. Blush Stick + Lipstick al mejor precio.',
  },
  {
    id: 'lip-creme',
    name: 'Lip Créme',
    price: 550,
    comparePrice: null,
    image: '/lip_creme.webp',
    tag: null,
    description: 'Hidratación intensa con acabado cremoso y alto brillo.',
  },
  {
    id: 'lipstick',
    name: 'Lipstick',
    price: 450,
    comparePrice: null,
    image: '/lipstick.webp',
    tag: null,
    description: 'Fórmula de alta pigmentación. Tonos para cada ocasión.',
  },
];

const VALM_URL = 'https://valmcosmetics.org/';

export default function ValmSection() {
  return (
    <section id="valm" className="bg-[#faf9f8]">

      {/* Hero strip */}
      <div className="relative overflow-hidden bg-[#1a1a1a]">
        {/* Background model collage */}
        <div className="absolute inset-0 grid grid-cols-3 opacity-30">
          {['/IMG_4333.jpg', '/IMG_4334.jpg', '/IMG_4335.jpg'].map((src, i) => (
            <div
              key={i}
              className="bg-cover bg-center bg-top"
              style={{ backgroundImage: `url('${src}')` }}
            />
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#1a1a1a] via-[#1a1a1a]/80 to-[#1a1a1a]/60" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <p className="text-[#d4a0a0] tracking-[0.5em] text-xs uppercase mb-4">
            Marca Hermana
          </p>
          <img
            src="/IMG_4328.jpg"
            alt="VALM Cosmetics"
            className="h-16 md:h-24 w-auto object-contain mb-4"
          />
          <p className="text-[#c8b8b8] text-sm tracking-[0.25em] uppercase mb-6">
            Cosmetics — Torreón, MX
          </p>
          <p className="text-white/70 text-base md:text-lg max-w-lg leading-relaxed mb-10">
            Maquillaje de alta pigmentación para quienes no piden permiso.
            Fórmulas premium, tonos cuidados, confianza sin filtros.
          </p>
          <a
            href={VALM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 bg-white text-black font-semibold text-sm px-7 py-3.5 rounded-full hover:bg-[#f5e6e6] transition-colors duration-200 group"
          >
            Comprar en VALM Cosmetics
            <ExternalLink size={15} className="group-hover:translate-x-0.5 transition-transform" />
          </a>
        </div>
      </div>

      {/* Products gallery */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-14">
          <p className="text-[#b08080] tracking-[0.4em] text-xs uppercase mb-3">Colección Actual</p>
          <h2 className="text-[#1a1a1a] text-3xl md:text-4xl font-light">
            La <span className="font-black">Línea VALM</span>
          </h2>
          <p className="text-gray-500 text-sm mt-3 max-w-md mx-auto">
            Cada producto disponible en la tienda oficial. Envío a todo México.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PRODUCTS.map((product) => (
            <a
              key={product.id}
              href={VALM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-[#e8c8c8] hover:shadow-xl transition-all duration-300"
            >
              {/* Product image */}
              <div className="relative aspect-square overflow-hidden bg-[#f8f4f4]">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {product.tag && (
                  <span className="absolute top-3 left-3 bg-[#c8464a] text-white text-[10px] font-black tracking-widest uppercase px-2.5 py-1 rounded-full">
                    {product.tag}
                  </span>
                )}
              </div>

              {/* Product info */}
              <div className="p-5">
                <h3 className="text-[#1a1a1a] font-semibold text-base mb-1">{product.name}</h3>
                <p className="text-gray-400 text-xs leading-relaxed mb-4">{product.description}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-baseline gap-2">
                    <span className="text-[#1a1a1a] font-black text-lg">
                      ${product.price.toLocaleString('es-MX')}
                    </span>
                    {product.comparePrice && (
                      <span className="text-gray-400 line-through text-sm">
                        ${product.comparePrice.toLocaleString('es-MX')}
                      </span>
                    )}
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[#f5eaea] flex items-center justify-center group-hover:bg-[#1a1a1a] transition-colors duration-200">
                    <ArrowRight size={14} className="text-[#1a1a1a] group-hover:text-white transition-colors duration-200" />
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-14 text-center">
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 bg-[#1a1a1a] rounded-2xl px-8 py-7">
            <div className="text-left">
              <p className="text-white font-semibold text-base">¿Lista para tu próximo look?</p>
              <p className="text-white/50 text-sm">Visita la tienda oficial para ver todos los tonos y disponibilidad.</p>
            </div>
            <a
              href={VALM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 inline-flex items-center gap-2 bg-white text-black font-semibold text-sm px-6 py-3 rounded-full hover:bg-[#f5e6e6] transition-colors duration-200 group whitespace-nowrap"
            >
              Comprar en VALM Cosmetics
              <ExternalLink size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>
        </div>
      </div>

      {/* Marquee divider */}
      <div className="bg-[#1a1a1a] py-3 overflow-hidden">
        <div className="flex gap-12 animate-[marquee_25s_linear_infinite] whitespace-nowrap">
          {Array(10).fill(['VALM COSMETICS', 'ALTA PIGMENTACIÓN', 'HECHO PARA TI', 'TORREÓN MX', 'VALMCOSMETICS.ORG']).flat().map((t, i) => (
            <span key={i} className="text-white/40 text-[10px] font-black tracking-widest">{t}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
