
-- Fix invoice_sequence: use a database function instead of open write
DROP POLICY IF EXISTS "Anyone can insert invoice_sequence" ON public.invoice_sequence;
DROP POLICY IF EXISTS "Anyone can update invoice_sequence" ON public.invoice_sequence;

-- Only admins can directly modify
CREATE POLICY "Admins can manage invoice_sequence" ON public.invoice_sequence FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Create a security definer function to get next invoice number
CREATE OR REPLACE FUNCTION public.get_next_invoice_number(p_year_month text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  next_num integer;
BEGIN
  INSERT INTO public.invoice_sequence (year_month, last_number)
  VALUES (p_year_month, 1)
  ON CONFLICT (year_month)
  DO UPDATE SET last_number = invoice_sequence.last_number + 1
  RETURNING last_number INTO next_num;
  RETURN next_num;
END;
$$;
