import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PageBanner from "@/components/PageBanner";
import { motion } from "framer-motion";
import { useSEO } from "@/hooks/useSEO";

const RefundPolicy = () => {
  useSEO({ title: "Returns & Refund Policy | Style Saplings", description: "Our 7-day return and refund policy for Style Saplings products.", canonicalPath: "/refund-policy" });
  return (
  <div className="min-h-screen">
    <Header />
    <PageBanner label="Our Policies" title="Refund Policy" />
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="container px-4 md:px-8 py-16 md:py-24 max-w-3xl mx-auto prose prose-sm">
      <h2 className="font-serif">1. Our Policy</h2>
      <p>We offer a <strong>7-day return window</strong> from the date of delivery. Items must be unworn, unwashed, with all original tags intact. Original packaging is preferred but not mandatory.</p>

      <h2 className="font-serif">2. How to Request a Return</h2>
      <ol>
        <li>Visit <a href="/returns" className="text-primary hover:underline">stylesaplings.com/returns</a></li>
        <li>Enter your order number and registered phone number</li>
        <li>Select a reason and upload a photo if the item is damaged</li>
        <li>We will respond within <strong>24–48 hours</strong></li>
      </ol>

      <h2 className="font-serif">3. Refund Timeline</h2>
      <ul>
        <li>Approved refunds are processed within <strong>5–7 business days</strong></li>
        <li>Refund is credited back to the original payment method</li>
        <li>COD refunds: processed via bank transfer (you'll need to provide account details)</li>
      </ul>

      <h2 className="font-serif">4. Exchange Policy</h2>
      <ul>
        <li>Size exchanges accepted within 7 days of delivery</li>
        <li>Subject to stock availability</li>
        <li>No additional charges for the first exchange</li>
      </ul>

      <h2 className="font-serif">5. Non-Returnable Items</h2>
      <ul>
        <li>Sale / discounted items (final sale)</li>
        <li>Items without original tags</li>
        <li>Worn or washed items</li>
        <li>Items damaged by the customer</li>
      </ul>

      <h2 className="font-serif">6. Damaged / Wrong Items</h2>
      <p>If you receive a damaged or incorrect item, please share a photo within <strong>24 hours of delivery</strong>. We will provide a full refund or replacement, and we cover return shipping costs.</p>

      <div className="border-t pt-6 mt-8">
        <p className="text-sm text-muted-foreground">For any queries, email us at <a href="mailto:support@stylesaplings.com" className="text-primary">support@stylesaplings.com</a> or call <a href="tel:+919810901031" className="text-primary">+91-9810901031</a>.</p>
      </div>
    </motion.div>
    <Footer />
  </div>
  );
};

export default RefundPolicy;
