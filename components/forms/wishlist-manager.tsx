"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, Check, Trash2 } from "lucide-react";
import {
  createWishlistItem,
  setWishlistAcquired,
  archiveWishlistItem,
} from "@/lib/actions/wishlist";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatMoney, cn } from "@/lib/utils";

type Item = {
  id: string;
  name: string;
  targetPrice: string | null;
  notes: string | null;
  acquired: boolean;
};

export function WishlistManager({ items }: { items: Item[] }) {
  const router = useRouter();
  const [pending, start] = React.useTransition();
  const [name, setName] = React.useState("");
  const [price, setPrice] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  function run(fn: () => Promise<{ ok: boolean; error?: string }>) {
    setError(null);
    start(async () => {
      const res = await fn();
      if (!res.ok) setError(res.error ?? "Something went wrong.");
      router.refresh();
    });
  }

  function add() {
    if (!name.trim()) return;
    run(async () => {
      const res = await createWishlistItem({
        name,
        targetPrice: price.trim() === "" ? null : Number(price),
        notes: null,
      });
      if (res.ok) {
        setName("");
        setPrice("");
      }
      return res;
    });
  }

  return (
    <div className="space-y-5">
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap items-end gap-2">
            <Input
              placeholder="Bottle you're hunting…"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && add()}
              className="min-w-44 flex-1"
            />
            <Input
              placeholder="Target $"
              inputMode="decimal"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-28"
            />
            <Button onClick={add} disabled={pending || !name.trim()}>
              <Plus className="size-4" /> Add
            </Button>
          </div>
          {error ? <p className="mt-2 text-sm text-destructive">{error}</p> : null}
        </CardContent>
      </Card>

      <div className="space-y-2">
        {items.map((it) => (
          <Card
            key={it.id}
            className={cn("flex items-center gap-3 p-3", it.acquired && "opacity-60")}
          >
            <button
              type="button"
              disabled={pending}
              onClick={() => run(() => setWishlistAcquired(it.id, !it.acquired))}
              className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-full border transition-colors",
                it.acquired
                  ? "border-success bg-success/15 text-success"
                  : "border-border text-transparent hover:text-muted-foreground",
              )}
              aria-label="Toggle acquired"
            >
              <Check className="size-4" />
            </button>
            <div className="min-w-0 flex-1">
              <div className={cn("font-medium", it.acquired && "line-through")}>
                {it.name}
              </div>
              {it.notes ? (
                <div className="text-sm text-muted-foreground">{it.notes}</div>
              ) : null}
            </div>
            {it.targetPrice ? (
              <Badge variant="muted">{formatMoney(it.targetPrice)}</Badge>
            ) : null}
            <Button
              size="icon"
              variant="ghost"
              disabled={pending}
              onClick={() => run(() => archiveWishlistItem(it.id))}
              aria-label="Remove"
            >
              <Trash2 className="size-4" />
            </Button>
          </Card>
        ))}
        {items.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Nothing on your wishlist yet.
          </p>
        ) : null}
      </div>
    </div>
  );
}
