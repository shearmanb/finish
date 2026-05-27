"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import type { LineInput } from "@/lib/data/lines";

type Result = { ok: boolean; error?: string };

function clean(input: LineInput) {
  const name = input.name.trim();
  if (!name) return { error: "Name is required." as const };
  if (!input.distilleryId) return { error: "Pick a distillery." as const };
  return { data: { name, distilleryId: input.distilleryId } };
}

export async function createLine(input: LineInput): Promise<Result> {
  const res = clean(input);
  if ("error" in res) return { ok: false, error: res.error };
  const line = await prisma.line.create({ data: res.data });
  revalidatePath("/lines");
  redirect(`/lines/${line.id}`);
}

export async function updateLine(id: string, input: LineInput): Promise<Result> {
  const res = clean(input);
  if ("error" in res) return { ok: false, error: res.error };
  await prisma.line.update({ where: { id }, data: res.data });
  revalidatePath("/lines");
  revalidatePath(`/lines/${id}`);
  redirect(`/lines/${id}`);
}

// Non-redirecting variant for inline creation (e.g. from the bottle form).
export async function createLineInline(
  input: LineInput,
): Promise<Result & { line?: { id: string; name: string; distilleryName: string } }> {
  const res = clean(input);
  if ("error" in res) return { ok: false, error: res.error };
  const line = await prisma.line.create({
    data: res.data,
    include: { distillery: true },
  });
  revalidatePath("/lines");
  return {
    ok: true,
    line: { id: line.id, name: line.name, distilleryName: line.distillery.name },
  };
}
