import { Link } from "react-router-dom";
import { useSEO } from "@/hooks/useSEO";
import JsonLd, { ORGANIZATION_JSONLD } from "@/components/JsonLd";
import { motion } from "framer-motion";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { ArrowRight } from "lucide-react";
import { useSiteContent, getContent } from "@/hooks/useSiteContent";
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

/* ── Craft descriptions (images resolved dynamically inside component) ── */
const craftDescs = [
  {
    name: "Chikankari",
    origin: "Lucknow, Uttar Pradesh",
    desc: "A 400-year-old hand embroidery tradition on fine muslin. Cotton thread, no machines — just generations of skill passed from master to apprentice.",
  },
  {
    name: "Bandhani",
    origin: "Rajasthan & Gujarat",
    desc: "An ancient tie-dye art where thousands of tiny knots are tied by hand before dyeing, creating mesmerising patterns unique to each piece.",
  },
  {
    name: "Firan",
    origin: "Kashmir",
    desc: "A traditional full-length tunic with hand-embroidered detailing on soft cotton. Kashmiri heritage, reimagined in miniature for little ones.",
  },
];

const stats = [
  { value: "13+", label: "Handcrafted Styles" },
  { value: "2\u20135 Years", label: "Age Range" },
  { value: "100%", label: "Natural Fabrics" },
  { value: "Pan India", label: "Delivery" },
];

const About = () => {
  const { data: content } = useSiteContent();

  const craftImg1 = content?.craft_image_1 || product1;
  const craftImg2 = content?.craft_image_2 || product2;
  const craftImg3 = content?.craft_image_3 || product3;

  const crafts = [
    { ...craftDescs[0], image: craftImg1 },
    { ...craftDescs[1], image: craftImg2 },
    { ...craftDescs[2], image: craftImg3 },
  ];

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
      <section className="relative h-[45vh] min-h-[260px] bg-[#1E3320] flex items-center justify-center overflow-hidden">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="relative z-10 text-center px-6"
        >
          <motion.span
            variants={reveal}
            className="text-white/75 text-[13px] uppercase tracking-[0.25em] font-medium block mb-5"
          >
            {getContent(content, "about_hero_label", "Our Story")}
          </motion.span>
          <motion.h1
            variants={reveal}
            className="font-serif text-3xl md:text-5xl font-medium text-white leading-[1.12] tracking-[-0.01em] max-w-xl mx-auto [text-shadow:_0_2px_20px_rgba(0,0,0,0.4)]"
          >
            {getContent(content, "about_hero_heading", "We looked everywhere. So we built it ourselves.")}
          </motion.h1>
          <motion.div
            variants={reveal}
            className="w-12 h-px bg-[#C06A4F] mx-auto mt-6"
          />
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════
          2. THE SEARCH — Origin story, asymmetric layout
      ═══════════════════════════════════════════════════ */}
      <section className="py-12 md:py-24 bg-background">
        <div className="container px-5 md:px-8">
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
                  src={craftImg1}
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
                className="text-[13px] uppercase tracking-[0.2em] text-[#4A6B45] font-medium block mb-5"
              >
                {getContent(content, "about_origin_label", "How Style Saplings Began")}
              </motion.span>
              <motion.h2
                variants={reveal}
                className="font-serif text-[28px] md:text-[36px] font-medium leading-[1.15] tracking-[-0.01em] mb-7 text-[#1E3320]"
              >
                {getContent(content, "about_origin_heading", "The Search That Started Everything")}
              </motion.h2>
              <motion.p
                variants={reveal}
                className="text-[16px] text-muted-foreground leading-[1.8] mb-5"
              >
                {getContent(content, "about_origin_para1", "When our daughter was two, we wanted to dress her in something that felt truly Indian — not a costume, but real. Something handcrafted, something that carried the warmth of our culture. What we found was either low-quality fast fashion with Indian prints slapped on, or formal occasion wear too stiff for a toddler to move in.")}
              </motion.p>
              <motion.p
                variants={reveal}
                className="text-[16px] text-muted-foreground leading-[1.8]"
              >
                {getContent(content, "about_origin_para2", "So we went directly to the artisans. We visited workshops in Lucknow, spent time in Rajasthan understanding Bandhani, and sourced from craftspeople who've passed their skills down through generations. Style Saplings was born from that search — a brand built on the belief that Indian children deserve to wear their heritage, comfortably and beautifully, every single day.")}
              </motion.p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          3. THE CRAFTS — Same ivory canvas, image-forward
      ═══════════════════════════════════════════════════ */}
      <section className="py-12 md:py-24 bg-background">
        <div className="container px-5 md:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
            className="mb-10 md:mb-14"
          >
            <motion.span variants={reveal} className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground block mb-3">
              The Crafts
            </motion.span>
            <motion.h2
              variants={reveal}
              className="font-serif text-[26px] md:text-[38px] font-medium leading-[1.1] tracking-[-0.01em] text-[#1E3320]"
            >
              {getContent(content, "about_crafts_heading", "The Crafts We Celebrate")}
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5"
          >
            {crafts.map((craft) => (
              <motion.div
                key={craft.name}
                variants={reveal}
                className="group border border-border/50 rounded-2xl overflow-hidden"
              >
                <div className="aspect-[3/4] overflow-hidden">
                  <img
                    src={craft.image}
                    alt={craft.name}
                    className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.03]"
                    loading="lazy"
                  />
                </div>
                <div className="p-6 md:p-7">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-[#4A6B45] font-medium mb-2">
                    {craft.origin}
                  </p>
                  <h3 className="font-serif text-[22px] font-medium mb-3">
                    {craft.name}
                  </h3>
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
          4. STATS ROW — On ivory, large serif numbers
      ═══════════════════════════════════════════════════ */}
      <section className="py-10 md:py-16 bg-background">
        <div className="container px-5 md:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={stagger}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((stat) => (
              <motion.div
                key={stat.label}
                variants={reveal}
                className="text-center md:text-left"
              >
                <p className="font-serif text-[40px] md:text-[48px] font-medium text-[#1E3320] leading-none tracking-[-0.02em]">
                  {stat.value}
                </p>
                <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground mt-2">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          5. FOUNDER QUOTE — On ivory, no card wrapper
      ═══════════════════════════════════════════════════ */}
      <section className="py-12 md:py-24 bg-background">
        <div className="container px-5 md:px-8 flex justify-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
            className="max-w-[640px] w-full text-center"
          >
            <motion.div
              variants={reveal}
              className="font-serif text-[64px] text-[#4A6B45]/25 leading-none mb-2"
            >
              &ldquo;
            </motion.div>
            <motion.p
              variants={reveal}
              className="font-serif italic text-[18px] md:text-[22px] leading-[1.7] text-foreground/80 mb-8 -mt-4"
            >
              {getContent(content, "about_founder_quote", "Style Saplings began with a simple wish — to dress our children in the same beautiful handcrafted traditions that have defined Indian culture for generations.")}
            </motion.p>
            <motion.div variants={reveal}>
              <div className="w-8 h-px bg-[#C06A4F] mx-auto mb-4" />
              <p className="text-[13px] font-medium text-foreground">Victor Kharkwal</p>
              <p className="text-[12px] text-muted-foreground mt-1">Founder, Style Saplings</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          6. CTA BANNER — Dark sage, cinematic close
      ═══════════════════════════════════════════════════ */}
      <section className="py-16 md:py-28 bg-[#1E3320] relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0id2hpdGUiLz48L3N2Zz4=')] pointer-events-none" />

        <div className="container px-5 md:px-8 text-center relative">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="max-w-2xl mx-auto"
          >
            <motion.h2
              variants={reveal}
              className="font-serif text-3xl md:text-5xl font-medium text-white leading-[1.1] tracking-[-0.01em]"
            >
              {getContent(content, "about_cta_heading", "Dress Your Little One in India's Finest Craft")}
            </motion.h2>
            <motion.p
              variants={reveal}
              className="text-white/75 text-[16px] mt-6 mb-10 max-w-lg mx-auto leading-relaxed"
            >
              {getContent(content, "about_cta_subtitle", "Explore our collection of handcrafted ethnic wear for children aged 2-5 years. Made by skilled artisans across India.")}
            </motion.p>
            <motion.div variants={reveal}>
              <Link
                to="/shop"
                className="group inline-flex items-center gap-2.5 bg-white/15 backdrop-blur-sm border border-white/30 rounded-full px-9 py-4 text-white text-[14px] font-medium tracking-wide hover:bg-white/25 transition-all min-h-[44px]"
              >
                {getContent(content, "about_cta_button", "Explore Collection")}
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
