ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT;
