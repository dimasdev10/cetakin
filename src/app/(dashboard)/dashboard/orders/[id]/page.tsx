import { notFound } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { Download, FileIcon } from "lucide-react";
import { formatPrice, formatFileSize } from "@/lib/utils";
import { PaymentStatus, OrderStatus, FieldType } from "@prisma/client";
import { getOrderDetails } from "@/actions/order";

interface AdminOrderDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

// Helper function to get status badge variant
const getPaymentStatusVariant = (status: PaymentStatus) => {
  switch (status) {
    case PaymentStatus.PAID:
      return "default";
    case PaymentStatus.PENDING:
      return "secondary";
    case PaymentStatus.CANCELLED:
      return "destructive";
    default:
      return "outline";
  }
};

const getOrderStatusVariant = (status: OrderStatus) => {
  switch (status) {
    case OrderStatus.REQUESTED:
      return "secondary";
    case OrderStatus.PROCESSING:
      return "default";
    case OrderStatus.COMPLETED:
      return "default";
    case OrderStatus.CANCELLED:
      return "destructive";
    default:
      return "outline";
  }
};

const getPaymentStatusLabel = (status: PaymentStatus) => {
  switch (status) {
    case PaymentStatus.PAID:
      return "Sudah Dibayar";
    case PaymentStatus.PENDING:
      return "Menunggu Pembayaran";
    case PaymentStatus.CANCELLED:
      return "Dibatalkan";
    default:
      return status;
  }
};

const getOrderStatusLabel = (status: OrderStatus) => {
  switch (status) {
    case OrderStatus.REQUESTED:
      return "Diminta";
    case OrderStatus.PROCESSING:
      return "Diproses";
    case OrderStatus.COMPLETED:
      return "Selesai";
    case OrderStatus.CANCELLED:
      return "Dibatalkan";
    default:
      return status;
  }
};

export default async function AdminOrderDetailPage({
  params,
}: AdminOrderDetailPageProps) {
  const { id } = await params;

  const order = await getOrderDetails(id);

  if (!order) {
    notFound();
  }

  // Cast formData to a more specific type for easier access
  const formData = order.formData as Record<
    string,
    string | number | boolean | string[]
  >;

  return (
    <div className="flex-1 space-y-4 py-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Daftar Pesanan</h2>
        <p className="text-muted-foreground">
          Lihat dan kelola semua pesanan yang masuk.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Order Summary & Status */}
        <Card className="lg:col-span-2 shadow-none border-dashed">
          <CardHeader>
            <CardTitle className="text-xl font-bold">
              Ringkasan Pesanan
            </CardTitle>
            <CardDescription>
              Informasi umum dan status pesanan.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">ID Pesanan</p>
                <p className="font-medium text-gray-800">{order.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Pembayaran</p>
                <p className="font-medium text-gray-800">
                  {formatPrice(Number(order.totalAmount))}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Nama Paket</p>
                <p className="font-medium text-gray-800">
                  {order.package.name}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status Pembayaran</p>
                <p className="font-medium text-gray-800">
                  <Badge variant={getPaymentStatusVariant(order.paymentStatus)}>
                    {getPaymentStatusLabel(order.paymentStatus)}
                  </Badge>
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Tanggal Pemesanan</p>
                <p className="font-medium text-gray-800">
                  {new Date(order.createdAt).toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status Pesanan</p>
                <Badge variant={getOrderStatusVariant(order.orderStatus)}>
                  {getOrderStatusLabel(order.orderStatus)}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer Information */}
        <Card className="shadow-none border-dashed">
          <CardHeader>
            <CardTitle className="text-xl font-bold">
              Informasi Pelanggan
            </CardTitle>
            <CardDescription>Detail kontak pelanggan.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Nama</p>
              <p className="font-medium text-gray-800">
                {order.user.name || "-"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium text-gray-800">{order.user.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Telepon</p>
              <p className="font-medium text-gray-800">
                {order.user.phone ? order.user.phone : "-"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Submitted Form Data */}
        {order.package.requiredFields.length > 0 &&
          order.package.requiredFields.every(
            (field) => field.fieldType !== FieldType.FILE
          ) && (
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle className="text-xl font-bold">
                  Data Formulir yang Dikirim
                </CardTitle>
                <CardDescription>
                  Informasi tambahan yang diisi oleh pelanggan.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {order.package.requiredFields.map((field) => {
                    const value = formData[field.fieldName];
                    return (
                      <div key={field.id} className="space-y-1">
                        <p className="text-sm text-gray-500">
                          {field.fieldLabel}
                        </p>
                        <p className="font-medium text-gray-800">
                          {Array.isArray(value)
                            ? value.join(", ")
                            : value?.toString() || "-"}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

        {/* Uploaded Files */}
        <Card className="lg:col-span-3 shadow-none border-dashed">
          <CardHeader>
            <CardTitle className="text-xl font-bold">
              File yang Diunggah
            </CardTitle>
            <CardDescription>
              Dokumen yang dilampirkan oleh pelanggan.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {order.files.length > 0 ? (
              <ul className="space-y-3">
                {order.files.map((file) => (
                  <li
                    key={file.id}
                    className="flex items-center justify-between p-3 border rounded-md bg-accent"
                  >
                    <div className="flex items-center space-x-2">
                      <FileIcon className="size-8 text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-800">
                          {file.fileName}
                        </p>
                        <p className="text-sm text-gray-600">
                          {formatFileSize(file.fileSize)}
                        </p>
                      </div>
                    </div>
                    <a
                      href={`/api/download?fileUrl=${encodeURIComponent(file.fileUrl)}&fileName=${encodeURIComponent(file.fileName)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button size="sm">
                        <Download className="h-4 w-4" />
                        Unduh
                      </Button>
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">
                Tidak ada file yang diunggah untuk pesanan ini.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
