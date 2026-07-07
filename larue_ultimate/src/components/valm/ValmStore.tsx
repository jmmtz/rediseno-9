import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import type { Product, CartItem } from '../../types';
import ProductCard from './ProductCard';

/* VALM STORE hero — VALM model images (girl with VALM headband in black outfit) */
const heroImages = ['/IMG_4335.jpg', '/IMG_4333.jpg', '/IMG_4334.jpg'];

interface ValmStoreProps {
  onAddToCart: (item: CartItem) => void;
}

export default function ValmStore({ onAddToCart }: ValmStoreProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [heroIdx] = useState(0);

  useEffect(() => {
    supabase.from('products').select('*').eq('is_active', true).then(({ data }) => {
      if (data) setProducts(data);
    });
  }, []);

  const categories = ['all', ...Array.from(new Set(products.map((p) => p.category)))];
  const filtered = activeCategory === 'all' ? products : products.filter((p) => p.category === activeCategory);

  return (
    <div className="min-h-screen bg-black text-white">

      {/* VALM Hero */}
      <section className="relative min-h-[85vh] flex items-end pb-20 overflow-hidden">
        {/* VALM MODEL IMAGE HERO — swap heroImages array in gallery constants above */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${heroImages[heroIdx]}')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* VALM logo area — uses official VALM logo (IMG_4328.jpg) */}
          <div className="mb-6">
            <p className="text-gray-400 tracking-[0.5em] text-xs uppercase mb-2">Colección</p>
            <img
              src="/IMG_4328.jpg"
              alt="VALM Cosmetics"
              className="h-20 md:h-28 w-auto object-contain mb-1"
            />
            <p className="text-gray-300 text-sm tracking-[0.3em] uppercase mt-2">Cosmetics</p>
          </div>
          <p className="text-gray-300 text-base md:text-lg max-w-md leading-relaxed">
            Maquillaje de alta pigmentación para quienes no piden permiso.
            Fórmulas premium, tonos cuidados, confianza sin filtros.
          </p>
        </div>

        {/* Marquee strip */}
        <div className="absolute bottom-0 left-0 right-0 bg-white py-2 overflow-hidden">
          <div className="flex gap-12 animate-[marquee_20s_linear_infinite] whitespace-nowrap">
            {Array(8).fill(['VALM COSMETICS', 'ALTA PIGMENTACIÓN', 'HECHO PARA TI', 'TORREÓN MX']).flat().map((t, i) => (
              <span key={i} className="text-black text-xs font-black tracking-widest">{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Products section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <p className="text-gray-500 text-xs tracking-[0.4em] uppercase mb-2">Todos los productos</p>
            <h2 className="text-white text-4xl font-light">La <span className="font-black">Colección</span></h2>
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-medium tracking-wider uppercase transition-all duration-200 border ${
                  activeCategory === cat
                    ? 'bg-white text-black border-white'
                    : 'border-white/20 text-gray-400 hover:border-white/60 hover:text-white'
                }`}
              >
                {cat === 'all' ? 'Todo' : cat === 'lip' ? 'Labial' : cat === 'cheek' ? 'Mejillas' : cat === 'duo' ? 'Duo' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Lip + Cheek Duo featured banner */}
        {filtered.some((p) => p.category === 'duo') && activeCategory === 'all' && (
          <div className="mb-10 rounded-2xl overflow-hidden border border-white/10 relative">
            <div className="grid md:grid-cols-2 gap-0">
              <div className="bg-[#0a0a0a] p-10 flex flex-col justify-center">
                <p className="text-gray-500 text-xs tracking-[0.4em] uppercase mb-2">Mejor Valor</p>
                <h3 className="text-white text-3xl font-black mb-2">Lip + Cheek<br />Duo</h3>
                <p className="text-gray-400 text-sm mb-4 leading-relaxed">El combo definitivo. Blush Stick + Lipstick juntos por un precio especial.</p>
                <div className="flex items-baseline gap-3">
                  <span className="text-white text-3xl font-black">$935</span>
                  <span className="text-gray-500 line-through text-lg">$1,100</span>
                  <span className="bg-white text-black text-xs font-black px-2 py-0.5 rounded">AHORRA $165</span>
                </div>
              </div>
              {/* DUO IMAGE PLACEHOLDER */}
              <div className="aspect-video md:aspect-auto">
                <img src="/lip_and_cheek_duo.webp" alt="Lip + Cheek Duo" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
          ))}
        </div>
      </section>

      {/* VALM Model gallery strip */}
      <section className="py-16 bg-[#050505]">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-gray-500 text-xs tracking-[0.4em] uppercase mb-8 text-center">Úsalo como ellas</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {/* VALM MODEL PHOTOS — girl with VALM headband in black outfit */}
            {['/IMG_4333.jpg', '/IMG_4334.jpg', '/IMG_4335.jpg'].map((src, i) => (
              <div key={i} className="aspect-[3/4] rounded-xl overflow-hidden">
                <img src={src} alt="VALM model" className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-700" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
