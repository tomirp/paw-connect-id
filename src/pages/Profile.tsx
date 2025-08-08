import { useEffect, useState } from "react";
import SEO from "@/components/SEO";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

interface OrderRow { id: string; status: string; total_amount: number; created_at: string }

const Profile = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderRow[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from("orders").select("id,status,total_amount,created_at").eq("user_id", user.id).order("created_at", { ascending: false }).then(({ data })=>{
      setOrders(data ?? []);
    });
  }, [user]);

  return (
    <main className="min-h-screen">
      <SEO title="Profil — PetConnect ID" description="Kelola profil, riwayat transaksi, dan pengaturan akun Anda." canonical="https://cb2a613f-b29b-41df-a5c9-4c4264d87d30.lovableproject.com/profile" />
      <section className="container py-8 space-y-6">
        <header>
          <h1 className="text-2xl font-bold">Profil</h1>
          <p className="text-muted-foreground">{user?.email}</p>
        </header>
        <section>
          <h2 className="font-semibold mb-2">Riwayat Transaksi</h2>
          <div className="space-y-2">
            {orders.map(o => (
              <div key={o.id} className="flex items-center justify-between border rounded-md p-3">
                <div>
                  <div className="font-medium">Order #{o.id.slice(0,8)}</div>
                  <div className="text-sm text-muted-foreground">{new Date(o.created_at).toLocaleString()} • {o.status}</div>
                </div>
                <div className="font-semibold">Rp {Number(o.total_amount).toLocaleString()}</div>
              </div>
            ))}
            {orders.length === 0 && <div className="text-sm text-muted-foreground">Belum ada transaksi.</div>}
          </div>
        </section>
        <section>
          <h2 className="font-semibold mb-2">Wishlist</h2>
          <div className="text-sm text-muted-foreground">Segera hadir.</div>
        </section>
        <section>
          <h2 className="font-semibold mb-2">Pengaturan Akun</h2>
          <Button variant="outline">Ubah Kata Sandi</Button>
        </section>
      </section>
    </main>
  );
};

export default Profile;
