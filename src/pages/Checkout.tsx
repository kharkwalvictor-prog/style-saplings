import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PageBanner from "@/components/PageBanner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useCart } from "@/context/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CheckCircle, Tag, X, Loader2 } from "lucide-react";
import {
  calculateGST, calculateCartGST, validateGSTIN,
  INDIAN_STATES, round2,
} from "@/utils/gstUtils";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from "@/components/ui/collapsible";

const generateOrderNumber = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return `SS-${code}`;
};

const loadRazorpayScript = (): Promise<boolean> =>
  new Promise((resolve) => {
    if (document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const inputClass = "w-full border rounded-2xl px-4 py-3 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring";

interface DiscountState {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  amount: number; // calculated discount amount
}

const Checkout = () => {
  const { items, totalAmount, clearCart } = useCart();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "", phone: "", email: "",
    address: "", city: "", state: "", pincode: "",
    paymentMethod: "razorpay" as "razorpay" | "cod",
  });

  const [b2b, setB2B] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [gstin, setGstin] = useState("");

  // Discount code state
  const [promoInput, setPromoInput] = useState("");
  const [promoOpen, setPromoOpen] = useState(false);
  const [promoLoading, setPromoLoading] = useState(false);
  const [discount, setDiscount] = useState<DiscountState | null>(null);

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));
  const gstinValid = gstin.length > 0 && validateGSTIN(gstin);

  // Shipping calculation (discount type 'shipping' sets shipping to 0)
  const baseShipping = totalAmount >= 999 ? 0 : 99;
  const freeShipping = totalAmount >= 999 || discount?.discount_type === "shipping";
  const shipping = freeShipping ? 0 : baseShipping;

  // Calculate discount amount
  const discountAmount = useMemo(() => {
    if (!discount) return 0;
    if (discount.discount_type === "percentage") {
      return round2(totalAmount * discount.discount_value / 100);
    }
    if (discount.discount_type === "fixed") {
      return Math.min(discount.discount_value, totalAmount);
    }
    if (discount.discount_type === "shipping") {
      return baseShipping; // discount = shipping cost saved
    }
    return 0;
  }, [discount, totalAmount, baseShipping]);

  const grandTotal = totalAmount + shipping - (discount?.discount_type !== "shipping" ? discountAmount : 0);

  // GST calculation
  const gstSummary = useMemo(() => {
    const customerState = form.state || "Delhi";
    return calculateCartGST(
      items.map(i => ({
        price: (i.product.sale_price || i.product.price) * i.quantity,
        quantity: 1,
        hsnCode: (i.product as any).hsn_code || "62099090",
      })),
      customerState,
      shipping
    );
  }, [items, form.state, shipping]);

  const applyPromoCode = async () => {
    const code = promoInput.trim().toUpperCase();
    if (!code) return;
    setPromoLoading(true);

    const { data, error } = await supabase
      .from("discount_codes")
      .select("*")
      .ilike("code", code)
      .single();

    if (error || !data) {
      toast.error("Code not found");
      setPromoLoading(false);
      return;
    }

    // Validate
    if (!data.is_active) {
      toast.error("This code is no longer active");
      setPromoLoading(false);
      return;
    }

    const now = new Date();
    if (data.valid_from && new Date(data.valid_from) > now) {
      toast.error("This code is not yet valid");
      setPromoLoading(false);
      return;
    }
    if (data.valid_until && new Date(data.valid_until) < now) {
      toast.error("Code has expired");
      setPromoLoading(false);
      return;
    }
    if (data.usage_limit !== null && (data.usage_count || 0) >= data.usage_limit) {
      toast.error("Code usage limit reached");
      setPromoLoading(false);
      return;
    }
    if (data.minimum_order_amount && totalAmount < Number(data.minimum_order_amount)) {
      toast.error(`Code not valid for orders below ₹${Number(data.minimum_order_amount).toLocaleString("en-IN")}`);
      setPromoLoading(false);
      return;
    }

    // Calculate amount
    let amt = 0;
    if (data.discount_type === "percentage") {
      amt = round2(totalAmount * Number(data.discount_value) / 100);
    } else if (data.discount_type === "fixed") {
      amt = Math.min(Number(data.discount_value), totalAmount);
    } else if (data.discount_type === "shipping") {
      amt = baseShipping;
    }

    setDiscount({
      id: data.id,
      code: data.code,
      discount_type: data.discount_type,
      discount_value: Number(data.discount_value),
      amount: amt,
    });

    toast.success(`Code applied! You save ₹${amt.toLocaleString("en-IN")}`);
    setPromoLoading(false);
  };

  const removeDiscount = () => {
    setDiscount(null);
    setPromoInput("");
  };

  const validateForm = () => {
    if (!form.name || !form.phone || !form.email || !form.address || !form.state || !form.pincode) {
      toast.error("Please fill all required fields");
      return false;
    }
    if (b2b && (!companyName.trim() || !gstinValid)) {
      toast.error("Please enter valid company name and GSTIN");
      return false;
    }
    return true;
  };

  const buildGSTBreakdowns = () => {
    return items.map(i => {
      const price = (i.product.sale_price || i.product.price) * i.quantity;
      const gst = calculateGST(price, form.state || "Delhi", (i.product as any).hsn_code || "62099090");
      return {
        product_id: i.product.id,
        name: i.product.name,
        size: i.size,
        quantity: i.quantity,
        ...gst,
      };
    });
  };

  const buildOrderPayload = (orderNumber: string) => ({
    order_number: orderNumber,
    customer_name: form.name,
    customer_phone: form.phone,
    customer_email: form.email.trim().toLowerCase(),
    shipping_address: { address: form.address, city: form.city, state: form.state, pincode: form.pincode },
    items: items.map(i => ({
      product_id: i.product.id,
      name: i.product.name,
      size: i.size,
      quantity: i.quantity,
      price: i.product.sale_price || i.product.price,
      image: i.product.images?.[0] || "",
      hsn_code: (i.product as any).hsn_code || "62099090",
    })),
    total_amount: grandTotal,
    payment_method: form.paymentMethod,
    payment_status: "pending" as const,
    order_status: "pending" as const,
    supply_type: gstSummary.supplyType,
    gst_breakdowns: buildGSTBreakdowns(),
    ...(discount ? { discount_code: discount.code, discount_amount: discountAmount } : {}),
    ...(b2b ? { customer_gstin: gstin.toUpperCase().trim(), customer_company_name: companyName.trim() } : {}),
  });

  const incrementUsageCount = async () => {
    if (!discount) return;
    await supabase
      .from("discount_codes")
      .update({ usage_count: (discount as any).usage_count ? (discount as any).usage_count + 1 : 1 })
      .eq("id", discount.id);
    // Better: use raw increment. Since we can't do atomic increment via JS client easily,
    // we do a simple update. Race conditions are unlikely at this scale.
  };

  const checkRateLimit = async (phone: string): Promise<boolean> => {
    const cleanPhone = phone.replace(/\D/g, "").slice(-10);
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count, error } = await supabase
      .from("order_rate_limits")
      .select("*", { count: "exact", head: true })
      .eq("phone", cleanPhone)
      .gte("created_at", oneHourAgo);
    if (error) return true;
    if ((count || 0) >= 3) return false;
    await supabase.from("order_rate_limits").insert({ phone: cleanPhone });
    return true;
  };

  const handleCOD = async () => {
    const allowed = await checkRateLimit(form.phone);
    if (!allowed) {
      toast.error("Too many orders from this number. Please try again later or call us at +91-9810901031");
      setSubmitting(false);
      return;
    }
    const orderNumber = generateOrderNumber();
    const payload = buildOrderPayload(orderNumber);
    const { data: insertedOrder, error } = await supabase.from("orders").insert(payload).select("id").single();
    if (error) throw error;
    await incrementUsageCount();
    supabase.functions.invoke("send-order-confirmation", { body: { order_id: insertedOrder.id } }).catch(console.error);
    clearCart();
    navigate(`/order-confirmation?order=${orderNumber}`);
  };

  const handleRazorpay = async () => {
    const orderNumber = generateOrderNumber();
    const payload = buildOrderPayload(orderNumber);
    const { data: insertedOrder, error: insertError } = await supabase.from("orders").insert(payload).select("id").single();
    if (insertError) throw insertError;

    const { data: rpData, error: rpError } = await supabase.functions.invoke("create-razorpay-order", {
      body: { amount: Math.round(grandTotal * 100), currency: "INR", receipt: orderNumber },
    });

    if (rpError || !rpData?.razorpay_order_id) {
      await supabase.from("orders").update({ payment_status: "failed" }).eq("order_number", orderNumber);
      throw new Error(rpError?.message || "Failed to create payment order");
    }

    await supabase.from("orders").update({ razorpay_order_id: rpData.razorpay_order_id }).eq("order_number", orderNumber);

    const loaded = await loadRazorpayScript();
    if (!loaded) throw new Error("Failed to load payment gateway");

    const razorpayKeyId = import.meta.env.VITE_RAZORPAY_KEY_ID;
    const options = {
      key: razorpayKeyId,
      amount: Math.round(grandTotal * 100),
      currency: "INR",
      name: "Style Saplings",
      description: `Order ${orderNumber}`,
      order_id: rpData.razorpay_order_id,
      prefill: { name: form.name, email: form.email, contact: form.phone },
      theme: { color: "#4A6741" },
      handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
        try {
          const { data: verifyData, error: verifyError } = await supabase.functions.invoke("verify-razorpay-payment", {
            body: {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            },
          });
          if (verifyError || !verifyData?.verified) {
            await supabase.from("orders").update({ payment_status: "failed" }).eq("order_number", orderNumber);
            toast.error("Payment verification failed. Please contact support.");
            setSubmitting(false);
            return;
          }
          await supabase.from("orders").update({
            payment_status: "paid",
            razorpay_order_id: response.razorpay_order_id,
          }).eq("order_number", orderNumber);
          await incrementUsageCount();
          supabase.functions.invoke("send-order-confirmation", { body: { order_id: insertedOrder.id } }).catch(console.error);
          clearCart();
          navigate(`/order-confirmation?order=${orderNumber}`);
        } catch {
          toast.error("Payment verification failed. Please contact support.");
          setSubmitting(false);
        }
      },
      modal: {
        ondismiss: async () => {
          await supabase.from("orders").update({ payment_status: "failed" }).eq("order_number", orderNumber);
          toast.error("Payment was cancelled. You can try again.");
          setSubmitting(false);
        },
      },
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.on("payment.failed", async () => {
      await supabase.from("orders").update({ payment_status: "failed" }).eq("order_number", orderNumber);
      toast.error("Payment failed. Please try again.");
      setSubmitting(false);
    });
    rzp.open();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      if (form.paymentMethod === "cod") {
        await handleCOD();
      } else {
        await handleRazorpay();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to place order. Please try again.");
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    navigate("/cart");
    return null;
  }

  const fmt = (n: number) => `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="min-h-screen">
      <Header />
      <PageBanner label="Checkout" title="Complete Your Order" />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="container px-4 md:px-8 py-16 md:py-24">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-6">
            {/* Contact */}
            <div className="space-y-4">
              <h2 className="font-serif text-xl font-semibold">Contact Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" placeholder="Full Name *" value={form.name} onChange={e => update("name", e.target.value)} className={inputClass} required />
                <input type="tel" placeholder="Phone Number *" value={form.phone} onChange={e => update("phone", e.target.value)} className={inputClass} required />
              </div>
              <input type="email" placeholder="Email Address *" value={form.email} onChange={e => update("email", e.target.value)} className={inputClass} required />
            </div>

            {/* Shipping */}
            <div className="space-y-4">
              <h2 className="font-serif text-xl font-semibold">Shipping Address</h2>
              <textarea placeholder="Full Address *" value={form.address} onChange={e => update("address", e.target.value)}
                className={`${inputClass} resize-none h-20`} required />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input type="text" placeholder="City" value={form.city} onChange={e => update("city", e.target.value)} className={inputClass} />
                <Select value={form.state} onValueChange={v => update("state", v)}>
                  <SelectTrigger className="h-[46px]">
                    <SelectValue placeholder="Select State *" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDIAN_STATES.map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <input type="text" placeholder="Pincode *" value={form.pincode} onChange={e => update("pincode", e.target.value)} className={inputClass} required />
              </div>
            </div>

            {/* B2B GSTIN */}
            <div className="border rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Are you purchasing for a business?</span>
                <Switch checked={b2b} onCheckedChange={setB2B} />
              </div>
              {b2b && (
                <div className="space-y-3 pt-2">
                  <input type="text" placeholder="Company Name *" value={companyName}
                    onChange={e => setCompanyName(e.target.value)} className={inputClass} required />
                  <div className="relative">
                    <input type="text" placeholder="GSTIN *" value={gstin}
                      onChange={e => setGstin(e.target.value.toUpperCase())}
                      className={inputClass} maxLength={15} required />
                    {gstinValid && (
                      <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-600" />
                    )}
                  </div>
                  {gstin.length > 0 && !gstinValid && (
                    <p className="text-xs text-destructive">Invalid GSTIN format. Expected: 15 alphanumeric characters</p>
                  )}
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div className="space-y-4">
              <h2 className="font-serif text-xl font-semibold">Payment Method</h2>
              <div className="space-y-2">
                <label className="flex items-center gap-3 border rounded-2xl p-4 cursor-pointer hover:border-primary transition-colors">
                  <input type="radio" name="payment" value="razorpay" checked={form.paymentMethod === "razorpay"} onChange={() => update("paymentMethod", "razorpay")} className="accent-primary" />
                  <div><p className="text-sm font-medium">Razorpay (UPI / Card / Netbanking)</p><p className="text-xs text-muted-foreground">Pay securely online</p></div>
                </label>
                <label className="flex items-center gap-3 border rounded-2xl p-4 cursor-pointer hover:border-primary transition-colors">
                  <input type="radio" name="payment" value="cod" checked={form.paymentMethod === "cod"} onChange={() => update("paymentMethod", "cod")} className="accent-primary" />
                  <div><p className="text-sm font-medium">Cash on Delivery</p><p className="text-xs text-muted-foreground">Pay when you receive your order</p></div>
                </label>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="border rounded-2xl p-6 sticky top-24 shadow-sm">
              <h2 className="font-serif text-xl font-semibold mb-4">Order Summary</h2>
              <div className="space-y-3 mb-4">
                {items.map(item => (
                  <div key={`${item.product.id}-${item.size}`} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{item.product.name} ({item.size}) ×{item.quantity}</span>
                    <span>₹{((item.product.sale_price || item.product.price) * item.quantity).toLocaleString("en-IN")}</span>
                  </div>
                ))}
              </div>

              {/* Promo Code */}
              <div className="border-t pt-3 mb-3">
                {discount ? (
                  <div className="flex items-center justify-between bg-secondary/20 rounded-md px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-secondary" />
                      <span className="text-sm font-medium text-secondary-foreground">
                        {discount.code}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        -₹{discountAmount.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <button type="button" onClick={removeDiscount} className="text-muted-foreground hover:text-foreground">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <Collapsible open={promoOpen} onOpenChange={setPromoOpen}>
                    <CollapsibleTrigger className="flex items-center gap-2 text-sm text-primary hover:underline cursor-pointer">
                      <Tag className="h-3.5 w-3.5" />
                      Have a promo code?
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Enter code"
                          value={promoInput}
                          onChange={e => setPromoInput(e.target.value.toUpperCase())}
                          onKeyDown={e => e.key === "Enter" && (e.preventDefault(), applyPromoCode())}
                          className="flex-1 border rounded-sm px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring uppercase"
                        />
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={applyPromoCode}
                          disabled={promoLoading || !promoInput.trim()}
                          className="h-9"
                        >
                          {promoLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Apply"}
                        </Button>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                )}
              </div>

              {/* GST Breakdown */}
              <div className="border-t pt-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal (excl. GST)</span>
                  <span>{fmt(gstSummary.subtotalExclGST)}</span>
                </div>

                {gstSummary.gstByRate.map(g => (
                  <div key={g.rate} className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>GST @ {g.rate}% (HSN {g.hsn})</span>
                      <span>{fmt(g.cgst + g.sgst + g.igst)}</span>
                    </div>
                    {gstSummary.supplyType === "intra" ? (
                      <>
                        <div className="flex justify-between text-xs pl-3 text-muted-foreground">
                          <span>CGST @ {g.rate / 2}%</span>
                          <span>{fmt(g.cgst)}</span>
                        </div>
                        <div className="flex justify-between text-xs pl-3 text-muted-foreground">
                          <span>SGST @ {g.rate / 2}%</span>
                          <span>{fmt(g.sgst)}</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex justify-between text-xs pl-3 text-muted-foreground">
                        <span>IGST @ {g.rate}%</span>
                        <span>{fmt(g.igst)}</span>
                      </div>
                    )}
                  </div>
                ))}

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{freeShipping ? "Free" : `₹${baseShipping}`}</span>
                </div>

                {discount && discountAmount > 0 && (
                  <div className="flex justify-between text-secondary">
                    <span>Discount ({discount.code})</span>
                    <span>-₹{discountAmount.toLocaleString("en-IN")}</span>
                  </div>
                )}
              </div>

              <div className="border-t my-4 pt-4 flex justify-between font-serif text-lg font-semibold">
                <span>Total (incl. GST)</span>
                <span>₹{grandTotal.toLocaleString("en-IN")}</span>
              </div>
              <p className="text-[12px] text-muted-foreground text-center mb-4">
                Prices are inclusive of all applicable taxes
              </p>

              <Button type="submit" variant="hero" className="w-full" disabled={submitting}>
                {submitting ? "Processing..." : form.paymentMethod === "razorpay" ? "Pay Now" : "Place Order (COD)"}
              </Button>
            </div>
          </div>
        </form>
      </motion.div>
      <Footer />
    </div>
  );
};

export default Checkout;
