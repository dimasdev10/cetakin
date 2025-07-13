import { DashboardOrderTabs } from "@/components/dashboard-order-tabs";

import { AlertCircle } from "lucide-react";
import { OrderStatus } from "@prisma/client";
import { getAllOrderTable } from "@/actions/order";

interface AdminOrdersPageProps {
  searchParams: Promise<{
    orderStatus?: string;
  }>;
}

export default async function AdminOrdersPage({
  searchParams,
}: AdminOrdersPageProps) {
  const { orderStatus } = await searchParams;

  const statusFilter = orderStatus?.toUpperCase() as OrderStatus;

  const isValidStatus = Object.values(OrderStatus).includes(
    statusFilter as OrderStatus
  );

  const finalStatusFilter = isValidStatus ? statusFilter : "REQUESTED";

  // Ambil data pesanan berdasarkan finalStatusFilter
  const ordersResult = await getAllOrderTable({
    orderStatus: finalStatusFilter,
  });

  if ("error" in ordersResult) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <div className="border-b bg-white">
          <div className="container mx-auto px-4 py-4">
            <h1 className="text-2xl font-bold text-gray-900">Kelola Pesanan</h1>
            <p className="text-gray-600">
              Lihat dan kelola semua pesanan pelanggan.
            </p>
          </div>
        </div>
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
    <div className="flex-1 space-y-4 py-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Daftar Pesanan</h2>
        <p className="text-muted-foreground">
          Lihat dan kelola semua pesanan yang masuk.
        </p>
      </div>

      <DashboardOrderTabs
        initialOrders={ordersResult}
        initialStatus={finalStatusFilter}
      />
    </div>
  );
}
