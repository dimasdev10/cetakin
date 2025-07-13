import Link from "next/link";
import Image from "next/image";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { Package2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { getListPackagesOverview } from "@/actions/package";

export async function PackagesOverviewSection() {
  const packages = await getListPackagesOverview();

  return (
    <section id="packages" className="px-4 pt-24">
      <div className="text-center mb-12">
        <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
          <Package2 className="h-4 w-4 text-primary mr-2" />
          <span className="text-sm font-medium text-primary">Paket</span>
        </div>
        <h2 className="text-xl md:text-3xl font-bold text-primary mb-4">
          Paket Layanan
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Pilih paket layanan yang sesuai dengan kebutuhan anda sekarang
        </p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <Card
            key={pkg.id}
            className="border-0 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 py-0 gap-2"
          >
            <CardHeader className="p-0">
              <div className="aspect-video relative rounded-t-lg overflow-hidden bg-gray-100">
                <Image
                  src={pkg.image || "/placeholder.svg?height=200&width=300"}
                  alt={pkg.name}
                  fill
                  className="object-cover"
                />
              </div>
            </CardHeader>
            <CardContent className="pb-5">
              <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
                {pkg.name}
              </CardTitle>
              <CardDescription className="text-sm text-gray-600 mb-4">
                {pkg.description}
              </CardDescription>
              <div className="mb-4 text-end">
                <span className="font-bold text-green-600">
                  {formatPrice(Number(pkg.price))}
                </span>
              </div>
              <Link href={`/packages/${pkg.id}`}>
                <Button className="w-full">Pilih Paket</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
