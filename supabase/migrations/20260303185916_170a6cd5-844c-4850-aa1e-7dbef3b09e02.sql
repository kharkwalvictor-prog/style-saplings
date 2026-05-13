
-- Add 'packed' to order_status enum
ALTER TYPE public.order_status ADD VALUE IF NOT EXISTS 'packed' AFTER 'processing';

-- Add stock management columns to products
ALTER TABLE public.products 
  ADD COLUMN IF NOT EXISTS stock_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS low_stock_threshold integer NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS supplier_notes text;

-- Order notes (admin internal notes per order)
CREATE TABLE public.order_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  note text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.order_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage order notes" ON public.order_notes FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Order status history
CREATE TABLE public.order_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  from_status text,
  to_status text NOT NULL,
  changed_by text DEFAULT 'admin',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage status history" ON public.order_status_history FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Customer tags
CREATE TABLE public.customer_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_email text NOT NULL,
  tag text NOT NULL,
  is_auto boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(customer_email, tag)
);
ALTER TABLE public.customer_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage customer tags" ON public.customer_tags FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Customer notes
CREATE TABLE public.customer_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_email text NOT NULL,
  note text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.customer_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage customer notes" ON public.customer_notes FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Refund requests
CREATE TYPE public.refund_request_type AS ENUM ('refund', 'exchange', 'return');
CREATE TYPE public.refund_status AS ENUM ('pending', 'approved', 'rejected', 'processed');

CREATE TABLE public.refund_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  order_number text NOT NULL,
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_email text NOT NULL,
  reason text NOT NULL,
  description text,
  request_type refund_request_type NOT NULL DEFAULT 'refund',
  status refund_status NOT NULL DEFAULT 'pending',
  admin_notes text,
  requested_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz,
  refund_amount numeric,
  replacement_order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  images text[] DEFAULT '{}'::text[],
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.refund_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage refund requests" ON public.refund_requests FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can create refund requests" ON public.refund_requests FOR INSERT WITH CHECK (true);

-- Add tracking_number to orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS tracking_number text;

-- Enable realtime on orders and refund_requests
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.refund_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;

-- Trigger for updated_at on new tables
CREATE TRIGGER update_order_notes_updated_at BEFORE UPDATE ON public.order_notes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_refund_requests_updated_at BEFORE UPDATE ON public.refund_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
