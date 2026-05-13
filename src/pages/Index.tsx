import { Link } from "react-router-dom";
import { useSEO } from "@/hooks/useSEO";
import JsonLd, { ORGANIZATION_JSONLD } from "@/components/JsonLd";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useRef } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/ProductCard";
import { useProducts } from "@/hooks/useProducts";
import { ArrowRight, Sparkles, ShieldCheck, Ruler, Truck, Star, Quote } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import heroImg from "@/assets/hero.jpg";
import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";

/* ── Animation variants ── */
const revealVariants = {
  hidden: { opacity: 0, y: 30, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { type: "spring", damping: 30, stiffness: 120 },
  },
};

const imageRevealVariants = {
  hidden: { opacity: 0, scale: 1.05, filter: "blur(3px)" },
  visible: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

/* ── Region data ── */
const regions = [
  { name: "Lucknow", craft: "Chikankari", image: product1 },
  { name: "Kashmir", craft: "Firan", image: product3 },
  { name: "Rajasthan", craft: "Bandhani", image: product2 },
  { name: "Punjab", craft: "Phulkari", image: product4 },
  { name: "Gujarat", craft: "Patola", image: product1 },
];

/* ── Testimonials ── */
const testimonials = [
  {
    quote: "The Chikankari set was absolutely stunning. The embroidery is so delicate and the cotton is incredibly soft on her skin.",
    name: "Priya S.",
    location: "Mumbai",
  },
  {
    quote: "Finally found ethnic wear my son actually wants to wear. Comfortable enough for play, beautiful enough for Diwali.",
    name: "Ananya P.",
    location: "Bangalore",
  },
  {
    quote: "We've ordered three times now. The quality is unmatched at this price. Each piece feels like an heirloom.",
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

  /* ── Hero parallax ── */
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroImageY = useSpring(useTransform(heroProgress, [0, 1], [0, 200]), {
    damping: 30,
    stiffness: 120,
  });
  const heroContentOpacity = useTransform(heroProgress, [0, 0.6], [1, 0]);
  const heroContentY = useTransform(heroProgress, [0, 0.6], [0, 60]);

  return (
    <div className="min-h-screen bg-background">
      <JsonLd data={ORGANIZATION_JSONLD} />
      <Header />

      {/* ═══════════════════════════════════════════
          SECTION 1 — HERO (full viewport)
      ═══════════════════════════════════════════ */}
      <section ref={heroRef} className="relative h-screen overflow-hidden">
        {/* Parallax background */}
        <motion.div className="absolute inset-0" style={{ y: heroImageY }}>
          <img
            src={heroImg}
            alt="Children in beautiful Indian ethnic wear"
            className="w-full h-[120%] object-cover"
          />
        </motion.div>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/20 to-black/50" />

        {/* Hero content */}
        <motion.div
          style={{ opacity: heroContentOpacity, y: heroContentY }}
          className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6"
        >
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-3xl"
          >
            <motion.h1
              variants={revealVariants}
              className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold text-white leading-[1.08] mb-6"
            >
              India's heritage, stitched for little explorers.
            </motion.h1>
            <motion.p
              variants={revealVariants}
              className="text-white/60 text-sm md:text-base mb-10 max-w-lg mx-auto"
            >
              Handcrafted Chikankari, Bandhani & Kashmiri ethnic wear for ages
              2-5
            </motion.p>
            <motion.div
              variants={revealVariants}
              className="flex items-center justify-center gap-6 flex-wrap"
            >
              <Link
                to="/shop"
                className="bg-white/15 backdrop-blur border border-white/20 rounded-full px-8 py-3.5 text-white text-sm font-medium tracking-wide hover:bg-white/25 transition-colors"
              >
                Shop the Collection
              </Link>
              <Link
                to="/about"
                className="text-white/60 hover:text-white text-sm font-medium transition-colors underline-offset-4 hover:underline"
              >
                Our Story
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
        >
          <motion.span
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-white/40 text-[9px] tracking-[0.3em] uppercase font-medium"
          >
            Scroll
          </motion.span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-px h-6 bg-white/30"
          />
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 2 — EXPLORE BY REGION
      ═══════════════════════════════════════════ */}
      <section className="py-20 md:py-28 bg-background">
        <div className="container px-6 md:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={staggerContainer}
            className="text-center mb-12 md:mb-16"
          >
            <motion.h2
              variants={revealVariants}
              className="font-serif text-2xl md:text-4xl font-semibold mb-3"
            >
              Explore India's Living Crafts
            </motion.h2>
            <motion.p
              variants={revealVariants}
              className="text-muted-foreground text-sm max-w-md mx-auto"
            >
              Each region carries centuries of textile tradition
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-5 gap-4"
          >
            {regions.map((region) => (
              <motion.div key={region.name} variants={revealVariants}>
                <Link
                  to="/shop"
                  className="group block relative aspect-[4/5] rounded-2xl overflow-hidden"
                >
                  <img
                    src={region.image}
                    alt={region.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-4 md:p-5">
                    <h3 className="font-serif text-lg text-white font-semibold leading-tight">
                      {region.name}
                    </h3>
                    <span className="text-white/60 text-xs uppercase tracking-wider">
                      {region.craft}
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 3 — CRAFT STORY (editorial)
      ═══════════════════════════════════════════ */}
      <section className="py-24 md:py-32 bg-[#EDE8DF]">
        <div className="container px-6 md:px-8">
          <div className="grid md:grid-cols-12 gap-10 md:gap-0 items-center">
            {/* Left: text */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={staggerContainer}
              className="md:col-span-5"
            >
              <motion.span
                variants={revealVariants}
                className="text-xs uppercase tracking-[0.2em] text-[#C4785A] font-medium block mb-4"
              >
                The Craft
              </motion.span>
              <motion.h2
                variants={revealVariants}
                className="font-serif text-[28px] md:text-[36px] font-medium leading-[1.2] mb-6"
              >
                Every stitch tells a story of generations.
              </motion.h2>
              <motion.p
                variants={revealVariants}
                className="text-[15px] text-muted-foreground leading-[1.8] max-w-[400px] mb-8"
              >
                Our artisans in Lucknow, Jaipur, and Kashmir carry forward
                techniques perfected over 400 years. Each garment is
                hand-embroidered on pure cotton mulmul — no machines, no
                shortcuts. Just patience, precision, and pride.
              </motion.p>
              <motion.div variants={revealVariants}>
                <Link
                  to="/about"
                  className="inline-flex items-center gap-2 text-sm font-medium text-foreground group"
                >
                  Meet the artisans
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </Link>
              </motion.div>
            </motion.div>

            {/* Right: image */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={imageRevealVariants}
              className="md:col-span-6 md:col-start-7"
            >
              <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-xl">
                <img
                  src={product2}
                  alt="Artisan handcrafting ethnic wear"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 4 — FEATURED COLLECTIONS
      ═══════════════════════════════════════════ */}
      <section className="py-20 md:py-28 bg-background">
        <div className="container px-6 md:px-8">
          <div className="flex items-end justify-between mb-10 md:mb-14">
            <motion.h2
              initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true }}
              transition={{ type: "spring", damping: 30, stiffness: 120 }}
              className="font-serif text-2xl md:text-4xl font-semibold"
            >
              New Arrivals
            </motion.h2>
            <Link
              to="/shop"
              className="group flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              View all{" "}
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-7">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-[3/4] rounded-xl" />
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
              variants={staggerContainer}
              className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-7"
            >
              {featuredProducts.map((product, i) => (
                <motion.div key={product.id} variants={revealVariants}>
                  <ProductCard product={product} index={i} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 5 — SOCIAL PROOF (testimonials)
      ═══════════════════════════════════════════ */}
      <section className="py-20 md:py-28 bg-[#EDE8DF]">
        <div className="container px-6 md:px-8">
          <motion.h2
            initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true }}
            transition={{ type: "spring", damping: 30, stiffness: 120 }}
            className="font-serif text-2xl md:text-4xl font-semibold text-center mb-12 md:mb-16"
          >
            Loved by parents across India
          </motion.h2>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {testimonials.map((t) => (
              <motion.div
                key={t.name}
                variants={revealVariants}
                className="bg-background rounded-2xl p-8 shadow-sm"
              >
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 text-amber-400"
                      fill="currentColor"
                    />
                  ))}
                </div>
                <p className="font-serif italic text-[15px] leading-relaxed text-foreground mb-4">
                  "{t.quote}"
                </p>
                <div className="w-8 h-px bg-border my-4" />
                <p className="text-sm font-medium">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.location}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 6 — FINAL CTA
      ═══════════════════════════════════════════ */}
      <section className="py-24 md:py-32 bg-[#1A2B22]">
        <div className="container px-6 md:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="max-w-2xl mx-auto text-center"
          >
            <motion.h2
              variants={revealVariants}
              className="font-serif text-3xl md:text-5xl text-white font-semibold leading-tight"
            >
              Dress childhood with stories worth remembering.
            </motion.h2>
            <motion.p
              variants={revealVariants}
              className="text-white/50 text-sm mt-4"
            >
              Handcrafted in India. Made for little ones.
            </motion.p>
            <motion.div variants={revealVariants}>
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 mt-8 bg-white/10 backdrop-blur border border-white/20 rounded-full px-8 py-4 text-white text-sm font-medium tracking-wide hover:bg-white/20 transition-colors"
              >
                Explore the Collection
                <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 7 — TRUST STRIP
      ═══════════════════════════════════════════ */}
      <section className="border-t border-border py-10 bg-background">
        <div className="container px-6 md:px-8">
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-0 md:divide-x md:divide-border">
            {[
              { icon: Sparkles, label: "Handcrafted" },
              { icon: ShieldCheck, label: "Pure Cotton" },
              { icon: Ruler, label: "Ages 2-5" },
              { icon: Truck, label: "Free Shipping \u20B9999+" },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 px-6 md:px-8"
              >
                <Icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs uppercase tracking-wider text-muted-foreground">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
