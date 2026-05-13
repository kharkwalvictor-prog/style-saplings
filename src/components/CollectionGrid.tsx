import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product4 from "@/assets/product-4.jpg";

const collections = [
  {
    title: "Chikankari",
    subtitle: "Lucknow's hand embroidery",
    image: product1,
    link: "/shop",
  },
  {
    title: "Bandhani",
    subtitle: "Rajasthan's tie-dye art",
    image: product2,
    link: "/shop",
  },
  {
    title: "Festive Wear",
    subtitle: "For every celebration",
    image: product4,
    link: "/shop",
  },
];

const CollectionGrid = () => {
  return (
    <section className="py-16 md:py-24">
      <div className="container px-6 md:px-8">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="font-serif text-2xl md:text-4xl font-semibold text-center mb-10 md:mb-14"
        >
          Shop by Collection
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
          {collections.map((col, i) => (
            <motion.div
              key={col.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.12 }}
            >
              <Link to={col.link} className="group block relative rounded-xl overflow-hidden aspect-[3/4]">
                <motion.img
                  src={col.image}
                  alt={col.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
                  <h3 className="font-serif text-xl md:text-2xl font-semibold text-white mb-1">
                    {col.title}
                  </h3>
                  <p className="text-white/60 text-sm">{col.subtitle}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CollectionGrid;
