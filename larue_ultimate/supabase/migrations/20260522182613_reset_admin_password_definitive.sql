/*
  # Definitive admin password reset

  Uses pgcrypto crypt() with bcrypt to set a fresh known-good hash for LaRue2026!
  Also ensures the auth.users row has all required fields set correctly for
  Supabase Auth to accept the signInWithPassword call.
*/

DO $$
DECLARE
  v_id uuid;
  v_hash text;
BEGIN
  SELECT id INTO v_id FROM auth.users WHERE email = 'admin@larue.mx';

  IF v_id IS NULL THEN
    RAISE EXCEPTION 'Admin user not found in auth.users';
  END IF;

  -- Generate a fresh bcrypt hash at cost factor 10 (Supabase default)
  v_hash := crypt('LaRue2026!', gen_salt('bf', 10));

  -- Update every auth field that could block a login
  UPDATE auth.users SET
    encrypted_password  = v_hash,
    aud                 = 'authenticated',
    role                = 'authenticated',
    email_confirmed_at  = COALESCE(email_confirmed_at, now()),
    confirmation_token  = '',
    recovery_token      = '',
    banned_until        = NULL,
    deleted_at          = NULL,
    updated_at          = now()
  WHERE id = v_id;

  -- Ensure profile row exists with role=admin
  INSERT INTO profiles (id, email, full_name, phone, role, created_at)
  VALUES (v_id, 'admin@larue.mx', 'Admin La Rue', '', 'admin', now())
  ON CONFLICT (id) DO UPDATE
    SET role = 'admin', email = 'admin@larue.mx';

  RAISE NOTICE 'Admin password reset. Hash: %', left(v_hash, 20);
END $$;
