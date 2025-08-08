import { useParams } from "react-router-dom";
import SEO from "@/components/SEO";
import { merchants } from "@/data/merchants";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

interface Msg { id: string; from: 'user' | 'merchant'; text: string; ts: number }

const Chat = () => {
  const { id } = useParams();
  const merchant = merchants.find(m => m.id === id);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(()=>{ ref.current?.scrollTo(0, ref.current.scrollHeight); }, [msgs]);

  if (!merchant) return <main className="container py-8">Merchant tidak ditemukan.</main>;

  const send = () => {
    if (!text.trim()) return;
    setMsgs((m)=>[...m, { id: String(Date.now()), from: 'user', text, ts: Date.now() }]);
    setText("");
  };

  return (
    <main className="min-h-screen container py-6">
      <SEO title={`Chat — ${merchant.name}`} description={`Chat dengan ${merchant.name}`} canonical={`https://cb2a613f-b29b-41df-a5c9-4c4264d87d30.lovableproject.com/chat/${merchant.id}`} />

      <div className="mb-3 p-3 rounded-md border bg-accent">
        Realtime chat memerlukan Supabase Realtime. Aktifkan integrasi Supabase terlebih dahulu untuk produksi.
      </div>

      <h1 className="text-2xl font-semibold mb-4">Chat dengan {merchant.name}</h1>

      <div ref={ref} className="h-[50vh] border rounded-md p-3 overflow-y-auto bg-card">
        {msgs.length===0 && <div className="text-muted-foreground text-sm">Mulai percakapan Anda...</div>}
        <div className="space-y-2">
          {msgs.map((m)=> (
            <div key={m.id} className={`max-w-[80%] rounded-lg p-2 ${m.from==='user'? 'ml-auto bg-primary text-primary-foreground' : 'bg-secondary'}`}>{m.text}</div>
          ))}
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        <input value={text} onChange={(e)=>setText(e.target.value)} placeholder="Tulis pesan" className="flex-1 h-10 rounded-md border px-3 bg-background" />
        <Button onClick={send}>Kirim</Button>
      </div>
    </main>
  );
};

export default Chat;
