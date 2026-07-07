import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import type { CartItem } from '../../types';

const FREE_SHIPPING_THRESHOLD = 999;
const SHIPPING_COST = 120;

interface CartProps {
  items: CartItem[];
  onClose: () => void;
  onUpdateQty: (productId: string, shade: string, qty: number) => void;
  onRemove: (productId: string, shade: string) => void;
  onCheckout: () => void;
}

export default function Cart({ items, onClose, onUpdateQty, onRemove, onCheckout }: CartProps) {
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const total = subtotal + shippingCost;
  const remaining = FREE_SHIPPING_THRESHOLD - subtotal;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="w-full max-w-md bg-[#0a0a0a] border-l border-white/10 flex flex-col h-full shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} className="text-white" />
            <h2 className="text-white font-semibold text-lg">Tu Carrito</h2>
            {items.length > 0 && (
              <span className="bg-white text-black text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {items.reduce((s, i) => s + i.quantity, 0)}
              </span>
            )}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Free shipping bar */}
        {items.length > 0 && subtotal < FREE_SHIPPING_THRESHOLD && (
          <div className="px-6 py-3 bg-white/5 border-b border-white/10">
            <p className="text-gray-400 text-xs mb-1.5">
              Te faltan <span className="text-white font-semibold">${remaining.toLocaleString()} MXN</span> para envío gratis
            </p>
            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100)}%` }}
              />
            </div>
          </div>
        )}
        {items.length > 0 && subtotal >= FREE_SHIPPING_THRESHOLD && (
          <div className="px-6 py-3 bg-green-500/10 border-b border-green-500/20">
            <p className="text-green-400 text-xs font-medium">Envio gratis aplicado!</p>
          </div>
        )}

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {items.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <ShoppingBag size={48} className="text-white/20" />
              <p className="text-gray-500">Tu carrito está vacío</p>
              <button onClick={onClose} className="text-sm text-white underline">Explorar productos</button>
            </div>
          )}
          {items.map((item) => (
            <div key={`${item.product.id}-${item.shade}`} className="flex gap-3">
              <div className="w-20 h-24 rounded-lg overflow-hidden bg-[#111] shrink-0">
                <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{item.product.name}</p>
                {item.shade && <p className="text-gray-500 text-xs">{item.shade}</p>}
                <p className="text-white text-sm font-semibold mt-1">${item.product.price.toLocaleString()}</p>
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => onUpdateQty(item.product.id, item.shade, item.quantity - 1)}
                    className="w-6 h-6 rounded-full border border-white/20 flex items-center justify-center text-white hover:border-white transition-colors"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="text-white text-sm w-4 text-center">{item.quantity}</span>
                  <button
                    onClick={() => onUpdateQty(item.product.id, item.shade, item.quantity + 1)}
                    className="w-6 h-6 rounded-full border border-white/20 flex items-center justify-center text-white hover:border-white transition-colors"
                  >
                    <Plus size={12} />
                  </button>
                  <button
                    onClick={() => onRemove(item.product.id, item.shade)}
                    className="ml-auto text-gray-600 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-white/10 px-6 py-5 space-y-3">
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm text-gray-400">
                <span>Subtotal</span>
                <span>${subtotal.toLocaleString()} MXN</span>
              </div>
              <div className="flex justify-between text-sm text-gray-400">
                <span>Envío</span>
                <span className={shippingCost === 0 ? 'text-green-400' : ''}>
                  {shippingCost === 0 ? 'GRATIS' : `$${shippingCost} MXN`}
                </span>
              </div>
              <div className="flex justify-between text-white font-bold text-lg pt-1 border-t border-white/10">
                <span>Total</span>
                <span>${total.toLocaleString()} MXN</span>
              </div>
            </div>
            <button
              onClick={onCheckout}
              className="w-full bg-white hover:bg-gray-100 text-black font-semibold py-4 rounded-xl transition-all duration-200 active:scale-95 text-sm tracking-wide"
            >
              Proceder al Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
