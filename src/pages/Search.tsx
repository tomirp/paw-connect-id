import { useEffect, useMemo, useState } from "react";
import SEO from "@/components/SEO";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import MerchantCard from "@/components/MerchantCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
interface Merchant { id: string; name: string; city: string; category: string; description: string; }
interface Merchant { id: string; name: string; city: string; category: string; description: string; }
interface Product { id: string; name: string; price: number; image_url?: string | null }
interface Service { id: string; name: string; price: number; duration_minutes?: number | null }

const FN_URL = "https://yjeuzsswonwxmhbimvjv.supabase.co/functions/v1/search";

const Search = () => {
  const [q, setQ] = useState("");
  const [city, setCity] = useState<string | undefined>();
  const [category, setCategory] = useState<string | undefined>();
  const [results, setResults] = useState<Merchant[]>([]);
  const [productResults, setProductResults] = useState<Product[]>([]);
  const [serviceResults, setServiceResults] = useState<Service[]>([]);
  const [activeTab, setActiveTab] = useState<"merchants" | "products" | "services">("merchants");
  const [loading, setLoading] = useState(false);

  const cities = useMemo(() => Array.from(new Set(results.map(r=>r.city).filter(Boolean))), [results]);

  const run = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (category) params.set("category", category);
    if (city) params.set("city", city);
    params.set("pageSize", "24");
    const res = await fetch(`${FN_URL}?${params.toString()}`);
    const json = await res.json();
    setResults(json?.merchants?.data ?? []);
    setProductResults(json?.products?.data ?? []);
    setServiceResults(json?.services?.data ?? []);
    setLoading(false);
  };

  useEffect(() => { const qp = new URLSearchParams(window.location.search); const initial = qp.get('q') ?? ''; if (initial) setQ(initial); setTimeout(run, 0); }, []);

  return (
    <main className="min-h-screen">
      <SEO title="Telusuri — PetConnect ID" description="Cari produk, layanan, toko, dan klinik hewan berdasarkan lokasi, harga, dan rating." canonical="https://cb2a613f-b29b-41df-a5c9-4c4264d87d30.lovableproject.com/search" />
      <section className="container py-6 space-y-4">
        <h1 className="text-2xl font-bold">Telusuri</h1>
        <div className="grid md:grid-cols-4 gap-2">
          <Input placeholder="Cari toko/klinik/layanan" value={q} onChange={(e)=>setQ(e.target.value)} onKeyDown={(e)=> e.key==='Enter' && run()} className="md:col-span-2" />
          <Select onValueChange={setCategory}>
            <SelectTrigger><SelectValue placeholder="Kategori" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="petshop">Petshop</SelectItem>
              <SelectItem value="grooming">Grooming</SelectItem>
              <SelectItem value="vet">Klinik Hewan</SelectItem>
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
        <Tabs value={activeTab} onValueChange={(v)=>setActiveTab(v as any)} className="w-full mt-4">
          <TabsList>
            <TabsTrigger value="merchants">Merchant</TabsTrigger>
            <TabsTrigger value="products">Produk</TabsTrigger>
            <TabsTrigger value="services">Layanan</TabsTrigger>
          </TabsList>

          <TabsContent value="merchants">
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
              {loading && results.length===0 && Array.from({length:6}).map((_,i)=> (
                <div key={`m-skel-${i}`} className="rounded-md border overflow-hidden">
                  <Skeleton className="h-40 w-full" />
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
              {!loading && results.length===0 && <div className="text-sm text-muted-foreground">Tidak ada hasil. Coba ubah filter.</div>}
            </div>
          </TabsContent>

          <TabsContent value="products">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {productResults.map((p)=> (
                <Card key={p.id} className="p-4">
                  <div className="font-medium truncate">{p.name}</div>
                  <div className="text-sm text-muted-foreground">Mulai Rp {Number((p as any).price ?? 0).toLocaleString()}</div>
                </Card>
              ))}
              {loading && productResults.length===0 && Array.from({length:6}).map((_,i)=> (
                <Card key={`p-skel-${i}`} className="p-4">
                  <Skeleton className="h-24 w-full rounded-md" />
                  <div className="mt-3 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </Card>
              ))}
              {!loading && productResults.length===0 && <div className="text-sm text-muted-foreground">Tidak ada produk ditemukan.</div>}
            </div>
          </TabsContent>

          <TabsContent value="services">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {serviceResults.map((s)=> (
                <Card key={s.id} className="p-4">
                  <div className="font-medium truncate">{s.name}</div>
                  <div className="text-sm text-muted-foreground">Mulai Rp {Number((s as any).price ?? 0).toLocaleString()} • {(s as any).duration_minutes ?? 0} menit</div>
                </Card>
              ))}
              {loading && serviceResults.length===0 && Array.from({length:6}).map((_,i)=> (
                <Card key={`s-skel-${i}`} className="p-4">
                  <Skeleton className="h-24 w-full rounded-md" />
                  <div className="mt-3 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </Card>
              ))}
              {!loading && serviceResults.length===0 && <div className="text-sm text-muted-foreground">Tidak ada layanan ditemukan.</div>}
            </div>
          </TabsContent>
        </Tabs>
      </section>
    </main>
  );
};

export default Search;
