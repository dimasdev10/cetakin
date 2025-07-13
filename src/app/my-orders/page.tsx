import { LandingNavbar } from "@/components/navbar/landing-nav";
import { OrderHistoryTabs } from "@/components/order-history-tabs";

import { AlertCircle } from "lucide-react";
import { PaymentStatus } from "@prisma/client";
import { getUserOrders } from "@/actions/order";

interface MyOrdersPageProps {
  searchParams: {
    status?: string;
  };
}

export default async function MyOrdersPage({
  searchParams,
}: MyOrdersPageProps) {
  const statusFilter = searchParams.status?.toUpperCase() as
    | PaymentStatus
    | "ALL"
    | undefined;

  const isValidStatus =
    statusFilter === "ALL" ||
    Object.values(PaymentStatus).includes(statusFilter as PaymentStatus);

  const finalStatusFilter = isValidStatus ? statusFilter : "ALL";

  const ordersResult = await getUserOrders({ status: finalStatusFilter });

  if ("error" in ordersResult) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <LandingNavbar />
        <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
          <div className="flex flex-col items-center justify-center h-full text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Gagal Memuat Pesanan
            </h1>
            <p className="text-gray-600">{ordersResult.error}</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <>
      <LandingNavbar />
      <main className="px-4 md:px-14">
        <div className="border-r border-l border-dashed px-4 pt-24 min-h-screen pb-10">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Pesanan Saya
          </h1>
          <OrderHistoryTabs
            orders={ordersResult}
            initialStatus={finalStatusFilter || "ALL"}
          />
        </div>
      </main>
    </>
  );
}
