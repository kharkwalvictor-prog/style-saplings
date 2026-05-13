import { useState, useMemo, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useSEO } from "@/hooks/useSEO";
import JsonLd, { ORGANIZATION_JSONLD } from "@/components/JsonLd";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useSpring,
} from "framer-motion";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/ProductCard";
import { useProducts } from "@/hooks/useProducts";
import { useProductSearch } from "@/hooks/useProductSearch";
import { Search, X, Loader2, ChevronDown } from "lucide-react";

import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";

/* ── Types ── */
type CraftType = "Chikankari" | "Bandhani" | "Firan" | "Festive";
type SortOption = "newest" | "price-asc" | "price-desc";

const craftTypes: ("All" | CraftType)[] = [
  "All",
  "Chikankari",
  "Bandhani",
  "Firan",
  "Festive",
];

/* ── Craft metadata for hero banners ── */
const craftMeta: Record<
  CraftType,
  { image: string; tagline: string }
> = {
  Chikankari: {
    image: product1,
    tagline: "400 years of Lucknowi hand-embroidery, reimagined for little ones.",
  },
  Bandhani: {
    image: product2,
    tagline: "Rajasthani tie-dye craft, vibrant and playful for every celebration.",
  },
  Firan: {
    image: product3,
    tagline: "Kashmiri warmth woven into delicate silhouettes for children.",
  },
  Festive: {
    image: product4,
    tagline: "Curated pieces for Diwali, Eid, Onam, and every joyful occasion.",
  },
};

/* ── Storytelling quotes inserted between product rows ── */
const storyCards = [
  "Every chikankari piece carries 400 years of Lucknowi tradition \u2014 each stitch placed by hand, never by machine.",
  "Bandhani begins with a single knot. Thousands later, fabric transforms into a constellation of colour and craft.",
  "In Kashmir, the firan is more than clothing \u2014 it is warmth, memory, and identity passed from one generation to the next.",
];

/* ── Animation variants (matching homepage patterns) ── */
const reveal = {
  hidden: { opacity: 0, y: 30, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { type: "spring", damping: 30, stiffness: 120 },
  },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

/* ── Sort helpers ── */
const sortLabels: Record<SortOption, string> = {
  newest: "Newest",
  "price-asc": "Price: Low to High",
  "price-desc": "Price: High to Low",
};

/* ════════════════════════════════════════════════════════
   SHOP PAGE
   ════════════════════════════════════════════════════════ */
const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  const craftParam = searchParams.get("craft") as CraftType | null;

  const { data: products = [], isLoading } = useProducts();
  const { data: searchResults = [], isLoading: searchLoading } =
    useProductSearch(searchQuery);

  const [selectedCraft, setSelectedCraft] = useState<"All" | CraftType>(
    craftParam && craftTypes.includes(craftParam) ? craftParam : "All"
  );
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [sortOpen, setSortOpen] = useState(false);

  const isSearching = searchQuery.length >= 2;
  const baseProducts = isSearching ? searchResults : products;

  const clearSearch = useCallback(() => {
    setLocalSearch("");
    const next = new URLSearchParams(searchParams);
    next.delete("search");
    setSearchParams(next);
  }, [searchParams, setSearchParams]);

  const handleSearchSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = localSearch.trim();
      if (trimmed.length >= 2) {
        const next = new URLSearchParams(searchParams);
        next.set("search", trimmed);
        setSearchParams(next);
      } else if (trimmed.length === 0) {
        clearSearch();
      }
    },
    [localSearch, searchParams, setSearchParams, clearSearch]
  );

  const handleCraftSelect = useCallback(
    (craft: "All" | CraftType) => {
      setSelectedCraft(craft);
      const next = new URLSearchParams(searchParams);
      if (craft === "All") {
        next.delete("craft");
      } else {
        next.set("craft", craft);
      }
      setSearchParams(next);
    },
    [searchParams, setSearchParams]
  );

  /* ── Filtering + Sorting ── */
  const filtered = useMemo(() => {
    let result = baseProducts.filter((p) => {
      if (selectedCraft !== "All" && p.craft_type !== selectedCraft) return false;
      return true;
    });

    if (sortBy === "price-asc") {
      result = [...result].sort(
        (a, b) =>
          Number(a.sale_price || a.price) - Number(b.sale_price || b.price)
      );
    } else if (sortBy === "price-desc") {
      result = [...result].sort(
        (a, b) =>
          Number(b.sale_price || b.price) - Number(a.sale_price || a.price)
      );
    }
    // "newest" is default order from the hook (created_at desc)

    return result;
  }, [baseProducts, selectedCraft, sortBy]);

  /* ── Interleave storytelling cards every 6 products ── */
  const gridItems = useMemo(() => {
    const items: Array<
      | { type: "product"; product: (typeof filtered)[0]; index: number }
      | { type: "story"; text: string; key: string }
    > = [];
    let storyIndex = 0;

    filtered.forEach((product, i) => {
      items.push({ type: "product", product, index: i });
      if ((i + 1) % 6 === 0 && storyIndex < storyCards.length) {
        items.push({
          type: "story",
          text: storyCards[storyIndex],
          key: `story-${storyIndex}`,
        });
        storyIndex++;
      }
    });

    return items;
  }, [filtered]);

  /* ── Hero parallax ── */
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroImageY = useSpring(useTransform(scrollYProgress, [0, 1], [0, 120]), {
    damping: 30,
    stiffness: 90,
  });

  /* ── Hero content ── */
  const activeCraft =
    selectedCraft !== "All" ? (selectedCraft as CraftType) : null;
  const heroImage = activeCraft
    ? craftMeta[activeCraft].image
    : product1;
  const heroTitle = activeCraft || "The Collection";
  const heroTagline = activeCraft
    ? craftMeta[activeCraft].tagline
    : "Handcrafted Indian ethnic wear, curated for little ones.";

  /* ── SEO ── */
  useSEO({
    title: isSearching
      ? `Search: ${searchQuery} | Style Saplings`
      : activeCraft
        ? `${activeCraft} Collection | Style Saplings`
        : "Shop Ethnic Wear for Kids | Style Saplings",
    description:
      "Browse our collection of handcrafted ethnic wear for toddlers. Chikankari, Bandhani, Festive sets. Sizes 2Y\u20135Y.",
    canonicalPath: "/shop",
  });

  const loading = isSearching ? searchLoading : isLoading;

  return (
    <div className="min-h-screen bg-background">
      <JsonLd data={ORGANIZATION_JSONLD} />
      <Header />

      {/* ═══════════════════════════════════════════════════
          HERO BANNER — Craft-specific or default
      ═══════════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative h-[40vh] min-h-[200px] md:min-h-[300px] overflow-hidden"
      >
        <motion.div className="absolute inset-0" style={{ y: heroImageY }}>
          <AnimatePresence mode="wait">
            <motion.img
              key={heroImage}
              src={heroImage}
              alt=""
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="w-full h-[120%] object-cover"
              loading="eager"
            />
          </AnimatePresence>
        </motion.div>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />

        {/* Content — bottom left */}
        <div className="absolute inset-0 z-10 flex items-end">
          <div className="container px-5 md:px-8 pb-10 md:pb-14">
            <AnimatePresence mode="wait">
              <motion.div
                key={heroTitle}
                initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ type: "spring", damping: 30, stiffness: 120 }}
              >
                <h1 className="font-serif text-3xl md:text-5xl font-semibold text-white leading-tight [text-shadow:_0_2px_20px_rgba(0,0,0,0.4)]">
                  {heroTitle}
                </h1>
                <p className="text-white/80 text-[15px] mt-2 max-w-md leading-relaxed [text-shadow:_0_1px_10px_rgba(0,0,0,0.3)]">
                  {heroTagline}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          FILTER BAR — Sticky, minimal, magazine-like
      ═══════════════════════════════════════════════════ */}
      <div className="sticky top-0 z-30 bg-background border-b border-border">
        <div className="container px-5 md:px-8">
          <div className="flex items-center justify-between h-14 gap-4">
            {/* Craft type text filters */}
            <nav
              className="flex items-center gap-1 overflow-x-auto no-scrollbar -mx-1 px-1"
              role="tablist"
              aria-label="Filter by craft type"
            >
              {craftTypes.map((craft) => (
                <button
                  key={craft}
                  role="tab"
                  aria-selected={selectedCraft === craft}
                  onClick={() => handleCraftSelect(craft)}
                  className={`relative whitespace-nowrap px-3 py-1.5 text-[14px] transition-colors duration-200 min-h-[44px] flex items-center ${
                    selectedCraft === craft
                      ? "text-[#4A6B45] font-medium"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {craft}
                  {selectedCraft === craft && (
                    <motion.span
                      layoutId="craft-underline"
                      className="absolute bottom-0 left-3 right-3 h-px bg-[#4A6B45]"
                      transition={{ type: "spring", damping: 30, stiffness: 300 }}
                    />
                  )}
                </button>
              ))}
            </nav>

            {/* Right side: search + sort */}
            <div className="flex items-center gap-3 shrink-0">
              {/* Search */}
              <form
                onSubmit={handleSearchSubmit}
                className="hidden sm:flex items-center gap-2"
              >
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    value={localSearch}
                    onChange={(e) => setLocalSearch(e.target.value)}
                    placeholder="Search..."
                    className="w-40 md:w-48 bg-transparent border-none text-[13px] pl-8 pr-2 py-1.5 focus:outline-none placeholder:text-muted-foreground/60"
                    aria-label="Search products"
                  />
                  {localSearch && (
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="absolute right-1 top-1/2 -translate-y-1/2 p-0.5 text-muted-foreground hover:text-foreground"
                      aria-label="Clear search"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </form>

              {/* Sort */}
              <div className="relative">
                <button
                  onClick={() => setSortOpen(!sortOpen)}
                  className="flex items-center gap-1.5 text-[14px] text-muted-foreground hover:text-foreground transition-colors min-h-[44px]"
                  aria-haspopup="listbox"
                  aria-expanded={sortOpen}
                >
                  <span className="hidden md:inline">Sort by:</span>{" "}
                  <span className="font-medium text-foreground">
                    {sortLabels[sortBy]}
                  </span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform duration-200 ${
                      sortOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {sortOpen && (
                    <>
                      {/* Backdrop to close */}
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setSortOpen(false)}
                      />
                      <motion.ul
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.15 }}
                        role="listbox"
                        className="absolute right-0 top-full mt-2 z-50 bg-background border border-border rounded-xl shadow-lg py-1.5 min-w-[180px]"
                      >
                        {(Object.keys(sortLabels) as SortOption[]).map(
                          (option) => (
                            <li key={option}>
                              <button
                                role="option"
                                aria-selected={sortBy === option}
                                onClick={() => {
                                  setSortBy(option);
                                  setSortOpen(false);
                                }}
                                className={`w-full text-left px-4 py-2 text-[13px] transition-colors ${
                                  sortBy === option
                                    ? "text-foreground font-medium bg-accent/50"
                                    : "text-muted-foreground hover:text-foreground hover:bg-accent/30"
                                }`}
                              >
                                {sortLabels[option]}
                              </button>
                            </li>
                          )
                        )}
                      </motion.ul>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Mobile search row */}
          <form
            onSubmit={handleSearchSubmit}
            className="sm:hidden flex items-center gap-2 pb-3"
          >
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="Search pieces..."
                className="w-full bg-accent/40 rounded-lg border-none text-[16px] pl-8 pr-8 py-2 focus:outline-none focus:ring-1 focus:ring-border placeholder:text-muted-foreground/60"
                aria-label="Search products"
              />
              {localSearch && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-muted-foreground hover:text-foreground"
                  aria-label="Clear search"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
          SEARCH INDICATOR
      ═══════════════════════════════════════════════════ */}
      <AnimatePresence>
        {isSearching && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-b border-border overflow-hidden"
          >
            <div className="container px-6 md:px-8 py-3 flex items-center gap-3">
              <p className="text-sm text-muted-foreground flex-1">
                Showing results for &lsquo;
                <span className="font-medium text-foreground">{searchQuery}</span>
                &rsquo;
                <span className="ml-2 text-muted-foreground/60">
                  ({filtered.length} {filtered.length === 1 ? "piece" : "pieces"})
                </span>
              </p>
              <button
                onClick={clearSearch}
                className="text-[13px] font-medium text-[#C06A4F] hover:underline flex items-center gap-1"
              >
                <X className="h-3.5 w-3.5" /> Clear
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════
          PRODUCT GRID with inline storytelling
      ═══════════════════════════════════════════════════ */}
      <div className="container px-5 md:px-8 py-10 md:py-14">
        {/* Count */}
        {!loading && !isSearching && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[13px] text-muted-foreground mb-6"
          >
            <span className="font-medium text-foreground">{filtered.length}</span>{" "}
            {filtered.length === 1 ? "piece" : "pieces"}
          </motion.p>
        )}

        {loading ? (
          <div className="flex justify-center py-32">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          /* ── Empty state ── */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 120 }}
            className="text-center py-32"
          >
            {isSearching ? (
              <>
                <p className="font-serif text-2xl text-foreground">
                  No pieces found
                </p>
                <p className="text-sm text-muted-foreground mt-3 max-w-xs mx-auto leading-relaxed">
                  Try searching for Chikankari, Bandhani, festive, kurta, or set.
                </p>
                <button
                  onClick={clearSearch}
                  className="text-[13px] font-medium text-[#C06A4F] mt-5 hover:underline"
                >
                  Clear search
                </button>
              </>
            ) : (
              <>
                <p className="font-serif text-2xl text-foreground">
                  No pieces found for this craft yet.
                </p>
                <button
                  onClick={() => handleCraftSelect("All")}
                  className="text-[13px] font-medium text-[#C06A4F] mt-5 hover:underline"
                >
                  View all
                </button>
              </>
            )}
          </motion.div>
        ) : (
          /* ── Grid with storytelling cards ── */
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-8"
          >
            {gridItems.map((item) => {
              if (item.type === "story") {
                return (
                  <motion.div
                    key={item.key}
                    variants={reveal}
                    className="col-span-2 md:col-span-3"
                  >
                    <div className="bg-[#EDE7DE] rounded-3xl p-6 md:p-14 flex items-center justify-center">
                      <p className="font-serif italic text-[17px] md:text-[20px] leading-[1.7] text-foreground/80 max-w-2xl text-center">
                        &ldquo;{item.text}&rdquo;
                      </p>
                    </div>
                  </motion.div>
                );
              }

              return (
                <motion.div key={item.product.id} variants={reveal}>
                  <ProductCard product={item.product} index={item.index} />
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Shop;
