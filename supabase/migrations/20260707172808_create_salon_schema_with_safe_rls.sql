-- ============================================================
-- PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text DEFAULT '',
  phone text DEFAULT '',
  role text NOT NULL DEFAULT 'client' CHECK (role IN ('admin', 'client')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can read all profiles"
  ON profiles FOR SELECT TO authenticated
  USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE TO authenticated
  USING (public.get_current_user_role() = 'admin')
  WITH CHECK (public.get_current_user_role() = 'admin');

-- ============================================================
-- STAFF
-- ============================================================
CREATE TABLE IF NOT EXISTS staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  specialty text DEFAULT '',
  avatar_url text DEFAULT '',
  is_active boolean DEFAULT true,
  shift_start time DEFAULT '09:00',
  shift_end time DEFAULT '19:00',
  days_off integer[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE staff ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active staff"
  ON staff FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage staff"
  ON staff FOR INSERT TO authenticated
  WITH CHECK (public.get_current_user_role() = 'admin');

CREATE POLICY "Admins can update staff"
  ON staff FOR UPDATE TO authenticated
  USING (public.get_current_user_role() = 'admin')
  WITH CHECK (public.get_current_user_role() = 'admin');

CREATE POLICY "Admins can delete staff"
  ON staff FOR DELETE TO authenticated
  USING (public.get_current_user_role() = 'admin');

-- ============================================================
-- SERVICES
-- ============================================================
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text DEFAULT 'general',
  description text DEFAULT '',
  price_min numeric(10,2) DEFAULT 0,
  price_max numeric(10,2) DEFAULT 0,
  duration_minutes integer DEFAULT 60,
  maintenance_days integer DEFAULT 30,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active services"
  ON services FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage services"
  ON services FOR INSERT TO authenticated
  WITH CHECK (public.get_current_user_role() = 'admin');

CREATE POLICY "Admins can update services"
  ON services FOR UPDATE TO authenticated
  USING (public.get_current_user_role() = 'admin')
  WITH CHECK (public.get_current_user_role() = 'admin');

CREATE POLICY "Admins can delete services"
  ON services FOR DELETE TO authenticated
  USING (public.get_current_user_role() = 'admin');

-- ============================================================
-- APPOINTMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  client_name text NOT NULL,
  client_phone text NOT NULL,
  client_email text DEFAULT '',
  service_id uuid REFERENCES services(id) ON DELETE SET NULL,
  service_name text NOT NULL,
  staff_id uuid REFERENCES staff(id) ON DELETE SET NULL,
  staff_name text DEFAULT 'Cualquier Profesional',
  appointment_date date NOT NULL,
  appointment_time time NOT NULL,
  status text NOT NULL DEFAULT 'confirmada' CHECK (status IN ('confirmada','completada','cancelada','no_show','pendiente')),
  payment_status text DEFAULT 'pendiente' CHECK (payment_status IN ('pendiente','pagado','reembolsado')),
  payment_amount numeric(10,2) DEFAULT 0,
  payment_intent_id text DEFAULT '',
  coupon_code text DEFAULT '',
  coupon_discount numeric(10,2) DEFAULT 0,
  notes text DEFAULT '',
  cancellation_reason text DEFAULT '',
  notified_cancellation boolean DEFAULT false,
  auto_completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can read own appointments"
  ON appointments FOR SELECT TO authenticated
  USING (client_id = auth.uid());

CREATE POLICY "Anyone can insert appointments"
  ON appointments FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can read all appointments"
  ON appointments FOR SELECT TO authenticated
  USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Admins can insert appointments"
  ON appointments FOR INSERT TO authenticated
  WITH CHECK (public.get_current_user_role() = 'admin');

CREATE POLICY "Admins can update appointments"
  ON appointments FOR UPDATE TO authenticated
  USING (public.get_current_user_role() = 'admin')
  WITH CHECK (public.get_current_user_role() = 'admin');

-- ============================================================
-- COUPONS
-- ============================================================
CREATE TABLE IF NOT EXISTS coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  discount_type text NOT NULL DEFAULT 'flat' CHECK (discount_type IN ('flat','percent')),
  discount_value numeric(10,2) NOT NULL DEFAULT 0,
  service_id uuid REFERENCES services(id) ON DELETE SET NULL,
  max_uses integer DEFAULT NULL,
  used_count integer DEFAULT 0,
  expires_at timestamptz DEFAULT NULL,
  is_maintenance_coupon boolean DEFAULT false,
  requires_full_payment boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active coupons"
  ON coupons FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage coupons"
  ON coupons FOR INSERT TO authenticated
  WITH CHECK (public.get_current_user_role() = 'admin');

CREATE POLICY "Admins can update coupons"
  ON coupons FOR UPDATE TO authenticated
  USING (public.get_current_user_role() = 'admin')
  WITH CHECK (public.get_current_user_role() = 'admin');

CREATE POLICY "Admins can delete coupons"
  ON coupons FOR DELETE TO authenticated
  USING (public.get_current_user_role() = 'admin');

-- ============================================================
-- PROMOTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS promotions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  promo_type text NOT NULL DEFAULT 'banner' CHECK (promo_type IN ('banner','badge','combo','happy_hour','free_upgrade')),
  discount_type text DEFAULT 'percent' CHECK (discount_type IN ('flat','percent')),
  discount_value numeric(10,2) DEFAULT 0,
  original_price numeric(10,2) DEFAULT 0,
  promo_price numeric(10,2) DEFAULT 0,
  applicable_days integer[] DEFAULT '{1,2,3,4,5,6,7}',
  start_time time DEFAULT NULL,
  end_time time DEFAULT NULL,
  service_ids uuid[] DEFAULT '{}',
  is_active boolean DEFAULT true,
  display_badge boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active promotions"
  ON promotions FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage promotions"
  ON promotions FOR INSERT TO authenticated
  WITH CHECK (public.get_current_user_role() = 'admin');

CREATE POLICY "Admins can update promotions"
  ON promotions FOR UPDATE TO authenticated
  USING (public.get_current_user_role() = 'admin')
  WITH CHECK (public.get_current_user_role() = 'admin');

CREATE POLICY "Admins can delete promotions"
  ON promotions FOR DELETE TO authenticated
  USING (public.get_current_user_role() = 'admin');

-- ============================================================
-- APP SETTINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS app_settings (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read app settings"
  ON app_settings FOR SELECT
  USING (true);

CREATE POLICY "Admins can update app settings"
  ON app_settings FOR UPDATE TO authenticated
  USING (public.get_current_user_role() = 'admin')
  WITH CHECK (public.get_current_user_role() = 'admin');

CREATE POLICY "Admins can insert app settings"
  ON app_settings FOR INSERT TO authenticated
  WITH CHECK (public.get_current_user_role() = 'admin');

INSERT INTO app_settings (key, value) VALUES
  ('traffic_mode', 'low')
ON CONFLICT (key) DO NOTHING;
