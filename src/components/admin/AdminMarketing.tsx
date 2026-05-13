import { useState, useMemo } from "react";
import { useOrders } from "@/hooks/useOrders";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Loader2, Plus, X, Tag, Star, Eye, Check, Ban } from "lucide-react";
import { useAllReviews, ProductReview } from "@/hooks/useReviews";
import StarRating from "@/components/StarRating";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const AdminMarketing = () => {
  const { data: orders = [], isLoading } = useOrders();
  const { data: allReviews = [], isLoading: reviewsLoading } = useAllReviews();
  const qc = useQueryClient();

  // Discount codes
  const { data: discountCodes = [], isLoading: codesLoading } = useQuery({
    queryKey: ["discount-codes"],
    queryFn: async () => {
      const { data } = await supabase
        .from("discount_codes")
        .select("*")
        .order("created_at", { ascending: false });
      return data || [];
    },
  });

  const [codeModal, setCodeModal] = useState(false);
  const [codeForm, setCodeForm] = useState({
    code: "",
    description: "",
    discount_type: "percentage",
    discount_value: "",
    minimum_order_amount: "0",
    usage_limit: "",
    valid_from: format(new Date(), "yyyy-MM-dd"),
    valid_until: "",
    is_active: true,
  });

  const resetCodeForm = () => {
    setCodeForm({
      code: "", description: "", discount_type: "percentage",
      discount_value: "", minimum_order_amount: "0", usage_limit: "",
      valid_from: format(new Date(), "yyyy-MM-dd"), valid_until: "", is_active: true,
    });
  };

  const saveCode = async () => {
    if (!codeForm.code.trim() || !codeForm.discount_value) {
      toast.error("Code and value are required");
      return;
    }
    const payload = {
      code: codeForm.code.trim().toUpperCase(),
      description: codeForm.description || null,
      discount_type: codeForm.discount_type,
      discount_value: Number(codeForm.discount_value),
      minimum_order_amount: Number(codeForm.minimum_order_amount) || 0,
      usage_limit: codeForm.usage_limit ? Number(codeForm.usage_limit) : null,
      valid_from: codeForm.valid_from ? new Date(codeForm.valid_from).toISOString() : new Date().toISOString(),
      valid_until: codeForm.valid_until ? new Date(codeForm.valid_until).toISOString() : null,
      is_active: codeForm.is_active,
    };

    const { error } = await supabase.from("discount_codes").insert(payload);
    if (error) {
      toast.error(error.message.includes("duplicate") ? "Code already exists" : "Failed to create code");
      return;
    }
    toast.success("Discount code created");
    qc.invalidateQueries({ queryKey: ["discount-codes"] });
    setCodeModal(false);
    resetCodeForm();
  };

  const toggleCodeActive = async (id: string, current: boolean) => {
    await supabase.from("discount_codes").update({ is_active: !current }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["discount-codes"] });
  };

  const deleteCode = async (id: string) => {
    await supabase.from("discount_codes").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["discount-codes"] });
    toast.success("Code deleted");
  };

  // Marketing stats
  const stats = useMemo(() => {
    const emails = new Set<string>();
    const repeatMap = new Map<string, number>();
    let codCount = 0;

    orders.forEach(o => {
      emails.add(o.customer_email);
      repeatMap.set(o.customer_email, (repeatMap.get(o.customer_email) || 0) + 1);
      if (o.payment_method === "cod") codCount++;
    });

    const repeatCustomers = Array.from(repeatMap.values()).filter(c => c >= 2).length;
    return { totalSubscribers: emails.size, repeatCustomers, codCustomers: codCount };
  }, [orders]);

  const monthlyRevenue = useMemo(() => {
    const map = new Map<string, number>();
    orders.forEach(o => {
      const month = format(new Date(o.created_at), "MMM yyyy");
      map.set(month, (map.get(month) || 0) + Number(o.total_amount));
    });
    return Array.from(map.entries()).slice(-6).reverse();
  }, [orders]);

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <h2 className="font-serif text-xl font-semibold">Marketing</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">Total Subscribers</p>
          <p className="font-serif text-3xl font-bold">{stats.totalSubscribers}</p>
          <p className="text-xs text-muted-foreground">Unique emails from orders</p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">Repeat Customers</p>
          <p className="font-serif text-3xl font-bold">{stats.repeatCustomers}</p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">COD Orders</p>
          <p className="font-serif text-3xl font-bold">{stats.codCustomers}</p>
          <p className="text-xs text-muted-foreground">Lower email engagement</p>
        </div>
      </div>

      {/* Discount Codes Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-serif text-lg font-semibold flex items-center gap-2">
            <Tag className="h-5 w-5" /> Discount Codes
          </h3>
          <Button size="sm" onClick={() => { resetCodeForm(); setCodeModal(true); }}>
            <Plus className="h-4 w-4 mr-1" /> New Code
          </Button>
        </div>

        <div className="border rounded-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-accent/30">
              <tr>
                <th className="text-left p-3 font-medium">Code</th>
                <th className="text-left p-3 font-medium">Type</th>
                <th className="text-left p-3 font-medium">Value</th>
                <th className="text-left p-3 font-medium">Min Order</th>
                <th className="text-left p-3 font-medium">Used</th>
                <th className="text-left p-3 font-medium">Limit</th>
                <th className="text-left p-3 font-medium">Valid Until</th>
                <th className="text-left p-3 font-medium">Status</th>
                <th className="text-right p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {discountCodes.map((dc: any) => (
                <tr key={dc.id} className="border-t">
                  <td className="p-3 font-mono text-xs font-semibold">{dc.code}</td>
                  <td className="p-3 text-xs capitalize">{dc.discount_type}</td>
                  <td className="p-3 text-xs">
                    {dc.discount_type === "percentage" ? `${dc.discount_value}%` :
                     dc.discount_type === "shipping" ? "Free Ship" :
                     `₹${Number(dc.discount_value).toLocaleString("en-IN")}`}
                  </td>
                  <td className="p-3 text-xs">₹{Number(dc.minimum_order_amount || 0).toLocaleString("en-IN")}</td>
                  <td className="p-3 text-xs">{dc.usage_count || 0}</td>
                  <td className="p-3 text-xs">{dc.usage_limit || "∞"}</td>
                  <td className="p-3 text-xs">
                    {dc.valid_until ? format(new Date(dc.valid_until), "dd MMM yyyy") : "No expiry"}
                  </td>
                  <td className="p-3">
                    <Switch
                      checked={dc.is_active}
                      onCheckedChange={() => toggleCodeActive(dc.id, dc.is_active)}
                      className="scale-75"
                    />
                  </td>
                  <td className="p-3 text-right">
                    <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive" onClick={() => deleteCode(dc.id)}>
                      <X className="h-3 w-3" />
                    </Button>
                  </td>
                </tr>
              ))}
              {discountCodes.length === 0 && (
                <tr><td colSpan={9} className="p-8 text-center text-muted-foreground text-sm">
                  No discount codes yet
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Monthly Revenue */}
      {monthlyRevenue.length > 0 && (
        <div>
          <h3 className="font-serif text-lg font-semibold mb-3">Monthly Revenue</h3>
          <div className="border rounded-lg p-4 space-y-2">
            {monthlyRevenue.map(([month, rev]) => {
              const max = Math.max(...monthlyRevenue.map(([, r]) => r));
              const width = max > 0 ? (rev / max) * 100 : 0;
              return (
                <div key={month} className="flex items-center gap-3 text-sm">
                  <span className="w-20 text-xs text-muted-foreground shrink-0">{month}</span>
                  <div className="flex-1 bg-muted rounded-full h-5 overflow-hidden">
                    <div className="bg-primary h-full rounded-full transition-all" style={{ width: `${width}%` }} />
                  </div>
                  <span className="font-serif font-semibold text-xs w-24 text-right">₹{rev.toLocaleString("en-IN")}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Campaign History */}
      <div>
        <h3 className="font-serif text-lg font-semibold mb-3">Campaign History</h3>
        <div className="border rounded-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-accent/30"><tr>
              <th className="text-left p-3 font-medium">Date</th>
              <th className="text-left p-3 font-medium">Subject</th>
              <th className="text-left p-3 font-medium">Sent To</th>
              <th className="text-left p-3 font-medium">Status</th>
            </tr></thead>
            <tbody>
              <tr><td colSpan={4} className="p-8 text-center text-muted-foreground text-sm">
                No campaigns sent yet. Email campaign sending will be available when integrated with an email service.
              </td></tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* New Code Modal */}
      <Dialog open={codeModal} onOpenChange={setCodeModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif">New Discount Code</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Code *</label>
              <Input
                value={codeForm.code}
                onChange={e => setCodeForm(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                placeholder="e.g. SUMMER20"
                className="uppercase"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Description</label>
              <Input
                value={codeForm.description}
                onChange={e => setCodeForm(p => ({ ...p, description: e.target.value }))}
                placeholder="Internal label"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Type *</label>
                <Select value={codeForm.discount_type} onValueChange={v => setCodeForm(p => ({ ...p, discount_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage Off</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                    <SelectItem value="shipping">Free Shipping</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  {codeForm.discount_type === "percentage" ? "Percentage *" :
                   codeForm.discount_type === "shipping" ? "Shipping Value" : "Amount (₹) *"}
                </label>
                <Input
                  type="number"
                  value={codeForm.discount_value}
                  onChange={e => setCodeForm(p => ({ ...p, discount_value: e.target.value }))}
                  placeholder={codeForm.discount_type === "percentage" ? "10" : "99"}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Min Order (₹)</label>
                <Input
                  type="number"
                  value={codeForm.minimum_order_amount}
                  onChange={e => setCodeForm(p => ({ ...p, minimum_order_amount: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Usage Limit</label>
                <Input
                  type="number"
                  value={codeForm.usage_limit}
                  onChange={e => setCodeForm(p => ({ ...p, usage_limit: e.target.value }))}
                  placeholder="Unlimited"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Valid From</label>
                <Input
                  type="date"
                  value={codeForm.valid_from}
                  onChange={e => setCodeForm(p => ({ ...p, valid_from: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Valid Until</label>
                <Input
                  type="date"
                  value={codeForm.valid_until}
                  onChange={e => setCodeForm(p => ({ ...p, valid_until: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Active</span>
              <Switch checked={codeForm.is_active} onCheckedChange={v => setCodeForm(p => ({ ...p, is_active: v }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCodeModal(false)}>Cancel</Button>
            <Button onClick={saveCode}>Create Code</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reviews Moderation Section */}
      <ReviewsModeration reviews={allReviews} loading={reviewsLoading} />
    </div>
  );
};

/* Reviews Moderation */
function ReviewsModeration({ reviews, loading }: { reviews: ProductReview[]; loading: boolean }) {
  const [filter, setFilter] = useState<"pending" | "approved" | "rejected">("pending");
  const [detailReview, setDetailReview] = useState<ProductReview | null>(null);
  const qc = useQueryClient();

  const pendingCount = reviews.filter((r) => r.is_approved === false).length;
  const filtered = reviews.filter((r) => {
    if (filter === "pending") return r.is_approved === false;
    if (filter === "approved") return r.is_approved === true;
    return false; // rejected not tracked separately — approved=false is pending
  });

  const updateReview = async (id: string, approved: boolean) => {
    await supabase.from("product_reviews").update({ is_approved: approved }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-reviews"] });
    qc.invalidateQueries({ queryKey: ["review-summaries"] });
    toast.success(approved ? "Review approved" : "Review rejected");
    if (detailReview?.id === id) setDetailReview(null);
  };

  const deleteReview = async (id: string) => {
    await supabase.from("product_reviews").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-reviews"] });
    qc.invalidateQueries({ queryKey: ["review-summaries"] });
    toast.success("Review deleted");
    if (detailReview?.id === id) setDetailReview(null);
  };

  if (loading) return null;

  return (
    <div>
      <h3 className="font-serif text-lg font-semibold mb-3 flex items-center gap-2">
        <Star className="h-5 w-5" /> Reviews
        {pendingCount > 0 && (
          <span className="bg-sale text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center">{pendingCount}</span>
        )}
      </h3>

      <div className="flex gap-2 mb-3">
        {(["pending", "approved"] as const).map((f) => (
          <Button key={f} size="sm" variant={filter === f ? "default" : "outline"} onClick={() => setFilter(f)} className="text-xs capitalize">
            {f} {f === "pending" && pendingCount > 0 ? `(${pendingCount})` : ""}
          </Button>
        ))}
      </div>

      <div className="border rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-accent/30">
            <tr>
              <th className="text-left p-3 font-medium">Customer</th>
              <th className="text-left p-3 font-medium">Rating</th>
              <th className="text-left p-3 font-medium">Review</th>
              <th className="text-left p-3 font-medium">Date</th>
              <th className="text-right p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="p-3 text-xs">{r.customer_name}</td>
                <td className="p-3"><StarRating value={r.rating} readonly size={12} /></td>
                <td className="p-3 text-xs max-w-[200px] truncate">{r.title || r.body || "—"}</td>
                <td className="p-3 text-xs">{r.created_at ? format(new Date(r.created_at), "dd MMM") : ""}</td>
                <td className="p-3 text-right space-x-1">
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setDetailReview(r)}><Eye className="h-3.5 w-3.5" /></Button>
                  {!r.is_approved && (
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-green-600" onClick={() => updateReview(r.id, true)}><Check className="h-3.5 w-3.5" /></Button>
                  )}
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={() => deleteReview(r.id)}><X className="h-3.5 w-3.5" /></Button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="p-8 text-center text-muted-foreground text-sm">No {filter} reviews</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Review Detail Sheet */}
      <Dialog open={!!detailReview} onOpenChange={(o) => { if (!o) setDetailReview(null); }}>
        <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif">Review Details</DialogTitle>
          </DialogHeader>
          {detailReview && (
            <div className="space-y-4">
              <StarRating value={detailReview.rating} readonly size={20} />
              {detailReview.title && <p className="font-medium">{detailReview.title}</p>}
              {detailReview.body && <p className="text-sm text-muted-foreground">{detailReview.body}</p>}
              {detailReview.photo_url && <img src={detailReview.photo_url} alt="Review" className="w-full rounded max-h-60 object-cover" />}
              <div className="text-xs space-y-1 border-t pt-3">
                <p><strong>Name:</strong> {detailReview.customer_name}</p>
                <p><strong>Email:</strong> {detailReview.customer_email}</p>
                <p><strong>Date:</strong> {detailReview.created_at ? format(new Date(detailReview.created_at), "dd MMM yyyy, hh:mm a") : "—"}</p>
                {detailReview.order_id && <p className="text-green-600">✅ Verified Purchase</p>}
              </div>
              <div className="flex gap-2 pt-2">
                {!detailReview.is_approved && (
                  <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => updateReview(detailReview.id, true)}>
                    <Check className="h-4 w-4 mr-1" /> Approve
                  </Button>
                )}
                <Button size="sm" variant="destructive" onClick={() => deleteReview(detailReview.id)}>
                  <Ban className="h-4 w-4 mr-1" /> Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AdminMarketing;
