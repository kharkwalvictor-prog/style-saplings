
-- ═══════════════════════════════
-- TABLE 1: invoices
-- ═══════════════════════════════
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  invoice_number TEXT UNIQUE NOT NULL,
  invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage invoices" ON public.invoices FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can view own invoices" ON public.invoices FOR SELECT TO anon, authenticated USING (
  EXISTS (
    SELECT 1 FROM public.orders o WHERE o.id = invoices.order_id AND lower(trim(o.customer_email)) = lower(trim(coalesce(auth.email(), '')))
  )
);

-- ═══════════════════════════════
-- TABLE 2: cod_otp
-- ═══════════════════════════════
CREATE TABLE public.cod_otp (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT NOT NULL,
  otp_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  attempts INTEGER DEFAULT 0,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.cod_otp ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert cod_otp" ON public.cod_otp FOR INSERT TO anon, authenticated WITH CHECK (true);
-- SELECT/UPDATE/DELETE: service role only (no public policies needed)

-- ═══════════════════════════════
-- TABLE 3: discount_codes
-- ═══════════════════════════════
CREATE TABLE public.discount_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL,
  discount_value NUMERIC NOT NULL,
  minimum_order_amount NUMERIC DEFAULT 0,
  usage_limit INTEGER,
  usage_count INTEGER DEFAULT 0,
  valid_from TIMESTAMPTZ DEFAULT now(),
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.discount_codes ENABLE ROW LEVEL SECURITY;

-- Validation trigger instead of CHECK constraint
CREATE OR REPLACE FUNCTION public.validate_discount_type() RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $$
BEGIN
  IF NEW.discount_type NOT IN ('percentage', 'fixed') THEN
    RAISE EXCEPTION 'discount_type must be percentage or fixed';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_validate_discount_type BEFORE INSERT OR UPDATE ON public.discount_codes FOR EACH ROW EXECUTE FUNCTION public.validate_discount_type();

CREATE POLICY "Anyone can read active discount codes" ON public.discount_codes FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins can insert discount codes" ON public.discount_codes FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update discount codes" ON public.discount_codes FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete discount codes" ON public.discount_codes FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ═══════════════════════════════
-- TABLE 4: wishlists
-- ═══════════════════════════════
CREATE TABLE public.wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(session_id, product_id)
);
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read wishlists" ON public.wishlists FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can insert wishlists" ON public.wishlists FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can delete wishlists" ON public.wishlists FOR DELETE TO anon, authenticated USING (true);

-- ═══════════════════════════════
-- TABLE 5: product_reviews
-- ═══════════════════════════════
CREATE TABLE public.product_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  rating INTEGER NOT NULL,
  title TEXT,
  body TEXT,
  photo_url TEXT,
  is_approved BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

-- Validation trigger for rating
CREATE OR REPLACE FUNCTION public.validate_review_rating() RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $$
BEGIN
  IF NEW.rating < 1 OR NEW.rating > 5 THEN
    RAISE EXCEPTION 'rating must be between 1 and 5';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_validate_review_rating BEFORE INSERT OR UPDATE ON public.product_reviews FOR EACH ROW EXECUTE FUNCTION public.validate_review_rating();

CREATE POLICY "Anyone can read approved reviews" ON public.product_reviews FOR SELECT TO anon, authenticated USING (is_approved = true);
CREATE POLICY "Admins can read all reviews" ON public.product_reviews FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can insert reviews" ON public.product_reviews FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins can update reviews" ON public.product_reviews FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete reviews" ON public.product_reviews FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ═══════════════════════════════
-- TABLE 6: email_log
-- ═══════════════════════════════
CREATE TABLE public.email_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id),
  email_type TEXT NOT NULL,
  sent_to TEXT NOT NULL,
  status TEXT NOT NULL,
  error_message TEXT,
  sent_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.email_log ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.validate_email_log_status() RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $$
BEGIN
  IF NEW.status NOT IN ('sent', 'failed', 'skipped') THEN
    RAISE EXCEPTION 'status must be sent, failed, or skipped';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_validate_email_log_status BEFORE INSERT OR UPDATE ON public.email_log FOR EACH ROW EXECUTE FUNCTION public.validate_email_log_status();

CREATE POLICY "Admins can read email log" ON public.email_log FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
-- INSERT/UPDATE/DELETE: service role only

-- ═══════════════════════════════
-- TABLE 7: back_in_stock_requests
-- ═══════════════════════════════
CREATE TABLE public.back_in_stock_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  notified BOOLEAN DEFAULT false,
  notified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(product_id, customer_email)
);
ALTER TABLE public.back_in_stock_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage back in stock requests" ON public.back_in_stock_requests FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can insert back in stock requests" ON public.back_in_stock_requests FOR INSERT TO anon, authenticated WITH CHECK (true);

-- ═══════════════════════════════
-- TABLE 8: restock_history
-- ═══════════════════════════════
CREATE TABLE public.restock_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id),
  product_name TEXT NOT NULL,
  old_count INTEGER NOT NULL,
  new_count INTEGER NOT NULL,
  updated_by TEXT DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.restock_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read restock history" ON public.restock_history FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert restock history" ON public.restock_history FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ═══════════════════════════════
-- MODIFY: orders — add columns
-- ═══════════════════════════════
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS confirmation_email_sent BOOLEAN DEFAULT false;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_email_sent BOOLEAN DEFAULT false;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS discount_code TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS discount_amount NUMERIC DEFAULT 0;

-- ═══════════════════════════════
-- MODIFY: invoice_sequence — restrict SELECT to admin only
-- ═══════════════════════════════
DROP POLICY IF EXISTS "Anyone can read invoice_sequence" ON public.invoice_sequence;
CREATE POLICY "Admins can read invoice_sequence" ON public.invoice_sequence FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
