"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";

type Result = { ok: boolean; error?: string };

export async function createWishlistItem(input: {
  name: string;
  targetPrice: number | null;
  notes: string | null;
}): Promise<Result> {
  const name = input.name.trim();
  if (!name) return { ok: false, error: "Name is required." };
  await prisma.wishlistItem.create({
    data: {
      freeTextName: name,
      targetPrice: input.targetPrice ?? null,
      notes: input.notes?.trim() || null,
    },
  });
  revalidatePath("/wishlist");
  return { ok: true };
}

export async function setWishlistAcquired(
  id: string,
  acquired: boolean,
): Promise<Result> {
  await prisma.wishlistItem.update({ where: { id }, data: { acquired } });
  revalidatePath("/wishlist");
  return { ok: true };
}

export async function archiveWishlistItem(id: string): Promise<Result> {
  await prisma.wishlistItem.update({ where: { id }, data: { isArchived: true } });
  revalidatePath("/wishlist");
  return { ok: true };
}
