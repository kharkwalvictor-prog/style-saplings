import { Link } from "react-router-dom";
import { useSEO } from "@/hooks/useSEO";
import JsonLd, { ORGANIZATION_JSONLD } from "@/components/JsonLd";
import { motion } from "framer-motion";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/ProductCard";
import { useProducts } from "@/hooks/useProducts";
import {
  ArrowRight,
  Scissors,
  Palette,
  Sparkles,
  Hand,
  ShieldCheck,
  Ruler,
  Truck,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import heroImg from "@/assets/hero.jpg";
import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";

/* ─── animation helpers ─── */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, delay, ease: [0.25, 0.4, 0.25, 1] },
});

const revealUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 } as const,
  whileInView: { opacity: 1, y: 0 } as const,
  viewport: { once: true } as const,
  transition: { duration: 0.5, delay, ease: [0.25, 0.4, 0.25, 1] },
});

/* ─── data ─── */
const crafts = [
  {
    icon: Scissors,
    name: "Chikankari",
    description:
      "Delicate hand-embroidered motifs from Lucknow, passed down through generations of master artisans.",
  },
  {
    icon: Palette,
    name: "Bandhani",
    description:
      "Vibrant tie-dye patterns from Rajasthan, each knot tied by hand to create mesmerising designs.",
  },
  {
    icon: Sparkles,
    name: "Firan",
    description:
      "Fine Kashmiri embroidery featuring intricate floral and paisley patterns on pure cotton.",
  },
];

const trustPoints = [
  {
    icon: Hand,
    title: "Handcrafted With Love",
    description:
      "Every garment is hand-embroidered by skilled artisans preserving centuries-old craft traditions.",
  },
  {
    icon: ShieldCheck,
    title: "Skin-Safe Fabrics",
    description:
      "100% pure cotton mulmul with natural, azo-free dyes — gentle on your little one's skin.",
  },
  {
    icon: Ruler,
    title: "Sizes 2 - 5 Years",
    description:
      "Thoughtfully sized for toddlers and young children with room for comfortable movement.",
  },
  {
    icon: Truck,
    title: "Pan-India Shipping",
    description:
      "Free delivery on orders above Rs. 999. Carefully packaged and shipped across India.",
  },
];

const ugcImages = [product1, product2, product3, product4, product1, product2];

const Index = () => {
  const { data: products = [], isLoading } = useProducts();
  useSEO({
    title: "Style Saplings — Handcrafted Ethnic Wear for Little Ones",
    description:
      "Authentic Chikankari, Bandhani and Kashmiri ethnic wear for children aged 2–5. Made by skilled artisans. Pan India delivery.",
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
          2. HERO SECTION — full viewport
      ──────────────────────────────────────────── */}
      <section className="relative h-[100svh] min-h-[600px] flex items-center justify-center overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src={heroImg}
            alt=""
            className="w-full h-full object-cover"
            loading="eager"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />
        </div>

        {/* Hero content */}
        <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
          <motion.p
            {...fadeUp(0.2)}
            className="text-[11px] md:text-xs tracking-[0.3em] uppercase text-white/70 font-medium mb-5"
          >
            Authentic Indian Craftsmanship for Little Ones
          </motion.p>

          <motion.h1
            {...fadeUp(0.4)}
            className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold text-white leading-[1.1] mb-6"
          >
            Rooted in Tradition,{" "}
            <em className="italic font-normal">Styled for Today</em>
          </motion.h1>

          <motion.p
            {...fadeUp(0.6)}
            className="text-sm md:text-base text-white/75 max-w-lg mx-auto leading-relaxed mb-10"
          >
            Celebrate Heritage in Every Stitch — Naturally Beautiful,
            Comfortably Worn
          </motion.p>

          <motion.div
            {...fadeUp(0.8)}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 bg-[#C4622D] hover:bg-[#B5561F] text-white text-sm font-semibold tracking-wide px-8 py-3.5 rounded-full transition-colors active:scale-[0.97]"
            >
              Shop Everyday Ethnic Wear
            </Link>
            <Link
              to="/about"
              className="inline-flex items-center gap-2 border border-white/40 hover:border-white/70 text-white text-sm font-semibold tracking-wide px-8 py-3.5 rounded-full transition-colors hover:bg-white/10 active:scale-[0.97]"
            >
              Discover Our Story
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
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              className="w-1 h-1.5 bg-white/60 rounded-full"
            />
          </div>
        </motion.div>
      </section>

      {/* ────────────────────────────────────────────
          3. OUR CRAFT SECTION
      ──────────────────────────────────────────── */}
      <section className="py-20 md:py-28 bg-[#EDE8DF]">
        <div className="container px-6 md:px-8">
          <motion.div {...revealUp()} className="text-center mb-14 md:mb-18">
            <p className="text-[11px] tracking-[0.25em] uppercase text-[#C4622D] font-semibold mb-3">
              Our Heritage
            </p>
            <h2 className="font-serif text-3xl md:text-[2.75rem] font-semibold leading-tight">
              The Art Behind Every Garment
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-4xl mx-auto">
            {crafts.map((craft, i) => {
              const Icon = craft.icon;
              return (
                <motion.div
                  key={craft.name}
                  {...revealUp(i * 0.12)}
                  className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 text-center hover:bg-white/80 transition-colors"
                >
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#C4622D]/10 mb-5">
                    <Icon className="h-6 w-6 text-[#C4622D]" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-serif text-xl font-semibold mb-2">
                    {craft.name}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {craft.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────
          4. FEATURED PRODUCTS
      ──────────────────────────────────────────── */}
      <section className="py-16 md:py-24 bg-[#FAF7F2]">
        <div className="container px-6 md:px-8">
          <div className="flex items-end justify-between mb-10 md:mb-14">
            <motion.div {...revealUp()}>
              <p className="text-[11px] tracking-[0.25em] uppercase text-[#C4622D] font-semibold mb-2">
                Curated Selection
              </p>
              <h2 className="font-serif text-2xl md:text-4xl font-semibold">
                Featured
              </h2>
            </motion.div>
            <motion.div {...revealUp(0.1)}>
              <Link
                to="/shop"
                className="group flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                View All{" "}
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-7">
              {featuredProducts.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ────────────────────────────────────────────
          5. BRAND STORY SECTION — dark
      ──────────────────────────────────────────── */}
      <section className="py-24 md:py-32 bg-[#2D4A27]">
        <div className="container px-6 md:px-8">
          <motion.div
            {...revealUp()}
            className="max-w-2xl mx-auto text-center"
          >
            <h2 className="font-serif text-3xl md:text-[2.75rem] font-semibold leading-tight text-white mb-6">
              Crafted With Love, Rooted In{" "}
              <em className="italic font-normal text-[#C4622D]">Tradition</em>
            </h2>
            <p className="text-sm md:text-base text-white/65 leading-relaxed max-w-lg mx-auto mb-8">
              Each garment is born from the hands of skilled artisans who carry
              forward techniques perfected over generations in Lucknow, Jaipur,
              and Kashmir. We believe every child deserves to wear a piece of
              India's rich textile heritage — made from 100% pure cotton mulmul
              with natural, skin-safe dyes.
            </p>
            <Link
              to="/about"
              className="inline-flex items-center gap-2 border border-white/30 hover:border-white/60 text-white text-sm font-semibold tracking-wide px-8 py-3.5 rounded-full transition-colors hover:bg-white/10 active:scale-[0.97]"
            >
              Read Our Story
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ────────────────────────────────────────────
          6. TRUST POINTS / WHY STYLE SAPLINGS
      ──────────────────────────────────────────── */}
      <section className="py-20 md:py-28 bg-[#EDE8DF]">
        <div className="container px-6 md:px-8">
          <motion.div {...revealUp()} className="text-center mb-14">
            <h2 className="font-serif text-2xl md:text-4xl font-semibold">
              Why Style Saplings
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-6 max-w-5xl mx-auto">
            {trustPoints.map((point, i) => {
              const Icon = point.icon;
              return (
                <motion.div
                  key={point.title}
                  {...revealUp(i * 0.1)}
                  className="text-center"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#2D4A27]/10 mb-4">
                    <Icon
                      className="h-5 w-5 text-[#2D4A27]"
                      strokeWidth={1.5}
                    />
                  </div>
                  <h3 className="font-serif text-lg font-semibold mb-1.5">
                    {point.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-[240px] mx-auto">
                    {point.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────
          7. INSTAGRAM / UGC STRIP
      ──────────────────────────────────────────── */}
      <section className="py-16 md:py-24 bg-[#FAF7F2]">
        <div className="container px-6 md:px-8">
          <motion.div {...revealUp()} className="text-center mb-10">
            <p className="text-[11px] tracking-[0.25em] uppercase text-[#C4622D] font-semibold mb-2">
              Follow Along
            </p>
            <h2 className="font-serif text-2xl md:text-4xl font-semibold">
              @stylesaplings
            </h2>
          </motion.div>

          <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-3">
            {ugcImages.map((img, i) => (
              <motion.a
                key={i}
                href="https://instagram.com/stylesaplings"
                target="_blank"
                rel="noopener noreferrer"
                {...revealUp(i * 0.08)}
                className="aspect-square overflow-hidden rounded-xl group"
              >
                <img
                  src={img}
                  alt={`Style Saplings on Instagram — photo ${i + 1}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
