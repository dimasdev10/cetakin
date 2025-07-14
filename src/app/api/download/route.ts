import { getCurrentUser } from "@/actions/current-user";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const fileUrl = searchParams.get("fileUrl");
    const fileName = searchParams.get("fileName") || "downloaded_file";

    if (!fileUrl) {
      return NextResponse.json(
        { error: "Parameter fileUrl diperlukan" },
        { status: 400 }
      );
    }

    if (!fileUrl.startsWith("https://utfs.io/")) {
      console.warn("Attempted to download from an unallowed domain:", fileUrl);
      return NextResponse.json(
        { error: "URL file tidak diizinkan" },
        { status: 403 }
      );
    }

    const response = await fetch(fileUrl);

    if (!response.ok) {
      console.error(
        `Failed to fetch file from ${fileUrl}: ${response.status} ${response.statusText}`
      );
      return NextResponse.json(
        { error: "Gagal mengambil file dari sumber" },
        { status: response.status }
      );
    }

    // Dapatkan tipe konten dari respons asli atau tebak dari nama file
    const contentType =
      response.headers.get("Content-Type") || "application/octet-stream";

    // Buat respons baru dengan header Content-Disposition: attachment
    const headers = new Headers(response.headers);
    headers.set("Content-Disposition", `attachment; filename="${fileName}"`);
    headers.set("Content-Type", contentType); // Pertahankan tipe konten asli

    return new NextResponse(response.body, {
      status: 200,
      headers: headers,
    });
  } catch (error) {
    console.error("Error in download route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
