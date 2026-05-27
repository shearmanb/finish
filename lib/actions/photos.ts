"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { deleteImage } from "@/lib/upload";

export async function deleteBottlePhoto(photoId: string): Promise<{ ok: boolean }> {
  const photo = await prisma.bottlePhoto.findUnique({ where: { id: photoId } });
  if (!photo) return { ok: true };
  await prisma.bottlePhoto.delete({ where: { id: photoId } });
  await deleteImage(photo.url);
  revalidatePath(`/bottles/${photo.bottleId}`);
  return { ok: true };
}
