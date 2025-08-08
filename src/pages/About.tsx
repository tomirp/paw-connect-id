import SEO from "@/components/SEO";

const About = () => {
  return (
    <main className="min-h-screen">
      <SEO title="Tentang — PetConnect ID" description="Tentang PetConnect ID: misi, manfaat, dan cara kerja platform." canonical="https://cb2a613f-b29b-41df-a5c9-4c4264d87d30.lovableproject.com/tentang" />
      <section className="container py-10 space-y-8">
        <header>
          <h1 className="text-3xl font-bold">Tentang PetConnect ID</h1>
          <p className="text-muted-foreground mt-2">Platform marketplace hewan peliharaan untuk menemukan produk, layanan, toko, dan klinik terpercaya dekat Anda.</p>
        </header>
        <article className="grid md:grid-cols-3 gap-6">
          <div className="p-5 rounded-xl border bg-card">
            <h2 className="font-semibold">Misi</h2>
            <p className="text-sm text-muted-foreground mt-2">Menyederhanakan perawatan hewan peliharaan dengan akses cepat ke petshop, grooming, dan klinik/vet.</p>
          </div>
          <div className="p-5 rounded-xl border bg-card">
            <h2 className="font-semibold">Manfaat</h2>
            <p className="text-sm text-muted-foreground mt-2">Bandingkan harga, ulasan, dan ketersediaan. Booking dan belanja dalam satu aplikasi.</p>
          </div>
          <div className="p-5 rounded-xl border bg-card">
            <h2 className="font-semibold">Kontak</h2>
            <p className="text-sm text-muted-foreground mt-2">Butuh bantuan? Hubungi tim dukungan kami melalui menu Profil &gt; Bantuan.</p>
          </div>
        </article>
      </section>
    </main>
  );
};

export default About;
