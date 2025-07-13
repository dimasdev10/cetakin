"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { DataTable } from "@/components/ui/data-table";
import { Card, CardContent } from "@/components/ui/card";
import { columns, OrderTable } from "@/components/tables/columns/order-columns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import type { OrderStatus } from "@prisma/client";
import { useCallback, useEffect, useState } from "react";

interface DashboardOrderTabsProps {
  initialOrders: OrderTable[];
  initialStatus: OrderStatus;
}

const orderStatusLabels: Record<OrderStatus, string> = {
  REQUESTED: "Diminta",
  PROCESSING: "Diproses",
  COMPLETED: "Selesai",
  CANCELLED: "Dibatalkan",
};

export function DashboardOrderTabs({
  initialOrders,
  initialStatus,
}: DashboardOrderTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<string>(initialStatus);

  const handleTabChange = useCallback(
    (value: string) => {
      setActiveTab(value);
      router.replace(`/dashboard/orders?orderStatus=${value}`);
    },
    [router]
  );

  useEffect(() => {
    const statusParam = searchParams.get("orderStatus") || "REQUESTED";
    setActiveTab(statusParam);
  }, [searchParams]);

  return (
    <Tabs
      value={activeTab}
      onValueChange={handleTabChange}
      className="w-full pt-2"
    >
      <TabsList className="grid w-full grid-cols-1 md:grid-cols-4 h-auto flex-wrap bg-white border">
        {Object.entries(orderStatusLabels).map(([statusKey, label]) => (
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
        {initialOrders.length === 0 ? (
          <Card className="shadow-none border-dashed">
            <CardContent className="py-8 text-center text-muted-foreground">
              Tidak ada pesanan.
            </CardContent>
          </Card>
        ) : (
          <DataTable
            columns={columns}
            data={initialOrders}
            searchKey="userName"
            searchPlaceholder="Cari nama pelanggan..."
          />
        )}
      </TabsContent>
    </Tabs>
  );
}
