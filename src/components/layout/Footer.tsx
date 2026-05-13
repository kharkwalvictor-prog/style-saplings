import { useState } from "react";
import { Link } from "react-router-dom";
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
    <footer className="bg-[#1C2B1A] text-white/80">
      {/* Newsletter */}
      <div className="border-b border-white/10">
        <div className="container px-6 md:px-8 py-12 md:py-14">
          <div className="max-w-xl mx-auto text-center">
            <h3 className="font-serif text-xl md:text-2xl font-semibold text-white mb-2">
              Stay in the Loop
            </h3>
            <p className="text-sm text-white/40 mb-6">
              New arrivals, festive drops & artisan stories — straight to your inbox.
            </p>
            {subscribed ? (
              <p className="text-sm text-[#C47A6E] font-medium">Thank you for subscribing!</p>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2 max-w-md mx-auto">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  required
                  className="flex-1 px-4 py-3 text-sm bg-white/10 border border-white/15 rounded-full text-white placeholder:text-white/30 focus:outline-none focus:border-[#C47A6E]/50 transition-colors"
                />
                <button
                  type="submit"
                  className="px-6 py-3 text-sm font-semibold bg-[#C47A6E] hover:bg-[#B06A5E] text-white rounded-full transition-colors"
                >
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Links */}
      <div className="container px-6 md:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 py-14 md:py-16">
          <div className="col-span-2 md:col-span-1">
            <div className="inline-block bg-white rounded-md p-1.5 mb-5">
              <img alt="Style Saplings" src={logoLight} className="h-9 object-contain" />
            </div>
            <p className="text-sm text-white/40 leading-relaxed max-w-[240px] mb-5">
              Handcrafted Indian ethnic wear for little ones.
            </p>
            <div className="flex gap-5 text-xs text-white/35">
              <a href="https://instagram.com/stylesaplings" target="_blank" rel="noopener noreferrer" className="hover:text-white/70 transition-colors">Instagram</a>
              <a href="https://wa.me/919810901031" target="_blank" rel="noopener noreferrer" className="hover:text-white/70 transition-colors">WhatsApp</a>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-4">Shop</h4>
            <ul className="space-y-2.5 text-sm text-white/40">
              <li><Link to="/shop" className="hover:text-white/70 transition-colors">All Products</Link></li>
              <li><Link to="/about" className="hover:text-white/70 transition-colors">Our Story</Link></li>
              <li><Link to="/blog" className="hover:text-white/70 transition-colors">Journal</Link></li>
              <li><Link to="/contact" className="hover:text-white/70 transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-4">Help</h4>
            <ul className="space-y-2.5 text-sm text-white/40">
              <li><Link to="/shipping-policy" className="hover:text-white/70 transition-colors">Shipping</Link></li>
              <li><Link to="/returns" className="hover:text-white/70 transition-colors">Returns</Link></li>
              <li><Link to="/track" className="hover:text-white/70 transition-colors">Track Order</Link></li>
              <li><Link to="/refund-policy" className="hover:text-white/70 transition-colors">Refunds</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-4">Contact</h4>
            <ul className="space-y-2.5 text-sm text-white/40">
              <li><a href="mailto:support@stylesaplings.com" className="hover:text-white/70 transition-colors">support@stylesaplings.com</a></li>
              <li><a href="tel:+919810901031" className="hover:text-white/70 transition-colors">+91 98109 01031</a></li>
              <li>New Delhi, India</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 py-5 flex flex-col md:flex-row items-center justify-between text-[11px] text-white/25 gap-2">
          <span>&copy; {year} Style Saplings</span>
          <div className="flex gap-4">
            <Link to="/privacy-policy" className="hover:text-white/50 transition-colors">Privacy</Link>
            <Link to="/terms-of-service" className="hover:text-white/50 transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
