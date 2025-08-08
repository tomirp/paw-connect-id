import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = "https://yjeuzsswonwxmhbimvjv.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqZXV6c3N3b253eG1oYmltdmp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2MTY5OTksImV4cCI6MjA3MDE5Mjk5OX0.q7rX9wD8bZ77iy1Whz9-rqTJRLTujd1wpCD-aExdRoY";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const q = url.searchParams.get("q")?.trim() ?? "";
    const city = url.searchParams.get("city") ?? undefined;
    const category = url.searchParams.get("category") ?? undefined;
    const page = Number(url.searchParams.get("page") ?? 1);
    const pageSize = Math.min(50, Number(url.searchParams.get("pageSize") ?? 10));
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Merchants
    let merchantsQuery = supabase.from("merchants").select("id,name,city,category,description,verified,created_at", { count: "exact" }).range(from, to);
    if (q) merchantsQuery = merchantsQuery.ilike("name", `%${q}%`);
    if (city) merchantsQuery = merchantsQuery.eq("city", city);
    if (category) merchantsQuery = merchantsQuery.eq("category", category);

    // Products
    let productsQuery = supabase.from("products").select("id,name,price,stock,merchant_id,image_url,created_at", { count: "exact" }).range(from, to);
    if (q) productsQuery = productsQuery.ilike("name", `%${q}%`);

    // Services
    let servicesQuery = supabase.from("services").select("id,name,price,duration_minutes,merchant_id,created_at", { count: "exact" }).range(from, to);
    if (q) servicesQuery = servicesQuery.ilike("name", `%${q}%`);

    const [merchantsRes, productsRes, servicesRes] = await Promise.all([
      merchantsQuery,
      productsQuery,
      servicesQuery,
    ]);

    const body = {
      query: { q, city, category, page, pageSize },
      merchants: {
        data: merchantsRes.data ?? [],
        count: merchantsRes.count ?? 0,
      },
      products: {
        data: productsRes.data ?? [],
        count: productsRes.count ?? 0,
      },
      services: {
        data: servicesRes.data ?? [],
        count: servicesRes.count ?? 0,
      },
    };

    return new Response(JSON.stringify(body), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
