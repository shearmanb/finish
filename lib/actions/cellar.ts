"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import {
  cellarConfigured,
  fetchCellarCatalog,
  getCellarBottle,
} from "@/lib/cellar";

export type CellarHit = {
  id: number;
  name: string;
  brand: string;
  distillery: string | null;
  category: string | null;
  tier: string | null;
  shortcodes: string[];
};

// Prefill applied to the bottle form when a Cellar bottle is picked. Catalog
// identity (name/brand→line/distillery, category→type, MSRP) comes from Cellar;
// everything else (ownership, pours, photos) stays Finish-owned.
export type CellarPrefill = {
  cellarBottleId: number;
  name: string | null;
  lineId: string;
  lineOption: { id: string; name: string; distilleryName: string };
  typeId: string | null;
  msrp: number | null;
  websiteNotes: string | null;
  label: string;
};

type SearchResult = { ok: boolean; error?: string; bottles?: CellarHit[] };
type LinkResult = { ok: boolean; error?: string; prefill?: CellarPrefill };

export async function searchCellarBottles(query: string): Promise<SearchResult> {
  if (!cellarConfigured()) {
    return { ok: false, error: "Cellar isn't configured (set CELLAR_API_URL)." };
  }
  let all;
  try {
    all = await fetchCellarCatalog();
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Cellar is unreachable." };
  }
  const q = query.trim().toLowerCase();
  const filtered =
    q === ""
      ? all
      : all.filter(
          (b) =>
            b.name.toLowerCase().includes(q) ||
            b.brand.toLowerCase().includes(q) ||
            (b.distillery ?? "").toLowerCase().includes(q) ||
            b.shortcodes.some((c) => c.includes(q)),
        );
  const bottles: CellarHit[] = filtered.slice(0, 25).map((b) => ({
    id: b.id,
    name: b.name,
    brand: b.brand,
    distillery: b.distillery,
    category: b.category,
    tier: b.tier,
    shortcodes: b.shortcodes,
  }));
  return { ok: true, bottles };
}

// Match a Cellar catalog bottle to Finish's structure: find-or-create the
// Distillery and Line, map the category to a bottle type, and return form
// prefill (including the Cellar id to persist on the bottle).
export async function linkCellarBottle(cellarBottleId: number): Promise<LinkResult> {
  if (!cellarConfigured()) {
    return { ok: false, error: "Cellar isn't configured (set CELLAR_API_URL)." };
  }
  let cb;
  try {
    cb = await getCellarBottle(cellarBottleId);
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Cellar is unreachable." };
  }
  if (!cb) return { ok: false, error: "That bottle no longer exists in Cellar." };

  // Distillery: prefer Cellar's distillery, fall back to brand so a Line can
  // always be created. The user can refine afterward.
  const distName = (cb.distillery || cb.brand || "Unknown").trim();
  const distillery =
    (await prisma.distillery.findFirst({
      where: { name: { equals: distName, mode: "insensitive" } },
    })) ?? (await prisma.distillery.create({ data: { name: distName } }));

  // Line: Cellar's brand is the product line within a distillery.
  const lineName = (cb.brand || cb.name || "Unknown").trim();
  const line =
    (await prisma.line.findFirst({
      where: {
        distilleryId: distillery.id,
        name: { equals: lineName, mode: "insensitive" },
      },
      include: { distillery: true },
    })) ??
    (await prisma.line.create({
      data: { name: lineName, distilleryId: distillery.id },
      include: { distillery: true },
    }));

  // Category → top-level bottle type (best-effort name match).
  let typeId: string | null = null;
  if (cb.category) {
    const type = await prisma.bottleType.findFirst({
      where: {
        parentId: null,
        isArchived: false,
        name: { equals: cb.category, mode: "insensitive" },
      },
    });
    typeId = type?.id ?? null;
  }

  revalidatePath("/lines");

  return {
    ok: true,
    prefill: {
      cellarBottleId: cb.id,
      name: cb.name,
      lineId: line.id,
      lineOption: {
        id: line.id,
        name: line.name,
        distilleryName: line.distillery.name,
      },
      typeId,
      msrp: cb.msrp,
      websiteNotes: cb.notes,
      label: cb.name && cb.name !== cb.brand ? `${cb.brand} — ${cb.name}` : cb.brand,
    },
  };
}
