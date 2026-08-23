import { Link } from "react-router-dom";
import { useSEO } from "@/hooks/useSEO";
import JsonLd, { ORGANIZATION_JSONLD } from "@/components/JsonLd";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useRef } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
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

const marqueeItems = [...testimonials, ...testimonials];

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
          <h3 className={`font-serif text-white font-semibold leading-tight whitespace-pre-line ${titleClass}`}>{title}</h3>
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
  const heroImage    = content?.hero_image    || heroImg;
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

  const spotlight = [
    { label: "New In",     title: "Summer\nCollection",  image: craftImg1, href: "/shop" },
    { label: "Chikankari", title: "The Art of\nLucknow", image: craftImg2, href: "/shop?craft=Chikankari" },
    { label: "Festive",    title: "Celebration\nPieces", image: craftImg3, href: "/shop?craft=Festive" },
    { label: "Gift Guide", title: "For Little\nOnes",    image: craftImg4, href: "/shop" },
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

  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress: heroProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroImageY = useSpring(useTransform(heroProgress, [0, 1], [0, 160]), { damping: 30, stiffness: 90 });
  const heroFade  = useTransform(heroProgress, [0, 0.6], [1, 0]);
  const heroLift  = useTransform(heroProgress, [0, 0.6], [0, 60]);

  return (
    <div className="min-h-screen bg-background">
      <JsonLd data={ORGANIZATION_JSONLD} />
      <Header />

      {/* ══════════════════════════════════════
          1. HERO
      ══════════════════════════════════════ */}
      <section ref={heroRef} className="relative h-[100svh] min-h-[500px] overflow-hidden">
        <motion.div className="absolute inset-0" style={{ y: heroImageY }}>
          <img src={heroImage} alt="" className="w-full h-[120%] object-cover object-[center_20%] md:object-center" loading="eager" fetchPriority="high" />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/50" />

        <motion.div style={{ opacity: heroFade, y: heroLift }} className="relative z-10 h-full flex flex-col items-center justify-center text-center px-5">
          <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-2xl">
            <motion.p variants={reveal} className="text-white/60 text-[11px] uppercase tracking-[0.3em] mb-5">
              Est. 2024 &nbsp;·&nbsp; Handcrafted in India
            </motion.p>
            <motion.h1 variants={reveal} className="font-serif text-[34px] sm:text-[60px] md:text-[78px] lg:text-[96px] font-semibold text-white leading-[1.02] tracking-[-0.02em] [text-shadow:_0_2px_24px_rgba(0,0,0,0.35)]">
              {getContent(content, "hero_headline", "Childhood, woven with tradition.")}
            </motion.h1>
            <motion.p variants={reveal} className="text-white/80 text-[15px] md:text-[19px] mt-6 mb-9 max-w-sm mx-auto leading-[1.75]">
              {getContent(content, "hero_subtitle", "Regional artistry, reimagined for modern childhood.")}
            </motion.p>
            <motion.div variants={reveal} className="flex items-center justify-center gap-6">
              <Link to="/shop" className="bg-[#4A6B45] rounded-full px-8 py-3.5 text-white text-[13px] font-medium tracking-wide hover:bg-[#3D5C39] transition-colors min-h-[44px] flex items-center">
                {getContent(content, "hero_cta_primary", "Shop Collection")}
              </Link>
              <Link to="/about" className="text-white/70 text-[13px] font-medium hover:text-white transition-colors min-h-[44px] flex items-center">
                {getContent(content, "hero_cta_secondary", "Our Story")}
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.2, duration: 1 }}
          className="absolute bottom-9 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2" style={{ opacity: heroFade }}>
          <span className="text-white/35 text-[10px] uppercase tracking-[0.22em]">Scroll</span>
          <motion.div animate={{ scaleY: [0, 1, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }} className="w-px h-9 bg-white/35 origin-top" />
        </motion.div>
      </section>

      {/* ══════════════════════════════════════
          2. SHOP BY CRAFT — 4 tiles, immediately after hero
      ══════════════════════════════════════ */}
      <section className="pt-10 pb-10 md:pt-12 md:pb-12 bg-background">
        <div className="container px-5 md:px-8">
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
            className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground mb-6 md:mb-7">
            Shop by Craft
          </motion.p>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} variants={stagger}
            className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {crafts.map((c) => (
              <ImageTile key={c.name} image={c.image} label={c.region} title={c.name} href={c.href} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          3. EDITORIAL PAIR — 2 wide images, overlaid text.
          AD's "Hands Free, Hearts Full" equivalent.
      ══════════════════════════════════════ */}
      <section className="pt-10 pb-10 md:pt-12 md:pb-0 bg-background">
        <div className="container px-5 md:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} variants={stagger}
            className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <motion.div variants={reveal}>
              <Link to="/about" className="group block relative aspect-[4/3] md:aspect-[4/5] rounded-2xl overflow-hidden">
                <img src={craftImg1} alt="The Craft" className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 p-6 md:p-8">
                  <p className="text-white/60 text-[11px] uppercase tracking-[0.18em] mb-2">The Craft</p>
                  <h3 className="font-serif text-[24px] md:text-[30px] text-white font-semibold leading-tight max-w-[220px]">
                    400 years of living tradition
                  </h3>
                  <div className="mt-4 inline-flex items-center gap-1.5 text-white/55 text-[12px] group-hover:text-white/90 transition-colors">
                    <span>Our story</span>
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
              </Link>
            </motion.div>
            <motion.div variants={reveal}>
              <Link to="/shop" className="group block relative aspect-[4/3] md:aspect-[4/5] rounded-2xl overflow-hidden">
                <img src={craftImg3} alt="New Collection" className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 p-6 md:p-8">
                  <p className="text-white/60 text-[11px] uppercase tracking-[0.18em] mb-2">New In</p>
                  <h3 className="font-serif text-[24px] md:text-[30px] text-white font-semibold leading-tight max-w-[220px]">
                    {getContent(content, "featured_heading", "Crafted for celebrations")}
                  </h3>
                  <div className="mt-4 inline-flex items-center gap-1.5 text-white/55 text-[12px] group-hover:text-white/90 transition-colors">
                    <span>Shop now</span>
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          5. FEATURED PRODUCTS — Swimlane.
          AD's "Ready to Ship" equivalent.
          Heading left-aligned, products scroll right.
      ══════════════════════════════════════ */}
      <section className="pt-12 pb-12 md:pt-16 md:pb-16 bg-background">
        <div className="container px-5 md:px-8 mb-7 md:mb-9">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
            className="flex items-end justify-between">
            <div>
              <motion.p variants={reveal} className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground mb-3">
                Ready to Wear
              </motion.p>
              <motion.h2 variants={reveal} className="font-serif text-[26px] md:text-[40px] font-semibold tracking-[-0.01em] leading-tight">
                {getContent(content, "featured_heading", "Crafted for celebrations")}
              </motion.h2>
            </div>
            <motion.div variants={reveal}>
              <Link to="/shop" className="group flex items-center gap-1 text-[12px] font-medium text-muted-foreground hover:text-foreground transition-colors shrink-0 ml-6">
                View all <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {isLoading ? (
          <div className="flex gap-4 px-5 md:px-8 overflow-hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="w-[65vw] md:w-[calc(25%-12px)] flex-shrink-0 space-y-3">
                <Skeleton className="aspect-[3/4] rounded-2xl" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
            className="flex gap-3 md:gap-4 overflow-x-auto snap-x snap-mandatory px-5 md:px-8 pb-1"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {featuredProducts.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07, duration: 0.45, ease: "easeOut" }}
                className="w-[65vw] sm:w-[45vw] md:w-[calc(25%-9px)] flex-shrink-0 snap-start"
              >
                <ProductCard product={product} index={i} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>

      {/* ══════════════════════════════════════
          6. HERITAGE BANNER — Full-bleed editorial moment.
          Text + CTA overlay. AD's "editorial banner" equivalent.
          Tells the brand story mid-scroll, links to /about.
      ══════════════════════════════════════ */}
      <section className="relative h-[50vh] md:h-[62vh] min-h-[300px] overflow-hidden">
        <img
          src={craftImg2}
          alt="Handcrafted Indian heritage"
          className="w-full h-full object-cover object-center"
          loading="lazy"
        />
        {/* Gradient left-heavy so text stays readable */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/30 to-black/5" />

        <div className="absolute inset-0 flex items-center">
          <div className="container px-5 md:px-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={stagger}
              className="max-w-[520px]"
            >
              <motion.p variants={reveal} className="text-white/60 text-[11px] uppercase tracking-[0.28em] mb-4">
                The Heritage
              </motion.p>
              <motion.h2 variants={reveal} className="font-serif text-[26px] sm:text-[34px] md:text-[46px] text-white font-semibold leading-[1.1] tracking-[-0.01em]">
                Every piece carries 400 years of tradition.
              </motion.h2>
              <motion.p variants={reveal} className="text-white/65 text-[14px] mt-4 mb-8 max-w-[340px] leading-[1.7]">
                Hand-embroidered by master artisans from Lucknow, Rajasthan, and Kashmir — for little ones who deserve to wear India's finest.
              </motion.p>
              <motion.div variants={reveal}>
                <Link
                  to="/about"
                  className="inline-flex items-center gap-2 border border-white/30 rounded-full px-7 py-3 text-white text-[13px] font-medium hover:bg-white/10 transition-all group min-h-[44px]"
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
          7. IN THE SPOTLIGHT — 4 tiles.
          Same grid as "Shop by Craft" — visual rhythm.
          Flows directly from featured (no break between them).
      ══════════════════════════════════════ */}
      <section className="pb-12 md:pb-16 bg-background">
        <div className="container px-5 md:px-8">
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
            className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground mb-6 md:mb-7">
            In the Spotlight
          </motion.p>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} variants={stagger}
            className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {spotlight.map((item) => (
              <ImageTile key={item.title} image={item.image} label={item.label} title={item.title} href={item.href} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          8. TESTIMONIALS — Infinite marquee
      ══════════════════════════════════════ */}
      <section className="pt-12 pb-12 md:pt-16 md:pb-16 bg-background overflow-hidden">
        <div className="container px-5 md:px-8 mb-8 md:mb-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.p variants={reveal} className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground mb-3">
              Reviews
            </motion.p>
            <motion.h2 variants={reveal} className="font-serif text-[26px] md:text-[40px] font-semibold tracking-[-0.01em]">
              Loved by parents across India
            </motion.h2>
          </motion.div>
        </div>

        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-10 md:w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-10 md:w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
          <motion.div className="flex gap-4 w-max px-5 md:px-8" animate={{ x: ["0%", "-50%"] }} transition={{ duration: 42, repeat: Infinity, ease: "linear" }}>
            {marqueeItems.map((t, i) => (
              <div key={`${t.name}-${i}`} className="w-[280px] md:w-[340px] border border-border/40 rounded-2xl p-6 md:p-7 flex-shrink-0">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: 5 }).map((_, j) => <Star key={j} className="h-3 w-3 text-amber-400" fill="currentColor" />)}
                </div>
                <p className="font-serif italic text-[14px] md:text-[15px] leading-[1.8] text-foreground/80 mb-5">&ldquo;{t.quote}&rdquo;</p>
                <div className="w-5 h-px bg-border mb-3" />
                <p className="text-[12px] font-medium">{t.name}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{t.location}</p>
              </div>
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
            <motion.h2 variants={reveal} className="font-serif text-[28px] md:text-[48px] lg:text-[56px] text-white font-semibold leading-[1.1] tracking-[-0.01em]">
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
