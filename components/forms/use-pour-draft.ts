"use client";

import * as React from "react";
import type { Prep, PourUnit, PourInput } from "@/lib/types";

export type DraftInitial = {
  glasswareId?: string;
  locationId?: string;
  prep?: Prep;
  prepNote?: string;
  pourSize?: string;
  pourSizeUnit?: PourUnit;
  companions?: string;
  pouredAt?: string;
  notes?: Record<string, string>;
  flavors?: Record<string, string[]>;
  mouthfeel?: string[];
  ratings?: Record<string, number>;
};

export function usePourDraft(initial?: DraftInitial) {
  const [glasswareId, setGlasswareId] = React.useState(initial?.glasswareId ?? "");
  const [locationId, setLocationId] = React.useState(initial?.locationId ?? "");
  const [prep, setPrep] = React.useState<Prep>(initial?.prep ?? "NEAT");
  const [prepNote, setPrepNote] = React.useState(initial?.prepNote ?? "");
  const [pourSize, setPourSize] = React.useState(initial?.pourSize ?? "");
  const [pourSizeUnit, setPourSizeUnit] = React.useState<PourUnit>(
    initial?.pourSizeUnit ?? "OZ",
  );
  const [companions, setCompanions] = React.useState(initial?.companions ?? "");
  const [pouredAt, setPouredAt] = React.useState(initial?.pouredAt ?? "");

  const [notes, setNotes] = React.useState<Record<string, string>>(
    initial?.notes ?? {},
  );
  const [flavors, setFlavors] = React.useState<Record<string, Set<string>>>(
    () => {
      const out: Record<string, Set<string>> = {};
      for (const [phaseId, ids] of Object.entries(initial?.flavors ?? {})) {
        out[phaseId] = new Set(ids);
      }
      return out;
    },
  );
  const [mouthfeel, setMouthfeel] = React.useState<Set<string>>(
    new Set(initial?.mouthfeel ?? []),
  );
  const [ratings, setRatings] = React.useState<Record<string, number | null>>(
    initial?.ratings ?? {},
  );

  function setNote(phaseId: string, text: string) {
    setNotes((s) => ({ ...s, [phaseId]: text }));
  }

  function flavorsForPhase(phaseId: string): Set<string> {
    return flavors[phaseId] ?? new Set();
  }

  function toggleFlavor(phaseId: string, flavorId: string) {
    setFlavors((s) => {
      const next = new Set(s[phaseId] ?? []);
      if (next.has(flavorId)) next.delete(flavorId);
      else next.add(flavorId);
      return { ...s, [phaseId]: next };
    });
  }

  function toggleMouthfeel(id: string) {
    setMouthfeel((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function setRating(dimensionId: string, value: number | null) {
    setRatings((s) => ({ ...s, [dimensionId]: value }));
  }

  function build(bottleId: string, isGuided: boolean): PourInput {
    const flavorList: { phaseId: string; flavorId: string }[] = [];
    for (const [phaseId, set] of Object.entries(flavors)) {
      for (const flavorId of set) flavorList.push({ phaseId, flavorId });
    }
    const ratingList: { dimensionId: string; value: number }[] = [];
    for (const [dimensionId, value] of Object.entries(ratings)) {
      if (value !== null && value !== undefined && !Number.isNaN(value)) {
        ratingList.push({ dimensionId, value });
      }
    }
    return {
      bottleId,
      glasswareId: glasswareId || null,
      locationId: locationId || null,
      companions: companions || null,
      prep,
      prepNote: prepNote || null,
      pourSize: pourSize.trim() === "" ? null : Number(pourSize),
      pourSizeUnit,
      pouredAt: pouredAt || null,
      isGuided,
      notes: Object.entries(notes).map(([phaseId, text]) => ({ phaseId, text })),
      flavors: flavorList,
      mouthfeelIds: Array.from(mouthfeel),
      ratings: ratingList,
    };
  }

  return {
    glasswareId, setGlasswareId,
    locationId, setLocationId,
    prep, setPrep,
    prepNote, setPrepNote,
    pourSize, setPourSize,
    pourSizeUnit, setPourSizeUnit,
    companions, setCompanions,
    pouredAt, setPouredAt,
    notes, setNote,
    flavorsForPhase, toggleFlavor,
    mouthfeel, toggleMouthfeel,
    ratings, setRating,
    build,
  };
}
