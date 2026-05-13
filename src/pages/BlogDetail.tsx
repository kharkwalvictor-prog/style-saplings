import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PageBanner from "@/components/PageBanner";
import { useSEO } from "@/hooks/useSEO";
import { useBlogPostBySlug } from "@/hooks/useBlogPosts";
import { Loader2 } from "lucide-react";

const BlogDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: post, isLoading, error } = useBlogPostBySlug(slug);

  useSEO({
    title: post ? `${post.title} | Style Saplings` : "Style Saplings Blog",
    description: post?.excerpt || post?.title || "Style Saplings Blog",
    ogImage: post?.cover_image || undefined,
    canonicalPath: `/blog/${slug}`,
    type: "article",
  });

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="flex flex-col items-center justify-center py-32 text-center px-4">
          <h1 className="font-serif text-3xl font-semibold mb-3">Article not found</h1>
          <p className="text-muted-foreground text-sm mb-6">This article may have been removed or is not yet published.</p>
          <Link to="/blog" className="text-sm font-medium hover:underline" style={{ color: "#C06A4F" }}>← Back to Blog</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const formattedDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })
    : "";

  return (
    <div className="min-h-screen">
      <Header />

      {/* Cover image */}
      {post.cover_image && (
        <div className="w-full" style={{ maxHeight: 400, overflow: "hidden" }}>
          <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover" style={{ maxHeight: 400 }} />
        </div>
      )}

      <article className="py-16 md:py-24 bg-background">
        <div className="max-w-[720px] mx-auto px-4 md:px-8">
          <Link to="/blog" className="inline-flex items-center gap-2 text-sm font-medium mb-6 px-4 py-2 rounded-full border border-border hover:bg-muted transition-colors" style={{ color: "#C06A4F" }}>
            ← Back to Blog
          </Link>

          {post.category && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="block text-[10px] uppercase tracking-[0.2em] font-medium mb-3"
              style={{ color: "#C06A4F" }}
            >
              {post.category}
            </motion.span>
          )}

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="font-serif text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight mb-4"
          >
            {post.title}
          </motion.h1>

          {formattedDate && (
            <p className="text-sm text-muted-foreground mb-10">{formattedDate}</p>
          )}

          <div className="prose-style">
            {post.content?.split("\n").map((paragraph, i) => {
              const trimmed = paragraph.trim();
              if (!trimmed) return null;
              return (
                <p key={i} className="text-base leading-[1.8] text-foreground/85 mb-5" style={{ fontFamily: "Inter, sans-serif" }}>
                  {trimmed}
                </p>
              );
            })}
          </div>

          <div className="mt-12 pt-8 border-t">
            <Link to="/blog" className="text-sm font-medium hover:underline" style={{ color: "#C06A4F" }}>
              ← Back to Blog
            </Link>
          </div>
        </div>
      </article>

      <Footer />
    </div>
  );
};

export default BlogDetail;
