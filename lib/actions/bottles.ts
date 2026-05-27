"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import type { BottleInput } from "@/lib/data/bottles";

type Result = { ok: boolean; error?: string };

function clean(input: BottleInput) {
  if (!input.productId) return { error: "Pick an expression." as const };
  const fill =
    input.fillLevel === null || Number.isNaN(input.fillLevel)
      ? null
      : Math.max(0, Math.min(100, Math.round(input.fillLevel)));
  return {
    data: {
      productId: input.productId,
      bottlingName: input.bottlingName?.trim() || null,
      status: input.status,
      fillLevel: fill,
      purchaseDate: input.purchaseDate ? new Date(input.purchaseDate) : null,
      store: input.store?.trim() || null,
      pricePaid: input.pricePaid ?? null,
      msrp: input.msrp ?? null,
      storageLocation: input.storageLocation?.trim() || null,
      notes: input.notes?.trim() || null,
    },
  };
}

export async function createBottle(input: BottleInput): Promise<Result> {
  const res = clean(input);
  if ("error" in res) return { ok: false, error: res.error };
  const data = res.data;
  const bottle = await prisma.bottle.create({
    data: {
      ...data,
      openedAt: data.status === "OPEN" ? new Date() : null,
      finishedAt: data.status === "FINISHED" ? new Date() : null,
    },
  });
  revalidatePath("/bottles");
  redirect(`/bottles/${bottle.id}`);
}

export async function updateBottle(
  id: string,
  input: BottleInput,
): Promise<Result> {
  const res = clean(input);
  if ("error" in res) return { ok: false, error: res.error };
  const data = res.data;
  const existing = await prisma.bottle.findUnique({ where: { id } });
  await prisma.bottle.update({
    where: { id },
    data: {
      ...data,
      openedAt:
        data.status === "OPEN" && !existing?.openedAt
          ? new Date()
          : existing?.openedAt ?? null,
      finishedAt:
        data.status === "FINISHED" && !existing?.finishedAt
          ? new Date()
          : data.status === "FINISHED"
            ? existing?.finishedAt ?? null
            : null,
    },
  });
  revalidatePath("/bottles");
  revalidatePath(`/bottles/${id}`);
  redirect(`/bottles/${id}`);
}
