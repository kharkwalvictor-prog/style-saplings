import { Link } from "react-router-dom";
import { useSEO } from "@/hooks/useSEO";
import JsonLd, { ORGANIZATION_JSONLD } from "@/components/JsonLd";
import { motion } from "framer-motion";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroBanner from "@/components/HeroBanner";
import CollectionGrid from "@/components/CollectionGrid";
import FeaturedGrid from "@/components/FeaturedGrid";
import { useProducts } from "@/hooks/useProducts";
import { ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const Index = () => {
  const { data: products = [], isLoading } = useProducts();
  useSEO({
    title: "Style Saplings — Handcrafted Ethnic Wear for Little Ones",
    description: "Authentic Chikankari, Bandhani and Kashmiri ethnic wear for children aged 2–5. Made by skilled artisans. Pan India delivery.",
    canonicalPath: "/",
  });

  const featuredProducts = (() => {
    const featured = products.filter(p => p.is_featured);
    return featured.length > 0 ? featured.slice(0, 4) : products.slice(0, 4);
  })();

  return (
    <div className="min-h-screen bg-background">
      <JsonLd data={ORGANIZATION_JSONLD} />
      <Header />

      {/* 1. HERO BANNER — Embla Carousel */}
      <HeroBanner />

      {/* 2. COLLECTION GRID — 3 category cards */}
      <CollectionGrid />

      {/* 3. FEATURED PRODUCTS */}
      <section className="py-16 md:py-24 bg-[#F5F0E8]">
        <div className="container px-6 md:px-8">
          <div className="flex items-end justify-between mb-10 md:mb-14">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-serif text-2xl md:text-4xl font-semibold"
            >
              New Arrivals
            </motion.h2>
            <Link to="/shop" className="group flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              View All <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
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
            <FeaturedGrid products={featuredProducts} />
          )}
        </div>
      </section>

      {/* 4. STORY BANNER — Warm background, centered text */}
      <section className="py-20 md:py-28 bg-[#FBF8F3]">
        <div className="container px-6 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="max-w-2xl mx-auto text-center"
          >
            <h2 className="font-serif text-3xl md:text-[2.75rem] font-semibold leading-tight mb-5">
              Heritage in Every Stitch
            </h2>
            <p className="text-muted-foreground text-sm md:text-base leading-relaxed mb-8 max-w-lg mx-auto">
              Each garment is crafted from 100% pure cotton mulmul with natural, skin-safe dyes. Our artisans carry forward techniques perfected over generations in Lucknow, Jaipur, and Kashmir.
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 bg-[#C4622D] hover:bg-[#B5561F] text-white text-sm font-semibold tracking-wide px-8 py-3.5 rounded-full transition-colors active:scale-[0.97]"
            >
              Shop Now
            </Link>
          </motion.div>
        </div>
      </section>

      {/* 5. WHY STYLE SAPLINGS — Trust strip */}
      <section className="py-14 md:py-16 border-t border-border/50">
        <div className="container px-6 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-0">
            {[
              { title: "100% Cotton", desc: "Pure mulmul fabric" },
              { title: "Artisan Made", desc: "Handcrafted traditions" },
              { title: "Ages 2–5", desc: "Sized for little ones" },
              { title: "Free Shipping", desc: "On orders ₹999+" },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`text-center ${i < 3 ? "md:border-r md:border-border/40" : ""}`}
              >
                <p className="text-sm md:text-base font-semibold text-foreground">{item.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
