import { useState } from "react";
import SEO from "@/components/SEO";
import { merchants as seed } from "@/data/merchants";
import { Button } from "@/components/ui/button";

const AdminDashboard = () => {
  const [merchants, setMerchants] = useState(seed);
  const toggle = (id: string) => setMerchants((ms)=> ms.map(m => m.id===id ? { ...m, approved: !m.approved } : m));

  return (
    <main className="min-h-screen container py-6">
      <SEO title="Dashboard Admin — PetConnect ID" description="Approve merchant & kelola listing." canonical="https://cb2a613f-b29b-41df-a5c9-4c4264d87d30.lovableproject.com/dashboard/admin" />
      <h1 className="text-2xl font-semibold mb-4">Dashboard Admin</h1>
      <div className="space-y-3">
        {merchants.map((m)=> (
          <div key={m.id} className="flex items-center justify-between border rounded-md p-3">
            <div>
              <div className="font-medium">{m.name}</div>
              <div className="text-sm text-muted-foreground">{m.category} • {m.city}</div>
            </div>
            <Button variant={m.approved? 'outline' : 'hero'} onClick={()=>toggle(m.id)}>
              {m.approved? 'Batalkan Approve' : 'Approve'}
            </Button>
          </div>
        ))}
      </div>
    </main>
  );
};

export default AdminDashboard;
