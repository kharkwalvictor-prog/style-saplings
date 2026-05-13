import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Instagram, MessageCircle } from "lucide-react";

const Footer = () => {
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
      {/* ── Newsletter — warm, editorial ── */}
      <section className="bg-[#F0EBE1]">
        <div className="container px-6 md:px-8 py-20 md:py-28">
          <div className="max-w-md mx-auto text-center">
            <p className="font-serif italic text-[17px] md:text-[20px] text-muted-foreground/70 mb-6 leading-relaxed">
              Inspired by India's regional artistry,<br />designed for little celebrations.
            </p>
            <h3 className="font-serif text-[28px] md:text-[34px] font-medium leading-[1.12] mb-3">
              Stay close to the craft.
            </h3>
            <p className="text-[14px] text-muted-foreground mb-8">
              New collections and artisan journeys, in your inbox.
            </p>

            {subscribed ? (
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[14px] text-[#7B8B6F] font-medium"
              >
                Welcome to the family.
              </motion.p>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2 max-w-sm mx-auto">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email"
                  required
                  className="flex-1 px-5 py-3 text-[13px] bg-white/80 border-0 rounded-full text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-[#7B8B6F]/20 transition-all"
                />
                <button
                  type="submit"
                  className="px-6 py-3 text-[12px] uppercase tracking-[0.1em] font-medium bg-foreground text-background rounded-full hover:bg-foreground/85 transition-colors"
                >
                  Join
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ── Main footer — atmospheric ── */}
      <div className="bg-[#1A2B22]">
        <div className="container px-6 md:px-8">
          {/* Brand statement */}
          <div className="pt-16 md:pt-20 pb-12 md:pb-14 text-center border-b border-white/10">
            <Link to="/">
              <img
                src="/assets/logo-header.png"
                alt="Style Saplings"
                className="h-14 md:h-16 object-contain mx-auto mb-5"
              />
            </Link>
            <p className="font-serif italic text-[15px] md:text-[18px] text-white/45 max-w-sm mx-auto leading-[1.7]">
              Inspired by India's regional artistry
              and crafted for little celebrations.
            </p>
          </div>

          {/* Links — clean, minimal */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-10 gap-x-8 py-12 md:py-14">
            <div>
              <h4 className="text-[10px] uppercase tracking-[0.2em] text-white/30 mb-5">Shop</h4>
              <ul className="space-y-3">
                {["All Products", "Chikankari", "Bandhani", "Firan"].map((item) => (
                  <li key={item}>
                    <Link to="/shop" className="text-[13px] text-white/50 hover:text-white transition-colors">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-[10px] uppercase tracking-[0.2em] text-white/30 mb-5">Company</h4>
              <ul className="space-y-3">
                {[
                  { label: "Our Story", to: "/about" },
                  { label: "Journal", to: "/blog" },
                  { label: "Contact", to: "/contact" },
                ].map((item) => (
                  <li key={item.label}>
                    <Link to={item.to} className="text-[13px] text-white/50 hover:text-white transition-colors">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-[10px] uppercase tracking-[0.2em] text-white/30 mb-5">Help</h4>
              <ul className="space-y-3">
                {[
                  { label: "Shipping", to: "/shipping-policy" },
                  { label: "Returns", to: "/returns" },
                  { label: "Track Order", to: "/track" },
                ].map((item) => (
                  <li key={item.label}>
                    <Link to={item.to} className="text-[13px] text-white/50 hover:text-white transition-colors">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-[10px] uppercase tracking-[0.2em] text-white/30 mb-5">Connect</h4>
              <ul className="space-y-3 text-[13px] text-white/50">
                <li>
                  <a href="mailto:support@stylesaplings.com" className="hover:text-white transition-colors">
                    support@stylesaplings.com
                  </a>
                </li>
                <li>
                  <a href="tel:+919810901031" className="hover:text-white transition-colors">
                    +91 98109 01031
                  </a>
                </li>
                <li className="text-white/30">New Delhi, India</li>
              </ul>
              <div className="flex items-center gap-3 mt-5">
                <a href="https://instagram.com/stylesaplings" target="_blank" rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full border border-white/15 flex items-center justify-center text-white/40 hover:text-white hover:border-white/30 transition-all" aria-label="Instagram">
                  <Instagram className="h-3.5 w-3.5" />
                </a>
                <a href="https://wa.me/919810901031" target="_blank" rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full border border-white/15 flex items-center justify-center text-white/40 hover:text-white hover:border-white/30 transition-all" aria-label="WhatsApp">
                  <MessageCircle className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Bottom */}
          <div className="border-t border-white/8 py-6 flex flex-col md:flex-row items-center justify-between text-[12px] text-white/25 gap-2">
            <span>&copy; {new Date().getFullYear()} Shivaya Enterprises</span>
            <div className="flex gap-5">
              <Link to="/privacy-policy" className="hover:text-white/50 transition-colors">Privacy</Link>
              <Link to="/terms-of-service" className="hover:text-white/50 transition-colors">Terms</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
