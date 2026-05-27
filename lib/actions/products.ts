"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { proofToAbv } from "@/lib/utils";
import type { ProductInput } from "@/lib/data/products";

type Result = { ok: boolean; error?: string };

function clean(input: ProductInput) {
  const name = input.name.trim();
  if (!name) return { error: "Name is required." as const };
  if (!input.distilleryId) return { error: "Pick a distillery." as const };
  const proof =
    input.proof === null || Number.isNaN(input.proof) ? null : input.proof;
  return {
    data: {
      name,
      distilleryId: input.distilleryId,
      proof,
      abv: proofToAbv(proof),
      caskStrength: input.caskStrength,
      category: input.category?.trim() || null,
      mashBill: input.mashBill?.trim() || null,
      ageStatement: input.ageStatement?.trim() || null,
    },
  };
}

export async function createProduct(input: ProductInput): Promise<Result> {
  const res = clean(input);
  if ("error" in res) return { ok: false, error: res.error };
  const product = await prisma.product.create({ data: res.data });
  revalidatePath("/products");
  redirect(`/products/${product.id}`);
}

export async function updateProduct(
  id: string,
  input: ProductInput,
): Promise<Result> {
  const res = clean(input);
  if ("error" in res) return { ok: false, error: res.error };
  await prisma.product.update({ where: { id }, data: res.data });
  revalidatePath("/products");
  revalidatePath(`/products/${id}`);
  redirect(`/products/${id}`);
}
