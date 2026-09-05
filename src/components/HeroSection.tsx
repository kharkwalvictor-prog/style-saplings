import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero.jpg";
import heroMobile from "@/assets/product-4.jpg";

const HeroSection = () => {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "28%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <section
      ref={containerRef}
      className="relative overflow-hidden h-[100svh] min-h-[600px] flex items-center justify-center"
    >
      {/* ── Background image — desktop ── */}
      <motion.div className="absolute inset-0 hidden md:block" style={{ y: imageY }}>
        <img
          src={heroImage}
          alt="Children in handcrafted Indian ethnic wear"
          className="w-full h-[115%] object-cover object-[center_15%]"
        />
      </motion.div>

      {/* ── Background image — mobile ── */}
      <div className="absolute inset-0 block md:hidden">
        <img
          src={heroMobile}
          alt="Handcrafted Indian ethnic wear for children"
          className="w-full h-full object-cover object-center"
        />
      </div>

      {/* ── Warm radial scrim ── */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(15,8,4,0.35)_0%,rgba(15,8,4,0.65)_100%)]" />
      {/* Bottom vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0C0603]/70 via-transparent to-transparent" />

      {/* ── Centered content ── */}
      <motion.div
        style={{ opacity: contentOpacity }}
        className="relative z-10 flex flex-col items-center text-center px-6 max-w-3xl"
      >
        {/* Eyebrow */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="flex items-center gap-3 text-[#E8C9A0] text-[10px] tracking-[0.45em] uppercase font-medium mb-7"
        >
          <span className="block w-7 h-px bg-[#E8C9A0]/40" />
          Handcrafted in India
          <span className="block w-7 h-px bg-[#E8C9A0]/40" />
        </motion.p>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.38 }}
          className="font-serif text-[2.6rem] sm:text-[3.4rem] md:text-[4.2rem] lg:text-[5rem] font-normal text-white leading-[1.06] mb-6 tracking-[-0.01em]"
        >
          Rooted in Tradition,
          <br />
          <em className="italic text-[#E8C9A0] font-light">Styled for Today</em>
        </motion.h1>

        {/* Subline */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.58 }}
          className="text-white/55 text-[14px] md:text-[15px] font-light leading-relaxed mb-10 max-w-sm md:max-w-md"
        >
          Chikankari, Bandhani & Kashmiri ethnic wear — naturally beautiful, lovingly crafted for ages 2–5.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.76 }}
          className="flex items-center gap-5 flex-wrap justify-center"
        >
          <Link
            to="/shop"
            className="inline-flex items-center gap-2.5 bg-white text-[#1A0E08] px-8 py-3.5 rounded-full text-[12px] font-semibold tracking-wide hover:bg-[#E8C9A0] transition-colors duration-300 min-h-[44px]"
          >
            Shop Collection
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            to="/about"
            className="text-[12px] tracking-wide text-white/65 hover:text-white transition-colors border-b border-white/25 hover:border-white/50 pb-px min-h-[44px] flex items-center"
          >
            Our Story
          </Link>
        </motion.div>
      </motion.div>

      {/* ── Bottom bar ── */}
      <div className="absolute bottom-0 left-0 right-0 z-10 flex items-center justify-between px-8 md:px-12 py-5 border-t border-white/10">
        <div className="flex gap-5 md:gap-7">
          {["Chikankari", "Bandhani", "Firan"].map((craft) => (
            <span key={craft} className="text-[9px] tracking-[0.28em] uppercase text-white/30 hidden sm:block">
              {craft}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-px bg-white/20" />
          <span className="text-[9px] tracking-[0.28em] uppercase text-white/30">Scroll</span>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
