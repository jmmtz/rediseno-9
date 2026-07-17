CREATE TABLE IF NOT EXISTS slideshow_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  display_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE slideshow_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_slideshow" ON slideshow_photos FOR SELECT
  TO anon, authenticated USING (true);
CREATE POLICY "insert_slideshow" ON slideshow_photos FOR INSERT
  TO authenticated WITH CHECK (true);
CREATE POLICY "update_slideshow" ON slideshow_photos FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_slideshow" ON slideshow_photos FOR DELETE
  TO authenticated USING (true);

-- Seed with current hardcoded slides
INSERT INTO slideshow_photos (url, display_order, is_active) VALUES
  ('/images/0108ffd1-3140-48e8-994e-cd5cf422e400.JPG', 0, true),
  ('/images/abd52b7c-de27-4c79-a38c-301c8e31d609.JPG', 1, true),
  ('/images/e3cacf9c-255d-45d6-8a06-c9241bb86726.JPG', 2, true),
  ('/images/e5a71c0b-8cbc-47ff-8be2-3ecfd4560672.JPG', 3, true),
  ('/images/41745add-f988-4be9-aa1b-9fc96225b06e.JPG', 4, true),
  ('/images/ff725c1d-1c9b-49e4-8b93-0ed4ae470c95.JPG', 5, true),
  ('/images/cd827f77-4bbd-4eed-b9aa-32d31137263b.JPG', 6, true),
  ('/images/940d04e4-3714-4998-92fc-98e0ad3c796c.JPG', 7, true);
