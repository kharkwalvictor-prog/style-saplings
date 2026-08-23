import { motion } from "framer-motion";

interface PageBannerProps {
  label: string;
  title: string;
  image?: string;
}

const PageBanner = ({ label, title, image }: PageBannerProps) => (
  <section className="relative h-[45vh] min-h-[260px] overflow-hidden bg-[#1E3320]">
    {image && (
      <img
        src={image}
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-20"
        loading="eager"
      />
    )}
    <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40" />
    <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <span className="text-[12px] tracking-[0.3em] uppercase font-medium text-white/75 mb-3 block">
          {label}
        </span>
        <h1 className="font-serif text-3xl md:text-5xl font-semibold text-white">
          {title}
        </h1>
        <div className="w-12 h-[2px] bg-[#C06A4F] mx-auto mt-5" />
      </motion.div>
    </div>
  </section>
);

export default PageBanner;
