import { Resend } from "resend";
import { OrderStatus } from "@prisma/client";
import UpdateOrderStatus from "@/components/email/update-order-status";

const resend = new Resend(process.env.RESEND_API_KEY!);

export const sendOrderUpdateEmail = async (
  email: string,
  orderId: string,
  username: string,
  status: OrderStatus
) => {
  await resend.emails.send({
    from: "W&M <info.w&m@irfanmqrb.site>",
    to: email,
    subject: "Status Pesanan Anda Telah Diperbarui",
    react: UpdateOrderStatus({
      orderId,
      username,
      status,
    }),
  });
};
