
-- Create storage bucket for return images
INSERT INTO storage.buckets (id, name, public) VALUES ('return-images', 'return-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to upload return images
CREATE POLICY "Anyone can upload return images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'return-images');

-- Return images are publicly readable
CREATE POLICY "Return images are publicly readable"
ON storage.objects FOR SELECT
USING (bucket_id = 'return-images');

-- Admins can delete return images
CREATE POLICY "Admins can delete return images"
ON storage.objects FOR DELETE
USING (bucket_id = 'return-images' AND public.has_role(auth.uid(), 'admin'::app_role));

-- Also allow public SELECT on refund_requests for order validation on the returns page
CREATE POLICY "Anyone can read refund requests by order"
ON public.refund_requests FOR SELECT
USING (true);
