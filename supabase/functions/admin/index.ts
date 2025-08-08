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

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: req.headers.get("Authorization") || "" } },
  });

  // Require admin role
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
  if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } });

  // quick role check via probing user_roles using has_role function through a protected table
  const { data: isAdminCheck, error: adminErr } = await supabase.rpc('has_role', { _user_id: user.id, _role: 'admin' });
  if (adminErr || !isAdminCheck) return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders } });

  const url = new URL(req.url);

  try {
    if (req.method === 'GET' && url.pathname.endsWith('/report/summary')) {
      const [usersCount, merchantsCount, orders, payments] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('merchants').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('id,total_amount,status'),
        supabase.from('payments').select('amount,status'),
      ]);

      const summary = {
        users: usersCount.count ?? 0,
        merchants: merchantsCount.count ?? 0,
        orders: orders.data?.length ?? 0,
        revenue: (payments.data ?? []).filter(p => p.status === 'succeeded').reduce((s, p: any) => s + Number(p.amount || 0), 0),
      };

      return new Response(JSON.stringify(summary), { headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }

    if (url.pathname.endsWith('/categories') && req.method === 'GET') {
      const { data, error } = await supabase.from('categories').select('*').order('name');
      if (error) throw error;
      return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }

    if (url.pathname.endsWith('/categories') && req.method === 'POST') {
      const body = await req.json();
      const { name, type } = body as { name: string; type: 'product'|'service'|'merchant' };
      const { data, error } = await supabase.from('categories').insert({ name, type }).select('*').single();
      if (error) throw error;
      return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }

    return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
  }
});
