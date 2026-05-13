import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { ArrowRight } from "lucide-react";

import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";

const crafts = [
  {
    name: "Chikankari",
    region: "Lucknow",
    desc: "Delicate hand embroidery passed down through generations of Lucknowi artisans.",
    image: product1,
    color: "#F5EDE3",
  },
  {
    name: "Bandhani",
    region: "Rajasthan",
    desc: "Vibrant tie-dye art creating mesmerising patterns through hand-tied knots.",
    image: product2,
    color: "#FDF0E8",
  },
  {
    name: "Firan",
    region: "Kashmir",
    desc: "Traditional Kashmiri tunic silhouette reimagined for the littlest wearers.",
    image: product3,
    color: "#EEF2E8",
  },
];

/* ── Image reveal animation: clip-path wipe ── */
const RevealImage = ({ src, alt, delay = 0 }: { src: string; alt: string; delay?: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <div ref={ref} className="overflow-hidden rounded-2xl aspect-[3/4]">
      <motion.div
        className="w-full h-full"
        initial={{ clipPath: "inset(0 0 100% 0)" }}
        animate={inView ? { clipPath: "inset(0 0 0% 0)" } : {}}
        transition={{ duration: 0.9, delay, ease: [0.77, 0, 0.175, 1] }}
      >
        <motion.img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          initial={{ scale: 1.3 }}
          animate={inView ? { scale: 1 } : {}}
          transition={{ duration: 1.2, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
        />
      </motion.div>
    </div>
  );
};

/* ── Section heading with line animation ── */
const SectionHeading = ({ label, title }: { label: string; title: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  return (
    <div ref={ref} className="text-center mb-16 md:mb-20">
      <motion.span
        initial={{ opacity: 0, y: 10 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
        className="text-[10px] md:text-xs tracking-[0.35em] uppercase font-bold block mb-3"
        style={{ color: '#C06A4F' }}
      >
        {label}
      </motion.span>
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="font-serif text-3xl md:text-5xl font-semibold mb-5"
      >
        {title}
      </motion.h2>
      <motion.div
        initial={{ scaleX: 0 }}
        animate={inView ? { scaleX: 1 } : {}}
        transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="w-16 h-[2px] mx-auto origin-center"
        style={{ backgroundColor: '#C06A4F' }}
      />
    </div>
  );
};

/* ── Main Craft Showcase ── */
const CraftShowcase = () => {
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section ref={sectionRef} className="py-20 md:py-32" style={{ backgroundColor: '#F7F4EF' }}>
      <div className="container px-4 md:px-8">
        <SectionHeading label="Heritage Textiles" title="Our Craft" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {crafts.map((craft, i) => (
            <motion.div
              key={craft.name}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{
                type: "spring",
                damping: 20,
                stiffness: 80,
                delay: i * 0.15,
              }}
            >
              <Link
                to="/shop"
                className="group block rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-[0_20px_60px_rgba(0,0,0,0.1)]"
                style={{ backgroundColor: craft.color }}
              >
                {/* Image with reveal animation */}
                <div className="overflow-hidden">
                  <RevealImage src={craft.image} alt={craft.name} delay={i * 0.15} />
                </div>

                {/* Content */}
                <div className="p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="font-serif text-2xl font-semibold group-hover:text-[#4A6741] transition-colors duration-300">
                      {craft.name}
                    </h3>
                  </div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3 font-medium">
                    {craft.region}
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    {craft.desc}
                  </p>

                  {/* CTA — slides in */}
                  <motion.div
                    className="flex items-center gap-2 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-all duration-400 translate-y-2 group-hover:translate-y-0"
                    style={{ color: '#C06A4F' }}
                  >
                    Explore Collection
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </motion.div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export { SectionHeading };
export default CraftShowcase;
