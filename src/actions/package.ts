"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/actions/current-user";
import { PackageTable } from "@/components/tables/columns/package-columns";
import { PackageFormInput, packageFormSchema } from "@/lib/validations/package";

export async function getListPackagesOverview() {
  return await prisma.package.findMany({
    where: { deletedAt: null },
    include: {
      requiredFields: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

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

export async function getPackage(id: string) {
  try {
    const packageData = await prisma.package.findUnique({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        requiredFields: {
          orderBy: { order: "asc" },
        },
      },
    });

    return packageData;
  } catch (error) {
    console.error("Error fetching package:", error);
    return null;
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

export async function createPackage(data: PackageFormInput) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "ADMIN") {
      return { error: "Unauthorized" };
    }

    // Validasi data menggunakan schema Zod yang sudah ada
    const validatedData = packageFormSchema.parse(data);

    const result = await prisma.$transaction(async (tx) => {
      // Create package
      const newPackage = await tx.package.create({
        data: {
          name: validatedData.name,
          image: validatedData.image,
          description: validatedData.description,
          price: validatedData.price,
        },
      });

      // Create package fields
      if (validatedData.requiredFields.length > 0) {
        await tx.packageField.createMany({
          data: validatedData.requiredFields.map((field, index) => ({
            packageId: newPackage.id,
            fieldName: field.fieldName,
            fieldLabel: field.fieldLabel,
            fieldType: field.fieldType,
            isRequired: field.isRequired,
            options: field.options,
            order: index,
          })),
        });
      }

      return newPackage;
    });

    revalidatePath("/dashboard/packages");
    return { success: true, data: result };
  } catch (error) {
    console.error("Error creating package:", error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Terjadi kesalahan saat membuat paket" };
  }
}

export async function updatePackage(id: string, data: PackageFormInput) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "ADMIN") {
      return { error: "Unauthorized" };
    }

    // Validasi data menggunakan schema Zod yang sudah ada
    const validatedData = packageFormSchema.parse(data);

    // Check if package exists
    const existingPackage = await prisma.package.findUnique({
      where: { id, deletedAt: null },
    });

    if (!existingPackage) {
      return { error: "Paket tidak ditemukan" };
    }

    const result = await prisma.$transaction(async (tx) => {
      // Update package
      const updatedPackage = await tx.package.update({
        where: { id },
        data: {
          name: validatedData.name,
          image: validatedData.image,
          description: validatedData.description,
          price: validatedData.price,
          updatedAt: new Date(),
        },
      });

      // Delete existing fields
      await tx.packageField.deleteMany({
        where: { packageId: id },
      });

      // Create new fields
      if (validatedData.requiredFields.length > 0) {
        await tx.packageField.createMany({
          data: validatedData.requiredFields.map((field, index) => ({
            packageId: id,
            fieldName: field.fieldName,
            fieldLabel: field.fieldLabel,
            fieldType: field.fieldType,
            isRequired: field.isRequired,
            options: field.options,
            order: index,
          })),
        });
      }

      return updatedPackage;
    });

    revalidatePath("/dashbard/packages");
    revalidatePath(`/dashboard/packages/${id}`);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error updating package:", error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Terjadi kesalahan saat memperbarui paket" };
  }
}
