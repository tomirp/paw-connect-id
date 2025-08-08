import { useParams } from "react-router-dom";
import SEO from "@/components/SEO";
import { merchants } from "@/data/merchants";
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const times = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"];

const Booking = () => {
  const { id } = useParams();
  const merchant = merchants.find(m => m.id === id);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState<string>("");

  if (!merchant) return <main className="container py-8">Merchant tidak ditemukan.</main>;

  const onConfirm = () => {
    if (!date || !time) return toast("Pilih tanggal & jam terlebih dahulu");
    toast.success("Booking dibuat! Kami akan kirim konfirmasi manual via email/SMS.");
  };

  return (
    <main className="min-h-screen container py-6">
      <SEO title={`Booking — ${merchant.name}`} description={`Pilih jadwal layanan di ${merchant.name}`} canonical={`https://cb2a613f-b29b-41df-a5c9-4c4264d87d30.lovableproject.com/booking/${merchant.id}`} />

      <h1 className="text-2xl font-semibold mb-4">Booking di {merchant.name}</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border" />
        </div>
        <div>
          <h2 className="font-medium mb-2">Pilih Jam</h2>
          <div className="grid grid-cols-3 gap-2">
            {times.map((t) => (
              <button key={t} className={`h-10 rounded-md border ${time===t? 'bg-primary text-primary-foreground' : ''}`} onClick={()=>setTime(t)}>{t}</button>
            ))}
          </div>

          <div className="mt-6">
            <Button variant="hero" onClick={onConfirm}>Konfirmasi Booking</Button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Booking;
