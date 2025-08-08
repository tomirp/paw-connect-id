import { useEffect, useMemo, useState } from "react";
import SEO from "@/components/SEO";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import MerchantCard from "@/components/MerchantCard";

interface Merchant { id: string; name: string; city: string; category: string; description: string; }

const Search = () => {
  const [q, setQ] = useState("");
  const [city, setCity] = useState<string | undefined>();
  const [category, setCategory] = useState<string | undefined>();
  const [results, setResults] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(false);

  const cities = useMemo(() => Array.from(new Set(results.map(r=>r.city).filter(Boolean))), [results]);

  const run = async () => {
    setLoading(true);
    let query = supabase.from("merchants").select("id,name,city,category,description");
    if (q) query = query.ilike("name", `%${q}%`);
    if (category) query = query.eq("category", category);
    if (city) query = query.eq("city", city);
    const { data } = await query.limit(24);
    setResults(data ?? []);
    setLoading(false);
  };

  useEffect(() => { run(); /* initial */ }, []);

  return (
    <main className="min-h-screen">
      <SEO title="Telusuri — PetConnect ID" description="Cari produk, layanan, toko, dan klinik hewan berdasarkan lokasi, harga, dan rating." canonical="https://cb2a613f-b29b-41df-a5c9-4c4264d87d30.lovableproject.com/direktori" />
      <section className="container py-6 space-y-4">
        <h1 className="text-2xl font-bold">Telusuri</h1>
        <div className="grid md:grid-cols-4 gap-2">
          <Input placeholder="Cari toko/klinik/layanan" value={q} onChange={(e)=>setQ(e.target.value)} onKeyDown={(e)=> e.key==='Enter' && run()} className="md:col-span-2" />
          <Select onValueChange={setCategory}>
            <SelectTrigger><SelectValue placeholder="Kategori" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Petshop">Petshop</SelectItem>
              <SelectItem value="Grooming">Grooming</SelectItem>
              <SelectItem value="Klinik">Klinik</SelectItem>
            </SelectContent>
          </Select>
          <Select onValueChange={setCity}>
            <SelectTrigger><SelectValue placeholder="Kota" /></SelectTrigger>
            <SelectContent>
              {cities.map((c)=> <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="md:col-span-4">
            <Button variant="hero" onClick={run} disabled={loading}>{loading? 'Memuat...' : 'Terapkan Filter'}</Button>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {results.map((m) => (
            <MerchantCard
              key={m.id}
              merchant={{
                id: m.id,
                name: m.name,
                category: (m.category as any),
                city: (m.city as any),
                rating: 4.5,
                priceRange: "Rp50k - Rp200k",
                distanceKm: 1.0,
                images: [],
                description: m.description ?? "",
                services: [],
                hours: "",
                approved: true,
              }}
            />
          ))}
          {results.length===0 && <div className="text-sm text-muted-foreground">Tidak ada hasil. Coba ubah filter.</div>}
        </div>
      </section>
    </main>
  );
};

export default Search;
