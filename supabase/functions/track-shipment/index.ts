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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    let awbCode: string | null = body.awb_code || null;
    const orderId: string | null = body.order_id || null;

    if (!awbCode && !orderId) {
      return new Response(
        JSON.stringify({ error: "awb_code or order_id is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // ── If order_id provided, look up AWB from shipments table ───────
    if (!awbCode && orderId) {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );

      const { data: shipment, error: shipErr } = await supabase
        .from("shipments")
        .select("awb_code")
        .eq("order_id", orderId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (shipErr || !shipment?.awb_code) {
        return new Response(
          JSON.stringify({ error: "No AWB code found for this order" }),
          {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      awbCode = shipment.awb_code;
    }

    // ── Authenticate with Shiprocket ─────────────────────────────────
    const token = await getShiprocketToken();

    // ── Track shipment by AWB ────────────────────────────────────────
    const trackRes = await fetch(
      `https://apiv2.shiprocket.in/v1/external/courier/track/awb/${awbCode}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const trackData = await trackRes.json();

    if (!trackRes.ok) {
      console.error("Shiprocket tracking failed:", JSON.stringify(trackData));
      return new Response(
        JSON.stringify({
          error: "Tracking request failed",
          details: trackData,
        }),
        {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // ── Extract tracking info from Shiprocket response ───────────────
    const trackingData = trackData?.tracking_data || trackData;
    const currentStatus =
      trackingData?.shipment_track?.[0]?.current_status ||
      trackingData?.track_status_description ||
      "Unknown";
    const shipmentTrack = trackingData?.shipment_track_activities ||
      trackingData?.shipment_track ||
      [];

    return new Response(
      JSON.stringify({
        success: true,
        awb_code: awbCode,
        tracking: {
          current_status: currentStatus,
          shipment_track: shipmentTrack,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("track-shipment error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
