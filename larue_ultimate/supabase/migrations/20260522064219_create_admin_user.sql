/*
  # Create Admin User

  Creates the primary admin account for La Rue Salon & Spa.
  
  Credentials (change after first login):
    Email:    admin@larue.mx
    Password: LaRue2026!

  This inserts directly into auth.users and creates the matching profile.
  The admin role grants full access to the admin dashboard.
*/

DO $$
DECLARE
  admin_uid uuid := gen_random_uuid();
BEGIN
  -- Only insert if admin doesn't already exist
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@larue.mx') THEN
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_app_meta_data,
      raw_user_meta_data,
      aud,
      role
    ) VALUES (
      admin_uid,
      '00000000-0000-0000-0000-000000000000',
      'admin@larue.mx',
      crypt('LaRue2026!', gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Admin La Rue"}',
      'authenticated',
      'authenticated'
    );

    INSERT INTO profiles (id, email, full_name, role)
    VALUES (admin_uid, 'admin@larue.mx', 'Admin La Rue', 'admin');
  END IF;
END $$;
