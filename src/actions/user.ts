"use server";

import { format } from "date-fns";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/actions/current-user";
import { UserTable } from "@/components/tables/columns/user-columns";

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
