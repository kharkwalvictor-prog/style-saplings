import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { sendEmail } from "../_shared/sendEmail.ts";
import {
  wrapEmail, orderItemsTable, ctaButton, formatCurrency,
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
    const { order_id, tracking_number } = await req.json();
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

    if (order.shipping_email_sent) {
      return new Response(JSON.stringify({ skipped: true, reason: "already_sent" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const items = (order.items as any[]) || [];
    const address = order.shipping_address as any;
    const trackNum = tracking_number || order.tracking_number;

    const html = wrapEmail(`
      <h1 style="font-family:Georgia,serif;font-size:24px;margin:0 0 8px;color:#333;">
        Your order is on its way! 📦
      </h1>
      <p style="font-size:16px;color:#666;margin:0 0 24px;">
        Great news — your order <strong>${order.order_number}</strong> has been shipped!
      </p>

      ${orderItemsTable(items.map((i: any) => ({ name: i.name, size: i.size, quantity: i.quantity, price: i.price })))}

      ${trackNum ? `
        <div style="background:#FAF7F2;border-radius:6px;padding:16px;margin:20px 0;">
          <p style="margin:0 0 4px;font-size:12px;text-transform:uppercase;color:#999;font-weight:bold;">Tracking ID</p>
          <p style="margin:0;font-size:16px;font-family:monospace;letter-spacing:1px;">${trackNum}</p>
        </div>
      ` : ""}

      <div style="background:#FAF7F2;border-radius:6px;padding:16px;margin-bottom:20px;">
        <p style="margin:0 0 4px;font-size:12px;text-transform:uppercase;color:#999;font-weight:bold;">Delivery Address</p>
        <p style="margin:0;font-size:14px;">
          ${[address?.address, address?.city, address?.state, address?.pincode].filter(Boolean).join(", ")}
        </p>
      </div>

      <p style="font-size:14px;color:#666;">
        📦 Expected in <strong>5–7 business days</strong>
      </p>

      ${trackNum ? ctaButton("Track Shipment", `https://stylesaplings.com/track/${order.order_number}`) : ""}
    `);

    const result = await sendEmail({
      to: order.customer_email,
      subject: `Your order is on its way! 📦 — ${order.order_number}`,
      html,
    });

    await supabase.from("email_log").insert({
      order_id: order.id,
      email_type: "shipping_notification",
      sent_to: order.customer_email,
      status: result.success ? "sent" : "failed",
      error_message: result.success ? null : JSON.stringify(result.data),
    });

    await supabase
      .from("orders")
      .update({ shipping_email_sent: true })
      .eq("id", order.id);

    return new Response(
      JSON.stringify({ success: result.success }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("send-shipping-notification error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
