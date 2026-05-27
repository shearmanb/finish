"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PourEditorData } from "@/lib/data/pours";
import { createPour } from "@/lib/actions/pours";
import { usePourDraft } from "./use-pour-draft";
import { PourMeta } from "./pour-meta";
import { FlavorPicker } from "./flavor-picker";
import { ChipMultiSelect } from "./chip-multiselect";
import { RatingInput } from "./rating-input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

export function GuidedTasting({
  bottleId,
  data,
}: {
  bottleId: string;
  data: PourEditorData;
}) {
  const router = useRouter();
  const draft = usePourDraft();
  const [pending, start] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);
  const [index, setIndex] = React.useState(0);

  const steps = data.guidedSteps;
  const total = steps.length + 2; // + details + score
  const detailsIndex = steps.length;
  const scoreIndex = steps.length + 1;
  const isLast = index === total - 1;

  function save() {
    setError(null);
    start(async () => {
      const res = await createPour(draft.build(bottleId, true));
      if (res && !res.ok) setError(res.error ?? "Something went wrong.");
    });
  }

  function next() {
    if (isLast) save();
    else setIndex((i) => Math.min(total - 1, i + 1));
  }

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${((index + 1) / total) * 100}%` }}
          />
        </div>
        <span className="text-xs text-muted-foreground">
          {index + 1}/{total}
        </span>
      </div>

      {index < steps.length ? (
        <Card className="animate-in">
          <CardContent className="space-y-4 pt-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-full bg-primary/12 text-sm font-semibold text-primary">
                  {index + 1}
                </span>
                <h2 className="text-lg font-semibold">{steps[index].title}</h2>
              </div>
              <p className="mt-2 text-muted-foreground">
                {steps[index].instruction}
              </p>
            </div>
            <Textarea
              placeholder="What do you notice?"
              value={draft.notes[steps[index].phase.id] ?? ""}
              onChange={(e) => draft.setNote(steps[index].phase.id, e.target.value)}
              autoFocus
            />
            {steps[index].capturesFlavors ? (
              <FlavorPicker
                categories={data.flavors}
                selected={draft.flavorsForPhase(steps[index].phase.id)}
                onToggle={(fid) => draft.toggleFlavor(steps[index].phase.id, fid)}
              />
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {index === detailsIndex ? (
        <Card className="animate-in">
          <CardContent className="space-y-5 pt-5">
            <h2 className="text-lg font-semibold">The details</h2>
            <PourMeta draft={draft} glassware={data.glassware} locations={data.locations} />
            {data.mouthfeel.length > 0 ? (
              <div className="space-y-2">
                <span className="text-sm font-medium">Mouthfeel</span>
                <ChipMultiSelect
                  items={data.mouthfeel}
                  selected={draft.mouthfeel}
                  onToggle={draft.toggleMouthfeel}
                />
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {index === scoreIndex ? (
        <Card className="animate-in">
          <CardContent className="space-y-5 pt-5">
            <h2 className="text-lg font-semibold">Score it</h2>
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
      ) : null}

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="flex items-center justify-between gap-2">
        <Button
          type="button"
          variant="ghost"
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0 || pending}
        >
          <ChevronLeft className="size-4" /> Back
        </Button>
        <Button onClick={next} disabled={pending} size="lg">
          {isLast ? (pending ? "Saving…" : "Save pour") : "Next"}
          {!isLast ? <ChevronRight className="size-4" /> : null}
        </Button>
      </div>
    </div>
  );
}
