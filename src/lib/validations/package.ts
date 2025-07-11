import { z } from "zod";
import { FieldType } from "@prisma/client";

export const packageFieldSchema = z.object({
  id: z.string().optional(),
  fieldName: z
    .string()
    .min(1, "Nama field harus diisi")
    .max(20, "Nama field maksimal 20 karakter")
    .regex(
      /^[a-zA-Z_][a-zA-Z0-9_]*$/,
      "Nama field hanya boleh mengandung huruf, angka, dan underscore"
    ),
  fieldLabel: z
    .string()
    .min(1, "Label field harus diisi")
    .max(20, "Label field maksimal 20 karakter"),
  fieldType: z.nativeEnum(FieldType),
  isRequired: z.boolean(),
  options: z.array(z.string()),
  order: z.number().int().min(0),
});

export const packageFormSchema = z.object({
  name: z
    .string()
    .min(1, "Nama paket harus diisi")
    .max(100, "Nama paket maksimal 100 karakter"),
  image: z
    .string()
    .min(1, "Pilih gambar untuk paket")
    .max(255, "URL gambar terlalu panjang"),
  description: z
    .string()
    .min(1, "Deskripsi paket harus diisi")
    .max(255, "Deskripsi maksimal 255 karakter"),
  price: z.number().min(0, "Harga harus berupa angka positif"),
  requiredFields: z
    .array(packageFieldSchema)
    .min(1, "Minimal harus ada 1 field yang diperlukan")
    .refine(
      (fields) => {
        const fieldNames = fields.map((f) => f.fieldName);
        return new Set(fieldNames).size === fieldNames.length;
      },
      {
        message: "Nama field tidak boleh duplikat",
      }
    ),
});

export type PackageFormInput = z.infer<typeof packageFormSchema>;
export type PackageFieldInput = z.infer<typeof packageFieldSchema>;
