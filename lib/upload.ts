import "server-only";
import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import sharp from "sharp";

export function uploadDir(): string {
  return process.env.UPLOAD_DIR || path.join(process.cwd(), "public/uploads");
}

export type SavedImage = {
  filename: string;
  url: string;
  width: number;
  height: number;
};

/** Resize (max 1600px), re-encode as JPEG, and write to the upload dir. */
export async function saveImage(file: File): Promise<SavedImage> {
  const dir = uploadDir();
  await fs.mkdir(dir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = `${randomUUID()}.jpg`;

  const out = await sharp(buffer)
    .rotate()
    .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 82 })
    .toBuffer({ resolveWithObject: true });

  await fs.writeFile(path.join(dir, filename), out.data);

  return {
    filename,
    url: `/api/files/${filename}`,
    width: out.info.width,
    height: out.info.height,
  };
}

export async function deleteImage(url: string): Promise<void> {
  const filename = path.basename(url);
  // Guard against path traversal.
  if (filename !== url.replace("/api/files/", "")) return;
  try {
    await fs.unlink(path.join(uploadDir(), filename));
  } catch {
    // already gone — ignore
  }
}
