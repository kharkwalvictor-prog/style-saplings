import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ShoppingBag, Menu, X, Search, Heart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { useProductSearch } from "@/hooks/useProductSearch";
import { Marquee } from "@/components/ui/marquee";
import logoLight from "@/assets/logo-light.jpeg";

import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";

const craftFallback: Record<string, string> = { Chikankari: product1, Bandhani: product2, Firan: product3, Festive: product4 };

const desktopNavLinks = [
  { label: "Home", to: "/" },
  { label: "Shop", to: "/shop" },
  { label: "About", to: "/about" },
];

const mobileNavLinks = [
  { label: "Home", to: "/" },
  { label: "Shop", to: "/shop" },
  { label: "About", to: "/about" },
  { label: "Blog", to: "/blog" },
  { label: "Contact", to: "/contact" },
];

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const { totalItems } = useCart();
  const { count: wishlistCount } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mobileSearchRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Scroll-aware header: hide on scroll down, show on scroll up
  const { scrollY } = useScroll();
  const lastScrollY = useRef(0);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 50);
    if (latest > lastScrollY.current && latest > 300) {
      setHidden(true);
    } else {
      setHidden(false);
    }
    lastScrollY.current = latest;
  });

  // Debounce
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(searchInput), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const { data: results = [] } = useProductSearch(debouncedQuery);
  const showDropdown = debouncedQuery.length >= 2;
  const displayResults = results.slice(0, 5);
  const hasMore = results.length > 5;

  useEffect(() => { if (searchOpen) searchInputRef.current?.focus(); }, [searchOpen]);
  useEffect(() => { if (mobileSearchOpen) mobileSearchRef.current?.focus(); }, [mobileSearchOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setSearchOpen(false); setMobileSearchOpen(false); setSearchInput(""); }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setSearchOpen(false); setMobileSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const closeSearch = useCallback(() => {
    setSearchOpen(false); setMobileSearchOpen(false); setSearchInput(""); setDebouncedQuery("");
  }, []);

  const handleViewAll = () => { navigate(`/shop?search=${encodeURIComponent(debouncedQuery)}`); closeSearch(); };
  const handleResultClick = (slug: string) => { navigate(`/product/${slug}`); closeSearch(); };
  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === "Enter" && debouncedQuery.length >= 2) handleViewAll(); };

  const getProductImage = (product: typeof results[0]) => {
    const img = product.images?.[0];
    if (img && !img.includes("placeholder")) return img;
    return craftFallback[product.craft_type] || product1;
  };

  const SearchDropdown = () => {
    if (!showDropdown) return null;
    return (
      <div className="absolute top-full left-0 right-0 bg-background border border-border rounded-b-xl shadow-xl z-50 max-h-[400px] overflow-auto">
        {displayResults.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-sm text-muted-foreground">No products found for &lsquo;{debouncedQuery}&rsquo;</p>
            <p className="text-xs text-muted-foreground mt-1">Try: Chikankari, Bandhani, festive, kurta, set</p>
          </div>
        ) : (
          <>
            {displayResults.map((p) => (
              <button key={p.id} onClick={() => handleResultClick(p.slug)} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors text-left border-b border-border/50 last:border-b-0">
                <img src={getProductImage(p)} alt={p.name} className="h-14 w-14 rounded-lg object-cover flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.craft_type} · ₹{Number(p.sale_price || p.price).toLocaleString("en-IN")}</p>
                </div>
              </button>
            ))}
            {hasMore && (
              <button onClick={handleViewAll} className="w-full px-4 py-3 text-sm font-medium text-center hover:bg-accent transition-colors" style={{ color: '#C47A6E' }}>
                View all {results.length} results →
              </button>
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Announcement bar -- scrolling marquee */}
      <div className="bg-[#F1F3EF] overflow-hidden border-b border-border/30">
        <Marquee speed="slow" pauseOnHover className="py-2">
          <span className="text-[11px] tracking-[0.15em] uppercase text-[#1A1A1A]/60 font-medium whitespace-nowrap px-6">
            Free shipping on orders above ₹999
          </span>
          <span className="text-[11px] text-[#1A1A1A]/30 px-2" aria-hidden="true">·</span>
          <span className="text-[11px] tracking-[0.15em] uppercase text-[#1A1A1A]/60 font-medium whitespace-nowrap px-6">
            Pan India Delivery
          </span>
          <span className="text-[11px] text-[#1A1A1A]/30 px-2" aria-hidden="true">·</span>
          <span className="text-[11px] tracking-[0.15em] uppercase text-[#1A1A1A]/60 font-medium whitespace-nowrap px-6">
            Handcrafted with Love
          </span>
          <span className="text-[11px] text-[#1A1A1A]/30 px-2" aria-hidden="true">·</span>
        </Marquee>
      </div>

      {/* Main header -- centered logo layout */}
      <motion.header
        animate={{ y: hidden ? -80 : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`sticky top-0 z-50 transition-all duration-300 border-b ${
          scrolled
            ? "bg-background/95 backdrop-blur-xl shadow-sm border-border/50"
            : "bg-background border-border/50"
        }`}
      >
        {/* Desktop search overlay -- expands over the full header when active */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              key="search-overlay"
              ref={dropdownRef}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="hidden md:flex absolute inset-0 z-10 bg-background items-center px-8"
            >
              <div className="relative w-full max-w-2xl mx-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  ref={searchInputRef}
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search products..."
                  className="w-full pl-10 pr-10 py-2.5 text-sm border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-[#C47A6E]/20 focus:border-[#C47A6E]/40 transition-all"
                />
                <button onClick={closeSearch} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                </button>
                <SearchDropdown />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Desktop: 3-column grid layout */}
        <div className="container hidden md:grid grid-cols-3 items-center h-16 md:h-[72px] px-4 md:px-8">
          {/* Left column: navigation links */}
          <nav className="flex items-center justify-start gap-7">
            {desktopNavLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={`text-xs uppercase tracking-[0.15em] font-medium transition-colors ${
                  location.pathname === l.to
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Center column: logo */}
          <div className="flex items-center justify-center">
            <Link to="/" className="flex items-center">
              <img
                alt="Style Saplings"
                className="h-11 md:h-13 object-contain"
                src={logoLight}
                style={{ mixBlendMode: "multiply" }}
              />
            </Link>
          </div>

          {/* Right column: icon actions */}
          <div className="flex items-center justify-end gap-5">
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Search className="h-[18px] w-[18px]" />
            </button>
            <Link
              to="/wishlist"
              className="relative text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Wishlist"
            >
              <Heart className="h-[18px] w-[18px]" />
              {wishlistCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center"
                  style={{ backgroundColor: '#C47A6E' }}
                >
                  {wishlistCount}
                </motion.span>
              )}
            </Link>
            <Link
              to="/cart"
              className="relative text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Cart"
            >
              <ShoppingBag className="h-[18px] w-[18px]" />
              {totalItems > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center"
                  style={{ backgroundColor: '#C47A6E' }}
                >
                  {totalItems}
                </motion.span>
              )}
            </Link>
          </div>
        </div>

        {/* Mobile: 3-column grid layout */}
        <div className="container grid grid-cols-3 items-center h-16 px-4 md:hidden">
          {/* Left: hamburger */}
          <div className="flex items-center justify-start">
            <button onClick={() => setMenuOpen(true)} aria-label="Open menu">
              <Menu className="h-5 w-5 text-foreground" />
            </button>
          </div>

          {/* Center: logo */}
          <div className="flex items-center justify-center">
            <Link to="/" className="flex items-center">
              <img
                alt="Style Saplings"
                className="h-10 object-contain"
                src={logoLight}
                style={{ mixBlendMode: "multiply" }}
              />
            </Link>
          </div>

          {/* Right: cart icon */}
          <div className="flex items-center justify-end">
            <Link to="/cart" className="relative" aria-label="Cart">
              <ShoppingBag className="h-5 w-5 text-foreground" />
              {totalItems > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center"
                  style={{ backgroundColor: '#C47A6E' }}
                >
                  {totalItems}
                </motion.span>
              )}
            </Link>
          </div>
        </div>

        {/* Mobile search bar */}
        <AnimatePresence>
          {mobileSearchOpen && (
            <motion.div
              ref={dropdownRef}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t border-border overflow-visible relative bg-background"
            >
              <div className="relative px-4 py-3">
                <Search className="absolute left-7 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  ref={mobileSearchRef}
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search products..."
                  className="w-full pl-10 pr-10 py-2.5 text-sm border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-[#C47A6E]/20 transition-all"
                />
                <button onClick={closeSearch} className="absolute right-7 top-1/2 -translate-y-1/2">
                  <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                </button>
                <SearchDropdown />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Mobile menu overlay -- slide-in from left */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-[99]"
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-[85%] max-w-sm z-[100] flex flex-col shadow-2xl bg-background"
            >
              {/* Menu header */}
              <div className="flex items-center justify-between px-6 h-16 border-b border-border">
                <img
                  src={logoLight}
                  alt="Style Saplings"
                  className="h-11 object-contain"
                  style={{ mixBlendMode: "multiply" }}
                />
                <button onClick={() => setMenuOpen(false)} aria-label="Close menu">
                  <X className="h-5 w-5 text-foreground" />
                </button>
              </div>

              {/* Menu search */}
              <div className="px-6 pt-5 pb-2">
                <button
                  onClick={() => { setMenuOpen(false); setMobileSearchOpen(true); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:border-[#C47A6E]/40 transition-colors"
                >
                  <Search className="h-4 w-4" />
                  Search products...
                </button>
              </div>

              {/* Menu links */}
              <nav className="flex flex-col px-6 pt-2 flex-1 overflow-y-auto">
                {mobileNavLinks.map((l, i) => (
                  <motion.div
                    key={l.to}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                  >
                    <Link
                      to={l.to}
                      onClick={() => setMenuOpen(false)}
                      className={`block py-4 font-sans text-lg font-medium tracking-wide transition-colors ${
                        location.pathname === l.to
                          ? "text-[#C47A6E]"
                          : "text-foreground hover:text-[#C47A6E]"
                      }`}
                    >
                      {l.label}
                    </Link>
                    {i < mobileNavLinks.length - 1 && <div className="border-b border-border" />}
                  </motion.div>
                ))}

                {/* Wishlist link */}
                <div>
                  <div className="border-b border-border" />
                  <Link
                    to="/wishlist"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 py-4 font-sans text-lg font-medium tracking-wide text-foreground hover:text-[#C47A6E] transition-colors"
                  >
                    Wishlist
                    {wishlistCount > 0 && (
                      <span
                        className="text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center"
                        style={{ backgroundColor: '#C47A6E' }}
                      >
                        {wishlistCount}
                      </span>
                    )}
                  </Link>
                </div>

                {/* Cart link */}
                <div>
                  <div className="border-b border-border" />
                  <Link
                    to="/cart"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 py-4 font-sans text-lg font-medium tracking-wide text-foreground hover:text-[#C47A6E] transition-colors"
                  >
                    Cart
                    {totalItems > 0 && (
                      <span
                        className="text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center"
                        style={{ backgroundColor: '#C47A6E' }}
                      >
                        {totalItems}
                      </span>
                    )}
                  </Link>
                </div>

                {/* Shop Now CTA */}
                <div className="mt-auto pb-10 pt-6">
                  <Link
                    to="/shop"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-center gap-2 w-full py-3.5 rounded-full text-sm font-semibold tracking-wide text-white transition-transform active:scale-[0.97]"
                    style={{ backgroundColor: "#C47A6E" }}
                  >
                    Shop Now →
                  </Link>
                </div>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
