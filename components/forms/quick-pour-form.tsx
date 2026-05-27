"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { PourEditorData } from "@/lib/data/pours";
import { createPour, updatePour } from "@/lib/actions/pours";
import { usePourDraft, type DraftInitial } from "./use-pour-draft";
import { PourMeta } from "./pour-meta";
import { FlavorPicker } from "./flavor-picker";
import { ChipMultiSelect } from "./chip-multiselect";
import { RatingInput } from "./rating-input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

export function QuickPourForm({
  bottleId,
  data,
  pourId,
  initial,
}: {
  bottleId: string;
  data: PourEditorData;
  pourId?: string;
  initial?: DraftInitial;
}) {
  const router = useRouter();
  const draft = usePourDraft(initial);
  const [pending, start] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);
  const [openPhase, setOpenPhase] = React.useState<string | null>(null);

  function save() {
    setError(null);
    start(async () => {
      const input = draft.build(bottleId, false);
      const res = pourId
        ? await updatePour(pourId, input)
        : await createPour(input);
      if (res && !res.ok) setError(res.error ?? "Something went wrong.");
    });
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-5">
          <PourMeta draft={draft} glassware={data.glassware} locations={data.locations} />
        </CardContent>
      </Card>

      {data.phases.map((phase) => {
        const selected = draft.flavorsForPhase(phase.id);
        const open = openPhase === phase.id;
        return (
          <Card key={phase.id}>
            <CardContent className="space-y-3 pt-5">
              <div className="flex items-center justify-between">
                <span className="font-semibold">{phase.name}</span>
                {selected.size > 0 ? (
                  <Badge>{selected.size} flavors</Badge>
                ) : null}
              </div>
              <Textarea
                placeholder={`Notes for ${phase.name.toLowerCase()}…`}
                value={draft.notes[phase.id] ?? ""}
                onChange={(e) => draft.setNote(phase.id, e.target.value)}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setOpenPhase(open ? null : phase.id)}
              >
                {open ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                {open ? "Hide flavors" : "Add flavors"}
              </Button>
              {open ? (
                <FlavorPicker
                  categories={data.flavors}
                  selected={selected}
                  onToggle={(fid) => draft.toggleFlavor(phase.id, fid)}
                />
              ) : null}
            </CardContent>
          </Card>
        );
      })}

      {data.mouthfeel.length > 0 ? (
        <Card>
          <CardContent className="space-y-3 pt-5">
            <span className="font-semibold">Mouthfeel</span>
            <ChipMultiSelect
              items={data.mouthfeel}
              selected={draft.mouthfeel}
              onToggle={draft.toggleMouthfeel}
            />
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardContent className="space-y-5 pt-5">
          <span className="font-semibold">Ratings</span>
          {data.dimensions.map((dim) => (
            <RatingInput
              key={dim.id}
              dimension={dim}
              value={draft.ratings[dim.id] ?? null}
              onChange={(v) => draft.setRating(dim.id, v)}
            />
          ))}
        </CardContent>
      </Card>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="flex gap-2">
        <Button onClick={save} disabled={pending} size="lg" className="flex-1">
          {pending ? "Saving…" : "Save pour"}
        </Button>
        <Button variant="ghost" size="lg" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
