import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PageBanner from "@/components/PageBanner";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { Minus, Plus, X } from "lucide-react";
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

const Cart = () => {
  const { items, updateQuantity, removeItem, totalAmount } = useCart();
  const freeShipping = totalAmount >= 999;

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <PageBanner label="Shopping" title="Your Cart" />
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20 bg-background">
          <p className="font-serif italic text-muted-foreground text-[15px] mb-2">Your cart is empty.</p>
          <h2 className="font-serif text-[1.8rem] md:text-[2.2rem] font-medium text-foreground mb-4 leading-snug">
            Begin your collection.
          </h2>
          <p className="text-muted-foreground text-[14px] leading-relaxed mb-8 max-w-xs">
            Each piece is handcrafted by artisans across India — Chikankari, Bandhani, Firan and more.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 bg-[#1E3320] text-white rounded-full px-8 py-3.5 text-[13px] font-medium tracking-wide hover:bg-[#2a4a2e] transition-colors min-h-[44px]"
          >
            Explore the Collection
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <PageBanner label="Shopping" title="Your Cart" />
      <div className="container px-5 md:px-8 py-12 md:py-24">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-4">
            {items.map(item => (
              <motion.div
                key={`${item.product.id}-${item.size}`}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex gap-4 p-4 border rounded-2xl"
              >
                <div className="w-20 h-24 md:w-24 md:h-32 bg-muted rounded-2xl overflow-hidden flex-shrink-0">
                  <img
                    src={item.product.images?.[0] && !item.product.images[0].includes("placeholder") ? item.product.images[0] : fallbackImages[item.product.craft_type] || product1}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-serif text-lg font-medium">{item.product.name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">Size: {item.size} · {item.product.craft_type}</p>
                    </div>
                    <button onClick={() => removeItem(item.product.id, item.size)} className="text-muted-foreground hover:text-foreground">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center border rounded-2xl">
                      <button onClick={() => updateQuantity(item.product.id, item.size, item.quantity - 1)} className="px-3 py-2 min-w-[44px] min-h-[44px] flex items-center justify-center">
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="px-3 text-sm font-medium">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product.id, item.size, item.quantity + 1)} className="px-3 py-2 min-w-[44px] min-h-[44px] flex items-center justify-center">
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <span className="font-serif text-lg font-medium">
                      ₹{((item.product.sale_price || item.product.price) * item.quantity).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="border rounded-2xl p-6 sticky top-24 shadow-sm">
              <h2 className="font-serif text-xl font-medium mb-4">Order Summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₹{totalAmount.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className={freeShipping ? "text-secondary" : ""}>{freeShipping ? "Free" : "₹99"}</span>
                </div>
              </div>
              <div className="border-t my-4 pt-4 flex justify-between font-serif text-lg font-medium">
                <span>Total</span>
                <span>₹{(totalAmount + (freeShipping ? 0 : 99)).toLocaleString("en-IN")}</span>
              </div>
              {!freeShipping && (
                <p className="text-xs text-muted-foreground mb-4">
                  Add ₹{(999 - totalAmount).toLocaleString("en-IN")} more for free shipping
                </p>
              )}
              <Button variant="hero" className="w-full py-4 min-h-[44px] text-[16px]" asChild>
                <Link to="/checkout">Proceed to Checkout</Link>
              </Button>

              {/* Trust strip */}
              <div className="mt-5 pt-5 border-t border-border/50 space-y-2.5">
                {[
                  "Artisan-made, naturally sourced fabrics",
                  "Easy exchange within 7 days",
                  "Pan-India delivery · Tracked shipping",
                ].map((point) => (
                  <div key={point} className="flex items-start gap-2.5">
                    <div className="w-1 h-1 rounded-full bg-[#C06A4F] mt-[7px] flex-shrink-0" />
                    <p className="text-[12px] text-muted-foreground leading-snug">{point}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Cart;
