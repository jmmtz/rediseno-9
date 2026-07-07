import { useState } from 'react';
import { X, CreditCard, CheckCircle, AlertCircle, ChevronLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { CartItem } from '../../types';

const FREE_SHIPPING_THRESHOLD = 999;
const SHIPPING_COST = 120;

interface CustomerSession {
  id: string;
  email: string;
  name: string;
}

interface CheckoutProps {
  items: CartItem[];
  onClose: () => void;
  onSuccess: () => void;
  customerSession?: CustomerSession | null;
}

const MEXICO_STATES = [
  'Aguascalientes','Baja California','Baja California Sur','Campeche','Chiapas',
  'Chihuahua','Ciudad de México','Coahuila','Colima','Durango','Estado de México',
  'Guanajuato','Guerrero','Hidalgo','Jalisco','Michoacán','Morelos','Nayarit',
  'Nuevo León','Oaxaca','Puebla','Querétaro','Quintana Roo','San Luis Potosí',
  'Sinaloa','Sonora','Tabasco','Tamaulipas','Tlaxcala','Veracruz','Yucatán','Zacatecas',
];

export default function Checkout({ items, onClose, onSuccess, customerSession }: CheckoutProps) {
  const subtotal = items.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const total = subtotal + shippingCost;

  const [step, setStep] = useState<'shipping' | 'payment' | 'confirm'>('shipping');
  const [name, setName] = useState(customerSession?.name || '');
  const [email, setEmail] = useState(customerSession?.email || '');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postal, setPostal] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderNumber, setOrderNumber] = useState('');

  const shippingValid = name && email && phone && address && city && state && postal;

  async function placeOrder() {
    if (!cardNumber || cardNumber.replace(/\s/g, '').length < 16) {
      setError('Tarjeta inválida. Use 4242 4242 4242 4242 para prueba.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const orderNum = `ORD-${Math.floor(Math.random() * 900000 + 100000)}`;
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: orderNum,
          customer_name: name,
          customer_email: email,
          customer_phone: phone,
          shipping_address: address,
          shipping_city: city,
          shipping_state: state,
          shipping_postal_code: postal,
          subtotal,
          shipping_cost: shippingCost,
          total,
          payment_status: 'pagado',
          payment_intent_id: `sim_${Date.now()}`,
          fulfillment_status: 'pendiente',
        })
        .select('id, order_number')
        .single();

      if (orderError) throw orderError;

      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.product.id,
        product_name: item.product.name,
        shade: item.shade,
        quantity: item.quantity,
        unit_price: item.product.price,
        total_price: item.product.price * item.quantity,
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      if (itemsError) throw itemsError;

      setOrderNumber(order.order_number);
      setStep('confirm');
    } catch {
      setError('Error al procesar el pedido. Intenta de nuevo.');
    }
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">

        <div className="sticky top-0 bg-[#0a0a0a] border-b border-white/10 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div className="flex items-center gap-3">
            {step === 'payment' && (
              <button onClick={() => setStep('shipping')} className="text-gray-400 hover:text-white transition-colors">
                <ChevronLeft size={20} />
              </button>
            )}
            <h2 className="text-white font-semibold">
              {step === 'shipping' ? 'Datos de Envío' : step === 'payment' ? 'Pago' : 'Pedido Confirmado'}
            </h2>
          </div>
          {step !== 'confirm' && (
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
              <X size={20} />
            </button>
          )}
        </div>

        {step !== 'confirm' && (
          <div className="px-6 pt-4 flex gap-1">
            {(['shipping', 'payment'] as const).map((s, i) => (
              <div key={s} className={`h-1 flex-1 rounded-full transition-all ${i === 0 || step === 'payment' ? 'bg-white' : 'bg-white/20'}`} />
            ))}
          </div>
        )}

        <div className="px-6 py-6">

          {/* Order summary mini */}
          {step !== 'confirm' && (
            <div className="bg-white/5 rounded-xl p-4 mb-6 space-y-1">
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">Tu pedido</p>
              {items.map((item) => (
                <div key={`${item.product.id}-${item.shade}`} className="flex justify-between text-sm">
                  <span className="text-gray-400">{item.product.name} {item.shade ? `(${item.shade})` : ''} x{item.quantity}</span>
                  <span className="text-white">${(item.product.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
              <div className="flex justify-between text-sm pt-2 border-t border-white/10">
                <span className="text-gray-400">Envío</span>
                <span className={shippingCost === 0 ? 'text-green-400' : 'text-white'}>
                  {shippingCost === 0 ? 'GRATIS' : `$${shippingCost}`}
                </span>
              </div>
              <div className="flex justify-between font-bold text-white">
                <span>Total</span>
                <span>${total.toLocaleString()} MXN</span>
              </div>
            </div>
          )}

          {/* SHIPPING */}
          {step === 'shipping' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                {[
                  { label: 'Nombre completo', value: name, set: setName, placeholder: 'Tu nombre completo' },
                  { label: 'Email', value: email, set: setEmail, placeholder: 'correo@ejemplo.com' },
                  { label: 'Teléfono', value: phone, set: setPhone, placeholder: '871 000 0000' },
                  { label: 'Dirección', value: address, set: setAddress, placeholder: 'Calle, número, colonia' },
                  { label: 'Ciudad', value: city, set: setCity, placeholder: 'Ciudad' },
                  { label: 'Código Postal', value: postal, set: setPostal, placeholder: '35000' },
                ].map((field) => (
                  <div key={field.label}>
                    <label className="block text-xs text-gray-500 mb-1">{field.label} *</label>
                    <input
                      value={field.value}
                      onChange={(e) => field.set(e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-white focus:outline-none text-sm"
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Estado *</label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full bg-[#111] border border-white/20 rounded-lg px-4 py-3 text-white focus:border-white focus:outline-none text-sm"
                  >
                    <option value="">Selecciona estado</option>
                    {MEXICO_STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                onClick={() => setStep('payment')}
                disabled={!shippingValid}
                className="w-full bg-white hover:bg-gray-100 disabled:bg-white/10 disabled:text-gray-600 text-black font-semibold py-3 rounded-xl transition-all duration-200"
              >
                Continuar al Pago
              </button>
            </div>
          )}

          {/* PAYMENT */}
          {step === 'payment' && (
            <div className="space-y-4">
              <p className="text-gray-400 text-xs flex items-center gap-1.5">
                <CreditCard size={14} />
                Pago seguro (modo sandbox — use 4242 4242 4242 4242)
              </p>
              <input
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                placeholder="4242 4242 4242 4242"
                maxLength={19}
                className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-white focus:outline-none text-sm font-mono"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  value={cardExpiry}
                  onChange={(e) => setCardExpiry(e.target.value)}
                  placeholder="MM/AA"
                  maxLength={5}
                  className="bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-white focus:outline-none text-sm"
                />
                <input
                  value={cardCvc}
                  onChange={(e) => setCardCvc(e.target.value)}
                  placeholder="CVC"
                  maxLength={4}
                  className="bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-white focus:outline-none text-sm"
                />
              </div>
              {error && (
                <p className="text-red-400 text-xs flex items-center gap-1">
                  <AlertCircle size={12} /> {error}
                </p>
              )}
              <button
                onClick={placeOrder}
                disabled={loading}
                className="w-full bg-white hover:bg-gray-100 disabled:bg-white/20 disabled:text-gray-600 text-black font-semibold py-4 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Procesando...</>
                ) : `Pagar $${total.toLocaleString()} MXN`}
              </button>
            </div>
          )}

          {/* CONFIRM */}
          {step === 'confirm' && (
            <div className="text-center space-y-6 py-6">
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center">
                  <CheckCircle size={40} className="text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-white text-xl font-semibold mb-2">Pedido Confirmado</h3>
                <p className="text-gray-400 text-sm">Orden #{orderNumber}</p>
                <p className="text-gray-500 text-sm mt-2">
                  Recibirás un correo de confirmación en {email}.<br />
                  Tu pedido será enviado a {city}, {state}.
                </p>
              </div>
              <button
                onClick={() => { onSuccess(); onClose(); }}
                className="w-full bg-white hover:bg-gray-100 text-black font-semibold py-3 rounded-xl transition-colors"
              >
                Continuar comprando
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
