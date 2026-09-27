import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const allowedOrigins = [
  "https://stylesaplings.com",
  "https://www.stylesaplings.com",
  "http://localhost:5173",
  "http://localhost:3000",
];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get("origin") || "";
  const corsOrigin = allowedOrigins.includes(origin) ? origin : "https://stylesaplings.com";
  return {
    "Access-Control-Allow-Origin": corsOrigin,
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
  };
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { refund_request_id, amount_rupees } = await req.json();

    if (!refund_request_id || !amount_rupees) {
      return new Response(
        JSON.stringify({ error: "refund_request_id and amount_rupees are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get refund request + linked order
    const { data: refundReq, error: rErr } = await supabase
      .from("refund_requests")
      .select("*, orders(razorpay_payment_id, payment_method, total_amount)")
      .eq("id", refund_request_id)
      .single();

    if (rErr || !refundReq) {
      return new Response(
        JSON.stringify({ error: "Refund request not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const order = refundReq.orders;

    // Only process online Razorpay orders
    if (order.payment_method !== "razorpay" || !order.razorpay_payment_id) {
      return new Response(
        JSON.stringify({ success: false, message: "Not an online Razorpay payment — process manually" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const keyId = Deno.env.get("RAZORPAY_KEY_ID");
    const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
    if (!keyId || !keySecret) {
      return new Response(
        JSON.stringify({ error: "Razorpay credentials not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const amountPaise = Math.round(parseFloat(amount_rupees) * 100);
    const credentials = btoa(`${keyId}:${keySecret}`);

    const rzpResponse = await fetch(
      `https://api.razorpay.com/v1/payments/${order.razorpay_payment_id}/refund`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${credentials}`,
        },
        body: JSON.stringify({
          amount: amountPaise,
          speed: "normal",
          notes: { reason: refundReq.reason || "Customer return request" },
        }),
      }
    );

    const rzpData = await rzpResponse.json();

    if (!rzpResponse.ok) {
      console.error("Razorpay refund error:", rzpData);
      return new Response(
        JSON.stringify({ success: false, error: rzpData.error?.description || "Razorpay refund failed" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update order payment_status to refunded
    await supabase
      .from("orders")
      .update({ payment_status: "refunded" })
      .eq("id", refundReq.order_id);

    return new Response(
      JSON.stringify({ success: true, razorpay_refund_id: rzpData.id, amount: rzpData.amount }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
    );
  }
});
