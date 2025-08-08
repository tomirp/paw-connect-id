import SEO from "@/components/SEO";

const Checkout = () => {
  return (
    <main className="min-h-screen">
      <SEO title="Checkout — PetConnect ID" description="Proses pembayaran yang aman dan cepat." canonical="https://cb2a613f-b29b-41df-a5c9-4c4264d87d30.lovableproject.com/checkout" />
      <section className="container py-10">
        <h1 className="text-2xl font-bold">Checkout</h1>
        <p className="text-muted-foreground mt-2">Anda akan diarahkan ke halaman pembayaran ketika memulai checkout dari keranjang.</p>
      </section>
    </main>
  );
};

export default Checkout;
