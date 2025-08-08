import { useEffect, useState } from "react";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        navigate("/", { replace: true });
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const signIn = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast({ title: "Login gagal", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Berhasil login", description: "Selamat datang kembali!" });
    }
  };

  const signUp = async () => {
    setLoading(true);
    const redirectUrl = `${window.location.origin}/`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: redirectUrl },
    });
    setLoading(false);
    if (error) {
      toast({ title: "Pendaftaran gagal", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Pendaftaran berhasil", description: "Silakan cek email untuk verifikasi." });
    }
  };

  return (
    <main className="min-h-screen">
      <SEO title="Masuk / Daftar — PetConnect ID" description="Login atau daftar untuk menikmati semua fitur PetConnect ID." canonical="https://cb2a613f-b29b-41df-a5c9-4c4264d87d30.lovableproject.com/auth" />
      <section className="container py-10 max-w-md">
        <h1 className="text-2xl font-bold mb-4">Masuk atau Daftar</h1>
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="login">Masuk</TabsTrigger>
            <TabsTrigger value="signup">Daftar</TabsTrigger>
          </TabsList>
          <TabsContent value="login" className="mt-4 space-y-3">
            <Input type="email" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} />
            <Input type="password" placeholder="Password" value={password} onChange={(e)=>setPassword(e.target.value)} />
            <Button onClick={signIn} disabled={loading} className="w-full">{loading? 'Memproses...' : 'Masuk'}</Button>
          </TabsContent>
          <TabsContent value="signup" className="mt-4 space-y-3">
            <Input type="email" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} />
            <Input type="password" placeholder="Password (min 6 karakter)" value={password} onChange={(e)=>setPassword(e.target.value)} />
            <Button onClick={signUp} disabled={loading} className="w-full">{loading? 'Memproses...' : 'Daftar'}</Button>
          </TabsContent>
        </Tabs>
      </section>
    </main>
  );
};

export default Auth;
