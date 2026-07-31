-- Arreglar el CHECK constraint de promo_type para aceptar 'descuento' y 'paquete'
ALTER TABLE promotions DROP CONSTRAINT IF EXISTS promotions_promo_type_check;

ALTER TABLE promotions ADD CONSTRAINT promotions_promo_type_check
  CHECK (promo_type = ANY (ARRAY['descuento'::text, 'paquete'::text, 'banner'::text, 'badge'::text, 'combo'::text, 'happy_hour'::text, 'free_upgrade'::text]));
