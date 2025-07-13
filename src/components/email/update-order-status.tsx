import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { OrderStatus } from "@prisma/client";

interface UpdateOrderStatusProps {
  orderId: string;
  username: string;
  status: OrderStatus;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL
  ? process.env.NEXT_PUBLIC_APP_URL
  : "";

export const UpdateOrderStatus = ({
  orderId,
  username,
  status,
}: UpdateOrderStatusProps) => {
  let bodyMessage = "";
  switch (status) {
    case OrderStatus.REQUESTED:
      bodyMessage =
        "Pesanan anda telah kami terima. Mohon tunggu untuk proses selanjutnya. Silakan klik tombol di bawah ini untuk melihat detail pesanan anda.";
      break;
    case OrderStatus.PROCESSING:
      bodyMessage =
        "Kami ingin memberi tahu anda bahwa pesanan anda sedang diproses. Silakan klik tombol di bawah ini untuk melihat detail pesanan anda.";
      break;
    case OrderStatus.COMPLETED:
      bodyMessage =
        "Pesanan anda telah selesai. Silahkan ambil pesanan anda di lokasi toko kami. Jika anda membutuhkan bantuan lebih lanjut, silakan hubungi pada info.w&m@gmail.com. Terima kasih telah berbelanja di W&M!";
      break;
    case OrderStatus.CANCELLED:
      bodyMessage =
        "Pesanan anda telah dibatalkan oleh toko. Pembayaran anda akan kami lakukan refund dalam 1x24 jam. Jika anda membutuhkan bantuan lebih lanjut, silakan hubungi pada info.w&m@gmail.com.";
      break;
  }

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Preview>Status pesanan anda telah diperbarui</Preview>
        <Container style={container}>
          <Img src="/logo-wm.png" width="32" height="32" alt="W&M" />

          <Text style={title}>
            Status Pesanan <strong>#{orderId}</strong> Telah Diperbarui
          </Text>

          <Section style={section}>
            <Text style={text}>
              Hai <strong>{username}</strong>!
            </Text>
            <Text style={text}>{bodyMessage}</Text>

            <Button href={`${baseUrl}/my-orders`} style={button}>
              Lihat Pesanan Saya
            </Button>
          </Section>

          <Text style={footer}>
            W&M, Inc. ・Jl. Merdeka No. 88 ・Jakarta, Indonesia 10110
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default UpdateOrderStatus;

const main = {
  backgroundColor: "#ffffff",
  color: "#24292e",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji"',
};

const container = {
  maxWidth: "480px",
  margin: "0 auto",
  padding: "20px 0 48px",
};

const title = {
  fontSize: "20px",
  lineHeight: 1.25,
};

const section = {
  padding: "24px",
  border: "solid 1px #dedede",
  borderRadius: "5px",
  textAlign: "center" as const,
};

const text = {
  margin: "0 0 10px 0",
  textAlign: "left" as const,
};

const button = {
  fontSize: "14px",
  backgroundColor: "#1A63D0",
  color: "#fff",
  lineHeight: 1.5,
  borderRadius: "0.5em",
  padding: "12px 24px",
};

const footer = {
  color: "#6a737d",
  fontSize: "12px",
  textAlign: "center" as const,
  marginTop: "60px",
};
