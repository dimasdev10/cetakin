"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

import { OrderStatus } from "@prisma/client";
import { updateOrderStatus } from "@/actions/order";
import { MoreHorizontal, Eye, Loader2, CheckCircle } from "lucide-react";

interface OrderColumnActionsProps {
  orderId: string;
  currentOrderStatus: OrderStatus;
}

export function OrderColumnActions({
  orderId,
  currentOrderStatus,
}: OrderColumnActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [openStatusDialog, setOpenStatusDialog] = useState(false);
  const [selectedStatus, setSelectedStatus] =
    useState<OrderStatus>(currentOrderStatus);

  const handleUpdateStatus = () => {
    startTransition(async () => {
      const result = await updateOrderStatus(orderId, selectedStatus);
      if (result.error) {
        toast.error(result.error);
      } else {
        const status =
          selectedStatus === OrderStatus.REQUESTED
            ? "Diminta"
            : selectedStatus === OrderStatus.PROCESSING
            ? "Diproses"
            : selectedStatus === OrderStatus.COMPLETED
            ? "Selesai"
            : "Dibatalkan";
        toast.success(`Status pesanan diperbarui ke ${status}.`);
        setOpenStatusDialog(false);
        router.refresh();
      }
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild disabled={isPending}>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild className="cursor-pointer">
            <Link href={`/dashboard/orders/${orderId}`}>
              <Eye className="h-4 w-4" />
              Lihat Detail
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              setSelectedStatus(currentOrderStatus);
              setOpenStatusDialog(true);
            }}
            className="cursor-pointer"
          >
            <CheckCircle className="!h-[14px] !w-[14px]" />
            Ubah Status
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialog for changing order status */}
      <Dialog open={openStatusDialog} onOpenChange={setOpenStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ubah Status Pesanan</DialogTitle>
            <DialogDescription>
              Pilih status baru untuk pesanan{" "}
              <span className="font-medium">{orderId.substring(0, 8)}</span>.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Select
              value={selectedStatus}
              onValueChange={(value: OrderStatus) => setSelectedStatus(value)}
              disabled={isPending}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih Status" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(OrderStatus).map((status) => (
                  <SelectItem key={status} value={status}>
                    {status === OrderStatus.REQUESTED && "Diminta"}
                    {status === OrderStatus.PROCESSING && "Diproses"}
                    {status === OrderStatus.COMPLETED && "Selesai"}
                    {status === OrderStatus.CANCELLED && "Dibatalkan"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setOpenStatusDialog(false)}
              disabled={isPending}
            >
              Batalkan
            </Button>
            <Button
              onClick={handleUpdateStatus}
              disabled={isPending || selectedStatus === currentOrderStatus}
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Ya, Ubah
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
