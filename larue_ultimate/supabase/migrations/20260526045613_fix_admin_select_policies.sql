/*
  # Fix Admin SELECT Policies

  Several tables only have public SELECT policies restricted to `is_active = true`,
  meaning admins cannot see inactive records and PostgREST may return schema errors
  when admin queries hit unexpected RLS evaluation paths.

  This migration adds explicit admin SELECT policies for:
  - services (admins need to see all, including inactive)
  - staff (admins need to see all, including inactive)
  - coupons (admins need to see all, including inactive)
  - promotions (admins need to see all, including inactive)
  - products (admins need to see all, including inactive)

  Security: All policies use the standard admin check via profiles table.
*/

-- services: admin can read all
CREATE POLICY "Admins can read all services"
  ON services FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- staff: admin can read all
CREATE POLICY "Admins can read all staff"
  ON staff FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- coupons: admin can read all
CREATE POLICY "Admins can read all coupons"
  ON coupons FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- promotions: admin can read all
CREATE POLICY "Admins can read all promotions"
  ON promotions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- products: admin can read all
CREATE POLICY "Admins can read all products"
  ON products FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );
