import { motion } from "framer-motion";

interface PageBannerProps {
  label: string;
  title: string;
}

const PageBanner = ({ label, title }: PageBannerProps) => (
  <section className="relative overflow-hidden grain-overlay" style={{ backgroundColor: '#1E3320' }}>
    <div className="relative z-10 flex items-center justify-center py-14 md:py-20 px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="text-center"
      >
        <span className="text-[10px] md:text-xs tracking-[0.3em] uppercase font-medium text-white/50 mb-3 block">
          {label}
        </span>
        <h1 className="font-serif text-3xl md:text-5xl font-semibold text-white">
          {title}
        </h1>
        <div className="w-12 h-[2px] mx-auto mt-5" style={{ backgroundColor: '#C06A4F' }} />
      </motion.div>
    </div>
  </section>
);

export default PageBanner;
