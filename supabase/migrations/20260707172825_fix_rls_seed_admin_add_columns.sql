-- AUTO-PROFILE TRIGGER
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

-- FIX PROFILES INSERT POLICY
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

-- SEED ADMIN USER
DO $$
DECLARE
  admin_uid uuid;
BEGIN
  SELECT id INTO admin_uid FROM auth.users WHERE email = 'admin@larue.mx';

  IF admin_uid IS NULL THEN
    admin_uid := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
    ) VALUES (
      admin_uid,
      '00000000-0000-0000-0000-000000000000',
      'admin@larue.mx',
      crypt('Admin2024!', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Admin"}',
      now(), now(), 'authenticated', 'authenticated'
    );

    INSERT INTO auth.identities (
      id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, provider_id
    ) VALUES (
      gen_random_uuid(),
      admin_uid,
      jsonb_build_object('sub', admin_uid::text, 'email', 'admin@larue.mx'),
      'email', now(), now(), now(), 'admin@larue.mx'
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = crypt('Admin2024!', gen_salt('bf')),
        email_confirmed_at = COALESCE(email_confirmed_at, now()),
        updated_at = now()
    WHERE id = admin_uid;
  END IF;

  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (admin_uid, 'admin@larue.mx', 'Admin', 'admin')
  ON CONFLICT (id) DO UPDATE
    SET role = 'admin',
        full_name = COALESCE(NULLIF(profiles.full_name, ''), 'Admin');
END $$;

-- ADD service_ids TO STAFF
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'staff' AND column_name = 'service_ids'
  ) THEN
    ALTER TABLE public.staff ADD COLUMN service_ids uuid[] DEFAULT '{}';
  END IF;
END $$;

INSERT INTO public.app_settings (key, value)
VALUES ('traffic_fee', '200')
ON CONFLICT (key) DO NOTHING;
