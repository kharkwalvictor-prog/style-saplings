import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Instagram, MessageCircle, MapPin, Mail, Phone } from "lucide-react";

const Footer = () => {
  const year = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <footer className="bg-[#1C2B1A] overflow-hidden">
      {/* ─── Newsletter — full-width editorial with decorative element ─── */}
      <div className="relative border-b border-white/[0.06]">
        {/* Decorative gradient orb */}
        <div className="absolute -right-32 top-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-[#7B8F72]/8 blur-[120px] pointer-events-none" />

        <div className="container px-6 md:px-8 py-20 md:py-28 relative">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 items-center max-w-5xl mx-auto">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-[#7B8F72]/70 font-medium mb-4">
                Stay Connected
              </p>
              <h3 className="font-serif text-[30px] md:text-[36px] font-medium text-white leading-[1.2]">
                Stories, new drops &<br />
                <span className="text-white/40 italic">artisan journeys.</span>
              </h3>
            </div>
            <div>
              {subscribed ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center md:text-left"
                >
                  <p className="text-[15px] text-[#C47A6E] font-medium mb-1">
                    Welcome to the family.
                  </p>
                  <p className="text-[13px] text-white/30">
                    You'll hear from us soon.
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubscribe} className="space-y-4">
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                      className="w-full px-5 py-4 text-[14px] bg-white/[0.06] border border-white/10 rounded-xl text-white placeholder:text-white/25 focus:outline-none focus:border-white/25 focus:bg-white/[0.08] transition-all"
                    />
                    <button
                      type="submit"
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 group flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-[#C47A6E] hover:bg-[#B06A5E] text-white text-[13px] font-medium transition-colors"
                    >
                      Join
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  </div>
                  <p className="text-[11px] text-white/15 px-1">
                    No spam, ever. Unsubscribe anytime.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Main footer ─── */}
      <div className="container px-6 md:px-8">
        <div className="grid grid-cols-2 md:grid-cols-12 gap-y-12 gap-x-8 py-16 md:py-20">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-4">
            <Link to="/" className="inline-block mb-6">
              <img
                src="/assets/logo-footer.png"
                alt="Style Saplings"
                className="h-14 object-contain brightness-0 invert opacity-90"
              />
            </Link>
            <p className="text-[13px] text-white/30 leading-[1.8] max-w-[280px] mb-8">
              Handcrafted Indian ethnic wear for children aged 2–5.
              Each piece made by skilled artisans preserving centuries-old
              craft traditions.
            </p>

            {/* Social links */}
            <div className="flex items-center gap-4">
              <a
                href="https://instagram.com/stylesaplings"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-9 h-9 rounded-full bg-white/[0.06] text-white/40 hover:bg-white/[0.12] hover:text-white/80 transition-all"
                aria-label="Instagram"
              >
                <Instagram className="h-[16px] w-[16px]" />
              </a>
              <a
                href="https://wa.me/919810901031"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-9 h-9 rounded-full bg-white/[0.06] text-white/40 hover:bg-white/[0.12] hover:text-white/80 transition-all"
                aria-label="WhatsApp"
              >
                <MessageCircle className="h-[16px] w-[16px]" />
              </a>
            </div>
          </div>

          {/* Shop links */}
          <div className="md:col-span-2 md:col-start-6">
            <h4 className="text-[11px] uppercase tracking-[0.15em] text-white/20 font-medium mb-5">
              Shop
            </h4>
            <ul className="space-y-3.5">
              {[
                { label: "All Products", to: "/shop" },
                { label: "Chikankari", to: "/shop?craft=Chikankari" },
                { label: "Bandhani", to: "/shop?craft=Bandhani" },
                { label: "Firan", to: "/shop?craft=Firan" },
                { label: "New Arrivals", to: "/shop" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-[13px] text-white/30 hover:text-white/70 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company links */}
          <div className="md:col-span-2">
            <h4 className="text-[11px] uppercase tracking-[0.15em] text-white/20 font-medium mb-5">
              Company
            </h4>
            <ul className="space-y-3.5">
              {[
                { label: "Our Story", to: "/about" },
                { label: "Journal", to: "/blog" },
                { label: "Contact", to: "/contact" },
                { label: "Shipping", to: "/shipping-policy" },
                { label: "Returns & Refunds", to: "/refund-policy" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-[13px] text-white/30 hover:text-white/70 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact column */}
          <div className="md:col-span-2">
            <h4 className="text-[11px] uppercase tracking-[0.15em] text-white/20 font-medium mb-5">
              Get in Touch
            </h4>
            <ul className="space-y-4">
              <li>
                <a
                  href="mailto:support@stylesaplings.com"
                  className="flex items-start gap-2.5 text-[13px] text-white/30 hover:text-white/70 transition-colors group"
                >
                  <Mail className="h-[14px] w-[14px] mt-0.5 flex-shrink-0 text-white/20 group-hover:text-white/50 transition-colors" />
                  support@stylesaplings.com
                </a>
              </li>
              <li>
                <a
                  href="tel:+919810901031"
                  className="flex items-start gap-2.5 text-[13px] text-white/30 hover:text-white/70 transition-colors group"
                >
                  <Phone className="h-[14px] w-[14px] mt-0.5 flex-shrink-0 text-white/20 group-hover:text-white/50 transition-colors" />
                  +91 98109 01031
                </a>
              </li>
              <li className="flex items-start gap-2.5 text-[13px] text-white/20">
                <MapPin className="h-[14px] w-[14px] mt-0.5 flex-shrink-0" />
                <span>Vasant Kunj, New Delhi<br />India 110070</span>
              </li>
            </ul>
          </div>
        </div>

        {/* ─── Payment & trust badges ─── */}
        <div className="border-t border-white/[0.06] py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-[11px] text-white/15">
              <span className="px-2.5 py-1 rounded border border-white/10 font-medium">UPI</span>
              <span className="px-2.5 py-1 rounded border border-white/10 font-medium">Razorpay</span>
              <span className="px-2.5 py-1 rounded border border-white/10 font-medium">COD</span>
              <span className="px-2.5 py-1 rounded border border-white/10 font-medium">Visa</span>
              <span className="px-2.5 py-1 rounded border border-white/10 font-medium">Mastercard</span>
            </div>
            <p className="text-[11px] text-white/15">
              Secure payments powered by Razorpay
            </p>
          </div>
        </div>

        {/* ─── Bottom bar ─── */}
        <div className="border-t border-white/[0.06] py-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <span className="text-[11px] text-white/15">
            &copy; {year} Shivaya Enterprises &middot; Style Saplings
          </span>
          <div className="flex items-center gap-6 text-[11px] text-white/15">
            <Link
              to="/privacy-policy"
              className="hover:text-white/40 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms-of-service"
              className="hover:text-white/40 transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              to="/track"
              className="hover:text-white/40 transition-colors"
            >
              Track Order
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
