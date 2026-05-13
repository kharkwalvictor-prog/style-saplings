import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Save, FileText } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

interface ContentItem {
  id: string;
  key: string;
  value: string;
  section: string;
  label: string;
  field_type: string;
  sort_order: number;
}

const sections = ["Homepage", "About", "Footer", "Announcement"];

const AdminContent = () => {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState("Homepage");
  const [changes, setChanges] = useState<Record<string, string>>({});
  const queryClient = useQueryClient();

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("site_content")
      .select("*")
      .order("sort_order");

    if (error) {
      toast.error("Failed to load content");
      console.error(error);
    } else {
      setItems(data || []);
    }
    setLoading(false);
  };

  const handleChange = (key: string, value: string) => {
    setChanges(prev => ({ ...prev, [key]: value }));
  };

  const getValue = (item: ContentItem) => {
    return changes[item.key] !== undefined ? changes[item.key] : item.value;
  };

  const handleSave = async () => {
    if (Object.keys(changes).length === 0) {
      toast.info("No changes to save");
      return;
    }

    setSaving(true);
    try {
      const updates = Object.entries(changes).map(([key, value]) =>
        supabase
          .from("site_content")
          .update({ value, updated_at: new Date().toISOString() })
          .eq("key", key)
      );

      const results = await Promise.all(updates);
      const errors = results.filter((r: any) => r.error);

      if (errors.length > 0) {
        toast.error(`Failed to save ${errors.length} items`);
        console.error(errors);
      } else {
        toast.success("Content saved successfully");
        setChanges({});
        // Invalidate the frontend cache so pages pick up new content
        queryClient.invalidateQueries({ queryKey: ["site-content"] });
        loadContent();
      }
    } catch (err) {
      toast.error("Failed to save content");
      console.error(err);
    }
    setSaving(false);
  };

  const filteredItems = items.filter(item => item.section === activeSection);
  const hasChanges = Object.keys(changes).length > 0;

  if (loading) {
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
          <h2 className="font-serif text-xl font-semibold">Site Content</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Edit text that appears on the website. Changes go live after saving.
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving || !hasChanges}
          className="rounded-full"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {/* Section tabs */}
      <div className="flex gap-1 mb-6 border-b border-border">
        {sections.map(section => (
          <button
            key={section}
            onClick={() => setActiveSection(section)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors relative ${
              activeSection === section
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {section}
            {activeSection === section && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Content fields */}
      <div className="space-y-5">
        {filteredItems.map(item => (
          <div key={item.key} className="border rounded-xl p-4">
            <label className="text-xs font-medium text-muted-foreground mb-2 block uppercase tracking-wide">
              {item.label || item.key}
            </label>
            {item.field_type === "textarea" ? (
              <textarea
                value={getValue(item)}
                onChange={e => handleChange(item.key, e.target.value)}
                rows={4}
                className="w-full border rounded-lg px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring resize-none"
              />
            ) : (
              <input
                value={getValue(item)}
                onChange={e => handleChange(item.key, e.target.value)}
                className="w-full border rounded-lg px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring"
              />
            )}
            {changes[item.key] !== undefined && (
              <p className="text-xs text-primary mt-1">Modified — save to publish</p>
            )}
          </div>
        ))}

        {filteredItems.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="h-8 w-8 mx-auto mb-3 opacity-40" />
            <p className="text-sm">No content items in this section</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminContent;
