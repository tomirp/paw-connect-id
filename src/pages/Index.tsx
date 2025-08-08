import { useNavigate } from "react-router-dom";
import heroImg from "@/assets/hero-pets.jpg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PawPrint, Scissors, Stethoscope } from "lucide-react";
import SEO from "@/components/SEO";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import MerchantCard from "@/components/MerchantCard";
const Index = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [topMerchants, setTopMerchants] = useState<any[]>([]);
  const [products, setProducts] = useState<{id:string; name:string; price:number}[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data: cat } = await supabase.from("categories").select("name").limit(6);
      setCategories((cat ?? []).map(c=>c.name));
      const { data: ms } = await supabase.from("merchants").select("id,name,city,category,description").limit(6);
      setTopMerchants(ms ?? []);
      const { data: ps } = await supabase.from("products").select("id,name,price").limit(6);
      setProducts(ps ?? []);
    };
    load();
  }, []);

  const onSearch = () => {
    navigate(`/direktori?q=${encodeURIComponent(query)}`);
  };
  return (
    <main className="min-h-screen bg-background">
      <SEO
        title="PetConnect ID — Booking Layanan Hewan Terdekat"
        description="Cari petshop, grooming, dan klinik hewan terdekat. Booking cepat & chat langsung dalam satu aplikasi."
        canonical="https://cb2a613f-b29b-41df-a5c9-4c4264d87d30.lovableproject.com/"
      />

      <section className="container grid md:grid-cols-2 gap-8 items-center py-8">
        <div className="order-2 md:order-1">
          <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-4">
            Temukan layanan hewan peliharaan terdekat, cepat & terpercaya
          </h1>
          <p className="text-muted-foreground mb-6">
            Petshop, grooming, dan klinik hewan terverifikasi di kota Anda. Booking instan dan chat langsung.
          </p>
          <div className="flex gap-2">
            <Input
              placeholder="Cari petshop, grooming, atau dokter hewan terdekat"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onSearch()}
            />
            <Button variant="hero" size="xl" onClick={onSearch}>Cari Layanan</Button>
          </div>
          <div className="flex items-center gap-6 mt-6 text-sm">
            <div className="flex items-center gap-2"><PawPrint className="opacity-80" /> Petshop</div>
            <div className="flex items-center gap-2"><Scissors className="opacity-80" /> Grooming</div>
            <div className="flex items-center gap-2"><Stethoscope className="opacity-80" /> Klinik Hewan</div>
          </div>
          <div className="mt-6">
            <a href="/dashboard/merchant">
              <Button variant="outline">Jadi Merchant</Button>
            </a>
          </div>
        </div>
        <div className="order-1 md:order-2 relative">
          <img
            src={heroImg}
            alt="Ilustrasi layanan hewan peliharaan — PetConnect ID"
            className="w-full h-auto rounded-xl shadow-[var(--shadow-elegant)]"
            loading="eager"
          />
          <div className="absolute inset-0 -z-10 blur-3xl opacity-40" style={{ background: 'var(--gradient-primary)' }} />
        </div>
      </section>

      <section className="container py-6">
        <h2 className="text-xl font-semibold mb-3">Kategori Populer</h2>
        <div className="flex flex-wrap gap-2">
          {categories.map((c)=> (
            <Button key={c} variant="outline" size="sm" onClick={()=>navigate(`/direktori?q=${encodeURIComponent(c)}`)} className="hover-scale">{c}</Button>
          ))}
          {categories.length===0 && <div className="text-sm text-muted-foreground">Kategori akan tampil di sini.</div>}
        </div>
      </section>

      <section className="container py-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold">Toko/Klinik Terpopuler</h2>
          <Button variant="ghost" onClick={()=>navigate('/direktori')}>Lihat semua</Button>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {topMerchants.map((m)=> (
            <MerchantCard key={m.id} merchant={{ id: m.id, name: m.name, category: (m.category as any), city: (m.city as any), rating: 4.6, priceRange: "Rp20k - Rp200k", distanceKm: 1.2, images: [], description: m.description ?? '', services: [], hours: '', approved: true }} />
          ))}
          {topMerchants.length===0 && <div className="text-sm text-muted-foreground">Belum ada data merchant.</div>}
        </div>
      </section>

      <section className="container py-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold">Rekomendasi Produk</h2>
          <Button variant="ghost" onClick={()=>navigate('/search')}>Lihat semua</Button>
        </div>
        <div className="grid md:grid-cols-3 gap-3">
          {products.map((p)=> (
            <div key={p.id} className="border rounded-md p-4">
              <div className="font-medium truncate">{p.name}</div>
              <div className="text-sm text-muted-foreground">Mulai Rp {Number(p.price).toLocaleString()}</div>
              <div className="mt-2">
                <Button variant="outline" size="sm" onClick={()=>navigate('/direktori')}>Lihat</Button>
              </div>
            </div>
          ))}
          {products.length===0 && <div className="text-sm text-muted-foreground">Rekomendasi produk akan tampil di sini.</div>}
        </div>
      </section>
    </main>
  );
};

export default Index;

