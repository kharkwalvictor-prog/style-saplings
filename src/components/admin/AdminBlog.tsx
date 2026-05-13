import { useState, useRef } from "react";
import { useBlogPosts, BlogPost, useDeleteBlogPost } from "@/hooks/useBlogPosts";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Plus, Pencil, Trash2, X, Upload, Eye } from "lucide-react";
import RichTextEditor from "./RichTextEditor";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const BLOG_CATEGORIES = ["Heritage", "Sustainability", "Styling Tips", "Craft Stories", "How To", "Care Tips"];

const AdminBlog = () => {
  const { data: posts = [], isLoading } = useBlogPosts();
  const deleteMutation = useDeleteBlogPost();
  const qc = useQueryClient();
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [creating, setCreating] = useState(false);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    try { await deleteMutation.mutateAsync(id); toast.success("Post deleted"); } catch { toast.error("Failed to delete"); }
  };

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-serif text-xl font-semibold">Blog Posts ({posts.length})</h2>
        <Button size="sm" onClick={() => { setCreating(true); setEditing(null); }}><Plus className="h-4 w-4 mr-1" /> New Post</Button>
      </div>

      {(creating || editing) && (
        <BlogPostForm post={editing} onClose={() => { setEditing(null); setCreating(false); }}
          onSaved={() => { setEditing(null); setCreating(false); qc.invalidateQueries({ queryKey: ["blog-posts"] }); }} />
      )}

      <div className="border rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-accent/30"><tr>
            <th className="text-left p-3 font-medium">Title</th>
            <th className="text-left p-3 font-medium">Category</th>
            <th className="text-left p-3 font-medium">Status</th>
            <th className="text-left p-3 font-medium">Date</th>
            <th className="text-right p-3 font-medium">Actions</th>
          </tr></thead>
          <tbody>
            {posts.map(p => (
              <tr key={p.id} className="border-t hover:bg-accent/10">
                <td className="p-3 font-medium">{p.title}</td>
                <td className="p-3 text-xs">{p.category || "-"}</td>
                <td className="p-3"><span className={`text-xs px-2 py-0.5 rounded ${p.published ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}>{p.published ? "Published" : "Draft"}</span></td>
                <td className="p-3 text-xs text-muted-foreground">{p.published_at ? new Date(p.published_at).toLocaleDateString("en-IN") : "-"}</td>
                <td className="p-3 text-right space-x-1">
                  <button onClick={() => { setEditing(p); setCreating(false); }} className="p-1 hover:text-primary" title="Edit"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => window.open(`/blog/${p.slug}`, "_blank")} className="p-1 hover:text-primary" title="Preview on site"><Eye className="h-4 w-4" /></button>
                  <button onClick={() => handleDelete(p.id)} className="p-1 hover:text-destructive" title="Delete"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
            {posts.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">No blog posts yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ─── Blog Post Form ─── */
const BlogPostForm = ({ post, onClose, onSaved }: { post: BlogPost | null; onClose: () => void; onSaved: () => void }) => {
  const [form, setForm] = useState({
    title: post?.title || "", slug: post?.slug || "", excerpt: post?.excerpt || "",
    content: post?.content || "", category: post?.category || "Heritage", published: post?.published || false,
  });
  const [coverImage, setCoverImage] = useState<string | null>(post?.cover_image || null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const autoSlug = form.slug || form.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) { toast.error("Only JPG, PNG, WEBP"); return; }
    if (file.size > MAX_FILE_SIZE) { toast.error("Max 5MB"); return; }
    setUploading(true);
    const path = `${autoSlug}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "")}`;
    const { error } = await supabase.storage.from("blog-images").upload(path, file, { upsert: false });
    if (error) { toast.error("Upload failed"); setUploading(false); return; }
    const { data: urlData } = supabase.storage.from("blog-images").getPublicUrl(path);
    setCoverImage(urlData.publicUrl);
    setUploading(false);
  };

  const removeCover = async () => {
    if (coverImage) {
      const match = coverImage.match(/blog-images\/(.+)$/);
      if (match) await supabase.storage.from("blog-images").remove([match[1]]);
    }
    setCoverImage(null);
  };

  const handleSave = async () => {
    if (!form.title) { toast.error("Title required"); return; }
    setSaving(true);
    try {
      const wasPublished = post?.published || false;
      const nowPublishing = form.published && !wasPublished;
      const data = {
        title: form.title, slug: autoSlug, excerpt: form.excerpt || null,
        content: form.content || null, category: form.category, cover_image: coverImage,
        published: form.published,
        published_at: nowPublishing ? new Date().toISOString() : (post?.published_at || (form.published ? new Date().toISOString() : null)),
      };
      if (post) {
        const { error } = await supabase.from("blog_posts").update(data).eq("id", post.id);
        if (error) throw error;
        toast.success("Post updated");
      } else {
        const { error } = await supabase.from("blog_posts").insert(data);
        if (error) throw error;
        toast.success("Post created");
      }
      onSaved();
    } catch (err) { console.error(err); toast.error("Failed to save"); } finally { setSaving(false); }
  };

  const inputClass = "w-full border rounded px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring";

  return (
    <div className="border rounded-lg p-4 mb-6 bg-accent/10">
      <h3 className="font-serif text-lg font-semibold mb-4">{post ? "Edit Post" : "New Post"}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Post Title *</label>
          <input placeholder="e.g. The Art of Chikankari Embroidery" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className={inputClass} />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">URL Path <span className="text-[10px] text-muted-foreground/60">(auto-generated)</span></label>
          <input placeholder="auto-generated" value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value }))} className={inputClass} />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Category</label>
          <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className={inputClass}>
            {BLOG_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <input type="checkbox" id="published" checked={form.published} onChange={e => setForm(p => ({ ...p, published: e.target.checked }))} className="accent-primary" />
            <label htmlFor="published" className="text-sm cursor-pointer font-medium">{form.published ? "Published (visible to visitors)" : "Draft (hidden)"}</label>
          </div>
          {post?.slug && (
            <button type="button" onClick={() => window.open(`/blog/${autoSlug}`, "_blank")} className="flex items-center gap-1 text-xs text-primary hover:underline">
              <Eye className="h-3 w-3" /> Preview
            </button>
          )}
        </div>
      </div>
      <div className="mt-3">
        <label className="text-xs font-medium text-muted-foreground mb-1 block">Short Summary <span className="text-[10px] text-muted-foreground/60">(max 200 chars — shown on blog listing)</span></label>
        <textarea placeholder="A brief summary of the post..." maxLength={200} value={form.excerpt} onChange={e => setForm(p => ({ ...p, excerpt: e.target.value }))} className={`${inputClass} h-16 resize-none`} />
      </div>
      <div className="mt-3">
        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Content</label>
        <RichTextEditor
          content={form.content}
          onChange={(html) => setForm(p => ({ ...p, content: html }))}
          placeholder="Write your blog post here... Use the toolbar to add headings, images, and formatting."
          bucket="blog-images"
          pathPrefix={`${autoSlug}/content`}
        />
      </div>

      <div className="mt-3">
        <label className="text-sm font-medium block mb-1.5">Cover Image</label>
        {coverImage ? (
          <div className="relative inline-block">
            <img src={coverImage} alt="Cover" className="w-40 h-24 object-cover rounded border" />
            <button type="button" onClick={removeCover} className="absolute top-0.5 right-0.5 bg-background/80 rounded-full p-0.5"><X className="h-3 w-3" /></button>
          </div>
        ) : (
          <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 border rounded hover:bg-accent disabled:opacity-50">
            {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
            {uploading ? "Uploading..." : "Upload Cover"}
          </button>
        )}
        <input ref={fileRef} type="file" accept=".jpg,.jpeg,.png,.webp" className="hidden" onChange={handleCoverUpload} />
      </div>

      <div className="flex gap-2 mt-4">
        <Button size="sm" onClick={handleSave} disabled={saving || uploading}>{saving ? "Saving..." : "Save"}</Button>
        <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
      </div>
    </div>
  );
};

export default AdminBlog;
