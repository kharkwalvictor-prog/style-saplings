CREATE OR REPLACE VIEW public.product_review_summary AS
SELECT 
  product_id,
  COUNT(*)::integer as review_count,
  ROUND(AVG(rating)::numeric, 1) as avg_rating
FROM public.product_reviews
WHERE is_approved = true
GROUP BY product_id;

GRANT SELECT ON public.product_review_summary TO anon, authenticated;