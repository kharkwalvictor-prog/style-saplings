import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Loader2, Save, FileText, ImageIcon, Upload, X, Trash2, Info,
} from "lucide-react";
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

const sections = ["Homepage", "About", "Footer", "Announcement", "Images"];

/* ── Image slot metadata ─────────────────────────────────────────────── */
const IMAGE_SLOTS: Record<string, {
  idealDims: string;
  aspectRatio: number;
  aspectLabel: string;
  where: string;
}> = {
  logo_image: {
    idealDims: "600 × 180 px",
    aspectRatio: 600 / 180,
    aspectLabel: "~3:1 landscape",
    where: "Header (top of every page) and mobile menu — transparent PNG works best",
  },
  hero_image: {
    idealDims: "1920 × 1080 px",
    aspectRatio: 16 / 9,
    aspectLabel: "16:9 landscape",
    where: "Homepage full-screen hero banner",
  },
  craft_image_1: {
    idealDims: "1200 × 1600 px",
    aspectRatio: 3 / 4,
    aspectLabel: "3:4 portrait",
    where: "Chikankari — homepage tiles, editorial pair, shop hero",
  },
  craft_image_2: {
    idealDims: "1200 × 1600 px",
    aspectRatio: 3 / 4,
    aspectLabel: "3:4 portrait",
    where: "Bandhani — homepage tiles, heritage banner, shop hero",
  },
  craft_image_3: {
    idealDims: "1200 × 1600 px",
    aspectRatio: 3 / 4,
    aspectLabel: "3:4 portrait",
    where: "Firan — homepage tiles, editorial pair, shop hero",
  },
  craft_image_4: {
    idealDims: "1200 × 1600 px",
    aspectRatio: 3 / 4,
    aspectLabel: "3:4 portrait",
    where: "Festive — homepage tiles, spotlight section, shop hero",
  },
};

/* ══════════════════════════════════════════════════════════════════════
   IMAGE CROP MODAL
   ══════════════════════════════════════════════════════════════════════ */
interface CropState { x: number; y: number; w: number; h: number; }

function ImageCropModal({
  src,
  originalFile,
  aspectRatio,
  label,
  onComplete,
  onCancel,
}: {
  src: string;
  originalFile: File;
  aspectRatio: number;
  label: string;
  onComplete: (blob: Blob) => void;
  onCancel: () => void;
}) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<CropState>({ x: 0, y: 0, w: 0, h: 0 });
  const [imgRect, setImgRect] = useState({ w: 0, h: 0, natW: 0, natH: 0 });
  const drag = useRef<{
    type: string;
    sx: number; sy: number;
    c0: CropState;
  } | null>(null);

  const initCrop = () => {
    const img = imgRef.current;
    if (!img) return;
    const w = img.clientWidth;
    const h = img.clientHeight;
    setImgRect({ w, h, natW: img.naturalWidth, natH: img.naturalHeight });
    // Start crop covering 85% centred
    let cw = w * 0.85;
    let ch = cw / aspectRatio;
    if (ch > h * 0.85) { ch = h * 0.85; cw = ch * aspectRatio; }
    const cx = (w - cw) / 2;
    const cy = (h - ch) / 2;
    setCrop({ x: cx, y: cy, w: cw, h: ch });
  };

  const onPointerDown = (e: React.PointerEvent, type: string) => {
    e.stopPropagation();
    (e.target as Element).setPointerCapture(e.pointerId);
    drag.current = { type, sx: e.clientX, sy: e.clientY, c0: { ...crop } };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    const { type, sx, sy, c0 } = drag.current;
    const dx = e.clientX - sx;
    const dy = e.clientY - sy;
    let { x, y, w, h } = c0;

    if (type === "move") {
      x = Math.max(0, Math.min(imgRect.w - w, x + dx));
      y = Math.max(0, Math.min(imgRect.h - h, y + dy));
    } else if (type === "se") {
      w = Math.max(50, Math.min(imgRect.w - x, w + dx));
      h = w / aspectRatio;
      if (y + h > imgRect.h) { h = imgRect.h - y; w = h * aspectRatio; }
    } else if (type === "sw") {
      const nw = Math.max(50, w - dx);
      const nh = nw / aspectRatio;
      if (x + w - nw >= 0 && y + nh <= imgRect.h) { x = x + w - nw; w = nw; h = nh; }
    } else if (type === "ne") {
      const nw = Math.max(50, w + dx);
      const nh = nw / aspectRatio;
      if (y + h - nh >= 0 && x + nw <= imgRect.w) { y = y + h - nh; w = nw; h = nh; }
    } else if (type === "nw") {
      const nw = Math.max(50, w - dx);
      const nh = nw / aspectRatio;
      if (x + w - nw >= 0 && y + h - nh >= 0) { x = x + w - nw; y = y + h - nh; w = nw; h = nh; }
    }
    setCrop({ x, y, w, h });
  };

  const onPointerUp = () => { drag.current = null; };

  const applyAndUpload = () => {
    const img = imgRef.current;
    if (!img || !imgRect.w) return;
    const scaleX = imgRect.natW / imgRect.w;
    const scaleY = imgRect.natH / imgRect.h;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(crop.w * scaleX);
    canvas.height = Math.round(crop.h * scaleY);
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(
      img,
      crop.x * scaleX, crop.y * scaleY,
      canvas.width, canvas.height,
      0, 0, canvas.width, canvas.height,
    );
    canvas.toBlob(blob => { if (blob) onComplete(blob); }, "image/jpeg", 0.92);
  };

  const uploadOriginal = () => {
    onComplete(originalFile);
  };

  const corners = [
    { type: "nw", top: -5, left: -5, cursor: "nw-resize" },
    { type: "ne", top: -5, right: -5, cursor: "ne-resize" },
    { type: "sw", bottom: -5, left: -5, cursor: "sw-resize" },
    { type: "se", bottom: -5, right: -5, cursor: "se-resize" },
  ] as const;

  return (
    <div className="fixed inset-0 z-[200] bg-black/85 flex items-center justify-center p-4">
      <div className="bg-background rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-border flex items-start justify-between shrink-0">
          <div>
            <h3 className="font-medium text-sm">Crop Image — {label}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Drag the box to move &middot; Drag corners to resize &middot; Aspect ratio is locked
            </p>
          </div>
          <button onClick={onCancel} className="p-1.5 hover:bg-accent rounded-lg ml-4 shrink-0">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Crop area */}
        <div className="p-4 overflow-auto">
          <div
            className="relative select-none rounded-lg overflow-hidden bg-black mx-auto"
            style={{ maxHeight: 460 }}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
          >
            <img
              ref={imgRef}
              src={src}
              alt="Crop preview"
              className="block w-full object-contain"
              style={{ maxHeight: 460 }}
              onLoad={initCrop}
              draggable={false}
            />

            {/* Semi-transparent overlay with crop hole */}
            {imgRect.w > 0 && (
              <svg
                className="absolute inset-0 pointer-events-none"
                width={imgRect.w}
                height={imgRect.h}
                style={{ width: "100%", height: "100%" }}
                viewBox={`0 0 ${imgRect.w} ${imgRect.h}`}
                preserveAspectRatio="none"
              >
                <defs>
                  <mask id="crop-hole">
                    <rect width={imgRect.w} height={imgRect.h} fill="white" />
                    <rect x={crop.x} y={crop.y} width={crop.w} height={crop.h} fill="black" />
                  </mask>
                </defs>
                <rect
                  width={imgRect.w} height={imgRect.h}
                  fill="rgba(0,0,0,0.55)"
                  mask="url(#crop-hole)"
                />
                {/* Rule-of-thirds grid lines */}
                <line x1={crop.x + crop.w / 3} y1={crop.y} x2={crop.x + crop.w / 3} y2={crop.y + crop.h} stroke="rgba(255,255,255,0.25)" strokeWidth="0.5" />
                <line x1={crop.x + (crop.w * 2) / 3} y1={crop.y} x2={crop.x + (crop.w * 2) / 3} y2={crop.y + crop.h} stroke="rgba(255,255,255,0.25)" strokeWidth="0.5" />
                <line x1={crop.x} y1={crop.y + crop.h / 3} x2={crop.x + crop.w} y2={crop.y + crop.h / 3} stroke="rgba(255,255,255,0.25)" strokeWidth="0.5" />
                <line x1={crop.x} y1={crop.y + (crop.h * 2) / 3} x2={crop.x + crop.w} y2={crop.y + (crop.h * 2) / 3} stroke="rgba(255,255,255,0.25)" strokeWidth="0.5" />
              </svg>
            )}

            {/* Draggable crop box */}
            {imgRect.w > 0 && (
              <div
                style={{
                  position: "absolute",
                  left: crop.x, top: crop.y,
                  width: crop.w, height: crop.h,
                  border: "1.5px solid rgba(255,255,255,0.85)",
                  cursor: "grab",
                  touchAction: "none",
                }}
                onPointerDown={e => onPointerDown(e, "move")}
              >
                {corners.map(c => (
                  <div
                    key={c.type}
                    style={{
                      position: "absolute",
                      width: 10, height: 10,
                      background: "white",
                      borderRadius: 2,
                      cursor: c.cursor,
                      top: "top" in c ? c.top : undefined,
                      bottom: "bottom" in c ? c.bottom : undefined,
                      left: "left" in c ? c.left : undefined,
                      right: "right" in c ? c.right : undefined,
                    }}
                    onPointerDown={e => onPointerDown(e, c.type)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-border flex items-center justify-between shrink-0 gap-3">
          <button
            onClick={onCancel}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={uploadOriginal}
              className="text-sm border border-border rounded-full px-5 py-2 hover:bg-accent transition-colors"
            >
              Upload Without Crop
            </button>
            <button
              onClick={applyAndUpload}
              className="bg-primary text-primary-foreground rounded-full px-6 py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Crop &amp; Upload
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   IMAGE SLOT CARD
   ══════════════════════════════════════════════════════════════════════ */
function ImageSlotCard({
  item,
  onSaved,
}: {
  item: ContentItem;
  onSaved: () => void;
}) {
  const meta = IMAGE_SLOTS[item.key];
  const [uploading, setUploading] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [cropFile, setCropFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    const url = URL.createObjectURL(file);
    setCropSrc(url);
    setCropFile(file);
  };

  const handleCropComplete = async (blob: Blob) => {
    if (cropSrc) URL.revokeObjectURL(cropSrc);
    setCropSrc(null);
    setCropFile(null);
    setUploading(true);
    try {
      const ext = blob.type === "image/png" ? "png" : "jpg";
      const fileName = `${item.key}-${Date.now()}.${ext}`;
      const { data, error } = await supabase.storage
        .from("site-images")
        .upload(fileName, blob, { contentType: blob.type, upsert: false });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from("site-images")
        .getPublicUrl(data.path);

      const { error: updateError } = await supabase
        .from("site_content")
        .update({ value: publicUrl, updated_at: new Date().toISOString() })
        .eq("key", item.key);

      if (updateError) throw updateError;

      toast.success("Image updated — changes are live");
      onSaved();
    } catch (err) {
      console.error(err);
      toast.error("Upload failed — please try again");
    }
    setUploading(false);
  };

  const handleRemove = async () => {
    setUploading(true);
    const { error } = await supabase
      .from("site_content")
      .update({ value: "", updated_at: new Date().toISOString() })
      .eq("key", item.key);
    if (error) {
      toast.error("Failed to remove image");
    } else {
      toast.success("Image removed — default will be used");
      onSaved();
    }
    setUploading(false);
  };

  const hasImage = !!item.value;

  return (
    <>
      {cropSrc && cropFile && meta && (
        <ImageCropModal
          src={cropSrc}
          originalFile={cropFile}
          aspectRatio={meta.aspectRatio}
          label={item.label}
          onComplete={handleCropComplete}
          onCancel={() => {
            URL.revokeObjectURL(cropSrc);
            setCropSrc(null);
            setCropFile(null);
          }}
        />
      )}

      <div className="border border-border rounded-xl overflow-hidden">
        {/* Image preview */}
        <div
          className="relative bg-muted/40"
          style={{ aspectRatio: meta ? `${Math.round(meta.aspectRatio * 100)} / 100` : "16/9", maxHeight: 220 }}
        >
          {hasImage ? (
            <img
              src={item.value}
              alt={item.label}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground/50 gap-2">
              <ImageIcon className="h-8 w-8" />
              <p className="text-xs">Using default site image</p>
            </div>
          )}

          {uploading && (
            <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}
        </div>

        {/* Details + actions */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <p className="text-sm font-medium">{item.label}</p>
              {meta && (
                <p className="text-xs text-muted-foreground mt-0.5">{meta.where}</p>
              )}
            </div>
            {hasImage && (
              <button
                onClick={handleRemove}
                disabled={uploading}
                className="text-muted-foreground hover:text-destructive transition-colors shrink-0 p-1"
                title="Remove image (reverts to default)"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Dimension hint */}
          {meta && (
            <div className="flex items-start gap-2 bg-muted/50 rounded-lg px-3 py-2 mb-3">
              <Info className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
              <div className="text-xs text-muted-foreground leading-relaxed">
                <span className="font-medium text-foreground">{meta.idealDims}</span>
                {" "}({meta.aspectLabel}) — Upload at this size or larger for best quality.
                The crop tool will lock to the correct ratio automatically.
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full flex items-center justify-center gap-2 border border-border rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-accent transition-colors disabled:opacity-50"
          >
            <Upload className="h-4 w-4" />
            {hasImage ? "Change Image" : "Upload Image"}
          </button>
        </div>
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   ADMIN CONTENT (main export)
   ══════════════════════════════════════════════════════════════════════ */
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

  const getValue = (item: ContentItem) =>
    changes[item.key] !== undefined ? changes[item.key] : item.value;

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
      } else {
        toast.success("Content saved successfully");
        setChanges({});
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
  const isImagesTab = activeSection === "Images";

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
            {isImagesTab
              ? "Upload and replace images shown across the website."
              : "Edit text that appears on the website. Changes go live after saving."}
          </p>
        </div>
        {!isImagesTab && (
          <Button
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className="rounded-full"
          >
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        )}
      </div>

      {/* Section tabs */}
      <div className="flex gap-1 mb-6 border-b border-border overflow-x-auto no-scrollbar">
        {sections.map(section => (
          <button
            key={section}
            onClick={() => setActiveSection(section)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors relative whitespace-nowrap ${
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

      {/* Images tab */}
      {isImagesTab ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredItems.map(item => (
            <ImageSlotCard
              key={item.key}
              item={item}
              onSaved={() => {
                queryClient.invalidateQueries({ queryKey: ["site-content"] });
                loadContent();
              }}
            />
          ))}
          {filteredItems.length === 0 && (
            <div className="col-span-2 text-center py-12 text-muted-foreground">
              <ImageIcon className="h-8 w-8 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No image slots configured</p>
            </div>
          )}
        </div>
      ) : (
        /* Text content fields */
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
      )}
    </div>
  );
};

export default AdminContent;
