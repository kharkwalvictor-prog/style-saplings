import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { DbProduct } from "@/hooks/useProducts";
import { motion, useInView } from "framer-motion";
import { Heart, Star, ShoppingBag } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import { useReviewSummaries } from "@/hooks/useReviews";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";

const fallbackImages: Record<string, string> = {
  Chikankari: product1,
  Bandhani: product2,
  Firan: product3,
  Festive: product4,
};

interface Props {
  product: DbProduct;
  index?: number;
}

const ProductCard = ({ product, index = 0 }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef, { once: true, margin: "-30px" });

  const imgSrc = product.images?.[0] && !product.images[0].includes("placeholder")
    ? product.images[0]
    : fallbackImages[product.craft_type] || product1;

  const { isWishlisted, toggleWishlist } = useWishlist();
  const { data: summaries = [] } = useReviewSummaries();
  const { addItem } = useCart();
  const reviewSummary = summaries.find((s) => s.product_id === product.id);
  const wishlisted = isWishlisted(product.id);
  const [imgLoaded, setImgLoaded] = useState(false);

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const defaultSize = product.sizes?.[0];
    if (defaultSize) {
      addItem(product, defaultSize);
      toast.success(`${product.name} added to cart`);
    }
  };

  const discount = product.sale_price
    ? Math.round(((Number(product.price) - Number(product.sale_price)) / Number(product.price)) * 100)
    : 0;

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link to={`/product/${product.slug}`} className="group block">
        <div className="rounded-xl overflow-hidden">
          <div className="aspect-[3/4] overflow-hidden bg-muted relative">
            {!imgLoaded && <div className="absolute inset-0 bg-muted animate-pulse" />}

            <img
              src={imgSrc}
              alt={product.name}
              className={`w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06] ${imgLoaded ? "opacity-100" : "opacity-0"}`}
              loading="lazy"
              onLoad={() => setImgLoaded(true)}
            />

            {/* Hover gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Sale badge */}
            {discount > 0 && (
              <span className="absolute top-3 left-3 bg-[#C4785A] text-white text-[10px] font-bold px-2.5 py-1 rounded-full z-10">
                -{discount}%
              </span>
            )}

            {/* Wishlist */}
            <button
              onClick={handleWishlist}
              className="absolute top-3 right-3 bg-white/90 backdrop-blur-md rounded-full p-2 shadow-md z-10 hover:scale-110 transition-transform"
              aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart
                className="h-4 w-4 transition-all duration-300"
                fill={wishlisted ? "#C4785A" : "none"}
                stroke={wishlisted ? "#C4785A" : "#3A5139"}
                strokeWidth={2}
              />
            </button>

            {/* Quick add */}
            <div className="absolute bottom-0 inset-x-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
              <button
                onClick={handleQuickAdd}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium text-white bg-white/15 backdrop-blur-xl border border-white/20 hover:bg-white/25 transition-colors"
              >
                <ShoppingBag className="h-4 w-4" />
                Quick Add
              </button>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="mt-3.5 space-y-1 px-0.5">
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#C4785A]">
            {product.craft_type}
          </span>
          <h3 className="font-serif text-base md:text-lg font-medium leading-tight">
            {product.name}
          </h3>
          {reviewSummary && (
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className="h-3 w-3"
                  fill={i < Math.round(reviewSummary.avg_rating) ? "#C4785A" : "none"}
                  stroke="#C4785A"
                  strokeWidth={i < Math.round(reviewSummary.avg_rating) ? 0 : 1.5}
                />
              ))}
              <span className="text-[11px] text-muted-foreground ml-1.5">({reviewSummary.review_count})</span>
            </div>
          )}
          <div className="flex items-center gap-2 pt-0.5">
            {product.sale_price ? (
              <>
                <span className="text-sm font-bold">₹{Number(product.sale_price).toLocaleString("en-IN")}</span>
                <span className="text-xs text-muted-foreground line-through">₹{Number(product.price).toLocaleString("en-IN")}</span>
              </>
            ) : (
              <span className="text-sm font-bold">₹{Number(product.price).toLocaleString("en-IN")}</span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
