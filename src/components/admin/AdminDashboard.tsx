import { useState, useEffect } from "react";
import { useOrders, DbOrder } from "@/hooks/useOrders";
import { useProducts, DbProduct } from "@/hooks/useProducts";
import { useUpdateOrderStatus } from "@/hooks/useOrders";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  AlertTriangle, TrendingUp, TrendingDown, ArrowRight,
  Package, ShoppingCart, Truck, Clock, Loader2, CircleDot
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";

interface DashboardProps {
  onNavigate: (tab: string) => void;
}

const paymentBadge: Record<string, string> = {
  pending: "bg-orange-100 text-orange-700",
  paid: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
  refunded: "bg-blue-100 text-blue-700",
};
const statusBadge: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  processing: "bg-blue-100 text-blue-700",
  packed: "bg-purple-100 text-purple-700",
  shipped: "bg-orange-100 text-orange-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const nextStatus: Record<string, string> = {
  pending: "processing",
  processing: "packed",
  packed: "shipped",
};

const AdminDashboard = ({ onNavigate }: DashboardProps) => {
  const { data: orders = [], isLoading: ordersLoading } = useOrders();
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const updateStatus = useUpdateOrderStatus();

  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const weekAgo = new Date(now.getTime() - 7 * 86400000);
  const monthAgo = new Date(now.getFullYear(), now.getMonth(), 1);

  const todayOrders = orders.filter(o => o.created_at.startsWith(today));
  const weekOrders = orders.filter(o => new Date(o.created_at) >= weekAgo);
  const monthOrders = orders.filter(o => new Date(o.created_at) >= monthAgo);

  const todayRev = todayOrders.reduce((s, o) => s + Number(o.total_amount), 0);
  const weekRev = weekOrders.reduce((s, o) => s + Number(o.total_amount), 0);
  const monthRev = monthOrders.reduce((s, o) => s + Number(o.total_amount), 0);
  const totalRev = orders.reduce((s, o) => s + Number(o.total_amount), 0);

  const pending = orders.filter(o => o.order_status === "pending");
  const processing = orders.filter(o => o.order_status === "processing");
  const shipped = orders.filter(o => o.order_status === "shipped");
  const lowStock = products.filter(p => (p as any).stock_count <= (p as any).low_stock_threshold);
  const outOfStock = products.filter(p => p.stock_status === "out_of_stock");

  // Pending actions
  const pendingActions: { label: string; count: number; tab: string }[] = [];
  if (pending.length) pendingActions.push({ label: "orders unprocessed", count: pending.length, tab: "orders" });
  if (outOfStock.length) pendingActions.push({ label: "items out of stock", count: outOfStock.length, tab: "inventory" });

  const handleAdvance = async (order: DbOrder) => {
    const next = nextStatus[order.order_status];
    if (!next) return;
    if (next === "shipped") {
      const tracking = prompt("Enter tracking number (optional):");
      if (tracking !== null) {
        await supabase.from("orders").update({ tracking_number: tracking }).eq("id", order.id);
      }
    }
    updateStatus.mutate({ id: order.id, status: next });
    // Log status history
    await supabase.from("order_status_history").insert({
      order_id: order.id,
      from_status: order.order_status,
      to_status: next,
    });
    toast.success(`Order ${order.order_number} → ${next}`);
  };

  // Recent unique customers from orders
  const customerMap = new Map<string, { name: string; phone: string; count: number; total: number }>();
  orders.forEach(o => {
    const key = o.customer_email || o.customer_phone;
    const existing = customerMap.get(key);
    if (existing) {
      existing.count++;
      existing.total += Number(o.total_amount);
    } else {
      customerMap.set(key, { name: o.customer_name, phone: o.customer_phone, count: 1, total: Number(o.total_amount) });
    }
  });
  const recentCustomers = Array.from(customerMap.entries()).slice(0, 5);

  const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;

  if (ordersLoading || productsLoading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Pending Actions Bar */}
      {pendingActions.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex flex-wrap items-center gap-2 text-sm">
          <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
          <span className="text-amber-800 font-medium">
            {pendingActions.map((a, i) => (
              <span key={a.tab}>
                {i > 0 && " · "}
                <button onClick={() => onNavigate(a.tab)} className="underline hover:no-underline">
                  {a.count} {a.label}
                </button>
              </span>
            ))}
          </span>
          <button onClick={() => onNavigate("orders")} className="ml-auto text-amber-700 font-medium flex items-center gap-1 hover:underline">
            Review Now <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      )}

      {/* Revenue Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Today's Revenue", value: fmt(todayRev), icon: "₹" },
          { label: "This Week", value: fmt(weekRev), icon: "₹" },
          { label: "This Month", value: fmt(monthRev), icon: "₹" },
          { label: "All Time", value: fmt(totalRev), icon: "₹" },
        ].map(c => (
          <Card key={c.label} className="border">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">{c.label}</p>
              <p className="font-serif text-2xl font-bold text-foreground">{c.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Order Status Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Today's Orders", value: todayOrders.length, color: "bg-yellow-50 border-yellow-200", textColor: "text-yellow-700" },
          { label: "Pending", value: pending.length, color: "bg-blue-50 border-blue-200", textColor: "text-blue-700" },
          { label: "Processing", value: processing.length, color: "bg-purple-50 border-purple-200", textColor: "text-purple-700" },
          { label: "Shipped", value: shipped.length, color: "bg-orange-50 border-orange-200", textColor: "text-orange-700" },
        ].map(c => (
          <div key={c.label} className={`rounded-lg border p-4 ${c.color}`}>
            <p className="text-xs text-muted-foreground mb-1">{c.label}</p>
            <p className={`font-serif text-3xl font-bold ${c.textColor}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Live Order Feed */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <h2 className="font-serif text-xl font-semibold">Live Orders</h2>
          <span className="flex items-center gap-1 text-xs text-green-600">
            <CircleDot className="h-3 w-3 animate-pulse" /> Real-time
          </span>
        </div>
        <div className="border rounded-lg divide-y">
          {orders.slice(0, 20).map(order => (
            <div key={order.id} className="p-3 flex flex-wrap items-center gap-2 md:gap-4 text-sm hover:bg-accent/30 transition-colors">
              <span className="text-xs text-muted-foreground w-16 shrink-0">
                {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
              </span>
              <span className="font-mono text-xs font-medium">{order.order_number}</span>
              <span className="font-medium truncate max-w-[120px]">{order.customer_name}</span>
              <span className="font-serif font-semibold">{fmt(Number(order.total_amount))}</span>
              <span className={`text-xs px-2 py-0.5 rounded ${paymentBadge[order.payment_status] || ""}`}>{order.payment_status}</span>
              <span className={`text-xs px-2 py-0.5 rounded ${statusBadge[order.order_status] || ""}`}>{order.order_status}</span>
              {nextStatus[order.order_status] && (
                <Button size="sm" variant="outline" className="ml-auto text-xs h-7" onClick={() => handleAdvance(order)}>
                  → {nextStatus[order.order_status]}
                </Button>
              )}
            </div>
          ))}
          {orders.length === 0 && <p className="text-center text-muted-foreground py-8">No orders yet</p>}
        </div>
        {orders.length > 20 && (
          <button onClick={() => onNavigate("orders")} className="text-sm text-primary hover:underline mt-2 flex items-center gap-1">
            View All ({orders.length}) <ArrowRight className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Two Column Bottom */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alerts */}
        <div>
          <h3 className="font-serif text-lg font-semibold mb-3">Low Stock Alerts</h3>
          {lowStock.length === 0 ? (
            <div className="border rounded-lg p-4 text-center text-green-600 text-sm">✅ All stock levels healthy</div>
          ) : (
            <div className="border rounded-lg divide-y">
              {lowStock.map(p => (
                <div key={p.id} className="p-3 flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.craft_type}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-destructive">{(p as any).stock_count} left</span>
                    <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => onNavigate("inventory")}>Update</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Customers */}
        <div>
          <h3 className="font-serif text-lg font-semibold mb-3">Recent Customers</h3>
          <div className="border rounded-lg divide-y">
            {recentCustomers.map(([key, c]) => (
              <div key={key} className="p-3 flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.phone}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs">{c.count} order{c.count > 1 ? "s" : ""}</p>
                  <p className="font-serif font-semibold text-sm">{fmt(c.total)}</p>
                </div>
              </div>
            ))}
            {recentCustomers.length === 0 && <p className="text-center text-muted-foreground py-4 text-sm">No customers yet</p>}
          </div>
        </div>
      </div>

      {/* GST Quick Access — mobile only */}
      <div className="md:hidden">
        <button
          onClick={() => onNavigate("gst")}
          className="w-full border rounded-lg p-4 flex items-center justify-between hover:bg-accent/30 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🧾</span>
            <div className="text-left">
              <p className="font-medium text-sm">GST Report</p>
              <p className="text-xs text-muted-foreground">View tax summaries & filings</p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;
