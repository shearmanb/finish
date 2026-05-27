"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Pencil, Archive, RotateCcw, Plus, ChevronRight } from "lucide-react";
import {
  createBottleType,
  updateBottleType,
  setBottleTypeArchived,
} from "@/lib/actions/lookups";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type TypeRow = {
  id: string;
  name: string;
  parentId: string | null;
  isArchived: boolean;
};

export function BottleTypeManager({ items }: { items: TypeRow[] }) {
  const router = useRouter();
  const [pending, start] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);

  // Add form
  const [addName, setAddName] = React.useState("");
  const [addParent, setAddParent] = React.useState("");

  // Edit state
  const [editing, setEditing] = React.useState<string | null>(null);
  const [editName, setEditName] = React.useState("");
  const [editParent, setEditParent] = React.useState("");

  const roots = items.filter((t) => t.parentId === null);
  const rootsActive = roots.filter((t) => !t.isArchived);
  const rootsArchived = roots.filter((t) => t.isArchived);

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
    if (!addName.trim()) return;
    run(async () => {
      const res = await createBottleType(addName, addParent || null);
      if (res.ok) { setAddName(""); setAddParent(""); }
      return res;
    });
  }

  function startEdit(row: TypeRow) {
    setEditing(row.id);
    setEditName(row.name);
    setEditParent(row.parentId ?? "");
  }

  function saveEdit(id: string) {
    run(async () => {
      const res = await updateBottleType(id, editName, editParent || null);
      if (res.ok) setEditing(null);
      return res;
    });
  }

  function renderRow(row: TypeRow, indent = false) {
    const children = items.filter((t) => t.parentId === row.id && !t.isArchived);
    return (
      <div key={row.id}>
        <Card className={`flex items-center gap-2 p-2.5 ${indent ? "ml-5" : ""}`}>
          {indent ? <ChevronRight className="size-3 shrink-0 text-muted-foreground" /> : null}
          {editing === row.id ? (
            <>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="flex-1"
                autoFocus
              />
              <Select value={editParent} onValueChange={setEditParent}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Root type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Root type</SelectItem>
                  {rootsActive.filter((r) => r.id !== row.id).map((r) => (
                    <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button size="sm" onClick={() => saveEdit(row.id)} disabled={pending}>
                Save
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setEditing(null)}>
                Cancel
              </Button>
            </>
          ) : (
            <>
              <span className="flex-1 pl-1 font-medium">{row.name}</span>
              <Button size="icon" variant="ghost" onClick={() => startEdit(row)}>
                <Pencil className="size-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                disabled={pending}
                onClick={() => run(() => setBottleTypeArchived(row.id, true))}
              >
                <Archive className="size-4" />
              </Button>
            </>
          )}
        </Card>
        {children.length > 0 && (
          <div className="mt-1 space-y-1">
            {children.map((child) => renderRow(child, true))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Card className="p-4">
        <form onSubmit={add} className="flex flex-wrap items-end gap-2">
          <div className="min-w-40 flex-1">
            <Input
              placeholder="Add type…"
              value={addName}
              onChange={(e) => setAddName(e.target.value)}
            />
          </div>
          <Select value={addParent} onValueChange={setAddParent}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Root type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Root type</SelectItem>
              {rootsActive.map((r) => (
                <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="submit" disabled={pending || !addName.trim()}>
            <Plus className="size-4" /> Add
          </Button>
        </form>
        {error ? <p className="mt-2 text-sm text-destructive">{error}</p> : null}
      </Card>

      <div className="space-y-1.5">
        {rootsActive.map((row) => renderRow(row))}
        {rootsActive.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No types yet — add one above.
          </p>
        ) : null}
      </div>

      {rootsArchived.length > 0 ? (
        <div>
          <p className="mb-2 mt-6 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Archived
          </p>
          <div className="space-y-1.5">
            {rootsArchived.map((row) => (
              <Card key={row.id} className="flex items-center gap-2 p-2.5 opacity-60">
                <span className="flex-1 pl-1">{row.name}</span>
                <Badge variant="muted">Hidden</Badge>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={pending}
                  onClick={() => run(() => setBottleTypeArchived(row.id, false))}
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
