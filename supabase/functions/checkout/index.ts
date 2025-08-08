import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = "https://yjeuzsswonwxmhbimvjv.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqZXV6c3N3b253eG1oYmltdmp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2MTY5OTksImV4cCI6MjA3MDE5Mjk5OX0.q7rX9wD8bZ77iy1Whz9-rqTJRLTujd1wpCD-aExdRoY";

type CheckoutPayload = { merchant_id?: string };

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
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    const { merchant_id } = (await req.json()) as CheckoutPayload;

    // Find cart
    const { data: cart } = await supabase.from('carts').select('id').eq('user_id', user.id).maybeSingle();
    if (!cart) return new Response(JSON.stringify({ error: 'Cart not found' }), { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } });

    // Load items
    const { data: items, error: itemsErr } = await supabase.from('cart_items').select('id, product_id, service_id, quantity, price').eq('cart_id', cart.id);
    if (itemsErr) throw itemsErr;
    if (!items || items.length === 0) return new Response(JSON.stringify({ error: 'Cart is empty' }), { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } });

    // Compute total
    const total = items.reduce((sum, it) => sum + Number(it.price) * it.quantity, 0);

    // Create order
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .insert({ user_id: user.id, merchant_id: merchant_id ?? null, total_amount: total, status: 'pending' })
      .select('id')
      .single();
    if (orderErr) throw orderErr;

    // Create order items
    const orderItems = items.map((it) => ({
      order_id: order.id,
      product_id: it.product_id,
      service_id: it.service_id,
      quantity: it.quantity,
      price: it.price,
    }));

    const { error: oiErr } = await supabase.from('order_items').insert(orderItems);
    if (oiErr) throw oiErr;

    // Create payment (mock)
    const paymentUrl = `${new URL(req.url).origin}/payment/${order.id}`;
    const { error: payErr } = await supabase
      .from('payments')
      .insert({ order_id: order.id, amount: total, provider: 'mock', status: 'pending', payment_url: paymentUrl });
    if (payErr) throw payErr;

    // Clear cart
    const { error: clearErr } = await supabase.from('cart_items').delete().eq('cart_id', cart.id);
    if (clearErr) throw clearErr;

    return new Response(JSON.stringify({ order_id: order.id, payment_url: paymentUrl }), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
