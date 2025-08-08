import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = "https://yjeuzsswonwxmhbimvjv.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqZXV6c3N3b253eG1oYmltdmp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2MTY5OTksImV4cCI6MjA3MDE5Mjk5OX0.q7rX9wD8bZ77iy1Whz9-rqTJRLTujd1wpCD-aExdRoY";

const json = async <T = any>(req: Request) => (await req.json()) as T;

type AddItemPayload = { type: 'product' | 'service'; id: string; quantity?: number };

type UpdateItemPayload = { item_id: string; quantity: number };

type RemoveItemPayload = { item_id: string };

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: req.headers.get("Authorization") || "" } },
  });

  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  try {
    const url = new URL(req.url);
    const pathname = url.pathname;

    // Ensure cart exists
    const { data: existingCart } = await supabase
      .from('carts')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    let cartId = existingCart?.id as string | undefined;

    if (!cartId) {
      const { data: created, error: cartErr } = await supabase
        .from('carts')
        .insert({ user_id: user.id })
        .select('id')
        .single();
      if (cartErr) throw cartErr;
      cartId = created.id;
    }

    if (req.method === 'GET') {
      // Get cart items
      const { data: items, error } = await supabase
        .from('cart_items')
        .select('id, quantity, price, product_id, service_id')
        .in('cart_id', [cartId]);
      if (error) throw error;

      return new Response(JSON.stringify({ cart_id: cartId, items }), {
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (req.method === 'POST') {
      const body = await json(req);
      if (pathname.endsWith('/add')) {
        const { type, id, quantity = 1 } = body as AddItemPayload;

        let price = 0;
        if (type === 'product') {
          const { data: prod, error } = await supabase.from('products').select('price, merchant_id').eq('id', id).maybeSingle();
          if (error) throw error;
          if (!prod) throw new Error('Product not found');
          price = Number(prod.price || 0);
        } else {
          const { data: svc, error } = await supabase.from('services').select('price, merchant_id').eq('id', id).maybeSingle();
          if (error) throw error;
          if (!svc) throw new Error('Service not found');
          price = Number(svc.price || 0);
        }

        const payload: any = { cart_id: cartId, quantity, price };
        if (type === 'product') payload.product_id = id; else payload.service_id = id;

        // Try find existing item of same product/service to increment
        const { data: existingItem } = await supabase
          .from('cart_items')
          .select('id, quantity')
          .eq('cart_id', cartId)
          .eq(type === 'product' ? 'product_id' : 'service_id', id)
          .maybeSingle();

        if (existingItem) {
          const { error: updErr } = await supabase
            .from('cart_items')
            .update({ quantity: existingItem.quantity + quantity })
            .eq('id', existingItem.id);
          if (updErr) throw updErr;
        } else {
          const { error: insErr } = await supabase.from('cart_items').insert(payload);
          if (insErr) throw insErr;
        }

        return new Response(JSON.stringify({ ok: true }), {
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      if (pathname.endsWith('/update')) {
        const { item_id, quantity } = body as UpdateItemPayload;
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity })
          .eq('id', item_id);
        if (error) throw error;
        return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json", ...corsHeaders } });
      }
    }

    if (req.method === 'DELETE') {
      const body = await json<RemoveItemPayload>(req);
      const { item_id } = body;
      const { error } = await supabase.from('cart_items').delete().eq('id', item_id);
      if (error) throw error;
      return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
