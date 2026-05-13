import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { shipment_id } = await req.json();

    if (!shipment_id) {
      return new Response(
        JSON.stringify({ error: "shipment_id is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // ── Authenticate with Shiprocket ─────────────────────────────────
    const token = await getShiprocketToken();

    // ── Generate shipping label ──────────────────────────────────────
    const labelRes = await fetch(
      "https://apiv2.shiprocket.in/v1/external/courier/generate/label",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ shipment_id: [shipment_id] }),
      }
    );

    const labelData = await labelRes.json();

    if (!labelRes.ok || !labelData.label_url) {
      console.error("Shiprocket label generation failed:", JSON.stringify(labelData));
      return new Response(
        JSON.stringify({
          error: "Label generation failed",
          details: labelData,
        }),
        {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        label_url: labelData.label_url,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("get-shipping-label error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
