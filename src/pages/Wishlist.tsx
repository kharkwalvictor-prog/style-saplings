import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PageBanner from "@/components/PageBanner";
import { motion } from "framer-motion";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWishlist } from "@/context/WishlistContext";
import { useProducts } from "@/hooks/useProducts";
import { useCart } from "@/context/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { Heart, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useSEO } from "@/hooks/useSEO";

const Wishlist = () => {
  useSEO({ title: "Wishlist | Style Saplings", description: "Your saved items", canonicalPath: "/wishlist" });

  const { wishlistedIds } = useWishlist();
  const { data: allProducts = [], isLoading } = useProducts();

  const wishlistedProducts = allProducts.filter((p) => wishlistedIds.has(p.id));

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <PageBanner label="Your Collection" title="Wishlist" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
      <main className="flex-1 container px-4 md:px-8 py-16 md:py-24">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : wishlistedProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Heart className="h-16 w-16 text-sale/40 mb-6" />
            <h2 className="font-serif text-2xl font-semibold mb-2">Your wishlist is empty</h2>
            <p className="text-muted-foreground mb-6">Save items you love while you browse</p>
            <Button variant="hero" asChild>
              <Link to="/shop">Explore Collection →</Link>
            </Button>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-6">{wishlistedProducts.length} item{wishlistedProducts.length !== 1 ? "s" : ""} saved</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {wishlistedProducts.map((p, i) => (
                <WishlistCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </>
        )}
      </main>
      </motion.div>

      <Footer />
    </div>
  );
};

/* Individual wishlist card with Add to Cart / Notify Me */
function WishlistCard({ product, index }: { product: any; index: number }) {
  const { addItem } = useCart();
  const [notifyEmail, setNotifyEmail] = useState("");
  const [showNotify, setShowNotify] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const outOfStock = product.stock_count === 0 || product.stock_status === "out_of_stock";

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const defaultSize = product.sizes?.[0] || "3Y";
    addItem(product, defaultSize);
    toast.success(`${product.name} added to cart`);
  };

  const handleNotify = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!notifyEmail || !notifyEmail.includes("@")) {
      toast.error("Please enter a valid email");
      return;
    }
    setSubmitting(true);
    await supabase.from("back_in_stock_requests").insert({ product_id: product.id, customer_email: notifyEmail });
    toast.success("We'll notify you when it's back!");
    setShowNotify(false);
    setNotifyEmail("");
    setSubmitting(false);
  };

  return (
    <div className="flex flex-col">
      <ProductCard product={product} index={index} />
      <div className="mt-2" onClick={(e) => e.stopPropagation()}>
        {outOfStock ? (
          showNotify ? (
            <div className="flex gap-1.5" onClick={(e) => e.preventDefault()}>
              <Input
                placeholder="your@email.com"
                value={notifyEmail}
                onChange={(e) => setNotifyEmail(e.target.value)}
                className="text-xs h-9"
                onClick={(e) => e.stopPropagation()}
              />
              <Button size="sm" variant="hero" onClick={handleNotify} disabled={submitting} className="text-xs whitespace-nowrap">
                {submitting ? <Loader2 className="h-3 w-3 animate-spin" /> : "Notify"}
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="w-full text-xs"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowNotify(true); }}
            >
              Out of Stock · Notify Me
            </Button>
          )
        ) : (
          <Button size="sm" variant="hero" className="w-full text-xs" onClick={handleAddToCart}>
            Add to Cart
          </Button>
        )}
      </div>
    </div>
  );
}

export default Wishlist;
