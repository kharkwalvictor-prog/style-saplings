import { useState, useMemo } from "react";
import { useOrders, DbOrder } from "@/hooks/useOrders";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Loader2, MessageSquare, Mail, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { toast } from "sonner";

interface Customer {
  email: string;
  name: string;
  phone: string;
  orderCount: number;
  totalSpent: number;
  lastOrder: string;
  firstOrder: string;
  orders: DbOrder[];
}

const segmentFilters = ["all", "repeat", "high-value", "cod", "inactive"] as const;

const AdminCustomers = () => {
  const { data: orders = [], isLoading } = useOrders();
  const [segment, setSegment] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Customer | null>(null);

  const customers = useMemo(() => {
    const map = new Map<string, Customer>();
    orders.forEach(o => {
      const key = (o.customer_email || o.customer_phone).trim().toLowerCase();
      const existing = map.get(key);
      if (existing) {
        existing.orderCount++;
        existing.totalSpent += Number(o.total_amount);
        if (o.created_at > existing.lastOrder) existing.lastOrder = o.created_at;
        if (o.created_at < existing.firstOrder) existing.firstOrder = o.created_at;
        existing.orders.push(o);
      } else {
        map.set(key, {
          email: o.customer_email, name: o.customer_name, phone: o.customer_phone,
          orderCount: 1, totalSpent: Number(o.total_amount),
          lastOrder: o.created_at, firstOrder: o.created_at, orders: [o],
        });
      }
    });
    return Array.from(map.values()).sort((a, b) => b.lastOrder.localeCompare(a.lastOrder));
  }, [orders]);

  const sixtyDaysAgo = new Date(Date.now() - 60 * 86400000).toISOString();

  const filtered = useMemo(() => {
    let list = customers;
    if (segment === "repeat") list = list.filter(c => c.orderCount >= 2);
    else if (segment === "high-value") list = list.filter(c => c.totalSpent >= 3000);
    else if (segment === "cod") list = list.filter(c => c.orders.every(o => o.payment_method === "cod"));
    else if (segment === "inactive") list = list.filter(c => c.lastOrder < sixtyDaysAgo);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(c => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.phone.includes(q));
    }
    return list;
  }, [customers, segment, search, sixtyDaysAgo]);

  const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {segmentFilters.map(s => (
          <button key={s} onClick={() => setSegment(s)}
            className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
              segment === s ? "bg-primary text-primary-foreground border-primary" : "hover:bg-accent border-border"
            }`}>
            {s === "all" ? "All" : s === "repeat" ? "Repeat" : s === "high-value" ? "High Value" : s === "cod" ? "COD Only" : "Inactive (60d)"}
          </button>
        ))}
      </div>

      <Input placeholder="Search name, email, phone..." value={search} onChange={e => setSearch(e.target.value)} className="h-9" />

      {/* Desktop Table */}
      <div className="hidden md:block border rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-accent/30"><tr>
            <th className="text-left p-3 font-medium">Name</th>
            <th className="text-left p-3 font-medium">Phone</th>
            <th className="text-left p-3 font-medium">Email</th>
            <th className="text-left p-3 font-medium">Orders</th>
            <th className="text-left p-3 font-medium">Total Spent</th>
            <th className="text-left p-3 font-medium">Last Order</th>
          </tr></thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.email} className="border-t hover:bg-accent/10 cursor-pointer" onClick={() => setSelected(c)}>
                <td className="p-3 font-medium">{c.name}</td>
                <td className="p-3 text-xs">{c.phone}</td>
                <td className="p-3 text-xs">{c.email}</td>
                <td className="p-3">{c.orderCount}</td>
                <td className="p-3 font-serif font-semibold">{fmt(c.totalSpent)}</td>
                <td className="p-3 text-xs text-muted-foreground">{format(new Date(c.lastOrder), "dd MMM yyyy")}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-8 text-sm">No customers found</p>}
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {filtered.map(c => (
          <div key={c.email} className="border rounded-lg p-3 cursor-pointer hover:bg-accent/10" onClick={() => setSelected(c)}>
            <div className="flex justify-between items-center">
              <span className="font-medium">{c.name}</span>
              <span className="font-serif font-semibold text-sm">{fmt(c.totalSpent)}</span>
            </div>
            <p className="text-xs text-muted-foreground">{c.phone} · {c.orderCount} orders</p>
          </div>
        ))}
      </div>

      {/* Customer Detail Drawer */}
      <CustomerDrawer customer={selected} onClose={() => setSelected(null)} />
    </div>
  );
};

const CustomerDrawer = ({ customer, onClose }: { customer: Customer | null; onClose: () => void }) => {
  const qc = useQueryClient();
  const [newTag, setNewTag] = useState("");
  const [newNote, setNewNote] = useState("");

  const { data: tags = [] } = useQuery({
    queryKey: ["customer-tags", customer?.email],
    queryFn: async () => {
      if (!customer) return [];
      const { data } = await supabase.from("customer_tags").select("*").eq("customer_email", customer.email).order("created_at");
      return data || [];
    },
    enabled: !!customer,
  });

  const { data: notes = [] } = useQuery({
    queryKey: ["customer-notes", customer?.email],
    queryFn: async () => {
      if (!customer) return [];
      const { data } = await supabase.from("customer_notes").select("*").eq("customer_email", customer.email).order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!customer,
  });

  const addTag = async () => {
    if (!newTag.trim() || !customer) return;
    await supabase.from("customer_tags").insert({ customer_email: customer.email, tag: newTag.trim() });
    setNewTag("");
    qc.invalidateQueries({ queryKey: ["customer-tags", customer.email] });
  };

  const removeTag = async (id: string) => {
    await supabase.from("customer_tags").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["customer-tags", customer?.email] });
  };

  const addNote = async () => {
    if (!newNote.trim() || !customer) return;
    await supabase.from("customer_notes").insert({ customer_email: customer.email, note: newNote.trim() });
    setNewNote("");
    qc.invalidateQueries({ queryKey: ["customer-notes", customer.email] });
    toast.success("Note added");
  };

  const sendWhatsApp = () => {
    if (!customer) return;
    const phone = customer.phone.replace(/\D/g, "");
    window.open(`https://wa.me/${phone.startsWith("91") ? phone : "91" + phone}`, "_blank");
  };

  if (!customer) return null;

  const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;
  const avgValue = customer.orderCount > 0 ? Math.round(customer.totalSpent / customer.orderCount) : 0;

  // Auto-tags
  const autoTags: string[] = [];
  if (customer.orderCount >= 2) autoTags.push("🟢 Repeat Customer");
  if (customer.totalSpent >= 3000) autoTags.push("🟡 High Value");
  if (customer.orders.every(o => o.payment_method === "cod")) autoTags.push("🔵 COD Customer");
  if (customer.orders.some(o => {
    const items = (o.items as any[]) || [];
    return items.some((i: any) => i.craft_type === "Festive" || (i.name || "").toLowerCase().includes("festive"));
  })) autoTags.push("🟠 Festive Buyer");

  return (
    <Sheet open={!!customer} onOpenChange={() => onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-serif">{customer.name}</SheetTitle>
          <p className="text-sm text-muted-foreground">{customer.phone} · {customer.email}</p>
          <p className="text-xs text-muted-foreground">Customer since {format(new Date(customer.firstOrder), "dd MMM yyyy")}</p>
        </SheetHeader>

        <div className="space-y-5 mt-4">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Total Orders", value: customer.orderCount },
              { label: "Total Spent", value: fmt(customer.totalSpent) },
              { label: "Avg Order", value: fmt(avgValue) },
              { label: "Last Order", value: format(new Date(customer.lastOrder), "dd MMM") },
            ].map(s => (
              <div key={s.label} className="border rounded-lg p-3">
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="font-serif text-lg font-semibold">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Tags */}
          <div className="border rounded-lg p-3">
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Tags</h4>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {autoTags.map(t => <span key={t} className="text-xs px-2 py-1 rounded-full bg-accent">{t}</span>)}
              {tags.map((t: any) => (
                <span key={t.id} className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary flex items-center gap-1">
                  {t.tag}
                  <button onClick={() => removeTag(t.id)}><X className="h-3 w-3" /></button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <Input value={newTag} onChange={e => setNewTag(e.target.value)} placeholder="Add tag..."
                className="h-8 text-xs" onKeyDown={e => e.key === "Enter" && addTag()} />
              <Button size="sm" variant="outline" className="h-8 text-xs" onClick={addTag}>Add</Button>
            </div>
          </div>

          {/* Notes */}
          <div className="border rounded-lg p-3">
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Notes</h4>
            <Textarea value={newNote} onChange={e => setNewNote(e.target.value)} placeholder="Add a note..." className="min-h-[60px] text-sm mb-2" />
            <Button size="sm" variant="outline" onClick={addNote} disabled={!newNote.trim()}>Save Note</Button>
            {notes.map((n: any) => (
              <div key={n.id} className="border-t mt-2 pt-2">
                <p className="text-sm">{n.note}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{format(new Date(n.created_at), "dd MMM yyyy, hh:mm a")}</p>
              </div>
            ))}
          </div>

          {/* Order History */}
          <div className="border rounded-lg p-3">
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Order History</h4>
            {customer.orders.map(o => (
              <div key={o.id} className="flex items-center justify-between py-2 border-t first:border-0 text-sm">
                <div>
                  <p className="font-mono text-xs">{o.order_number}</p>
                  <p className="text-xs text-muted-foreground">{format(new Date(o.created_at), "dd MMM yyyy")}</p>
                </div>
                <p className="font-serif font-semibold">{fmt(Number(o.total_amount))}</p>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={sendWhatsApp}>
              <MessageSquare className="h-4 w-4 mr-1" /> WhatsApp
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => window.open(`mailto:${customer.email}`)}>
              <Mail className="h-4 w-4 mr-1" /> Email
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AdminCustomers;
