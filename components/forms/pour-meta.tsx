"use client";

import type { usePourDraft } from "./use-pour-draft";
import type { LookupItem, Prep } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const PREPS: { value: Prep; label: string }[] = [
  { value: "NEAT", label: "Neat" },
  { value: "WATER", label: "Water" },
  { value: "ICE", label: "Ice" },
];

export function PourMeta({
  draft,
  glassware,
  locations,
}: {
  draft: ReturnType<typeof usePourDraft>;
  glassware: LookupItem[];
  locations: LookupItem[];
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Glass</Label>
          <Select value={draft.glasswareId} onValueChange={draft.setGlasswareId}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select glass" />
            </SelectTrigger>
            <SelectContent>
              {glassware.map((g) => (
                <SelectItem key={g.id} value={g.id}>
                  {g.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Location</Label>
          <Select value={draft.locationId} onValueChange={draft.setLocationId}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Where?" />
            </SelectTrigger>
            <SelectContent>
              {locations.map((l) => (
                <SelectItem key={l.id} value={l.id}>
                  {l.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label>Prep</Label>
        <div className="mt-1 flex gap-1.5">
          {PREPS.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => draft.setPrep(p.value)}
              className={cn(
                "flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                draft.prep === p.value
                  ? "border-primary bg-primary/12 text-primary"
                  : "border-border hover:bg-accent",
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="size">Pour size</Label>
          <div className="mt-1 flex gap-1">
            <Input
              id="size"
              inputMode="decimal"
              value={draft.pourSize}
              onChange={(e) => draft.setPourSize(e.target.value)}
              placeholder="1.5"
            />
            <Select
              value={draft.pourSizeUnit}
              onValueChange={(v) => draft.setPourSizeUnit(v as "OZ" | "ML")}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="OZ">oz</SelectItem>
                <SelectItem value="ML">ml</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            className="mt-1"
            value={draft.pouredAt}
            onChange={(e) => draft.setPouredAt(e.target.value)}
          />
        </div>
      </div>

      {draft.prep !== "NEAT" ? (
        <div>
          <Label htmlFor="prepNote">Prep note</Label>
          <Input
            id="prepNote"
            className="mt-1"
            value={draft.prepNote}
            onChange={(e) => draft.setPrepNote(e.target.value)}
            placeholder="e.g. 3 drops of water"
          />
        </div>
      ) : null}

      <div>
        <Label htmlFor="companions">With (optional)</Label>
        <Input
          id="companions"
          className="mt-1"
          value={draft.companions}
          onChange={(e) => draft.setCompanions(e.target.value)}
          placeholder="Who you shared it with"
        />
      </div>
    </div>
  );
}
