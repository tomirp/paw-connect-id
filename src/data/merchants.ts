export type MerchantCategory = "Petshop" | "Grooming" | "Klinik Hewan";

export interface ServiceItem {
  name: string;
  price: number;
}

export interface Merchant {
  id: string;
  name: string;
  city: "Jakarta" | "Bandung" | "Surabaya";
  category: MerchantCategory;
  rating: number; // 0-5
  priceRange: string; // e.g., "Rp50k - Rp150k"
  distanceKm: number;
  images: string[];
  description: string;
  services: ServiceItem[];
  hours: string;
  approved?: boolean;
}

export const merchants: Merchant[] = [
  {
    id: "m1",
    name: "PawPaw Petshop",
    city: "Jakarta",
    category: "Petshop",
    rating: 4.6,
    priceRange: "Rp20k - Rp200k",
    distanceKm: 1.2,
    images: ["/placeholder.svg"],
    description: "Toko perlengkapan hewan lengkap dengan pelayanan ramah.",
    services: [
      { name: "Makanan Kucing 1kg", price: 65000 },
      { name: "Pasir Kucing 10L", price: 85000 },
    ],
    hours: "09.00 - 21.00",
    approved: true,
  },
  {
    id: "m2",
    name: "Grooming Ceria",
    city: "Jakarta",
    category: "Grooming",
    rating: 4.8,
    priceRange: "Rp50k - Rp250k",
    distanceKm: 2.0,
    images: ["/placeholder.svg"],
    description: "Layanan grooming profesional untuk anabul kesayangan.",
    services: [
      { name: "Grooming Kucing", price: 120000 },
      { name: "Grooming Anjing Kecil", price: 150000 },
    ],
    hours: "10.00 - 19.00",
    approved: true,
  },
  {
    id: "m3",
    name: "Vet Sehat Jakarta",
    city: "Jakarta",
    category: "Klinik Hewan",
    rating: 4.7,
    priceRange: "Rp100k - Rp500k",
    distanceKm: 3.4,
    images: ["/placeholder.svg"],
    description: "Klinik hewan dengan dokter berpengalaman & peralatan lengkap.",
    services: [
      { name: "Konsultasi Dokter", price: 150000 },
      { name: "Vaksin Rabies", price: 120000 },
    ],
    hours: "08.00 - 20.00",
    approved: true,
  },
  {
    id: "m4",
    name: "Bandung Pet Mart",
    city: "Bandung",
    category: "Petshop",
    rating: 4.5,
    priceRange: "Rp10k - Rp150k",
    distanceKm: 1.0,
    images: ["/placeholder.svg"],
    description: "Perlengkapan hewan dan aksesoris lucu.",
    services: [
      { name: "Mainan Kucing", price: 35000 },
      { name: "Kalung Anjing", price: 45000 },
    ],
    hours: "09.00 - 20.00",
    approved: true,
  },
  {
    id: "m5",
    name: "Glow Groom Bandung",
    city: "Bandung",
    category: "Grooming",
    rating: 4.4,
    priceRange: "Rp70k - Rp250k",
    distanceKm: 2.8,
    images: ["/placeholder.svg"],
    description: "Grooming dengan perawatan kulit sensitif.",
    services: [
      { name: "Mandi Kucing", price: 90000 },
      { name: "Sikat Bulu", price: 60000 },
    ],
    hours: "10.00 - 18.00",
    approved: true,
  },
  {
    id: "m6",
    name: "Vet Care Bandung",
    city: "Bandung",
    category: "Klinik Hewan",
    rating: 4.9,
    priceRange: "Rp120k - Rp600k",
    distanceKm: 4.1,
    images: ["/placeholder.svg"],
    description: "Klinik hewan 24 jam dengan layanan darurat.",
    services: [
      { name: "Konsultasi Umum", price: 170000 },
      { name: "Sterilisasi Kucing", price: 500000 },
    ],
    hours: "24 Jam",
    approved: true,
  },
  {
    id: "m7",
    name: "Surabaya Petstation",
    city: "Surabaya",
    category: "Petshop",
    rating: 4.3,
    priceRange: "Rp15k - Rp180k",
    distanceKm: 1.7,
    images: ["/placeholder.svg"],
    description: "Pilihan makanan premium & kebutuhan harian.",
    services: [
      { name: "Snack Anjing", price: 25000 },
      { name: "Pasir Silika", price: 95000 },
    ],
    hours: "09.00 - 21.00",
    approved: true,
  },
  {
    id: "m8",
    name: "Happy Tail Groom",
    city: "Surabaya",
    category: "Grooming",
    rating: 4.5,
    priceRange: "Rp60k - Rp220k",
    distanceKm: 2.5,
    images: ["/placeholder.svg"],
    description: "Grooming cepat & higienis.",
    services: [
      { name: "Grooming Dasar", price: 110000 },
      { name: "Potong Kuku", price: 30000 },
    ],
    hours: "10.00 - 19.00",
    approved: true,
  },
  {
    id: "m9",
    name: "Vet Prima Surabaya",
    city: "Surabaya",
    category: "Klinik Hewan",
    rating: 4.7,
    priceRange: "Rp120k - Rp550k",
    distanceKm: 3.9,
    images: ["/placeholder.svg"],
    description: "Pelayanan medis lengkap & ramah.",
    services: [
      { name: "Konsultasi Dokter", price: 150000 },
      { name: "Vaksin Kombinasi", price: 200000 },
    ],
    hours: "08.00 - 20.00",
    approved: true,
  },
  {
    id: "m10",
    name: "Pet Gear Jakarta",
    city: "Jakarta",
    category: "Petshop",
    rating: 4.2,
    priceRange: "Rp10k - Rp250k",
    distanceKm: 2.2,
    images: ["/placeholder.svg"],
    description: "Aksesoris & kebutuhan outdoor hewan.",
    services: [
      { name: "Harness Anjing", price: 130000 },
      { name: "Carrier Kucing", price: 220000 },
    ],
    hours: "10.00 - 20.00",
    approved: true,
  },
];
