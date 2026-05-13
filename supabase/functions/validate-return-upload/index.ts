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
  const corsOrigin = allowedOrigins.includes(origin)
    ? origin
    : "https://stylesaplings.com";
  return {
    "Access-Control-Allow-Origin": corsOrigin,
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  };
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { order_number, phone, filename } = await req.json();

    if (!order_number || !phone || !filename) {
      return new Response(
        JSON.stringify({ error: "order_number, phone, and filename are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Verify order exists and phone matches
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select("id, customer_phone")
      .eq("order_number", order_number.trim().toUpperCase())
      .single();

    if (orderErr || !order) {
      return new Response(
        JSON.stringify({ error: "Order not found" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const orderPhone = order.customer_phone.replace(/\D/g, "");
    const inputPhone = phone.replace(/\D/g, "");
    if (!orderPhone.endsWith(inputPhone.slice(-10)) && !inputPhone.endsWith(orderPhone.slice(-10))) {
      return new Response(
        JSON.stringify({ error: "Phone number doesn't match order" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate signed upload URL (10 min expiry)
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9._-]/g, "");
    const path = `${order_number.trim().toUpperCase()}/${Date.now()}-${sanitizedFilename}`;

    const { data: signedData, error: signedErr } = await supabase.storage
      .from("return-images")
      .createSignedUploadUrl(path);

    if (signedErr || !signedData) {
      console.error("Signed URL error:", signedErr);
      return new Response(
        JSON.stringify({ error: "Failed to generate upload URL" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get the public URL for after upload
    const { data: publicUrlData } = supabase.storage
      .from("return-images")
      .getPublicUrl(path);

    return new Response(
      JSON.stringify({
        signedUrl: signedData.signedUrl,
        token: signedData.token,
        path,
        publicUrl: publicUrlData.publicUrl,
      }),
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
