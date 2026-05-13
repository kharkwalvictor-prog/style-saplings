import { useState, useMemo } from "react";
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
import { ChevronDown, ChevronUp, Heart, Loader2, Truck, Shield, RotateCcw, ArrowRight, Check } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import { toast } from "sonner";
import ProductReviews from "@/components/ProductReviews";

import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";

const fallbackImages: Record<string, string> = { Chikankari: product1, Bandhani: product2, Firan: product3, Festive: product4 };

type Size = "2Y" | "3Y" | "4Y" | "5Y";

const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading } = useProductBySlug(slug);
  const { data: allProducts = [] } = useProducts();
  const { addItem } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const [selectedSize, setSelectedSize] = useState<Size | null>(null);
  const [openAccordion, setOpenAccordion] = useState<string | null>("description");
  const [addedToCart, setAddedToCart] = useState(false);
  const [imgZoomed, setImgZoomed] = useState(false);

  const imgSrc = product
    ? (product.images?.[0] && !product.images[0].includes("placeholder") ? product.images[0] : fallbackImages[product.craft_type] || product1)
    : product1;

  const productDesc = product
    ? (product.description ? product.description.slice(0, 155) : `${product.name} — handcrafted ${product.craft_type} ethnic wear for kids.`)
    : "Handcrafted ethnic wear for kids";

  useSEO({
    title: product ? `${product.name} | Style Saplings` : "Style Saplings",
    description: productDesc,
    ogImage: imgSrc,
    canonicalPath: `/product/${slug}`,
    type: "product",
  });

  const productJsonLd = useMemo(() => product ? ({
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
      availability: product.stock_status === "out_of_stock"
        ? "https://schema.org/OutOfStock"
        : "https://schema.org/InStock",
      seller: { "@type": "Organization", name: "Style Saplings" },
    },
  }) : null, [product, imgSrc]);

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="flex justify-center py-32">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container px-4 py-32 text-center">
          <h1 className="font-serif text-3xl mb-4">Product not found</h1>
          <Link to="/shop" className="text-primary hover:underline inline-flex items-center gap-2">
            <ArrowRight className="h-4 w-4 rotate-180" /> Back to shop
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const related = allProducts.filter(p => p.craft_type === product.craft_type && p.id !== product.id).slice(0, 4);

  const discount = product.sale_price
    ? Math.round(((Number(product.price) - Number(product.sale_price)) / Number(product.price)) * 100)
    : 0;

  const handleAddToCart = () => {
    if (!selectedSize) { toast.error("Please select a size"); return; }
    addItem(product, selectedSize);
    setAddedToCart(true);
    toast.success(`${product.name} added to cart`);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleBuyNow = () => {
    if (!selectedSize) { toast.error("Please select a size"); return; }
    addItem(product, selectedSize);
    window.location.href = "/cart";
  };

  const accordionItems = [
    { key: "description", label: "Description", content: product.description || "" },
    { key: "fabric", label: "Fabric & Care", content: "Made from 100% pure cotton mulmul. Hand wash in cold water with mild detergent. Do not bleach. Dry in shade. Iron on low heat." },
  ];

  return (
    <div className="min-h-screen">
      {productJsonLd && <JsonLd data={productJsonLd} />}
      <Header />

      <div className="container px-4 md:px-8 py-6 md:py-10">
        {/* Breadcrumb */}
        <nav className="text-xs text-muted-foreground mb-8 flex items-center gap-2">
          <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
          <span className="text-border">/</span>
          <Link to="/shop" className="hover:text-foreground transition-colors">Shop</Link>
          <span className="text-border">/</span>
          <span className="text-foreground font-medium">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div
              className="aspect-[3/4] overflow-hidden rounded-xl bg-muted relative cursor-zoom-in shadow-sm"
              onClick={() => setImgZoomed(!imgZoomed)}
            >
              <motion.img
                src={imgSrc}
                alt={product.name}
                className="w-full h-full object-cover"
                animate={{ scale: imgZoomed ? 1.5 : 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
              {discount > 0 && (
                <span className="absolute top-4 left-4 bg-sale text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                  -{discount}% OFF
                </span>
              )}
            </div>
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {/* Craft badge */}
            <span className="inline-block px-3 py-1 text-[10px] uppercase tracking-[0.18em] bg-sale/10 text-sale font-semibold rounded-full mb-4">
              {product.craft_type}
            </span>

            <h1 className="font-serif text-3xl md:text-4xl font-semibold mb-4 leading-tight">{product.name}</h1>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              {product.sale_price ? (
                <>
                  <span className="text-3xl font-serif font-semibold">₹{Number(product.sale_price).toLocaleString("en-IN")}</span>
                  <span className="text-lg text-muted-foreground line-through">₹{Number(product.price).toLocaleString("en-IN")}</span>
                  <span className="text-sm text-sale font-semibold">Save {discount}%</span>
                </>
              ) : (
                <span className="text-3xl font-serif font-semibold">₹{Number(product.price).toLocaleString("en-IN")}</span>
              )}
            </div>

            {/* Size selector */}
            <div className="mb-6">
              <p className="text-sm font-medium mb-3">Select Size</p>
              <div className="flex gap-2">
                {(["2Y", "3Y", "4Y", "5Y"] as Size[]).map(s => {
                  const available = product.sizes.includes(s);
                  return (
                    <button
                      key={s}
                      disabled={!available}
                      onClick={() => setSelectedSize(s)}
                      className={`w-14 h-14 text-sm font-medium border-2 rounded-xl transition-all duration-200 ${
                        selectedSize === s
                          ? "bg-foreground text-primary-foreground border-foreground shadow-sm"
                          : available
                            ? "border-border hover:border-foreground"
                            : "border-border/50 text-muted-foreground/30 cursor-not-allowed"
                      }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 mb-3">
              <Button
                variant="hero"
                className={`flex-1 h-12 rounded-xl text-sm transition-all ${addedToCart ? 'bg-green-700 hover:bg-green-700' : ''}`}
                onClick={handleAddToCart}
              >
                {addedToCart ? (
                  <><Check className="h-4 w-4 mr-2" /> Added!</>
                ) : (
                  "Add to Cart"
                )}
              </Button>
              <Button variant="hero-outline" className="flex-1 h-12 rounded-xl text-sm" onClick={handleBuyNow}>
                Buy Now
              </Button>
            </div>

            {/* Wishlist */}
            <Button
              variant={isWishlisted(product.id) ? "default" : "outline"}
              className={`w-full mb-8 h-11 rounded-xl ${
                isWishlisted(product.id)
                  ? "bg-sale hover:bg-sale/90 text-white border-sale"
                  : "border-sale/30 text-sale hover:bg-sale/5"
              }`}
              onClick={() => toggleWishlist(product.id)}
            >
              <Heart className="h-4 w-4 mr-2" fill={isWishlisted(product.id) ? "currentColor" : "none"} />
              {isWishlisted(product.id) ? "Saved to Wishlist" : "Save to Wishlist"}
            </Button>

            {/* Trust signals */}
            <div className="grid grid-cols-3 gap-3 mb-8">
              {[
                { icon: Truck, label: "Free Shipping", sub: "Above ₹999" },
                { icon: Shield, label: "Skin-Safe", sub: "100% Cotton" },
                { icon: RotateCcw, label: "Easy Returns", sub: "7-Day Policy" },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="text-center p-3 rounded-xl bg-accent/50">
                  <Icon className="h-4 w-4 mx-auto mb-1.5 text-primary" strokeWidth={1.5} />
                  <p className="text-xs font-medium">{label}</p>
                  <p className="text-[10px] text-muted-foreground">{sub}</p>
                </div>
              ))}
            </div>

            {/* Accordions */}
            <div className="border-t">
              {accordionItems.map(item => (
                <div key={item.key} className="border-b">
                  <button
                    onClick={() => setOpenAccordion(openAccordion === item.key ? null : item.key)}
                    className="w-full flex items-center justify-between py-4 text-sm font-medium hover:text-primary transition-colors"
                  >
                    {item.label}
                    {openAccordion === item.key ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                  <AnimatePresence>
                    {openAccordion === item.key && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <p className="pb-4 text-sm text-muted-foreground leading-relaxed">{item.content}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {product && <ProductReviews productId={product.id} />}

        {related.length > 0 && (
          <section className="mt-24 mb-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <span className="text-[10px] md:text-xs tracking-[0.3em] uppercase text-sale font-semibold">More to Love</span>
                <h2 className="font-serif text-2xl md:text-3xl font-semibold mt-2">You May Also Like</h2>
              </div>
              <Link to="/shop" className="group flex items-center gap-2 text-sm text-primary font-medium hover:underline underline-offset-4">
                View All <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {related.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          </section>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default ProductDetail;
