"use client";

import * as React from "react";
import { Check } from "lucide-react";
import type { FlavorCategoryDef } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function FlavorPicker({
  categories,
  selected,
  onToggle,
}: {
  categories: FlavorCategoryDef[];
  selected: Set<string>;
  onToggle: (flavorId: string) => void;
}) {
  const [query, setQuery] = React.useState("");
  const q = query.trim().toLowerCase();

  const groups = categories
    .map((c) => ({
      ...c,
      flavors: q
        ? c.flavors.filter((f) => f.name.toLowerCase().includes(q))
        : c.flavors,
    }))
    .filter((c) => c.flavors.length > 0);

  return (
    <div>
      <Input
        placeholder="Search flavors…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="mb-3"
      />
      <div className="space-y-3">
        {groups.map((c) => (
          <div key={c.id}>
            <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {c.name}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {c.flavors.map((f) => {
                const on = selected.has(f.id);
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => onToggle(f.id)}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm transition-colors",
                      on
                        ? "border-primary bg-primary/12 text-primary"
                        : "border-border hover:bg-accent",
                    )}
                  >
                    {on ? <Check className="size-3.5" /> : null}
                    {f.name}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        {groups.length === 0 ? (
          <p className="text-sm text-muted-foreground">No matching flavors.</p>
        ) : null}
      </div>
    </div>
  );
}
