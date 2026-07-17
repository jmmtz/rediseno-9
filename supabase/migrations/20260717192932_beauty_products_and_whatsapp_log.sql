/*
# Beauty products table + WhatsApp message log

1. New Tables
- `beauty_products`: catálogo de productos cosméticos que la dueña administra
  - id, title, description, product_type (texto libre), brand (texto libre), image_url, price, is_active, display_order, created_at
- `whatsapp_messages`: log de mensajes de WhatsApp enviados (confirmación, recordatorio, notificación estilista)
  - id, appointment_id, phone, message_type, template_name, status, sent_at, created_at

2. Security
- beauty_products: RLS enabled, admin-only write (authenticated), public read (anon + authenticated)
- whatsapp_messages: RLS enabled, admin-only access (authenticated)
*/

CREATE TABLE IF NOT EXISTS beauty_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  product_type text,
  brand text,
  image_url text,
  price numeric(10,2) DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE beauty_products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "products_public_read" ON beauty_products;
CREATE POLICY "products_public_read" ON beauty_products FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "products_admin_insert" ON beauty_products;
CREATE POLICY "products_admin_insert" ON beauty_products FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "products_admin_update" ON beauty_products;
CREATE POLICY "products_admin_update" ON beauty_products FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "products_admin_delete" ON beauty_products;
CREATE POLICY "products_admin_delete" ON beauty_products FOR DELETE
  TO authenticated USING (true);


CREATE TABLE IF NOT EXISTS whatsapp_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id uuid,
  phone text NOT NULL,
  message_type text NOT NULL,
  template_name text NOT NULL,
  status text DEFAULT 'pending',
  sent_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "whatsapp_admin_read" ON whatsapp_messages;
CREATE POLICY "whatsapp_admin_read" ON whatsapp_messages FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "whatsapp_admin_insert" ON whatsapp_messages;
CREATE POLICY "whatsapp_admin_insert" ON whatsapp_messages FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "whatsapp_admin_update" ON whatsapp_messages;
CREATE POLICY "whatsapp_admin_update" ON whatsapp_messages FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);
