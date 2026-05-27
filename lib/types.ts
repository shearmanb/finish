// Plain shared types (no runtime) used by both client components and server code.

export type Prep = "NEAT" | "WATER" | "ICE";
export type PourUnit = "OZ" | "ML";

export type LookupItem = { id: string; name: string };

export type AnchorDef = { value: number; label: string; description: string | null };

export type DimensionDef = {
  id: string;
  name: string;
  scaleType: "NUMERIC" | "STAR";
  minValue: number;
  maxValue: number;
  step: number | null;
  anchors: AnchorDef[];
};

export type PhaseDef = { id: string; name: string };

export type FlavorItem = { id: string; name: string };
export type FlavorCategoryDef = {
  id: string;
  name: string;
  parentId: string | null;
  flavors: FlavorItem[];
};

export type GuidedStepDef = {
  id: string;
  title: string;
  instruction: string;
  capturesFlavors: boolean;
  phase: PhaseDef;
};

export type PourInput = {
  bottleId: string;
  glasswareId: string | null;
  locationId: string | null;
  companions: string | null;
  prep: Prep;
  prepNote: string | null;
  pourSize: number | null;
  pourSizeUnit: PourUnit;
  pouredAt: string | null;
  isGuided: boolean;
  notes: { phaseId: string; text: string }[];
  flavors: { phaseId: string; flavorId: string }[];
  mouthfeelIds: string[];
  ratings: { dimensionId: string; value: number }[];
};
