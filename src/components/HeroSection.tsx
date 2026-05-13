import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import heroImage from "@/assets/hero.jpg";

/* ── Floating Paisley SVG decorations ── */
const PaisleySVG = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 60 80" fill="none" className={className}>
    <path
      d="M30 5C15 5 5 20 5 40C5 55 15 70 30 75C45 70 55 55 55 40C55 20 45 5 30 5Z"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="none"
      opacity="0.3"
    />
    <path
      d="M30 15C22 15 15 25 15 38C15 48 22 58 30 62C38 58 45 48 45 38C45 25 38 15 30 15Z"
      stroke="currentColor"
      strokeWidth="1"
      fill="none"
      opacity="0.2"
    />
    <circle cx="30" cy="35" r="4" fill="currentColor" opacity="0.15" />
  </svg>
);

const MandalaDot = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 40 40" fill="none" className={className}>
    <circle cx="20" cy="20" r="8" stroke="currentColor" strokeWidth="1" opacity="0.2" />
    <circle cx="20" cy="20" r="3" fill="currentColor" opacity="0.15" />
    {[0, 60, 120, 180, 240, 300].map(deg => (
      <circle
        key={deg}
        cx={20 + 12 * Math.cos((deg * Math.PI) / 180)}
        cy={20 + 12 * Math.sin((deg * Math.PI) / 180)}
        r="1.5"
        fill="currentColor"
        opacity="0.12"
      />
    ))}
  </svg>
);

/* ── Word-by-word text reveal ── */
const SplitText = ({
  text,
  className = "",
  delay = 0,
}: {
  text: string;
  className?: string;
  delay?: number;
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  return (
    <span ref={ref} className={`inline-flex flex-wrap ${className}`}>
      {text.split(" ").map((word, i) => (
        <motion.span
          key={i}
          className="inline-block mr-[0.3em] overflow-hidden"
          initial={{ y: "110%" }}
          animate={inView ? { y: "0%" } : { y: "110%" }}
          transition={{
            type: "spring",
            damping: 20,
            stiffness: 90,
            delay: delay + i * 0.08,
          }}
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
};

/* ── Shimmer Button ── */
const ShimmerButton = ({
  children,
  to,
  className = "",
}: {
  children: React.ReactNode;
  to: string;
  className?: string;
}) => (
  <Link
    to={to}
    className={`group relative inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-medium tracking-wide overflow-hidden transition-transform active:scale-[0.97] ${className}`}
  >
    {/* Shimmer sweep */}
    <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/25 to-transparent" />
    <span className="relative z-10 flex items-center gap-2">{children}</span>
  </Link>
);

/* ── Main Hero Component ── */
const HeroSection = () => {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  // Parallax transforms
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "35%"]);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1.15, 1.3]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.5], [0.55, 0.8]);

  return (
    <section
      ref={containerRef}
      className="relative overflow-hidden min-h-[90vh] md:min-h-screen"
    >
      {/* ── Parallax Background ── */}
      <motion.div className="absolute inset-0" style={{ y: imageY }}>
        <motion.img
          src={heroImage}
          alt="Children in beautiful Indian ethnic wear"
          className="w-full h-full object-cover"
          style={{ scale: imageScale }}
        />
        {/* Multi-layer gradient overlay */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-[#1E2E1A]/80 via-[#2A3F25]/50 to-transparent"
          style={{ opacity: overlayOpacity }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1E2E1A]/60 via-transparent to-[#1E2E1A]/30" />
      </motion.div>

      {/* ── Grain texture ── */}
      <div className="absolute inset-0 grain-overlay pointer-events-none" />

      {/* ── Floating Paisley decorations ── */}
      <motion.div
        animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[15%] right-[8%] text-[#E8C9A0] hidden md:block"
      >
        <PaisleySVG className="w-16 h-20" />
      </motion.div>
      <motion.div
        animate={{ y: [0, 12, 0], rotate: [0, -8, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-[25%] right-[15%] text-[#E8C9A0] hidden md:block"
      >
        <MandalaDot className="w-12 h-12" />
      </motion.div>
      <motion.div
        animate={{ y: [0, -10, 0], rotate: [0, 10, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 4 }}
        className="absolute top-[40%] right-[5%] text-[#E8C9A0] hidden lg:block"
      >
        <PaisleySVG className="w-10 h-14 rotate-45" />
      </motion.div>
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-[35%] left-[5%] text-[#E8C9A0]/40 hidden lg:block"
      >
        <MandalaDot className="w-8 h-8" />
      </motion.div>

      {/* ── Content ── */}
      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative z-10 container px-6 md:px-8 flex flex-col items-start justify-center min-h-[90vh] md:min-h-screen"
      >
        <div className="max-w-2xl">
          {/* Tag */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", damping: 20, stiffness: 100, delay: 0.2 }}
          >
            <span className="inline-flex items-center gap-2 text-[#E8C9A0]/80 text-[10px] md:text-xs tracking-[0.3em] uppercase mb-8 font-medium border border-[#E8C9A0]/20 px-5 py-2 rounded-full backdrop-blur-md bg-white/5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#C06A4F] animate-pulse" />
              Authentic Indian Craftsmanship
            </span>
          </motion.div>

          {/* Headline — word-by-word spring reveal */}
          <h1 className="font-serif text-[2.75rem] md:text-6xl lg:text-7xl font-semibold text-white leading-[1.08] mb-7">
            <SplitText text="Rooted in" delay={0.4} />
            <br />
            <SplitText text="Tradition," delay={0.6} />
            <br />
            <span className="italic" style={{ color: '#E8C9A0' }}>
              <SplitText text="Styled for Today" delay={0.85} />
            </span>
          </h1>

          {/* Subtext with line reveal */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 80, delay: 1.3 }}
            className="text-white/60 text-base md:text-lg mb-10 leading-relaxed max-w-md"
          >
            Handcrafted Chikankari, Bandhani & Kashmiri ethnic wear for your little ones — naturally beautiful, comfortably worn.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 80, delay: 1.5 }}
            className="flex flex-wrap gap-4"
          >
            <ShimmerButton to="/shop" className="bg-[#4A6B45] text-white hover:bg-[#4A6741]">
              Shop Collection
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </ShimmerButton>
            <Link
              to="/about"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-medium tracking-wide border border-white/20 text-white/80 hover:bg-white/10 backdrop-blur-sm transition-all"
            >
              Our Story
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* ── Scroll indicator ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
      >
        <motion.span
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-white/40 text-[9px] tracking-[0.3em] uppercase font-medium"
        >
          Scroll to explore
        </motion.span>
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="h-4 w-4 text-white/30" />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
