"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/actions/current-user";
import { PackageTable } from "@/components/tables/columns/package-columns";

export async function getAllPackageTable(): Promise<PackageTable[]> {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser || currentUser.role !== "ADMIN") {
      throw new Error("Unauthorized access");
    }

    const packages = await prisma.package.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        name: true,
        image: true,
        price: true,
        _count: {
          select: { orders: true },
        },
      },
    });

    const formattedPackages = packages.map((packageData) => ({
      id: packageData.id,
      name: packageData.name,
      image: packageData.image,
      price: Number(packageData.price),
      sold: packageData._count.orders,
    }));

    return formattedPackages;
  } catch (error) {
    console.error("Error fetching packages:", error);
    throw new Error("Failed to fetch packages");
  }
}

export async function deletePackage(
  id: string
): Promise<{ success?: string; error?: string }> {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser || currentUser.role !== "ADMIN") {
      return { error: "Tidak memiliki izin untuk menghapus data" };
    }

    await prisma.package.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    return { success: "Paket berhasil dihapus" };
  } catch (error) {
    console.error("Error deleting package:", error);
    return { error: "Terjadi kesalahan" };
  }
}
