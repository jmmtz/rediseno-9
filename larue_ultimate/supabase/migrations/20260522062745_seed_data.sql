/*
  # Seed Data

  ## Inserts:
  - App settings (traffic_mode = low)
  - Default staff (Mariana, Sofía, Karla)
  - Services with maintenance schedules
  - VALM Products catalog
  - Default promotions
*/

-- DEFAULT APP SETTINGS
INSERT INTO app_settings (key, value) VALUES
  ('traffic_mode', 'low'),
  ('stripe_mode', 'sandbox')
ON CONFLICT (key) DO NOTHING;

-- DEFAULT STAFF
INSERT INTO staff (name, specialty, is_active, shift_start, shift_end) VALUES
  ('Mariana', 'Colorista & Estilista', true, '09:00', '19:00'),
  ('Sofía', 'Uñas & Pedicure', true, '09:00', '19:00'),
  ('Karla', 'Maquillaje & Pestañas', true, '10:00', '20:00')
ON CONFLICT DO NOTHING;

-- DEFAULT SERVICES
INSERT INTO services (name, category, description, price_min, price_max, duration_minutes, maintenance_days) VALUES
  ('Uñas Acrílicas', 'nails', 'Uñas acrílicas con diseño personalizado', 450, 700, 90, 20),
  ('Uñas Gel', 'nails', 'Esmaltado en gel de larga duración', 350, 500, 75, 20),
  ('Pedicure', 'nails', 'Pedicure completo con esmaltado', 300, 450, 60, 30),
  ('Corte de Pelo', 'hair', 'Corte profesional con lavado y secado', 250, 450, 60, 45),
  ('Color de Pelo', 'hair', 'Tinte completo con matización', 600, 1200, 120, 40),
  ('Balayage', 'hair', 'Técnica de iluminación balayage profesional', 900, 1800, 180, 40),
  ('Peinado', 'hair', 'Peinado especial para eventos', 350, 600, 60, 30),
  ('Tratamiento Hidratación', 'hair', 'Tratamiento profundo de hidratación capilar', 400, 700, 60, 30),
  ('Faciales', 'spa', 'Facial completo con limpieza profunda', 500, 900, 75, 30),
  ('Depilación', 'spa', 'Depilación con cera de bajo punto de fusión', 200, 500, 45, 25),
  ('Masaje Relajante', 'spa', 'Masaje corporal relajante antiestrés', 500, 800, 60, 15),
  ('Maquillaje Profesional', 'makeup', 'Maquillaje artístico para eventos especiales', 600, 1000, 90, 30),
  ('Pestañas Mink', 'makeup', 'Extensiones de pestañas mink volumen', 700, 1100, 120, 25)
ON CONFLICT DO NOTHING;

-- VALM PRODUCTS
INSERT INTO products (name, brand, category, description, price, compare_price, image_url, shades) VALUES
  ('Blush Stick', 'VALM', 'cheek', 'Blush en barra multifuncional para mejillas y labios. Fórmula cremosa de larga duración.', 650.00, NULL, '/blush_stick.webp', ARRAY['Allure', 'Bellini', 'Bronze']),
  ('Lip Créme', 'VALM', 'lip', 'Labial cremoso ultra-hidratante con acabado satinado de alta pigmentación.', 550.00, NULL, '/lip_creme.webp', ARRAY['Pinot', 'Demure', 'Calypso']),
  ('Lipstick', 'VALM', 'lip', 'Labial clásico de alta cobertura, fórmula confort que dura todo el día.', 450.00, NULL, '/lipstick.webp', ARRAY['Creamy Mauve', 'Barely There', 'Simply Mauve', 'Flaming Fuchsia']),
  ('Lip + Cheek Duo', 'VALM', 'duo', 'Dúo icónico: Blush Stick + Lipstick para un look completo y coordinado.', 935.00, 1100.00, '/lip_and_cheek_duo.webp', ARRAY[]::text[])
ON CONFLICT DO NOTHING;

-- DEFAULT PROMOTIONS
INSERT INTO promotions (title, description, promo_type, discount_type, discount_value, original_price, promo_price, applicable_days, start_time, end_time, is_active, display_badge) VALUES
  ('Combo Uñas + Pestañas Mink', 'Uñas Acrílicas + Pestañas Mink por un precio especial', 'combo', 'flat', 165, 1100, 935, ARRAY[1,2,3,4,5,6,7], NULL, NULL, true, true),
  ('Happy Hour: Cabello', '15% de descuento en servicios de cabello de lunes a miércoles', 'happy_hour', 'percent', 15, 0, 0, ARRAY[1,2,3], '10:00', '14:00', true, true),
  ('Free Upgrade: Corte + Hidratación', 'Corte de pelo incluye tratamiento de hidratación gratis', 'free_upgrade', 'flat', 0, 0, 0, ARRAY[1,2,3,4,5,6,7], NULL, NULL, true, true)
ON CONFLICT DO NOTHING;
