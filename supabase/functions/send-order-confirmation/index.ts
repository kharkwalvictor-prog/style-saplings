import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { sendEmail } from "../_shared/sendEmail.ts";
import {
  wrapEmail, orderItemsTable, ctaButton, formatCurrency, formatDate,
} from "../_shared/emailTemplates.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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

    // Skip if already sent
    if (order.confirmation_email_sent) {
      return new Response(JSON.stringify({ skipped: true, reason: "already_sent" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const items = (order.items as any[]) || [];
    const address = order.shipping_address as any;
    const paymentLabel =
      order.payment_method === "razorpay"
        ? "Paid via Razorpay"
        : "Cash on Delivery (pending)";

    // Build customer email
    const customerHtml = wrapEmail(`
      <h1 style="font-family:Georgia,serif;font-size:24px;margin:0 0 8px;color:#333;">
        Thank you, ${order.customer_name}!
      </h1>
      <p style="font-size:16px;color:#666;margin:0 0 24px;">
        Your order has been confirmed.
      </p>

      <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF7F2;border-radius:6px;margin-bottom:20px;">
        <tr>
          <td style="padding:16px;">
            <p style="margin:0 0 4px;font-size:14px;"><strong>Order #:</strong> ${order.order_number}</p>
            <p style="margin:0 0 4px;font-size:14px;"><strong>Date:</strong> ${formatDate(order.created_at)}</p>
            <p style="margin:0;font-size:14px;"><strong>Payment:</strong> ${paymentLabel}</p>
          </td>
        </tr>
      </table>

      ${orderItemsTable(items)}

      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
        <tr>
          <td style="padding:8px 4px;font-size:14px;border-top:2px solid #333;"><strong>Total</strong></td>
          <td style="padding:8px 4px;font-size:14px;border-top:2px solid #333;text-align:right;"><strong>${formatCurrency(order.total_amount)}</strong></td>
        </tr>
      </table>

      <div style="background:#FAF7F2;border-radius:6px;padding:16px;margin-bottom:20px;">
        <p style="margin:0 0 4px;font-size:12px;text-transform:uppercase;color:#999;font-weight:bold;">Delivery Address</p>
        <p style="margin:0;font-size:14px;">
          ${[address?.address, address?.city, address?.state, address?.pincode].filter(Boolean).join(", ")}
        </p>
      </div>

      <p style="font-size:14px;color:#666;">
        📦 Estimated delivery: <strong>5–7 business days</strong>
      </p>

      ${order.payment_method === "cod" ? `<p style="font-size:14px;color:#C4622D;background:#FEF3E8;padding:12px;border-radius:6px;">💰 Please keep <strong>${formatCurrency(order.total_amount)}</strong> ready on delivery.</p>` : ""}

      ${ctaButton("Track Your Order", `https://stylesaplings.com/track/${order.order_number}`)}
    `);

    // Send customer email
    const customerResult = await sendEmail({
      to: order.customer_email,
      subject: `Order Confirmed — ${order.order_number} | Style Saplings 🌿`,
      html: customerHtml,
    });

    // Log customer email
    await supabase.from("email_log").insert({
      order_id: order.id,
      email_type: "order_confirmation",
      sent_to: order.customer_email,
      status: customerResult.success ? "sent" : "failed",
      error_message: customerResult.success ? null : JSON.stringify(customerResult.data),
    });

    // Build admin alert (plain text style)
    const adminHtml = wrapEmail(`
      <h2 style="font-family:Georgia,serif;font-size:20px;margin:0 0 16px;">
        🛍️ New Order: ${order.order_number}
      </h2>
      <table width="100%" cellpadding="4" cellspacing="0" style="font-size:14px;">
        <tr><td><strong>Customer:</strong></td><td>${order.customer_name}</td></tr>
        <tr><td><strong>Phone:</strong></td><td>${order.customer_phone}</td></tr>
        <tr><td><strong>Email:</strong></td><td>${order.customer_email}</td></tr>
        <tr><td><strong>Amount:</strong></td><td>${formatCurrency(order.total_amount)}</td></tr>
        <tr><td><strong>Payment:</strong></td><td>${order.payment_method.toUpperCase()} — ${order.payment_status}</td></tr>
        <tr><td><strong>Address:</strong></td><td>${[address?.address, address?.city, address?.state, address?.pincode].filter(Boolean).join(", ")}</td></tr>
      </table>

      ${orderItemsTable(items)}

      ${ctaButton("Open Admin Panel", "https://stylesaplings.com/admin")}
    `);

    const adminResult = await sendEmail({
      to: "support@stylesaplings.com",
      subject: `🛍️ New Order ${order.order_number} — ${formatCurrency(order.total_amount)} via ${order.payment_method.toUpperCase()}`,
      html: adminHtml,
    });

    // Log admin email
    await supabase.from("email_log").insert({
      order_id: order.id,
      email_type: "admin_new_order_alert",
      sent_to: "support@stylesaplings.com",
      status: adminResult.success ? "sent" : "failed",
      error_message: adminResult.success ? null : JSON.stringify(adminResult.data),
    });

    // Generate invoice and get signed URL for email
    let invoiceSignedUrl: string | null = null;
    let invoiceNumber: string | null = null;
    try {
      const invoiceRes = await fetch(
        `${Deno.env.get("SUPABASE_URL")}/functions/v1/generate-invoice`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
          },
          body: JSON.stringify({ order_id: order.id }),
        }
      );
      if (invoiceRes.ok) {
        const invoiceData = await invoiceRes.json();
        invoiceSignedUrl = invoiceData.signedUrl || null;
        invoiceNumber = invoiceData.invoice_number || null;
      }
    } catch (invErr) {
      console.error("Invoice generation error (non-fatal):", invErr);
    }

    // If we got an invoice URL, send a follow-up or update the customer email
    // For simplicity, we send a separate invoice email if we got the URL
    if (invoiceSignedUrl && invoiceNumber) {
      const invoiceEmailHtml = wrapEmail(`
        <h2 style="font-family:Georgia,serif;font-size:20px;margin:0 0 16px;color:#333;">
          Your Tax Invoice — ${invoiceNumber}
        </h2>
        <p style="font-size:14px;color:#666;margin:0 0 16px;">
          Here's your tax invoice for order <strong>${order.order_number}</strong>.
        </p>
        ${ctaButton("Download Tax Invoice", invoiceSignedUrl)}
        <p style="font-size:12px;color:#999;margin-top:16px;">
          This link is valid for 7 days. You can request a new link anytime at
          <a href="https://stylesaplings.com/track/${order.order_number}" style="color:#C4622D;">stylesaplings.com/track/${order.order_number}</a>
        </p>
      `);

      const invoiceEmailResult = await sendEmail({
        to: order.customer_email,
        subject: `Tax Invoice ${invoiceNumber} — ${order.order_number} | Style Saplings`,
        html: invoiceEmailHtml,
      });

      await supabase.from("email_log").insert({
        order_id: order.id,
        email_type: "tax_invoice",
        sent_to: order.customer_email,
        status: invoiceEmailResult.success ? "sent" : "failed",
        error_message: invoiceEmailResult.success ? null : JSON.stringify(invoiceEmailResult.data),
      });
    }

    // Mark as sent
    await supabase
      .from("orders")
      .update({ confirmation_email_sent: true })
      .eq("id", order.id);

    return new Response(
      JSON.stringify({
        success: true,
        customer_email: customerResult.success,
        admin_email: adminResult.success,
        invoice_number: invoiceNumber,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("send-order-confirmation error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
