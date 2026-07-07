/*
  # Fix RLS + Seed Admin, Services & Staff

  ## Summary

  1. FIX PROFILES RLS — The INSERT policy uses `WITH CHECK (auth.uid() = id)`.
     After signUp() the user is immediately authenticated so auth.uid() matches,
     BUT Supabase may occasionally call this before the JWT propagates.
     We add a SECURITY DEFINER trigger function `handle_new_user` that auto-creates
     the profile row on auth.users INSERT, bypassing RLS entirely for the initial
     insert. The frontend INSERT still works as a fallback (duplicate-key is ignored).

  2. SEED ADMIN USER — Creates admin@larue.mx in auth.users via Supabase's
     internal helper and ensures the profiles row has role='admin'.

  3. SEED SERVICES — Inserts default salon services with is_active = true.

  4. SEED STAFF — Inserts 2 default staff members with is_active = true.
*/

-- ============================================================
-- 1. AUTO-PROFILE TRIGGER (bypasses RLS on signup)
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    'client'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 2. ENSURE PROFILES INSERT POLICY EXISTS (belt-and-suspenders)
-- ============================================================
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

-- ============================================================
-- 3. SEED ADMIN USER
--    Uses Supabase's internal auth schema to upsert the admin
--    account. Password hash is bcrypt for "Admin2024!".
-- ============================================================
DO $$
DECLARE
  admin_uid uuid;
BEGIN
  -- Check if admin user already exists
  SELECT id INTO admin_uid FROM auth.users WHERE email = 'admin@larue.mx';

  IF admin_uid IS NULL THEN
    -- Insert new admin user with a known password hash for Admin2024!
    admin_uid := gen_random_uuid();
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      role,
      aud
    ) VALUES (
      admin_uid,
      '00000000-0000-0000-0000-000000000000',
      'admin@larue.mx',
      crypt('Admin2024!', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Admin"}',
      now(),
      now(),
      'authenticated',
      'authenticated'
    );

    -- Also insert into auth.identities so login works
    INSERT INTO auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at,
      provider_id
    ) VALUES (
      gen_random_uuid(),
      admin_uid,
      jsonb_build_object('sub', admin_uid::text, 'email', 'admin@larue.mx'),
      'email',
      now(),
      now(),
      now(),
      'admin@larue.mx'
    );
  ELSE
    -- Admin exists — just update the password
    UPDATE auth.users
    SET encrypted_password = crypt('Admin2024!', gen_salt('bf')),
        email_confirmed_at = COALESCE(email_confirmed_at, now()),
        updated_at = now()
    WHERE id = admin_uid;
  END IF;

  -- Upsert profile with admin role
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (admin_uid, 'admin@larue.mx', 'Admin', 'admin')
  ON CONFLICT (id) DO UPDATE
    SET role = 'admin',
        full_name = COALESCE(NULLIF(profiles.full_name, ''), 'Admin');
END $$;

-- ============================================================
-- 4. SEED DEFAULT SERVICES
-- ============================================================
INSERT INTO public.services (name, category, description, price_min, price_max, duration_minutes, maintenance_days, is_active)
VALUES
  ('Corte de Cabello', 'hair', 'Corte personalizado según tu estilo y estructura facial.', 200, 350, 45, 30, true),
  ('Tinte Completo', 'hair', 'Coloración completa con productos de alta calidad. Incluye tratamiento.', 600, 1200, 120, 45, true),
  ('Mechas / Balayage', 'hair', 'Técnica de decoloración para un efecto natural luminoso.', 800, 1800, 150, 60, true),
  ('Peinado de Fiesta', 'hair', 'Peinados elegantes para eventos especiales, bodas y quinceañeras.', 400, 700, 60, 0, true),
  ('Tratamiento Keratina', 'hair', 'Alisado semipermanente que elimina el frizz por hasta 3 meses.', 1200, 2200, 180, 90, true),
  ('Manicure', 'nails', 'Limpieza, forma y esmalte de uñas de manos.', 150, 250, 45, 21, true),
  ('Pedicure', 'nails', 'Cuidado completo de uñas de pies con exfoliación.', 180, 280, 60, 21, true),
  ('Uñas en Gel', 'nails', 'Extensiones o aplicación de gel de larga duración.', 350, 550, 75, 21, true),
  ('Depilación con Cera', 'spa', 'Depilación corporal suave y duradera con cera tibia.', 100, 400, 30, 28, true),
  ('Maquillaje Profesional', 'makeup', 'Maquillaje artístico para cualquier ocasión.', 400, 800, 60, 0, true)
ON CONFLICT DO NOTHING;

-- ============================================================
-- 5. SEED DEFAULT STAFF
-- ============================================================
INSERT INTO public.staff (name, specialty, is_active, shift_start, shift_end, days_off)
VALUES
  ('Valeria Morales', 'Colorista & Estilista', true, '09:00', '19:00', '{0}'),
  ('Daniela Reyes', 'Uñas & Spa', true, '10:00', '19:00', '{0,1}')
ON CONFLICT DO NOTHING;
