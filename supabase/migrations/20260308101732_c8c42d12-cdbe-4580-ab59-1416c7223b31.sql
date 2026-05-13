-- FIX 2: Make return-images bucket private
UPDATE storage.buckets SET public = false WHERE id = 'return-images';

-- FIX 3: Index for fast phone+time queries on rate limits
CREATE INDEX IF NOT EXISTS idx_order_rate_limits_phone_time 
  ON order_rate_limits (phone, created_at DESC);

-- Cleanup function (removes rows > 24 hours old)
CREATE OR REPLACE FUNCTION public.cleanup_order_rate_limits()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM order_rate_limits 
  WHERE created_at < now() - interval '24 hours';
$$;