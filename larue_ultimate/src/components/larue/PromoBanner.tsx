import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Sparkles, X } from 'lucide-react';
import type { Promotion } from '../../types';

export default function PromoBanner({ onBookClick }: { onBookClick: () => void }) {
  const [promo, setPromo] = useState<Promotion | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    supabase
      .from('promotions')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .then(({ data }) => {
        if (data && data.length > 0) setPromo(data[0] as Promotion);
      });
  }, []);

  if (!promo || dismissed) return null;

  const today = new Date().toISOString().split('T')[0];
  const isExpired = promo.end_date && promo.end_date < today;
  const isFuture = promo.start_date && promo.start_date > today;
  if (isExpired || isFuture) return null;

  let promoText = promo.description || promo.title;
  if (promo.promo_type === 'descuento' && promo.discount_value > 0) {
    const descLabel = promo.discount_type === 'percent' ? `${promo.discount_value}% de descuento` : `$${promo.discount_value} MXN de descuento`;
    promoText = `${promo.title} — ${descLabel}`;
  } else if (promo.promo_type === 'paquete') {
    promoText = `Paquete: ${promo.title}`;
  }

  return (
    <div className="bg-gradient-to-r from-[#8B7355] to-[#5a4a35] text-[#FAF9F6] py-4 px-6 relative">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-4 text-center">
        <Sparkles size={18} className="text-[#C9A96E] shrink-0" />
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
          <span className="text-sm font-light tracking-wide">{promoText}</span>
          <button
            onClick={onBookClick}
            className="text-xs tracking-[0.2em] uppercase bg-[#FAF9F6] text-[#1a1a1a] px-4 py-1.5 font-medium hover:bg-[#C9A96E] hover:text-[#1a1a1a] transition-colors duration-300"
          >
            Aprovechar
          </button>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#FAF9F6]/60 hover:text-[#FAF9F6] transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
