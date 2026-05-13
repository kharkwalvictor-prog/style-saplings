import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const BASE = "https://stylesaplings.com";

  const [{ data: products }, { data: posts }] = await Promise.all([
    supabase.from("products").select("slug, updated_at").order("created_at"),
    supabase
      .from("blog_posts")
      .select("slug, updated_at")
      .eq("published", true)
      .order("published_at", { ascending: false }),
  ]);

  const toDate = (d: string) => d.split("T")[0];

  const staticPages = [
    { loc: "/", changefreq: "weekly", priority: "1.0" },
    { loc: "/shop", changefreq: "weekly", priority: "0.9" },
    { loc: "/about", changefreq: "monthly", priority: "0.7" },
    { loc: "/blog", changefreq: "weekly", priority: "0.8" },
    { loc: "/contact", changefreq: "monthly", priority: "0.5" },
    { loc: "/track", changefreq: "monthly", priority: "0.4" },
  ];

  const urls = staticPages
    .map(
      (p) => `  <url>
    <loc>${BASE}${p.loc}</loc>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`
    )
    .join("\n");

  const productUrls = (products || [])
    .map(
      (p: any) => `  <url>
    <loc>${BASE}/product/${p.slug}</loc>
    <lastmod>${toDate(p.updated_at)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
    )
    .join("\n");

  const blogUrls = (posts || [])
    .map(
      (p: any) => `  <url>
    <loc>${BASE}/blog/${p.slug}</loc>
    <lastmod>${toDate(p.updated_at)}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
${productUrls}
${blogUrls}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600",
      ...corsHeaders,
    },
  });
});
