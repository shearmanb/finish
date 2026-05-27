"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, Archive, RotateCcw, Pencil, X } from "lucide-react";
import {
  createCategory,
  updateCategory,
  setCategoryArchived,
  createFlavor,
  setFlavorArchived,
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

type Flavor = { id: string; name: string; isArchived: boolean };
type Category = {
  id: string;
  name: string;
  parentId: string | null;
  isArchived: boolean;
  flavors: Flavor[];
};

export function FlavorManager({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [pending, start] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);

  const [catName, setCatName] = React.useState("");
  const [catParent, setCatParent] = React.useState<string>("none");
  const [flavorInputs, setFlavorInputs] = React.useState<Record<string, string>>({});
  const [editingCat, setEditingCat] = React.useState<string | null>(null);
  const [editCatName, setEditCatName] = React.useState("");
  const [editCatParent, setEditCatParent] = React.useState<string>("none");

  const active = categories.filter((c) => !c.isArchived);
  const archived = categories.filter((c) => c.isArchived);
  const nameById = new Map(categories.map((c) => [c.id, c.name]));

  function run(fn: () => Promise<{ ok: boolean; error?: string }>) {
    setError(null);
    start(async () => {
      const res = await fn();
      if (!res.ok) setError(res.error ?? "Something went wrong.");
      router.refresh();
    });
  }

  return (
    <div className="space-y-5">
      <Card className="p-4">
        <p className="mb-2 text-sm font-medium">New category</p>
        <div className="flex flex-wrap items-end gap-2">
          <Input
            placeholder="Category name…"
            value={catName}
            onChange={(e) => setCatName(e.target.value)}
            className="min-w-40 flex-1"
          />
          <Select value={catParent} onValueChange={setCatParent}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Parent (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No parent (top level)</SelectItem>
              {active.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            disabled={pending || !catName.trim()}
            onClick={() =>
              run(async () => {
                const res = await createCategory(
                  catName,
                  catParent === "none" ? null : catParent,
                );
                if (res.ok) {
                  setCatName("");
                  setCatParent("none");
                }
                return res;
              })
            }
          >
            <Plus className="size-4" /> Add
          </Button>
        </div>
        {error ? <p className="mt-2 text-sm text-destructive">{error}</p> : null}
      </Card>

      <div className="space-y-3">
        {active.map((cat) => (
          <Card key={cat.id} className="p-4">
            {editingCat === cat.id ? (
              <div className="mb-3 flex flex-wrap items-end gap-2">
                <Input
                  value={editCatName}
                  onChange={(e) => setEditCatName(e.target.value)}
                  className="min-w-40 flex-1"
                  autoFocus
                />
                <Select value={editCatParent} onValueChange={setEditCatParent}>
                  <SelectTrigger className="w-44">
                    <SelectValue placeholder="Parent" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No parent (top level)</SelectItem>
                    {active
                      .filter((c) => c.id !== cat.id)
                      .map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  disabled={pending}
                  onClick={() =>
                    run(async () => {
                      const res = await updateCategory(
                        cat.id,
                        editCatName,
                        editCatParent === "none" ? null : editCatParent,
                      );
                      if (res.ok) setEditingCat(null);
                      return res;
                    })
                  }
                >
                  Save
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setEditingCat(null)}>
                  Cancel
                </Button>
              </div>
            ) : (
              <div className="mb-3 flex items-center gap-2">
                <span className="font-semibold">{cat.name}</span>
                {cat.parentId ? (
                  <Badge variant="muted">
                    under {nameById.get(cat.parentId) ?? "—"}
                  </Badge>
                ) : null}
                <div className="ml-auto flex">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      setEditingCat(cat.id);
                      setEditCatName(cat.name);
                      setEditCatParent(cat.parentId ?? "none");
                    }}
                    aria-label="Edit category"
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    disabled={pending}
                    onClick={() => run(() => setCategoryArchived(cat.id, true))}
                    aria-label="Archive category"
                  >
                    <Archive className="size-4" />
                  </Button>
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-1.5">
              {cat.flavors
                .filter((f) => !f.isArchived)
                .map((f) => (
                  <span
                    key={f.id}
                    className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-sm"
                  >
                    {f.name}
                    <button
                      type="button"
                      className="text-muted-foreground hover:text-destructive"
                      disabled={pending}
                      onClick={() => run(() => setFlavorArchived(f.id, true))}
                      aria-label={`Archive ${f.name}`}
                    >
                      <X className="size-3.5" />
                    </button>
                  </span>
                ))}
            </div>

            <div className="mt-3 flex gap-2">
              <Input
                placeholder="Add flavor…"
                value={flavorInputs[cat.id] ?? ""}
                onChange={(e) =>
                  setFlavorInputs((s) => ({ ...s, [cat.id]: e.target.value }))
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const val = flavorInputs[cat.id] ?? "";
                    if (val.trim())
                      run(async () => {
                        const res = await createFlavor(cat.id, val);
                        if (res.ok)
                          setFlavorInputs((s) => ({ ...s, [cat.id]: "" }));
                        return res;
                      });
                  }
                }}
                className="h-9"
              />
              <Button
                size="sm"
                variant="secondary"
                disabled={pending || !(flavorInputs[cat.id] ?? "").trim()}
                onClick={() =>
                  run(async () => {
                    const res = await createFlavor(cat.id, flavorInputs[cat.id] ?? "");
                    if (res.ok) setFlavorInputs((s) => ({ ...s, [cat.id]: "" }));
                    return res;
                  })
                }
              >
                <Plus className="size-4" />
              </Button>
            </div>

            {cat.flavors.some((f) => f.isArchived) ? (
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <span className="text-xs text-muted-foreground">Archived:</span>
                {cat.flavors
                  .filter((f) => f.isArchived)
                  .map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground hover:text-foreground"
                      disabled={pending}
                      onClick={() => run(() => setFlavorArchived(f.id, false))}
                    >
                      <RotateCcw className="size-3" /> {f.name}
                    </button>
                  ))}
              </div>
            ) : null}
          </Card>
        ))}
      </div>

      {archived.length > 0 ? (
        <div>
          <p className="mb-2 mt-6 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Archived categories
          </p>
          <div className="space-y-1.5">
            {archived.map((cat) => (
              <Card key={cat.id} className="flex items-center gap-2 p-2.5 opacity-60">
                <span className="flex-1 pl-1">{cat.name}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={pending}
                  onClick={() => run(() => setCategoryArchived(cat.id, false))}
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
