import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.AUTH_SECRET });
  const pathname = req.nextUrl.pathname;

  // Jika sudah login dan mengakses halaman sign-in / sign-up, arahkan ke /
  if (
    token &&
    (pathname.startsWith("/auth/sign-in") ||
      pathname.startsWith("/auth/sign-up"))
  ) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Lindungi route dashboard yang hanya bisa diakses oleh admin
  if (pathname.startsWith("/dashboard")) {
    if (!token || token.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // Lindungi route khusus user yang memerlukan autentikasi
  if (
    pathname.startsWith("/my-orders") ||
    pathname.startsWith("/profile") ||
    (pathname.startsWith("/packages/") && pathname.endsWith("/order"))
  ) {
    if (!token) {
      return NextResponse.redirect(
        new URL(`/auth/sign-in?callbackUrl=${pathname}`, req.url)
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/my-orders/:path*",
    "/profile/:path*",
    "/packages/:id/order",
    "/auth/sign-in",
    "/auth/sign-up",
  ],
};
