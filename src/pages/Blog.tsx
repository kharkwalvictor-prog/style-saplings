import { useState } from "react";
import { useSEO } from "@/hooks/useSEO";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PageBanner from "@/components/PageBanner";
import { useBlogPosts } from "@/hooks/useBlogPosts";
import { Loader2 } from "lucide-react";

import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";

const fallbackImages = [product1, product2, product3, product4];

const categories = ["All", "Heritage", "Sustainability", "Styling Tips", "Craft Stories", "How To", "Care Tips"];

const fade = { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true } as const };

const Blog = () => {
  const { data: posts = [], isLoading } = useBlogPosts(true);
  const [activeCategory, setActiveCategory] = useState("All");

  useSEO({ title: "The Journal | Style Saplings", description: "Stories of craft, heritage, and dressing your little one in India's finest traditions.", canonicalPath: "/blog" });

  const filtered = activeCategory === "All" ? posts : posts.filter(p => p.category === activeCategory);
  const featured = posts[0];
  const gridPosts = filtered.filter(p => !featured || p.id !== featured.id || activeCategory !== "All");

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="flex items-center justify-center py-32"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <PageBanner label="The Journal" title="Our Blog" />

      {/* Featured post */}
      {activeCategory === "All" && featured && (
        <section className="py-0 bg-background">
          <div className="container px-5 md:px-8 py-10 md:py-14">
            <motion.div {...fade} transition={{ duration: 0.5 }} className="rounded-2xl overflow-hidden grid grid-cols-1 md:grid-cols-5" style={{ backgroundColor: "#1E3320" }}>
              <div className="md:col-span-3 p-6 md:p-10 flex flex-col justify-end text-white order-2 md:order-1">
                <span className="text-xs uppercase tracking-[0.2em] font-medium mb-3" style={{ color: "#C06A4F" }}>{featured.category}</span>
                <h2 className="font-serif text-2xl md:text-3xl font-medium leading-snug mb-4">{featured.title}</h2>
                <p className="text-sm leading-relaxed mb-6" style={{ color: "rgba(255,255,255,0.7)" }}>{featured.excerpt}</p>
                <Link to={`/blog/${featured.slug}`} className="text-sm font-medium hover:underline underline-offset-4" style={{ color: "#C06A4F" }}>Read More →</Link>
              </div>
              <div className="md:col-span-2 min-h-[200px] md:min-h-[300px] order-1 md:order-2">
                <img src={featured.cover_image || product1} alt={featured.title} className="w-full h-full object-cover" />
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Category tabs + grid */}
      <section className="py-12 md:py-20 bg-background">
        <div className="container px-5 md:px-8">
          {/* Tab filter — text underline style, matching Shop page */}
          <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar border-b border-border/40 mb-10 -mx-1 px-1">
            {categories.map(c => (
              <button
                key={c}
                onClick={() => setActiveCategory(c)}
                className={`relative whitespace-nowrap px-3 py-3 text-[13px] transition-colors min-h-[44px] ${
                  activeCategory === c
                    ? "text-[#4A6B45] font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {c}
                {activeCategory === c && (
                  <motion.span
                    layoutId="blog-tab-underline"
                    className="absolute bottom-0 left-3 right-3 h-px bg-[#4A6B45]"
                    transition={{ type: "spring", damping: 30, stiffness: 300 }}
                  />
                )}
              </button>
            ))}
          </nav>

          {gridPosts.length === 0 ? (
            <div className="text-center py-20">
              <p className="font-serif italic text-muted-foreground text-[17px]">No articles in this category yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
              {gridPosts.map((post, i) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                  className="group"
                >
                  <Link to={`/blog/${post.slug}`} className="block">
                    <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-muted mb-5">
                      <img
                        src={post.cover_image || fallbackImages[i % fallbackImages.length]}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                      />
                    </div>
                    <span className="text-[10px] uppercase tracking-[0.22em] text-[#4A6B45] font-medium">{post.category}</span>
                    <h2 className="font-serif text-[20px] md:text-[22px] font-medium mt-2 mb-3 leading-snug group-hover:text-[#4A6B45] transition-colors">{post.title}</h2>
                    <p className="text-[14px] text-muted-foreground leading-relaxed mb-4 line-clamp-2">{post.excerpt}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-muted-foreground">
                        {post.published_at ? new Date(post.published_at).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" }) : ""}
                      </span>
                      <span className="text-[12px] font-medium text-[#4A6B45] group-hover:underline underline-offset-4">Read →</span>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Blog;
