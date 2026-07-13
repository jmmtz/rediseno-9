-- Null out service_id in appointments to avoid FK issues during re-seed
UPDATE appointments SET service_id = NULL WHERE service_id IS NOT NULL;

DELETE FROM services;

INSERT INTO services (name, category, description, price_min, price_max, duration_minutes, maintenance_days, is_active) VALUES
-- Coloración Premium
('Retoque de tinte',         'coloracion',            '', 650,  650,  60,  30,  true),
('Retoque de coronilla',     'coloracion',            '', 490,  490,  45,  30,  true),
('Baño de color',            'coloracion',            '', 670,  670,  75,  30,  true),
('Rayos con tinte',          'coloracion',            '', 1950, 1950, 120, 135, true),
('Baby lights',              'coloracion',            '', 2400, 2400, 150, 135, true),
-- Corte
('Corte mujer',              'corte',                 '', 700,  700,  60,  105, true),
('Corte de hombre',          'corte',                 '', 310,  310,  30,  25,  true),
('Corte de niño',            'corte',                 '', 310,  310,  30,  25,  true),
-- Depilaciones Faciales
('Depilación de ceja',       'depilacion',            '', 170,  170,  15,  14,  true),
-- Tratamientos Capilares - Hidratantes
('Mucota Ampolleta',         'tratamiento_hidratante','', 760,  760,  60,  30,  true),
('Keravik',                  'tratamiento_hidratante','', 760,  760,  60,  30,  true),
('Smoothing Mask',           'tratamiento_hidratante','', 760,  760,  60,  30,  true),
-- Tratamientos Capilares - Alisado
('Nanoplastia',              'tratamiento_alisado',   '', 1200, 1200, 120, 120, true),
-- Maquillaje y Peinado - Peinado
('Secado',                   'peinado',               '', 200,  450,  30,  0,   true),
('Planchado',                'peinado',               '', 200,  450,  45,  0,   true),
('Ondas',                    'peinado',               '', 200,  450,  45,  0,   true),
('Semirecogido',             'peinado',               '', 200,  450,  60,  0,   true),
('Recogido Alto',            'peinado',               '', 200,  450,  60,  0,   true),
-- Maquillaje y Peinado - Maquillaje
('Social',                   'maquillaje',            '', 1250, 1250, 60,  0,   true),
('Novia',                    'maquillaje',            '', 1250, 1250, 90,  0,   true),
-- Manos y Pies
('Pedicure',                 'manos_pies',            '', 440,  440,  60,  30,  true),
('Manicure',                 'manos_pies',            '', 280,  280,  45,  30,  true),
('Gelish',                   'manos_pies',            '', 280,  280,  45,  14,  true),
('Retiro de gelish',         'manos_pies',            '', 65,   65,   20,  14,  true),
('Rubber',                   'manos_pies',            '', 350,  350,  45,  18,  true),
('Esmaltado',                'manos_pies',            '', 120,  120,  30,  7,   true),
('Uñas Acrílicas',           'manos_pies',            '', 0,    0,    90,  14,  true),
('Uñas Esculturales',        'manos_pies',            '', 0,    0,    90,  14,  true),
('Uñas Soft Gel con Rubber', 'manos_pies',            '', 0,    0,    75,  14,  true),
-- Faciales y Bienestar
('Faciales',                 'facial',                '', 1250, 1250, 60,  30,  true),
('Terapia sensorial',        'facial',                '', 500,  500,  45,  30,  true),
('Terapia luz roja LED',     'facial',                '', 350,  350,  30,  30,  true);
