import "server-only";
import { prisma } from "@/lib/db";
import {
  getActiveGlassware,
  getActiveLocations,
  getActivePhases,
  getActiveDimensions,
  getActiveMouthfeel,
  getFlavorTree,
  getActiveGuidedSteps,
} from "@/lib/data/lookups";
import type {
  DimensionDef,
  FlavorCategoryDef,
  GuidedStepDef,
  LookupItem,
  PhaseDef,
} from "@/lib/types";

export type PourEditorData = {
  glassware: LookupItem[];
  locations: LookupItem[];
  phases: PhaseDef[];
  dimensions: DimensionDef[];
  mouthfeel: LookupItem[];
  flavors: FlavorCategoryDef[];
  guidedSteps: GuidedStepDef[];
};

export async function getPourEditorData(): Promise<PourEditorData> {
  const [glassware, locations, phases, dimensions, mouthfeel, flavors, steps] =
    await Promise.all([
      getActiveGlassware(),
      getActiveLocations(),
      getActivePhases(),
      getActiveDimensions(),
      getActiveMouthfeel(),
      getFlavorTree(),
      getActiveGuidedSteps(),
    ]);

  return {
    glassware: glassware.map((g) => ({ id: g.id, name: g.name })),
    locations: locations.map((l) => ({ id: l.id, name: l.name })),
    phases: phases.map((p) => ({ id: p.id, name: p.name })),
    dimensions: dimensions.map((d) => ({
      id: d.id,
      name: d.name,
      scaleType: d.scaleType,
      minValue: d.minValue,
      maxValue: d.maxValue,
      step: d.step,
      anchors: d.anchors.map((a) => ({
        value: a.value,
        label: a.label,
        description: a.description,
      })),
    })),
    mouthfeel: mouthfeel.map((m) => ({ id: m.id, name: m.name })),
    flavors: flavors.map((c) => ({
      id: c.id,
      name: c.name,
      parentId: c.parentId,
      flavors: c.flavors.map((f) => ({ id: f.id, name: f.name })),
    })),
    guidedSteps: steps.map((s) => ({
      id: s.id,
      title: s.title,
      instruction: s.instruction,
      capturesFlavors: s.capturesFlavors,
      phase: { id: s.phase.id, name: s.phase.name },
    })),
  };
}

export async function getBottleHeader(id: string) {
  return prisma.bottle.findUnique({
    where: { id },
    include: { product: { include: { distillery: true } } },
  });
}

export async function getPour(id: string) {
  return prisma.pour.findUnique({
    where: { id },
    include: {
      bottle: { include: { product: { include: { distillery: true } } } },
      glassware: true,
      location: true,
      notes: { include: { phase: true } },
      flavors: { include: { phase: true, flavor: true } },
      mouthfeels: { include: { mouthfeel: true } },
      ratings: { include: { dimension: true } },
    },
  });
}
