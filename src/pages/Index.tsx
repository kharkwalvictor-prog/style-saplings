import { Link } from "react-router-dom";
import { useSEO } from "@/hooks/useSEO";
import JsonLd, { ORGANIZATION_JSONLD } from "@/components/JsonLd";
import { motion } from "framer-motion";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/HeroSection";
import ProductCard from "@/components/ProductCard";
import { useProducts } from "@/hooks/useProducts";
import { ArrowRight, Star } from "lucide-react";
import { useSiteContent, getContent } from "@/hooks/useSiteContent";
import { Skeleton } from "@/components/ui/skeleton";
import heroImg from "@/assets/hero.jpg";
import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";

/* ── Animation variants ── */
const reveal = {
  hidden: { opacity: 0, y: 20, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { type: "spring", damping: 32, stiffness: 130 },
  },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

/* ── Data (built inside component using dynamic images) ── */

const testimonials = [
  { quote: "The embroidery is so delicate, the cotton incredibly soft. My daughter wore it all day and didn't want to take it off.", name: "Priya S.", location: "Mumbai" },
  { quote: "Finally — ethnic wear my son actually wants to wear. Comfortable enough for play, beautiful enough for Diwali.", name: "Ananya P.", location: "Bangalore" },
  { quote: "Three orders in. Each piece feels like an heirloom. The craftsmanship is unmatched at this price.", name: "Deepika R.", location: "Delhi" },
  { quote: "I ordered the Chikankari set for my niece's birthday. She refused to wear anything else for a week.", name: "Meera K.", location: "Pune" },
  { quote: "The fabric is breathable even in Chennai's heat. My son stayed comfortable all through the wedding.", name: "Kavita T.", location: "Chennai" },
  { quote: "Ordered the Bandhani kurta set on a whim. The quality blew me away — looks far more expensive than it is.", name: "Sneha M.", location: "Hyderabad" },
];


/* ── Shared tile component for craft + spotlight grids ── */
function ImageTile({
  image, label, title, href, titleClass = "text-[19px] md:text-[22px]",
}: {
  image: string; label: string; title: string; href: string; titleClass?: string;
}) {
  return (
    <motion.div
      variants={reveal}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", damping: 28, stiffness: 200 }}
    >
      <Link to={href} className="group block relative aspect-[3/4] rounded-2xl overflow-hidden">
        <img
          src={image} alt={title.replace("\n", " ")}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-transparent" />
        <div className="absolute bottom-0 left-0 p-4 md:p-6">
          <p className="text-white/60 text-[10px] uppercase tracking-[0.14em] mb-1.5">{label}</p>
          <h3 className={`font-serif text-white font-medium leading-tight whitespace-pre-line ${titleClass}`}>{title}</h3>
          <div className="mt-3 inline-flex items-center gap-1 text-white/50 text-[11px] group-hover:text-white/80 transition-colors">
            <span>Discover</span>
            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

const Index = () => {
  const { data: products = [], isLoading } = useProducts();
  const { data: content } = useSiteContent();

  // Dynamic images with local asset fallbacks
  const craftImg1    = content?.craft_image_1 || product1;
  const craftImg2    = content?.craft_image_2 || product2;
  const craftImg3    = content?.craft_image_3 || product3;
  const craftImg4    = content?.craft_image_4 || product4;

  const crafts = [
    { name: "Chikankari", region: "Lucknow",   image: craftImg1, href: "/shop?craft=Chikankari" },
    { name: "Bandhani",   region: "Rajasthan",  image: craftImg2, href: "/shop?craft=Bandhani" },
    { name: "Firan",      region: "Kashmir",    image: craftImg3, href: "/shop?craft=Firan" },
    { name: "Festive",    region: "Pan India",  image: craftImg4, href: "/shop?craft=Festive" },
  ];

  useSEO({
    title: "Style Saplings — Handcrafted Ethnic Wear for Little Ones",
    description: "Authentic Chikankari, Bandhani and Kashmiri ethnic wear for children aged 2-5. Made by skilled artisans. Pan India delivery.",
    canonicalPath: "/",
  });

  const featuredProducts = (() => {
    const featured = products.filter((p) => p.is_featured);
    return featured.length > 0 ? featured.slice(0, 6) : products.slice(0, 6);
  })();

  return (
    <div className="min-h-screen bg-background">
      <JsonLd data={ORGANIZATION_JSONLD} />
      <Header />

      {/* ══════════════════════════════════════
          1. HERO
      ══════════════════════════════════════ */}
      <HeroSection />

      {/* ══════════════════════════════════════
          2. CRAFT GALLERY — Full-bleed edge-to-edge strip
          No padding, no container — images fill the viewport
      ══════════════════════════════════════ */}
      <section className="bg-background pt-3 md:pt-4">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={stagger}
          className="grid grid-cols-2 md:grid-cols-4 gap-1.5 md:gap-2 px-3 md:px-4"
        >
          {crafts.map((c) => (
            <motion.div key={c.name} variants={reveal}>
              <Link to={c.href} className="group block relative aspect-[3/4] md:aspect-[2/3] overflow-hidden rounded-xl">
                <img
                  src={c.image}
                  alt={c.name}
                  className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 p-4 md:p-6">
                  <p className="text-white/55 text-[9px] md:text-[10px] uppercase tracking-[0.2em] mb-1">{c.region}</p>
                  <h3 className="font-serif text-[18px] md:text-[22px] text-white font-medium leading-tight">{c.name}</h3>
                  <div className="mt-2 inline-flex items-center gap-1 text-white/40 text-[10px] group-hover:text-white/70 transition-colors">
                    <span>Shop</span>
                    <ArrowRight className="h-2.5 w-2.5 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ══════════════════════════════════════
          3. BRAND STATEMENT — Editorial pause
          Pure typography, maximum whitespace
      ══════════════════════════════════════ */}
      <section className="py-24 md:py-40 bg-background">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={stagger}
          className="max-w-[820px] mx-auto px-5 md:px-8 text-center"
        >
          <motion.span variants={reveal} className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground block mb-8">
            The Style Saplings Promise
          </motion.span>
          <motion.h2 variants={reveal} className="font-serif text-[32px] sm:text-[44px] md:text-[58px] font-medium leading-[1.08] tracking-[-0.025em] text-foreground">
            India's living craft traditions,<br className="hidden md:block" /> scaled for little shoulders.
          </motion.h2>
          <motion.div variants={reveal} className="w-10 h-px bg-[#C06A4F] mx-auto mt-10 mb-8" />
          <motion.p variants={reveal} className="text-[16px] md:text-[18px] text-muted-foreground leading-[1.85] max-w-[520px] mx-auto">
            Every piece is handcrafted by artisans across Lucknow, Rajasthan, and Kashmir —
            using techniques passed down through generations.
          </motion.p>
          <motion.div variants={reveal} className="mt-10">
            <Link
              to="/about"
              className="inline-flex items-center gap-2 text-[13px] font-medium text-foreground border-b border-foreground/20 pb-0.5 hover:border-foreground/60 transition-colors group"
            >
              Our story
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════
          4. FEATURED PRODUCTS — Clean grid
          Left-aligned heading, 2×3 product grid
      ══════════════════════════════════════ */}
      <section className="pb-24 md:pb-32 bg-background">
        <div className="container px-5 md:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="flex items-end justify-between mb-8 md:mb-12"
          >
            <div>
              <motion.p variants={reveal} className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-3">
                Ready to Wear
              </motion.p>
              <motion.h2 variants={reveal} className="font-serif text-[28px] md:text-[42px] font-medium tracking-[-0.02em] leading-[1.1]">
                {getContent(content, "featured_heading", "Crafted for celebrations")}
              </motion.h2>
            </div>
            <motion.div variants={reveal}>
              <Link
                to="/shop"
                className="group hidden md:flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground hover:text-foreground transition-colors shrink-0 ml-8"
              >
                View all
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </motion.div>
          </motion.div>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-[3/4] rounded-2xl" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              ))}
            </div>
          ) : (
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6"
            >
              {featuredProducts.map((product, i) => (
                <motion.div key={product.id} variants={reveal}>
                  <ProductCard product={product} index={i} />
                </motion.div>
              ))}
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="mt-10 md:mt-14 text-center md:hidden"
          >
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 text-[13px] font-medium text-foreground border-b border-foreground/20 pb-0.5 hover:border-foreground/60 transition-colors group"
            >
              View full collection
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          5. HERITAGE BANNER — Full-bleed, edge to edge
      ══════════════════════════════════════ */}
      <section className="relative h-[60vh] md:h-[75vh] min-h-[380px] overflow-hidden">
        <img
          src={heroImg}
          alt="Handcrafted Indian heritage"
          className="w-full h-full object-cover object-[center_20%]"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-transparent" />
        <div className="absolute inset-0 flex items-center">
          <div className="container px-5 md:px-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={stagger}
              className="max-w-[560px]"
            >
              <motion.p variants={reveal} className="text-white/55 text-[10px] uppercase tracking-[0.32em] mb-6">
                The Heritage
              </motion.p>
              <motion.h2 variants={reveal} className="font-serif text-[32px] sm:text-[40px] md:text-[54px] text-white font-medium leading-[1.08] tracking-[-0.02em]">
                Every piece carries 400 years of tradition.
              </motion.h2>
              <motion.p variants={reveal} className="text-white/60 text-[15px] mt-6 mb-10 max-w-[380px] leading-[1.8]">
                Hand-embroidered by master artisans from Lucknow, Rajasthan, and Kashmir.
              </motion.p>
              <motion.div variants={reveal}>
                <Link
                  to="/about"
                  className="inline-flex items-center gap-2.5 border border-white/25 rounded-full px-8 py-3.5 text-white text-[13px] font-medium hover:bg-white/10 transition-all group min-h-[44px]"
                >
                  Discover the Craft
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          6. TESTIMONIALS — No cards, large editorial quotes
      ══════════════════════════════════════ */}
      <section className="py-24 md:py-36 bg-background">
        <div className="container px-5 md:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="mb-16 md:mb-20"
          >
            <motion.p variants={reveal} className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-3">
              What parents say
            </motion.p>
            <motion.h2 variants={reveal} className="font-serif text-[28px] md:text-[42px] font-medium tracking-[-0.02em]">
              Loved across India
            </motion.h2>
          </motion.div>

          {/* 3 featured testimonials — no cards, pure typography */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16"
          >
            {testimonials.slice(0, 3).map((t) => (
              <motion.div key={t.name} variants={reveal}>
                <div className="flex gap-0.5 mb-5">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} className="h-3 w-3 text-amber-400" fill="currentColor" />
                  ))}
                </div>
                <p className="font-serif italic text-[17px] md:text-[18px] leading-[1.85] text-foreground/75 mb-6">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="w-6 h-px bg-[#C06A4F] mb-4" />
                <p className="text-[13px] font-medium text-foreground">{t.name}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5 uppercase tracking-[0.12em]">{t.location}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          9. CTA — The ONE dark contrast moment
      ══════════════════════════════════════ */}
      <section className="py-20 md:py-36 bg-[#1E3320] relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.025] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0id2hpdGUiLz48L3N2Zz4=')] pointer-events-none" />
        <div className="container px-5 md:px-8 relative">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="max-w-xl mx-auto text-center">
            <motion.span variants={reveal} className="text-white/35 text-[10px] uppercase tracking-[0.28em] block mb-7">Style Saplings</motion.span>
            <motion.h2 variants={reveal} className="font-serif text-[28px] md:text-[48px] lg:text-[56px] text-white font-medium leading-[1.1] tracking-[-0.01em]">
              {getContent(content, "cta_heading", "Childhood deserves stories woven into every thread.")}
            </motion.h2>
            <motion.p variants={reveal} className="text-white/55 text-[14px] mt-6 max-w-xs mx-auto leading-relaxed">
              {getContent(content, "cta_subtitle", "Handcrafted in India. Made for little ones.")}
            </motion.p>
            <motion.div variants={reveal}>
              <Link to="/shop" className="inline-flex items-center gap-2 mt-9 border border-white/20 rounded-full px-8 py-3.5 text-white text-[13px] font-medium tracking-wide hover:bg-white/10 transition-all group min-h-[44px]">
                {getContent(content, "cta_button_text", "Explore the Collection")}
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
