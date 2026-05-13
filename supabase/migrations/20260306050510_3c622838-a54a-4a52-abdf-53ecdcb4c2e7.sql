
-- Update validate_discount_type to allow 'shipping' type
CREATE OR REPLACE FUNCTION public.validate_discount_type()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.discount_type NOT IN ('percentage', 'fixed', 'shipping') THEN
    RAISE EXCEPTION 'discount_type must be percentage, fixed, or shipping';
  END IF;
  RETURN NEW;
END;
$function$;

-- Seed starter discount codes
INSERT INTO public.discount_codes (code, description, discount_type, discount_value, minimum_order_amount, usage_limit, is_active)
VALUES
  ('LAUNCH10', 'Launch 10% off', 'percentage', 10, 0, 100, true),
  ('FIRST15', 'First order 15% off', 'percentage', 15, 999, 50, true),
  ('FREESHIP', 'Free shipping', 'shipping', 99, 500, 200, true)
ON CONFLICT (code) DO NOTHING;
