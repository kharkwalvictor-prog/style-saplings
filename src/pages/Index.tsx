import { Link } from "react-router-dom";
import { useSEO } from "@/hooks/useSEO";
import JsonLd, { ORGANIZATION_JSONLD } from "@/components/JsonLd";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useRef } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/ProductCard";
import { useProducts } from "@/hooks/useProducts";
import { ArrowRight, Sparkles, ShieldCheck, Ruler, Truck, Star } from "lucide-react";
import { useSiteContent, getContent } from "@/hooks/useSiteContent";
import { Skeleton } from "@/components/ui/skeleton";
import heroImg from "@/assets/hero.jpg";
import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";

/* ── Smooth spring animation ── */
const reveal = {
  hidden: { opacity: 0, y: 30, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { type: "spring", damping: 30, stiffness: 120 },
  },
};

const imageReveal = {
  hidden: { opacity: 0, scale: 1.04, filter: "blur(3px)" },
  visible: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 1.4, ease: [0.22, 1, 0.36, 1] },
  },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

/* ── Data ── */
const regions = [
  { name: "Lucknow", craft: "Chikankari", line: "Timeless embroidery, gentle on skin.", image: product1 },
  { name: "Kashmir", craft: "Firan", line: "Mountain traditions, woven in warmth.", image: product3 },
  { name: "Rajasthan", craft: "Bandhani", line: "Playful tie-dye, reimagined for play.", image: product2 },
  { name: "Punjab", craft: "Phulkari", line: "Floral threadwork in pure cotton.", image: product4 },
  { name: "Gujarat", craft: "Patola", line: "Double-weave heritage, soft to touch.", image: product1 },
];

const testimonials = [
  {
    quote: "The embroidery is so delicate, the cotton incredibly soft. My daughter wore it all day at her nani's house and didn't want to take it off.",
    name: "Priya S.",
    location: "Mumbai",
  },
  {
    quote: "Finally — ethnic wear my son actually wants to wear. Comfortable enough for play, beautiful enough for Diwali.",
    name: "Ananya P.",
    location: "Bangalore",
  },
  {
    quote: "Three orders in. Each piece feels like an heirloom. The craftsmanship is unmatched at this price.",
    name: "Deepika R.",
    location: "Delhi",
  },
];

const Index = () => {
  const { data: products = [], isLoading } = useProducts();
  const { data: content } = useSiteContent();
  useSEO({
    title: "Style Saplings — Handcrafted Ethnic Wear for Little Ones",
    description:
      "Authentic Chikankari, Bandhani and Kashmiri ethnic wear for children aged 2-5. Made by skilled artisans. Pan India delivery.",
    canonicalPath: "/",
  });

  const featuredProducts = (() => {
    const featured = products.filter((p) => p.is_featured);
    return featured.length > 0 ? featured.slice(0, 4) : products.slice(0, 4);
  })();

  /* Hero parallax */
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroImageY = useSpring(useTransform(heroProgress, [0, 1], [0, 200]), {
    damping: 30,
    stiffness: 90,
  });
  const heroFade = useTransform(heroProgress, [0, 0.6], [1, 0]);
  const heroLift = useTransform(heroProgress, [0, 0.6], [0, 80]);

  /* Craft section parallax */
  const craftRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: craftScroll } = useScroll({
    target: craftRef,
    offset: ["start end", "end start"],
  });
  const craftImageY = useTransform(craftScroll, [0, 1], [-30, 30]);

  return (
    <div className="min-h-screen bg-background">
      <JsonLd data={ORGANIZATION_JSONLD} />
      <Header />

      {/* ═══════════════════════════════════════════════════
          HERO — Cinematic, emotional, minimal copy
      ═══════════════════════════════════════════════════ */}
      <section ref={heroRef} className="relative h-[100svh] min-h-[500px] md:min-h-[650px] overflow-hidden">
        <motion.div className="absolute inset-0" style={{ y: heroImageY }}>
          <img
            src={heroImg}
            alt=""
            className="w-full h-[120%] object-cover"
            loading="eager"
            fetchPriority="high"
          />
        </motion.div>
        {/* Overlay: moderate, readable */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/15 to-black/55" />

        <motion.div
          style={{ opacity: heroFade, y: heroLift }}
          className="relative z-10 h-full flex flex-col items-center justify-center text-center px-5 md:px-6"
        >
          <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-2xl">
            <motion.h1
              variants={reveal}
              className="font-serif text-[32px] sm:text-[58px] md:text-[72px] lg:text-[84px] font-semibold text-white leading-[1.04] tracking-[-0.02em] [text-shadow:_0_2px_20px_rgba(0,0,0,0.4)]"
            >
              {getContent(content, "hero_headline", "Childhood, woven with tradition.")}
            </motion.h1>

            <motion.p
              variants={reveal}
              className="text-white/85 text-[15px] md:text-[22px] mt-7 mb-10 max-w-md mx-auto leading-[1.7] [text-shadow:_0_1px_15px_rgba(0,0,0,0.2)]"
            >
              {getContent(content, "hero_subtitle", "Regional artistry, reimagined for modern childhood.")}
            </motion.p>

            <motion.div
              variants={reveal}
              className="flex items-center justify-center gap-6"
            >
              <Link
                to="/shop"
                className="bg-[#4A6B45] border border-[#4A6B45] rounded-full px-8 py-3.5 text-white text-[14px] font-medium tracking-wide hover:bg-[#3D5C39] transition-all min-h-[44px]"
              >
                {getContent(content, "hero_cta_primary", "Shop Collection")}
              </Link>
              <Link
                to="/about"
                className="text-white/75 text-[14px] font-medium hover:text-white transition-colors min-h-[44px] flex items-center"
              >
                {getContent(content, "hero_cta_secondary", "Our Story")}
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Scroll line */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10"
          style={{ opacity: heroFade }}
        >
          <motion.div
            animate={{ scaleY: [0, 1, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-px h-10 bg-white/40 origin-top"
          />
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════
          EXPLORE INDIA — Signature section, asymmetric grid
      ═══════════════════════════════════════════════════ */}
      <section className="py-12 md:py-44 bg-background">
        <div className="container px-5 md:px-8">
          {/* Left-aligned heading — NOT centered, editorial feel */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
            className="mb-10 md:mb-24 max-w-lg"
          >
            <motion.h2
              variants={reveal}
              className="font-serif text-[28px] md:text-[54px] font-semibold leading-[1.04] tracking-[-0.025em]"
            >
              {getContent(content, "explore_heading", "Explore India through clothing.")}
            </motion.h2>
            <motion.p
              variants={reveal}
              className="text-muted-foreground text-[16px] mt-5 leading-relaxed"
            >
              {getContent(content, "explore_subtitle", "Centuries of tradition, one collection.")}
            </motion.p>
          </motion.div>

          {/* Consistent 4:5 cards — editorial covers, not random grid */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            variants={stagger}
            className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-5"
          >
            {regions.map((region) => (
              <motion.div
                key={region.name}
                variants={reveal}
                whileHover={{ y: -5 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
              >
                <Link
                  to={`/shop?craft=${region.craft}`}
                  className="group block relative aspect-[4/5] rounded-2xl overflow-hidden min-h-[44px]"
                >
                  <img
                    src={region.image}
                    alt={region.name}
                    className="w-full h-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-5 md:p-6">
                    <p className="text-white/80 text-[13px] uppercase tracking-[0.12em] mb-1.5">
                      {region.craft}
                    </p>
                    <h3 className="font-serif text-[22px] md:text-[24px] text-white font-semibold leading-tight">
                      {region.name}
                    </h3>
                    <p className="text-white/80 text-[13px] mt-2 leading-snug hidden md:block">
                      {region.line}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          CRAFT STORY — Editorial, asymmetric, emotional
      ═══════════════════════════════════════════════════ */}
      <section className="py-12 md:py-40 bg-[#EDE7DE]" ref={craftRef}>
        <div className="container px-5 md:px-8">
          <div className="grid md:grid-cols-12 gap-10 md:gap-0 items-center">
            {/* Image — shown first on mobile (order-first), text below */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={stagger}
              className="md:col-span-5 order-2 md:order-1"
            >
              <motion.span
                variants={reveal}
                className="text-[13px] uppercase tracking-[0.2em] text-[#4A6B45] font-medium block mb-5"
              >
                {getContent(content, "craft_label", "The Craft")}
              </motion.span>
              <motion.h2
                variants={reveal}
                className="font-serif text-[32px] md:text-[42px] font-medium leading-[1.12] tracking-[-0.01em] mb-7"
              >
                {getContent(content, "craft_heading", "Every stitch tells a story of generations.")}
              </motion.h2>
              <motion.p
                variants={reveal}
                className="text-[16px] text-foreground/75 leading-[1.8] max-w-[360px] mb-8"
              >
                {getContent(content, "craft_body", "Pure cotton mulmul, hand-embroidered over 400 years of tradition. No machines — just patience and pride.")}
              </motion.p>
              <motion.div variants={reveal}>
                <Link
                  to="/about"
                  className="inline-flex items-center gap-2 text-[14px] font-medium text-foreground group"
                >
                  <span className="relative after:absolute after:bottom-[-3px] after:left-0 after:w-full after:h-px after:bg-foreground/30 after:origin-left after:scale-x-100 group-hover:after:bg-foreground after:transition-colors after:duration-300">
                    {getContent(content, "craft_link_text", "Meet the artisans")}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </Link>
              </motion.div>
            </motion.div>

            {/* Image — right, with parallax */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={imageReveal}
              className="md:col-span-6 md:col-start-7 order-1 md:order-2"
            >
              <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl shadow-black/10">
                <motion.img
                  src={product2}
                  alt="Artisan handcrafting ethnic wear"
                  className="w-full h-full object-cover"
                  loading="lazy"
                  style={{ y: craftImageY }}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          LIFESTYLE BREAK — Full-width image, no text
      ═══════════════════════════════════════════════════ */}
      <section className="relative h-[40vh] md:h-[50vh] min-h-[280px] overflow-hidden">
        <img
          src={product4}
          alt="Children in ethnic wear"
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/10" />
      </section>

      {/* ═══════════════════════════════════════════════════
          FEATURED — Minimal, big imagery, breathing room
      ═══════════════════════════════════════════════════ */}
      <section className="py-12 md:py-36 bg-background">
        <div className="container px-5 md:px-8">
          <div className="flex items-end justify-between mb-12 md:mb-16">
            <motion.h2
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={reveal}
              className="font-serif text-[28px] md:text-[40px] font-semibold tracking-[-0.01em]"
            >
              {getContent(content, "featured_heading", "Crafted for celebrations")}
            </motion.h2>
            <Link
              to="/shop"
              className="group flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              View all
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-8">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-4">
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
              viewport={{ once: true, margin: "-60px" }}
              variants={stagger}
              className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-8"
            >
              {featuredProducts.map((product) => (
                <motion.div key={product.id} variants={reveal}>
                  <ProductCard product={product} index={0} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          SOCIAL PROOF — Testimonials, warm background
      ═══════════════════════════════════════════════════ */}
      <section className="py-12 md:py-32 bg-[#EDE7DE]">
        <div className="container px-5 md:px-8">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={reveal}
            className="font-serif text-[28px] md:text-[40px] font-semibold text-center mb-14 md:mb-18 tracking-[-0.01em]"
          >
            Loved by parents across India
          </motion.h2>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8"
          >
            {testimonials.map((t) => (
              <motion.div
                key={t.name}
                variants={reveal}
                className="bg-background rounded-3xl p-6 md:p-10"
              >
                <div className="flex gap-1 mb-5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-[14px] w-[14px] text-amber-400" fill="currentColor" />
                  ))}
                </div>
                <p className="font-serif italic text-[17px] md:text-[18px] leading-[1.7] text-foreground/90 mb-6">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="w-8 h-px bg-border mb-4" />
                <p className="text-[14px] font-medium">{t.name}</p>
                <p className="text-[13px] text-muted-foreground mt-0.5">{t.location}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          FINAL CTA — Emotional close, cinematic
      ═══════════════════════════════════════════════════ */}
      <section className="py-16 md:py-44 bg-[#1E3320] relative overflow-hidden">
        {/* Subtle texture */}
        <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0id2hpdGUiLz48L3N2Zz4=')] pointer-events-none" />

        <div className="container px-5 md:px-8 relative">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="max-w-2xl mx-auto text-center"
          >
            <motion.h2
              variants={reveal}
              className="font-serif text-[28px] md:text-[52px] lg:text-[60px] text-white font-semibold leading-[1.08] tracking-[-0.01em]"
            >
              {getContent(content, "cta_heading", "Childhood deserves stories woven into every thread.")}
            </motion.h2>
            <motion.p
              variants={reveal}
              className="text-white/75 text-[16px] mt-6 max-w-sm mx-auto leading-relaxed"
            >
              {getContent(content, "cta_subtitle", "Handcrafted in India. Made for little ones.")}
            </motion.p>
            <motion.div variants={reveal}>
              <Link
                to="/shop"
                className="inline-flex items-center gap-2.5 mt-10 bg-white/15 backdrop-blur-sm border border-white/30 rounded-full px-9 py-4 text-white text-[14px] font-medium tracking-wide hover:bg-white/25 transition-all group min-h-[44px]"
              >
                {getContent(content, "cta_button_text", "Explore the Collection")}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          TRUST — Minimal single strip
      ═══════════════════════════════════════════════════ */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="border-t border-border py-10 md:py-12 bg-background"
      >
        <div className="container px-6 md:px-8">
          <div className="grid grid-cols-2 md:flex md:flex-wrap items-center justify-center gap-4 md:gap-0 md:divide-x md:divide-border">
            {[
              { icon: Sparkles, label: "Handcrafted" },
              { icon: ShieldCheck, label: "Pure Cotton" },
              { icon: Ruler, label: "Ages 2\u20135" },
              { icon: Truck, label: "Free Shipping \u20B9999+" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center justify-center gap-2.5 px-4 md:px-10">
                <Icon className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                <span className="text-[13px] uppercase tracking-[0.1em] text-muted-foreground">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      <Footer />
    </div>
  );
};

export default Index;
