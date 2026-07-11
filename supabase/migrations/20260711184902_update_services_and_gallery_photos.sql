-- ============================================================
-- UPDATE SERVICES: replace with correct categories and names
-- ============================================================
TRUNCATE TABLE appointments CASCADE;
DELETE FROM services;

INSERT INTO services (id, name, category, description, price_min, price_max, duration_minutes, maintenance_days, is_active) VALUES
  -- Coloración Premium
  (gen_random_uuid(), 'Retoque de tinte',        'coloracion', '', 0, 0, 60,  0,   true),
  (gen_random_uuid(), 'Retoque de coronilla',    'coloracion', '', 0, 0, 60,  0,   true),
  (gen_random_uuid(), 'Baño de color',           'coloracion', '', 0, 0, 60,  0,   true),
  (gen_random_uuid(), 'Rayos con tinte',         'coloracion', '', 0, 0, 90,  0,   true),
  (gen_random_uuid(), 'Baby lights',             'coloracion', '', 0, 0, 90,  0,   true),
  -- Corte
  (gen_random_uuid(), 'Corte mujer',             'corte',      '', 0, 0, 60,  0,   true),
  (gen_random_uuid(), 'Corte de hombre',         'corte',      '', 0, 0, 30,  0,   true),
  (gen_random_uuid(), 'Corte de niño',           'corte',      '', 0, 0, 30,  0,   true),
  -- Depilaciones
  (gen_random_uuid(), 'Depilación de ceja',      'depilacion', '', 0, 0, 15,  0,   true),
  -- Tratamientos capilares - Hidratantes
  (gen_random_uuid(), 'Brazilian',               'tratamiento_hidratante', 'Hidratación profunda con duración de hasta 4 meses', 1500, 1500, 105, 120, true),
  -- Tratamientos capilares - Antifreeze
  (gen_random_uuid(), 'Nanoplastia',             'tratamiento_antifreeze', '', 0, 0, 120, 150, true),
  -- Maquillaje y Peinado
  (gen_random_uuid(), 'Maquillaje',              'maquillaje', '', 0, 0, 60,  0,   true),
  (gen_random_uuid(), 'Peinado',                 'maquillaje', '', 0, 0, 60,  0,   true),
  -- Manos y Pies
  (gen_random_uuid(), 'Pedicure',                'manos_pies', '', 0, 0, 60,  0,   true),
  (gen_random_uuid(), 'Gelish',                  'manos_pies', '', 0, 0, 60,  0,   true),
  (gen_random_uuid(), 'Retiro de gelish',        'manos_pies', '', 0, 0, 30,  0,   true),
  -- Faciales y Bienestar
  (gen_random_uuid(), 'Limpieza profunda',       'facial',     '', 0, 0, 60,  30,  true),
  (gen_random_uuid(), 'Dermaplane',              'facial',     '', 0, 0, 60,  30,  true),
  (gen_random_uuid(), 'Mascarilla milagro',      'facial',     '', 0, 0, 45,  14,  true),
  (gen_random_uuid(), 'Mascarilla de arcilla',   'facial',     '', 0, 0, 45,  14,  true),
  (gen_random_uuid(), 'Mascarilla de péptidos',  'facial',     '', 0, 0, 45,  14,  true),
  (gen_random_uuid(), 'Million dollar facial',   'facial',     '', 0, 0, 90,  30,  true),
  -- Terapia sensorial (antes cama vibroacústica)
  (gen_random_uuid(), 'Terapia sensorial',       'facial',     '', 0, 0, 45,  0,   true);

-- ============================================================
-- GALLERY PHOTOS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS gallery_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE gallery_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active gallery photos"
  ON gallery_photos FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can insert gallery photos"
  ON gallery_photos FOR INSERT TO authenticated
  WITH CHECK (public.get_current_user_role() = 'admin');

CREATE POLICY "Admins can update gallery photos"
  ON gallery_photos FOR UPDATE TO authenticated
  USING (public.get_current_user_role() = 'admin')
  WITH CHECK (public.get_current_user_role() = 'admin');

CREATE POLICY "Admins can delete gallery photos"
  ON gallery_photos FOR DELETE TO authenticated
  USING (public.get_current_user_role() = 'admin');

-- Seed existing gallery images
INSERT INTO gallery_photos (url, display_order, is_active) VALUES
  ('/images/e3cacf9c-255d-45d6-8a06-c9241bb86726.JPG', 1,  true),
  ('/images/4c8319b3-c30b-41b0-b998-6f860af23de5.JPG', 2,  true),
  ('/images/4721a771-2fdb-4184-bd67-6bf5376abd6e.JPG', 3,  true),
  ('/images/a3b9c8cd-1ba5-4b82-a08b-94d3b7ec92fe.JPG', 4,  true),
  ('/images/7f892cac-94d1-4023-9bc0-b4f5a951822e.JPG', 5,  true),
  ('/images/ff725c1d-1c9b-49e4-8b93-0ed4ae470c95.JPG', 6,  true),
  ('/images/bc15a3dd-da05-4799-9700-2b213c2fc619.JPG', 7,  true),
  ('/images/cd827f77-4bbd-4eed-b9aa-32d31137263b.JPG', 8,  true),
  ('/images/abd52b7c-de27-4c79-a38c-301c8e31d609.JPG', 9,  true),
  ('/images/940d04e4-3714-4998-92fc-98e0ad3c796c.JPG', 10, true),
  ('/images/PHOTO-2026-06-29-16-42-53_3.jpg',          11, true),
  ('/images/PHOTO-2026-06-29-16-42-53_4.jpg',          12, true),
  ('/images/PHOTO-2026-06-29-16-42-54_2.jpg',          13, true);
