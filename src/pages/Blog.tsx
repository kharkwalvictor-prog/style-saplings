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

  useSEO({ title: "The Journal | Style Saplings", description: "Stories of craft, heritage, and dressing your little one in India's finest traditions.", canonicalPath: "/blog" });

  return (
    <div className="min-h-screen">
      <Header />
      <PageBanner label="The Journal" title="Our Blog" />

      {/* Featured post */}
      {activeCategory === "All" && featured && (
        <section className="py-0 bg-background">
          <div className="container px-4 md:px-8 py-10 md:py-14">
            <motion.div {...fade} transition={{ duration: 0.5 }} className="rounded-2xl overflow-hidden grid md:grid-cols-5" style={{ backgroundColor: "#3A5139" }}>
              <div className="md:col-span-3 p-8 md:p-10 flex flex-col justify-end text-white">
                <span className="text-xs uppercase tracking-[0.2em] font-medium mb-3" style={{ color: "#C4622D" }}>{featured.category}</span>
                <h2 className="font-serif text-2xl md:text-3xl font-semibold leading-snug mb-4">{featured.title}</h2>
                <p className="text-sm leading-relaxed mb-6" style={{ color: "rgba(255,255,255,0.7)" }}>{featured.excerpt}</p>
                <Link to={`/blog/${featured.slug}`} className="text-sm font-medium hover:underline underline-offset-4" style={{ color: "#C4622D" }}>Read More →</Link>
              </div>
              <div className="md:col-span-2 min-h-[200px] md:min-h-[300px]">
                <img src={featured.cover_image || product1} alt={featured.title} className="w-full h-full object-cover" />
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Category pills + grid */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container px-4 md:px-8">
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {categories.map(c => (
              <button
                key={c}
                onClick={() => setActiveCategory(c)}
                className={`px-5 py-2 text-sm font-medium rounded-full border transition-colors ${
                  activeCategory === c
                    ? "text-white border-transparent"
                    : "bg-white border-primary text-primary hover:bg-primary/5"
                }`}
                style={activeCategory === c ? { backgroundColor: "#4A6741", borderColor: "#4A6741" } : undefined}
              >
                {c}
              </button>
            ))}
          </div>

          {gridPosts.length === 0 ? (
            <p className="text-center text-muted-foreground py-10">No articles in this category yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {gridPosts.map((post, i) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                  className="rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-xl transition-shadow"
                  style={{ borderTop: "3px solid #C4622D" }}
                >
                  <div className="h-[180px] overflow-hidden bg-muted">
                    <img src={post.cover_image || fallbackImages[i % fallbackImages.length]} alt={post.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-6">
                    <span className="text-[10px] uppercase tracking-[0.15em] text-sale font-medium">{post.category}</span>
                    <h2 className="font-serif text-xl font-semibold mt-2 mb-3 leading-snug">{post.title}</h2>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">{post.excerpt}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {post.published_at ? new Date(post.published_at).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" }) : ""}
                      </span>
                      <Link to={`/blog/${post.slug}`} className="text-sm font-medium hover:underline underline-offset-4" style={{ color: "#C4622D" }}>Read More →</Link>
                    </div>
                  </div>
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
