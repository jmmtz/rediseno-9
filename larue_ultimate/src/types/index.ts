export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: 'admin' | 'client';
  created_at: string;
}

export interface Staff {
  id: string;
  name: string;
  specialty: string;
  avatar_url: string;
  is_active: boolean;
  shift_start: string;
  shift_end: string;
  days_off: number[];
  phone: string;
  created_at: string;
}

export interface Service {
  id: string;
  name: string;
  category: string;
  description: string;
  price_min: number;
  price_max: number;
  duration_minutes: number;
  maintenance_days: number;
  is_active: boolean;
  created_at: string;
}

export interface Appointment {
  id: string;
  client_id: string | null;
  client_name: string;
  client_phone: string;
  client_email: string;
  service_id: string | null;
  service_name: string;
  staff_id: string | null;
  staff_name: string;
  appointment_date: string;
  appointment_time: string;
  status: 'confirmada' | 'completada' | 'cancelada' | 'no_show' | 'pendiente';
  payment_status: 'pendiente' | 'pagado' | 'reembolsado';
  payment_amount: number;
  payment_intent_id: string;
  coupon_code: string;
  coupon_discount: number;
  notes: string;
  cancellation_reason: string;
  notified_cancellation: boolean;
  auto_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: 'flat' | 'percent';
  discount_value: number;
  service_id: string | null;
  max_uses: number | null;
  used_count: number;
  expires_at: string | null;
  is_maintenance_coupon: boolean;
  requires_full_payment: boolean;
  is_active: boolean;
  created_at: string;
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  promo_type: 'banner' | 'badge' | 'combo' | 'happy_hour' | 'free_upgrade';
  discount_type: 'flat' | 'percent';
  discount_value: number;
  original_price: number;
  promo_price: number;
  applicable_days: number[];
  start_time: string | null;
  end_time: string | null;
  service_ids: string[];
  is_active: boolean;
  display_badge: boolean;
  created_at: string;
}

export type TrafficMode = 'low' | 'medium' | 'high';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  is_active: boolean;
  display_order: number;
  shades: string[];
  compare_price?: number;
  created_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  shade: string;
}
