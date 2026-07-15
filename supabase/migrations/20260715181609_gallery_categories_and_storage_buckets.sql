-- Add category column to gallery_photos
ALTER TABLE gallery_photos ADD COLUMN IF NOT EXISTS category text DEFAULT 'general';

-- Create storage buckets for gallery and avatars
INSERT INTO storage.buckets (id, name, public) VALUES ('gallery', 'gallery', true)
  ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true)
  ON CONFLICT (id) DO NOTHING;

-- Storage policies for gallery bucket (admin write, public read)
CREATE POLICY "gallery_public_read" ON storage.objects FOR SELECT
  TO anon, authenticated USING (bucket_id = 'gallery');
CREATE POLICY "gallery_admin_write" ON storage.objects FOR INSERT
  TO authenticated WITH CHECK (bucket_id = 'gallery');
CREATE POLICY "gallery_admin_update" ON storage.objects FOR UPDATE
  TO authenticated USING (bucket_id = 'gallery');
CREATE POLICY "gallery_admin_delete" ON storage.objects FOR DELETE
  TO authenticated USING (bucket_id = 'gallery');

-- Storage policies for avatars bucket (admin write, public read)
CREATE POLICY "avatars_public_read" ON storage.objects FOR SELECT
  TO anon, authenticated USING (bucket_id = 'avatars');
CREATE POLICY "avatars_admin_write" ON storage.objects FOR INSERT
  TO authenticated WITH CHECK (bucket_id = 'avatars');
CREATE POLICY "avatars_admin_update" ON storage.objects FOR UPDATE
  TO authenticated USING (bucket_id = 'avatars');
CREATE POLICY "avatars_admin_delete" ON storage.objects FOR DELETE
  TO authenticated USING (bucket_id = 'avatars');
