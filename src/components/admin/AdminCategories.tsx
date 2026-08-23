import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Plus, Pencil, Trash2, Check, X, Tag, AlertTriangle } from "lucide-react";
import { useCategories, type Category } from "@/hooks/useCategories";

function slugify(str: string) {
  return str.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

/* ── Inline edit row ── */
function EditRow({
  cat,
  onDone,
}: {
  cat: Category;
  onDone: () => void;
}) {
  const [name, setName] = useState(cat.name);
  const [desc, setDesc] = useState(cat.description);
  const [saving, setSaving] = useState(false);
  const qc = useQueryClient();

  const save = async () => {
    if (!name.trim()) { toast.error("Name is required"); return; }
    setSaving(true);
    const { error } = await supabase
      .from("categories")
      .update({ name: name.trim(), slug: slugify(name), description: desc.trim(), updated_at: new Date().toISOString() })
      .eq("id", cat.id);
    if (error) { toast.error("Failed to update category"); }
    else { toast.success("Category updated"); qc.invalidateQueries({ queryKey: ["categories"] }); onDone(); }
    setSaving(false);
  };

  return (
    <tr className="bg-accent/30">
      <td className="p-3">
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full border border-border rounded-lg px-2.5 py-1.5 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring"
          autoFocus
        />
      </td>
      <td className="p-3 text-xs text-muted-foreground">{slugify(name)}</td>
      <td className="p-3">
        <input
          value={desc}
          onChange={e => setDesc(e.target.value)}
          placeholder="Short description (optional)"
          className="w-full border border-border rounded-lg px-2.5 py-1.5 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </td>
      <td className="p-3">
        <div className="flex items-center gap-2">
          <button onClick={save} disabled={saving} className="p-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
          </button>
          <button onClick={onDone} className="p-1.5 rounded-lg hover:bg-accent">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
}

/* ── Main component ── */
const AdminCategories = () => {
  const { data: categories = [], isLoading } = useCategories();
  const qc = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [productCounts, setProductCounts] = useState<Record<string, number>>({});

  // Add form state
  const [addName, setAddName] = useState("");
  const [addDesc, setAddDesc] = useState("");
  const [adding, setAdding] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  const handleAdd = async () => {
    if (!addName.trim()) { toast.error("Name is required"); return; }
    setAdding(true);
    const { error } = await supabase.from("categories").insert({
      name: addName.trim(),
      slug: slugify(addName),
      description: addDesc.trim(),
      sort_order: categories.length + 1,
    });
    if (error) {
      toast.error(error.message.includes("unique") ? "A category with this name already exists" : "Failed to add category");
    } else {
      toast.success(`"${addName.trim()}" added`);
      qc.invalidateQueries({ queryKey: ["categories"] });
      setAddName(""); setAddDesc(""); setShowAdd(false);
    }
    setAdding(false);
  };

  const confirmDelete = async (cat: Category) => {
    // Check how many products use this category
    const { count } = await supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("craft_type", cat.name);
    setProductCounts(prev => ({ ...prev, [cat.id]: count ?? 0 }));
    setDeletingId(cat.id);
  };

  const handleDelete = async (cat: Category) => {
    const { error } = await supabase.from("categories").delete().eq("id", cat.id);
    if (error) { toast.error("Failed to delete category"); }
    else { toast.success(`"${cat.name}" deleted`); qc.invalidateQueries({ queryKey: ["categories"] }); }
    setDeletingId(null);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-serif text-xl font-semibold">Product Categories</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Categories appear as filters on the Shop page and in the product editor.
          </p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 bg-primary text-primary-foreground rounded-full px-5 py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Category
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="border border-border rounded-xl p-4 mb-5 bg-accent/20">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">New Category</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Name *</label>
              <input
                value={addName}
                onChange={e => setAddName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleAdd()}
                placeholder="e.g. Summer Collection"
                autoFocus
                className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring"
              />
              {addName && (
                <p className="text-xs text-muted-foreground mt-1">Slug: {slugify(addName)}</p>
              )}
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Description (optional)</label>
              <input
                value={addDesc}
                onChange={e => setAddDesc(e.target.value)}
                placeholder="Short description"
                className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleAdd}
              disabled={adding || !addName.trim()}
              className="flex items-center gap-1.5 bg-primary text-primary-foreground rounded-full px-5 py-2 text-sm font-medium disabled:opacity-50 hover:bg-primary/90 transition-colors"
            >
              {adding ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
              Add
            </button>
            <button onClick={() => { setShowAdd(false); setAddName(""); setAddDesc(""); }} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Categories table */}
      <div className="border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 border-b border-border">
            <tr>
              <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Name</th>
              <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Slug</th>
              <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide hidden sm:table-cell">Description</th>
              <th className="p-3 w-24"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {categories.map(cat => (
              editingId === cat.id ? (
                <EditRow key={cat.id} cat={cat} onDone={() => setEditingId(null)} />
              ) : (
                <tr key={cat.id} className="hover:bg-accent/20 transition-colors">
                  <td className="p-3 font-medium">
                    <div className="flex items-center gap-2">
                      <Tag className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      {cat.name}
                    </div>
                  </td>
                  <td className="p-3 text-xs text-muted-foreground font-mono">{cat.slug}</td>
                  <td className="p-3 text-sm text-muted-foreground hidden sm:table-cell">
                    {cat.description || <span className="italic opacity-40">No description</span>}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setEditingId(cat.id)}
                        className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                        title="Edit"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => confirmDelete(cat)}
                        className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-destructive transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={4} className="p-12 text-center text-muted-foreground">
                  <Tag className="h-8 w-8 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No categories yet</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Delete confirmation dialog */}
      {deletingId && (() => {
        const cat = categories.find(c => c.id === deletingId)!;
        const count = productCounts[deletingId] ?? 0;
        return (
          <div className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center p-4">
            <div className="bg-background rounded-2xl shadow-2xl w-full max-w-sm p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="p-2 bg-destructive/10 rounded-lg shrink-0">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <h3 className="font-medium text-sm">Delete "{cat.name}"?</h3>
                  {count > 0 ? (
                    <p className="text-sm text-muted-foreground mt-1">
                      <span className="font-medium text-foreground">{count} product{count !== 1 ? "s" : ""}</span> currently use this category.
                      They won't be deleted, but their category label will be orphaned until reassigned.
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground mt-1">No products use this category. Safe to delete.</p>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-end gap-2">
                <button onClick={() => setDeletingId(null)} className="text-sm text-muted-foreground hover:text-foreground px-4 py-2 transition-colors">
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(cat)}
                  className="bg-destructive text-destructive-foreground rounded-full px-5 py-2 text-sm font-medium hover:bg-destructive/90 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default AdminCategories;
