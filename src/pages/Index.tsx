import { useNavigate } from "react-router-dom";
import heroImg from "@/assets/hero-pets.jpg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PawPrint, Scissors, Stethoscope } from "lucide-react";
import SEO from "@/components/SEO";
import { useState } from "react";

const Index = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

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
    </main>
  );
};

export default Index;

