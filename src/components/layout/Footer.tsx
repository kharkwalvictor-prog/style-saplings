import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Instagram, MessageCircle, Mail, Phone, MapPin } from "lucide-react";

const logoUrl = "/assets/logo-header.png";

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
    <footer>
      {/* ─── Newsletter CTA — warm section, separate from dark footer ─── */}
      <section className="bg-[#F8F8F6] py-20 md:py-28">
        <div className="container px-6 md:px-8">
          <div className="max-w-xl mx-auto text-center">
            <h3 className="font-serif text-[28px] md:text-[36px] font-medium leading-[1.2] mb-3">
              Join the family.
            </h3>
            <p className="text-[14px] text-muted-foreground mb-8 max-w-sm mx-auto">
              New collections, artisan stories, and exclusive offers —
              delivered to your inbox.
            </p>

            {subscribed ? (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[15px] text-[#7B8F72] font-medium"
              >
                Welcome — you're in.
              </motion.p>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  required
                  className="flex-1 px-5 py-3.5 text-[14px] bg-white border border-border rounded-full placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-[#7B8F72]/20 focus:border-[#7B8F72]/40 transition-all"
                />
                <button
                  type="submit"
                  className="group flex items-center gap-2 px-7 py-3.5 rounded-full bg-foreground text-background text-[13px] font-medium hover:bg-foreground/90 transition-colors"
                >
                  Subscribe
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ─── Main footer — dark ─── */}
      <div className="bg-[#1C2B1A]">
        <div className="container px-6 md:px-8">
          {/* Top section — logo + tagline centered */}
          <div className="pt-16 md:pt-20 pb-12 md:pb-14 text-center border-b border-white/[0.06]">
            <Link to="/" className="inline-block mb-4">
              <img
                src={logoUrl}
                alt="Style Saplings"
                className="h-16 md:h-20 object-contain mx-auto"
              />
            </Link>
            <p className="font-serif text-[15px] md:text-[17px] text-white/40 italic max-w-sm mx-auto leading-relaxed">
              Authentic Indian craftsmanship for little ones
            </p>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-10 gap-x-8 py-12 md:py-14">
            <div>
              <h4 className="text-[11px] uppercase tracking-[0.15em] text-white/20 font-medium mb-5">
                Shop
              </h4>
              <ul className="space-y-3">
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

            <div>
              <h4 className="text-[11px] uppercase tracking-[0.15em] text-white/20 font-medium mb-5">
                Company
              </h4>
              <ul className="space-y-3">
                {[
                  { label: "Our Story", to: "/about" },
                  { label: "Journal", to: "/blog" },
                  { label: "Contact Us", to: "/contact" },
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

            <div>
              <h4 className="text-[11px] uppercase tracking-[0.15em] text-white/20 font-medium mb-5">
                Help
              </h4>
              <ul className="space-y-3">
                {[
                  { label: "Shipping Policy", to: "/shipping-policy" },
                  { label: "Returns & Refunds", to: "/refund-policy" },
                  { label: "Track Your Order", to: "/track" },
                  { label: "Privacy Policy", to: "/privacy-policy" },
                  { label: "Terms of Service", to: "/terms-of-service" },
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

            <div>
              <h4 className="text-[11px] uppercase tracking-[0.15em] text-white/20 font-medium mb-5">
                Reach Us
              </h4>
              <ul className="space-y-4">
                <li>
                  <a
                    href="mailto:support@stylesaplings.com"
                    className="flex items-start gap-2.5 text-[13px] text-white/30 hover:text-white/70 transition-colors"
                  >
                    <Mail className="h-3.5 w-3.5 mt-[3px] flex-shrink-0 text-white/15" />
                    support@stylesaplings.com
                  </a>
                </li>
                <li>
                  <a
                    href="tel:+919810901031"
                    className="flex items-start gap-2.5 text-[13px] text-white/30 hover:text-white/70 transition-colors"
                  >
                    <Phone className="h-3.5 w-3.5 mt-[3px] flex-shrink-0 text-white/15" />
                    +91 98109 01031
                  </a>
                </li>
                <li className="flex items-start gap-2.5 text-[13px] text-white/20">
                  <MapPin className="h-3.5 w-3.5 mt-[3px] flex-shrink-0 text-white/15" />
                  <span>Vasant Kunj, New Delhi 110070</span>
                </li>
              </ul>

              {/* Social */}
              <div className="flex items-center gap-3 mt-6">
                <a
                  href="https://instagram.com/stylesaplings"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-8 h-8 rounded-full border border-white/10 text-white/30 hover:text-white/70 hover:border-white/25 transition-all"
                  aria-label="Instagram"
                >
                  <Instagram className="h-3.5 w-3.5" />
                </a>
                <a
                  href="https://wa.me/919810901031"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-8 h-8 rounded-full border border-white/10 text-white/30 hover:text-white/70 hover:border-white/25 transition-all"
                  aria-label="WhatsApp"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Payment methods */}
          <div className="border-t border-white/[0.06] py-5 flex items-center justify-center gap-4">
            {["UPI", "Razorpay", "COD", "Visa", "Mastercard"].map((m) => (
              <span
                key={m}
                className="text-[10px] text-white/12 uppercase tracking-wider px-2 py-0.5 border border-white/[0.06] rounded"
              >
                {m}
              </span>
            ))}
          </div>

          {/* Copyright */}
          <div className="border-t border-white/[0.06] py-5 flex flex-col md:flex-row items-center justify-between gap-2">
            <span className="text-[11px] text-white/12">
              &copy; {year} Shivaya Enterprises &middot; Style Saplings &middot; New Delhi, India
            </span>
            <span className="text-[11px] text-white/12">
              Made with care in India
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
