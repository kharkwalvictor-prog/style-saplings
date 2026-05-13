import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Instagram, MessageCircle } from "lucide-react";
import logoLight from "@/assets/logo-light.jpeg";

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
    <footer className="bg-[#1C2B1A]">
      {/* ─── Newsletter — editorial, full-width ─── */}
      <div className="border-b border-white/[0.06]">
        <div className="container px-6 md:px-8 py-20 md:py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-20 items-center max-w-5xl mx-auto">
            <div>
              <h3 className="font-serif text-[28px] md:text-[32px] font-medium text-white leading-[1.2] mb-3">
                Stories, new drops &<br />
                <span className="text-white/50 italic">artisan journeys.</span>
              </h3>
            </div>
            <div>
              {subscribed ? (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-[15px] text-[#C47A6E]"
                >
                  Thank you — you're in.
                </motion.p>
              ) : (
                <form onSubmit={handleSubscribe} className="space-y-3">
                  <div className="flex gap-3">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Your email"
                      required
                      className="flex-1 px-0 py-3 text-[15px] bg-transparent border-b border-white/20 text-white placeholder:text-white/25 focus:outline-none focus:border-white/50 transition-colors"
                    />
                    <button
                      type="submit"
                      className="group flex items-center gap-2 px-0 py-3 text-[13px] uppercase tracking-[0.15em] font-medium text-white/60 hover:text-white transition-colors border-b border-transparent"
                    >
                      Join
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </button>
                  </div>
                  <p className="text-[11px] text-white/20">
                    No spam. Unsubscribe anytime.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Main footer content ─── */}
      <div className="container px-6 md:px-8">
        <div className="grid grid-cols-2 md:grid-cols-12 gap-y-12 gap-x-8 py-16 md:py-20">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-4">
            <Link to="/" className="inline-block mb-6">
              <div className="bg-white rounded-lg p-1.5 inline-block">
                <img
                  src={logoLight}
                  alt="Style Saplings"
                  className="h-10 object-contain"
                />
              </div>
            </Link>
            <p className="text-[13px] text-white/35 leading-[1.8] max-w-[260px] mb-8">
              Handcrafted Indian ethnic wear for children aged 2–5.
              Each piece made by skilled artisans preserving centuries-old
              craft traditions.
            </p>
            <div className="flex items-center gap-5">
              <a
                href="https://instagram.com/stylesaplings"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/30 hover:text-white/70 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-[18px] w-[18px]" />
              </a>
              <a
                href="https://wa.me/919810901031"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/30 hover:text-white/70 transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle className="h-[18px] w-[18px]" />
              </a>
            </div>
          </div>

          {/* Shop links */}
          <div className="md:col-span-2 md:col-start-6">
            <h4 className="text-[11px] uppercase tracking-[0.15em] text-white/25 font-medium mb-5">
              Shop
            </h4>
            <ul className="space-y-3">
              {[
                { label: "All Products", to: "/shop" },
                { label: "Chikankari", to: "/shop?craft=Chikankari" },
                { label: "Bandhani", to: "/shop?craft=Bandhani" },
                { label: "Firan", to: "/shop?craft=Firan" },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-[13px] text-white/35 hover:text-white/70 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company links */}
          <div className="md:col-span-2">
            <h4 className="text-[11px] uppercase tracking-[0.15em] text-white/25 font-medium mb-5">
              Company
            </h4>
            <ul className="space-y-3">
              {[
                { label: "Our Story", to: "/about" },
                { label: "Journal", to: "/blog" },
                { label: "Contact", to: "/contact" },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-[13px] text-white/35 hover:text-white/70 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help links */}
          <div className="md:col-span-2">
            <h4 className="text-[11px] uppercase tracking-[0.15em] text-white/25 font-medium mb-5">
              Help
            </h4>
            <ul className="space-y-3">
              {[
                { label: "Shipping", to: "/shipping-policy" },
                { label: "Returns", to: "/returns" },
                { label: "Track Order", to: "/track" },
                { label: "Refunds", to: "/refund-policy" },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-[13px] text-white/35 hover:text-white/70 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ─── Bottom bar ─── */}
        <div className="border-t border-white/[0.06] py-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <span className="text-[11px] text-white/20">
            &copy; {year} Shivaya Enterprises &middot; Style Saplings
          </span>
          <div className="flex items-center gap-6 text-[11px] text-white/20">
            <Link
              to="/privacy-policy"
              className="hover:text-white/40 transition-colors"
            >
              Privacy
            </Link>
            <Link
              to="/terms-of-service"
              className="hover:text-white/40 transition-colors"
            >
              Terms
            </Link>
            <a
              href="mailto:support@stylesaplings.com"
              className="hover:text-white/40 transition-colors"
            >
              support@stylesaplings.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
