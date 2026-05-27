"use client";

import * as React from "react";
import { Star } from "lucide-react";
import type { DimensionDef } from "@/lib/types";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { cn, formatScore } from "@/lib/utils";

function nearestAnchor(dim: DimensionDef, value: number) {
  if (dim.anchors.length === 0) return null;
  return dim.anchors.reduce((best, a) =>
    Math.abs(a.value - value) < Math.abs(best.value - value) ? a : best,
  );
}

export function RatingInput({
  dimension,
  value,
  onChange,
}: {
  dimension: DimensionDef;
  value: number | null;
  onChange: (v: number | null) => void;
}) {
  if (dimension.scaleType === "STAR") {
    const stars: number[] = [];
    for (let i = Math.ceil(dimension.minValue); i <= dimension.maxValue; i++) {
      stars.push(i);
    }
    return (
      <div className="flex items-center justify-between">
        <span className="font-medium">{dimension.name}</span>
        <div className="flex items-center gap-1">
          {stars.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onChange(value === s ? null : s)}
              aria-label={`${s} stars`}
            >
              <Star
                className={cn(
                  "size-6 transition-colors",
                  value != null && s <= value
                    ? "fill-primary text-primary"
                    : "text-muted-foreground/40",
                )}
              />
            </button>
          ))}
        </div>
      </div>
    );
  }

  const step = dimension.step ?? 0.1;
  const anchor = value != null ? nearestAnchor(dimension, value) : null;

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <span className="font-medium">{dimension.name}</span>
        <div className="flex items-baseline gap-2">
          {anchor ? (
            <span className="text-sm text-muted-foreground">{anchor.label}</span>
          ) : null}
          <span className="min-w-12 text-right text-xl font-semibold tabular-nums">
            {value != null ? formatScore(value) : "—"}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Slider
          min={dimension.minValue}
          max={dimension.maxValue}
          step={step}
          value={[value ?? dimension.minValue]}
          onValueChange={(v) => onChange(v[0])}
        />
        {value != null ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onChange(null)}
          >
            Clear
          </Button>
        ) : null}
      </div>
      {anchor?.description ? (
        <p className="mt-1 text-xs text-muted-foreground">{anchor.description}</p>
      ) : null}
    </div>
  );
}
