import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PageBanner from "@/components/PageBanner";
import { motion } from "framer-motion";
import { useSEO } from "@/hooks/useSEO";

const ShippingPolicy = () => {
  useSEO({ title: "Shipping Policy | Style Saplings", description: "Shipping information, delivery timelines, and charges for Style Saplings orders across India.", canonicalPath: "/shipping-policy" });
  return (
  <div className="min-h-screen">
    <Header />
    <PageBanner label="Our Policies" title="Shipping Policy" />
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="container px-4 md:px-8 py-16 md:py-24 max-w-3xl mx-auto prose prose-sm">
      <h2 className="font-serif">1. Processing Time</h2>
      <ul>
        <li>Orders are processed within <strong>1–2 business days</strong></li>
        <li>Orders placed before 2 PM (Mon–Fri) are dispatched the same day</li>
      </ul>

      <h2 className="font-serif">2. Delivery Timeline</h2>
      <ul>
        <li><strong>Pan India:</strong> 5–7 business days</li>
        <li><strong>Delhi NCR:</strong> 2–3 business days</li>
        <li><strong>Remote areas:</strong> 7–10 business days</li>
      </ul>

      <h2 className="font-serif">3. Shipping Charges</h2>
      <ul>
        <li><strong>Free shipping</strong> on orders above ₹999</li>
        <li>₹99 flat fee for orders below ₹999</li>
      </ul>

      <h2 className="font-serif">4. Order Tracking</h2>
      <p>A tracking number will be sent via email and WhatsApp once your order is shipped. You can track your shipment using the courier partner's website.</p>

      <h2 className="font-serif">5. International Shipping</h2>
      <p>We currently <strong>do not ship internationally</strong>. We deliver across India only.</p>

      <h2 className="font-serif">6. Undelivered Orders</h2>
      <ul>
        <li>3 delivery attempts are made by the courier partner</li>
        <li>If undelivered, the order is returned to us</li>
        <li>We will contact you to reattempt delivery</li>
        <li>For COD undelivered orders, re-shipping charges may apply</li>
      </ul>

      <div className="border-t pt-6 mt-8">
        <p className="text-sm text-muted-foreground">For shipping queries, email <a href="mailto:support@stylesaplings.com" className="text-primary">support@stylesaplings.com</a> or call <a href="tel:+919810901031" className="text-primary">+91-9810901031</a>.</p>
      </div>
    </motion.div>
    <Footer />
  </div>
  );
};

export default ShippingPolicy;
