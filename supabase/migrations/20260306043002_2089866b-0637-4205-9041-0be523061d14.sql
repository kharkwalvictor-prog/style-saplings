
-- Create order_rate_limits table for COD fraud prevention
CREATE TABLE IF NOT EXISTS public.order_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_rate_limits_phone_created 
  ON public.order_rate_limits (phone, created_at);

ALTER TABLE public.order_rate_limits ENABLE ROW LEVEL SECURITY;

-- Public can insert (for rate tracking)
CREATE POLICY "Anyone can insert rate limits"
  ON public.order_rate_limits FOR INSERT
  WITH CHECK (true);

-- Only admins can read/delete (for monitoring/override)
CREATE POLICY "Admins can read rate limits"
  ON public.order_rate_limits FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete rate limits"
  ON public.order_rate_limits FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Remove public INSERT policy on return-images bucket
-- We'll use service role via edge function instead
DROP POLICY IF EXISTS "Allow public uploads to return-images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload return images" ON storage.objects;

-- Allow service role uploads only (handled by edge function)
-- Public read stays as-is for viewing images
