-- Grant table-level privileges to anon and authenticated roles
GRANT SELECT ON public.categories TO anon;
GRANT ALL ON public.categories TO authenticated;
