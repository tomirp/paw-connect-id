import { useParams, Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { merchants } from "@/data/merchants";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";

const MerchantDetail = () => {
  const { id } = useParams();
  const merchant = merchants.find(m => m.id === id);

  if (!merchant) return <main className="container py-8">Merchant tidak ditemukan.</main>;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: merchant.name,
    address: { "@type": "PostalAddress", addressLocality: merchant.city, addressCountry: "ID" },
    aggregateRating: { "@type": "AggregateRating", ratingValue: merchant.rating, reviewCount: 50 },
  };

  return (
    <main className="min-h-screen container py-6">
      <SEO title={`${merchant.name} — PetConnect ID`} description={merchant.description} canonical={`https://cb2a613f-b29b-41df-a5c9-4c4264d87d30.lovableproject.com/merchant/${merchant.id}`} jsonLd={jsonLd} />

      <h1 className="text-2xl font-semibold mb-4">{merchant.name}</h1>

      <Carousel className="mb-6">
        <CarouselContent>
          {merchant.images.map((src, idx) => (
            <CarouselItem key={idx}>
              <img src={src} alt={`Foto ${merchant.name} ${idx+1}`} className="w-full h-64 object-cover rounded-md" loading="lazy" />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      <p className="text-muted-foreground mb-4">{merchant.description}</p>

      <section className="mb-6">
        <h2 className="font-semibold mb-2">Layanan</h2>
        <ul className="space-y-2">
          {merchant.services.map((s, i) => (
            <li key={i} className="flex items-center justify-between">
              <span>{s.name}</span>
              <span>Rp{s.price.toLocaleString('id-ID')}</span>
            </li>
          ))}
        </ul>
      </section>

      <div className="text-sm text-muted-foreground mb-6">Jam operasional: {merchant.hours}</div>

      <div className="flex gap-3">
        <Link to={`/booking/${merchant.id}`}><Button variant="hero">Booking Sekarang</Button></Link>
        <Link to={`/chat/${merchant.id}`}><Button variant="outline">Chat</Button></Link>
      </div>
    </main>
  );
};

export default MerchantDetail;
