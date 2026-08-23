-- Fix categories RLS and seed data

-- Enable RLS (safe if already enabled)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Public read policy
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'categories' AND policyname = 'Anyone can read categories'
  ) THEN
    EXECUTE 'CREATE POLICY "Anyone can read categories" ON public.categories FOR SELECT USING (true)';
  END IF;
END $$;

-- Authenticated write policy
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'categories' AND policyname = 'Authenticated users can manage categories'
  ) THEN
    EXECUTE 'CREATE POLICY "Authenticated users can manage categories" ON public.categories FOR ALL TO authenticated USING (true) WITH CHECK (true)';
  END IF;
END $$;

-- Add is_active column if missing
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Seed initial categories
INSERT INTO public.categories (name, slug, description, sort_order, is_active)
VALUES
  ('Chikankari', 'chikankari', 'Delicate hand-embroidered fabrics from Lucknow', 1, true),
  ('Bandhani', 'bandhani', 'Traditional tie-dye craft from Rajasthan and Gujarat', 2, true),
  ('Firan', 'firan', 'Elegant Kashmiri style outerwear', 3, true),
  ('Festive', 'festive', 'Special occasion and festive wear for little ones', 4, true)
ON CONFLICT (slug) DO NOTHING;
