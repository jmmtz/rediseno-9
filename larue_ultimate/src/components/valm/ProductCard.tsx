import { useState } from 'react';
import { ShoppingBag, Tag } from 'lucide-react';
import type { Product, CartItem } from '../../types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (item: CartItem) => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [selectedShade, setSelectedShade] = useState(product.shades[0] || '');
  const [added, setAdded] = useState(false);

  const isOnSale = product.compare_price != null && product.compare_price > product.price;
  const discountPercent = isOnSale && product.compare_price != null
    ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
    : 0;

  const handleAdd = () => {
    onAddToCart({ product, shade: selectedShade, quantity: 1 });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="group bg-[#111] border border-white/10 hover:border-white/30 rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex flex-col">
      {/* Product image */}
      {/* VALM PRODUCT IMAGE — images pulled from /public folder */}
      <div className="relative overflow-hidden bg-[#0a0a0a] aspect-[3/4]">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        {isOnSale && (
          <div className="absolute top-3 left-3 bg-white text-black text-xs font-black px-2.5 py-1 rounded-sm tracking-wider flex items-center gap-1">
            <Tag size={10} />
            SALE -{discountPercent}%
          </div>
        )}
        <div className="absolute top-3 right-3 bg-black/80 text-white text-[10px] font-medium px-2 py-1 rounded tracking-widest">
          VALM
        </div>
      </div>

      {/* Product info */}
      <div className="p-5 flex flex-col flex-1">
        <p className="text-gray-500 text-[10px] tracking-[0.3em] uppercase mb-1">{product.category}</p>
        <h3 className="text-white font-semibold text-base mb-1">{product.name}</h3>
        <p className="text-gray-500 text-xs leading-relaxed mb-4 flex-1">{product.description}</p>

        {/* Pricing */}
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-white font-bold text-xl">${product.price.toLocaleString()}</span>
          {isOnSale && (
            <span className="text-gray-500 line-through text-sm">${product.compare_price!.toLocaleString()}</span>
          )}
          <span className="text-gray-500 text-xs">MXN</span>
        </div>

        {/* Shade selector */}
        {product.shades.length > 0 && (
          <div className="mb-4">
            <p className="text-gray-500 text-[10px] uppercase tracking-wider mb-2">Tono: <span className="text-white">{selectedShade}</span></p>
            <div className="flex flex-wrap gap-2">
              {product.shades.map((shade) => (
                <button
                  key={shade}
                  onClick={() => setSelectedShade(shade)}
                  className={`px-3 py-1.5 rounded text-xs transition-all duration-200 border ${
                    selectedShade === shade
                      ? 'border-white bg-white text-black font-medium'
                      : 'border-white/20 text-gray-400 hover:border-white/60 hover:text-white'
                  }`}
                >
                  {shade}
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={handleAdd}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all duration-300 ${
            added
              ? 'bg-green-500 text-white'
              : 'bg-white hover:bg-gray-100 text-black active:scale-95'
          }`}
        >
          <ShoppingBag size={16} />
          {added ? 'Agregado' : 'Agregar al Carrito'}
        </button>
      </div>
    </div>
  );
}
