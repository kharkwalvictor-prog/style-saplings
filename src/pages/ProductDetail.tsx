import { useState, useMemo, useRef, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { useSEO } from "@/hooks/useSEO";
import JsonLd from "@/components/JsonLd";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { useProductBySlug, useProducts } from "@/hooks/useProducts";
import { useCart } from "@/context/CartContext";
import { Heart, ArrowRight, Check } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import ProductReviews from "@/components/ProductReviews";

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

type Size = "2Y" | "3Y" | "4Y" | "5Y";

/* -- Craft origin mapping -- */
const craftOrigins: Record<string, string> = {
  Chikankari: "Lucknow, Uttar Pradesh",
  Bandhani: "Jaipur, Rajasthan",
  Firan: "Srinagar, Kashmir",
  Festive: "Across India",
};

/* -- Animation variants (matching Index.tsx patterns) -- */
const reveal = {
  hidden: { opacity: 0, y: 20, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { type: "spring", damping: 30, stiffness: 120 },
  },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

/* ================================================================
   PRODUCT DETAIL PAGE
   ================================================================ */
const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading } = useProductBySlug(slug);
  const { data: allProducts = [] } = useProducts();
  const { addItem } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();

  const [selectedSize, setSelectedSize] = useState<Size | null>(null);
  const [addedToCart, setAddedToCart] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  /* -- Zoom state -- */
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const [isZooming, setIsZooming] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });

  /* -- Resolve product images -- */
  const productImages = useMemo(() => {
    if (!product) return [product1];
    const validImages = (product.images || []).filter(
      (img) => img && !img.includes("placeholder")
    );
    if (validImages.length > 0) return validImages;
    return [fallbackImages[product.craft_type] || product1];
  }, [product]);

  const activeImage = productImages[activeImageIndex] || productImages[0];

  const imgSrc = product
    ? productImages[0]
    : product1;

  const productDesc = product
    ? product.description
      ? product.description.slice(0, 155)
      : `${product.name} — handcrafted ${product.craft_type} ethnic wear for kids.`
    : "Handcrafted ethnic wear for kids";

  useSEO({
    title: product ? `${product.name} | Style Saplings` : "Style Saplings",
    description: productDesc,
    ogImage: imgSrc,
    canonicalPath: `/product/${slug}`,
    type: "product",
  });

  const productJsonLd = useMemo(
    () =>
      product
        ? {
            "@context": "https://schema.org/",
            "@type": "Product",
            name: product.name,
            image: [imgSrc],
            description: product.description || product.name,
            brand: { "@type": "Brand", name: "Style Saplings" },
            offers: {
              "@type": "Offer",
              url: `https://stylesaplings.com/product/${product.slug}`,
              priceCurrency: "INR",
              price: product.sale_price || product.price,
              availability:
                product.stock_status === "out_of_stock"
                  ? "https://schema.org/OutOfStock"
                  : "https://schema.org/InStock",
              seller: { "@type": "Organization", name: "Style Saplings" },
            },
          }
        : null,
    [product, imgSrc]
  );

  /* -- Handlers -- */
  const handleAddToCart = useCallback(() => {
    if (!product) return;
    if (!selectedSize) {
      toast.error("Please select a size");
      return;
    }
    addItem(product, selectedSize);
    setAddedToCart(true);
    toast.success(`${product.name} added to cart`);
    setTimeout(() => setAddedToCart(false), 2000);
  }, [product, selectedSize, addItem]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!imageContainerRef.current) return;
      const rect = imageContainerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setZoomPosition({ x, y });
    },
    []
  );

  /* ── LOADING STATE ── */
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container px-4 md:px-8 py-6 md:py-10">
          <Skeleton className="h-4 w-48 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-14">
            <div className="md:col-span-7 space-y-4">
              <Skeleton className="aspect-[3/4] rounded-2xl" />
              <div className="flex gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="w-16 h-20 rounded-xl" />
                ))}
              </div>
            </div>
            <div className="md:col-span-5 space-y-6">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-7 w-32" />
              <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 rounded-xl" />
                ))}
              </div>
              <Skeleton className="h-5 w-16" />
              <div className="flex gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="w-14 h-12 rounded-lg" />
                ))}
              </div>
              <Skeleton className="h-14 rounded-full" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  /* ── NOT FOUND STATE ── */
  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container px-4 py-32 text-center">
          <h1 className="font-serif text-3xl mb-2">Product not found</h1>
          <p className="text-sm text-muted-foreground mb-6">
            The item you are looking for may have been removed or is no longer
            available.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-sm font-medium hover:underline underline-offset-4"
          >
            <ArrowRight className="h-4 w-4 rotate-180" /> Back to shop
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  /* ── Derived data ── */
  const related = allProducts
    .filter((p) => p.craft_type === product.craft_type && p.id !== product.id)
    .slice(0, 4);

  const isLowStock = product.stock_status === "low_stock";
  const isOutOfStock = product.stock_status === "out_of_stock";
  const origin = craftOrigins[product.craft_type] || "Across India";

  const emotionalCards = [
    {
      label: "Crafted In",
      value: origin,
    },
    {
      label: "Perfect For",
      value: "Festivals, family gatherings, everyday wear",
    },
    {
      label: "Fabric Feel",
      value: "Breathable, soft on skin, lightweight",
    },
    {
      label: "Comfort",
      value: "Designed for movement and all-day wear",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {productJsonLd && <JsonLd data={productJsonLd} />}
      <Header />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={stagger}
        className="container px-4 md:px-8 py-6 md:py-10"
      >
        {/* ── Breadcrumb ── */}
        <motion.nav
          variants={reveal}
          className="text-xs text-muted-foreground mb-8 flex items-center gap-1.5"
          aria-label="Breadcrumb"
        >
          <Link
            to="/"
            className="hover:text-foreground transition-colors"
          >
            Home
          </Link>
          <span className="text-border">/</span>
          <Link
            to="/shop"
            className="hover:text-foreground transition-colors"
          >
            Shop
          </Link>
          <span className="text-border">/</span>
          <span className="text-foreground font-medium truncate max-w-[200px]">
            {product.name}
          </span>
        </motion.nav>

        {/* ════════════════════════════════════════════
            MAIN GRID — Image left, Info right
        ════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-14">
          {/* ── LEFT: IMAGERY (col-span-7) ── */}
          <motion.div variants={reveal} className="md:col-span-7">
            {/* Main image with zoom-on-hover */}
            <div
              ref={imageContainerRef}
              className="aspect-[3/4] overflow-hidden rounded-2xl bg-muted relative cursor-crosshair"
              onMouseEnter={() => setIsZooming(true)}
              onMouseLeave={() => setIsZooming(false)}
              onMouseMove={handleMouseMove}
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeImage}
                  src={activeImage}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: 1,
                    scale: isZooming ? 1.5 : 1,
                    transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                  }}
                  exit={{ opacity: 0 }}
                  transition={{
                    opacity: { duration: 0.3 },
                    scale: { duration: 0.3, ease: "easeOut" },
                  }}
                />
              </AnimatePresence>
            </div>

            {/* Thumbnail strip */}
            {productImages.length > 1 && (
              <div className="flex gap-3 mt-4">
                {productImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImageIndex(i)}
                    className={`w-16 h-20 rounded-xl overflow-hidden transition-all duration-200 ${
                      activeImageIndex === i
                        ? "ring-2 ring-foreground ring-offset-2 ring-offset-background"
                        : "opacity-60 hover:opacity-100"
                    }`}
                    aria-label={`View image ${i + 1}`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} thumbnail ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* ── RIGHT: PRODUCT INFO (col-span-5) ── */}
          <motion.div
            variants={stagger}
            className="md:col-span-5 flex flex-col"
          >
            {/* Craft badge */}
            <motion.span
              variants={reveal}
              className="text-xs uppercase tracking-[0.18em] text-[#7B8B6F] font-medium mb-3"
            >
              {product.craft_type}
            </motion.span>

            {/* Product name */}
            <motion.h1
              variants={reveal}
              className="font-serif text-[28px] md:text-[34px] font-medium leading-tight mb-5"
            >
              {product.name}
            </motion.h1>

            {/* Price */}
            <motion.div
              variants={reveal}
              className="flex items-baseline gap-3 mb-8"
            >
              {product.sale_price ? (
                <>
                  <span className="text-[22px] font-semibold text-[#C4785A]">
                    {"\u20B9"}
                    {Number(product.sale_price).toLocaleString("en-IN")}
                  </span>
                  <span className="text-[15px] text-muted-foreground line-through">
                    {"\u20B9"}
                    {Number(product.price).toLocaleString("en-IN")}
                  </span>
                </>
              ) : (
                <span className="text-[22px] font-semibold">
                  {"\u20B9"}
                  {Number(product.price).toLocaleString("en-IN")}
                </span>
              )}
            </motion.div>

            {/* Emotional content cards (2x2 grid) */}
            <motion.div
              variants={reveal}
              className="grid grid-cols-2 gap-3 mb-8"
            >
              {emotionalCards.map((card) => (
                <div
                  key={card.label}
                  className="bg-[#EDE8DF]/50 rounded-xl p-4"
                >
                  <span className="text-[11px] uppercase tracking-wider text-muted-foreground block mb-1">
                    {card.label}
                  </span>
                  <span className="text-[14px] font-medium leading-snug block">
                    {card.value}
                  </span>
                </div>
              ))}
            </motion.div>

            {/* Size selector */}
            <motion.div variants={reveal} className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium">Size</span>
                <button className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors">
                  Size guide
                </button>
              </div>
              <div className="flex gap-2">
                {(["2Y", "3Y", "4Y", "5Y"] as Size[]).map((s) => {
                  const available =
                    product.sizes.includes(s) && !isOutOfStock;
                  return (
                    <button
                      key={s}
                      disabled={!available}
                      onClick={() => setSelectedSize(s)}
                      className={`h-12 px-5 text-sm font-medium rounded-lg transition-all duration-200 ${
                        selectedSize === s
                          ? "bg-foreground text-background"
                          : available
                          ? "border border-border hover:border-foreground/30"
                          : "border border-border/40 text-muted-foreground/30 cursor-not-allowed"
                      }`}
                      aria-label={`Size ${s}${!available ? " unavailable" : ""}`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
              {isLowStock && (
                <p className="text-xs text-[#C4785A] mt-2 font-medium">
                  Low stock -- order soon
                </p>
              )}
              {isOutOfStock && (
                <p className="text-xs text-muted-foreground mt-2">
                  Currently out of stock
                </p>
              )}
            </motion.div>

            {/* Add to Cart + Wishlist */}
            <motion.div variants={reveal} className="flex gap-3 mb-8">
              <Button
                disabled={isOutOfStock}
                onClick={handleAddToCart}
                className={`flex-1 rounded-full py-4 h-auto text-[14px] font-medium transition-all duration-300 ${
                  addedToCart
                    ? "bg-[#7B8B6F] hover:bg-[#7B8B6F] text-white"
                    : "bg-foreground text-background hover:bg-foreground/90"
                }`}
              >
                {addedToCart ? (
                  <>
                    <Check className="h-4 w-4 mr-2" /> Added to cart
                  </>
                ) : isOutOfStock ? (
                  "Out of Stock"
                ) : (
                  "Add to Cart"
                )}
              </Button>
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`w-14 h-auto rounded-full border flex items-center justify-center transition-all duration-200 ${
                  isWishlisted(product.id)
                    ? "bg-[#C4785A]/10 border-[#C4785A]/30"
                    : "border-border hover:border-foreground/30"
                }`}
                aria-label={
                  isWishlisted(product.id)
                    ? "Remove from wishlist"
                    : "Add to wishlist"
                }
              >
                <Heart
                  className="h-5 w-5 transition-colors duration-200"
                  fill={isWishlisted(product.id) ? "#C4785A" : "none"}
                  stroke={isWishlisted(product.id) ? "#C4785A" : "currentColor"}
                  strokeWidth={1.5}
                />
              </button>
            </motion.div>

            {/* Description */}
            {product.description && (
              <motion.div variants={reveal} className="mb-8">
                <p className="text-[14px] text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </motion.div>
            )}

            {/* Trust section */}
            <motion.div
              variants={reveal}
              className="pt-6 border-t border-border"
            >
              <p className="text-xs text-muted-foreground">
                Easy exchange{" "}
                <span className="mx-2 text-border">{"·"}</span> Gentle
                fabrics{" "}
                <span className="mx-2 text-border">{"·"}</span> Pan-India
                delivery
              </p>
            </motion.div>
          </motion.div>
        </div>

        {/* ════════════════════════════════════════════
            RELATED PRODUCTS
        ════════════════════════════════════════════ */}
        {related.length > 0 && (
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={stagger}
            className="mt-24 mb-8"
          >
            <motion.div
              variants={reveal}
              className="flex items-end justify-between mb-10"
            >
              <h2 className="font-serif text-xl">You may also like</h2>
              <Link
                to="/shop"
                className="group flex items-center gap-2 text-sm text-muted-foreground font-medium hover:text-foreground transition-colors"
              >
                View All
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {related.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </motion.section>
        )}

        {/* ════════════════════════════════════════════
            REVIEWS SECTION
        ════════════════════════════════════════════ */}
        <ProductReviews productId={product.id} />
      </motion.div>

      <Footer />
    </div>
  );
};

export default ProductDetail;
