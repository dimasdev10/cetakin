import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function HeroSection() {
  return (
    <section
      id="home"
      className="min-h-screen flex flex-col justify-center items-center"
    >
      <Badge className="mb-4 bg-primary text-accent text-sm px-3 py-1 rounded-full">
        🚗 Solusi Digital Terdepan
      </Badge>
      <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight text-center">
        Perpanjang Pajak Kendaraan
        <span className="text-primary"> Tanpa Antri</span>
        <br />
        Lebih Mudah, Cepat, dan Aman
      </h1>
      <p className="text-sm md:text-base text-gray-600 mb-8 md:max-w-xl text-center">
        Platform digital yang memudahkan Anda untuk perpanjang pajak kendaraan,
        cetak dokumen, dan layanan administrasi lainnya dari rumah. Nikmati
        kemudahan mengurus dokumen tanpa ribet.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center w-full">
        <Link href="/#packages">
          <Button
            size="lg"
            className="rounded-full shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1 w-full"
          >
            Mulai Sekarang
          </Button>
        </Link>
        <Link href="/#features">
          <Button
            size="lg"
            variant="secondary"
            className="rounded-full shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1"
          >
            Pelajari Lebih Lanjut
          </Button>
        </Link>
      </div>
    </section>
  );
}
