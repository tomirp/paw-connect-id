import { useEffect, useMemo, useState } from "react";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface CartItemRow { id: string; product_id: string | null; service_id: string | null; quantity: number; price: number }

const Cart = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [cartId, setCartId] = useState<string | null>(null);
  const [items, setItems] = useState<CartItemRow[]>([]);

  const total = useMemo(() => items.reduce((s,i)=> s + i.price * i.quantity, 0), [items]);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      let { data: carts } = await supabase.from("carts").select("id").eq("user_id", user.id).limit(1);
      let id = carts?.[0]?.id ?? null;
      if (!id) {
        const { data } = await supabase.from("carts").insert({ user_id: user.id }).select("id").single();
        id = data?.id ?? null;
      }
      setCartId(id);
      if (id) {
        const { data: items } = await supabase.from("cart_items").select("id,product_id,service_id,quantity,price").eq("cart_id", id);
        setItems(items ?? []);
      }
    };
    load();
  }, [user]);

  const updateQty = async (id: string, q: number) => {
    setItems(prev => prev.map(i => i.id===id ? { ...i, quantity: q } : i));
    await supabase.from("cart_items").update({ quantity: q }).eq("id", id);
  };

  const removeItem = async (id: string) => {
    await supabase.from("cart_items").delete().eq("id", id);
    setItems(prev => prev.filter(i=>i.id!==id));
  };

  const checkout = async () => {
    if (!cartId) return;
    const { data, error } = await supabase.functions.invoke("checkout", { body: { cart_id: cartId } });
    if (error) {
      toast({ title: "Checkout gagal", description: error.message, variant: "destructive" });
    } else {
      const url = (data as any)?.payment_url;
      if (url) window.location.href = url;
    }
  };

  return (
    <main className="min-h-screen">
      <SEO title="Keranjang — PetConnect ID" description="Kelola keranjang belanja atau booking layanan Anda." canonical="https://cb2a613f-b29b-41df-a5c9-4c4264d87d30.lovableproject.com/cart" />
      <section className="container py-8 grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-3">
          <h1 className="text-2xl font-bold">Keranjang</h1>
          {items.map((i)=> (
            <div key={i.id} className="flex items-center justify-between border rounded-md p-3">
              <div>
                <div className="font-medium">{i.product_id ? 'Produk' : 'Layanan'} #{(i.product_id ?? i.service_id)?.slice(0,6)}</div>
                <div className="text-sm text-muted-foreground">Rp {Number(i.price).toLocaleString()}</div>
              </div>
              <div className="flex items-center gap-2">
                <Input type="number" className="w-20" value={i.quantity} onChange={(e)=>updateQty(i.id, Number(e.target.value))} />
                <Button variant="outline" onClick={()=>removeItem(i.id)}>Hapus</Button>
              </div>
            </div>
          ))}
          {items.length===0 && <div className="text-sm text-muted-foreground">Keranjang Anda kosong.</div>}
        </div>
        <aside className="border rounded-md p-4 h-fit sticky top-16">
          <div className="flex items-center justify-between mb-3">
            <span className="font-medium">Total</span>
            <span className="font-semibold">Rp {total.toLocaleString()}</span>
          </div>
          <Button className="w-full" variant="hero" onClick={checkout} disabled={items.length===0}>Lanjutkan ke Pembayaran</Button>
        </aside>
      </section>
    </main>
  );
};

export default Cart;
