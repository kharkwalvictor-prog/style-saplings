import { Link } from "react-router-dom";
import { useSEO } from "@/hooks/useSEO";
import JsonLd, { ORGANIZATION_JSONLD } from "@/components/JsonLd";
import { motion } from "framer-motion";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { ArrowRight } from "lucide-react";
import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";

/* ── Animation variants (matching homepage patterns) ── */
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
const crafts = [
  {
    name: "Chikankari",
    origin: "Lucknow, Uttar Pradesh",
    desc: "A 400-year-old hand embroidery tradition on fine muslin. Cotton thread, no machines — just generations of skill passed from master to apprentice.",
    image: product1,
  },
  {
    name: "Bandhani",
    origin: "Rajasthan & Gujarat",
    desc: "An ancient tie-dye art where thousands of tiny knots are tied by hand before dyeing, creating mesmerising patterns unique to each piece.",
    image: product2,
  },
  {
    name: "Firan",
    origin: "Kashmir",
    desc: "A traditional full-length tunic with hand-embroidered detailing on soft cotton. Kashmiri heritage, reimagined in miniature for little ones.",
    image: product3,
  },
];

const stats = [
  { value: "13+", label: "Handcrafted Styles" },
  { value: "2\u20135 Years", label: "Age Range" },
  { value: "100%", label: "Natural Fabrics" },
  { value: "Pan India", label: "Delivery" },
];

const About = () => {
  useSEO({
    title: "Our Story | Style Saplings",
    description:
      "Discover the story behind Style Saplings — handcrafted Indian ethnic wear for toddlers. Celebrating heritage crafts like Chikankari, Bandhani & Firan.",
    canonicalPath: "/about",
  });

  return (
    <div className="min-h-screen bg-background">
      <JsonLd data={ORGANIZATION_JSONLD} />
      <Header />

      {/* ═══════════════════════════════════════════════════
          1. HERO — Dark sage, text-focused, editorial
      ═══════════════════════════════════════════════════ */}
      <section className="relative h-[50vh] min-h-[350px] bg-[#1A2B22] flex items-center justify-center overflow-hidden">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="relative z-10 text-center px-6"
        >
          <motion.span
            variants={reveal}
            className="text-white/60 text-xs uppercase tracking-[0.25em] font-medium block mb-5"
          >
            Our Story
          </motion.span>
          <motion.h1
            variants={reveal}
            className="font-serif text-3xl md:text-5xl font-semibold text-white leading-[1.12] tracking-[-0.01em] max-w-xl mx-auto"
          >
            We looked everywhere.
            <br />
            So we built it ourselves.
          </motion.h1>
          <motion.div
            variants={reveal}
            className="w-12 h-px bg-[#C4785A] mx-auto mt-6"
          />
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════
          2. THE SEARCH — Origin story, asymmetric layout
      ═══════════════════════════════════════════════════ */}
      <section className="py-28 md:py-36 bg-background">
        <div className="container px-6 md:px-8">
          <div className="grid md:grid-cols-12 gap-12 md:gap-0 items-center">
            {/* Left — Image */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={imageReveal}
              className="md:col-span-5"
            >
              <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl shadow-black/10">
                <img
                  src={product1}
                  alt="Handcrafted Chikankari garment flat lay"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            </motion.div>

            {/* Right — Text */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={stagger}
              className="md:col-span-6 md:col-start-7"
            >
              <motion.span
                variants={reveal}
                className="text-[12px] uppercase tracking-[0.2em] text-[#C4785A] font-medium block mb-5"
              >
                How Style Saplings Began
              </motion.span>
              <motion.h2
                variants={reveal}
                className="font-serif text-[28px] md:text-[36px] font-medium leading-[1.15] tracking-[-0.01em] mb-7"
              >
                The Search That Started Everything
              </motion.h2>
              <motion.p
                variants={reveal}
                className="text-[15px] text-muted-foreground leading-[1.8] mb-5"
              >
                When our daughter was two, we wanted to dress her in something
                that felt truly Indian — not a costume, but real. Something
                handcrafted, something that carried the warmth of our culture.
                What we found was either low-quality fast fashion with Indian
                prints slapped on, or formal occasion wear too stiff for a
                toddler to move in.
              </motion.p>
              <motion.p
                variants={reveal}
                className="text-[15px] text-muted-foreground leading-[1.8]"
              >
                So we went directly to the artisans. We visited workshops in
                Lucknow, spent time in Rajasthan understanding Bandhani, and
                sourced from craftspeople who've passed their skills down
                through generations. Style Saplings was born from that search
                — a brand built on the belief that Indian children deserve to
                wear their heritage, comfortably and beautifully, every single
                day.
              </motion.p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          3. THE CRAFTS — Editorial cards on warm background
      ═══════════════════════════════════════════════════ */}
      <section className="py-24 md:py-32 bg-[#F0EBE1]">
        <div className="container px-6 md:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
            className="text-center mb-14 md:mb-20"
          >
            <motion.h2
              variants={reveal}
              className="font-serif text-[30px] md:text-[42px] font-semibold leading-[1.1] tracking-[-0.01em]"
            >
              The Crafts We Celebrate
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            variants={stagger}
            className="grid md:grid-cols-3 gap-6 md:gap-8"
          >
            {crafts.map((craft) => (
              <motion.div
                key={craft.name}
                variants={reveal}
                className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-500 group"
              >
                <div className="aspect-[16/10] overflow-hidden">
                  <img
                    src={craft.image}
                    alt={craft.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                    loading="lazy"
                  />
                </div>
                <div className="p-8">
                  <h3 className="font-serif text-2xl font-medium">
                    {craft.name}
                  </h3>
                  <div className="w-8 border-b-2 border-[#C4785A] mt-3 mb-3" />
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
                    {craft.origin}
                  </p>
                  <p className="text-[14px] text-muted-foreground leading-relaxed">
                    {craft.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          4. STATS ROW — Centered with dividers
      ═══════════════════════════════════════════════════ */}
      <section className="py-16 md:py-20 bg-background">
        <div className="container px-6 md:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={stagger}
            className="flex flex-wrap items-center justify-center md:divide-x divide-border"
          >
            {stats.map((stat) => (
              <motion.div
                key={stat.label}
                variants={reveal}
                className="text-center px-8 md:px-12 py-4 md:py-0 w-1/2 md:w-auto"
              >
                <p className="font-serif text-3xl md:text-4xl font-semibold text-foreground leading-none">
                  {stat.value}
                </p>
                <p className="text-xs text-muted-foreground tracking-wide mt-2">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          5. FOUNDER QUOTE — Centered card
      ═══════════════════════════════════════════════════ */}
      <section className="py-20 md:py-28 bg-[#F0EBE1]">
        <div className="container px-6 md:px-8 flex justify-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
            className="max-w-[700px] w-full bg-white rounded-3xl p-10 md:p-14 text-center shadow-sm"
          >
            <motion.div
              variants={reveal}
              className="font-serif text-5xl text-muted-foreground/20 leading-none mb-4"
            >
              &ldquo;
            </motion.div>
            <motion.p
              variants={reveal}
              className="font-serif italic text-lg md:text-xl leading-relaxed text-foreground mb-6 -mt-2"
            >
              Style Saplings began with a simple wish — to dress our children
              in the same beautiful handcrafted traditions that have defined
              Indian culture for generations.
            </motion.p>
            <motion.div variants={reveal}>
              <div className="w-10 h-px bg-border mx-auto mb-4" />
              <p className="text-sm font-medium text-foreground">
                Victor Kharkwal
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Founder, Style Saplings
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          6. CTA BANNER — Dark sage, cinematic close
      ═══════════════════════════════════════════════════ */}
      <section className="py-20 md:py-28 bg-[#1A2B22] relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0id2hpdGUiLz48L3N2Zz4=')] pointer-events-none" />

        <div className="container px-6 md:px-8 text-center relative">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="max-w-2xl mx-auto"
          >
            <motion.h2
              variants={reveal}
              className="font-serif text-3xl md:text-5xl font-semibold text-white leading-[1.1] tracking-[-0.01em]"
            >
              Dress Your Little One in
              <br className="hidden md:block" />
              India's{" "}
              <em className="italic font-normal text-[#C4785A]">
                Finest Craft
              </em>
            </motion.h2>
            <motion.p
              variants={reveal}
              className="text-white/50 text-[15px] mt-6 mb-10 max-w-lg mx-auto leading-relaxed"
            >
              Explore our collection of handcrafted ethnic wear for children
              aged 2-5 years. Made by skilled artisans across India.
            </motion.p>
            <motion.div variants={reveal}>
              <Link
                to="/shop"
                className="group inline-flex items-center gap-2.5 bg-white/10 backdrop-blur-sm border border-white/15 rounded-full px-9 py-4 text-white text-[13px] font-medium tracking-wide hover:bg-white/18 transition-all"
              >
                Explore Collection
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
