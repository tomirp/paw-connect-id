import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = "https://yjeuzsswonwxmhbimvjv.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_SERVICE_ROLE_KEY env");
}

type Payload = { email: string; password: string; role?: 'merchant'|'admin'|'user' };

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }

    const body = (await req.json()) as Payload;
    const email = body.email?.trim().toLowerCase();
    const password = body.password;
    const role = body.role ?? 'merchant';

    if (!email || !password) {
      return new Response(JSON.stringify({ error: 'Email & password are required' }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY!);

    // Try to create the user (idempotent)
    let userId: string | undefined;
    const createRes = await admin.auth.admin.createUser({ email, password, email_confirm: true });
    if (createRes.data?.user) {
      userId = createRes.data.user.id;
    }

    if (!userId) {
      // User may already exist, find by email
      let found = undefined as undefined | string;
      let page = 1;
      const perPage = 200;
      // Basic pagination scan (few users expected)
      // Avoid infinite loop: max 10 pages
      while (!found && page <= 10) {
        const list = await admin.auth.admin.listUsers({ page, perPage });
        if (list.data?.users?.length) {
          const match = list.data.users.find(u => u.email?.toLowerCase() === email);
          if (match) found = match.id;
          if ((list.data.users.length ?? 0) < perPage) break; // no more pages
        } else {
          break;
        }
        page++;
      }
      userId = found;
    }

    if (!userId) {
      return new Response(JSON.stringify({ error: 'Unable to create or locate user' }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }

    // Assign role (idempotent)
    const { error: roleErr } = await admin
      .from('user_roles')
      .upsert({ user_id: userId, role }, { onConflict: 'user_id,role' });
    if (roleErr) throw roleErr;

    return new Response(JSON.stringify({ ok: true, user_id: userId, role }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});
