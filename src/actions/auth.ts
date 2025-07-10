"use server";

import bcrypt from "bcryptjs";
import { signUpSchema, SignUpSchema } from "@/lib/validations/auth";
import { prisma } from "@/lib/prisma";

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
