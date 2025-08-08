import { useMemo, useState } from "react";
import SEO from "@/components/SEO";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import MerchantCard from "@/components/MerchantCard";
import { merchants as allMerchants, MerchantCategory } from "@/data/merchants";
import { useSearchParams } from "react-router-dom";

const cities = ["Jakarta", "Bandung", "Surabaya"] as const;
const categories: (MerchantCategory | "Semua")[] = ["Semua", "Petshop", "Grooming", "Klinik Hewan"]; 

const Directory = () => {
  const [params] = useSearchParams();
  const initialQ = params.get('q') ?? '';
  const [q, setQ] = useState(initialQ);
  const [city, setCity] = useState<typeof cities[number] | "">("");
  const [cat, setCat] = useState<MerchantCategory | "Semua">("Semua");

  const filtered = useMemo(() => {
    return allMerchants.filter(m => {
      const matchQ = q ? (m.name.toLowerCase().includes(q.toLowerCase()) || m.description.toLowerCase().includes(q.toLowerCase())) : true;
      const matchCity = city ? m.city === city : true;
      const matchCat = cat === "Semua" ? true : m.category === cat;
      return matchQ && matchCity && matchCat && (m.approved ?? true);
    });
  }, [q, city, cat]);

  return (
    <main className="min-h-screen container py-6">
      <SEO
        title="Direktori Merchant — PetConnect ID"
        description="Temukan petshop, grooming, dan klinik hewan terdekat dengan filter kategori & lokasi."
        canonical="https://cb2a613f-b29b-41df-a5c9-4c4264d87d30.lovableproject.com/direktori"
      />

      <h1 className="text-2xl font-semibold mb-4">Direktori Merchant</h1>

      <div className="grid md:grid-cols-4 gap-3 items-center mb-6">
        <div className="md:col-span-2">
          <Input placeholder="Cari layanan atau merchant" value={q} onChange={(e)=>setQ(e.target.value)} />
        </div>
        <Select onValueChange={(v)=>setCat(v as any)}>
          <SelectTrigger>
            <SelectValue placeholder="Kategori" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select onValueChange={(v)=>setCity(v as any)}>
          <SelectTrigger>
            <SelectValue placeholder="Kota" />
          </SelectTrigger>
          <SelectContent>
            {cities.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filtered.map((m) => (
          <MerchantCard key={m.id} merchant={m} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center text-muted-foreground py-16">Tidak ada hasil. Coba ubah filter.</div>
      )}

      <div className="mt-8">
        <a href="/dashboard/merchant"><Button variant="outline">Jadi Merchant</Button></a>
      </div>
    </main>
  );
};

export default Directory;
