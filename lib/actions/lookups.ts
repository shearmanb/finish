"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { SIMPLE_LOOKUPS, type SimpleLookupKey } from "@/lib/data/lookups";

type Result = { ok: boolean; error?: string; id?: string };
const ok: Result = { ok: true };

function refresh() {
  revalidatePath("/control-panel");
  revalidatePath("/", "layout");
}

// ---------------- Simple lookups (name + optional region) ----------------

export async function createSimpleLookup(
  key: SimpleLookupKey,
  name: string,
  extra?: string,
): Promise<Result> {
  const trimmed = name.trim();
  if (!trimmed) return { ok: false, error: "Name is required." };
  const cfg = SIMPLE_LOOKUPS[key];
  const delegate = cfg.delegate();
  const rows = await delegate.findMany({ orderBy: { sortIndex: "desc" } });
  const next = rows.length ? Number(rows[0].sortIndex) + 1 : 0;
  const data: Record<string, unknown> = { name: trimmed, sortIndex: next };
  if (cfg.extraField && extra?.trim()) data[cfg.extraField.key] = extra.trim();
  let created: Record<string, unknown>;
  try {
    created = await delegate.create({ data });
  } catch {
    return { ok: false, error: "That name already exists." };
  }
  refresh();
  return { ok: true, id: String(created.id) };
}

export async function updateSimpleLookup(
  key: SimpleLookupKey,
  id: string,
  name: string,
  extra?: string,
): Promise<Result> {
  const trimmed = name.trim();
  if (!trimmed) return { ok: false, error: "Name is required." };
  const cfg = SIMPLE_LOOKUPS[key];
  const data: Record<string, unknown> = { name: trimmed };
  if (cfg.extraField) data[cfg.extraField.key] = extra?.trim() || null;
  try {
    await cfg.delegate().update({ where: { id }, data });
  } catch {
    return { ok: false, error: "That name already exists." };
  }
  refresh();
  return ok;
}

export async function setLookupArchived(
  key: SimpleLookupKey,
  id: string,
  isArchived: boolean,
): Promise<Result> {
  await SIMPLE_LOOKUPS[key].delegate().update({ where: { id }, data: { isArchived } });
  refresh();
  return ok;
}

export async function moveLookup(
  key: SimpleLookupKey,
  id: string,
  dir: "up" | "down",
): Promise<Result> {
  const delegate = SIMPLE_LOOKUPS[key].delegate();
  const rows = (await delegate.findMany({
    where: { isArchived: false },
    orderBy: { sortIndex: "asc" },
  })) as { id: string; sortIndex: number }[];
  const idx = rows.findIndex((r) => r.id === id);
  const swapWith = dir === "up" ? idx - 1 : idx + 1;
  if (idx < 0 || swapWith < 0 || swapWith >= rows.length) return ok;
  const a = rows[idx];
  const b = rows[swapWith];
  await delegate.update({ where: { id: a.id }, data: { sortIndex: b.sortIndex } });
  await delegate.update({ where: { id: b.id }, data: { sortIndex: a.sortIndex } });
  refresh();
  return ok;
}

// ---------------- Flavor categories & flavors ----------------

export async function createCategory(
  name: string,
  parentId: string | null,
): Promise<Result> {
  const trimmed = name.trim();
  if (!trimmed) return { ok: false, error: "Name is required." };
  const max = await prisma.flavorCategory.aggregate({ _max: { sortIndex: true } });
  await prisma.flavorCategory.create({
    data: {
      name: trimmed,
      parentId: parentId || null,
      sortIndex: (max._max.sortIndex ?? -1) + 1,
    },
  });
  refresh();
  return ok;
}

export async function updateCategory(
  id: string,
  name: string,
  parentId: string | null,
): Promise<Result> {
  const trimmed = name.trim();
  if (!trimmed) return { ok: false, error: "Name is required." };
  if (parentId === id) return { ok: false, error: "A category can't be its own parent." };
  await prisma.flavorCategory.update({
    where: { id },
    data: { name: trimmed, parentId: parentId || null },
  });
  refresh();
  return ok;
}

export async function setCategoryArchived(id: string, isArchived: boolean): Promise<Result> {
  await prisma.flavorCategory.update({ where: { id }, data: { isArchived } });
  refresh();
  return ok;
}

export async function createFlavor(categoryId: string, name: string): Promise<Result> {
  const trimmed = name.trim();
  if (!trimmed) return { ok: false, error: "Name is required." };
  if (!categoryId) return { ok: false, error: "Pick a category." };
  const max = await prisma.flavor.aggregate({
    where: { categoryId },
    _max: { sortIndex: true },
  });
  await prisma.flavor.create({
    data: { name: trimmed, categoryId, sortIndex: (max._max.sortIndex ?? -1) + 1 },
  });
  refresh();
  return ok;
}

export async function updateFlavor(
  id: string,
  name: string,
  categoryId: string,
): Promise<Result> {
  const trimmed = name.trim();
  if (!trimmed) return { ok: false, error: "Name is required." };
  await prisma.flavor.update({ where: { id }, data: { name: trimmed, categoryId } });
  refresh();
  return ok;
}

export async function setFlavorArchived(id: string, isArchived: boolean): Promise<Result> {
  await prisma.flavor.update({ where: { id }, data: { isArchived } });
  refresh();
  return ok;
}

// ---------------- Rating dimensions & anchors ----------------

export async function createDimension(input: {
  name: string;
  scaleType: "NUMERIC" | "STAR";
  minValue: number;
  maxValue: number;
  step: number | null;
}): Promise<Result> {
  const name = input.name.trim();
  if (!name) return { ok: false, error: "Name is required." };
  if (input.maxValue <= input.minValue)
    return { ok: false, error: "Max must be greater than min." };
  const max = await prisma.ratingDimension.aggregate({ _max: { sortIndex: true } });
  try {
    await prisma.ratingDimension.create({
      data: { ...input, name, sortIndex: (max._max.sortIndex ?? -1) + 1 },
    });
  } catch {
    return { ok: false, error: "That name already exists." };
  }
  refresh();
  return ok;
}

export async function updateDimension(
  id: string,
  input: {
    name: string;
    scaleType: "NUMERIC" | "STAR";
    minValue: number;
    maxValue: number;
    step: number | null;
  },
): Promise<Result> {
  const name = input.name.trim();
  if (!name) return { ok: false, error: "Name is required." };
  if (input.maxValue <= input.minValue)
    return { ok: false, error: "Max must be greater than min." };
  try {
    await prisma.ratingDimension.update({ where: { id }, data: { ...input, name } });
  } catch {
    return { ok: false, error: "That name already exists." };
  }
  refresh();
  return ok;
}

export async function setDimensionArchived(id: string, isArchived: boolean): Promise<Result> {
  await prisma.ratingDimension.update({ where: { id }, data: { isArchived } });
  refresh();
  return ok;
}

export async function moveDimension(id: string, dir: "up" | "down"): Promise<Result> {
  const rows = await prisma.ratingDimension.findMany({
    where: { isArchived: false },
    orderBy: { sortIndex: "asc" },
  });
  const idx = rows.findIndex((r) => r.id === id);
  const swapWith = dir === "up" ? idx - 1 : idx + 1;
  if (idx < 0 || swapWith < 0 || swapWith >= rows.length) return ok;
  await prisma.$transaction([
    prisma.ratingDimension.update({
      where: { id: rows[idx].id },
      data: { sortIndex: rows[swapWith].sortIndex },
    }),
    prisma.ratingDimension.update({
      where: { id: rows[swapWith].id },
      data: { sortIndex: rows[idx].sortIndex },
    }),
  ]);
  refresh();
  return ok;
}

// ---------------- Guided steps ----------------

export async function createGuidedStep(input: {
  phaseId: string;
  title: string;
  instruction: string;
  capturesFlavors: boolean;
}): Promise<Result> {
  if (!input.title.trim()) return { ok: false, error: "Title is required." };
  if (!input.phaseId) return { ok: false, error: "Pick a phase." };
  const max = await prisma.guidedStep.aggregate({ _max: { sortIndex: true } });
  await prisma.guidedStep.create({
    data: {
      phaseId: input.phaseId,
      title: input.title.trim(),
      instruction: input.instruction.trim(),
      capturesFlavors: input.capturesFlavors,
      sortIndex: (max._max.sortIndex ?? -1) + 1,
    },
  });
  refresh();
  return ok;
}

export async function updateGuidedStep(
  id: string,
  input: {
    phaseId: string;
    title: string;
    instruction: string;
    capturesFlavors: boolean;
  },
): Promise<Result> {
  if (!input.title.trim()) return { ok: false, error: "Title is required." };
  await prisma.guidedStep.update({
    where: { id },
    data: {
      phaseId: input.phaseId,
      title: input.title.trim(),
      instruction: input.instruction.trim(),
      capturesFlavors: input.capturesFlavors,
    },
  });
  refresh();
  return ok;
}

export async function setGuidedStepArchived(id: string, isArchived: boolean): Promise<Result> {
  await prisma.guidedStep.update({ where: { id }, data: { isArchived } });
  refresh();
  return ok;
}

export async function moveGuidedStep(id: string, dir: "up" | "down"): Promise<Result> {
  const rows = await prisma.guidedStep.findMany({
    where: { isArchived: false },
    orderBy: { sortIndex: "asc" },
  });
  const idx = rows.findIndex((r) => r.id === id);
  const swapWith = dir === "up" ? idx - 1 : idx + 1;
  if (idx < 0 || swapWith < 0 || swapWith >= rows.length) return ok;
  await prisma.$transaction([
    prisma.guidedStep.update({
      where: { id: rows[idx].id },
      data: { sortIndex: rows[swapWith].sortIndex },
    }),
    prisma.guidedStep.update({
      where: { id: rows[swapWith].id },
      data: { sortIndex: rows[idx].sortIndex },
    }),
  ]);
  refresh();
  return ok;
}
