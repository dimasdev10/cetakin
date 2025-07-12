import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock, Shield, Zap } from "lucide-react";

export function FeaturesSection() {
  return (
    <section id="features" className="px-4 pt-24">
      <div className="text-center mb-12">
        <h2 className="text-xl md:text-3xl font-bold text-primary mb-4">
          Mengapa Pilih W&M?
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Kami menyediakan solusi digital yang aman, cepat, dan terpercaya untuk
          semua kebutuhan administrasi kendaraan anda.
        </p>
      </div>
      <div className="grid md:grid-cols-4 gap-8">
        <Card className="shadow-none border-dashed duration-300 transition-all transform hover:-translate-y-2">
          <CardHeader>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
              <Clock className="w-7 h-7 text-blue-600" />
            </div>
            <CardTitle className="text-lg font-semibold">Hemat Waktu</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 text-sm">
              Tidak perlu antri panjang. Proses semua dokumen dari rumah.
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-none border-dashed duration-300 transition-all transform hover:-translate-y-2">
          <CardHeader>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
              <Zap className="w-7 h-7 text-yellow-600" />
            </div>
            <CardTitle className="text-lg font-semibold">Cepat</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 text-sm">
              Pesanan diproses dengan sangat cepat tanpa hambatan.
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-none border-dashed duration-300 transition-all transform hover:-translate-y-2">
          <CardHeader>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-7 h-7 text-green-600" />
            </div>
            <CardTitle className="text-lg font-semibold">
              Aman & Terpercaya
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 text-sm">
              Data anda kami pastikan dilindungi dengan aman.
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-none border-dashed duration-300 transition-all transform hover:-translate-y-2">
          <CardHeader>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-7 h-7 text-purple-600" />
            </div>
            <CardTitle className="text-lg font-semibold">
              Mudah Digunakan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 text-sm">
              Tampilan yang sederhana, sehingga mudah digunakan.
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
