"use client";

import * as React from "react";
import { Search, Link2, X, Loader2 } from "lucide-react";
import {
  searchCellarBottles,
  linkCellarBottle,
  type CellarHit,
  type CellarPrefill,
} from "@/lib/actions/cellar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

// "Source from Cellar": search the centralized catalog and link a bottle so its
// identity (name, line, distillery, type, MSRP) is filled from Cellar.
export function CellarPicker({
  linked,
  onApply,
  onUnlink,
}: {
  linked: { id: number; label: string } | null;
  onApply: (prefill: CellarPrefill) => void;
  onUnlink: () => void;
}) {
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<CellarHit[] | null>(null);
  const [searching, startSearch] = React.useTransition();
  const [linkingId, setLinkingId] = React.useState<number | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  function runSearch(q: string) {
    setError(null);
    startSearch(async () => {
      const res = await searchCellarBottles(q);
      if (!res.ok) {
        setError(res.error ?? "Couldn't reach Cellar.");
        setResults([]);
        return;
      }
      setResults(res.bottles ?? []);
    });
  }

  async function pick(id: number) {
    setError(null);
    setLinkingId(id);
    const res = await linkCellarBottle(id);
    setLinkingId(null);
    if (!res.ok || !res.prefill) {
      setError(res.error ?? "Couldn't link that bottle.");
      return;
    }
    onApply(res.prefill);
    setQuery("");
    setResults(null);
  }

  if (linked) {
    return (
      <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <Link2 className="size-4 shrink-0 text-primary" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{linked.label}</p>
              <p className="text-xs text-muted-foreground">
                Linked to Cellar #{linked.id}
              </p>
            </div>
          </div>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={onUnlink}
            title="Unlink from Cellar"
          >
            <X className="size-4" /> Unlink
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border p-3">
      <Label className="text-xs text-muted-foreground">
        Source identity from Cellar (optional)
      </Label>
      <div className="mt-1 flex items-center gap-1">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              runSearch(query);
            }
          }}
          placeholder="Search the catalog — name, brand, distillery, shortcode"
          className="flex-1"
        />
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={() => runSearch(query)}
          disabled={searching}
          title="Search Cellar"
        >
          {searching ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Search className="size-4" />
          )}
        </Button>
      </div>

      {error ? <p className="mt-2 text-xs text-destructive">{error}</p> : null}

      {results && !error ? (
        results.length === 0 ? (
          <p className="mt-2 text-xs text-muted-foreground">No matches in Cellar.</p>
        ) : (
          <ul className="mt-2 max-h-64 space-y-1 overflow-y-auto">
            {results.map((b) => (
              <li key={b.id}>
                <button
                  type="button"
                  onClick={() => pick(b.id)}
                  disabled={linkingId !== null}
                  className="flex w-full items-center justify-between gap-2 rounded-md border border-border p-2 text-left text-sm transition-colors hover:bg-accent disabled:opacity-50"
                >
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{b.name}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {b.brand}
                      {b.distillery ? ` · ${b.distillery}` : ""}
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-1">
                    {b.tier ? <Badge variant="muted">{b.tier}</Badge> : null}
                    {linkingId === b.id ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : null}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )
      ) : null}

      <p className="mt-2 text-xs text-muted-foreground">
        Picks fill the line, distillery, type, and MSRP from the shared catalog.
      </p>
    </div>
  );
}
