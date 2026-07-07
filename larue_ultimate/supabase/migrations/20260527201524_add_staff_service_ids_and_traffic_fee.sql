/*
  # Add service_ids to staff and traffic_fee to app_settings

  ## Changes
  1. `staff` — adds `service_ids uuid[]` so each staff member can be linked
     to specific services for cross-filtering in the booking wizard.
  2. `app_settings` — ensures a `traffic_fee` key exists (default 200 MXN)
     for the configurable medium-traffic deposit amount.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'staff' AND column_name = 'service_ids'
  ) THEN
    ALTER TABLE public.staff ADD COLUMN service_ids uuid[] DEFAULT '{}';
  END IF;
END $$;

INSERT INTO public.app_settings (key, value)
VALUES ('traffic_fee', '200')
ON CONFLICT (key) DO NOTHING;
