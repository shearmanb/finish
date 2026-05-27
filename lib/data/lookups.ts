import "server-only";
import { prisma } from "@/lib/db";

// Minimal shape shared by every lookup delegate so we can drive generic CRUD.
type LookupDelegate = {
  findMany: (args?: unknown) => Promise<Record<string, unknown>[]>;
  findUnique: (args: unknown) => Promise<Record<string, unknown> | null>;
  create: (args: unknown) => Promise<Record<string, unknown>>;
  update: (args: unknown) => Promise<Record<string, unknown>>;
};

export type SimpleLookupKey =
  | "distilleries"
  | "glassware"
  | "locations"
  | "mouthfeel"
  | "phases";

type SimpleConfig = {
  key: SimpleLookupKey;
  label: string; // plural
  singular: string;
  delegate: () => LookupDelegate;
  extraField?: { key: string; label: string; placeholder?: string };
};

export const SIMPLE_LOOKUPS: Record<SimpleLookupKey, SimpleConfig> = {
  distilleries: {
    key: "distilleries",
    label: "Distilleries",
    singular: "Distillery",
    delegate: () => prisma.distillery as unknown as LookupDelegate,
    extraField: { key: "region", label: "Region", placeholder: "Kentucky" },
  },
  glassware: {
    key: "glassware",
    label: "Glassware",
    singular: "Glass",
    delegate: () => prisma.glassware as unknown as LookupDelegate,
  },
  locations: {
    key: "locations",
    label: "Locations",
    singular: "Location",
    delegate: () => prisma.location as unknown as LookupDelegate,
  },
  mouthfeel: {
    key: "mouthfeel",
    label: "Mouthfeel",
    singular: "Mouthfeel",
    delegate: () => prisma.mouthfeel as unknown as LookupDelegate,
  },
  phases: {
    key: "phases",
    label: "Tasting Phases",
    singular: "Phase",
    delegate: () => prisma.tastingPhase as unknown as LookupDelegate,
  },
};

const ORDER = [{ isArchived: "asc" }, { sortIndex: "asc" }, { name: "asc" }];

export type LookupRow = {
  id: string;
  name: string;
  sortIndex: number;
  isArchived: boolean;
  region?: string | null;
};

export async function listLookup(key: SimpleLookupKey): Promise<LookupRow[]> {
  const rows = await SIMPLE_LOOKUPS[key].delegate().findMany({ orderBy: ORDER });
  return rows as unknown as LookupRow[];
}

// ---- Active lists for form pickers ----

export async function getActiveDistilleries() {
  return prisma.distillery.findMany({
    where: { isArchived: false },
    orderBy: [{ sortIndex: "asc" }, { name: "asc" }],
  });
}

export async function getActiveGlassware() {
  return prisma.glassware.findMany({
    where: { isArchived: false },
    orderBy: [{ sortIndex: "asc" }, { name: "asc" }],
  });
}

export async function getActiveLocations() {
  return prisma.location.findMany({
    where: { isArchived: false },
    orderBy: [{ sortIndex: "asc" }, { name: "asc" }],
  });
}

export async function getActiveMouthfeel() {
  return prisma.mouthfeel.findMany({
    where: { isArchived: false },
    orderBy: [{ sortIndex: "asc" }, { name: "asc" }],
  });
}

export async function getActivePhases() {
  return prisma.tastingPhase.findMany({
    where: { isArchived: false },
    orderBy: [{ sortIndex: "asc" }],
  });
}

export async function getActiveDimensions() {
  return prisma.ratingDimension.findMany({
    where: { isArchived: false },
    orderBy: [{ sortIndex: "asc" }],
    include: { anchors: { orderBy: { value: "asc" } } },
  });
}

export type FlavorCategoryWithFlavors = {
  id: string;
  name: string;
  parentId: string | null;
  sortIndex: number;
  isArchived: boolean;
  flavors: { id: string; name: string; sortIndex: number; isArchived: boolean }[];
};

/** All non-archived categories (with their non-archived flavors) for pickers. */
export async function getFlavorTree(): Promise<FlavorCategoryWithFlavors[]> {
  const cats = await prisma.flavorCategory.findMany({
    where: { isArchived: false },
    orderBy: [{ sortIndex: "asc" }, { name: "asc" }],
    include: {
      flavors: {
        where: { isArchived: false },
        orderBy: [{ sortIndex: "asc" }, { name: "asc" }],
      },
    },
  });
  return cats as unknown as FlavorCategoryWithFlavors[];
}

/** Every category/flavor (including archived) for the Control Panel editor. */
export async function getFlavorTreeAll() {
  return prisma.flavorCategory.findMany({
    orderBy: [{ isArchived: "asc" }, { sortIndex: "asc" }, { name: "asc" }],
    include: {
      flavors: {
        orderBy: [{ isArchived: "asc" }, { sortIndex: "asc" }, { name: "asc" }],
      },
    },
  });
}

export async function getDimensionsAll() {
  return prisma.ratingDimension.findMany({
    orderBy: [{ isArchived: "asc" }, { sortIndex: "asc" }],
    include: { anchors: { orderBy: { value: "asc" } } },
  });
}

export async function getGuidedStepsAll() {
  return prisma.guidedStep.findMany({
    orderBy: [{ isArchived: "asc" }, { sortIndex: "asc" }],
    include: { phase: true },
  });
}

export async function getActiveGuidedSteps() {
  return prisma.guidedStep.findMany({
    where: { isArchived: false },
    orderBy: { sortIndex: "asc" },
    include: { phase: true },
  });
}
