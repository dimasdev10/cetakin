"use server";

import { prisma } from "@/lib/prisma";
import { PaymentStatus } from "@prisma/client";
import { getCurrentUser } from "@/actions/current-user";

// Definisi tipe untuk detail file yang sudah diupload
interface UploadedFileDetail {
  fieldName: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
}

export async function createOrderAndInitiatePayment(
  packageId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formData: Record<string, any>,
  uploadedFileDetails: UploadedFileDetail[] // Menerima detail file yang sudah diupload
) {
  try {
    const user = await getCurrentUser();

    if (!user || typeof user.id !== "string") {
      return { error: "Unauthorized" };
    }
    const currentUserId = user.id;

    const pkg = await prisma.package.findUnique({
      where: { id: packageId, deletedAt: null },
      select: {
        id: true,
        price: true,
        name: true,
      },
    });

    if (!pkg) {
      return { error: "Paket tidak ditemukan" };
    }

    // Create order in PENDING status
    const order = await prisma.order.create({
      data: {
        userId: currentUserId,
        packageId: packageId,
        totalAmount: pkg.price,
        formData: formData,
        paymentStatus: PaymentStatus.PENDING,
        orderStatus: "REQUESTED",
        files: {
          createMany: {
            data: uploadedFileDetails,
          },
        },
      },
    });

    // Data yang akan dikirim ke api payment
    const requestBody = {
      orderId: order.id,
      packageId: pkg.id,
      packageName: pkg.name,
      totalAmount: pkg.price,
      userId: currentUserId,
      customerDetails: {
        first_name: user.name,
        email: user.email,
        phone: formData.phone || "",
      },
    };

    const paymentResponse = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/payment`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    );

    const paymentData = await paymentResponse.json();

    if (!paymentResponse.ok) {
      throw new Error(
        paymentData.error || "Gagal menginisiasi pembayaran dari Midtrans API."
      );
    }

    return {
      success: true,
      snapToken: paymentData.snapToken, // Pastikan ini sesuai dengan token yang dikembalikan API
      orderId: order.id,
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return {
      error: error.message || "Terjadi kesalahan saat membuat pesanan!",
    };
  }
}

export async function updateOrderStatus(
  orderId: string,
  paymentStatus: PaymentStatus
) {
  try {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus,
        updatedAt: new Date(),
      },
    });
    return { success: true, order };
  } catch (error) {
    console.error(`Error updating order status for ${orderId}:`, error);
    return { error: "Failed to update order status." };
  }
}
