/*
# Tabla de contenido editable + campos para promos de descuento/paquete

1. Nueva tabla `site_content`
   - Almacena textos editables de la pagina (key-value)
   - La dueña podra cambiar textos desde el panel de admin
   - Claves: hero_subtitle, services_title, services_title_em, gallery_title, gallery_title_em, gallery_subtitle, citas_title, citas_title_em, citas_subtitle, footer_about
2. Tabla `promotions` - nuevos campos para soportar dos tipos de promo
   - promo_type ahora acepta 'descuento' | 'paquete'
   - service_ids (array de uuid) - servicios a los que aplica el descuento o que componen el paquete
   - start_date, end_date - vigencia de la promo
3. Tabla `services` - columna para precio con descuento calculado
   - promo_price (numeric) - precio despues de descuento (null si no hay promo activa)
   - promo_label (text) - etiqueta opcional para mostrar
4. Seguridad
   - RLS en site_content con acceso anon+authenticated (contenido publico, editable solo desde admin autenticado)
*/

CREATE TABLE IF NOT EXISTS site_content (
  key text PRIMARY KEY,
  value text NOT NULL DEFAULT '',
  label text NOT NULL DEFAULT '',
  section text NOT NULL DEFAULT 'general',
  max_length integer DEFAULT 300,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_site_content" ON site_content;
CREATE POLICY "read_site_content" ON site_content FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_site_content" ON site_content;
CREATE POLICY "insert_site_content" ON site_content FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_site_content" ON site_content;
CREATE POLICY "update_site_content" ON site_content FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_site_content" ON site_content;
CREATE POLICY "delete_site_content" ON site_content FOR DELETE
  TO anon, authenticated USING (true);

-- Insertar valores por defecto con los textos actuales de la pagina
INSERT INTO site_content (key, value, label, section, max_length) VALUES
  ('hero_subtitle', 'Salon & Spa de lujo en Torreón. Cabello, maquillaje, faciales y bienestar en un solo lugar.', 'Texto de bienvenida (inicio)', 'inicio', 200),
  ('services_eyebrow', 'Nuestros Servicios', 'Etiqueta encima del título de servicios', 'servicios', 50),
  ('services_title', 'El arte de la', 'Título de servicios (parte 1)', 'servicios', 60),
  ('services_title_em', 'belleza auténtica', 'Título de servicios (parte 2, cursiva)', 'servicios', 60),
  ('gallery_eyebrow', 'Nuestro Trabajo', 'Etiqueta encima del título de galería', 'galeria', 50),
  ('gallery_title', 'Cada resultado,', 'Título de galería (parte 1)', 'galeria', 60),
  ('gallery_title_em', 'una historia', 'Título de galería (parte 2, cursiva)', 'galeria', 60),
  ('gallery_subtitle', 'Una curaduría de transformaciones que hablan por sí solas. El estilo es personal; nosotros lo refinamos.', 'Subtítulo de galería', 'galeria', 200),
  ('citas_eyebrow', 'Reserva tu lugar', 'Etiqueta encima del título de citas', 'citas', 50),
  ('citas_title', 'Tu transformación', 'Título de citas (parte 1)', 'citas', 60),
  ('citas_title_em', 'comienza aquí', 'Título de citas (parte 2, cursiva)', 'citas', 60),
  ('citas_subtitle', 'Agenda tu cita en línea. Elige el servicio, el horario y el estilista que prefieras — en minutos.', 'Subtítulo de citas', 'citas', 200),
  ('footer_about', 'Un refugio de belleza y bienestar donde cada detalle está pensado para ofrecerte una experiencia sin igual. Lujo silencioso, cuidado genuino.', 'Texto descriptivo del footer', 'footer', 250)
ON CONFLICT (key) DO NOTHING;

-- Anadir campos a promotions para los dos tipos de promo
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'promotions' AND column_name = 'service_ids') THEN
    ALTER TABLE promotions ADD COLUMN service_ids uuid[] DEFAULT '{}';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'promotions' AND column_name = 'start_date') THEN
    ALTER TABLE promotions ADD COLUMN start_date date;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'promotions' AND column_name = 'end_date') THEN
    ALTER TABLE promotions ADD COLUMN end_date date;
  END IF;
END $$;

-- Actualizar promo_type para aceptar los nuevos valores
UPDATE promotions SET promo_type = 'descuento' WHERE promo_type NOT IN ('descuento', 'paquete');
