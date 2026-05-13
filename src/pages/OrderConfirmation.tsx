import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PageBanner from "@/components/PageBanner";
import { Button } from "@/components/ui/button";
import { CheckCircle, Package, MapPin, CreditCard } from "lucide-react";
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
      <PageBanner label="Thank You" title="Order Confirmed" />
      <div className="container px-4 py-16 md:py-24 max-w-2xl mx-auto">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", damping: 15, stiffness: 100 }}>
          <div className="text-center mb-10">
            <CheckCircle className="h-16 w-16 text-secondary mx-auto mb-6" strokeWidth={1.5} />
            <h1 className="font-serif text-3xl md:text-4xl font-semibold mb-3">
              Thank you{order?.customer_name ? `, ${order.customer_name}` : ""}! 🎉
            </h1>
            <p className="text-muted-foreground mb-1">Your order has been placed successfully.</p>
            <p className="text-sm font-medium">Order ID: <span className="text-primary">{orderId}</span></p>
          </div>

          {order && (
            <div className="space-y-6">
              {/* Items */}
              <div className="border rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <h2 className="font-serif text-lg font-semibold">Items Ordered</h2>
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
                    <h3 className="font-serif font-semibold">Payment</h3>
                  </div>
                  <p className="text-sm">
                    {isCOD ? "Cash on Delivery" : "Paid via Razorpay"}
                  </p>
                  <p className="text-lg font-serif font-semibold mt-1">
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
                    <h3 className="font-serif font-semibold">Shipping</h3>
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
