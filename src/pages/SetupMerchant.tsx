import { useEffect, useState } from "react";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const SetupMerchant = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const e = params.get("email") || "";
    const p = params.get("password") || "";
    if (e && p) {
      setEmail(e);
      setPassword(p);
    }
  }, []);

  const run = async () => {
    if (!email || !password) {
      toast({ title: "Perlu email & password", variant: "destructive" });
      return;
    }
    try {
      setLoading(true);
      const res = await fetch("https://yjeuzsswonwxmhbimvjv.supabase.co/functions/v1/bootstrap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role: "merchant" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal membuat akun");
      toast({ title: "Akun merchant siap", description: `Email: ${email}` });
      setDone(true);
    } catch (err: any) {
      toast({ title: "Gagal", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen container py-10 max-w-md">
      <SEO title="Setup Merchant — PetConnect ID" description="Buat akun merchant khusus." canonical="https://cb2a613f-b29b-41df-a5c9-4c4264d87d30.lovableproject.com/__setup/merchant" />
      <h1 className="text-2xl font-semibold mb-4">Setup Merchant (sementara)</h1>
      <p className="text-sm text-muted-foreground mb-4">Halaman sementara untuk membuat akun merchant.</p>
      <div className="space-y-3">
        <Input placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} />
        <Input type="password" placeholder="Password" value={password} onChange={(e)=>setPassword(e.target.value)} />
        <Button className="w-full" onClick={run} disabled={loading}>{loading? 'Memproses...' : 'Buat Akun Merchant'}</Button>
        {done && (
          <div className="text-sm">
            Selesai. Silakan login di halaman Auth. <a href="/auth" className="underline">Ke halaman login</a>
          </div>
        )}
      </div>
    </main>
  );
};

export default SetupMerchant;
