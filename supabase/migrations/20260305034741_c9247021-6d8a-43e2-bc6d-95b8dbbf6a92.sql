
-- Add hsn_code to products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS hsn_code text DEFAULT '62099090';

-- Add GST fields to orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_gstin text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_company_name text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS supply_type text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS gst_breakdowns jsonb;

-- Create gst_config table
CREATE TABLE IF NOT EXISTS public.gst_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gstin text NOT NULL,
  legal_name text NOT NULL,
  trade_name text NOT NULL,
  address text NOT NULL,
  state text NOT NULL,
  state_code text NOT NULL,
  effective_from date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.gst_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "GST config is publicly readable" ON public.gst_config FOR SELECT USING (true);
CREATE POLICY "Admins can manage gst_config" ON public.gst_config FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Create invoice_sequence table
CREATE TABLE IF NOT EXISTS public.invoice_sequence (
  year_month text PRIMARY KEY,
  last_number integer NOT NULL DEFAULT 0
);

ALTER TABLE public.invoice_sequence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read invoice_sequence" ON public.invoice_sequence FOR SELECT USING (true);
CREATE POLICY "Anyone can insert invoice_sequence" ON public.invoice_sequence FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update invoice_sequence" ON public.invoice_sequence FOR UPDATE USING (true);

-- Seed gst_config
INSERT INTO public.gst_config (gstin, legal_name, trade_name, address, state, state_code)
VALUES ('__ADD_YOUR_GSTIN__', 'Shivaya Enterprises', 'Style Saplings', '6488, C6, Vasant Kunj, New Delhi 110070', 'Delhi', '07');
