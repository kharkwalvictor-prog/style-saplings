-- Add shipping and contact settings to site_content
INSERT INTO public.site_content (key, value) VALUES
  ('shipping_free_above', '999'),
  ('shipping_flat_rate', '99'),
  ('shipping_estimated_days', '5-7'),
  ('contact_email', 'support@stylesaplings.com'),
  ('contact_phone', '+91-9810901031'),
  ('contact_address', 'Vasant Kunj, New Delhi'),
  ('contact_instagram', 'stylesaplings'),
  ('contact_whatsapp', '919810901031')
ON CONFLICT (key) DO NOTHING;
