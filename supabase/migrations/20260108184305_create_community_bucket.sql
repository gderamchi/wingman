-- Create community storage bucket for post attachments
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'community',
  'community',
  true,
  20971520, -- 20MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'audio/mpeg', 'audio/wav', 'audio/aac']
) ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to post-attachments folder
CREATE POLICY "Users can upload post attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'community' AND
  (storage.foldername(name))[1] = 'post-attachments'
);

-- Allow anyone to view post attachments (public bucket)
CREATE POLICY "Public can view post attachments"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'community');

-- Allow users to delete their own uploads
CREATE POLICY "Users can delete own attachments"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'community' AND auth.uid()::text = (storage.foldername(name))[2]);
