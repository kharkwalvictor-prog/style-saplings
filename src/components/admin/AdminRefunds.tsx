import { useState, useMemo, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  processed: "bg-blue-100 text-blue-700",
};

const filterStatuses = ["all", "pending", "approved", "rejected", "processed"];

const AdminRefunds = () => {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<any>(null);

  const { data: refunds = [], isLoading } = useQuery({
    queryKey: ["admin-refunds"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("refund_requests")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const filtered = useMemo(() => {
    if (statusFilter === "all") return refunds;
    return refunds.filter((r: any) => r.status === statusFilter);
  }, [refunds, statusFilter]);

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {filterStatuses.map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
              statusFilter === s ? "bg-primary text-primary-foreground border-primary" : "hover:bg-accent border-border"
            }`}>
            {s === "all" ? `All (${refunds.length})` : `${s.charAt(0).toUpperCase() + s.slice(1)} (${refunds.filter((r: any) => r.status === s).length})`}
          </button>
        ))}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block border rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-accent/30"><tr>
            <th className="text-left p-3 font-medium">Date</th>
            <th className="text-left p-3 font-medium">Order #</th>
            <th className="text-left p-3 font-medium">Customer</th>
            <th className="text-left p-3 font-medium">Type</th>
            <th className="text-left p-3 font-medium">Reason</th>
            <th className="text-left p-3 font-medium">Status</th>
            <th className="text-right p-3 font-medium">Action</th>
          </tr></thead>
          <tbody>
            {filtered.map((r: any) => (
              <tr key={r.id} className="border-t hover:bg-accent/10 cursor-pointer" onClick={() => setSelected(r)}>
                <td className="p-3 text-xs text-muted-foreground">{format(new Date(r.created_at), "dd MMM yyyy")}</td>
                <td className="p-3 font-mono text-xs">{r.order_number}</td>
                <td className="p-3 font-medium">{r.customer_name}</td>
                <td className="p-3 text-xs capitalize">{r.request_type}</td>
                <td className="p-3 text-xs text-muted-foreground truncate max-w-[150px]">{r.reason}</td>
                <td className="p-3"><span className={`text-xs px-2 py-0.5 rounded ${statusColors[r.status] || ""}`}>{r.status}</span></td>
                <td className="p-3 text-right">
                  <Button size="sm" variant="outline" className="h-7 text-xs">Review</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-8 text-sm">No refund requests</p>}
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {filtered.map((r: any) => (
          <div key={r.id} className="border rounded-lg p-3 space-y-1 cursor-pointer" onClick={() => setSelected(r)}>
            <div className="flex justify-between items-center">
              <span className="font-mono text-xs">{r.order_number}</span>
              <span className={`text-xs px-2 py-0.5 rounded ${statusColors[r.status]}`}>{r.status}</span>
            </div>
            <p className="text-sm font-medium">{r.customer_name}</p>
            <p className="text-xs text-muted-foreground capitalize">{r.request_type} · {r.reason}</p>
          </div>
        ))}
      </div>

      <RefundDrawer refund={selected} onClose={() => setSelected(null)} />
    </div>
  );
};

/* ─── Helper: extract storage path from a public URL ─── */
const extractStoragePath = (url: string): string | null => {
  // URL format: .../storage/v1/object/public/return-images/ORDER/file.jpg
  const match = url.match(/return-images\/(.+)$/);
  return match ? match[1] : null;
};

/* ─── Refund Detail Drawer ─── */
const RefundDrawer = ({ refund, onClose }: { refund: any; onClose: () => void }) => {
  const qc = useQueryClient();
  const [status, setStatus] = useState(refund?.status || "pending");
  const [adminNotes, setAdminNotes] = useState(refund?.admin_notes || "");
  const [refundAmount, setRefundAmount] = useState(refund?.refund_amount?.toString() || "");
  const [saving, setSaving] = useState(false);
  const [signedImageUrls, setSignedImageUrls] = useState<string[]>([]);

  // Generate signed URLs for return images (bucket is now private)
  useEffect(() => {
    const images = refund?.images || [];
    if (images.length === 0) {
      setSignedImageUrls([]);
      return;
    }

    const generateSignedUrls = async () => {
      const urls = await Promise.all(
        images.map(async (url: string) => {
          const path = extractStoragePath(url);
          if (!path) return url; // fallback to original
          const { data } = await supabase.storage
            .from("return-images")
            .createSignedUrl(path, 3600); // 1 hour
          return data?.signedUrl || url;
        })
      );
      setSignedImageUrls(urls);
    };

    generateSignedUrls();
  }, [refund?.id]);

  // Reset form state when refund changes
  useEffect(() => {
    if (refund) {
      setStatus(refund.status);
      setAdminNotes(refund.admin_notes || "");
      setRefundAmount(refund.refund_amount?.toString() || "");
    }
  }, [refund?.id]);

  // Fetch the original order
  const { data: order } = useQuery({
    queryKey: ["refund-order", refund?.order_id],
    queryFn: async () => {
      if (!refund?.order_id) return null;
      const { data } = await supabase.from("orders").select("*").eq("id", refund.order_id).single();
      return data;
    },
    enabled: !!refund?.order_id,
  });

  const handleSave = async () => {
    if (!refund) return;
    setSaving(true);
    try {
      const update: any = {
        status,
        admin_notes: adminNotes || null,
        refund_amount: refundAmount ? parseFloat(refundAmount) : null,
      };
      if (status === "approved" || status === "rejected" || status === "processed") {
        update.resolved_at = new Date().toISOString();
      }
      await supabase.from("refund_requests").update(update).eq("id", refund.id);
      qc.invalidateQueries({ queryKey: ["admin-refunds"] });
      toast.success("Refund request updated");
      onClose();
    } catch {
      toast.error("Failed to update");
    } finally {
      setSaving(false);
    }
  };

  const sendWhatsApp = (template: "approved" | "rejected" | "info") => {
    if (!refund) return;
    const phone = refund.customer_phone.replace(/\D/g, "");
    const p = phone.startsWith("91") ? phone : "91" + phone;
    let msg = "";
    if (template === "approved") {
      msg = `Hi ${refund.customer_name}, your return request for order ${refund.order_number} has been approved. Your refund of ₹${refundAmount || "—"} will be processed within 5–7 business days. — Style Saplings 🌿`;
    } else if (template === "rejected") {
      msg = `Hi ${refund.customer_name}, we reviewed your return request for ${refund.order_number}. Unfortunately we're unable to process this. Please reply if you have questions. — Style Saplings 🌿`;
    } else {
      msg = `Hi ${refund.customer_name}, regarding your return request for ${refund.order_number} — we need a bit more information. Could you please share more details? — Style Saplings 🌿`;
    }
    window.open(`https://wa.me/${p}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  if (!refund) return null;

  return (
    <Sheet open={!!refund} onOpenChange={() => onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-serif">Return Request</SheetTitle>
          <p className="text-xs text-muted-foreground">{refund.order_number} · {format(new Date(refund.created_at), "dd MMM yyyy, hh:mm a")}</p>
        </SheetHeader>

        <div className="space-y-5 mt-4">
          {/* Request Details */}
          <div className="border rounded-lg p-3 space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Request Details</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><span className="text-muted-foreground">Type:</span> <span className="capitalize font-medium">{refund.request_type}</span></div>
              <div><span className="text-muted-foreground">Reason:</span> <span className="font-medium">{refund.reason}</span></div>
            </div>
            {refund.description && <p className="text-sm text-muted-foreground">{refund.description}</p>}
            {signedImageUrls.length > 0 && (
              <div className="flex gap-2 pt-2">
                {signedImageUrls.map((url: string, i: number) => (
                  <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="relative w-16 h-16 border rounded overflow-hidden block">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <ExternalLink className="absolute bottom-0.5 right-0.5 h-3 w-3 text-white drop-shadow" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Customer */}
          <div className="border rounded-lg p-3 space-y-1">
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Customer</h4>
            <p className="font-medium">{refund.customer_name}</p>
            <p className="text-sm">{refund.customer_phone} · {refund.customer_email}</p>
          </div>

          {/* Original Order Summary */}
          {order && (
            <div className="border rounded-lg p-3">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Original Order</h4>
              <p className="text-sm">Total: <span className="font-serif font-semibold">₹{Number(order.total_amount).toLocaleString("en-IN")}</span></p>
              <p className="text-xs text-muted-foreground">Payment: {order.payment_method.toUpperCase()} · {order.payment_status}</p>
            </div>
          )}

          {/* Admin Actions */}
          <div className="border rounded-lg p-3 space-y-3">
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</h4>
            <div>
              <label className="text-xs font-medium block mb-1">Status</label>
              <select value={status} onChange={e => setStatus(e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring">
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="processed">Processed</option>
              </select>
            </div>

            {(status === "approved" || status === "processed") && (
              <div>
                <label className="text-xs font-medium block mb-1">Refund Amount (₹)</label>
                <Input type="number" value={refundAmount} onChange={e => setRefundAmount(e.target.value)}
                  placeholder={order ? String(order.total_amount) : ""} className="h-9" />
              </div>
            )}

            <div>
              <label className="text-xs font-medium block mb-1">Admin Notes (internal)</label>
              <Textarea value={adminNotes} onChange={e => setAdminNotes(e.target.value)}
                placeholder="Internal notes..." className="min-h-[60px] text-sm" />
            </div>

            <Button className="w-full" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>

          {/* WhatsApp Templates */}
          <div className="border rounded-lg p-3 space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">WhatsApp Templates</h4>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" className="text-xs" onClick={() => sendWhatsApp("approved")}>✅ Approved</Button>
              <Button size="sm" variant="outline" className="text-xs" onClick={() => sendWhatsApp("rejected")}>❌ Rejected</Button>
              <Button size="sm" variant="outline" className="text-xs" onClick={() => sendWhatsApp("info")}>ℹ️ Need Info</Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AdminRefunds;
