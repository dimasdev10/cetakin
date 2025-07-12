import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Clock, Mail, MapPin, Navigation, Phone, Store } from "lucide-react";
import { Button } from "../ui/button";

export function LocationSection() {
  const storeInfo = {
    name: "W&M Store",
    address: "Jl. Sudirman No. 123, Jakarta Pusat, DKI Jakarta 10220",
    phone: "+62 812-3456-7890",
    email: "info.w&m@gmail.com",
    hours: {
      weekdays: "09:00 - 21:00",
      weekend: "10:00 - 22:00",
    },
    coordinates: {
      lat: -6.2088,
      lng: 106.8456,
    },
  };

  return (
    <section id="location" className="pt-24 px-4 pb-10">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
          <MapPin className="h-4 w-4 text-primary mr-2" />
          <span className="text-sm font-medium text-primary">Lokasi Toko</span>
        </div>
        <h2 className="text-xl md:text-3xl font-bold text-primary mb-4">
          Kunjungi Toko W&M
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Datang langsung ke toko kami untuk kebutuhan cetak dokumen secara
          langsung. Kami siap membantu anda dengan layanan terbaik.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Card className="shadow-none border-dashed">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5 text-primary" />
                Informasi Toko
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold text-foreground mb-2">Alamat</h3>
                <p className="text-muted-foreground">{storeInfo.address}</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Phone className="h-4 w-4 text-primary" />
                    Telepon
                  </h3>
                  <a
                    href={`tel:${storeInfo.phone}`}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {storeInfo.phone}
                  </a>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-primary" />
                    Email
                  </h3>
                  <a
                    href={`mailto:${storeInfo.email}`}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {storeInfo.email}
                  </a>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  Jam Operasional
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Senin - Jumat</span>
                    <span className="text-foreground font-medium">
                      {storeInfo.hours.weekdays}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Sabtu - Minggu
                    </span>
                    <span className="text-foreground font-medium">
                      {storeInfo.hours.weekend}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  asChild
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${storeInfo.coordinates.lat},${storeInfo.coordinates.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Navigation className="h-4 w-4 mr-2" />
                    Buka di Maps
                  </a>
                </Button>
                <Button asChild variant="outline" className="flex-1">
                  <a
                    href={`https://wa.me/${storeInfo.phone.replace(
                      /[^0-9]/g,
                      ""
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    WhatsApp
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="overflow-hidden py-0 shadow-none border-dashed">
            <div className="h-[404px]">
              <iframe
                className="w-full h-full rounded-md object-cover z-10"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.391563234665!2d106.82715331476913!3d-6.200000995509601!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f3eecb2b1e2f%3A0x7d0b0e2b0e2b0e2b!2sMonas%2C%20Jakarta!5e0!3m2!1sen!2sid!4v1720115961932!5m2!1sen!2sid"
                title="Lokasi SneakCare"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
