"use client";

import { Badge } from "@/components/ui/badge";
import { OrderColumnActions } from "@/components/tables/actions/order-column-actions";

import { format } from "date-fns";
import { id } from "date-fns/locale";
import { formatPrice } from "@/lib/utils";
import type { ColumnDef } from "@tanstack/react-table";
import { PaymentStatus, OrderStatus } from "@prisma/client";

export type OrderTable = {
  orderId: string;
  userName: string;
  packageName: string;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  createdAt: string;
  onDelete?: (id: string) => void;
};

export const columns: ColumnDef<OrderTable>[] = [
  {
    accessorKey: "orderId",
    header: "ID Pesanan",
    cell: ({ row }) => (
      <span className="font-medium">{row.original.orderId}</span>
    ),
  },
  {
    accessorKey: "userName",
    header: "Pelanggan",
    cell: ({ row }) => <span>{row.original.userName}</span>,
  },
  {
    accessorKey: "totalAmount",
    header: "Total",
    cell: ({ row }) => (
      <span>{formatPrice(Number(row.original.totalAmount))}</span>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Tanggal Pesan",
    cell: ({ row }) => (
      <span>
        {format(new Date(row.original.createdAt), "dd MMM yyyy", {
          locale: id,
        })}
      </span>
    ),
  },
  {
    accessorKey: "orderStatus",
    header: "Status Pesanan",
    cell: ({ row }) => {
      const status = row.original.orderStatus;
      let variant:
        | "default"
        | "secondary"
        | "destructive"
        | "outline"
        | "success" = "outline";
      let label = "";

      switch (status) {
        case OrderStatus.REQUESTED:
          variant = "outline";
          label = "Diminta";
          break;
        case OrderStatus.PROCESSING:
          variant = "default";
          label = "Diproses";
          break;
        case OrderStatus.COMPLETED:
          variant = "success";
          label = "Selesai";
          break;
        case OrderStatus.CANCELLED:
          variant = "destructive";
          label = "Dibatalkan";
          break;
        default:
          label = status;
      }
      return <Badge variant={variant}>{label}</Badge>;
    },
  },
  {
    accessorKey: "paymentStatus",
    header: "Status Pembayaran",
    cell: ({ row }) => {
      const status = row.original.paymentStatus;
      let variant: "default" | "secondary" | "destructive" | "outline" =
        "outline";
      let label = "";

      switch (status) {
        case PaymentStatus.PAID:
          variant = "default";
          label = "Sudah Dibayar";
          break;
        case PaymentStatus.PENDING:
          variant = "secondary";
          label = "Menunggu Pembayaran";
          break;
        case PaymentStatus.CANCELLED:
          variant = "destructive";
          label = "Dibatalkan";
          break;
        default:
          label = status;
      }
      return <Badge variant={variant}>{label}</Badge>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <OrderColumnActions
        orderId={row.original.orderId}
        currentOrderStatus={row.original.orderStatus}
      />
    ),
  },
];
