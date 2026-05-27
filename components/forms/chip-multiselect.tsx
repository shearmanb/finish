"use client";

import { Check } from "lucide-react";
import type { LookupItem } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ChipMultiSelect({
  items,
  selected,
  onToggle,
}: {
  items: LookupItem[];
  selected: Set<string>;
  onToggle: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((it) => {
        const on = selected.has(it.id);
        return (
          <button
            key={it.id}
            type="button"
            onClick={() => onToggle(it.id)}
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm transition-colors",
              on
                ? "border-primary bg-primary/12 text-primary"
                : "border-border hover:bg-accent",
            )}
          >
            {on ? <Check className="size-3.5" /> : null}
            {it.name}
          </button>
        );
      })}
    </div>
  );
}
