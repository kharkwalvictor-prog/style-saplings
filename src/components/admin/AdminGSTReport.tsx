import { useState, useMemo } from "react";
import { useOrders } from "@/hooks/useOrders";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Loader2, Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { calculateGST, round2 } from "@/utils/gstUtils";
import { exportGSTR1CSV } from "@/utils/invoiceUtils";
import { toast } from "sonner";

const AdminGSTReport = () => {
  const { data: orders = [], isLoading } = useOrders();
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(format(now, "yyyy-MM"));

  // Generate last 12 months
  const months = useMemo(() => {
    const m: string[] = [];
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      m.push(format(d, "yyyy-MM"));
    }
    return m;
  }, []);

  const monthOrders = useMemo(() =>
    orders.filter(o => o.created_at.startsWith(selectedMonth)),
  [orders, selectedMonth]);

  const summary = useMemo(() => {
    let totalSales = 0;
    let totalTaxable = 0;
    let totalCGST = 0;
    let totalSGST = 0;
    let totalIGST = 0;
    let gst5Total = 0;
    let intraCount = 0;
    let interCount = 0;
    let b2bCount = 0;

    monthOrders.forEach(o => {
      totalSales += Number(o.total_amount);
      const address = o.shipping_address as any;
      const customerState = address?.state || "";
      const isIntra = customerState.toLowerCase() === "delhi";
      if (isIntra) intraCount++; else interCount++;
      if ((o as any).customer_gstin) b2bCount++;

      const breakdowns = (o as any).gst_breakdowns as any[] | null;
      if (breakdowns && breakdowns.length > 0) {
        breakdowns.forEach((g: any) => {
          totalTaxable += g.basePrice || 0;
          totalCGST += g.cgst || 0;
          totalSGST += g.sgst || 0;
          totalIGST += g.igst || 0;
          if (g.gstRate === 5) gst5Total += (g.cgst || 0) + (g.sgst || 0) + (g.igst || 0);
        });
      } else {
        const items = (o.items as any[]) || [];
        items.forEach(item => {
          const lineTotal = item.price * item.quantity;
          const gst = calculateGST(lineTotal, customerState, item.hsn_code || "62099090");
          totalTaxable += gst.basePrice;
          totalCGST += gst.cgst;
          totalSGST += gst.sgst;
          totalIGST += gst.igst;
          if (gst.gstRate === 5) gst5Total += gst.gstAmount;
        });
      }
    });

    return {
      totalSales: round2(totalSales),
      totalTaxable: round2(totalTaxable),
      totalCGST: round2(totalCGST),
      totalSGST: round2(totalSGST),
      totalIGST: round2(totalIGST),
      totalGST: round2(totalCGST + totalSGST + totalIGST),
      gst5Total: round2(gst5Total),
      intraCount, interCount, b2bCount,
      totalOrders: monthOrders.length,
    };
  }, [monthOrders]);

  const handleBulkInvoiceDownload = async () => {
    if (monthOrders.length === 0) return;
    toast.loading(`Fetching invoices for ${monthOrders.length} orders...`, { id: "bulk-inv" });
    let opened = 0;
    for (const o of monthOrders) {
      try {
        const { data } = await supabase.functions.invoke("generate-invoice", {
          body: { order_id: o.id },
        });
        if (data?.signedUrl) {
          window.open(data.signedUrl, "_blank");
          opened++;
        }
      } catch {
        // skip individual failures
      }
    }
    toast.success(`Opened ${opened} invoice(s)`, { id: "bulk-inv" });
  };

  const fmt = (n: number) => `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-serif text-xl font-semibold">GST Report</h2>
        <div className="flex items-center gap-2">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[160px] h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months.map(m => (
                <SelectItem key={m} value={m}>{format(new Date(m + "-01"), "MMMM yyyy")}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" className="h-9" onClick={() => exportGSTR1CSV(monthOrders)}>
            <Download className="h-4 w-4 mr-1" /> GSTR-1 CSV
          </Button>
          <Button size="sm" variant="outline" className="h-9" onClick={() => handleBulkInvoiceDownload()}>
            <FileText className="h-4 w-4 mr-1" /> Invoices
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground mb-1">Total Sales (incl GST)</p>
          <p className="font-serif text-xl font-bold">{fmt(summary.totalSales)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground mb-1">Total Taxable Value</p>
          <p className="font-serif text-xl font-bold">{fmt(summary.totalTaxable)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground mb-1">Total GST Liability</p>
          <p className="font-serif text-xl font-bold">{fmt(summary.totalGST)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground mb-1">Orders</p>
          <p className="font-serif text-xl font-bold">{summary.totalOrders}</p>
        </CardContent></Card>
      </div>

      {/* Tax Breakdown */}
      <div className="border rounded-lg p-5 space-y-3">
        <h3 className="font-serif text-lg font-semibold">Tax Breakdown</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between border-b pb-2">
            <span className="text-muted-foreground">CGST Collected</span>
            <span className="font-semibold">{fmt(summary.totalCGST)}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-muted-foreground">SGST Collected</span>
            <span className="font-semibold">{fmt(summary.totalSGST)}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-muted-foreground">IGST Collected</span>
            <span className="font-semibold">{fmt(summary.totalIGST)}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-muted-foreground">GST on 5% items</span>
            <span className="font-semibold">{fmt(summary.gst5Total)}</span>
          </div>
          <div className="flex justify-between pt-1 font-serif font-bold text-base">
            <span>Total GST Liability</span>
            <span>{fmt(summary.totalGST)}</span>
          </div>
        </div>
      </div>

      {/* Order Stats */}
      <div className="border rounded-lg p-5 space-y-2">
        <h3 className="font-serif text-lg font-semibold">Order Distribution</h3>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center border rounded p-3">
            <p className="text-2xl font-bold font-serif">{summary.intraCount}</p>
            <p className="text-xs text-muted-foreground">Intra-state (Delhi)</p>
          </div>
          <div className="text-center border rounded p-3">
            <p className="text-2xl font-bold font-serif">{summary.interCount}</p>
            <p className="text-xs text-muted-foreground">Inter-state</p>
          </div>
          <div className="text-center border rounded p-3">
            <p className="text-2xl font-bold font-serif">{summary.b2bCount}</p>
            <p className="text-xs text-muted-foreground">B2B (with GSTIN)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminGSTReport;
