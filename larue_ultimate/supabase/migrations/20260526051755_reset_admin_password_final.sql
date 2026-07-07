/*
  # Reset admin password to a known value
  Sets admin@larue.mx password to: Admin2024!
*/
UPDATE auth.users
SET encrypted_password = crypt('Admin2024!', gen_salt('bf'))
WHERE email = 'admin@larue.mx';