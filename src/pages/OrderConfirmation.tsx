import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Package, MapPin, CreditCard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface OrderData {
  order_number: string;
  customer_name: string;
  items: Array<{ name: string; size: string; quantity: number; price: number; image?: string }>;
  total_amount: number;
  payment_method: string;
  payment_status: string;
  shipping_address: { address: string; city: string; state: string; pincode: string };
}

const OrderConfirmation = () => {
  const [searchParams] = useSearchParams();
  const orderParam = searchParams.get("order") || searchParams.get("orderId");
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderParam) { setLoading(false); return; }
    supabase
      .from("orders")
      .select("*")
      .eq("order_number", orderParam)
      .single()
      .then(({ data }) => {
        if (data) {
          setOrder({
            order_number: data.order_number,
            customer_name: data.customer_name,
            items: data.items as OrderData["items"],
            total_amount: data.total_amount,
            payment_method: data.payment_method,
            payment_status: data.payment_status,
            shipping_address: data.shipping_address as OrderData["shipping_address"],
          });
        }
        setLoading(false);
      });
  }, [orderParam]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container px-4 py-20 text-center">
          <p className="text-muted-foreground">Loading order details...</p>
        </div>
        <Footer />
      </div>
    );
  }

  const orderId = order?.order_number || orderParam || "SS-XXXXXX";
  const isCOD = order?.payment_method === "cod";

  return (
    <div className="min-h-screen">
      <Header />

      {/* Brand hero moment — warm, editorial */}
      <section className="relative bg-[#1E3320] py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0id2hpdGUiLz48L3N2Zz4=')] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(192,106,79,0.1)_0%,transparent_70%)]" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative z-10 text-center px-6"
        >
          <div className="w-10 h-10 rounded-full border border-[#C06A4F]/50 flex items-center justify-center mx-auto mb-5">
            <div className="w-3 h-3 rounded-full bg-[#C06A4F]" />
          </div>
          <span className="text-[10px] tracking-[0.4em] uppercase font-medium text-[#E8C9A0]/70 mb-4 block">Order Confirmed</span>
          <h1 className="font-serif text-[2rem] md:text-[3rem] font-medium text-white leading-[1.1]">
            Thank you{order?.customer_name ? `, ${order.customer_name}` : ""}
          </h1>
          <div className="w-10 h-px bg-[#C06A4F] mx-auto mt-5 mb-4" />
          <p className="text-white/60 text-[14px] max-w-xs mx-auto leading-relaxed">
            Your handcrafted piece is on its way. A little art, a little heritage — now yours.
          </p>
          <p className="text-[#E8C9A0]/80 text-[13px] mt-3 font-medium tracking-wide">
            Order ID: {orderId}
          </p>
        </motion.div>
      </section>

      <div className="container px-4 py-14 md:py-20 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}>
          {order && (
            <div className="space-y-6">
              {/* Items */}
              <div className="border rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <h2 className="font-serif text-lg font-medium">Items Ordered</h2>
                </div>
                <div className="space-y-3">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      {item.image && (
                        <img src={item.image} alt={item.name} className="w-14 h-14 object-cover rounded-sm" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">Size: {item.size} · Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-medium">₹{(item.price * item.quantity).toLocaleString("en-IN")}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment & Shipping */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <h3 className="font-serif font-medium">Payment</h3>
                  </div>
                  <p className="text-sm">
                    {isCOD ? "Cash on Delivery" : "Paid via Razorpay"}
                  </p>
                  <p className="text-lg font-serif font-medium mt-1">
                    ₹{order.total_amount.toLocaleString("en-IN")}
                  </p>
                  {isCOD && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Pay ₹{order.total_amount.toLocaleString("en-IN")} on delivery
                    </p>
                  )}
                </div>

                <div className="border rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <h3 className="font-serif font-medium">Shipping</h3>
                  </div>
                  <p className="text-sm leading-relaxed">
                    {order.shipping_address.address}
                    {order.shipping_address.city && `, ${order.shipping_address.city}`}
                    {order.shipping_address.state && `, ${order.shipping_address.state}`}
                    {order.shipping_address.pincode && ` - ${order.shipping_address.pincode}`}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">Estimated delivery: 5–7 business days</p>
                </div>
              </div>
            </div>
          )}

          {!order && (
            <p className="text-sm text-muted-foreground text-center mb-8 leading-relaxed">
              We'll send you a confirmation email with your order details and tracking information once your order ships.
            </p>
          )}

          <div className="text-center mt-10 space-y-3">
            <Button variant="hero" asChild>
              <Link to="/shop">Continue Shopping</Link>
            </Button>
            {order && (
              <div>
                <Button variant="outline" asChild>
                  <Link to={`/track/${order.order_number}`}>Track Your Order</Link>
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default OrderConfirmation;
