import { promises as fs } from "fs";
import path from "path";
import { NextResponse, type NextRequest } from "next/server";
import { uploadDir } from "@/lib/upload";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ name: string }> },
) {
  const { name } = await params;
  // Only allow simple filenames (no traversal).
  if (!/^[A-Za-z0-9._-]+$/.test(name)) {
    return new NextResponse("Bad request", { status: 400 });
  }
  try {
    const file = await fs.readFile(path.join(uploadDir(), name));
    return new NextResponse(new Uint8Array(file), {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
