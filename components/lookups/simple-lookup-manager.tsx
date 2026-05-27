"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowUp, ArrowDown, Pencil, Archive, RotateCcw, Plus } from "lucide-react";
import {
  createSimpleLookup,
  updateSimpleLookup,
  setLookupArchived,
  moveLookup,
} from "@/lib/actions/lookups";
import type { SimpleLookupKey, LookupRow } from "@/lib/data/lookups";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type ExtraField = { key: string; label: string; placeholder?: string };

export function SimpleLookupManager({
  lookupKey,
  extraField,
  items,
}: {
  lookupKey: SimpleLookupKey;
  extraField?: ExtraField;
  items: LookupRow[];
}) {
  const router = useRouter();
  const [pending, start] = React.useTransition();
  const [name, setName] = React.useState("");
  const [extra, setExtra] = React.useState("");
  const [editing, setEditing] = React.useState<string | null>(null);
  const [editName, setEditName] = React.useState("");
  const [editExtra, setEditExtra] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  const active = items.filter((i) => !i.isArchived);
  const archived = items.filter((i) => i.isArchived);

  function run(fn: () => Promise<{ ok: boolean; error?: string }>) {
    setError(null);
    start(async () => {
      const res = await fn();
      if (!res.ok) setError(res.error ?? "Something went wrong.");
      router.refresh();
    });
  }

  function add(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    run(async () => {
      const res = await createSimpleLookup(lookupKey, name, extra);
      if (res.ok) {
        setName("");
        setExtra("");
      }
      return res;
    });
  }

  function startEdit(row: LookupRow) {
    setEditing(row.id);
    setEditName(row.name);
    setEditExtra(row.region ?? "");
  }

  function saveEdit(id: string) {
    run(async () => {
      const res = await updateSimpleLookup(lookupKey, id, editName, editExtra);
      if (res.ok) setEditing(null);
      return res;
    });
  }

  return (
    <div className="space-y-5">
      <Card className="p-4">
        <form onSubmit={add} className="flex flex-wrap items-end gap-2">
          <div className="min-w-40 flex-1">
            <Input
              placeholder="Add new…"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          {extraField ? (
            <div className="min-w-32 flex-1">
              <Input
                placeholder={extraField.placeholder ?? extraField.label}
                value={extra}
                onChange={(e) => setExtra(e.target.value)}
              />
            </div>
          ) : null}
          <Button type="submit" disabled={pending || !name.trim()}>
            <Plus className="size-4" /> Add
          </Button>
        </form>
        {error ? <p className="mt-2 text-sm text-destructive">{error}</p> : null}
      </Card>

      <div className="space-y-1.5">
        {active.map((row, i) => (
          <Card key={row.id} className="flex items-center gap-2 p-2.5">
            {editing === row.id ? (
              <>
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="flex-1"
                  autoFocus
                />
                {extraField ? (
                  <Input
                    value={editExtra}
                    onChange={(e) => setEditExtra(e.target.value)}
                    placeholder={extraField.label}
                    className="w-36"
                  />
                ) : null}
                <Button size="sm" onClick={() => saveEdit(row.id)} disabled={pending}>
                  Save
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setEditing(null)}>
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <div className="flex flex-1 items-center gap-2 pl-1">
                  <span className="font-medium">{row.name}</span>
                  {row.region ? (
                    <span className="text-sm text-muted-foreground">{row.region}</span>
                  ) : null}
                </div>
                <div className="flex items-center">
                  <Button
                    size="icon"
                    variant="ghost"
                    disabled={pending || i === 0}
                    onClick={() => run(() => moveLookup(lookupKey, row.id, "up"))}
                    aria-label="Move up"
                  >
                    <ArrowUp className="size-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    disabled={pending || i === active.length - 1}
                    onClick={() => run(() => moveLookup(lookupKey, row.id, "down"))}
                    aria-label="Move down"
                  >
                    <ArrowDown className="size-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => startEdit(row)}
                    aria-label="Edit"
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    disabled={pending}
                    onClick={() => run(() => setLookupArchived(lookupKey, row.id, true))}
                    aria-label="Archive"
                  >
                    <Archive className="size-4" />
                  </Button>
                </div>
              </>
            )}
          </Card>
        ))}
        {active.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Nothing yet — add your first above.
          </p>
        ) : null}
      </div>

      {archived.length > 0 ? (
        <div>
          <p className="mb-2 mt-6 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Archived
          </p>
          <div className="space-y-1.5">
            {archived.map((row) => (
              <Card
                key={row.id}
                className="flex items-center gap-2 p-2.5 opacity-60"
              >
                <span className="flex-1 pl-1">{row.name}</span>
                <Badge variant="muted">Hidden</Badge>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={pending}
                  onClick={() => run(() => setLookupArchived(lookupKey, row.id, false))}
                >
                  <RotateCcw className="size-4" /> Restore
                </Button>
              </Card>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
