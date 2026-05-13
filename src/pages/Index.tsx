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
      <section ref={heroRef} className="relative h-[100svh] min-h-[650px] overflow-hidden">
        <motion.div className="absolute inset-0" style={{ y: heroImageY }}>
          <img
            src={heroImg}
            alt=""
            className="w-full h-[120%] object-cover"
            loading="eager"
            fetchPriority="high"
          />
        </motion.div>
        {/* Localized vignette — only where text lives, preserves image richness */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(26,43,34,0.35)_0%,_transparent_70%)]" />
        <div className="absolute bottom-0 left-0 right-0 h-[45%] bg-gradient-to-t from-[#1A2B22]/50 to-transparent" />

        <motion.div
          style={{ opacity: heroFade, y: heroLift }}
          className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6"
        >
          <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-2xl">
            <motion.h1
              variants={reveal}
              className="font-serif text-[42px] sm:text-[58px] md:text-[72px] lg:text-[84px] font-semibold text-[#F7F1E8] leading-[1.04] tracking-[-0.02em] drop-shadow-[0_2px_20px_rgba(26,43,34,0.3)]"
            >
              Childhood, woven
              <br />
              with <em className="italic font-normal text-[#F7F1E8]/75">tradition.</em>
            </motion.h1>

            <motion.p
              variants={reveal}
              className="text-[#F7F1E8]/50 text-[16px] md:text-[19px] mt-7 mb-10 max-w-md mx-auto leading-[1.7] drop-shadow-[0_1px_8px_rgba(26,43,34,0.2)]"
            >
              Regional artistry, reimagined for modern childhood.
            </motion.p>

            <motion.div
              variants={reveal}
              className="flex items-center justify-center gap-6"
            >
              <Link
                to="/shop"
                className="bg-[#F7F1E8]/10 border border-[#F7F1E8]/15 rounded-full px-8 py-3.5 text-[#F7F1E8] text-[13px] font-medium tracking-wide hover:bg-[#F7F1E8]/18 transition-all"
              >
                Shop Collection
              </Link>
              <Link
                to="/about"
                className="text-[#F7F1E8]/45 text-[13px] font-medium hover:text-[#F7F1E8]/75 transition-colors"
              >
                Our Story
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
            className="w-px h-10 bg-white/25 origin-top"
          />
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════
          EXPLORE INDIA — Signature section, asymmetric grid
      ═══════════════════════════════════════════════════ */}
      <section className="py-28 md:py-44 bg-background">
        <div className="container px-6 md:px-8">
          {/* Left-aligned heading — NOT centered, editorial feel */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
            className="mb-16 md:mb-24 max-w-lg"
          >
            <motion.h2
              variants={reveal}
              className="font-serif text-[36px] md:text-[54px] font-semibold leading-[1.04] tracking-[-0.025em]"
            >
              Explore India
              <br />
              through <em className="italic font-normal">clothing.</em>
            </motion.h2>
            <motion.p
              variants={reveal}
              className="text-muted-foreground text-[15px] mt-5 leading-relaxed"
            >
              Centuries of tradition, one collection.
            </motion.p>
          </motion.div>

          {/* Consistent 4:5 cards — editorial covers, not random grid */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            variants={stagger}
            className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-5"
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
                  className="group block relative aspect-[4/5] rounded-2xl overflow-hidden"
                >
                  <img
                    src={region.image}
                    alt={region.name}
                    className="w-full h-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-5 md:p-6">
                    <p className="text-[#F7F1E8]/45 text-[12px] uppercase tracking-[0.12em] mb-1.5">
                      {region.craft}
                    </p>
                    <h3 className="font-serif text-[20px] md:text-[22px] text-[#F7F1E8] font-semibold leading-tight">
                      {region.name}
                    </h3>
                    <p className="text-[#F7F1E8]/35 text-[13px] mt-2 leading-snug hidden md:block">
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
      <section className="py-28 md:py-40 bg-[#F0EBE1]" ref={craftRef}>
        <div className="container px-6 md:px-8">
          <div className="grid md:grid-cols-12 gap-12 md:gap-0 items-center">
            {/* Text — left */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={stagger}
              className="md:col-span-5"
            >
              <motion.span
                variants={reveal}
                className="text-[12px] uppercase tracking-[0.2em] text-[#C4785A] font-medium block mb-5"
              >
                The Craft
              </motion.span>
              <motion.h2
                variants={reveal}
                className="font-serif text-[32px] md:text-[42px] font-medium leading-[1.12] tracking-[-0.01em] mb-7"
              >
                Every stitch tells
                <br />
                a story of
                <br />
                <em className="italic">generations.</em>
              </motion.h2>
              <motion.p
                variants={reveal}
                className="text-[15px] text-muted-foreground leading-[1.8] max-w-[360px] mb-8"
              >
                Pure cotton mulmul, hand-embroidered over 400 years
                of tradition. No machines — just patience and pride.
              </motion.p>
              <motion.div variants={reveal}>
                <Link
                  to="/about"
                  className="inline-flex items-center gap-2 text-[13px] font-medium text-foreground group"
                >
                  <span className="relative after:absolute after:bottom-[-3px] after:left-0 after:w-full after:h-px after:bg-foreground/30 after:origin-left after:scale-x-100 group-hover:after:bg-foreground after:transition-colors after:duration-300">
                    Meet the artisans
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
              className="md:col-span-6 md:col-start-7"
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
      <section className="py-24 md:py-36 bg-background">
        <div className="container px-6 md:px-8">
          <div className="flex items-end justify-between mb-12 md:mb-16">
            <motion.h2
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={reveal}
              className="font-serif text-[28px] md:text-[40px] font-semibold tracking-[-0.01em]"
            >
              Crafted for celebrations
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-8">
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
              className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-8"
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
      <section className="py-24 md:py-32 bg-[#F0EBE1]">
        <div className="container px-6 md:px-8">
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
            className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8"
          >
            {testimonials.map((t) => (
              <motion.div
                key={t.name}
                variants={reveal}
                className="bg-background rounded-3xl p-8 md:p-10"
              >
                <div className="flex gap-1 mb-5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-[14px] w-[14px] text-amber-400" fill="currentColor" />
                  ))}
                </div>
                <p className="font-serif italic text-[16px] md:text-[17px] leading-[1.7] text-foreground/85 mb-6">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="w-8 h-px bg-border mb-4" />
                <p className="text-[13px] font-medium">{t.name}</p>
                <p className="text-[12px] text-muted-foreground mt-0.5">{t.location}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          FINAL CTA — Emotional close, cinematic
      ═══════════════════════════════════════════════════ */}
      <section className="py-32 md:py-44 bg-[#1A2B22] relative overflow-hidden">
        {/* Subtle texture */}
        <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0id2hpdGUiLz48L3N2Zz4=')] pointer-events-none" />

        <div className="container px-6 md:px-8 relative">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="max-w-2xl mx-auto text-center"
          >
            <motion.h2
              variants={reveal}
              className="font-serif text-[34px] md:text-[52px] lg:text-[60px] text-white font-semibold leading-[1.08] tracking-[-0.01em]"
            >
              Childhood deserves
              <br />
              stories woven into
              <br />
              <em className="italic font-normal text-white/70">every thread.</em>
            </motion.h2>
            <motion.p
              variants={reveal}
              className="text-white/50 text-[15px] mt-6 max-w-sm mx-auto leading-relaxed"
            >
              Handcrafted in India. Made for little ones.
            </motion.p>
            <motion.div variants={reveal}>
              <Link
                to="/shop"
                className="inline-flex items-center gap-2.5 mt-10 bg-white/10 backdrop-blur-sm border border-white/15 rounded-full px-9 py-4 text-white text-[13px] font-medium tracking-wide hover:bg-white/18 transition-all group"
              >
                Explore the Collection
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
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-0 md:divide-x md:divide-border">
            {[
              { icon: Sparkles, label: "Handcrafted" },
              { icon: ShieldCheck, label: "Pure Cotton" },
              { icon: Ruler, label: "Ages 2\u20135" },
              { icon: Truck, label: "Free Shipping \u20B9999+" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2.5 px-6 md:px-10">
                <Icon className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                <span className="text-[12px] uppercase tracking-[0.1em] text-muted-foreground">
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
