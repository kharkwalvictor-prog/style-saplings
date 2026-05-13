import { Link } from "react-router-dom";
import { useSEO } from "@/hooks/useSEO";
import JsonLd, { ORGANIZATION_JSONLD } from "@/components/JsonLd";
import { motion } from "framer-motion";
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

/* ─── animation helpers ─── */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.25, 0.4, 0.25, 1] },
});

const revealUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 } as const,
  whileInView: { opacity: 1, y: 0 } as const,
  viewport: { once: true } as const,
  transition: { duration: 0.6, delay, ease: [0.25, 0.4, 0.25, 1] },
});

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

  return (
    <div className="min-h-screen bg-background">
      <JsonLd data={ORGANIZATION_JSONLD} />
      <Header />

      {/* ────────────────────────────────────────────
          1. HERO — Full viewport, single image, minimal text
      ──────────────────────────────────────────── */}
      <section className="relative h-[100svh] min-h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImg}
            alt=""
            className="w-full h-full object-cover"
            loading="eager"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/25 to-black/50" />
        </div>

        <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
          <motion.h1
            {...fadeUp(0.3)}
            className="font-serif text-[36px] sm:text-[48px] md:text-[56px] lg:text-[64px] font-semibold text-white leading-[1.1] mb-8"
          >
            Rooted in Tradition,
            <br />
            <em className="italic font-normal">Styled for Today</em>
          </motion.h1>

          <motion.div {...fadeUp(0.6)}>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.2em] font-medium text-white hover:underline underline-offset-4 transition-all"
            >
              Shop the Collection
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.8 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-5 h-8 border-2 border-white/30 rounded-full flex items-start justify-center p-1">
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="w-1 h-1.5 bg-white/60 rounded-full"
            />
          </div>
        </motion.div>
      </section>

      {/* ────────────────────────────────────────────
          2. EDITORIAL STORY BLOCK — Asymmetric two-column
      ──────────────────────────────────────────── */}
      <section className="py-24 md:py-32 bg-white">
        <div className="container px-6 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16 items-center">
            {/* Image — 7 columns */}
            <motion.div
              {...revealUp()}
              className="md:col-span-7"
            >
              <div className="aspect-[3/4] rounded-xl overflow-hidden">
                <motion.img
                  src={product1}
                  alt="Handcrafted Indian children's clothing"
                  className="w-full h-full object-cover"
                  loading="lazy"
                  whileInView={{ scale: [1.06, 1] }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, ease: [0.25, 0.4, 0.25, 1] }}
                />
              </div>
            </motion.div>

            {/* Text — 5 columns */}
            <div className="md:col-span-5">
              <motion.span
                {...revealUp(0)}
                className="text-xs uppercase tracking-widest text-muted-foreground"
              >
                Our Story
              </motion.span>

              <motion.h2
                {...revealUp(0.1)}
                className="font-serif text-[28px] md:text-[32px] font-medium leading-snug mt-4 mb-5"
              >
                When our daughter was two, we searched everywhere.
              </motion.h2>

              <motion.p
                {...revealUp(0.2)}
                className="text-sm text-muted-foreground leading-relaxed max-w-sm mb-6"
              >
                We wanted something handcrafted, something that carried the
                warmth of our culture. What we found was either low quality fast
                fashion or formal occasion wear too stiff for a toddler. So we
                went directly to the artisans.
              </motion.p>

              <motion.div {...revealUp(0.3)}>
                <Link
                  to="/about"
                  className="inline-flex items-center gap-1.5 text-sm hover:underline underline-offset-4 transition-all"
                >
                  Read our story
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────
          3. PRODUCT GRID — Clean, generous spacing
      ──────────────────────────────────────────── */}
      <section className="py-20 md:py-28 bg-[#F8F8F6]">
        <div className="container px-6 md:px-8">
          <div className="flex items-end justify-between mb-10 md:mb-14">
            <motion.h2
              {...revealUp()}
              className="font-serif text-2xl md:text-3xl font-semibold"
            >
              New Arrivals
            </motion.h2>
            <motion.div {...revealUp(0.1)}>
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
            <div className="grid grid-cols-2 gap-5 md:gap-8">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-[3/4] rounded-xl" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-5 md:gap-8">
              {featuredProducts.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ────────────────────────────────────────────
          4. FULL-BLEED CRAFT BANNER — Visual break
      ──────────────────────────────────────────── */}
      <section className="relative h-[50vh] md:h-[60vh] min-h-[360px] flex items-end justify-start overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={product3}
            alt="Chikankari embroidery detail"
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        </div>

        <div className="relative z-10 container px-6 md:px-8 pb-12 md:pb-16">
          <motion.div {...revealUp()}>
            <span className="text-xs uppercase tracking-[0.2em] text-white/50 mb-3 block">
              The Tradition
            </span>
            <h2 className="font-serif text-3xl md:text-5xl font-semibold text-white leading-tight">
              400 Years of Chikankari
            </h2>
            <p className="text-sm text-white/60 max-w-md mt-3 leading-relaxed">
              Each stitch placed by hand — no machines, no shortcuts.
            </p>
            <Link
              to="/about"
              className="inline-flex items-center gap-1.5 text-sm text-white/80 hover:text-white mt-4 transition-colors"
            >
              Discover the craft
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ────────────────────────────────────────────
          5. SHOP BY CRAFT — 3 editorial image cards
      ──────────────────────────────────────────── */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container px-6 md:px-8">
          <motion.h2
            {...revealUp()}
            className="font-serif text-2xl md:text-3xl font-semibold text-center mb-12"
          >
            The Collection
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {collections.map((craft, i) => (
              <motion.div key={craft.name} {...revealUp(i * 0.1)}>
                <Link
                  to={craft.href}
                  className="group block relative aspect-[3/4] rounded-xl overflow-hidden"
                >
                  <img
                    src={craft.image}
                    alt={craft.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-6">
                    <h3 className="font-serif text-xl md:text-2xl font-semibold text-white">
                      {craft.name}
                    </h3>
                    <span className="text-xs uppercase tracking-widest text-white/70 mt-1 inline-flex items-center gap-1">
                      Explore
                      <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────
          6. TRUST STRIP — Minimal, single row
      ──────────────────────────────────────────── */}
      <section className="border-t border-b border-border py-8 md:py-10">
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
                      className="hidden md:inline text-border mr-4"
                      aria-hidden="true"
                    >
                      |
                    </span>
                  )}
                  <Icon className="h-4 w-4 flex-shrink-0" strokeWidth={1.5} />
                  <span className="text-xs uppercase tracking-wider">
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
