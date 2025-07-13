import { type NextRequest, NextResponse } from "next/server";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const midtransClient = require("midtrans-client");

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      orderId,
      packageId,
      packageName,
      totalAmount,
      customerDetails,
      userId,
    } = body;

    if (!userId) {
      return NextResponse.json({ error: "Tidak ada user id" }, { status: 400 });
    }
    if (
      !orderId ||
      !packageId ||
      !packageName ||
      !totalAmount ||
      !customerDetails
    ) {
      return NextResponse.json(
        { error: "Data order tidak lengkap" },
        { status: 400 }
      );
    }

    const midtransServerKey = process.env.MIDTRANS_SERVER_KEY;
    const midtransClientKey = process.env.MIDTRANS_CLIENT_KEY;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    if (!midtransServerKey || !midtransClientKey || !appUrl) {
      return NextResponse.json(
        {
          error:
            "Tidak ada atau tidak lengkap konfigurasi Midtrans atau URL aplikasi.",
        },
        { status: 500 }
      );
    }

    // Inisialisasi Snap client
    const snap = new midtransClient.Snap({
      isProduction: false, // Ganti ke true jika sudah production
      serverKey: midtransServerKey,
      clientKey: midtransClientKey,
    });

    // Pastikan totalAmount adalah Number untuk Midtrans
    const amount = Number(totalAmount);

    // Prepare Midtrans payload
    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: amount,
      },
      credit_card: {
        secure: true,
      },
      customer_details: {
        first_name: customerDetails.first_name,
        email: customerDetails.email,
        phone: customerDetails.phone,
      },
      callbacks: {
        finish: `${appUrl}/order-status/${orderId}?status=success`,
        error: `${appUrl}/order-status/${orderId}?status=failed`,
        pending: `${appUrl}/order-status/${orderId}?status=pending`,
      },
      item_details: [
        {
          id: packageId,
          price: amount,
          quantity: 1,
          name: packageName,
          merchant_id: process.env.MIDTRANS_MERCHANT_ID,
        },
      ],
    };

    // Masukkan parameter ke dalam transaksi untuk membuat Snap token
    const transaction = await snap.createTransaction(parameter);

    return NextResponse.json({
      orderId: orderId,
      snapToken: transaction.token, // Token dari Midtrans untuk Snap UI
      redirectUrl: transaction.redirect_url,
      transaction_id: transaction.transaction_id,
    });
  } catch (error) {
    console.error("ERROR in API Route (/api/payment) catch block:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
    }
    return NextResponse.json(
      { error: "Internal server error during payment initiation." },
      { status: 500 }
    );
  }
}
