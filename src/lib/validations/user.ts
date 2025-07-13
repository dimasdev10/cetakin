import * as z from "zod";

export const profileFormSchema = z
  .object({
    name: z
      .string()
      .min(1, "Nama tidak boleh kosong")
      .max(50, "Nama maksimal 50 karakter"),
    email: z.email("Email tidak valid").min(1, "Email tidak boleh kosong"),
    phone: z
      .string()
      .max(20, "Nomor telepon maksimal 20 karakter")
      .optional()
      .or(z.literal("")),
    address: z
      .string()
      .max(100, "Alamat maksimal 100 karakter")
      .optional()
      .or(z.literal("")),
    image: z.string().optional().or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    // Validasi URL hanya jika string bukan kosong dan bukan string pending upload
    if (data.image && data.image !== "__FILE_PENDING_UPLOAD__") {
      try {
        new URL(data.image); // Coba buat objek URL
      } catch {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "URL gambar tidak valid",
          path: ["image"],
        });
      }
    }
  });

export type ProfileFormInput = z.infer<typeof profileFormSchema>;
