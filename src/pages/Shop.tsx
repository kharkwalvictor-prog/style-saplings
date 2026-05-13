import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useSEO } from "@/hooks/useSEO";
import JsonLd, { ORGANIZATION_JSONLD } from "@/components/JsonLd";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/ProductCard";
import { useProducts } from "@/hooks/useProducts";
import { useProductSearch } from "@/hooks/useProductSearch";
import { Filter, X, Loader2, SlidersHorizontal } from "lucide-react";

type CraftType = "Chikankari" | "Bandhani" | "Firan" | "Festive";
type Size = "2Y" | "3Y" | "4Y" | "5Y";

const craftTypes: ("All" | CraftType)[] = ["All", "Chikankari", "Bandhani", "Firan", "Festive"];
const sizes: Size[] = ["2Y", "3Y", "4Y", "5Y"];

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  const { data: products = [], isLoading } = useProducts();
  const { data: searchResults = [], isLoading: searchLoading } = useProductSearch(searchQuery);
  const [selectedCraft, setSelectedCraft] = useState<"All" | CraftType>("All");
  const [selectedSizes, setSelectedSizes] = useState<Size[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const isSearching = searchQuery.length >= 2;
  const baseProducts = isSearching ? searchResults : products;

  const toggleSize = (s: Size) =>
    setSelectedSizes(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const clearSearch = () => {
    setSearchParams({});
  };

  const filtered = useMemo(() => {
    return baseProducts.filter(p => {
      if (selectedCraft !== "All" && p.craft_type !== selectedCraft) return false;
      if (selectedSizes.length && !selectedSizes.some(s => p.sizes.includes(s))) return false;
      return true;
    });
  }, [baseProducts, selectedCraft, selectedSizes]);

  useSEO({
    title: isSearching ? `Search: ${searchQuery} | Style Saplings` : "Shop Ethnic Wear for Kids | Style Saplings",
    description: "Browse our collection of handcrafted ethnic wear for toddlers. Chikankari, Bandhani, Festive sets. Sizes 2Y–5Y.",
    canonicalPath: "/shop",
  });

  const loading = isSearching ? searchLoading : isLoading;
  const hasActiveFilters = selectedCraft !== "All" || selectedSizes.length > 0;

  return (
    <div className="min-h-screen">
      <JsonLd data={ORGANIZATION_JSONLD} />
      <Header />

      {/* Hero Banner — Refined */}
      <section className="relative overflow-hidden grain-overlay" style={{ backgroundColor: '#3A5139' }}>
        <div className="relative z-10 flex items-center justify-center py-14 md:py-20 px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <span className="text-white/50 font-sans text-[10px] md:text-xs tracking-[0.3em] uppercase font-medium mb-3 block">
              Our Collection
            </span>
            <h1 className="font-serif text-3xl md:text-5xl font-semibold text-white">
              Handcrafted Ethnic Wear
            </h1>
            <div className="w-12 h-[2px] mx-auto mt-4" style={{ backgroundColor: '#C4622D' }} />
          </motion.div>
        </div>
      </section>

      <div className="container px-4 md:px-8 py-8 md:py-12">
        {/* Search indicator */}
        <AnimatePresence>
          {isSearching && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-3 mb-6 bg-accent/50 rounded-xl px-4 py-3"
            >
              <p className="text-sm text-muted-foreground flex-1">
                Showing results for '<span className="font-medium text-foreground">{searchQuery}</span>'
              </p>
              <button
                onClick={clearSearch}
                className="text-sm font-medium text-sale hover:underline flex items-center gap-1"
              >
                <X className="h-3.5 w-3.5" /> Clear
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filter bar */}
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{filtered.length}</span> pieces
            </p>
            <button
              className="md:hidden flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg border border-border hover:bg-accent transition-colors"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {hasActiveFilters && <span className="h-2 w-2 rounded-full bg-sale" />}
            </button>
          </div>

          {/* Craft type filters */}
          <div className="flex flex-wrap items-center gap-2">
            {craftTypes.map(c => (
              <button
                key={c}
                onClick={() => setSelectedCraft(c)}
                className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                  selectedCraft === c
                    ? "bg-foreground text-primary-foreground shadow-sm"
                    : "bg-transparent border border-border text-foreground hover:border-foreground"
                }`}
              >
                {c}
              </button>
            ))}

            {/* Desktop size filters */}
            <div className="hidden md:flex items-center gap-2 ml-auto">
              <span className="text-xs text-muted-foreground mr-1">Size:</span>
              {sizes.map(s => (
                <button key={s} onClick={() => toggleSize(s)}
                  className={`px-3 py-1.5 text-xs font-medium border rounded-full transition-all duration-200 ${
                    selectedSizes.includes(s)
                      ? "bg-foreground text-primary-foreground border-foreground"
                      : "border-border hover:border-foreground text-muted-foreground hover:text-foreground"
                  }`}>{s}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile size filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden mb-6 overflow-hidden"
            >
              <div className="flex flex-wrap gap-2 pb-2">
                <span className="text-xs text-muted-foreground w-full mb-1">Size:</span>
                {sizes.map(s => (
                  <button key={s} onClick={() => toggleSize(s)}
                    className={`px-3 py-1.5 text-xs font-medium border rounded-full transition-all duration-200 ${
                      selectedSizes.includes(s)
                        ? "bg-foreground text-primary-foreground border-foreground"
                        : "border-border hover:border-foreground"
                    }`}>{s}</button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6"
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((p, i) => (
                <motion.div
                  key={p.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <ProductCard product={p} index={i} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {!loading && filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24"
          >
            {isSearching ? (
              <>
                <p className="font-serif text-2xl text-foreground">No products found</p>
                <p className="text-sm text-muted-foreground mt-3">
                  Try: Chikankari, Bandhani, festive, kurta, set
                </p>
              </>
            ) : (
              <>
                <p className="font-serif text-2xl text-foreground">No products match your filters</p>
                <button
                  onClick={() => { setSelectedCraft("All"); setSelectedSizes([]); }}
                  className="text-sm text-sale font-medium mt-3 hover:underline"
                >
                  Clear all filters
                </button>
              </>
            )}
          </motion.div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Shop;
