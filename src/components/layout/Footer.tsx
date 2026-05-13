import { useState } from "react";
import { Link } from "react-router-dom";
import { Instagram, MessageCircle, Mail, Phone, MapPin } from "lucide-react";

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
      {/* ── Newsletter zone — light ── */}
      <div className="bg-[#EDE8DF]">
        <div className="container px-6 md:px-8 py-16 md:py-20">
          <div className="max-w-lg mx-auto text-center">
            <h3 className="font-serif text-2xl md:text-3xl font-semibold mb-2">
              Join the family.
            </h3>
            <p className="text-sm text-muted-foreground mb-8">
              New arrivals, festive drops & artisan stories — straight to your inbox.
            </p>
            {subscribed ? (
              <p className="text-sm text-[#C4785A] font-medium">Thank you for subscribing!</p>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2 max-w-md mx-auto">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  required
                  className="flex-1 px-5 py-3 text-sm bg-white border border-border rounded-full text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-[#C4785A]/40 focus:ring-2 focus:ring-[#C4785A]/10 transition-all"
                />
                <button
                  type="submit"
                  className="px-6 py-3 text-sm font-semibold bg-[#1A2B22] hover:bg-[#243B2E] text-white rounded-full transition-colors"
                >
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* ── Dark footer zone ── */}
      <div className="bg-[#1A2B22] text-white/60">
        <div className="container px-6 md:px-8">
          {/* Top: logo + tagline */}
          <div className="pt-14 md:pt-16 pb-10 border-b border-white/15">
            <img
              src="/assets/logo-header.png"
              alt="Style Saplings"
              className="h-14 object-contain mb-4"
            />
            <p className="font-serif italic text-white/50 text-sm">
              Authentic Indian craftsmanship for little ones
            </p>
          </div>

          {/* Links grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 py-12 md:py-14">
            {/* Shop */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-5">
                Shop
              </h4>
              <ul className="space-y-3 text-sm text-white/60">
                <li>
                  <Link to="/shop" className="hover:text-white transition-colors">
                    All Products
                  </Link>
                </li>
                <li>
                  <Link to="/shop" className="hover:text-white transition-colors">
                    Chikankari
                  </Link>
                </li>
                <li>
                  <Link to="/shop" className="hover:text-white transition-colors">
                    Bandhani
                  </Link>
                </li>
                <li>
                  <Link to="/shop" className="hover:text-white transition-colors">
                    Firan
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-5">
                Company
              </h4>
              <ul className="space-y-3 text-sm text-white/60">
                <li>
                  <Link to="/about" className="hover:text-white transition-colors">
                    Our Story
                  </Link>
                </li>
                <li>
                  <Link to="/blog" className="hover:text-white transition-colors">
                    Journal
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-white transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Help */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-5">
                Help
              </h4>
              <ul className="space-y-3 text-sm text-white/60">
                <li>
                  <Link to="/shipping-policy" className="hover:text-white transition-colors">
                    Shipping
                  </Link>
                </li>
                <li>
                  <Link to="/returns" className="hover:text-white transition-colors">
                    Returns
                  </Link>
                </li>
                <li>
                  <Link to="/track" className="hover:text-white transition-colors">
                    Track Order
                  </Link>
                </li>
                <li>
                  <Link to="/refund-policy" className="hover:text-white transition-colors">
                    Refunds
                  </Link>
                </li>
              </ul>
            </div>

            {/* Reach Us */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-5">
                Reach Us
              </h4>
              <ul className="space-y-3 text-sm text-white/60">
                <li>
                  <a
                    href="mailto:support@stylesaplings.com"
                    className="flex items-center gap-2 hover:text-white transition-colors"
                  >
                    <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                    support@stylesaplings.com
                  </a>
                </li>
                <li>
                  <a
                    href="tel:+919810901031"
                    className="flex items-center gap-2 hover:text-white transition-colors"
                  >
                    <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                    +91 98109 01031
                  </a>
                </li>
                <li className="flex items-start gap-2">
                  <MapPin className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                  <span>New Delhi, India</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Social + payment */}
          <div className="border-t border-white/15 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Social icons */}
            <div className="flex items-center gap-3">
              <a
                href="https://instagram.com/stylesaplings"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-9 h-9 rounded-full border border-white/20 text-white/60 hover:text-white hover:border-white/40 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="https://wa.me/919810901031"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-9 h-9 rounded-full border border-white/20 text-white/60 hover:text-white hover:border-white/40 transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle className="h-4 w-4" />
              </a>
            </div>

            {/* Payment badges */}
            <div className="flex items-center gap-4 text-[11px] text-white/40 uppercase tracking-wider">
              <span>UPI</span>
              <span className="text-white/20">|</span>
              <span>Razorpay</span>
              <span className="text-white/20">|</span>
              <span>COD</span>
              <span className="text-white/20">|</span>
              <span>Visa</span>
              <span className="text-white/20">|</span>
              <span>Mastercard</span>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-white/15 py-5 flex flex-col md:flex-row items-center justify-between text-[11px] text-white/40 gap-2">
            <span>&copy; 2026 Shivaya Enterprises &middot; Style Saplings</span>
            <span>Made with care in India</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
