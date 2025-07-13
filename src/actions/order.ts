"use server";

import { prisma } from "@/lib/prisma";
import { OrderStatus, PaymentStatus } from "@prisma/client";
import { getCurrentUser } from "@/actions/current-user";
import { OrderWithDetails } from "@/types/order";
import { OrderTable } from "@/components/tables/columns/order-columns";
import { sendOrderUpdateEmail } from "@/lib/mail";

interface UploadedFileDetail {
  fieldName: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
}

interface GetUserOrdersOptions {
  status?: PaymentStatus | "ALL";
}

interface GetAllOrdersForAdminOptions {
  orderStatus?: OrderStatus;
}

export async function getAllOrderTable({
  orderStatus = OrderStatus.REQUESTED,
}: GetAllOrdersForAdminOptions): Promise<OrderTable[] | { error: string }> {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser || currentUser.role !== "ADMIN") {
      return { error: "Unauthorized" };
    }

    const whereClause: { orderStatus?: OrderStatus } = {};

    whereClause.orderStatus = orderStatus;

    const orders = await prisma.order.findMany({
      where: {
        ...whereClause,
        paymentStatus: PaymentStatus.PAID,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        totalAmount: true,
        createdAt: true,
        paymentStatus: true,
        orderStatus: true,
        user: {
          select: {
            name: true,
          },
        },
        package: {
          select: {
            name: true,
          },
        },
      },
    });

    const formattedOrders = orders.map((order) => ({
      orderId: order.id,
      userName: order.user.name,
      packageName: order.package.name,
      totalAmount: Number(order.totalAmount),
      paymentStatus: order.paymentStatus,
      orderStatus: order.orderStatus,
      createdAt: order.createdAt.toISOString(),
    }));

    return formattedOrders;
  } catch (error) {
    console.error("Error fetching orders:", error);
    return { error: "Terjadi kesalahan saat mengambil data" };
  }
}

export async function getUserOrders({
  status = "ALL",
}: GetUserOrdersOptions = {}): Promise<OrderWithDetails[] | { error: string }> {
  try {
    const user = await getCurrentUser();

    if (!user || typeof user.id !== "string") {
      return { error: "Unauthorized" };
    }

    const whereClause: { userId: string; paymentStatus?: PaymentStatus } = {
      userId: user.id,
    };

    if (
      status !== "ALL" &&
      Object.values(PaymentStatus).includes(status as PaymentStatus)
    ) {
      whereClause.paymentStatus = status as PaymentStatus;
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        package: true,
        user: true,
        files: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return orders as OrderWithDetails[];
  } catch (error) {
    console.error("Error fetching user orders:", error);
    return { error: "Failed to fetch orders." };
  }
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

export async function reInitiatePaymentForOrder(orderId: string) {
  try {
    const user = await getCurrentUser();

    if (!user || typeof user.id !== "string") {
      return { error: "Unauthorized" };
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        package: true,
        user: true,
      },
    });

    if (!order) {
      return { error: "Pesanan tidak ditemukan" };
    }

    if (order.paymentStatus !== PaymentStatus.PENDING) {
      return { error: "Pembayaran sudah tidak dalam status menunggu." };
    }

    // Data yang akan dikirim ke api payment
    const requestBody = {
      orderId: order.id,
      packageId: order.package.id,
      packageName: order.package.name,
      totalAmount: order.totalAmount,
      userId: user.id,
      customerDetails: {
        first_name: user.name,
        email: user.email,
        phone: user.phone || "",
      },
    };

    console.log(
      "Server Action (reInitiatePaymentForOrder): Sending request to /api/payment:",
      JSON.stringify(requestBody, null, 2)
    );

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
      console.error(
        "Server Action (reInitiatePaymentForOrder): Midtrans API error response:",
        paymentData
      );
      throw new Error(
        paymentData.error || "Gagal menginisiasi pembayaran dari Midtrans API."
      );
    }

    console.log(
      "Server Action (reInitiatePaymentForOrder): Received payment data from /api/payment:",
      paymentData
    );

    return {
      success: true,
      snapToken: paymentData.snapToken,
      orderId: order.id,
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("ERROR in Server Action (reInitiatePaymentForOrder):", error);
    return {
      error:
        error.message ||
        "Terjadi kesalahan saat menginisiasi ulang pembayaran!",
    };
  }
}

export async function updatePaymentStatus(
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

export async function updateOrderStatus(
  orderId: string,
  orderStatus: OrderStatus
) {
  try {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        orderStatus,
        updatedAt: new Date(),
      },
    });

    if (!order) {
      return { error: "Pesanan tidak ditemukan" };
    }

    const user = await prisma.user.findUnique({
      where: { id: order.userId },
      select: { name: true, email: true },
    });

    if (!user) {
      return { error: "Pengguna tidak ditemukan" };
    }

    await sendOrderUpdateEmail(user?.email, order.id, user?.name, orderStatus);

    return { success: true, order };
  } catch (error) {
    console.error(`Error updating order status for ${orderId}:`, error);
    return { error: "Gagal memperbarui status pesanan" };
  }
}
