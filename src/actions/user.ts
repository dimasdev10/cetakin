"use server";

import { format } from "date-fns";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/actions/current-user";
import { UserTable } from "@/components/tables/columns/user-columns";
import { ProfileFormInput, profileFormSchema } from "@/lib/validations/user";

export async function getAllUserTable(): Promise<UserTable[]> {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser || currentUser.role !== "ADMIN") {
      throw new Error("Unauthorized access");
    }

    const users = await prisma.user.findMany({
      where: {
        deletedAt: null,
        role: "USER",
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
      },
    });

    const formattedUsers = users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      createdAt: format(user.createdAt, "dd/MM/yyyy"),
    }));

    return formattedUsers;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw new Error("Failed to fetch users");
  }
}

export async function deleteUser(
  id: string
): Promise<{ success?: string; error?: string }> {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser || currentUser.role !== "ADMIN") {
      return { error: "Tidak memiliki izin untuk menghapus data" };
    }

    await prisma.user.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    return { success: "Akun pengguna berhasil dihapus" };
  } catch (error) {
    console.error("Error deleting user:", error);
    return { error: "Terjadi kesalahan" };
  }
}

export async function updateUserProfile(data: ProfileFormInput) {
  try {
    const user = await getCurrentUser();

    if (!user || !user?.id) {
      return { error: "Unauthorized" };
    }

    const validatedData = profileFormSchema.safeParse(data);

    if (!validatedData.success) {
      return {
        error: "Data tidak valid",
        details: validatedData.error.flatten().fieldErrors,
      };
    }

    const { name, email, phone, address, image } = validatedData.data;

    // Cek apakah email sudah digunakan oleh user lain
    const existingUserWithEmail = await prisma.user.findUnique({
      where: { email: email },
      select: { id: true },
    });

    if (existingUserWithEmail && existingUserWithEmail.id !== user.id) {
      return { error: "Email sudah digunakan oleh akun lain." };
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        name,
        email,
        phone: phone || null,
        address: address || null,
        image: image || null,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        image: true,
        role: true,
      },
    });

    revalidatePath("/profile"); // Revalidate halaman profil
    revalidatePath("/dashboard"); // Revalidate dashboard jika menampilkan info user
    revalidatePath("/"); // Revalidate homepage jika navbar menampilkan info user

    return { success: true, data: updatedUser };
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Terjadi kesalahan saat memperbarui profil." };
  }
}
