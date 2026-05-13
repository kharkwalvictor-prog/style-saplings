import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function getShiprocketToken(): Promise<string> {
  const res = await fetch(
    "https://apiv2.shiprocket.in/v1/external/auth/login",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: Deno.env.get("SHIPROCKET_EMAIL"),
        password: Deno.env.get("SHIPROCKET_PASSWORD"),
      }),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Shiprocket auth failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  if (!data.token) {
    throw new Error("Shiprocket auth response missing token");
  }
  return data.token;
}

function formatOrderDate(isoDate: string): string {
  const d = new Date(isoDate);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
}

function extractPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  // Take last 10 digits (strip country code if present)
  return digits.length > 10 ? digits.slice(-10) : digits;
}

function splitName(fullName: string): { firstName: string; lastName: string } {
  const parts = (fullName || "").trim().split(/\s+/);
  const firstName = parts[0] || "";
  const lastName = parts.slice(1).join(" ") || "";
  return { firstName, lastName };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      order_id,
      weight_grams = 500,
      length = 25,
      breadth = 20,
      height = 10,
    } = await req.json();

    if (!order_id) {
      return new Response(
        JSON.stringify({ error: "order_id is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // ── Fetch order ──────────────────────────────────────────────────
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select("*")
      .eq("id", order_id)
      .single();

    if (orderErr || !order) {
      return new Response(
        JSON.stringify({ error: "Order not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const address = order.shipping_address as Record<string, string>;
    const items = (order.items as any[]) || [];
    const { firstName, lastName } = splitName(order.customer_name || "");

    // ── Authenticate with Shiprocket ─────────────────────────────────
    const token = await getShiprocketToken();

    // ── Build Shiprocket payload ─────────────────────────────────────
    const shiprocketPayload = {
      order_id: order.order_number,
      order_date: formatOrderDate(order.created_at),
      pickup_location: "Primary",
      billing_customer_name: firstName,
      billing_last_name: lastName,
      billing_address: address?.address || "",
      billing_city: address?.city || "",
      billing_pincode: address?.pincode || "",
      billing_state: address?.state || "",
      billing_country: "India",
      billing_email: order.customer_email || "",
      billing_phone: extractPhone(order.customer_phone || ""),
      shipping_is_billing: true,
      order_items: items.map((item: any) => ({
        name: item.name,
        sku: item.slug || item.sku || item.name,
        units: item.quantity,
        selling_price: item.price,
        hsn: "62099090",
      })),
      payment_method: order.payment_method === "cod" ? "COD" : "Prepaid",
      sub_total: order.total_amount,
      length,
      breadth,
      height,
      weight: weight_grams / 1000,
    };

    // ── Create order on Shiprocket ───────────────────────────────────
    const shipRes = await fetch(
      "https://apiv2.shiprocket.in/v1/external/orders/create/adhoc",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(shiprocketPayload),
      }
    );

    const shipData = await shipRes.json();

    if (!shipRes.ok || !shipData.order_id) {
      console.error("Shiprocket create order failed:", JSON.stringify(shipData));
      return new Response(
        JSON.stringify({
          error: "Shiprocket order creation failed",
          details: shipData,
        }),
        {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // ── Extract shipment details ─────────────────────────────────────
    const providerOrderId = shipData.order_id;
    const shipmentId = shipData.shipment_id;
    const awbCode = shipData.awb_code || null;
    const courierName = shipData.courier_name || null;

    // ── Save shipment record ─────────────────────────────────────────
    const { error: shipmentInsertErr } = await supabase
      .from("shipments")
      .insert({
        order_id: order.id,
        provider_order_id: String(providerOrderId),
        shipment_id: String(shipmentId),
        awb_code: awbCode || null,
        courier_name: courierName || null,
        status: "created",
      });

    if (shipmentInsertErr) {
      console.error("Shipment insert error:", shipmentInsertErr);
      // Non-fatal: Shiprocket order was created, so we continue
    }

    // ── Update order tracking number ─────────────────────────────────
    if (awbCode) {
      const { error: trackingErr } = await supabase
        .from("orders")
        .update({ tracking_number: awbCode })
        .eq("id", order.id);

      if (trackingErr) {
        console.error("Order tracking update error:", trackingErr);
      }
    }

    // ── Update order status to shipped ───────────────────────────────
    const { error: statusErr } = await supabase
      .from("orders")
      .update({ order_status: "shipped" })
      .eq("id", order.id);

    if (statusErr) {
      console.error("Order status update error:", statusErr);
    }

    // ── Log to order_status_history ──────────────────────────────────
    const { error: historyErr } = await supabase
      .from("order_status_history")
      .insert({
        order_id: order.id,
        status: "shipped",
        notes: `Shipment created via Shiprocket. AWB: ${awbCode || "pending"}, Courier: ${courierName || "pending"}`,
      });

    if (historyErr) {
      console.error("Status history insert error:", historyErr);
    }

    return new Response(
      JSON.stringify({
        success: true,
        awb_code: awbCode,
        courier_name: courierName,
        shipment_id: shipmentId,
        provider_order_id: providerOrderId,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("create-shipment error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
