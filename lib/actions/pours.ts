"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import type { PourInput } from "@/lib/types";

type Result = { ok: boolean; error?: string };

function buildChildren(input: PourInput) {
  const notes = input.notes
    .filter((n) => n.text.trim() !== "")
    .map((n) => ({ phaseId: n.phaseId, text: n.text.trim() }));

  const seenFlavor = new Set<string>();
  const flavors = input.flavors.filter((f) => {
    const key = `${f.phaseId}:${f.flavorId}`;
    if (seenFlavor.has(key)) return false;
    seenFlavor.add(key);
    return true;
  });

  const mouthfeelIds = Array.from(new Set(input.mouthfeelIds));

  const seenDim = new Set<string>();
  const ratings = input.ratings.filter((r) => {
    if (r.value === null || Number.isNaN(r.value)) return false;
    if (seenDim.has(r.dimensionId)) return false;
    seenDim.add(r.dimensionId);
    return true;
  });

  return { notes, flavors, mouthfeelIds, ratings };
}

export async function createPour(input: PourInput): Promise<Result> {
  if (!input.bottleId) return { ok: false, error: "Missing bottle." };

  const bottle = await prisma.bottle.findUnique({ where: { id: input.bottleId } });
  if (!bottle) return { ok: false, error: "Bottle not found." };

  const agg = await prisma.pour.aggregate({
    where: { bottleId: input.bottleId },
    _max: { pourNumber: true },
  });
  const pourNumber = (agg._max.pourNumber ?? 0) + 1;
  const { notes, flavors, mouthfeelIds, ratings } = buildChildren(input);

  const pour = await prisma.pour.create({
    data: {
      bottleId: input.bottleId,
      pourNumber,
      pouredAt: input.pouredAt ? new Date(input.pouredAt) : new Date(),
      glasswareId: input.glasswareId || null,
      locationId: input.locationId || null,
      companions: input.companions?.trim() || null,
      prep: input.prep,
      prepNote: input.prepNote?.trim() || null,
      pourSize: input.pourSize ?? null,
      pourSizeUnit: input.pourSizeUnit,
      isGuided: input.isGuided,
      notes: { create: notes },
      flavors: { create: flavors },
      mouthfeels: { create: mouthfeelIds.map((id) => ({ mouthfeelId: id })) },
      ratings: { create: ratings },
    },
  });

  // Logging a pour implies the bottle is open.
  if (bottle.status === "SEALED") {
    await prisma.bottle.update({
      where: { id: bottle.id },
      data: { status: "OPEN", openedAt: bottle.openedAt ?? new Date() },
    });
  }

  revalidatePath(`/bottles/${input.bottleId}`);
  revalidatePath("/");
  redirect(`/pours/${pour.id}`);
}

export async function updatePour(id: string, input: PourInput): Promise<Result> {
  const { notes, flavors, mouthfeelIds, ratings } = buildChildren(input);

  await prisma.$transaction([
    prisma.pourPhaseNote.deleteMany({ where: { pourId: id } }),
    prisma.pourFlavor.deleteMany({ where: { pourId: id } }),
    prisma.pourMouthfeel.deleteMany({ where: { pourId: id } }),
    prisma.pourRating.deleteMany({ where: { pourId: id } }),
    prisma.pour.update({
      where: { id },
      data: {
        pouredAt: input.pouredAt ? new Date(input.pouredAt) : undefined,
        glasswareId: input.glasswareId || null,
        locationId: input.locationId || null,
        companions: input.companions?.trim() || null,
        prep: input.prep,
        prepNote: input.prepNote?.trim() || null,
        pourSize: input.pourSize ?? null,
        pourSizeUnit: input.pourSizeUnit,
        notes: { create: notes },
        flavors: { create: flavors },
        mouthfeels: { create: mouthfeelIds.map((mid) => ({ mouthfeelId: mid })) },
        ratings: { create: ratings },
      },
    }),
  ]);

  revalidatePath(`/pours/${id}`);
  redirect(`/pours/${id}`);
}

export async function deletePour(id: string): Promise<Result> {
  const pour = await prisma.pour.findUnique({ where: { id } });
  if (!pour) return { ok: true };
  await prisma.pour.delete({ where: { id } });
  revalidatePath(`/bottles/${pour.bottleId}`);
  revalidatePath("/");
  redirect(`/bottles/${pour.bottleId}`);
}
