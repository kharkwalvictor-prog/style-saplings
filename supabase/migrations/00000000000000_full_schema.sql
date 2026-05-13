-- ============================================================
-- STYLE SAPLINGS BOUTIQUE — FULL DATABASE SCHEMA
-- Run this in your NEW Supabase project's SQL Editor
-- ============================================================
-- This is a consolidated migration combining all 14 original
-- Lovable migrations into a single clean setup script.
-- ============================================================

-- ╔══════════════════════════════════════════════════════════╗
-- ║  1. ENUM TYPES                                          ║
-- ╚══════════════════════════════════════════════════════════╝

CREATE TYPE public.craft_type AS ENUM ('Chikankari', 'Bandhani', 'Firan', 'Festive');
CREATE TYPE public.stock_status AS ENUM ('in_stock', 'low_stock', 'out_of_stock');
CREATE TYPE public.payment_method AS ENUM ('razorpay', 'cod');
CREATE TYPE public.payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
CREATE TYPE public.order_status AS ENUM ('pending', 'processing', 'packed', 'shipped', 'delivered', 'cancelled');
CREATE TYPE public.app_role AS ENUM ('admin', 'user');
CREATE TYPE public.refund_request_type AS ENUM ('refund', 'exchange', 'return');
CREATE TYPE public.refund_status AS ENUM ('pending', 'approved', 'rejected', 'processed');


-- ╔══════════════════════════════════════════════════════════╗
-- ║  2. HELPER FUNCTIONS                                    ║
-- ╚══════════════════════════════════════════════════════════╝

-- updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Role check function (security definer to avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;


-- ╔══════════════════════════════════════════════════════════╗
-- ║  3. CORE TABLES                                         ║
-- ╚══════════════════════════════════════════════════════════╝

-- ─── PRODUCTS ───────────────────────────────────────────────
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL,
  sale_price NUMERIC(10, 2),
  craft_type public.craft_type NOT NULL,
  category TEXT,
  sizes TEXT[] NOT NULL DEFAULT '{}',
  images TEXT[] NOT NULL DEFAULT '{}',
  stock_status public.stock_status NOT NULL DEFAULT 'in_stock',
  stock_count INTEGER NOT NULL DEFAULT 0,
  low_stock_threshold INTEGER NOT NULL DEFAULT 5,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  hsn_code TEXT DEFAULT '62099090',
  supplier_notes TEXT,
  search_vector TSVECTOR,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX products_search_idx ON public.products USING GIN (search_vector);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Products are publicly readable"
  ON public.products FOR SELECT USING (true);
CREATE POLICY "Admins can insert products"
  ON public.products FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update products"
  ON public.products FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete products"
  ON public.products FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Full-text search trigger
CREATE OR REPLACE FUNCTION public.products_search_vector_update()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.search_vector := to_tsvector('english',
    coalesce(NEW.name, '') || ' ' ||
    coalesce(NEW.description, '') || ' ' ||
    coalesce(NEW.craft_type::text, '') || ' ' ||
    coalesce(NEW.category, '')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_products_search_vector
  BEFORE INSERT OR UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.products_search_vector_update();


-- ─── USER ROLES ─────────────────────────────────────────────
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));


-- ─── ORDERS ─────────────────────────────────────────────────
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_gstin TEXT,
  customer_company_name TEXT,
  shipping_address JSONB NOT NULL DEFAULT '{}',
  items JSONB NOT NULL DEFAULT '[]',
  total_amount NUMERIC(10, 2) NOT NULL,
  payment_method public.payment_method NOT NULL DEFAULT 'cod',
  payment_status public.payment_status NOT NULL DEFAULT 'pending',
  order_status public.order_status NOT NULL DEFAULT 'pending',
  razorpay_order_id TEXT,
  tracking_number TEXT,
  cancel_reason TEXT,
  confirmation_email_sent BOOLEAN DEFAULT false,
  shipping_email_sent BOOLEAN DEFAULT false,
  discount_code TEXT,
  discount_amount NUMERIC DEFAULT 0,
  supply_type TEXT,
  gst_breakdowns JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create orders"
  ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view all orders"
  ON public.orders FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update orders"
  ON public.orders FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- ╔══════════════════════════════════════════════════════════╗
-- ║  4. ORDER MANAGEMENT TABLES                             ║
-- ╚══════════════════════════════════════════════════════════╝

-- ─── ORDER NOTES ────────────────────────────────────────────
CREATE TABLE public.order_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.order_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage order notes"
  ON public.order_notes FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_order_notes_updated_at
  BEFORE UPDATE ON public.order_notes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- ─── ORDER STATUS HISTORY ───────────────────────────────────
CREATE TABLE public.order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  from_status TEXT,
  to_status TEXT NOT NULL,
  changed_by TEXT DEFAULT 'admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage status history"
  ON public.order_status_history FOR ALL USING (public.has_role(auth.uid(), 'admin'));


-- ─── ORDER RATE LIMITS (COD fraud prevention) ───────────────
CREATE TABLE public.order_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_order_rate_limits_phone_created
  ON public.order_rate_limits (phone, created_at);
CREATE INDEX idx_order_rate_limits_phone_time
  ON public.order_rate_limits (phone, created_at DESC);

ALTER TABLE public.order_rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert rate limits"
  ON public.order_rate_limits FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can read rate limits"
  ON public.order_rate_limits FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete rate limits"
  ON public.order_rate_limits FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Cleanup function for rate limits (> 24h old)
CREATE OR REPLACE FUNCTION public.cleanup_order_rate_limits()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM order_rate_limits
  WHERE created_at < now() - interval '24 hours';
$$;


-- ╔══════════════════════════════════════════════════════════╗
-- ║  5. CUSTOMER MANAGEMENT                                 ║
-- ╚══════════════════════════════════════════════════════════╝

-- ─── CUSTOMER TAGS ──────────────────────────────────────────
CREATE TABLE public.customer_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_email TEXT NOT NULL,
  tag TEXT NOT NULL,
  is_auto BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(customer_email, tag)
);

ALTER TABLE public.customer_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage customer tags"
  ON public.customer_tags FOR ALL USING (public.has_role(auth.uid(), 'admin'));


-- ─── CUSTOMER NOTES ─────────────────────────────────────────
CREATE TABLE public.customer_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_email TEXT NOT NULL,
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.customer_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage customer notes"
  ON public.customer_notes FOR ALL USING (public.has_role(auth.uid(), 'admin'));


-- ╔══════════════════════════════════════════════════════════╗
-- ║  6. REFUNDS & RETURNS                                   ║
-- ╚══════════════════════════════════════════════════════════╝

CREATE TABLE public.refund_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  order_number TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  reason TEXT NOT NULL,
  description TEXT,
  request_type public.refund_request_type NOT NULL DEFAULT 'refund',
  status public.refund_status NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  refund_amount NUMERIC,
  replacement_order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  images TEXT[] DEFAULT '{}'::text[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.refund_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage refund requests"
  ON public.refund_requests FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can create refund requests"
  ON public.refund_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read refund requests by order"
  ON public.refund_requests FOR SELECT USING (true);

CREATE TRIGGER update_refund_requests_updated_at
  BEFORE UPDATE ON public.refund_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- ╔══════════════════════════════════════════════════════════╗
-- ║  7. INVOICING & GST                                     ║
-- ╚══════════════════════════════════════════════════════════╝

-- ─── GST CONFIG ─────────────────────────────────────────────
CREATE TABLE public.gst_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gstin TEXT NOT NULL,
  legal_name TEXT NOT NULL,
  trade_name TEXT NOT NULL,
  address TEXT NOT NULL,
  state TEXT NOT NULL,
  state_code TEXT NOT NULL,
  effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.gst_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "GST config is publicly readable"
  ON public.gst_config FOR SELECT USING (true);
CREATE POLICY "Admins can manage gst_config"
  ON public.gst_config FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));


-- ─── INVOICE SEQUENCE ───────────────────────────────────────
CREATE TABLE public.invoice_sequence (
  year_month TEXT PRIMARY KEY,
  last_number INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE public.invoice_sequence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage invoice_sequence"
  ON public.invoice_sequence FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Security definer function for atomic invoice numbering
CREATE OR REPLACE FUNCTION public.get_next_invoice_number(p_year_month TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  next_num INTEGER;
BEGIN
  INSERT INTO public.invoice_sequence (year_month, last_number)
  VALUES (p_year_month, 1)
  ON CONFLICT (year_month)
  DO UPDATE SET last_number = invoice_sequence.last_number + 1
  RETURNING last_number INTO next_num;
  RETURN next_num;
END;
$$;


-- ─── INVOICES ───────────────────────────────────────────────
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  invoice_number TEXT UNIQUE NOT NULL,
  invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage invoices"
  ON public.invoices FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can view own invoices"
  ON public.invoices FOR SELECT TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = invoices.order_id
      AND lower(trim(o.customer_email)) = lower(trim(coalesce(auth.email(), '')))
    )
  );


-- ╔══════════════════════════════════════════════════════════╗
-- ║  8. PAYMENT — COD OTP                                   ║
-- ╚══════════════════════════════════════════════════════════╝

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

CREATE POLICY "Anyone can insert cod_otp"
  ON public.cod_otp FOR INSERT TO anon, authenticated WITH CHECK (true);


-- ╔══════════════════════════════════════════════════════════╗
-- ║  9. DISCOUNT CODES                                      ║
-- ╚══════════════════════════════════════════════════════════╝

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

-- Validation trigger for discount type
CREATE OR REPLACE FUNCTION public.validate_discount_type()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.discount_type NOT IN ('percentage', 'fixed', 'shipping') THEN
    RAISE EXCEPTION 'discount_type must be percentage, fixed, or shipping';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_discount_type
  BEFORE INSERT OR UPDATE ON public.discount_codes
  FOR EACH ROW EXECUTE FUNCTION public.validate_discount_type();

CREATE POLICY "Anyone can read active discount codes"
  ON public.discount_codes FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins can insert discount codes"
  ON public.discount_codes FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update discount codes"
  ON public.discount_codes FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete discount codes"
  ON public.discount_codes FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));


-- ╔══════════════════════════════════════════════════════════╗
-- ║  10. WISHLISTS                                          ║
-- ╚══════════════════════════════════════════════════════════╝

CREATE TABLE public.wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(session_id, product_id)
);

ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read wishlists"
  ON public.wishlists FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can insert wishlists"
  ON public.wishlists FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can delete wishlists"
  ON public.wishlists FOR DELETE TO anon, authenticated USING (true);


-- ╔══════════════════════════════════════════════════════════╗
-- ║  11. PRODUCT REVIEWS                                    ║
-- ╚══════════════════════════════════════════════════════════╝

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

CREATE OR REPLACE FUNCTION public.validate_review_rating()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.rating < 1 OR NEW.rating > 5 THEN
    RAISE EXCEPTION 'rating must be between 1 and 5';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_review_rating
  BEFORE INSERT OR UPDATE ON public.product_reviews
  FOR EACH ROW EXECUTE FUNCTION public.validate_review_rating();

CREATE POLICY "Anyone can read approved reviews"
  ON public.product_reviews FOR SELECT TO anon, authenticated
  USING (is_approved = true);
CREATE POLICY "Admins can read all reviews"
  ON public.product_reviews FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can insert reviews"
  ON public.product_reviews FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins can update reviews"
  ON public.product_reviews FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete reviews"
  ON public.product_reviews FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Review summary view
CREATE OR REPLACE VIEW public.product_review_summary AS
SELECT
  product_id,
  COUNT(*)::integer AS review_count,
  ROUND(AVG(rating)::numeric, 1) AS avg_rating
FROM public.product_reviews
WHERE is_approved = true
GROUP BY product_id;

GRANT SELECT ON public.product_review_summary TO anon, authenticated;


-- ╔══════════════════════════════════════════════════════════╗
-- ║  12. EMAIL LOG                                          ║
-- ╚══════════════════════════════════════════════════════════╝

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

CREATE OR REPLACE FUNCTION public.validate_email_log_status()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.status NOT IN ('sent', 'failed', 'skipped') THEN
    RAISE EXCEPTION 'status must be sent, failed, or skipped';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_email_log_status
  BEFORE INSERT OR UPDATE ON public.email_log
  FOR EACH ROW EXECUTE FUNCTION public.validate_email_log_status();

CREATE POLICY "Admins can read email log"
  ON public.email_log FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));


-- ╔══════════════════════════════════════════════════════════╗
-- ║  13. BACK IN STOCK REQUESTS                             ║
-- ╚══════════════════════════════════════════════════════════╝

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

CREATE POLICY "Admins can manage back in stock requests"
  ON public.back_in_stock_requests FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can insert back in stock requests"
  ON public.back_in_stock_requests FOR INSERT TO anon, authenticated WITH CHECK (true);


-- ╔══════════════════════════════════════════════════════════╗
-- ║  14. RESTOCK HISTORY                                    ║
-- ╚══════════════════════════════════════════════════════════╝

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

CREATE POLICY "Admins can read restock history"
  ON public.restock_history FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert restock history"
  ON public.restock_history FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));


-- ╔══════════════════════════════════════════════════════════╗
-- ║  15. BLOG POSTS                                         ║
-- ╚══════════════════════════════════════════════════════════╝

CREATE TABLE public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT,
  category TEXT,
  cover_image TEXT,
  published BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published posts are publicly readable"
  ON public.blog_posts FOR SELECT USING (published = true);
CREATE POLICY "Admins can view all posts"
  ON public.blog_posts FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert posts"
  ON public.blog_posts FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update posts"
  ON public.blog_posts FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete posts"
  ON public.blog_posts FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- ╔══════════════════════════════════════════════════════════╗
-- ║  16. STORAGE BUCKETS                                    ║
-- ╚══════════════════════════════════════════════════════════╝

-- Product images (public)
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);

CREATE POLICY "Product images are publicly accessible"
  ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "Admins can upload product images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update product images"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete product images"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));

-- Blog images (public)
INSERT INTO storage.buckets (id, name, public) VALUES ('blog-images', 'blog-images', true)
  ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Blog images are publicly accessible"
  ON storage.objects FOR SELECT USING (bucket_id = 'blog-images');
CREATE POLICY "Admins can upload blog images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'blog-images' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update blog images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'blog-images' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete blog images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'blog-images' AND public.has_role(auth.uid(), 'admin'));

-- Return images (private — uploaded via edge function)
INSERT INTO storage.buckets (id, name, public) VALUES ('return-images', 'return-images', false)
  ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Return images are publicly readable"
  ON storage.objects FOR SELECT USING (bucket_id = 'return-images');
CREATE POLICY "Admins can delete return images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'return-images' AND public.has_role(auth.uid(), 'admin'::app_role));

-- Invoices (private)
INSERT INTO storage.buckets (id, name, public) VALUES ('invoices', 'invoices', false);

CREATE POLICY "Admins can read invoices"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'invoices' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Block public insert on invoices"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'invoices' AND public.has_role(auth.uid(), 'admin'));


-- ╔══════════════════════════════════════════════════════════╗
-- ║  17. REALTIME                                           ║
-- ╚══════════════════════════════════════════════════════════╝

ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.refund_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;


-- ╔══════════════════════════════════════════════════════════╗
-- ║  18. SEED DATA                                          ║
-- ╚══════════════════════════════════════════════════════════╝

-- GST config — UPDATE THE GSTIN WITH YOUR ACTUAL ONE
INSERT INTO public.gst_config (gstin, legal_name, trade_name, address, state, state_code)
VALUES ('__ADD_YOUR_GSTIN__', 'Shivaya Enterprises', 'Style Saplings', '6488, C6, Vasant Kunj, New Delhi 110070', 'Delhi', '07');

-- Starter discount codes
INSERT INTO public.discount_codes (code, description, discount_type, discount_value, minimum_order_amount, usage_limit, is_active)
VALUES
  ('LAUNCH10', 'Launch 10% off', 'percentage', 10, 0, 100, true),
  ('FIRST15', 'First order 15% off', 'percentage', 15, 999, 50, true),
  ('FREESHIP', 'Free shipping', 'shipping', 99, 500, 200, true)
ON CONFLICT (code) DO NOTHING;


-- ============================================================
-- DONE! Next steps:
-- 1. Create an admin user in Supabase Auth → Users
-- 2. Insert admin role: see migration guide
-- 3. Set up Edge Function secrets
-- 4. Deploy Edge Functions via Supabase CLI
-- ============================================================
