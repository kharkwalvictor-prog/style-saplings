import { Link } from "react-router-dom";
import { useSEO } from "@/hooks/useSEO";
import JsonLd, { ORGANIZATION_JSONLD } from "@/components/JsonLd";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
} from "framer-motion";
import { useRef } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/ProductCard";
import { useProducts } from "@/hooks/useProducts";
import { ArrowRight, Hand, ShieldCheck, Ruler, Truck } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import heroImg from "@/assets/hero.jpg";
import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";

/* ─── Apple-style spring config ─── */
const smooth = { type: "spring" as const, damping: 30, stiffness: 120 };
const snappy = { type: "spring" as const, damping: 25, stiffness: 200 };

/* ─── Reveal variants with blur + y + opacity ─── */
const revealVariants = {
  hidden: { opacity: 0, y: 40, filter: "blur(6px)" },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { ...smooth, delay },
  }),
};

const imageRevealVariants = {
  hidden: { opacity: 0, scale: 1.08, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 1.4, ease: [0.22, 1, 0.36, 1] },
  },
};

/* ─── data ─── */
const collections = [
  { name: "Chikankari", image: product1, href: "/shop?craft=Chikankari" },
  { name: "Bandhani", image: product2, href: "/shop?craft=Bandhani" },
  { name: "Firan", image: product4, href: "/shop?craft=Firan" },
];

const trustItems = [
  { icon: Hand, label: "Handcrafted" },
  { icon: ShieldCheck, label: "Pure Cotton" },
  { icon: Ruler, label: "Sizes 2\u20135 Years" },
  { icon: Truck, label: "Free Shipping above \u20B9999" },
];

const Index = () => {
  const { data: products = [], isLoading } = useProducts();
  useSEO({
    title: "Style Saplings \u2014 Handcrafted Ethnic Wear for Little Ones",
    description:
      "Authentic Chikankari, Bandhani and Kashmiri ethnic wear for children aged 2\u20135. Made by skilled artisans. Pan India delivery.",
    canonicalPath: "/",
  });

  const featuredProducts = (() => {
    const featured = products.filter((p) => p.is_featured);
    return featured.length > 0 ? featured.slice(0, 4) : products.slice(0, 4);
  })();

  /* ─── Parallax for hero image ─── */
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useSpring(useTransform(heroProgress, [0, 1], [0, 150]), {
    damping: 40,
    stiffness: 90,
  });
  const heroScale = useTransform(heroProgress, [0, 1], [1, 1.1]);
  const heroOpacity = useTransform(heroProgress, [0, 0.8], [1, 0]);

  /* ─── Parallax for craft banner ─── */
  const craftRef = useRef<HTMLElement>(null);
  const { scrollYProgress: craftProgress } = useScroll({
    target: craftRef,
    offset: ["start end", "end start"],
  });
  const craftY = useTransform(craftProgress, [0, 1], [-40, 40]);

  return (
    <div className="min-h-screen bg-background">
      <JsonLd data={ORGANIZATION_JSONLD} />
      <Header />

      {/* ────────────────────────────────────────────
          1. HERO — Parallax image, text fades with blur
      ──────────────────────────────────────────── */}
      <section
        ref={heroRef}
        className="relative h-[100svh] min-h-[600px] flex items-center justify-center overflow-hidden"
      >
        {/* Parallax background */}
        <motion.div
          className="absolute inset-0"
          style={{ y: heroY, scale: heroScale }}
        >
          <img
            src={heroImg}
            alt=""
            className="w-full h-full object-cover"
            loading="eager"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/55" />
        </motion.div>

        {/* Content — fades out on scroll */}
        <motion.div
          className="relative z-10 text-center px-6 max-w-3xl mx-auto"
          style={{ opacity: heroOpacity }}
        >
          <motion.h1
            initial={{ opacity: 0, y: 50, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="font-serif text-[36px] sm:text-[48px] md:text-[56px] lg:text-[64px] font-semibold text-white leading-[1.08]"
          >
            Rooted in Tradition,
            <br />
            <motion.em
              initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{
                duration: 1,
                delay: 0.5,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="italic font-normal"
            >
              Styled for Today
            </motion.em>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="mt-10"
          >
            <Link
              to="/shop"
              className="inline-flex items-center gap-2.5 text-[13px] uppercase tracking-[0.2em] font-medium text-white/90 hover:text-white transition-all group"
            >
              <span className="relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-px after:bg-white after:transition-all after:duration-300 group-hover:after:w-full">
                Shop the Collection
              </span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll indicator — gentle pulse */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
          style={{ opacity: heroOpacity }}
        >
          <div className="w-[22px] h-[34px] border border-white/25 rounded-full flex items-start justify-center p-[5px]">
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="w-[3px] h-[6px] bg-white/50 rounded-full"
            />
          </div>
        </motion.div>
      </section>

      {/* ────────────────────────────────────────────
          2. EDITORIAL STORY — Image reveals with scale, text with blur
      ──────────────────────────────────────────── */}
      <section className="py-28 md:py-36 bg-white">
        <div className="container px-6 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-20 items-center">
            {/* Image — cinematic reveal */}
            <motion.div
              className="md:col-span-7"
              variants={imageRevealVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
            >
              <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl shadow-black/10">
                <img
                  src={product1}
                  alt="Handcrafted Indian children's clothing"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            </motion.div>

            {/* Text — staggered blur reveal */}
            <div className="md:col-span-5 space-y-0">
              <motion.span
                custom={0}
                variants={revealVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
                className="text-xs uppercase tracking-[0.2em] text-muted-foreground block"
              >
                Our Story
              </motion.span>

              <motion.h2
                custom={0.1}
                variants={revealVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
                className="font-serif text-[26px] md:text-[32px] font-medium leading-[1.25] mt-5 mb-6"
              >
                When our daughter was two, we searched everywhere.
              </motion.h2>

              <motion.p
                custom={0.2}
                variants={revealVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
                className="text-[15px] text-muted-foreground leading-[1.7] max-w-[380px] mb-7"
              >
                We wanted something handcrafted, something that carried the
                warmth of our culture. What we found was either low quality fast
                fashion or formal occasion wear too stiff for a toddler. So we
                went directly to the artisans.
              </motion.p>

              <motion.div
                custom={0.3}
                variants={revealVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
              >
                <Link
                  to="/about"
                  className="inline-flex items-center gap-2 text-sm font-medium group transition-colors"
                >
                  <span className="relative after:absolute after:bottom-[-2px] after:left-0 after:w-full after:h-px after:bg-foreground after:origin-left after:scale-x-0 after:transition-transform after:duration-300 group-hover:after:scale-x-100">
                    Read our story
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────
          3. PRODUCTS — Cards reveal with stagger
      ──────────────────────────────────────────── */}
      <section className="py-24 md:py-32 bg-[#F8F8F6]">
        <div className="container px-6 md:px-8">
          <div className="flex items-end justify-between mb-12 md:mb-16">
            <motion.h2
              custom={0}
              variants={revealVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="font-serif text-2xl md:text-[2rem] font-semibold"
            >
              New Arrivals
            </motion.h2>
            <motion.div
              custom={0.1}
              variants={revealVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <Link
                to="/shop"
                className="group flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                View all
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 gap-6 md:gap-10">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="aspect-[3/4] rounded-xl" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-6 md:gap-10">
              {featuredProducts.map((product, i) => (
                <motion.div
                  key={product.id}
                  custom={i * 0.12}
                  variants={revealVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-60px" }}
                >
                  <ProductCard product={product} index={i} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ────────────────────────────────────────────
          4. CRAFT BANNER — Parallax image, bottom-pinned text
      ──────────────────────────────────────────── */}
      <section
        ref={craftRef}
        className="relative h-[55vh] md:h-[65vh] min-h-[400px] flex items-end overflow-hidden"
      >
        <motion.div className="absolute inset-[-40px]" style={{ y: craftY }}>
          <img
            src={product3}
            alt="Chikankari embroidery detail"
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />

        <div className="relative z-10 container px-6 md:px-8 pb-14 md:pb-20">
          <motion.span
            custom={0}
            variants={revealVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-[11px] uppercase tracking-[0.25em] text-white/40 block mb-4"
          >
            The Tradition
          </motion.span>
          <motion.h2
            custom={0.1}
            variants={revealVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="font-serif text-[32px] md:text-[48px] font-semibold text-white leading-[1.1]"
          >
            400 Years of Chikankari
          </motion.h2>
          <motion.p
            custom={0.2}
            variants={revealVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-[15px] text-white/55 max-w-md mt-4 leading-relaxed"
          >
            Each stitch placed by hand — no machines, no shortcuts.
          </motion.p>
          <motion.div
            custom={0.35}
            variants={revealVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <Link
              to="/about"
              className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white mt-5 transition-colors group"
            >
              <span className="relative after:absolute after:bottom-[-2px] after:left-0 after:w-0 after:h-px after:bg-white after:transition-all after:duration-300 group-hover:after:w-full">
                Discover the craft
              </span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ────────────────────────────────────────────
          5. COLLECTION CARDS — Staggered with hover lift
      ──────────────────────────────────────────── */}
      <section className="py-28 md:py-36 bg-white">
        <div className="container px-6 md:px-8">
          <motion.h2
            custom={0}
            variants={revealVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="font-serif text-2xl md:text-[2rem] font-semibold text-center mb-14 md:mb-16"
          >
            The Collection
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-7">
            {collections.map((craft, i) => (
              <motion.div
                key={craft.name}
                custom={i * 0.15}
                variants={revealVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                whileHover={{ y: -6 }}
                transition={snappy}
              >
                <Link
                  to={craft.href}
                  className="group block relative aspect-[3/4] rounded-2xl overflow-hidden shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-black/10 transition-shadow duration-500"
                >
                  <img
                    src={craft.image}
                    alt={craft.name}
                    className="w-full h-full object-cover transition-transform duration-[800ms] ease-out group-hover:scale-[1.04]"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-7">
                    <h3 className="font-serif text-2xl md:text-[1.6rem] font-semibold text-white">
                      {craft.name}
                    </h3>
                    <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.15em] text-white/60 mt-2 group-hover:text-white/90 transition-colors">
                      Explore
                      <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────
          6. TRUST STRIP — Minimal, elegant
      ──────────────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="border-t border-border py-10 md:py-12"
      >
        <div className="container px-6 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0">
            {trustItems.map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="flex items-center justify-center gap-2.5 text-muted-foreground"
                >
                  {i > 0 && (
                    <span
                      className="hidden md:inline text-border/60 mr-5"
                      aria-hidden="true"
                    >
                      |
                    </span>
                  )}
                  <Icon className="h-[15px] w-[15px] flex-shrink-0" strokeWidth={1.5} />
                  <span className="text-[11px] uppercase tracking-[0.12em]">
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </motion.section>

      <Footer />
    </div>
  );
};

export default Index;
