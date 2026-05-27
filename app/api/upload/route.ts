import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";
import { saveImage } from "@/lib/upload";

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get("file");
  const bottleId = String(form.get("bottleId") ?? "");

  if (!(file instanceof File) || !bottleId) {
    return NextResponse.json(
      { ok: false, error: "Missing file or bottleId" },
      { status: 400 },
    );
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json(
      { ok: false, error: "Only image files are allowed" },
      { status: 400 },
    );
  }

  const bottle = await prisma.bottle.findUnique({ where: { id: bottleId } });
  if (!bottle) {
    return NextResponse.json({ ok: false, error: "Bottle not found" }, { status: 404 });
  }

  const saved = await saveImage(file);
  const max = await prisma.bottlePhoto.aggregate({
    where: { bottleId },
    _max: { sortIndex: true },
  });
  const photo = await prisma.bottlePhoto.create({
    data: {
      bottleId,
      url: saved.url,
      width: saved.width,
      height: saved.height,
      sortIndex: (max._max.sortIndex ?? -1) + 1,
    },
  });

  return NextResponse.json({ ok: true, photo });
}
