-- Create site_content table if it doesn't exist yet
CREATE TABLE IF NOT EXISTS public.site_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value text NOT NULL DEFAULT '',
  section text NOT NULL DEFAULT 'Homepage',
  label text NOT NULL DEFAULT '',
  field_type text NOT NULL DEFAULT 'text',
  sort_order integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

-- Public can read (frontend uses anon key)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'site_content' AND policyname = 'Public can read site content'
  ) THEN
    CREATE POLICY "Public can read site content"
      ON public.site_content FOR SELECT USING (true);
  END IF;
END $$;

-- Only admins can update
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'site_content' AND policyname = 'Admins can manage site content'
  ) THEN
    CREATE POLICY "Admins can manage site content"
      ON public.site_content FOR ALL
      USING (public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- SEED: all content keys with their default values
-- ON CONFLICT DO NOTHING preserves any values already saved by the admin
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO public.site_content (key, value, section, label, field_type, sort_order) VALUES

  -- ── Homepage: Hero ──────────────────────────────────────────────────────────
  ('hero_headline',       'Rooted in Tradition, Styled for Today',                                                          'Homepage', 'Hero Headline',        'text',     10),
  ('hero_subtitle',       'Chikankari, Bandhani & Kashmiri ethnic wear — naturally beautiful, lovingly crafted for ages 2–5.', 'Homepage', 'Hero Subtitle',       'text',     20),
  ('hero_button_text',    'Shop Collection',                                                                                  'Homepage', 'Hero Button Text',     'text',     30),

  -- ── Homepage: Brand Promise ──────────────────────────────────────────────────
  ('brand_promise_label',   'The Style Saplings Promise',                                                                    'Homepage', 'Brand Promise Label',   'text',     40),
  ('brand_promise_heading', 'India''s living craft traditions, scaled for little shoulders.',                                'Homepage', 'Brand Promise Heading', 'textarea', 50),
  ('brand_promise_body',    'Every piece is handcrafted by artisans across Lucknow, Rajasthan, and Kashmir — using techniques passed down through generations.', 'Homepage', 'Brand Promise Body', 'textarea', 60),

  -- ── Homepage: Featured Products ──────────────────────────────────────────────
  ('featured_label',   'Ready to Wear',          'Homepage', 'Featured Section Label',   'text', 70),
  ('featured_heading', 'Crafted for celebrations','Homepage', 'Featured Section Heading', 'text', 80),

  -- ── Homepage: Heritage Banner ────────────────────────────────────────────────
  ('heritage_label',   'The Heritage',                                               'Homepage', 'Heritage Banner Label',  'text',     90),
  ('heritage_heading', 'Every piece carries 400 years of tradition.',                'Homepage', 'Heritage Banner Heading','textarea', 100),
  ('heritage_body',    'Hand-embroidered by master artisans from Lucknow, Rajasthan, and Kashmir.', 'Homepage', 'Heritage Banner Text', 'text', 110),
  ('heritage_button',  'Discover the Craft',                                         'Homepage', 'Heritage Banner Button', 'text',     120),

  -- ── Homepage: CTA ────────────────────────────────────────────────────────────
  ('cta_heading',      'Childhood deserves stories woven into every thread.', 'Homepage', 'CTA Heading',      'textarea', 130),
  ('cta_subtitle',     'Handcrafted in India. Made for little ones.',          'Homepage', 'CTA Subtitle',     'text',     140),
  ('cta_button_text',  'Explore the Collection',                               'Homepage', 'CTA Button Text',  'text',     150),

  -- ── About page ───────────────────────────────────────────────────────────────
  ('about_hero_label',     'Our Story',                                         'About', 'Hero Label',           'text',     10),
  ('about_hero_heading',   'We looked everywhere. So we built it ourselves.',   'About', 'Hero Heading',         'textarea', 20),
  ('about_origin_label',   'How Style Saplings Began',                          'About', 'Origin Section Label', 'text',     30),
  ('about_origin_heading', 'The Search That Started Everything',                'About', 'Origin Section Heading','text',    40),
  ('about_origin_para1',
    'When our daughter was two, we wanted to dress her in something that felt truly Indian — not a costume, but real. Something handcrafted, something that carried the warmth of our culture. What we found was either low-quality fast fashion with Indian prints slapped on, or formal occasion wear too stiff for a toddler to move in.',
    'About', 'Origin Paragraph 1', 'textarea', 50),
  ('about_origin_para2',
    'So we went directly to the artisans. We visited workshops in Lucknow, spent time in Rajasthan understanding Bandhani, and sourced from craftspeople who''ve passed their skills down through generations. Style Saplings was born from that search — a brand built on the belief that Indian children deserve to wear their heritage, comfortably and beautifully, every single day.',
    'About', 'Origin Paragraph 2', 'textarea', 60),
  ('about_crafts_heading', 'The Crafts We Celebrate',                           'About', 'Crafts Section Heading', 'text',    70),
  ('about_founder_quote',
    'Style Saplings began with a simple wish — to dress our children in the same beautiful handcrafted traditions that have defined Indian culture for generations.',
    'About', 'Founder Quote', 'textarea', 80),
  ('about_cta_heading',   'Dress Your Little One in India''s Finest Craft',    'About', 'CTA Heading',      'text',     90),
  ('about_cta_subtitle',  'Explore our collection of handcrafted ethnic wear for children aged 2-5 years. Made by skilled artisans across India.', 'About', 'CTA Subtitle', 'textarea', 100),
  ('about_cta_button',    'Explore Collection',                                 'About', 'CTA Button Text',  'text',     110),

  -- ── Footer ───────────────────────────────────────────────────────────────────
  ('footer_newsletter_tagline',  'Inspired by India''s regional artistry, designed for little celebrations.', 'Footer', 'Newsletter Tagline',  'text',     10),
  ('footer_newsletter_heading',  'Stay close to the craft.',                     'Footer', 'Newsletter Heading',  'text',     20),
  ('footer_newsletter_subtitle', 'New collections and artisan journeys, in your inbox.', 'Footer', 'Newsletter Subtitle', 'text', 30),
  ('footer_tagline',             'Inspired by India''s regional artistry and crafted for little celebrations.', 'Footer', 'Footer Tagline', 'textarea', 40),

  -- ── Announcement bar ─────────────────────────────────────────────────────────
  ('announcement_1', 'Free shipping on orders above ₹999', 'Announcement', 'Announcement 1', 'text', 10),
  ('announcement_2', 'Pan India Delivery',                  'Announcement', 'Announcement 2', 'text', 20),
  ('announcement_3', 'Handcrafted with Love',               'Announcement', 'Announcement 3', 'text', 30),

  -- ── Images ───────────────────────────────────────────────────────────────────
  ('logo_image',    '', 'Images', 'Logo Image',                   'image', 10),
  ('hero_image',    '', 'Images', 'Hero Image',                   'image', 20),
  ('craft_image_1', '', 'Images', 'Craft Image 1 (Chikankari)',   'image', 30),
  ('craft_image_2', '', 'Images', 'Craft Image 2 (Bandhani)',     'image', 40),
  ('craft_image_3', '', 'Images', 'Craft Image 3 (Firan)',        'image', 50),
  ('craft_image_4', '', 'Images', 'Craft Image 4 (Festive)',      'image', 60)

ON CONFLICT (key) DO NOTHING;

-- Grant to anon + authenticated so the frontend can read without auth
GRANT SELECT ON public.site_content TO anon, authenticated;
GRANT ALL ON public.site_content TO service_role;
