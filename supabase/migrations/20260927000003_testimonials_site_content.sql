INSERT INTO public.site_content (key, value, section, label, field_type, sort_order) VALUES
  ('testimonial_1_quote',    '', 'Homepage', 'Review 1 — Quote',    'textarea', 160),
  ('testimonial_1_name',     '', 'Homepage', 'Review 1 — Name',     'text',     161),
  ('testimonial_1_location', '', 'Homepage', 'Review 1 — Location', 'text',     162),
  ('testimonial_2_quote',    '', 'Homepage', 'Review 2 — Quote',    'textarea', 163),
  ('testimonial_2_name',     '', 'Homepage', 'Review 2 — Name',     'text',     164),
  ('testimonial_2_location', '', 'Homepage', 'Review 2 — Location', 'text',     165),
  ('testimonial_3_quote',    '', 'Homepage', 'Review 3 — Quote',    'textarea', 166),
  ('testimonial_3_name',     '', 'Homepage', 'Review 3 — Name',     'text',     167),
  ('testimonial_3_location', '', 'Homepage', 'Review 3 — Location', 'text',     168)
ON CONFLICT (key) DO NOTHING;
