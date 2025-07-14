import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { Toaster } from "sonner";
import { auth } from "@/lib/auth";
import { SessionProvider } from "next-auth/react";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://wnm-store.vercel.app"),
  title: "W&M",
  description:
    "W&M memudahkan anda dalam melakukan perpanjangan pajak kendaraan secara online dengan mudah, cepat, dan aman.",
  openGraph: {
    title: "W&M Store",
    description:
      "W&M memudahkan anda dalam melakukan perpanjangan pajak kendaraan secara online dengan mudah, cepat, dan aman.",
    url: "https://wnm-store.vercel.app",
    siteName: "W&M Store",
    locale: "id_ID",
    type: "website",
  },
  keywords: [
    "wnm",
    "wnm store",
    "wnm store indonesia",
    "wnm store online",
    "wnm store pajak kendaraan",
    "wnm store perpanjangan pajak kendaraan",
    "wnm store perpanjangan pajak kendaraan online",
    "wnm store perpanjangan pajak kendaraan online indonesia",
    "layanan pajak kendaraan online",
    "pajak kendaraan online",
    "pajak kendaraan online indonesia",
    "perpanjangan pajak kendaraan online",
    "foto copy ktp",
    "foto copy stnk",
    "foto copy bpkb",
    "foto copy",
    "digital foto copy",
  ],
  authors: [
    {
      name: "Dimas Ginanjar",
      url: "https://github.com/dimasdev10",
    },
  ],
  creator: "Dimas Ginanjar",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <SessionProvider session={session}>
      <html lang="en">
        <body className={`${inter.className} antialiased bg-background`}>
          <Toaster richColors />
          {children}
        </body>
      </html>
    </SessionProvider>
  );
}
