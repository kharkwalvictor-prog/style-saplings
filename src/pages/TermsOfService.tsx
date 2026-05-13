import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PageBanner from "@/components/PageBanner";
import { motion } from "framer-motion";
import { useSEO } from "@/hooks/useSEO";

const TermsOfService = () => {
  useSEO({ title: "Terms of Service | Style Saplings", description: "Terms and conditions for using the Style Saplings website and purchasing products.", canonicalPath: "/terms-of-service" });
  return (
  <div className="min-h-screen">
    <Header />
    <PageBanner label="Our Policies" title="Terms of Service" />
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="container px-4 md:px-8 py-16 md:py-24 max-w-3xl mx-auto prose prose-sm">
      <h2 className="font-serif">1. Acceptance of Terms</h2>
      <p>By accessing and using <strong>stylesaplings.com</strong> ("the Website"), you agree to be bound by these Terms of Service. If you do not agree, please do not use our Website.</p>

      <h2 className="font-serif">2. Products</h2>
      <p>We make every effort to display product colours, descriptions, and sizing as accurately as possible. However, we cannot guarantee that your device's display accurately reflects the actual product. Minor variations in colour and finish are inherent to handcrafted products.</p>

      <h2 className="font-serif">3. Pricing</h2>
      <ul>
        <li>All prices are listed in Indian Rupees (₹) and are <strong>inclusive of GST</strong></li>
        <li>Prices are subject to change without prior notice</li>
        <li>Free shipping is available on orders above ₹999; otherwise a flat ₹99 shipping fee applies</li>
      </ul>

      <h2 className="font-serif">4. Orders</h2>
      <ul>
        <li>Placing an order constitutes an offer to purchase, subject to acceptance by us</li>
        <li>We reserve the right to refuse or cancel any order for reasons including stock unavailability, pricing errors, or suspected fraudulent activity</li>
        <li>Order confirmation does not guarantee acceptance</li>
      </ul>

      <h2 className="font-serif">5. Payment</h2>
      <p>We accept payments via Razorpay (UPI, credit/debit cards, netbanking) and Cash on Delivery (COD). All online payment processing is handled securely by Razorpay.</p>

      <h2 className="font-serif">6. Returns & Refunds</h2>
      <p>Please refer to our <a href="/refund-policy" className="text-primary hover:underline">Returns & Refund Policy</a> for detailed information.</p>

      <h2 className="font-serif">7. Intellectual Property</h2>
      <p>All content on this Website — including text, images, logos, and designs — is the property of Shivaya Enterprises and is protected by applicable intellectual property laws.</p>

      <h2 className="font-serif">8. Limitation of Liability</h2>
      <p>To the fullest extent permitted by law, Shivaya Enterprises shall not be liable for any indirect, incidental, or consequential damages arising from the use of our Website or products.</p>

      <h2 className="font-serif">9. Governing Law</h2>
      <p>These terms are governed by the <strong>laws of India</strong>. Any disputes shall be subject to the exclusive jurisdiction of the <strong>courts of Delhi</strong>.</p>

      <h2 className="font-serif">10. Grievance Officer</h2>
      <p>In accordance with the Information Technology Act 2000 and rules made thereunder:</p>
      <p><strong>Victor Kharkwal</strong><br />
      Shivaya Enterprises<br />
      6488, C6, Vasant Kunj, New Delhi 110070<br />
      <a href="mailto:support@stylesaplings.com" className="text-primary">support@stylesaplings.com</a><br />
      Response within 30 days of receipt of complaint.</p>
    </motion.div>
    <Footer />
  </div>
  );
};

export default TermsOfService;
