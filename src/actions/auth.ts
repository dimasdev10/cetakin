"use server";

import bcrypt from "bcryptjs";
import {
  signInSchema,
  SignInSchema,
  signUpSchema,
  SignUpSchema,
} from "@/lib/validations/auth";
import { prisma } from "@/lib/prisma";
import { AuthError } from "next-auth";
import { signIn as nextAuthSignIn } from "@/lib/auth";

export const signUp = async (data: SignUpSchema) => {
  const validatedFields = signUpSchema.safeParse(data);

  if (!validatedFields.success) {
    return { error: "Data yang dimasukkan tidak valid" };
  }

  const { email, name, password } = validatedFields.data;

  const hashedPassword = await bcrypt.hash(password, 10);

  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (existingUser) {
    return {
      error: "Email sudah digunakan",
    };
  }

  await prisma.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
    },
  });

  return {
    success: "Akun berhasil dibuat!",
  };
};

export const signIn = async (data: SignInSchema) => {
  const validatedFields = signInSchema.safeParse(data);

  if (!validatedFields.success) {
    return { error: "Data yang dimasukkan tidak valid" };
  }

  const { email, password } = validatedFields.data;

  // Mencari pengguna yang sudah ada/terbuat berdasarkan email
  const existingUser = await prisma.user.findUnique({
    where: {
      email: email,
    },
    select: {
      email: true,
      password: true,
    },
  });

  // Jika email pengguna tidak ditemukan
  if (!existingUser || !existingUser.email) {
    return { error: "Akun tidak terdaftar" };
  }

  // Periksa apakah password yang dimasukkan cocok
  const isPasswordValid = await bcrypt.compare(
    password,
    existingUser.password!
  );

  if (!isPasswordValid) {
    return { error: "Password tidak valid" };
  }

  try {
    await nextAuthSignIn("credentials", {
      email,
      password,
      redirectTo: "/",
    });

    return { success: "Selamat datang datang di W&M" };
  } catch (error) {
    // Tangani kesalahan autentikasi
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Email atau password salah" };
        default:
          return { error: "Terjadi kesalahan! Silakan coba lagi nanti" };
      }
    }

    // Lempar error jika bukan tipe AuthError
    throw error;
  }
};
