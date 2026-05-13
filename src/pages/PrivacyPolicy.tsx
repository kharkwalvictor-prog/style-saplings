import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PageBanner from "@/components/PageBanner";
import { motion } from "framer-motion";
import { useSEO } from "@/hooks/useSEO";

const PrivacyPolicy = () => {
  useSEO({ title: "Privacy Policy | Style Saplings", description: "How Style Saplings collects, uses, and protects your personal information.", canonicalPath: "/privacy-policy" });
  return (
  <div className="min-h-screen">
    <Header />
    <PageBanner label="Our Policies" title="Privacy Policy" />
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="container px-4 md:px-8 py-16 md:py-24 max-w-3xl mx-auto prose prose-sm">
      <h2 className="font-serif">1. Information We Collect</h2>
      <p>When you place an order or interact with our website, we may collect:</p>
      <ul>
        <li>Name, email address, phone number</li>
        <li>Shipping and billing address</li>
        <li>Payment information (processed securely by Razorpay)</li>
        <li>Order history and preferences</li>
        <li>Device and browser information via cookies</li>
      </ul>

      <h2 className="font-serif">2. How We Use Your Information</h2>
      <ul>
        <li>To process and fulfill your orders</li>
        <li>To communicate order updates via email and WhatsApp</li>
        <li>To send promotional content (only with your consent)</li>
        <li>To improve our website and services</li>
        <li>To comply with legal obligations</li>
      </ul>

      <h2 className="font-serif">3. Data Sharing</h2>
      <p>We <strong>do not sell</strong> your personal data to third parties. We share data only with:</p>
      <ul>
        <li><strong>Razorpay</strong> — for payment processing (<a href="https://razorpay.com/privacy/" target="_blank" rel="noopener noreferrer" className="text-primary">Razorpay Privacy Policy</a>)</li>
        <li><strong>Courier partners</strong> — for order delivery</li>
        <li><strong>Legal authorities</strong> — if required by law</li>
      </ul>

      <h2 className="font-serif">4. Data Security</h2>
      <p>We implement industry-standard security measures to protect your personal information. Payment data is handled entirely by Razorpay and never stored on our servers.</p>

      <h2 className="font-serif">5. Cookies</h2>
      <p>We use basic cookies for website functionality and analytics. No tracking cookies from third-party advertisers are used.</p>

      <h2 className="font-serif">6. Your Rights</h2>
      <p>You have the right to:</p>
      <ul>
        <li>Request access to your personal data</li>
        <li>Request deletion of your data</li>
        <li>Opt out of marketing communications</li>
      </ul>
      <p>To exercise any of these rights, email <a href="mailto:support@stylesaplings.com" className="text-primary">support@stylesaplings.com</a>.</p>

      <h2 className="font-serif">7. Contact</h2>
      <p>For privacy-related queries, contact:</p>
      <p><strong>Victor Kharkwal</strong><br />
      Shivaya Enterprises<br />
      6488, C6, Vasant Kunj, New Delhi 110070<br />
      <a href="mailto:support@stylesaplings.com" className="text-primary">support@stylesaplings.com</a></p>
    </motion.div>
    <Footer />
  </div>
  );
};

export default PrivacyPolicy;
