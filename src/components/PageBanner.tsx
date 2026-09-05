import { motion } from "framer-motion";

interface PageBannerProps {
  label: string;
  title: string;
  image?: string;
}

const PageBanner = ({ label, title, image }: PageBannerProps) => (
  <section className="relative h-[38vh] min-h-[240px] overflow-hidden bg-[#1E3320]">
    {/* Subtle dot texture — matches homepage CTA section */}
    <div className="absolute inset-0 opacity-[0.04] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0id2hpdGUiLz48L3N2Zz4=')] pointer-events-none" />
    {/* Warm radial glow from center */}
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(192,106,79,0.12)_0%,transparent_70%)]" />
    {image && (
      <img
        src={image}
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-15"
        loading="eager"
      />
    )}
    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#1E3320]/60" />
    <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <span className="text-[10px] tracking-[0.4em] uppercase font-medium text-[#E8C9A0]/70 mb-4 block">
          {label}
        </span>
        <h1 className="font-serif text-[2rem] md:text-[3rem] font-medium text-white leading-[1.1]">
          {title}
        </h1>
        <div className="w-10 h-px bg-[#C06A4F] mx-auto mt-5" />
      </motion.div>
    </div>
  </section>
);

export default PageBanner;
