"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, useEffect, useRef } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage } from "@/components/ui/avatar";

import {
  Loader2,
  UserIcon,
  Mail,
  Phone,
  MapPin,
  Save,
  XIcon,
} from "lucide-react";
import { useForm } from "react-hook-form";
import type { User } from "@prisma/client";
import { useUploadThing } from "@/lib/uploadthing";
import { updateUserProfile } from "@/actions/user";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProfileFormInput, profileFormSchema } from "@/lib/validations/user";

interface ProfileFormProps {
  initialData: Pick<User, "name" | "email" | "phone" | "address" | "image">;
}

export function ProfileForm({ initialData }: ProfileFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [internalPreviewUrl, setInternalPreviewUrl] = useState<string | null>(
    initialData.image || null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectedImageFile) {
      const url = URL.createObjectURL(selectedImageFile);
      setInternalPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else if (initialData.image) {
      setInternalPreviewUrl(initialData.image);
    } else {
      setInternalPreviewUrl(null);
    }
  }, [selectedImageFile, initialData.image]);

  const { startUpload } = useUploadThing("profileImage", {
    onUploadError: (error) => {
      console.error("Upload error:", error);
      setIsUploadingImage(false);
      toast.error("Upload gagal", {
        description:
          error.message || "Terjadi kesalahan saat mengupload gambar.",
      });
    },
  });

  const form = useForm<ProfileFormInput>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: initialData.name,
      email: initialData.email,
      phone: initialData.phone || "",
      address: initialData.address || "",
      image: initialData.image || "",
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      setSelectedImageFile(file);
      // Set value di form untuk menandakan ada file yang dipilih, tanpa memicu validasi URL
      form.setValue("image", "__FILE_PENDING_UPLOAD__", {
        shouldValidate: true,
      });
      form.clearErrors("image"); // Hapus error yang mungkin ada sebelumnya
    } else {
      setSelectedImageFile(null);
      // Kembalikan ke URL gambar awal atau string kosong jika tidak ada gambar awal
      form.setValue("image", initialData.image || "", { shouldValidate: true });
    }
  };

  const handleRemoveImage = () => {
    setSelectedImageFile(null);
    form.setValue("image", "", { shouldValidate: true });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setInternalPreviewUrl(null);
  };

  const onSubmit = async (data: ProfileFormInput) => {
    startTransition(async () => {
      try {
        let finalImageUrl = data.image;

        if (selectedImageFile) {
          setIsUploadingImage(true);

          try {
            const uploadResult = await startUpload([selectedImageFile]);
            if (uploadResult && uploadResult[0]) {
              finalImageUrl = uploadResult[0].ufsUrl;
            } else {
              throw new Error("Upload gambar gagal");
            }
          } catch (uploadError: unknown) {
            setIsUploadingImage(false);
            const errorMessage =
              uploadError instanceof Error
                ? uploadError.message
                : "Terjadi kesalahan tidak dikenal.";
            toast.error("Upload gambar gagal", {
              description: errorMessage,
            });
            form.setError("image", {
              type: "manual",
              message: "Upload gambar gagal.",
            });
            return;
          }
        } else if (initialData.image && data.image === "") {
          finalImageUrl = "";
        } else if (initialData.image && data.image === initialData.image) {
          finalImageUrl = initialData.image;
        }

        // Perbarui value form dengan URL gambar akhir sebelum dikirim ke server action
        // Pastikan validasi tidak dipicu lagi di sini, karena sudah divalidasi di server action
        form.setValue("image", finalImageUrl, { shouldValidate: false });

        const result = await updateUserProfile(form.getValues());

        if (result?.error) {
          toast.error("Gagal memperbarui profil", {
            description: result.error,
          });
          if (result.details) {
            for (const [key, messages] of Object.entries(result.details)) {
              form.setError(key as keyof ProfileFormInput, {
                type: "server",
                message: (messages as string[]).join(", "),
              });
            }
          }
          return;
        }

        toast.success("Profil berhasil diperbarui", {
          description: "Informasi profil Anda telah berhasil disimpan.",
        });

        router.refresh();
      } catch (error) {
        console.error("Error submitting form:", error);
        toast.error("Terjadi kesalahan", {
          description: "Gagal menyimpan profil. Silakan coba lagi.",
        });
      } finally {
        setIsUploadingImage(false);
      }
    });
  };

  const isSubmitting = isPending || isUploadingImage;

  return (
    <Card className="shadow-none border-dashed">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Profil</CardTitle>
        <CardDescription>
          Perbarui informasi pribadi dan gambar profil anda.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Profile Image Section */}
            <div className="flex flex-col items-center gap-4 mb-6">
              <div className="relative">
                <Avatar className="w-24 h-24 border-2 border-gray-200">
                  <AvatarImage
                    src={
                      internalPreviewUrl ||
                      "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-1.png"
                    }
                    alt={initialData.name}
                  />
                </Avatar>
                {(internalPreviewUrl || selectedImageFile) && (
                  <Button
                    type="button"
                    size="icon"
                    variant="destructive"
                    onClick={handleRemoveImage}
                    disabled={isSubmitting}
                    className="absolute top-1 right-1 w-5 h-5"
                  >
                    <XIcon className="h-3 w-3" />
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isSubmitting}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*"
                    disabled={isSubmitting}
                  />
                  Pilih Gambar
                </Button>
              </div>
              {form.formState.errors.image && (
                <p className="text-sm text-destructive mt-2">
                  {form.formState.errors.image.message}
                </p>
              )}
            </div>

            {/* Personal Information Fields */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <UserIcon className="h-4 w-4" /> Nama Lengkap
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nama Lengkap Anda"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Mail className="h-4 w-4" /> Email
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="email@example.com"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Phone className="h-4 w-4" /> Nomor Telepon
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="Nomor telepon anda"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" /> Alamat
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Alamat lengkap anda"
                        className="min-h-[80px]"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isUploadingImage
                ? "Mengupload Gambar..."
                : isPending
                ? "Menyimpan Perubahan..."
                : "Simpan Perubahan"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
