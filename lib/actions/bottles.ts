"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import type { BottleInput } from "@/lib/data/bottles";

type Result = { ok: boolean; error?: string };

function clean(input: BottleInput) {
  if (!input.lineId) return { error: "Pick a line." as const };
  const fill =
    input.fillLevel === null || Number.isNaN(input.fillLevel)
      ? null
      : Math.max(0, Math.min(100, Math.round(input.fillLevel)));
  const proof =
    input.proof === null || Number.isNaN(input.proof) ? null : input.proof;
  return {
    data: {
      lineId: input.lineId,
      ndpDistilleryId: input.ndpDistilleryId || null,
      name: input.name?.trim() || null,
      proof,
      singleBarrel: input.singleBarrel,
      caskStrength: input.caskStrength,
      typeId: input.typeId || null,
      subTypeId: input.subTypeId || null,
      mashBillId: input.mashBillId || null,
      ageStatement: input.ageStatement?.trim() || null,
      release: input.release?.trim() || null,
      t8kePick: input.t8kePick,
      bottleNumber: input.bottleNumber?.trim() || null,
      barrelNumber: input.barrelNumber?.trim() || null,
      hasBarrelFinish: input.hasBarrelFinish,
      finishTypeId: input.finishTypeId || null,
      producerNotes: input.producerNotes?.trim() || null,
      websiteNotes: input.websiteNotes?.trim() || null,
      distilledDate: input.distilledDate ? new Date(input.distilledDate) : null,
      status: input.status,
      fillLevel: fill,
      purchaseDate: input.purchaseDate ? new Date(input.purchaseDate) : null,
      storeId: input.storeId || null,
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

export type BatchBottleResult = {
  index: number;
  ok: boolean;
  id?: string;
  error?: string;
};

export async function createBottlesBatch(
  inputs: BottleInput[],
): Promise<BatchBottleResult[]> {
  const cleaned = inputs.map((input, index) => ({
    index,
    result: clean(input),
  }));
  const firstError = cleaned.find((c) => "error" in c.result);
  if (firstError && "error" in firstError.result) {
    return [
      { index: firstError.index, ok: false, error: firstError.result.error },
    ];
  }
  const now = new Date();
  const results: BatchBottleResult[] = [];
  await prisma.$transaction(async (tx) => {
    for (const { index, result } of cleaned) {
      if ("error" in result) continue;
      const bottle = await tx.bottle.create({
        data: {
          ...result.data,
          openedAt: result.data.status === "OPEN" ? now : null,
          finishedAt: result.data.status === "FINISHED" ? now : null,
        },
      });
      results.push({ index, ok: true, id: bottle.id });
    }
  });
  revalidatePath("/bottles");
  return results;
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
