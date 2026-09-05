import { motion } from "framer-motion";
import defaultBg from "@/assets/hero.jpg";

interface PageBannerProps {
  label: string;
  title: string;
  image?: string;
}

const PageBanner = ({ label, title, image }: PageBannerProps) => {
  const bg = image || defaultBg;
  return (
    <section className="relative h-[44vh] min-h-[260px] overflow-hidden bg-[#1E3320]">
      {/* Full-bleed background image — same cinematic treatment as hero */}
      <img
        src={bg}
        alt=""
        className="absolute inset-0 w-full h-full object-cover object-center opacity-30"
        loading="eager"
      />
      {/* Dark overlay — same depth as hero */}
      <div className="absolute inset-0 bg-[#1E3320]/70" />
      {/* Warm radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(192,106,79,0.15)_0%,transparent_65%)]" />
      {/* Bottom vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#1E3320]/80" />

      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <span className="text-[10px] tracking-[0.4em] uppercase font-medium text-[#E8C9A0]/70 mb-4 block">
            {label}
          </span>
          <h1 className="font-serif text-[2.2rem] md:text-[3.2rem] font-medium text-white leading-[1.08] tracking-[-0.01em]">
            {title}
          </h1>
          <div className="w-10 h-px bg-[#C06A4F] mx-auto mt-6" />
        </motion.div>
      </div>
    </section>
  );
};

export default PageBanner;
