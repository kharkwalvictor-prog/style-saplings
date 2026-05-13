import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const { order_number, phone } = await req.json();

    if (!order_number || !phone) {
      return new Response(
        JSON.stringify({ error: "order_number and phone are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const trimmedOrder = order_number.trim().toUpperCase();
    const trimmedPhone = phone.replace(/\D/g, "").slice(-10);

    if (trimmedPhone.length < 10) {
      return new Response(
        JSON.stringify({ error: "Invalid phone number" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch order matching both order_number and phone
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select("id, order_number, customer_name, customer_phone, customer_email, items, total_amount, payment_method, payment_status, order_status, shipping_address, tracking_number, created_at")
      .eq("order_number", trimmedOrder)
      .like("customer_phone", `%${trimmedPhone}`)
      .maybeSingle();

    if (orderErr) {
      console.error("Order query error:", orderErr);
      return new Response(
        JSON.stringify({ error: "Failed to look up order" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!order) {
      return new Response(
        JSON.stringify({ found: false }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch status history
    const { data: history } = await supabase
      .from("order_status_history")
      .select("to_status, created_at")
      .eq("order_id", order.id)
      .order("created_at", { ascending: true });

    return new Response(
      JSON.stringify({
        found: true,
        order: {
          id: order.id,
          order_number: order.order_number,
          customer_name: order.customer_name,
          items: order.items,
          total_amount: order.total_amount,
          payment_method: order.payment_method,
          payment_status: order.payment_status,
          order_status: order.order_status,
          shipping_address: order.shipping_address,
          tracking_number: order.tracking_number,
          created_at: order.created_at,
        },
        history: history || [],
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("track-order error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
