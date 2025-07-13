import crypto from "crypto";
import { type NextRequest, NextResponse } from "next/server";

import { PaymentStatus } from "@prisma/client";
import { updateOrderStatus } from "@/actions/order";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const serverKey = process.env.MIDTRANS_SERVER_KEY;

    if (!serverKey) {
      console.error(
        "MIDTRANS_SERVER_KEY is not defined in environment variables."
      );
      return NextResponse.json(
        { status: "error", message: "Server key not configured" },
        { status: 500 }
      );
    }

    const signatureKey = crypto
      .createHash("sha512")
      .update(
        `${body.order_id}${body.status_code}${body.gross_amount}${serverKey}`
      )
      .digest("hex");

    if (signatureKey !== body.signature_key) {
      console.warn("Invalid Midtrans signature key for order:", body.order_id);
      return NextResponse.json(
        { status: "error", message: "Invalid signature" },
        { status: 403 }
      );
    }

    const orderId = body.order_id;
    const transactionStatus = body.transaction_status;
    const fraudStatus = body.fraud_status;

    let paymentStatus: PaymentStatus = PaymentStatus.PENDING;

    if (transactionStatus == "capture") {
      if (fraudStatus == "challenge") {
        paymentStatus = PaymentStatus.PENDING;
      } else if (fraudStatus == "accept") {
        paymentStatus = PaymentStatus.PAID;
      }
    } else if (transactionStatus == "settlement") {
      paymentStatus = PaymentStatus.PAID;
    } else if (transactionStatus == "cancel" || transactionStatus == "expire") {
      paymentStatus = PaymentStatus.CANCELLED;
    } else if (transactionStatus == "deny") {
      paymentStatus = PaymentStatus.CANCELLED;
    } else if (transactionStatus == "pending") {
      paymentStatus = PaymentStatus.PENDING;
    }

    await updateOrderStatus(orderId, paymentStatus);

    return NextResponse.json({ status: "ok" }, { status: 200 });
  } catch (error) {
    console.error("Error processing Midtrans webhook:", error);
    return NextResponse.json(
      { status: "error", message: "Internal server error" },
      { status: 500 }
    );
  }
}
