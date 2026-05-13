import { Link } from "react-router-dom";
import { useSEO } from "@/hooks/useSEO";
import JsonLd, { ORGANIZATION_JSONLD } from "@/components/JsonLd";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { ArrowRight } from "lucide-react";
import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";

const crafts = [
  { name: "Chikankari", origin: "Lucknow, Uttar Pradesh", desc: "Delicate hand embroidery passed down through generations of Lucknowi artisans, known for its intricate threadwork on fine fabric.", image: product1 },
  { name: "Bandhani", origin: "Rajasthan", desc: "Vibrant tie-dye art from the heart of Rajasthan, creating mesmerising patterns through thousands of tiny hand-tied knots.", image: product2 },
  { name: "Firan", origin: "Kashmir", desc: "Traditional Kashmiri tunic silhouette with artisan detailing, reimagined in miniature for the littlest wearers.", image: product3 },
];

const stats = [
  { number: "13+", label: "Handcrafted Styles" },
  { number: "2–5", label: "Age Range (Years)" },
  { number: "100%", label: "Natural Fabrics" },
  { number: "Pan India", label: "Delivery" },
];

const fadeUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] },
};

const About = () => {
  useSEO({ title: "Our Story | Style Saplings", description: "Discover the story behind Style Saplings — handcrafted Indian ethnic wear for toddlers. Celebrating heritage crafts like Chikankari, Bandhani & Firan.", canonicalPath: "/about" });

  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const parallaxY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

  return (
    <div className="min-h-screen">
      <JsonLd data={ORGANIZATION_JSONLD} />
      <Header />

      {/* Hero Banner */}
      <section ref={heroRef} className="relative overflow-hidden grain-overlay" style={{ backgroundColor: '#2A3A26' }}>
        <div className="relative z-10 flex items-center justify-center py-16 md:py-24 px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <span className="text-white/50 font-sans text-[10px] md:text-xs tracking-[0.3em] uppercase font-medium mb-3 block">
              Our Story
            </span>
            <h1 className="font-serif text-3xl md:text-5xl font-semibold text-white">
              Crafted with Love. <br className="hidden md:block" />
              <span className="italic" style={{ color: '#C47A6E' }}>Rooted in Tradition.</span>
            </h1>
            <div className="w-12 h-[2px] mx-auto mt-5" style={{ backgroundColor: '#C47A6E' }} />
          </motion.div>
        </div>
      </section>

      {/* Brand Story */}
      <section className="py-20 md:py-32 bg-background">
        <div className="container px-4 md:px-8">
          <div className="grid md:grid-cols-5 gap-10 md:gap-16 items-center">
            <motion.div {...fadeUp} className="md:col-span-2">
              <div className="aspect-[3/4] rounded-xl overflow-hidden bg-muted shadow-lg img-zoom">
                <img src={product1} alt="Flat lay of handcrafted ethnic garments" className="w-full h-full object-cover" />
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="md:col-span-3 space-y-6"
            >
              <span className="text-[10px] md:text-xs tracking-[0.3em] uppercase text-sale font-semibold">Who We Are</span>
              <h2 className="font-serif text-3xl md:text-4xl font-semibold">Clothing that carries a story</h2>
              <div className="w-12 h-[2px] bg-sale" />
              <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                At Style Saplings, we believe kids should dress in outfits that are more than just clothing—they should tell a story. Our philosophy is simple: bring India's rich textile heritage to modern families through beautifully crafted, comfortable ethnic wear for toddlers.
              </p>
              <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                Every piece is thoughtfully designed to celebrate heritage in every stitch—naturally beautiful, comfortably worn. We work with skilled artisans who have mastered traditional techniques like Chikankari, ensuring each garment carries the authenticity of Indian craftsmanship.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Craft Origins — Card Style */}
      <section className="py-20 md:py-32" style={{ backgroundColor: '#F8F8F6' }}>
        <div className="container px-4 md:px-8">
          <motion.div {...fadeUp} className="text-center mb-16">
            <span className="text-[10px] md:text-xs tracking-[0.3em] uppercase text-sale font-semibold">Heritage Textiles</span>
            <h2 className="font-serif text-3xl md:text-5xl font-semibold mt-3 mb-4">
              The Crafts We Celebrate
            </h2>
            <div className="w-16 h-[2px] bg-sale mx-auto" />
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {crafts.map((c, i) => (
              <motion.div
                key={c.name}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.12 }}
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-500 group"
              >
                <div className="aspect-[16/10] overflow-hidden">
                  <img src={c.image} alt={c.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                </div>
                <div className="p-6 md:p-8 text-center">
                  <h3 className="font-serif text-2xl font-medium mb-1">{c.name}</h3>
                  <div className="w-8 mx-auto mt-2 mb-3" style={{ borderBottom: "2px solid #C47A6E" }} />
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">{c.origin}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{c.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container px-4 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center"
              >
                <p className="font-serif text-4xl md:text-5xl font-semibold text-foreground">{s.number}</p>
                <div className="w-6 h-[2px] bg-sale mx-auto mt-3 mb-2" />
                <p className="text-xs md:text-sm text-muted-foreground tracking-wide">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Founder Note */}
      <section className="py-20 md:py-28" style={{ backgroundColor: '#F8F8F6' }}>
        <div className="container px-4 md:px-8 flex justify-center">
          <motion.div
            {...fadeUp}
            className="max-w-[700px] w-full rounded-2xl p-10 md:p-14 text-center bg-white shadow-sm"
          >
            <div className="text-4xl mb-6 opacity-20 font-serif">"</div>
            <p className="font-serif italic text-lg md:text-xl leading-relaxed text-foreground mb-6 -mt-4">
              Style Saplings began with a simple wish — to dress our children in the same beautiful handcrafted traditions that have defined Indian culture for generations. Each piece we create is a small celebration of that heritage.
            </p>
            <div className="w-10 h-[1px] bg-border mx-auto mb-4" />
            <p className="text-sm text-muted-foreground tracking-wide font-medium">Victor Kharkwal</p>
            <p className="text-xs text-muted-foreground/70 mt-1">Founder, Style Saplings</p>
          </motion.div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 md:py-28 relative grain-overlay" style={{ backgroundColor: '#2A3A26' }}>
        <div className="relative z-10 container px-4 md:px-8 text-center">
          <motion.div {...fadeUp}>
            <h2 className="font-serif text-3xl md:text-5xl font-semibold mb-4 text-white leading-tight">
              Dress Your Little One in <br className="hidden md:block" />
              India's <span className="italic" style={{ color: '#C47A6E' }}>Finest Craft</span>
            </h2>
            <p className="text-white/60 text-sm md:text-base mb-10 max-w-lg mx-auto">
              Explore our collection of handcrafted ethnic wear for children aged 2–5 years.
            </p>
            <Link
              to="/shop"
              className="group inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-medium tracking-wide text-foreground transition-all hover:shadow-lg"
              style={{ backgroundColor: '#C47A6E' }}
            >
              Explore Collection
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
