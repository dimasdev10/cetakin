"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

import { formatPrice } from "@/lib/utils";
import { useFormContext } from "react-hook-form";
import { Loader2, UploadCloud } from "lucide-react";
import type { PackageWithFields } from "@/types/package";

declare global {
  interface Window {
    snap: {
      pay: (token: string, callbacks?: object) => void;
    };
  }
}

interface OrderSummaryProps {
  pkg: PackageWithFields;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSubmit: (formData: Record<string, any>) => Promise<{
    success: boolean;
    snapToken?: string;
    orderId?: string;
    message?: string;
  }>;
  selectedFiles: Record<string, globalThis.File>;
  isSubmitting: boolean;
  isUploadingFiles: boolean;
  uploadProgress: Record<string, number>; // Progress per file
}

export function OrderSummary({
  pkg,
  onSubmit,
  selectedFiles,
  isSubmitting,
  isUploadingFiles,
  uploadProgress,
}: OrderSummaryProps) {
  const form = useFormContext();

  const handlePayment = async () => {
    const isValid = await form.trigger();

    if (!isValid) {
      toast.error("Validasi Gagal", {
        description: "Harap lengkapi semua field yang diperlukan.",
      });
      return;
    }

    const formData = form.getValues();
    await onSubmit(formData);
  };

  const formErrors = form.formState.errors;
  const hasErrors = Object.keys(formErrors).length > 0;

  const fileFields = pkg.requiredFields.filter(
    (field) => field.fieldType === "FILE"
  );
  const totalFilesToUpload = fileFields.length;
  const uploadedFileCount = Object.keys(selectedFiles).length;

  const overallUploadProgress =
    totalFilesToUpload > 0
      ? (Object.values(uploadProgress).reduce(
          (sum, current) => sum + current,
          0
        ) /
          (totalFilesToUpload * 100)) *
        100
      : 0;

  return (
    <Card className="shadow-none border-dashed h-fit">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Ringkasan Pembelian</CardTitle>
        <CardDescription>
          Informasi paket dan total pembayaran anda.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500">Nama Paket</p>
            <p className="font-medium text-gray-800">{pkg.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Harga Paket</p>
            <p className="font-bold text-xl text-green-600">
              {formatPrice(Number(pkg.price))}
            </p>
          </div>
        </div>

        {isUploadingFiles && totalFilesToUpload > 0 && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-blue-600">
              <UploadCloud className="h-5 w-5 animate-bounce" />
              <span className="font-medium">
                Mengupload File ({uploadedFileCount}/{totalFilesToUpload})...
              </span>
            </div>
            <Progress value={overallUploadProgress} className="h-2" />
            <p className="text-xs text-gray-500 text-center">
              {Math.round(overallUploadProgress)}% Selesai
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          type="button"
          onClick={handlePayment}
          className="w-full"
          disabled={
            isSubmitting || hasErrors || uploadedFileCount < totalFilesToUpload
          }
        >
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isUploadingFiles
            ? "Mengupload File..."
            : isSubmitting
            ? "Memproses Pembayaran..."
            : "Lanjutkan ke Pembayaran"}
        </Button>
      </CardFooter>
    </Card>
  );
}
