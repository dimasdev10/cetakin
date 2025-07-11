"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CurrencyInput } from "@/components/currency-input";
import { UploadDropzone } from "@/components/upload-dropzone";
import { PackageFieldBuilder } from "@/components/form/package-field-builder";

import {
  packageFormSchema,
  type PackageFormInput,
} from "@/lib/validations/package";
import { Loader2, Save } from "lucide-react";
import { useUploadThing } from "@/lib/uploadthing";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";
import type { PackageWithFields } from "@/types/package";
import { createPackage, updatePackage } from "@/actions/package";

interface PackageFormProps {
  initialData?: PackageWithFields | null;
  mode: "create" | "edit";
}

export function PackageForm({ initialData, mode }: PackageFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const { startUpload } = useUploadThing("packageImage", {
    // Uncomment kode jika ingin menampilkan pesan berhasil upload gambar
    // onClientUploadComplete: (res) => {
    //   if (res && res[0]) {
    //     toast.success("Gambar berhasil diupload");
    //   }
    // },
    onUploadError: (error) => {
      console.error("Upload error:", error);
      setIsUploadingImage(false);
      toast.error("Gagal mengupload gambar", {
        description:
          error.message || "Terjadi kesalahan saat mengupload gambar.",
      });
    },
    onUploadProgress: (progress) => {
      setUploadProgress(progress);
    },
  });

  const form = useForm<PackageFormInput>({
    resolver: zodResolver(packageFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      image: initialData?.image || "",
      description: initialData?.description || "",
      price: initialData?.price ? Number(initialData.price) : 0,
      requiredFields:
        initialData?.requiredFields?.map((field) => ({
          id: field.id,
          fieldName: field.fieldName,
          fieldLabel: field.fieldLabel,
          fieldType: field.fieldType,
          isRequired: field.isRequired,
          options: field.options,
          order: field.order,
        })) || [],
    },
  });

  const handleImageFileSelect = (file: File | null) => {
    setSelectedImageFile(file);
    if (file) {
      // Set nilai sementara untuk field 'image' agar dapat melewati validasi Zod min(1)
      // Validasi akan dipicu, tetapi hanya setelah memilih file
      form.setValue("image", "__FILE_PENDING_UPLOAD__", {
        shouldValidate: true,
      });
      // Hapus error Zod yang mungkin ada pada field 'image'
      form.clearErrors("image");
    } else {
      // Jika file dihapus:
      if (mode === "create" && !initialData?.image) {
        // Dalam mode create dan tidak ada gambar awal, set ke string kosong agar Zod memicu validasi 'min(1)' lagi.
        form.setValue("image", "", { shouldValidate: true });
      } else if (mode === "edit" && initialData?.image) {
        // Dalam mode edit dan ada gambar awal, kembalikan ke URL gambar awal
        form.setValue("image", initialData.image, { shouldValidate: true });
      } else {
        // Fallback jika tidak ada gambar awal dan file dihapus
        form.setValue("image", "", { shouldValidate: true });
      }
    }
  };

  const onSubmit = async (data: PackageFormInput) => {
    startTransition(async () => {
      try {
        // Mulai dengan value 'image' yang ada di form (bisa placeholder atau URL lama)
        let finalImageUrl = data.image;

        // Jika ada file baru yang dipilih untuk diupload
        if (selectedImageFile) {
          setIsUploadingImage(true);
          setUploadProgress(0);

          try {
            const uploadResult = await startUpload([selectedImageFile]);
            // Jika upload berhasil, update value dengan URL baru dari UploadThing
            if (uploadResult && uploadResult[0]) {
              finalImageUrl = uploadResult[0].url;
            } else {
              throw new Error("Gagal mendapatkan URL gambar setelah upload.");
            }
          } catch (uploadError: unknown) {
            setIsUploadingImage(false);
            const errorMessage =
              uploadError instanceof Error
                ? uploadError.message
                : "Terjadi kesalahan!";
            toast.error("Upload gambar gagal", {
              description: errorMessage,
            });
            form.setError("image", {
              type: "manual",
              message: "Upload gambar gagal.",
            });
            return;
          }
        }

        // Pastikan finalImageUrl ada dan bukan placeholder sebelum mengirim ke server action
        if (!finalImageUrl || finalImageUrl === "__FILE_PENDING_UPLOAD__") {
          form.setError("image", {
            type: "manual",
            message: "Gambar paket harus diupload.",
          });
          toast.error("Gambar diperlukan", {
            description: "Silakan pilih gambar untuk paket ini.",
          });
          return;
        }

        // Update nilai 'image' di form dengan URL final sebelum dikirim ke server action
        form.setValue("image", finalImageUrl, { shouldValidate: false });
        let result;

        // Jika mode adalah "create", kirim data form yang sudah diupdate
        if (mode === "create") {
          result = await createPackage(form.getValues());
          // Jika mode adalah "edit", kirim data form yang sudah diupdate
        } else if (initialData?.id) {
          result = await updatePackage(initialData.id, form.getValues());
        }

        if (result?.error) {
          toast.error("Terjadi kesalahan", {
            description: result.error,
          });
          return;
        }

        toast.success(
          mode === "create"
            ? "Paket berhasil dibuat"
            : "Paket berhasil diperbarui",
          {
            description: `Paket "${data.name}" telah berhasil ${
              mode === "create" ? "ditambahkan" : "diperbarui"
            } ke dalam sistem.`,
          }
        );

        router.push("/dashboard/packages");
        router.refresh();
      } catch (error) {
        console.error("Error submitting form:", error);
        toast.error("Terjadi kesalahan", {
          description: "Gagal menyimpan paket. Silakan coba lagi.",
        });
      } finally {
        setIsUploadingImage(false);
      }
    });
  };

  const isSubmitting = isPending || isUploadingImage;

  // Cek apakah ada URL gambar yang sudah ada atau ada file yang dipilih untuk preview
  const hasImageOrFile = !!form.watch("image") || !!selectedImageFile;

  return (
    <div>
      <div className="border-b border-dashed">
        <div className="py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            {mode === "create" ? "Buat Paket Baru" : "Edit Paket"}
          </h1>
          <p className="text-muted-foreground">
            {mode === "create"
              ? "Buat paket layanan baru dengan field yang dapat dikustomisasi"
              : "Perbarui informasi paket dan field yang diperlukan"}
          </p>
        </div>
      </div>

      <FormProvider {...form}>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Basic Information */}
              <Card className="shadow-none">
                <CardHeader>
                  <CardTitle>Informasi Dasar</CardTitle>
                  <CardDescription>
                    Informasi umum tentang paket layanan
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nama Paket</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="contoh: Perpanjang Pajak Motor"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Deskripsi</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Deskripsi singkat tentang paket layanan ini..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Harga</FormLabel>
                        <FormControl>
                          <CurrencyInput
                            {...field}
                            onChange={(value) => field.onChange(value)}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Package Image */}
              <Card className="shadow-none">
                <CardHeader>
                  <CardTitle>Gambar Paket</CardTitle>
                  <CardDescription>
                    Upload gambar untuk mewakili paket layanan ini
                  </CardDescription>
                  {/* Tampilkan pesan error jika tidak ada gambar dan tidak ada file yang dipilih */}
                  {!hasImageOrFile && form.formState.errors.image && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.image.message}
                    </p>
                  )}
                </CardHeader>
                <CardContent className="h-full">
                  <FormField
                    control={form.control}
                    name="image"
                    render={() => (
                      <FormItem className="h-full">
                        <FormControl>
                          <UploadDropzone
                            onFileSelect={handleImageFileSelect}
                            accept="image"
                            maxSize={4 * 1024 * 1024} // 4MB
                            currentFileUrl={initialData?.image}
                            currentPreviewFile={selectedImageFile}
                            disabled={isSubmitting}
                            isUploading={isUploadingImage}
                            uploadProgress={uploadProgress}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Dynamic Fields */}
            <Card className="shadow-none">
              <CardHeader>
                <CardTitle>Field yang Diperlukan</CardTitle>
                <CardDescription>
                  Tentukan field apa saja yang perlu diisi oleh pengguna saat
                  memesan paket ini
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PackageFieldBuilder
                  control={form.control}
                  errors={form.formState.errors}
                />
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <Link href="/dashboard/packages">
                <Button type="button" variant="outline" disabled={isSubmitting}>
                  Kembali
                </Button>
              </Link>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {isUploadingImage
                  ? "Mengupload..."
                  : isPending
                  ? "Menyimpan..."
                  : mode === "create"
                  ? "Buat Paket"
                  : "Simpan Perubahan"}
              </Button>
            </div>
          </form>
        </Form>
      </FormProvider>
    </div>
  );
}
