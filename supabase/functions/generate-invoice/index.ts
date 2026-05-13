import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// GST calculation helpers (mirrored from client-side gstUtils)
const SELLER_STATE = "Delhi";
const STATE_CODES: Record<string, string> = {
  "Jammu and Kashmir": "01", "Himachal Pradesh": "02", "Punjab": "03",
  "Chandigarh": "04", "Uttarakhand": "05", "Haryana": "06", "Delhi": "07",
  "Rajasthan": "08", "Uttar Pradesh": "09", "Bihar": "10",
  "Sikkim": "11", "Arunachal Pradesh": "12", "Nagaland": "13",
  "Manipur": "14", "Mizoram": "15", "Tripura": "16", "Meghalaya": "17",
  "Assam": "18", "West Bengal": "19", "Jharkhand": "20",
  "Odisha": "21", "Chhattisgarh": "22", "Madhya Pradesh": "23",
  "Gujarat": "24", "Dadra and Nagar Haveli and Daman and Diu": "26",
  "Maharashtra": "27", "Andhra Pradesh": "37", "Karnataka": "29",
  "Goa": "30", "Lakshadweep": "31", "Kerala": "32", "Tamil Nadu": "33",
  "Puducherry": "34", "Andaman and Nicobar Islands": "35",
  "Telangana": "36", "Ladakh": "38",
};

const round2 = (n: number) => Math.round(n * 100) / 100;
const getGSTRate = (price: number) => price < 1000 ? 5 : 12;

const calculateGST = (inclusivePrice: number, customerState: string, hsnCode = "62099090") => {
  const gstRate = getGSTRate(inclusivePrice);
  const basePrice = round2(inclusivePrice / (1 + gstRate / 100));
  const gstAmount = round2(inclusivePrice - basePrice);
  const isIntra = customerState.toLowerCase().trim() === SELLER_STATE.toLowerCase();
  return {
    inclusivePrice, gstRate, gstAmount, basePrice,
    supplyType: isIntra ? "intra" : "inter",
    cgst: isIntra ? round2(gstAmount / 2) : 0,
    sgst: isIntra ? round2(gstAmount / 2) : 0,
    igst: isIntra ? 0 : gstAmount,
    hsnCode,
  };
};

const numberToWords = (num: number): string => {
  if (num === 0) return "Zero";
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const convert = (n: number): string => {
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
    if (n < 1000) return ones[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " and " + convert(n % 100) : "");
    if (n < 100000) return convert(Math.floor(n / 1000)) + " Thousand" + (n % 1000 ? " " + convert(n % 1000) : "");
    if (n < 10000000) return convert(Math.floor(n / 100000)) + " Lakh" + (n % 100000 ? " " + convert(n % 100000) : "");
    return convert(Math.floor(n / 10000000)) + " Crore" + (n % 10000000 ? " " + convert(n % 10000000) : "");
  };
  const rupees = Math.floor(num);
  const paise = Math.round((num - rupees) * 100);
  let result = "Rupees " + convert(rupees);
  if (paise > 0) result += " and " + convert(paise) + " Paise";
  return result + " Only";
};

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}/${d.getFullYear()}`;
};

const formatYearMonth = (dateStr: string) => {
  const d = new Date(dateStr);
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}`;
};

const fmt = (n: number) => `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function generateInvoiceHTML(order: any, invoiceNumber: string, business: any): string {
  const items = (order.items as any[]) || [];
  const address = order.shipping_address as any;
  const shipping = Number(order.total_amount) >= 999 ? 0 : 99;
  const customerState = address?.state || "";
  const supplyType = order.supply_type || (customerState.toLowerCase() === "delhi" ? "intra" : "inter");
  const isIntra = supplyType === "intra";
  const customerStateCode = STATE_CODES[customerState] || "";

  const gstItems = items.map((item: any) => {
    const lineTotal = item.price * item.quantity;
    const gst = calculateGST(lineTotal, customerState, item.hsn_code || "62099090");
    return { ...item, ...gst };
  });

  const subtotalExclGST = round2(gstItems.reduce((s: number, i: any) => s + i.basePrice, 0));
  const totalCGST = round2(gstItems.reduce((s: number, i: any) => s + i.cgst, 0));
  const totalSGST = round2(gstItems.reduce((s: number, i: any) => s + i.sgst, 0));
  const totalIGST = round2(gstItems.reduce((s: number, i: any) => s + i.igst, 0));
  const totalGST = round2(totalCGST + totalSGST + totalIGST);
  const preRound = round2(subtotalExclGST + totalGST + shipping);
  const grandTotal = Math.round(preRound);
  const roundOff = round2(grandTotal - preRound);

  const rateMap = new Map<number, { taxable: number; cgst: number; sgst: number; igst: number }>();
  gstItems.forEach((gi: any) => {
    const e = rateMap.get(gi.gstRate) || { taxable: 0, cgst: 0, sgst: 0, igst: 0 };
    e.taxable += gi.basePrice; e.cgst += gi.cgst; e.sgst += gi.sgst; e.igst += gi.igst;
    rateMap.set(gi.gstRate, e);
  });

  const itemRows = gstItems.map((item: any, idx: number) => `
    <tr>
      <td style="padding:8px;border:1px solid #ddd;text-align:center">${idx + 1}</td>
      <td style="padding:8px;border:1px solid #ddd">${item.name}${item.size ? ` - Size ${item.size}` : ''}</td>
      <td style="padding:8px;border:1px solid #ddd;text-align:center">${item.hsnCode}</td>
      <td style="padding:8px;border:1px solid #ddd;text-align:center">${item.quantity}</td>
      <td style="padding:8px;border:1px solid #ddd;text-align:right">${fmt(item.basePrice / item.quantity)}</td>
      <td style="padding:8px;border:1px solid #ddd;text-align:center">${item.gstRate}%</td>
      <td style="padding:8px;border:1px solid #ddd;text-align:right">${fmt(item.gstAmount)}</td>
      <td style="padding:8px;border:1px solid #ddd;text-align:right">${fmt(item.inclusivePrice)}</td>
    </tr>
  `).join("");

  const taxSummaryRows = Array.from(rateMap.entries()).map(([rate, d]) => {
    if (isIntra) {
      return `
        <tr><td style="padding:4px 8px;text-align:right">CGST @ ${rate / 2}%:</td><td style="padding:4px 8px;text-align:right;width:120px">${fmt(round2(d.cgst))}</td></tr>
        <tr><td style="padding:4px 8px;text-align:right">SGST @ ${rate / 2}%:</td><td style="padding:4px 8px;text-align:right">${fmt(round2(d.sgst))}</td></tr>`;
    }
    return `<tr><td style="padding:4px 8px;text-align:right">IGST @ ${rate}%:</td><td style="padding:4px 8px;text-align:right;width:120px">${fmt(round2(d.igst))}</td></tr>`;
  }).join("");

  return `<!DOCTYPE html><html><head><title>Tax Invoice ${invoiceNumber}</title>
<style>
@media print { body { margin:0; } }
body { font-family:'Inter',Arial,sans-serif; color:#333; max-width:800px; margin:0 auto; padding:30px; font-size:13px; }
table { border-collapse:collapse; width:100%; }
.header { display:flex; justify-content:space-between; margin-bottom:20px; padding-bottom:15px; border-bottom:2px solid #2D4A27; }
</style></head><body>

<div class="header">
  <div>
    <h1 style="font-size:22px;color:#C4622D;margin:0;letter-spacing:2px">TAX INVOICE</h1>
    <p style="margin:4px 0;font-size:12px">Invoice No: <strong>${invoiceNumber}</strong></p>
    <p style="margin:2px 0;font-size:12px">Invoice Date: ${formatDate(order.created_at)}</p>
    <p style="margin:2px 0;font-size:12px">Order No: ${order.order_number}</p>
  </div>
  <div style="text-align:right">
    <h2 style="font-size:18px;color:#2D4A27;margin:0">${business.trade_name || "STYLE SAPLINGS"}</h2>
    <p style="margin:2px 0;font-size:12px"><strong>${business.legal_name || "Shivaya Enterprises"}</strong></p>
    <p style="margin:2px 0;font-size:12px">${business.address || ""}</p>
    <p style="margin:2px 0;font-size:12px">GSTIN: ${business.gstin || ""}</p>
    <p style="margin:2px 0;font-size:12px">State: ${business.state || ""} (${business.state_code || ""})</p>
    <p style="margin:2px 0;font-size:12px">support@stylesaplings.com | +91-9810901031</p>
  </div>
</div>

<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px">
  <div style="border:1px solid #ddd;padding:12px;border-radius:4px">
    <h4 style="margin:0 0 8px;font-size:11px;text-transform:uppercase;color:#999;letter-spacing:1px">Bill To</h4>
    <p style="margin:2px 0;font-weight:600">${order.customer_name}</p>
    ${order.customer_company_name ? `<p style="margin:2px 0">${order.customer_company_name}</p>` : ""}
    ${address ? `<p style="margin:2px 0">${[address.address, address.city, address.state, address.pincode].filter(Boolean).join(", ")}</p>` : ""}
    <p style="margin:2px 0">${order.customer_phone}</p>
    <p style="margin:2px 0">${order.customer_email}</p>
    ${order.customer_gstin ? `<p style="margin:2px 0;font-weight:600">GSTIN: ${order.customer_gstin}</p>` : ""}
    ${customerStateCode ? `<p style="margin:2px 0;font-size:11px;color:#666">State Code: ${customerStateCode}</p>` : ""}
  </div>
  <div style="border:1px solid #ddd;padding:12px;border-radius:4px">
    <h4 style="margin:0 0 8px;font-size:11px;text-transform:uppercase;color:#999;letter-spacing:1px">Ship To</h4>
    <p style="margin:2px 0;font-weight:600">${order.customer_name}</p>
    ${address ? `<p style="margin:2px 0">${[address.address, address.city, address.state, address.pincode].filter(Boolean).join(", ")}</p>` : ""}
  </div>
</div>

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

<div style="border:1px solid #ddd;padding:12px;border-radius:4px;margin-top:20px">
  <h4 style="margin:0 0 6px;font-size:11px;text-transform:uppercase;color:#999;letter-spacing:1px">Payment Details</h4>
  <p style="margin:2px 0">Payment Method: ${order.payment_method.toUpperCase()}</p>
  <p style="margin:2px 0">Payment Status: ${order.payment_status.toUpperCase()}</p>
  ${order.razorpay_order_id ? `<p style="margin:2px 0">Transaction ID: ${order.razorpay_order_id}</p>` : ""}
</div>

<div style="margin-top:30px;padding-top:15px;border-top:1px solid #eee;text-align:center;font-size:11px;color:#999">
  <p>This is a computer generated invoice and does not require a signature.</p>
  <p>Goods once sold will not be taken back or exchanged except as per our Returns Policy at stylesaplings.com/refund-policy</p>
  <p>For any queries contact: support@stylesaplings.com</p>
</div>

</body></html>`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { order_id } = await req.json();
    if (!order_id) {
      return new Response(JSON.stringify({ error: "order_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check if invoice already exists
    const { data: existingInvoice } = await supabase
      .from("invoices")
      .select("*")
      .eq("order_id", order_id)
      .maybeSingle();

    if (existingInvoice) {
      // Generate fresh signed URL
      const { data: signedData } = await supabase.storage
        .from("invoices")
        .createSignedUrl(existingInvoice.pdf_url || "", 7 * 24 * 60 * 60); // 7 days

      return new Response(JSON.stringify({
        success: true,
        invoice_number: existingInvoice.invoice_number,
        pdf_url: existingInvoice.pdf_url,
        signedUrl: signedData?.signedUrl || null,
        existing: true,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch order
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select("*")
      .eq("id", order_id)
      .single();

    if (orderErr || !order) {
      return new Response(JSON.stringify({ error: "Order not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch GST config
    const { data: gstConfig } = await supabase
      .from("gst_config")
      .select("*")
      .order("effective_from", { ascending: false })
      .limit(1)
      .maybeSingle();

    const business = gstConfig || {
      trade_name: "STYLE SAPLINGS",
      legal_name: "Shivaya Enterprises",
      address: "6488, C6, Vasant Kunj, New Delhi - 110070",
      gstin: "",
      state: "Delhi",
      state_code: "07",
    };

    // Get next invoice number
    const yearMonth = formatYearMonth(order.created_at);
    const { data: nextNum, error: seqErr } = await supabase.rpc(
      "get_next_invoice_number",
      { p_year_month: yearMonth }
    );

    if (seqErr) {
      console.error("Invoice sequence error:", seqErr);
      throw new Error("Failed to generate invoice number");
    }

    const invoiceNumber = `INV-${yearMonth}-${String(nextNum).padStart(4, "0")}`;

    // Generate HTML invoice
    const html = generateInvoiceHTML(order, invoiceNumber, business);

    // Store as HTML file in bucket
    const d = new Date(order.created_at);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const filePath = `invoices/${yyyy}/${mm}/${invoiceNumber}-${order.order_number}.html`;

    const { error: uploadErr } = await supabase.storage
      .from("invoices")
      .upload(filePath, new Blob([html], { type: "text/html" }), {
        contentType: "text/html",
        upsert: false,
      });

    if (uploadErr) {
      console.error("Upload error:", uploadErr);
      throw new Error("Failed to upload invoice");
    }

    // Insert invoice record
    const { error: insertErr } = await supabase.from("invoices").insert({
      order_id: order.id,
      invoice_number: invoiceNumber,
      invoice_date: new Date(order.created_at).toISOString().split("T")[0],
      pdf_url: filePath,
    });

    if (insertErr) {
      console.error("Invoice insert error:", insertErr);
      throw new Error("Failed to save invoice record");
    }

    // Generate signed URL (7 day expiry)
    const { data: signedData } = await supabase.storage
      .from("invoices")
      .createSignedUrl(filePath, 7 * 24 * 60 * 60);

    return new Response(JSON.stringify({
      success: true,
      invoice_number: invoiceNumber,
      pdf_url: filePath,
      signedUrl: signedData?.signedUrl || null,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("generate-invoice error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
