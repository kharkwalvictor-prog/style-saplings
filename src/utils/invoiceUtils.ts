import { DbOrder } from "@/hooks/useOrders";
import { format } from "date-fns";
import { calculateGST, numberToWords, round2, STATE_CODES } from "@/utils/gstUtils";

export interface GSTConfig {
  gstin: string;
  legal_name: string;
  trade_name: string;
  address: string;
  state: string;
  state_code: string;
}

const DEFAULT_BUSINESS: GSTConfig = {
  trade_name: "STYLE SAPLINGS",
  legal_name: "Shivaya Enterprises",
  address: "6488, C6, Vasant Kunj, New Delhi - 110070",
  gstin: "07BEGPK0002P1ZN",
  state: "Delhi",
  state_code: "07",
};

export const generateInvoiceHTML = (order: DbOrder, invoiceNumber?: string, gstConfig?: GSTConfig): string => {
  const BUSINESS = gstConfig || DEFAULT_BUSINESS;
  const items = (order.items as any[]) || [];
  const address = order.shipping_address as any;
  const shipping = Number(order.total_amount) >= 999 ? 0 : 99;
  const customerState = address?.state || "";
  const supplyType = (order as any).supply_type || (customerState.toLowerCase() === "delhi" ? "intra" : "inter");
  const isIntra = supplyType === "intra";
  const customerStateCode = STATE_CODES[customerState] || "";

  // Calculate GST per item
  const gstItems = items.map((item: any) => {
    const lineTotal = item.price * item.quantity;
    const gst = calculateGST(lineTotal, customerState, item.hsn_code || "62099090");
    return { ...item, ...gst };
  });

  const subtotalExclGST = round2(gstItems.reduce((s, i) => s + i.basePrice, 0));
  const totalCGST = round2(gstItems.reduce((s, i) => s + i.cgst, 0));
  const totalSGST = round2(gstItems.reduce((s, i) => s + i.sgst, 0));
  const totalIGST = round2(gstItems.reduce((s, i) => s + i.igst, 0));
  const totalGST = round2(totalCGST + totalSGST + totalIGST);
  const preRound = round2(subtotalExclGST + totalGST + shipping);
  const grandTotal = Math.round(preRound);
  const roundOff = round2(grandTotal - preRound);

  const invNo =
    invoiceNumber || `INV-${format(new Date(order.created_at), "yyyyMM")}-${order.order_number.replace("SS-", "")}`;
  const fmt = (n: number) => `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // Group by GST rate for summary
  const rateMap = new Map<number, { taxable: number; cgst: number; sgst: number; igst: number }>();
  gstItems.forEach((gi) => {
    const e = rateMap.get(gi.gstRate) || { taxable: 0, cgst: 0, sgst: 0, igst: 0 };
    e.taxable += gi.basePrice;
    e.cgst += gi.cgst;
    e.sgst += gi.sgst;
    e.igst += gi.igst;
    rateMap.set(gi.gstRate, e);
  });

  const itemRows = gstItems
    .map(
      (item: any, idx: number) => `
    <tr>
      <td style="padding:8px;border:1px solid #ddd;text-align:center">${idx + 1}</td>
      <td style="padding:8px;border:1px solid #ddd">${item.name}${item.size ? ` - Size ${item.size}` : ""}</td>
      <td style="padding:8px;border:1px solid #ddd;text-align:center">${item.hsnCode}</td>
      <td style="padding:8px;border:1px solid #ddd;text-align:center">${item.quantity}</td>
      <td style="padding:8px;border:1px solid #ddd;text-align:right">${fmt(item.basePrice / item.quantity)}</td>
      <td style="padding:8px;border:1px solid #ddd;text-align:center">${item.gstRate}%</td>
      <td style="padding:8px;border:1px solid #ddd;text-align:right">${fmt(item.gstAmount)}</td>
      <td style="padding:8px;border:1px solid #ddd;text-align:right">${fmt(item.inclusivePrice)}</td>
    </tr>
  `,
    )
    .join("");

  const taxSummaryRows = Array.from(rateMap.entries())
    .map(([rate, d]) => {
      if (isIntra) {
        return `
        <tr><td style="padding:4px 8px;text-align:right">CGST @ ${rate / 2}%:</td><td style="padding:4px 8px;text-align:right;width:120px">${fmt(round2(d.cgst))}</td></tr>
        <tr><td style="padding:4px 8px;text-align:right">SGST @ ${rate / 2}%:</td><td style="padding:4px 8px;text-align:right">${fmt(round2(d.sgst))}</td></tr>`;
      }
      return `<tr><td style="padding:4px 8px;text-align:right">IGST @ ${rate}%:</td><td style="padding:4px 8px;text-align:right;width:120px">${fmt(round2(d.igst))}</td></tr>`;
    })
    .join("");

  return `<!DOCTYPE html><html><head><title>Tax Invoice ${invNo}</title>
<style>
@media print { body { margin:0; } .no-print { display:none!important; } }
body { font-family:'Inter',Arial,sans-serif; color:#333; max-width:800px; margin:0 auto; padding:30px; font-size:13px; }
table { border-collapse:collapse; width:100%; }
.header { display:flex; justify-content:space-between; margin-bottom:20px; padding-bottom:15px; border-bottom:2px solid #2D4A27; }
.print-btn { display:block; margin:15px auto; padding:10px 30px; background:#4A6741; color:white; border:none; border-radius:6px; font-size:14px; cursor:pointer; }
</style></head><body>
<button class="print-btn no-print" onclick="window.print()">🖨️ Print / Save as PDF</button>

<div class="header">
  <div>
    <h1 style="font-size:22px;color:#C4622D;margin:0;letter-spacing:2px">TAX INVOICE</h1>
    <p style="margin:4px 0;font-size:12px">Invoice No: <strong>${invNo}</strong></p>
    <p style="margin:2px 0;font-size:12px">Invoice Date: ${format(new Date(order.created_at), "dd/MM/yyyy")}</p>
    <p style="margin:2px 0;font-size:12px">Order No: ${order.order_number}</p>
  </div>
  <div style="text-align:right">
    <h2 style="font-size:18px;color:#2D4A27;margin:0">${BUSINESS.trade_name}</h2>
    <p style="margin:2px 0;font-size:12px"><strong>${BUSINESS.legal_name}</strong></p>
    <p style="margin:2px 0;font-size:12px">${BUSINESS.address}</p>
    <p style="margin:2px 0;font-size:12px">GSTIN: ${BUSINESS.gstin}</p>
    <p style="margin:2px 0;font-size:12px">State: ${BUSINESS.state} (${BUSINESS.state_code})</p>
    <p style="margin:2px 0;font-size:12px">support@stylesaplings.com | +91-9810901031</p>
  </div>
</div>

<!-- Bill To / Ship To -->
<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px">
  <div style="border:1px solid #ddd;padding:12px;border-radius:4px">
    <h4 style="margin:0 0 8px;font-size:11px;text-transform:uppercase;color:#999;letter-spacing:1px">Bill To</h4>
    <p style="margin:2px 0;font-weight:600">${order.customer_name}</p>
    ${(order as any).customer_company_name ? `<p style="margin:2px 0">${(order as any).customer_company_name}</p>` : ""}
    ${address ? `<p style="margin:2px 0">${[address.address, address.city, address.state, address.pincode].filter(Boolean).join(", ")}</p>` : ""}
    <p style="margin:2px 0">${order.customer_phone}</p>
    <p style="margin:2px 0">${order.customer_email}</p>
    ${(order as any).customer_gstin ? `<p style="margin:2px 0;font-weight:600">GSTIN: ${(order as any).customer_gstin}</p>` : ""}
    ${customerStateCode ? `<p style="margin:2px 0;font-size:11px;color:#666">State Code: ${customerStateCode}</p>` : ""}
  </div>
  <div style="border:1px solid #ddd;padding:12px;border-radius:4px">
    <h4 style="margin:0 0 8px;font-size:11px;text-transform:uppercase;color:#999;letter-spacing:1px">Ship To</h4>
    <p style="margin:2px 0;font-weight:600">${order.customer_name}</p>
    ${address ? `<p style="margin:2px 0">${[address.address, address.city, address.state, address.pincode].filter(Boolean).join(", ")}</p>` : ""}
  </div>
</div>

<!-- Items Table -->
<table style="margin-bottom:15px">
  <thead>
    <tr style="background:#f5f2ec">
      <th style="padding:8px;border:1px solid #ddd;text-align:center;width:35px;font-size:11px">Sr#</th>
      <th style="padding:8px;border:1px solid #ddd;text-align:left;font-size:11px">Description</th>
      <th style="padding:8px;border:1px solid #ddd;text-align:center;font-size:11px;width:80px">HSN</th>
      <th style="padding:8px;border:1px solid #ddd;text-align:center;font-size:11px;width:40px">Qty</th>
      <th style="padding:8px;border:1px solid #ddd;text-align:right;font-size:11px;width:90px">Unit Price<br/>(excl GST)</th>
      <th style="padding:8px;border:1px solid #ddd;text-align:center;font-size:11px;width:50px">GST%</th>
      <th style="padding:8px;border:1px solid #ddd;text-align:right;font-size:11px;width:80px">GST Amt</th>
      <th style="padding:8px;border:1px solid #ddd;text-align:right;font-size:11px;width:90px">Total<br/>(incl GST)</th>
    </tr>
  </thead>
  <tbody>${itemRows}</tbody>
</table>

<!-- Totals -->
<div style="display:flex;justify-content:flex-end">
  <table style="width:320px">
    <tr><td style="padding:4px 8px;text-align:right">Subtotal (excl. GST):</td><td style="padding:4px 8px;text-align:right;width:120px">${fmt(subtotalExclGST)}</td></tr>
    ${taxSummaryRows}
    <tr><td style="padding:4px 8px;text-align:right">Shipping:</td><td style="padding:4px 8px;text-align:right">${shipping === 0 ? "FREE" : fmt(shipping)}</td></tr>
    ${roundOff !== 0 ? `<tr><td style="padding:4px 8px;text-align:right">Round Off:</td><td style="padding:4px 8px;text-align:right">${roundOff > 0 ? "+" : ""}${fmt(roundOff)}</td></tr>` : ""}
    <tr style="border-top:2px solid #2D4A27;font-weight:bold;font-size:16px">
      <td style="padding:8px;text-align:right">GRAND TOTAL:</td>
      <td style="padding:8px;text-align:right;color:#2D4A27">${fmt(grandTotal)}</td>
    </tr>
  </table>
</div>

<p style="font-size:12px;margin-top:8px;text-align:right;color:#555;font-style:italic">${numberToWords(grandTotal)}</p>

<!-- Payment -->
<div style="border:1px solid #ddd;padding:12px;border-radius:4px;margin-top:20px">
  <h4 style="margin:0 0 6px;font-size:11px;text-transform:uppercase;color:#999;letter-spacing:1px">Payment Details</h4>
  <p style="margin:2px 0">Payment Method: ${order.payment_method.toUpperCase()}</p>
  <p style="margin:2px 0">Payment Status: ${order.payment_status.toUpperCase()}</p>
  ${order.razorpay_order_id ? `<p style="margin:2px 0">Transaction ID: ${order.razorpay_order_id}</p>` : ""}
</div>

<!-- Footer -->
<div style="margin-top:30px;padding-top:15px;border-top:1px solid #eee;text-align:center;font-size:11px;color:#999">
  <p>This is a computer generated invoice and does not require a signature.</p>
  <p>Goods once sold will not be taken back or exchanged except as per our Returns Policy at stylesaplings.com/refund-policy</p>
  <p>For any queries contact: support@stylesaplings.com</p>
</div>

</body></html>`;
};

export const printInvoice = (order: DbOrder, gstConfig?: GSTConfig) => {
  const html = generateInvoiceHTML(order, undefined, gstConfig);
  const win = window.open("", "_blank");
  if (win) {
    win.document.write(html);
    win.document.close();
  }
};

export const printMultipleInvoices = (orders: DbOrder[], gstConfig?: GSTConfig) => {
  const pages = orders
    .map((o) => generateInvoiceHTML(o, undefined, gstConfig))
    .join('<div style="page-break-after:always"></div>');
  const win = window.open("", "_blank");
  if (win) {
    win.document.write(pages);
    win.document.close();
  }
};

export const exportOrdersCSV = (orders: DbOrder[]) => {
  const headers = [
    "Order #",
    "Date",
    "Customer",
    "Phone",
    "Email",
    "Total",
    "Payment Method",
    "Payment Status",
    "Order Status",
    "Supply Type",
    "GSTIN",
    "Company",
  ];
  const rows = orders.map((o) => [
    o.order_number,
    format(new Date(o.created_at), "yyyy-MM-dd HH:mm"),
    o.customer_name,
    o.customer_phone,
    o.customer_email,
    String(o.total_amount),
    o.payment_method,
    o.payment_status,
    o.order_status,
    (o as any).supply_type || "",
    (o as any).customer_gstin || "",
    (o as any).customer_company_name || "",
  ]);
  const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `orders-${format(new Date(), "yyyy-MM-dd")}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

export const exportGSTR1CSV = (orders: DbOrder[]) => {
  const headers = [
    "Invoice No",
    "Invoice Date",
    "Customer Name",
    "Customer GSTIN",
    "Customer State",
    "Supply Type",
    "Taxable Value",
    "CGST",
    "SGST",
    "IGST",
    "Invoice Total",
    "HSN Code",
    "GST Rate",
  ];
  const rows: string[][] = [];

  orders.forEach((o) => {
    const address = o.shipping_address as any;
    const customerState = address?.state || "";
    const gstBreakdowns = (o as any).gst_breakdowns as any[] | null;

    if (gstBreakdowns && gstBreakdowns.length > 0) {
      gstBreakdowns.forEach((g: any) => {
        rows.push([
          `INV-${format(new Date(o.created_at), "yyyyMM")}-${o.order_number.replace("SS-", "")}`,
          format(new Date(o.created_at), "dd/MM/yyyy"),
          o.customer_name,
          (o as any).customer_gstin || "B2C",
          customerState,
          (o as any).supply_type || "",
          String(round2(g.basePrice || 0)),
          String(round2(g.cgst || 0)),
          String(round2(g.sgst || 0)),
          String(round2(g.igst || 0)),
          String(round2(g.inclusivePrice || 0)),
          g.hsnCode || "62099090",
          String(g.gstRate || 0),
        ]);
      });
    } else {
      // Fallback for old orders without breakdowns
      const items = (o.items as any[]) || [];
      items.forEach((item) => {
        const lineTotal = item.price * item.quantity;
        const gst = calculateGST(lineTotal, customerState, item.hsn_code || "62099090");
        rows.push([
          `INV-${format(new Date(o.created_at), "yyyyMM")}-${o.order_number.replace("SS-", "")}`,
          format(new Date(o.created_at), "dd/MM/yyyy"),
          o.customer_name,
          (o as any).customer_gstin || "B2C",
          customerState,
          gst.supplyType,
          String(gst.basePrice),
          String(gst.cgst),
          String(gst.sgst),
          String(gst.igst),
          String(gst.inclusivePrice),
          gst.hsnCode,
          String(gst.gstRate),
        ]);
      });
    }
  });

  const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `GSTR1-${format(new Date(), "yyyy-MM")}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

const round2Local = (n: number) => Math.round(n * 100) / 100;
