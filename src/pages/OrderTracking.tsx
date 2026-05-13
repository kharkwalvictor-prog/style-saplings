import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PageBanner from "@/components/PageBanner";
import { motion } from "framer-motion";
import { useSEO } from "@/hooks/useSEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Search, Package, MapPin, CreditCard, FileText,
  RotateCcw, CheckCircle, Clock, Truck, PackageCheck, Loader2,
} from "lucide-react";

const STATUS_FLOW = ["pending", "processing", "packed", "shipped", "delivered"];
const STATUS_LABELS: Record<string, string> = {
  pending: "Order Placed",
  processing: "Processing",
  packed: "Packed",
  shipped: "Shipped",
  delivered: "Delivered",
};
const STATUS_ICONS: Record<string, typeof Package> = {
  pending: Package,
  processing: Clock,
  packed: PackageCheck,
  shipped: Truck,
  delivered: CheckCircle,
};

interface OrderResult {
  id: string;
  order_number: string;
  customer_name: string;
  items: any[];
  total_amount: number;
  payment_method: string;
  payment_status: string;
  order_status: string;
  shipping_address: any;
  tracking_number: string | null;
  created_at: string;
}

interface StatusEntry {
  to_status: string;
  created_at: string;
}

const OrderTracking = () => {
  const { order_number: urlOrderNumber } = useParams();
  const [orderInput, setOrderInput] = useState(urlOrderNumber || "");
  const [phoneInput, setPhoneInput] = useState("");
  const [order, setOrder] = useState<OrderResult | null>(null);
  const [history, setHistory] = useState<StatusEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [invoiceLoading, setInvoiceLoading] = useState(false);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmedOrder = orderInput.trim().toUpperCase();
    const trimmedPhone = phoneInput.replace(/\D/g, "").slice(-10);

    if (!trimmedOrder || !trimmedPhone) {
      toast.error("Please enter both order number and phone number");
      return;
    }

    setLoading(true);
    setSearched(true);
    setOrder(null);

    try {
      const { data, error } = await supabase.functions.invoke("track-order", {
        body: { order_number: trimmedOrder, phone: trimmedPhone },
      });

      if (error) {
        console.error("Track order error:", error);
        setLoading(false);
        return;
      }

      if (!data?.found) {
        setLoading(false);
        return;
      }

      setOrder(data.order as OrderResult);
      setHistory(data.history || []);
    } catch {
      toast.error("Something went wrong. Please try again.");
    }

    setLoading(false);
  };

  const handleDownloadInvoice = async () => {
    if (!order) return;
    setInvoiceLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-invoice", {
        body: { order_id: order.id },
      });
      if (error || !data?.signedUrl) {
        toast.error("Unable to generate invoice. Please try again.");
      } else {
        window.open(data.signedUrl, "_blank");
      }
    } catch {
      toast.error("Failed to download invoice");
    }
    setInvoiceLoading(false);
  };

  const getStatusTimestamp = (status: string): string | null => {
    if (status === "pending" && order) return order.created_at;
    const entry = history.find((h) => h.to_status === status);
    return entry?.created_at || null;
  };

  const currentIdx = order ? STATUS_FLOW.indexOf(order.order_status) : -1;
  const isCancelled = order?.order_status === "cancelled";
  const isDelivered = order?.order_status === "delivered";

  const formatDateTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  useSEO({ title: "Track Your Order | Style Saplings", description: "Track your Style Saplings order status and delivery updates.", canonicalPath: "/track" });

  return (
    <div className="min-h-screen">
      <Header />

      <PageBanner label="Your Order" title="Track Your Order" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="container px-4 py-16 md:py-24 max-w-2xl mx-auto">
        {/* Search Form */}
        <form onSubmit={handleSearch} className="border rounded-2xl shadow-sm p-5 md:p-6 mb-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
                Order Number
              </label>
              <Input
                placeholder="e.g. SS-M1A2B3"
                value={orderInput}
                onChange={(e) => setOrderInput(e.target.value.toUpperCase())}
                className="h-11"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
                Phone Number
              </label>
              <Input
                placeholder="+91 XXXXXXXXXX"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                className="h-11"
                type="tel"
              />
            </div>
          </div>
          <Button type="submit" className="w-full h-11" disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Search className="h-4 w-4 mr-2" />
            )}
            Track Order
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            Enter the phone number used at checkout
          </p>
        </form>

        {/* No result */}
        {searched && !loading && !order && (
          <div className="text-center py-10 border rounded-2xl shadow-sm">
            <Package className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
            <p className="font-medium text-lg mb-1">No order found</p>
            <p className="text-sm text-muted-foreground mb-4">
              No order found with this combination. Please check your order number and phone number and try again.
            </p>
            <p className="text-sm text-muted-foreground">
              Need help? Contact us at{" "}
              <a href="mailto:support@stylesaplings.com" className="text-primary hover:underline">
                support@stylesaplings.com
              </a>{" "}
              or{" "}
              <a href="tel:+919810901031" className="text-primary hover:underline">
                +91-9810901031
              </a>
            </p>
          </div>
        )}

        {/* Order Details */}
        {order && (
          <div className="space-y-6">
            {/* Order Header */}
            <div className="border rounded-2xl shadow-sm p-5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h2 className="font-serif text-xl font-semibold">
                    Order {order.order_number}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Placed on {formatDateTime(order.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-3 py-1 rounded-full bg-muted font-medium capitalize">
                    {order.payment_method === "cod" ? "COD" : "Razorpay"}
                  </span>
                  <span className={`text-xs px-3 py-1 rounded-full font-medium capitalize ${
                    order.payment_status === "paid"
                      ? "bg-secondary/10 text-secondary"
                      : order.payment_status === "failed"
                        ? "bg-destructive/10 text-destructive"
                        : "bg-muted text-muted-foreground"
                  }`}>
                    {order.payment_status}
                  </span>
                  {isCancelled && (
                    <span className="text-xs px-3 py-1 rounded-full bg-destructive/10 text-destructive font-medium">
                      Cancelled
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Status Timeline */}
            {!isCancelled && (
              <div className="border rounded-2xl shadow-sm p-5">
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-5">
                  Order Status
                </h3>
                <div className="relative">
                  {STATUS_FLOW.map((status, idx) => {
                    const reached = idx <= currentIdx;
                    const isCurrent = idx === currentIdx;
                    const ts = getStatusTimestamp(status);
                    const Icon = STATUS_ICONS[status];

                    return (
                      <div key={status} className="flex gap-4 relative">
                        {idx < STATUS_FLOW.length - 1 && (
                          <div
                            className={`absolute left-[15px] top-[32px] w-0.5 h-[calc(100%-8px)] ${
                              idx < currentIdx ? "bg-primary" : "bg-border"
                            }`}
                          />
                        )}
                        <div
                          className={`relative z-10 flex items-center justify-center w-[30px] h-[30px] rounded-full shrink-0 ${
                            reached
                              ? isCurrent
                                ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                                : "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          <Icon className="h-3.5 w-3.5" />
                          {isCurrent && (
                            <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-20" />
                          )}
                        </div>
                        <div className={`pb-6 ${idx === STATUS_FLOW.length - 1 ? "pb-0" : ""}`}>
                          <p
                            className={`text-sm font-medium ${
                              reached ? "text-foreground" : "text-muted-foreground"
                            } ${isCurrent ? "text-primary" : ""}`}
                          >
                            {STATUS_LABELS[status]}
                          </p>
                          {ts ? (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {formatDateTime(ts)}
                            </p>
                          ) : (
                            <p className="text-xs text-muted-foreground/50 mt-0.5">Pending</p>
                          )}
                          {status === "shipped" && order.tracking_number && reached && (
                            <span className="inline-block text-xs mt-1 px-2 py-0.5 rounded-full bg-muted font-medium">
                              Tracking: {order.tracking_number}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Items */}
            <div className="border rounded-2xl shadow-sm p-5">
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                Items
              </h3>
              <div className="space-y-3">
                {(order.items || []).map((item: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 py-1">
                    {item.image && (
                      <img src={item.image} alt={item.name} className="w-10 h-10 rounded object-cover" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.size && `Size ${item.size} · `}Qty {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-serif font-semibold">
                      ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                    </p>
                  </div>
                ))}
                <div className="border-t pt-2 flex justify-between font-serif font-semibold">
                  <span>Total</span>
                  <span>₹{Number(order.total_amount).toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            {order.shipping_address && (
              <div className="border rounded-2xl shadow-sm p-5">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Delivery Address
                  </h3>
                </div>
                <p className="text-sm font-medium">{order.customer_name}</p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {[
                    order.shipping_address.address,
                    order.shipping_address.city,
                    order.shipping_address.state && order.shipping_address.pincode
                      ? `${order.shipping_address.state} - ${order.shipping_address.pincode}`
                      : order.shipping_address.state || order.shipping_address.pincode,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleDownloadInvoice}
                disabled={invoiceLoading}
              >
                {invoiceLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <FileText className="h-4 w-4 mr-2" />
                )}
                Download Invoice
              </Button>
              {isDelivered && (
                <Button variant="outline" className="flex-1" asChild>
                  <Link to="/returns">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Request Return/Exchange
                  </Link>
                </Button>
              )}
            </div>
          </div>
        )}
      </motion.div>

      <Footer />
    </div>
  );
};

export default OrderTracking;
