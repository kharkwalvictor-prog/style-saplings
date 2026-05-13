import { useState, useRef } from "react";
import { useProducts, DbProduct } from "@/hooks/useProducts";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, Plus, Pencil, Trash2, X, Upload, GripVertical, ChevronDown, ChevronUp, Copy, Eye, HelpCircle } from "lucide-react";
import RichTextEditor from "./RichTextEditor";
import { format } from "date-fns";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_IMAGES = 5;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALL_SIZES = ["2Y", "3Y", "4Y", "5Y"];

const AdminProducts = () => {
  const { data: products = [], isLoading } = useProducts();
  const qc = useQueryClient();
  const [editing, setEditing] = useState<DbProduct | null>(null);
  const [creating, setCreating] = useState(false);

  const handleDuplicate = (p: DbProduct) => {
    const dup = { ...p, name: `${p.name} (Copy)`, slug: `${p.slug}-copy`, id: undefined, images: [...(p.images || [])] } as any;
    setEditing(dup as DbProduct);
    setCreating(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) { toast.error("Failed to delete"); return; }
    toast.success("Product deleted");
    qc.invalidateQueries({ queryKey: ["products"] });
  };

  const updateStock = async (id: string, count: number) => {
    const status = count <= 0 ? "out_of_stock" : count <= 5 ? "low_stock" : "in_stock";
    await supabase.from("products").update({ stock_count: count, stock_status: status } as any).eq("id", id);
    qc.invalidateQueries({ queryKey: ["products"] });
    toast.success("Stock updated");
  };

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-serif text-xl font-semibold">Inventory ({products.length})</h2>
        <Button size="sm" onClick={() => { setCreating(true); setEditing(null); }}><Plus className="h-4 w-4 mr-1" /> Add Product</Button>
      </div>

      {(creating || editing) && (
        <ProductForm product={editing} onClose={() => { setEditing(null); setCreating(false); }}
          onSaved={() => { setEditing(null); setCreating(false); qc.invalidateQueries({ queryKey: ["products"] }); }} />
      )}

      <div className="border rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-accent/30"><tr>
            <th className="text-left p-3 font-medium">Name</th>
            <th className="text-left p-3 font-medium">Craft</th>
            <th className="text-left p-3 font-medium">Price</th>
            <th className="text-left p-3 font-medium">Stock</th>
            <th className="text-left p-3 font-medium">Count</th>
            <th className="text-left p-3 font-medium">Supplier</th>
            <th className="text-right p-3 font-medium">Actions</th>
          </tr></thead>
          <tbody>
            {products.map(p => {
              const prod = p as any;
              return (
                <tr key={p.id} className="border-t hover:bg-accent/10">
                  <td className="p-3 font-medium">{p.name}</td>
                  <td className="p-3 text-xs">{p.craft_type}</td>
                  <td className="p-3">₹{Number(p.price).toLocaleString("en-IN")}</td>
                  <td className="p-3">
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      p.stock_status === "in_stock" ? "bg-green-100 text-green-700" :
                      p.stock_status === "low_stock" ? "bg-yellow-100 text-yellow-700" :
                      "bg-red-100 text-red-700"
                    }`}>{p.stock_status === "in_stock" ? "In Stock" : p.stock_status === "low_stock" ? "Low Stock" : "Out of Stock"}</span>
                  </td>
                  <td className="p-3">
                    <input type="number" defaultValue={prod.stock_count || 0} min={0}
                      className="w-16 border rounded px-2 py-1 text-xs bg-background"
                      onBlur={e => updateStock(p.id, parseInt(e.target.value) || 0)} />
                  </td>
                  <td className="p-3 text-xs text-muted-foreground max-w-[150px] truncate">{prod.supplier_notes || "-"}</td>
                  <td className="p-3 text-right space-x-1">
                    <button onClick={() => { setEditing(p); setCreating(false); }} className="p-1 hover:text-primary" title="Edit"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => handleDuplicate(p)} className="p-1 hover:text-primary" title="Duplicate"><Copy className="h-4 w-4" /></button>
                    <button onClick={() => window.open(`/product/${p.slug}`, "_blank")} className="p-1 hover:text-primary" title="Preview on site"><Eye className="h-4 w-4" /></button>
                    <button onClick={() => handleDelete(p.id)} className="p-1 hover:text-destructive" title="Delete"><Trash2 className="h-4 w-4" /></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <RestockHistory />
    </div>
  );
};

/* ─── Restock History ─── */
const RestockHistory = () => {
  const [open, setOpen] = useState(false);

  const { data: history = [], isLoading } = useQuery({
    queryKey: ["restock-history"],
    queryFn: async () => {
      const { data } = await supabase.from("restock_history").select("*").order("created_at", { ascending: false }).limit(30);
      return data || [];
    },
    enabled: open,
  });

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const monthCount = history.filter((h: any) => h.created_at >= monthStart).length;

  return (
    <div className="mt-6 border rounded-lg">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-4 hover:bg-accent/30 transition-colors">
        <h3 className="font-serif text-lg font-semibold">Restock History</h3>
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>
      {open && (
        <div className="border-t p-4">
          <p className="text-xs text-muted-foreground mb-3">{monthCount} restock event{monthCount !== 1 ? "s" : ""} this month</p>
          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : history.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm py-4">No restock history yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-accent/30"><tr>
                  <th className="text-left p-2 font-medium">Date & Time</th>
                  <th className="text-left p-2 font-medium">Product</th>
                  <th className="text-left p-2 font-medium">Change</th>
                  <th className="text-left p-2 font-medium">Updated by</th>
                </tr></thead>
                <tbody>
                  {history.map((h: any) => {
                    const isIncrease = h.new_count > h.old_count;
                    const isZero = h.new_count === 0;
                    const changeColor = isZero ? "text-destructive" : isIncrease ? "text-green-600" : "text-orange-600";
                    const arrow = isIncrease ? "↑" : "↓";
                    return (
                      <tr key={h.id} className="border-t">
                        <td className="p-2 text-xs text-muted-foreground whitespace-nowrap">{format(new Date(h.created_at), "dd MMM yyyy, hh:mm a")}</td>
                        <td className="p-2 font-medium">{h.product_name}</td>
                        <td className={`p-2 font-mono text-xs ${changeColor}`}>
                          {arrow} {h.old_count} → {h.new_count}{isZero ? " (Out of Stock)" : " units"}
                        </td>
                        <td className="p-2 text-xs text-muted-foreground">{h.updated_by || "admin"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* ─── Product Form ─── */
interface ProductFormProps {
  product: DbProduct | null;
  onClose: () => void;
  onSaved: () => void;
}

const ProductForm = ({ product, onClose, onSaved }: ProductFormProps) => {
  const prod = product as any;
  const [form, setForm] = useState({
    name: product?.name || "",
    slug: product?.slug || "",
    description: product?.description || "",
    price: product?.price?.toString() || "",
    sale_price: product?.sale_price?.toString() || "",
    craft_type: product?.craft_type || "Chikankari",
    sizes: product?.sizes || [...ALL_SIZES],
    stock_status: product?.stock_status || "in_stock",
    category: product?.category || "",
    is_featured: prod?.is_featured || false,
    stock_count: prod?.stock_count?.toString() || "0",
    low_stock_threshold: prod?.low_stock_threshold?.toString() || "5",
    supplier_notes: prod?.supplier_notes || "",
  });
  const [images, setImages] = useState<string[]>(product?.images || []);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const slug = form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const uploadFile = async (file: File) => {
    if (!ACCEPTED_TYPES.includes(file.type)) { toast.error(`${file.name}: Only JPG, PNG, WEBP`); return null; }
    if (file.size > MAX_FILE_SIZE) { toast.error(`${file.name}: Max 5MB`); return null; }
    const path = `${slug}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "")}`;
    const { error } = await supabase.storage.from("product-images").upload(path, file, { upsert: false });
    if (error) { toast.error(`Upload failed: ${file.name}`); return null; }
    const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(path);
    return urlData.publicUrl;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const remaining = MAX_IMAGES - images.length;
    if (remaining <= 0) { toast.error(`Max ${MAX_IMAGES} images`); return; }
    const batch = files.slice(0, remaining);
    setUploading(true);
    const urls: string[] = [];
    for (const file of batch) { const url = await uploadFile(file); if (url) urls.push(url); }
    if (urls.length) setImages(prev => [...prev, ...urls]);
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const removeImage = async (idx: number) => {
    const url = images[idx];
    const match = url.match(/product-images\/(.+)$/);
    if (match) await supabase.storage.from("product-images").remove([match[1]]);
    setImages(prev => prev.filter((_, i) => i !== idx));
  };

  const handleDragStart = (idx: number) => setDragIdx(idx);
  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === idx) return;
    setImages(prev => { const next = [...prev]; const [moved] = next.splice(dragIdx, 1); next.splice(idx, 0, moved); return next; });
    setDragIdx(idx);
  };
  const handleDragEnd = () => setDragIdx(null);

  const toggleSize = (size: string) => {
    setForm(prev => ({ ...prev, sizes: prev.sizes.includes(size) ? prev.sizes.filter(s => s !== size) : [...prev.sizes, size] }));
  };

  const handleSave = async () => {
    if (!form.name || !form.price) { toast.error("Name and price required"); return; }
    setSaving(true);
    try {
      const stockCount = parseInt(form.stock_count) || 0;
      const data = {
        name: form.name, slug, description: form.description,
        price: parseFloat(form.price), sale_price: form.sale_price ? parseFloat(form.sale_price) : null,
        craft_type: form.craft_type as DbProduct["craft_type"], sizes: form.sizes,
        stock_status: form.stock_status as DbProduct["stock_status"],
        category: form.category || null, images, is_featured: form.is_featured,
        stock_count: stockCount, low_stock_threshold: parseInt(form.low_stock_threshold) || 5,
        supplier_notes: form.supplier_notes || null,
      };
      if (product) {
        const { error } = await supabase.from("products").update(data as any).eq("id", product.id);
        if (error) throw error;
        toast.success("Product updated");
      } else {
        const { error } = await supabase.from("products").insert(data as any);
        if (error) throw error;
        toast.success("Product created");
      }
      onSaved();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save product");
    } finally { setSaving(false); }
  };

  const u = (f: string, v: string) => setForm(prev => ({ ...prev, [f]: v }));
  const inputClass = "w-full border rounded px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring";

  return (
    <div className="border rounded-lg p-4 mb-6 bg-accent/10">
      <h3 className="font-serif text-lg font-semibold mb-4">{product ? "Edit Product" : "New Product"}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Product Name *</label>
          <input placeholder="e.g. Azure Chikankari Kurta Set" value={form.name} onChange={e => u("name", e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block flex items-center gap-1">
            URL Path <span className="text-[10px] text-muted-foreground/60">(auto-generated from name)</span>
          </label>
          <input placeholder="auto-generated" value={form.slug} onChange={e => u("slug", e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Price (₹) *</label>
          <input placeholder="999" type="number" value={form.price} onChange={e => u("price", e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Sale Price (₹) <span className="text-[10px] text-muted-foreground/60">Leave empty if no sale</span></label>
          <input placeholder="Optional" type="number" value={form.sale_price} onChange={e => u("sale_price", e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Craft Type</label>
          <select value={form.craft_type} onChange={e => u("craft_type", e.target.value)} className={inputClass}>
            <option value="Chikankari">Chikankari</option><option value="Bandhani">Bandhani</option><option value="Firan">Firan</option><option value="Festive">Festive</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Availability</label>
          <select value={form.stock_status} onChange={e => u("stock_status", e.target.value)} className={inputClass}>
            <option value="in_stock">In Stock</option><option value="low_stock">Low Stock</option><option value="out_of_stock">Out of Stock</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Category</label>
          <input placeholder="e.g. Sets, Tunics" value={form.category} onChange={e => u("category", e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Quantity in Stock</label>
          <input placeholder="0" type="number" value={form.stock_count} onChange={e => u("stock_count", e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block flex items-center gap-1">
            Low Stock Alert
            <span className="text-[10px] text-muted-foreground/60">(alert when stock drops below this)</span>
          </label>
          <input placeholder="5" type="number" value={form.low_stock_threshold} onChange={e => u("low_stock_threshold", e.target.value)} className={inputClass} />
        </div>
      </div>

      <div className="mt-3">
        <label className="text-sm font-medium block mb-1.5">Sizes</label>
        <div className="flex gap-3">
          {ALL_SIZES.map(size => (
            <label key={size} className="flex items-center gap-1.5 text-sm cursor-pointer">
              <input type="checkbox" checked={form.sizes.includes(size)} onChange={() => toggleSize(size)} className="accent-primary" />{size}
            </label>
          ))}
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <input type="checkbox" id="is_featured" checked={form.is_featured} onChange={e => setForm(prev => ({ ...prev, is_featured: e.target.checked }))} className="accent-primary" />
        <label htmlFor="is_featured" className="text-sm cursor-pointer">Featured on Homepage</label>
      </div>

      <textarea placeholder="Supplier Notes (internal only — not shown to customers)" value={form.supplier_notes}
        onChange={e => u("supplier_notes", e.target.value)} className={`${inputClass} mt-3 h-16 resize-none`} />

      {/* Rich Text Description */}
      <div className="mt-4">
        <label className="text-sm font-medium block mb-1.5">Product Description</label>
        <RichTextEditor
          content={form.description}
          onChange={(html) => u("description", html)}
          placeholder="Describe the product — fabric, fit, occasion, care instructions..."
          bucket="product-images"
          pathPrefix={`${slug}/content`}
        />
      </div>

      {/* Image Upload */}
      <div className="mt-4 space-y-3">
        <label className="text-sm font-medium block">Product Images ({images.length}/{MAX_IMAGES})</label>
        {/* Drag & drop zone */}
        {images.length < MAX_IMAGES && (
          <div
            onClick={() => fileRef.current?.click()}
            onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add("border-primary", "bg-primary/5"); }}
            onDragLeave={e => { e.currentTarget.classList.remove("border-primary", "bg-primary/5"); }}
            onDrop={e => {
              e.preventDefault();
              e.currentTarget.classList.remove("border-primary", "bg-primary/5");
              const dt = new DataTransfer();
              Array.from(e.dataTransfer.files).forEach(f => dt.items.add(f));
              if (fileRef.current) { fileRef.current.files = dt.files; fileRef.current.dispatchEvent(new Event("change", { bubbles: true })); }
            }}
            className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all"
          >
            {uploading ? (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Uploading...</div>
            ) : (
              <>
                <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm font-medium">Drag photos here or click to upload</p>
                <p className="text-xs text-muted-foreground mt-1">JPG, PNG or WEBP — max 5MB each</p>
              </>
            )}
          </div>
        )}
        <input ref={fileRef} type="file" accept=".jpg,.jpeg,.png,.webp" multiple className="hidden" onChange={handleFileSelect} />
        {images.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {images.map((url, idx) => (
              <div key={url} draggable onDragStart={() => handleDragStart(idx)} onDragOver={e => handleDragOver(e, idx)} onDragEnd={handleDragEnd}
                className={`relative group w-20 h-20 border rounded overflow-hidden cursor-grab ${dragIdx === idx ? "opacity-50 ring-2 ring-primary" : ""} ${idx === 0 ? "ring-2 ring-secondary" : ""}`}>
                <img src={url} alt={`Product ${idx + 1}`} className="w-full h-full object-cover" />
                <button type="button" onClick={() => removeImage(idx)} className="absolute top-0.5 right-0.5 bg-background/80 rounded-full p-0.5 opacity-0 group-hover:opacity-100"><X className="h-3 w-3" /></button>
                {idx === 0 && <span className="absolute bottom-0 left-0 right-0 bg-secondary/80 text-[9px] text-center text-white py-0.5">Cover</span>}
                <GripVertical className="absolute top-0.5 left-0.5 h-3 w-3 text-white/70 opacity-0 group-hover:opacity-100 drop-shadow" />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-2 mt-4">
        <Button size="sm" onClick={handleSave} disabled={saving || uploading}>{saving ? "Saving..." : "Save"}</Button>
        <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
      </div>
    </div>
  );
};

export default AdminProducts;
