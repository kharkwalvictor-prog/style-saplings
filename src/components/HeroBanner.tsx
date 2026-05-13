import { useState, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { motion, AnimatePresence } from "framer-motion";

import heroImage from "@/assets/hero.jpg";
import product4 from "@/assets/product-4.jpg";
import product1 from "@/assets/product-1.jpg";

const slides = [
  {
    image: heroImage,
    subtitle: "Handcrafted in India",
    title: "Handcrafted Ethnic Wear for Little Ones",
    description: "Chikankari, Bandhani & Kashmiri ethnic wear — pure cotton, ages 2–5.",
    cta: "Shop Collection",
    link: "/shop",
  },
  {
    image: product4,
    subtitle: "Festive Season",
    title: "Festive Collection — Dress Up for Celebrations",
    description: "Stunning ethnic outfits for every occasion, from Diwali to weddings.",
    cta: "Shop Festive",
    link: "/shop",
  },
  {
    image: product1,
    subtitle: "Heritage Craft",
    title: "Chikankari Heritage — Lucknow's Finest",
    description: "Delicate hand embroidery on pure cotton mulmul, passed down through generations.",
    cta: "Explore Chikankari",
    link: "/shop",
  },
];

const HeroBanner = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 5000, stopOnInteraction: false }),
  ]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    return () => { emblaApi.off("select", onSelect); };
  }, [emblaApi, onSelect]);

  const scrollTo = useCallback(
    (index: number) => emblaApi?.scrollTo(index),
    [emblaApi]
  );

  return (
    <section className="relative h-[60vh] md:h-[75vh] overflow-hidden">
      <div ref={emblaRef} className="h-full overflow-hidden">
        <div className="flex h-full">
          {slides.map((slide, i) => (
            <div key={i} className="flex-[0_0_100%] min-w-0 relative h-full">
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1E3320]/70 via-[#1E3320]/20 to-transparent" />
            </div>
          ))}
        </div>
      </div>

      {/* Text overlay — animates on slide change */}
      <div className="absolute inset-0 z-10 flex items-end pb-16 md:pb-24 pointer-events-none">
        <div className="container px-6 md:px-8 pointer-events-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedIndex}
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="text-white/50 text-[12px] tracking-[0.35em] uppercase mb-4 font-medium">
                {slides[selectedIndex].subtitle}
              </p>
              <h1 className="font-serif text-3xl md:text-5xl lg:text-[4rem] font-semibold text-white leading-[1.1] mb-4 max-w-2xl">
                {slides[selectedIndex].title}
              </h1>
              <p className="text-white/60 text-sm md:text-base max-w-md mb-8 leading-relaxed">
                {slides[selectedIndex].description}
              </p>
              <Link
                to={slides[selectedIndex].link}
                className="inline-flex items-center gap-2 bg-[#C06A4F] hover:bg-[#A85D43] text-white text-sm font-semibold tracking-wide px-8 py-3.5 rounded-full transition-colors active:scale-[0.97]"
              >
                {slides[selectedIndex].cta}
              </Link>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Dot indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2.5">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => scrollTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              i === selectedIndex
                ? "bg-white w-6"
                : "bg-white/40 hover:bg-white/60"
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroBanner;
