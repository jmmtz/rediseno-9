/*
  # Add missing auth identity record for admin user

  Supabase GoTrue requires a row in auth.identities for every user that
  logs in via email/password. The admin user was seeded directly into
  auth.users but without the corresponding identity row, causing
  signInWithPassword to fail with "Invalid login credentials" despite
  the password hash being correct.

  This migration inserts the required email identity record.
*/

DO $$
DECLARE
  v_id uuid := '91bccc1f-4f0f-4845-b665-3045665771ce';
BEGIN
  INSERT INTO auth.identities (
    id,
    user_id,
    provider_id,
    provider,
    identity_data,
    last_sign_in_at,
    created_at,
    updated_at
  )
  VALUES (
    v_id,
    v_id,
    'admin@larue.mx',
    'email',
    jsonb_build_object(
      'sub',            v_id::text,
      'email',          'admin@larue.mx',
      'email_verified', true,
      'provider',       'email'
    ),
    now(),
    now(),
    now()
  )
  ON CONFLICT (provider, provider_id) DO NOTHING;
END $$;
