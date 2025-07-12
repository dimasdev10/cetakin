import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LandingNavbar } from "@/components/navbar/landing-nav";

import { formatPrice } from "@/lib/utils";
import { getPackage } from "@/actions/package";
import { CheckCircle, FileText, ArrowLeft } from "lucide-react";

interface PackageDetailPageProps {
  params: {
    id: string;
  };
}

export default async function PackageDetailPage({
  params,
}: PackageDetailPageProps) {
  const pkg = await getPackage(params.id);

  if (!pkg) {
    notFound();
  }

  return (
    <>
      <LandingNavbar />
      <main className="px-4 md:px-14">
        <div className="border-r border-l border-dashed px-4 pt-24 min-h-screen">
          <Button asChild className="mb-4">
            <Link href="/#packages">
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Paket
            </Link>
          </Button>
          <Card className="shadow-xl overflow-hidden rounded-xl py-0">
            <div className="grid md:grid-cols-2 gap-0">
              {/* Image Section */}
              <div className="relative aspect-video md:aspect-[4/3] bg-gray-100">
                <Image
                  src={pkg.image || "/placeholder.svg?height=400&width=600"}
                  alt={pkg.name}
                  fill
                  className="object-cover"
                  priority
                />
              </div>

              {/* Details Section */}
              <div className="p-6 flex flex-col justify-between">
                <div>
                  <h1 className="text-xl md:text-3xl font-extrabold text-gray-900 mb-3 leading-tight">
                    {pkg.name}
                  </h1>
                  <p className="text-lg text-muted-foreground mb-6">
                    {pkg.description}
                  </p>

                  <p className="text-2xl font-bold text-green-600 mb-8">
                    {formatPrice(Number(pkg.price))}
                  </p>

                  <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <FileText className="w-4 h-4 mr-2 text-blue-500" />
                    Dokumen & Informasi yang Diperlukan:
                  </h2>
                  <ul className="space-y-3 mb-8">
                    {pkg.requiredFields.map((field) => (
                      <li key={field.id} className="flex space-x-3">
                        <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-1.5" />
                        <div>
                          <p className="font-medium text-gray-800">
                            {field.fieldLabel}
                          </p>
                          <p className="text-sm text-gray-600">
                            Tipe: {field.fieldType.toLowerCase()}{" "}
                            {field.isRequired ? "(Wajib)" : "(Opsional)"}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link href={`/packages/${pkg.id}/order`} className="mt-auto">
                  <Button className="w-full">Pilih Paket Ini</Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </>
  );
}
