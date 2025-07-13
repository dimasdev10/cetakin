// app/packages/[id]/order/client.tsx (Client Component)
"use client";

import { useState, useEffect } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { OrderSummary } from "@/components/order-summary";
import { OrderFormFields } from "@/components/form/order-form";

import { z } from "zod";
import { toast } from "sonner";
import { FieldType } from "@prisma/client";
import { useUploadThing } from "@/lib/uploadthing";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";
import type { PackageWithFields } from "@/types/package";

interface OrderPageClientProps {
  pkg: PackageWithFields;
  onSubmitAction: (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    formData: Record<string, any>,
    uploadedFileDetails: {
      fieldName: string;
      fileName: string;
      fileUrl: string;
      fileSize: number;
    }[]
  ) => Promise<{
    success: boolean;
    snapToken?: string;
    orderId?: string;
    message?: string;
  }>;
}

export function OrderPageClient({ pkg, onSubmitAction }: OrderPageClientProps) {
  const [selectedFiles, setSelectedFiles] = useState<
    Record<string, globalThis.File>
  >({});
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>(
    {}
  );
  const [currentUploadingFieldName, setCurrentUploadingFieldName] = useState<
    string | null
  >(null);
  const [snapToken, setSnapToken] = useState<string | null>(null); // State untuk menyimpan snapToken

  // Untuk memuat script Midtrans Snap secara dinamis
  useEffect(() => {
    const midtransUrl = "https://app.sandbox.midtrans.com/snap/snap.js";
    const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY!;

    if (!clientKey) {
      toast.error("Konfigurasi Pembayaran Error", {
        description:
          "Client Key Midtrans tidak ditemukan. Hubungi administrator.",
      });
      return;
    }

    // Hapus script yang mungkin sudah ada untuk menghindari duplikasi
    const existingScript = document.getElementById("midtrans-snap-script");
    if (existingScript) {
      existingScript.remove();
    }

    const scriptTag = document.createElement("script");
    scriptTag.src = midtransUrl;
    scriptTag.setAttribute("data-client-key", clientKey);
    scriptTag.id = "midtrans-snap-script"; // Tambahkan ID untuk memudahkan penghapusan
    scriptTag.async = true; // Pastikan script dimuat secara async
    scriptTag.onerror = () => {
      toast.error("Gagal Memuat Script Pembayaran", {
        description:
          "Terjadi masalah saat memuat script Midtrans. Coba refresh halaman.",
      });
    };

    document.body.appendChild(scriptTag);

    // Cleanup function: hapus script saat komponen unmount
    return () => {
      const scriptToRemove = document.getElementById("midtrans-snap-script");
      if (scriptToRemove && document.body.contains(scriptToRemove)) {
        document.body.removeChild(scriptToRemove);
      }
    };
  }, []); // Hanya dijalankan sekali saat komponen mount

  // Untuk memicu pembayaran ketika snapToken tersedia
  useEffect(() => {
    if (snapToken) {
      const checkSnapAvailability = setInterval(() => {
        if (window.snap) {
          clearInterval(checkSnapAvailability);
          try {
            window.snap.pay(snapToken, {
              onSuccess: () => {
                toast.success("Pembayaran Berhasil!", {
                  description: "Pesanan Anda telah berhasil dibayar.",
                });
                window.location.replace(`/my-orders?status=PAID`);
              },
              onPending: () => {
                toast.info("Pembayaran Tertunda", {
                  description: "Pembayaran anda sedang menunggu konfirmasi.",
                });
                window.location.replace("/my-orders?status=PENDING");
              },
              onError: () => {
                toast.error("Pembayaran Gagal", {
                  description:
                    "Terjadi kesalahan saat memproses pembayaran Anda.",
                });
              },
              onClose: () => {
                toast.warning("Pembayaran Ditunda", {
                  description: "Pembayaran anda sedang menunggu konfirmasi.",
                });
                window.location.replace("/my-orders?status=PENDING");
              },
            });
          } catch (error) {
            toast.error("Gagal Membuka Pembayaran", {
              description:
                (error as Error).message ||
                "Terjadi kesalahan saat membuka jendela pembayaran. Coba lagi.",
            });
          } finally {
            setSnapToken(null); // Reset snapToken setelah dipanggil
          }
        }
      }, 500); // Cek setiap 500ms

      // Gunakan timeout untuk mencegah infinite loop jika snap.js gagal dimuat
      const timeout = setTimeout(() => {
        clearInterval(checkSnapAvailability);
        if (!window.snap) {
          toast.error("Gagal Memuat Pembayaran", {
            description:
              "Sistem pembayaran tidak merespons. Coba refresh halaman.",
          });
        }
      }, 15000); // 15 detik timeout

      return () => {
        clearInterval(checkSnapAvailability);
        clearTimeout(timeout);
      };
    }
  }, [snapToken, pkg.id]); // Hanya dijalankan saat snapToken berubah

  // Buat skema field dinamis berdasarkan field yang ada dimiliki suatu paket
  const createSchema = () => {
    const schemaFields: Record<string, z.ZodTypeAny> = {};

    pkg.requiredFields.forEach((field) => {
      let fieldSchema: z.ZodTypeAny;

      switch (field.fieldType) {
        case FieldType.EMAIL:
          fieldSchema = z.string().email("Email tidak valid");
          break;
        case FieldType.PHONE:
          fieldSchema = z.string().min(10, "Nomor telepon minimal 10 digit");
          break;
        case FieldType.FILE:
          // Untuk field FILE, kita validasi bahwa file sudah dipilih (ada di selectedFiles)
          fieldSchema = z
            .string()
            .refine((val) => val === "__FILE_PENDING_UPLOAD__", {
              message: "File harus dipilih",
            });
          break;
        case FieldType.DATE:
          fieldSchema = z.string().min(1, "Tanggal harus diisi");
          break;
        default:
          fieldSchema = z.string().min(1, `${field.fieldLabel} harus diisi`);
      }

      if (!field.isRequired) {
        fieldSchema = fieldSchema.optional();
      }

      schemaFields[field.fieldName] = fieldSchema;
    });

    return z.object(schemaFields);
  };

  const form = useForm({
    resolver: zodResolver(createSchema()),
    defaultValues: pkg.requiredFields.reduce((acc, field) => {
      acc[field.fieldName] = "";
      return acc;
    }, {} as Record<string, string>),
  });

  const { startUpload } = useUploadThing("documentFile", {
    onClientUploadComplete: () => {
      toast.success("File berhasil diupload.");
    },
    onUploadError: (error) => {
      toast.error("Upload gagal", {
        description: error.message || "Terjadi kesalahan saat mengupload file.",
      });
    },
    onUploadProgress: (progress) => {
      if (currentUploadingFieldName) {
        setUploadProgress((prev) => ({
          ...prev,
          [currentUploadingFieldName]: progress,
        }));
      }
    },
  });

  const handleFileSelect =
    (fieldName: string) => (file: globalThis.File | null) => {
      if (file) {
        setSelectedFiles((prev) => ({ ...prev, [fieldName]: file }));
        // Set value di form untuk validasi bahwa file sudah dipilih
        form.setValue(fieldName, "__FILE_PENDING_UPLOAD__", {
          shouldValidate: true,
        });
        form.clearErrors(fieldName); // Hapus error jika file sudah dipilih
      } else {
        setSelectedFiles((prev) => {
          const newFiles = { ...prev };
          delete newFiles[fieldName];
          return newFiles;
        });
        form.setValue(fieldName, "", { shouldValidate: true }); // Kosongkan value jika file dihapus
      }
    };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleOrderAndPaymentSubmit = async (formData: Record<string, any>) => {
    setIsSubmittingPayment(true);
    setIsUploadingFiles(true); // Mulai indikator upload file

    try {
      // Trigger validasi form sebelum upload dan submit
      const isValid = await form.trigger();
      if (!isValid) {
        toast.error("Validasi Gagal", {
          description: "Harap lengkapi semua field yang diperlukan.",
        });
        return { success: false, message: "Validasi gagal." };
      }

      const uploadedFileDetails: {
        fieldName: string;
        fileName: string;
        fileUrl: string;
        fileSize: number;
      }[] = [];

      const fileFieldsToUpload = pkg.requiredFields.filter(
        (field) =>
          field.fieldType === FieldType.FILE && selectedFiles[field.fieldName]
      );

      for (const field of fileFieldsToUpload) {
        const file = selectedFiles[field.fieldName];
        if (!file) continue;

        setCurrentUploadingFieldName(field.fieldName);
        setUploadProgress((prev) => ({ ...prev, [field.fieldName]: 0 })); // Reset progress untuk file ini

        try {
          const uploadResult = await startUpload([file]);
          if (uploadResult && uploadResult[0]) {
            uploadedFileDetails.push({
              fieldName: field.fieldName,
              fileName: file.name,
              fileUrl: uploadResult[0].url,
              fileSize: file.size,
            });
            // Update form data dengan URL file yang sudah diupload
            formData[field.fieldName] = uploadResult[0].url;
          } else {
            throw new Error(
              `Gagal mengupload file untuk field: ${field.fieldLabel}`
            );
          }
        } catch (uploadError) {
          setIsSubmittingPayment(false);
          setIsUploadingFiles(false);
          setCurrentUploadingFieldName(null);
          toast.error("Upload File Gagal", {
            description:
              (uploadError as Error).message ||
              "Terjadi kesalahan saat mengupload file.",
          });
          return {
            success: false,
            message: (uploadError as Error).message || "Gagal mengupload file.",
          };
        }
      }
      setCurrentUploadingFieldName(null);
      setIsUploadingFiles(false);

      // Panggil server action untuk membuat order dan mendapatkan snapToken
      const result = await onSubmitAction(formData, uploadedFileDetails);

      if (result.success && result.snapToken) {
        setSnapToken(result.snapToken);
      } else if (result.message) {
        toast.error("Gagal Membuat Pesanan", {
          description: result.message,
        });
      }
      return result;
    } catch (error) {
      toast.error("Terjadi Kesalahan", {
        description:
          (error as Error).message ||
          "Gagal memproses pesanan Anda. Silakan coba lagi.",
      });
      return {
        success: false,
        message: (error as Error).message || "Gagal memproses pesanan.",
      };
    } finally {
      setIsSubmittingPayment(false);
      setIsUploadingFiles(false);
      setCurrentUploadingFieldName(null);
    }
  };

  const isProcessing = isSubmittingPayment || isUploadingFiles;

  return (
    <main className="flex-1">
      <h1 className="text-2xl font-bold text-gray-900">Form Pemesanan Paket</h1>
      <p className="text-muted-foreground mb-4">
        Isi semua data yang diperlukan untuk memesan paket ini
      </p>

      <FormProvider {...form}>
        <form className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="shadow-none border-dashed">
            <CardHeader>
              <CardTitle className="text-xl font-bold">
                Form Pemesanan
              </CardTitle>
              <CardDescription>
                Silakan isi data atau upload file yang diperlukan.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <OrderFormFields
                pkg={pkg}
                selectedFiles={selectedFiles}
                onFileSelect={handleFileSelect}
                isSubmitting={isProcessing}
              />
            </CardContent>
          </Card>
          <OrderSummary
            pkg={pkg}
            onSubmit={handleOrderAndPaymentSubmit}
            selectedFiles={selectedFiles}
            isSubmitting={isProcessing}
            isUploadingFiles={isUploadingFiles}
            uploadProgress={uploadProgress}
          />
        </form>
      </FormProvider>
    </main>
  );
}
