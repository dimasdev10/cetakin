"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";

import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { PaymentStatus } from "@prisma/client";
import type { OrderWithDetails } from "@/types/order";
import { reInitiatePaymentForOrder } from "@/actions/order";

// Deklarasi window.snap untuk Midtrans
declare global {
  interface Window {
    snap: {
      pay: (token: string, callbacks?: object) => void;
    };
  }
}

interface OrderHistoryTabsProps {
  orders: OrderWithDetails[];
  initialStatus: string;
}

const statusLabels: Record<PaymentStatus | "ALL", string> = {
  ALL: "Semua",
  PENDING: "Menunggu Pembayaran",
  PAID: "Sudah Dibayar",
  CANCELLED: "Dibatalkan",
};

const getBorderColor = (status: PaymentStatus) => {
  switch (status) {
    case PaymentStatus.PAID:
      return "border-green-500";
    case PaymentStatus.PENDING:
      return "border-yellow-500";
    case PaymentStatus.CANCELLED:
      return "border-red-500";
    default:
      return "border-gray-300";
  }
};

export function OrderHistoryTabs({
  orders,
  initialStatus,
}: OrderHistoryTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = React.useState<string>(initialStatus);
  const [isPaying, setIsPaying] = React.useState<string | null>(null);
  const [snapScriptLoaded, setSnapScriptLoaded] = React.useState(false);

  const handleTabChange = React.useCallback(
    (value: string) => {
      setActiveTab(value);
      router.replace(`/my-orders?status=${value}`);
    },
    [router]
  );

  React.useEffect(() => {
    const statusParam = searchParams.get("status") || "ALL";
    setActiveTab(statusParam);
  }, [searchParams]);

  // Untuk memuat script Midtrans Snap secara dinamis
  React.useEffect(() => {
    const midtransUrl = "https://app.sandbox.midtrans.com/snap/snap.js";
    const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY!;

    if (!clientKey) {
      console.error(
        "ERROR: NEXT_PUBLIC_MIDTRANS_CLIENT_KEY is not defined. Cannot load Snap script."
      );
      toast.error("Konfigurasi Pembayaran Error", {
        description:
          "Client Key Midtrans tidak ditemukan. Hubungi administrator.",
      });
      return;
    }

    const existingScript = document.getElementById("midtrans-snap-script");
    if (existingScript) {
      existingScript.remove();
    }

    const scriptTag = document.createElement("script");
    scriptTag.src = midtransUrl;
    scriptTag.setAttribute("data-client-key", clientKey);
    scriptTag.id = "midtrans-snap-script";
    scriptTag.async = true;

    scriptTag.onload = () => {
      console.log("Midtrans Snap script loaded successfully.");
      setSnapScriptLoaded(true);
    };
    scriptTag.onerror = (e) => {
      console.error("ERROR: Failed to load Midtrans Snap script:", e);
      toast.error("Gagal Memuat Script Pembayaran", {
        description:
          "Terjadi masalah saat memuat script Midtrans. Coba refresh halaman.",
      });
      setSnapScriptLoaded(false);
    };

    document.body.appendChild(scriptTag);

    return () => {
      const scriptToRemove = document.getElementById("midtrans-snap-script");
      if (scriptToRemove && document.body.contains(scriptToRemove)) {
        document.body.removeChild(scriptToRemove);
      }
    };
  }, []);

  const handlePayNow = React.useCallback(
    async (orderId: string) => {
      if (!snapScriptLoaded) {
        toast.error("Sistem Pembayaran Belum Siap", {
          description: "Mohon tunggu sebentar atau refresh halaman.",
        });
        return;
      }

      setIsPaying(orderId);
      try {
        const result = await reInitiatePaymentForOrder(orderId);

        if (result.success && result.snapToken) {
          const checkSnapAvailability = setInterval(() => {
            if (window.snap) {
              clearInterval(checkSnapAvailability);
              window.snap.pay(result.snapToken, {
                onSuccess: () => {
                  toast.success("Pembayaran Berhasil!", {
                    description: "Pesanan Anda telah berhasil dibayar.",
                  });
                  router.replace(`/my-orders?status=PAID`);
                },
                onPending: () => {
                  toast.info("Pembayaran Tertunda", {
                    description: "Pembayaran anda sedang menunggu konfirmasi.",
                  });
                  router.replace(`/my-orders?status=PENDING`);
                },
                onError: () => {
                  toast.error("Pembayaran Gagal", {
                    description:
                      "Terjadi kesalahan saat memproses pembayaran Anda.",
                  });
                  router.replace(`/my-orders?status=CANCELLED`);
                },
                onClose: () => {
                  toast.warning("Pembayaran Tertunda", {
                    description: "Pembayaran anda sedang menunggu konfirmasi.",
                  });
                  router.replace(`/my-orders?status=PENDING`);
                },
              });
            }
          }, 500);

          const timeout = setTimeout(() => {
            clearInterval(checkSnapAvailability);
            if (!window.snap) {
              toast.error("Gagal Memuat Pembayaran", {
                description:
                  "Sistem pembayaran tidak merespons. Coba refresh halaman.",
              });
            }
          }, 15000);

          return () => {
            clearInterval(checkSnapAvailability);
            clearTimeout(timeout);
          };
        } else if (result.error) {
          toast.error("Gagal Menginisiasi Pembayaran", {
            description: result.error,
          });
        }
      } catch (error) {
        console.error("Error re-initiating payment:", error);
        toast.error("Terjadi Kesalahan", {
          description: "Gagal menginisiasi pembayaran. Silakan coba lagi.",
        });
      } finally {
        setIsPaying(null);
      }
    },
    [snapScriptLoaded, router]
  );

  const filteredOrders =
    activeTab === "ALL"
      ? orders
      : orders.filter((order) => order.paymentStatus === activeTab);

  return (
    <div className="space-y-6">
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-4 h-auto flex-wrap bg-white border">
          {Object.entries(statusLabels).map(([statusKey, label]) => (
            <TabsTrigger
              key={statusKey}
              value={statusKey}
              className="text-sm cursor-pointer data-[state=active]:border data-[state=active]:border-dashed data-[state=active]:border-primary data-[state=active]:bg-accent data-[state=active]:text-primary data-[state=active]:shadow-none"
            >
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value={activeTab}>
          {filteredOrders.length === 0 ? (
            <Card className="mt-4 shadow-none border-dashed">
              <CardContent className="py-8 text-center text-muted-foreground">
                Tidak ada pesanan.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 mt-4">
              {filteredOrders.map((order) => (
                <Card
                  key={order.id}
                  className={cn(
                    "shadow-none border-dashed",
                    getBorderColor(order.paymentStatus)
                  )}
                >
                  <CardHeader
                    className={cn(
                      "border-b border-dashed border-gray-100 !pb-4",
                      getBorderColor(order.paymentStatus)
                    )}
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="text-sm text-gray-500 font-medium">
                        ID Pesanan: {order.id}
                      </span>
                      <Badge
                        className="px-3 py-1 text-sm font-semibold"
                        variant={
                          order.paymentStatus === PaymentStatus.PAID
                            ? "default"
                            : order.paymentStatus === PaymentStatus.PENDING
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {statusLabels[order.paymentStatus]}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Product Information Section */}
                    <div className="flex flex-col sm:flex-row items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                      <div className="relative w-24 h-24 flex-shrink-0 rounded-md overflow-hidden bg-white border">
                        <Image
                          src={
                            order.package.image ||
                            "/placeholder.svg?height=100&width=100"
                          }
                          alt={order.package.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 text-center sm:text-left">
                        <h3 className="text-lg font-bold text-gray-900">
                          {order.package.name}
                        </h3>
                        <p className="text-2xl font-bold text-green-600 mt-1">
                          {formatPrice(Number(order.package.price))}
                        </p>
                      </div>
                    </div>

                    {/* Order Details Section */}
                    <div className="grid grid-cols-1 gap-y-3 gap-x-6 text-sm">
                      <div className="flex items-center justify-between text-gray-700">
                        <span className="font-medium">Tanggal Pesan:</span>
                        <span>
                          {new Date(order.createdAt).toLocaleDateString(
                            "id-ID",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </span>
                      </div>
                      {order.files.length > 0 && (
                        <div className="flex items-center justify-between text-gray-700">
                          <span className="font-medium">Dokumen:</span>
                          <span>{order.files.length} file</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-gray-700">
                        <span className="font-medium">Status Pesanan:</span>
                        <span className="font-bold">
                          {order.paymentStatus === PaymentStatus.PENDING ? (
                            <span className="italic text-amber-500">
                              Menunggu Pembayaran
                            </span>
                          ) : order.orderStatus === "REQUESTED" ? (
                            "Menunggu Diproses"
                          ) : order.orderStatus === "PROCESSING" ? (
                            "Sedang Diproses"
                          ) : order.orderStatus === "COMPLETED" ? (
                            "Selesai"
                          ) : order.orderStatus === "CANCELLED" ? (
                            "Dibatalkan"
                          ) : (
                            order.orderStatus
                          )}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-gray-700">
                        <span className="font-medium">Total Pembayaran:</span>
                        <span className="font-bold">
                          {formatPrice(Number(order.totalAmount))}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                  {order.paymentStatus === PaymentStatus.PENDING && (
                    <CardFooter
                      className={cn(
                        "pt-4 border-t border-dashed",
                        getBorderColor(order.paymentStatus)
                      )}
                    >
                      <Button
                        onClick={() => handlePayNow(order.id)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        disabled={isPaying === order.id || !snapScriptLoaded}
                      >
                        {isPaying === order.id && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        {isPaying === order.id
                          ? "Memproses Pembayaran..."
                          : "Bayar Sekarang"}
                      </Button>
                    </CardFooter>
                  )}
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
