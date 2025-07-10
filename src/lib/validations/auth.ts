import * as z from "zod";

export const SignUpSchema = z.object({
  name: z.string().min(1, {
    message: "Nama perlu diisi",
  }),
  email: z
    .email({
      message: "Masukkan email yang valid",
    })
    .min(1, {
      message: "Email perlu diisi",
    }),
  password: z
    .string()
    .min(8, {
      message: "Kata Sandi harus lebih dari 8 karakter",
    })
    .regex(/^(?=.*[A-Z]).{8,}$/, {
      message: "Kata sandi harus terdapat satu huruf kapital",
    }),
});

export const SignInSchema = z.object({
  email: z.email({ message: "Masukkan email yang valid" }).min(1, {
    message: "Email perlu diisi",
  }),
  password: z.string().min(1, { message: "Kata sandi perlu diisi" }),
});
