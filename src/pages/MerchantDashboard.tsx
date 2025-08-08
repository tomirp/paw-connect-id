import { useState } from "react";
import SEO from "@/components/SEO";
import { merchants } from "@/data/merchants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const MerchantDashboard = () => {
  const [services, setServices] = useState<{ name: string; price: number }[]>([
    { name: "Konsultasi", price: 150000 },
  ]);

  const add = () => setServices((s)=>[...s, { name: "", price: 0 }]);

  return (
    <main className="min-h-screen container py-6">
      <SEO title="Dashboard Merchant — PetConnect ID" description="Kelola layanan & lihat booking." canonical="https://cb2a613f-b29b-41df-a5c9-4c4264d87d30.lovableproject.com/dashboard/merchant" />
      <h1 className="text-2xl font-semibold mb-4">Dashboard Merchant</h1>
      <section className="mb-6">
        <h2 className="font-medium mb-2">Layanan</h2>
        <div className="space-y-3">
          {services.map((s, i) => (
            <div key={i} className="grid grid-cols-5 gap-2">
              <Input className="col-span-3" placeholder="Nama layanan" value={s.name} onChange={(e)=>{
                const v=[...services]; v[i].name=e.target.value; setServices(v);
              }} />
              <Input className="col-span-2" type="number" placeholder="Harga (Rp)" value={s.price} onChange={(e)=>{
                const v=[...services]; v[i].price=Number(e.target.value); setServices(v);
              }} />
            </div>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <Button onClick={add} variant="outline">Tambah Layanan</Button>
          <Button variant="hero">Simpan</Button>
        </div>
      </section>
      <section>
        <h2 className="font-medium mb-2">Daftar Booking (Demo)</h2>
        <div className="text-sm text-muted-foreground">Integrasi database dibutuhkan untuk data real-time.</div>
      </section>
    </main>
  );
};

export default MerchantDashboard;
