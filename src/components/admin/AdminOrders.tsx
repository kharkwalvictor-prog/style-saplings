import { useState, useMemo } from "react";
import { useOrders, useUpdateOrderStatus, DbOrder } from "@/hooks/useOrders";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { formatDistanceToNow, format } from "date-fns";
import {
  Loader2, X, ArrowRight, Search,
  MessageSquare, Printer, ChevronRight, Download,
  ExternalLink, Copy, Package, Truck,
} from "lucide-react";
import ShipOrderDialog from "./ShipOrderDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { printInvoice, printMultipleInvoices, exportOrdersCSV, GSTConfig } from "@/utils/invoiceUtils";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  processing: "bg-blue-100 text-blue-700",
  packed: "bg-purple-100 text-purple-700",
  shipped: "bg-orange-100 text-orange-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};
const paymentColors: Record<string, string> = {
  pending: "bg-orange-100 text-orange-700",
  paid: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
  refunded: "bg-blue-100 text-blue-700",
};
const methodColors: Record<string, string> = {
  cod: "bg-blue-100 text-blue-700",
  razorpay: "bg-purple-100 text-purple-700",
};

const statusFlow = ["pending", "processing", "packed", "shipped", "delivered"];
const nextStatus: Record<string, string> = { pending: "processing", processing: "packed", packed: "shipped" };
const filterStatuses = ["all", "pending", "processing", "packed", "shipped", "delivered", "cancelled"];
const paymentFilters = ["all", "razorpay", "cod"];

const CANCEL_REASONS = [
  "Customer requested",
  "Duplicate order",
  "Item out of stock",
  "Suspected fake/fraud",
  "Payment issue",
];

const AdminOrders = () => {
  const { data: orders = [], isLoading } = useOrders();
  const updateStatus = useUpdateOrderStatus();
  const qc = useQueryClient();

  // Cache GST config for the session
  const { data: gstConfig } = useQuery({
    queryKey: ["gst-config"],
    queryFn: async () => {
      const { data } = await supabase.from("gst_config").select("*").order("effective_from", { ascending: false }).limit(1).single();
      return data as GSTConfig | null;
    },
    staleTime: Infinity,
  });

  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<DbOrder | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [shippingOrder, setShippingOrder] = useState<DbOrder | null>(null);
  const [trackingModal, setTrackingModal] = useState<{ order: DbOrder; next: string } | null>(null);
  const [trackingInput, setTrackingInput] = useState("");
  const [cancelModal, setCancelModal] = useState<DbOrder | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelOther, setCancelOther] = useState("");

  const filtered = useMemo(() => {
    return orders.filter(o => {
      if (statusFilter !== "all" && o.order_status !== statusFilter) return false;
      if (paymentFilter !== "all" && o.payment_method !== paymentFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return o.order_number.toLowerCase().includes(q) ||
          o.customer_name.toLowerCase().includes(q) ||
          o.customer_phone.includes(q);
      }
      return true;
    });
  }, [orders, statusFilter, paymentFilter, search]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };
  const toggleAll = () => {
    if (selectedIds.size === filtered.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(filtered.map(o => o.id)));
  };

  const bulkUpdateStatus = async (status: string) => {
    for (const id of selectedIds) {
      await supabase.from("orders").update({ order_status: status as any }).eq("id", id);
    }
    qc.invalidateQueries({ queryKey: ["admin-orders"] });
    setSelectedIds(new Set());
    toast.success(`${selectedIds.size} orders → ${status}`);
  };

  const handleAdvance = async (order: DbOrder) => {
    const next = nextStatus[order.order_status];
    if (!next) return;
    if (next === "shipped") {
      setShippingOrder(order);
      return;
    }
    await advanceOrder(order, next);
  };

  const advanceOrder = async (order: DbOrder, next: string, tracking?: string) => {
    if (tracking) {
      await supabase.from("orders").update({ tracking_number: tracking } as any).eq("id", order.id);
    }
    await supabase.from("order_status_history").insert({
      order_id: order.id, from_status: order.order_status, to_status: next,
    });
    updateStatus.mutate({ id: order.id, status: next });
    toast.success(`${order.order_number} → ${next}`);

    // Send shipping notification email when status becomes 'shipped'
    if (next === "shipped") {
      supabase.functions.invoke("send-shipping-notification", {
        body: { order_id: order.id, tracking_number: tracking || undefined },
      }).catch(console.error);
    }
  };

  const handleTrackingConfirm = async () => {
    if (!trackingModal) return;
    await advanceOrder(trackingModal.order, trackingModal.next, trackingInput.trim() || undefined);
    setTrackingModal(null);
  };

  const handleCancelOrder = async () => {
    if (!cancelModal) return;
    const reason = cancelReason === "Other" ? cancelOther.trim() : cancelReason;
    if (!reason) { toast.error("Please select a reason"); return; }
    await supabase.from("orders").update({ order_status: "cancelled", cancel_reason: reason } as any).eq("id", cancelModal.id);
    await supabase.from("order_status_history").insert({
      order_id: cancelModal.id, from_status: cancelModal.order_status, to_status: "cancelled",
    });
    qc.invalidateQueries({ queryKey: ["admin-orders"] });
    toast.success(`${cancelModal.order_number} cancelled`);
    setCancelModal(null);
    setCancelReason("");
    setCancelOther("");
  };

  const handleBulkPrint = () => {
    const selected = orders.filter(o => selectedIds.has(o.id));
    if (selected.length === 0) return;
    printMultipleInvoices(selected, gstConfig || undefined);
  };

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <div className="flex flex-wrap gap-2 items-center">
        {filterStatuses.map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
              statusFilter === s ? "bg-primary text-primary-foreground border-primary" : "hover:bg-accent border-border"
            }`}>
            {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
        <div className="h-4 w-px bg-border mx-1" />
        {paymentFilters.map(p => (
          <button key={p} onClick={() => setPaymentFilter(p)}
            className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
              paymentFilter === p ? "bg-primary text-primary-foreground border-primary" : "hover:bg-accent border-border"
            }`}>
            {p === "all" ? "All Pay" : p.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search order #, name, or phone..." value={search} onChange={e => setSearch(e.target.value)}
          className="pl-9 h-9" />
      </div>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <div className="flex flex-wrap items-center gap-2 text-sm bg-accent/50 rounded-lg p-2">
          <span className="font-medium">{selectedIds.size} selected</span>
          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => bulkUpdateStatus("processing")}>Mark Processing</Button>
          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => bulkUpdateStatus("packed")}>Mark Packed</Button>
          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => exportOrdersCSV(orders.filter(o => selectedIds.has(o.id)))}>
            <Download className="h-3 w-3 mr-1" /> Export CSV
          </Button>
          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={handleBulkPrint}>
            <Printer className="h-3 w-3 mr-1" /> Print Invoices
          </Button>
          <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setSelectedIds(new Set())}>Clear</Button>
        </div>
      )}

      {/* Export All */}
      {selectedIds.size === 0 && filtered.length > 0 && (
        <div className="flex justify-end">
          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => exportOrdersCSV(filtered)}>
            <Download className="h-3 w-3 mr-1" /> Export CSV ({filtered.length})
          </Button>
        </div>
      )}

      {/* Desktop Table */}
      <div className="hidden md:block border rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-accent/30">
            <tr>
              <th className="p-3 w-8"><input type="checkbox" checked={selectedIds.size === filtered.length && filtered.length > 0} onChange={toggleAll} className="accent-primary" /></th>
              <th className="text-left p-3 font-medium">Order #</th>
              <th className="text-left p-3 font-medium">Date</th>
              <th className="text-left p-3 font-medium">Customer</th>
              <th className="text-left p-3 font-medium">Total</th>
              <th className="text-left p-3 font-medium">Payment</th>
              <th className="text-left p-3 font-medium">Status</th>
              <th className="text-right p-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(order => (
              <tr key={order.id} className="border-t hover:bg-accent/10 cursor-pointer" onClick={() => setSelectedOrder(order)}>
                <td className="p-3" onClick={e => e.stopPropagation()}>
                  <input type="checkbox" checked={selectedIds.has(order.id)} onChange={() => toggleSelect(order.id)} className="accent-primary" />
                </td>
                <td className="p-3 font-mono text-xs">{order.order_number}</td>
                <td className="p-3 text-xs text-muted-foreground">{format(new Date(order.created_at), "dd MMM, hh:mm a")}</td>
                <td className="p-3">
                  <p className="font-medium">{order.customer_name}</p>
                  <p className="text-xs text-muted-foreground">{order.customer_phone}</p>
                </td>
                <td className="p-3 font-serif font-semibold">₹{Number(order.total_amount).toLocaleString("en-IN")}</td>
                <td className="p-3">
                  <span className={`text-xs px-2 py-0.5 rounded ${methodColors[order.payment_method] || ""}`}>{order.payment_method.toUpperCase()}</span>
                  <span className={`text-xs px-2 py-0.5 rounded ml-1 ${paymentColors[order.payment_status] || ""}`}>{order.payment_status}</span>
                </td>
                <td className="p-3"><span className={`text-xs px-2 py-0.5 rounded ${statusColors[order.order_status] || ""}`}>{order.order_status}</span></td>
                <td className="p-3 text-right space-x-1" onClick={e => e.stopPropagation()}>
                  {nextStatus[order.order_status] && (
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleAdvance(order)}>
                      → {nextStatus[order.order_status]}
                    </Button>
                  )}
                  {order.order_status !== "cancelled" && order.order_status !== "delivered" && (
                    <Button size="sm" variant="outline" className="h-7 text-xs text-destructive hover:text-destructive" onClick={() => { setCancelModal(order); setCancelReason(""); setCancelOther(""); }}>
                      Cancel
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-8 text-sm">No orders match filters</p>}
      </div>

      {/* Mobile Card List */}
      <div className="md:hidden space-y-3">
        {filtered.map(order => (
          <div key={order.id} className="border rounded-lg p-3 space-y-2" onClick={() => setSelectedOrder(order)}>
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-medium">{order.order_number}</span>
              <span className={`text-xs px-2 py-0.5 rounded ${statusColors[order.order_status] || ""}`}>{order.order_status}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{order.customer_name}</span>
              <span className="font-serif font-semibold">₹{Number(order.total_amount).toLocaleString("en-IN")}</span>
            </div>
            {nextStatus[order.order_status] && (
              <Button size="sm" variant="outline" className="w-full h-8 text-xs" onClick={e => { e.stopPropagation(); handleAdvance(order); }}>
                → {nextStatus[order.order_status]}
              </Button>
            )}
          </div>
        ))}
      </div>

      {/* Order Detail Drawer */}
      <OrderDetailDrawer order={selectedOrder} onClose={() => setSelectedOrder(null)} onAdvance={handleAdvance} gstConfig={gstConfig || undefined} />

      {/* Shiprocket Ship Order Dialog */}
      <ShipOrderDialog
        order={shippingOrder}
        open={!!shippingOrder}
        onClose={() => setShippingOrder(null)}
        onShipped={() => {
          setShippingOrder(null);
          qc.invalidateQueries({ queryKey: ["admin-orders"] });
        }}
      />

      {/* Cancel Order Modal */}
      <Dialog open={!!cancelModal} onOpenChange={() => setCancelModal(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif">Cancel Order {cancelModal?.order_number}?</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm font-medium">Reason:</p>
            {CANCEL_REASONS.map(r => (
              <label key={r} className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="radio" name="cancel_reason" checked={cancelReason === r} onChange={() => setCancelReason(r)} className="accent-primary" />
                {r}
              </label>
            ))}
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="radio" name="cancel_reason" checked={cancelReason === "Other"} onChange={() => setCancelReason("Other")} className="accent-primary" />
              Other
            </label>
            {cancelReason === "Other" && (
              <Input placeholder="Specify reason..." value={cancelOther} onChange={e => setCancelOther(e.target.value)} className="h-9" />
            )}
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setCancelModal(null)}>Go Back</Button>
            <Button variant="destructive" onClick={handleCancelOrder} disabled={!cancelReason || (cancelReason === "Other" && !cancelOther.trim())}>
              Cancel Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

/* ─── Order Detail Drawer ─── */
interface DrawerProps {
  order: DbOrder | null;
  onClose: () => void;
  onAdvance: (order: DbOrder) => void;
  gstConfig?: GSTConfig;
}

const OrderDetailDrawer = ({ order, onClose, onAdvance, gstConfig }: DrawerProps) => {
  const [note, setNote] = useState("");
  const [tracking, setTracking] = useState("");
  const [trackingData, setTrackingData] = useState<any[] | null>(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [labelLoading, setLabelLoading] = useState(false);
  const qc = useQueryClient();

  const { data: notes = [] } = useQuery({
    queryKey: ["order-notes", order?.id],
    queryFn: async () => {
      if (!order) return [];
      const { data } = await supabase.from("order_notes").select("*").eq("order_id", order.id).order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!order,
  });

  const { data: history = [] } = useQuery({
    queryKey: ["order-history", order?.id],
    queryFn: async () => {
      if (!order) return [];
      const { data } = await supabase.from("order_status_history").select("*").eq("order_id", order.id).order("created_at", { ascending: true });
      return data || [];
    },
    enabled: !!order,
  });

  const saveNote = async () => {
    if (!note.trim() || !order) return;
    await supabase.from("order_notes").insert({ order_id: order.id, note: note.trim() });
    setNote("");
    qc.invalidateQueries({ queryKey: ["order-notes", order.id] });
    toast.success("Note saved");
  };

  const saveTracking = async () => {
    if (!tracking.trim() || !order) return;
    await supabase.from("orders").update({ tracking_number: tracking.trim() } as any).eq("id", order.id);
    qc.invalidateQueries({ queryKey: ["admin-orders"] });
    toast.success("Tracking number saved");
  };

  const handleTrackLive = async () => {
    if (!order) return;
    setTrackingLoading(true);
    setTrackingData(null);
    try {
      const { data, error } = await supabase.functions.invoke("track-shipment", {
        body: { order_id: order.id },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setTrackingData(data?.tracking_data?.tracking_data?.shipment_track_activities || data?.activities || []);
    } catch (err: any) {
      toast.error(err?.message || "Failed to fetch tracking");
    } finally {
      setTrackingLoading(false);
    }
  };

  const handleShippingLabel = async () => {
    if (!order) return;
    setLabelLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("get-shipping-label", {
        body: { order_id: order.id },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (data?.label_url) {
        window.open(data.label_url, "_blank");
      } else {
        toast.error("No label URL returned");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to get shipping label");
    } finally {
      setLabelLoading(false);
    }
  };

  const sendWhatsApp = () => {
    if (!order) return;
    const msg = encodeURIComponent(`Hi ${order.customer_name}, your order ${order.order_number} status: ${order.order_status}. Thank you for shopping with Style Saplings 🌿`);
    const phone = order.customer_phone.replace(/\D/g, "");
    window.open(`https://wa.me/${phone.startsWith("91") ? phone : "91" + phone}?text=${msg}`, "_blank");
  };

  const handleDownloadInvoice = async (o: DbOrder) => {
    toast.loading("Generating invoice...", { id: "invoice" });
    try {
      const { data, error } = await supabase.functions.invoke("generate-invoice", {
        body: { order_id: o.id },
      });
      if (error || !data?.signedUrl) {
        toast.error("Failed to generate invoice", { id: "invoice" });
        return;
      }
      toast.success("Invoice ready!", { id: "invoice" });
      window.open(data.signedUrl, "_blank");
    } catch {
      toast.error("Failed to generate invoice", { id: "invoice" });
    }
  };

  if (!order) return null;

  const items = (order.items as any[]) || [];
  const address = order.shipping_address as any;
  const currentIdx = statusFlow.indexOf(order.order_status);

  return (
    <Sheet open={!!order} onOpenChange={() => onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-serif">{order.order_number}</SheetTitle>
          <p className="text-xs text-muted-foreground">{format(new Date(order.created_at), "dd MMM yyyy, hh:mm a")}</p>
        </SheetHeader>

        <div className="space-y-5 mt-4">
          {/* Status Progression */}
          <div className="flex items-center gap-1 overflow-x-auto pb-2">
            {statusFlow.map((s, i) => (
              <div key={s} className="flex items-center gap-1">
                <div className={`text-[10px] px-2 py-1 rounded whitespace-nowrap ${
                  i <= currentIdx ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}>{s}</div>
                {i < statusFlow.length - 1 && <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />}
              </div>
            ))}
          </div>

          {/* Customer */}
          <div className="border rounded-lg p-3 space-y-1">
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Customer</h4>
            <p className="font-medium">{order.customer_name}</p>
            <p className="text-sm">{order.customer_phone} · {order.customer_email}</p>
          </div>

          {/* Items */}
          <div className="border rounded-lg p-3">
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Items</h4>
            {items.map((item: any, i: number) => (
              <div key={i} className="flex items-center gap-3 py-2 border-t first:border-0">
                {item.image && <img src={item.image} alt={item.name} className="w-10 h-10 rounded object-cover" />}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.size && `Size: ${item.size} · `}Qty: {item.quantity}
                  </p>
                </div>
                <p className="font-serif font-semibold text-sm">₹{Number(item.price * item.quantity).toLocaleString("en-IN")}</p>
              </div>
            ))}
            <div className="border-t pt-2 mt-2 flex justify-between font-serif font-semibold">
              <span>Total</span>
              <span>₹{Number(order.total_amount).toLocaleString("en-IN")}</span>
            </div>
          </div>

          {/* Shipping Address */}
          {address && (
            <div className="border rounded-lg p-3">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Shipping Address</h4>
              <p className="text-sm">
                {[address.address, address.city, address.state, address.pincode].filter(Boolean).join(", ")}
              </p>
            </div>
          )}

          {/* Payment */}
          <div className="border rounded-lg p-3">
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Payment</h4>
            <div className="flex gap-2">
              <span className={`text-xs px-2 py-0.5 rounded ${methodColors[order.payment_method]}`}>{order.payment_method.toUpperCase()}</span>
              <span className={`text-xs px-2 py-0.5 rounded ${paymentColors[order.payment_status]}`}>{order.payment_status}</span>
            </div>
            {order.razorpay_order_id && <p className="text-xs text-muted-foreground mt-1">ID: {order.razorpay_order_id}</p>}
          </div>

          {/* Shipment Details */}
          {order.tracking_number && (
            <div className="border rounded-lg p-3 space-y-3 bg-orange-50/50">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Truck className="h-3.5 w-3.5" /> Shipment Details
              </h4>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">AWB:</span>
                <span className="font-mono font-semibold text-sm">{order.tracking_number}</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(order.tracking_number || "");
                    toast.success("AWB copied");
                  }}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Copy AWB"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1 h-8 text-xs" onClick={handleTrackLive} disabled={trackingLoading}>
                  {trackingLoading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Package className="h-3 w-3 mr-1" />}
                  Track Live
                </Button>
                <Button size="sm" variant="outline" className="flex-1 h-8 text-xs" onClick={handleShippingLabel} disabled={labelLoading}>
                  {labelLoading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <ExternalLink className="h-3 w-3 mr-1" />}
                  Download Label
                </Button>
              </div>

              {/* Tracking Timeline */}
              {trackingData && trackingData.length > 0 && (
                <div className="space-y-0 mt-2">
                  <h5 className="text-xs font-medium mb-2">Tracking Timeline</h5>
                  <div className="relative pl-4 border-l-2 border-primary/30 space-y-3">
                    {trackingData.map((event: any, i: number) => (
                      <div key={i} className="relative">
                        <div className="absolute -left-[calc(0.5rem+1px)] top-1 h-2 w-2 rounded-full bg-primary" />
                        <p className="text-xs font-medium">{event.activity || event.status}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {event.date ? format(new Date(event.date), "dd MMM yyyy, hh:mm a") : event.location || ""}
                        </p>
                        {event.location && event.date && (
                          <p className="text-[10px] text-muted-foreground">{event.location}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {trackingData && trackingData.length === 0 && (
                <p className="text-xs text-muted-foreground">No tracking events available yet.</p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="space-y-2">
            {nextStatus[order.order_status] && (
              <Button className="w-full" onClick={() => onAdvance(order)}>
                → Advance to {nextStatus[order.order_status]}
              </Button>
            )}
            {(order.order_status === "shipped") && !order.tracking_number && (
              <div className="flex gap-2">
                <Input placeholder="Tracking number" value={tracking} onChange={e => setTracking(e.target.value)} className="h-9" />
                <Button size="sm" variant="outline" onClick={saveTracking}>Save</Button>
              </div>
            )}
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={sendWhatsApp}>
                <MessageSquare className="h-4 w-4 mr-1" /> WhatsApp
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => printInvoice(order, gstConfig || undefined)}>
                <Printer className="h-4 w-4 mr-1" /> Print
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => handleDownloadInvoice(order)}>
                <Download className="h-4 w-4 mr-1" /> Invoice
              </Button>
            </div>
          </div>

          {/* Internal Notes */}
          <div className="border rounded-lg p-3">
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Internal Notes</h4>
            <Textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Add a note..." className="min-h-[60px] text-sm" />
            <Button size="sm" variant="outline" className="mt-2" onClick={saveNote} disabled={!note.trim()}>Save Note</Button>
            {notes.map((n: any) => (
              <div key={n.id} className="border-t mt-2 pt-2">
                <p className="text-sm">{n.note}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{format(new Date(n.created_at), "dd MMM, hh:mm a")}</p>
              </div>
            ))}
          </div>

          {/* Status History */}
          {history.length > 0 && (
            <div className="border rounded-lg p-3">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Status History</h4>
              {history.map((h: any) => (
                <div key={h.id} className="flex items-center gap-2 text-xs py-1">
                  <span className="text-muted-foreground">{h.from_status || "new"}</span>
                  <ArrowRight className="h-3 w-3" />
                  <span className="font-medium">{h.to_status}</span>
                  <span className="text-muted-foreground ml-auto">{format(new Date(h.created_at), "dd MMM, hh:mm a")}</span>
                </div>
              ))}
            </div>
          )}

          {/* Cancellation Reason */}
          {order.order_status === "cancelled" && (order as any).cancel_reason && (
            <div className="border border-destructive/30 rounded-lg p-3 bg-destructive/5">
              <h4 className="text-xs font-medium text-destructive uppercase tracking-wider mb-1">Cancellation Reason</h4>
              <p className="text-sm text-destructive/80">{(order as any).cancel_reason}</p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AdminOrders;
