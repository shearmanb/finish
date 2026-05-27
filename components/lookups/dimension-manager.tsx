"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowUp, ArrowDown, Pencil, Archive, RotateCcw } from "lucide-react";
import {
  createDimension,
  updateDimension,
  setDimensionArchived,
  moveDimension,
} from "@/lib/actions/lookups";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Anchor = { value: number; label: string; description: string | null };
type Dimension = {
  id: string;
  name: string;
  scaleType: "NUMERIC" | "STAR";
  minValue: number;
  maxValue: number;
  step: number | null;
  isArchived: boolean;
  anchors: Anchor[];
};

type FormValue = {
  name: string;
  scaleType: "NUMERIC" | "STAR";
  minValue: string;
  maxValue: string;
  step: string;
};

const EMPTY: FormValue = {
  name: "",
  scaleType: "NUMERIC",
  minValue: "0",
  maxValue: "10",
  step: "",
};

function DimensionForm({
  value,
  onChange,
  onSubmit,
  onCancel,
  pending,
  submitLabel,
}: {
  value: FormValue;
  onChange: (v: FormValue) => void;
  onSubmit: () => void;
  onCancel?: () => void;
  pending: boolean;
  submitLabel: string;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <Label>Name</Label>
        <Input
          className="mt-1"
          value={value.name}
          onChange={(e) => onChange({ ...value, name: e.target.value })}
          placeholder="e.g. Overall"
        />
      </div>
      <div>
        <Label>Scale type</Label>
        <Select
          value={value.scaleType}
          onValueChange={(v) => onChange({ ...value, scaleType: v as "NUMERIC" | "STAR" })}
        >
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="NUMERIC">Numeric</SelectItem>
            <SelectItem value="STAR">Stars</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div>
          <Label>Min</Label>
          <Input
            className="mt-1"
            inputMode="decimal"
            value={value.minValue}
            onChange={(e) => onChange({ ...value, minValue: e.target.value })}
          />
        </div>
        <div>
          <Label>Max</Label>
          <Input
            className="mt-1"
            inputMode="decimal"
            value={value.maxValue}
            onChange={(e) => onChange({ ...value, maxValue: e.target.value })}
          />
        </div>
        <div>
          <Label>Step</Label>
          <Input
            className="mt-1"
            inputMode="decimal"
            placeholder="any"
            value={value.step}
            onChange={(e) => onChange({ ...value, step: e.target.value })}
          />
        </div>
      </div>
      <div className="flex gap-2 sm:col-span-2">
        <Button onClick={onSubmit} disabled={pending}>
          {submitLabel}
        </Button>
        {onCancel ? (
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function parseForm(v: FormValue) {
  return {
    name: v.name,
    scaleType: v.scaleType,
    minValue: Number(v.minValue),
    maxValue: Number(v.maxValue),
    step: v.step.trim() === "" ? null : Number(v.step),
  };
}

export function DimensionManager({ dimensions }: { dimensions: Dimension[] }) {
  const router = useRouter();
  const [pending, start] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);
  const [adding, setAdding] = React.useState(false);
  const [addForm, setAddForm] = React.useState<FormValue>(EMPTY);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editForm, setEditForm] = React.useState<FormValue>(EMPTY);

  const active = dimensions.filter((d) => !d.isArchived);
  const archived = dimensions.filter((d) => d.isArchived);

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
      {adding ? (
        <Card className="p-4">
          <DimensionForm
            value={addForm}
            onChange={setAddForm}
            pending={pending}
            submitLabel="Create dimension"
            onCancel={() => {
              setAdding(false);
              setAddForm(EMPTY);
            }}
            onSubmit={() =>
              run(async () => {
                const res = await createDimension(parseForm(addForm));
                if (res.ok) {
                  setAdding(false);
                  setAddForm(EMPTY);
                }
                return res;
              })
            }
          />
        </Card>
      ) : (
        <Button onClick={() => setAdding(true)}>+ New dimension</Button>
      )}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="space-y-2">
        {active.map((d, i) => (
          <Card key={d.id} className="p-4">
            {editingId === d.id ? (
              <DimensionForm
                value={editForm}
                onChange={setEditForm}
                pending={pending}
                submitLabel="Save"
                onCancel={() => setEditingId(null)}
                onSubmit={() =>
                  run(async () => {
                    const res = await updateDimension(d.id, parseForm(editForm));
                    if (res.ok) setEditingId(null);
                    return res;
                  })
                }
              />
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{d.name}</span>
                  <Badge variant="secondary">
                    {d.scaleType === "STAR" ? "★ stars" : "numeric"}
                  </Badge>
                  <Badge variant="muted">
                    {d.minValue}–{d.maxValue}
                    {d.step ? ` · step ${d.step}` : " · any decimal"}
                  </Badge>
                  <div className="ml-auto flex">
                    <Button
                      size="icon"
                      variant="ghost"
                      disabled={pending || i === 0}
                      onClick={() => run(() => moveDimension(d.id, "up"))}
                      aria-label="Move up"
                    >
                      <ArrowUp className="size-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      disabled={pending || i === active.length - 1}
                      onClick={() => run(() => moveDimension(d.id, "down"))}
                      aria-label="Move down"
                    >
                      <ArrowDown className="size-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        setEditingId(d.id);
                        setEditForm({
                          name: d.name,
                          scaleType: d.scaleType,
                          minValue: String(d.minValue),
                          maxValue: String(d.maxValue),
                          step: d.step === null ? "" : String(d.step),
                        });
                      }}
                      aria-label="Edit"
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      disabled={pending}
                      onClick={() => run(() => setDimensionArchived(d.id, true))}
                      aria-label="Archive"
                    >
                      <Archive className="size-4" />
                    </Button>
                  </div>
                </div>
                {d.anchors.length > 0 ? (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Labels:{" "}
                    {d.anchors
                      .map((a) => `${a.value} ${a.label}`)
                      .join(" · ")}
                  </p>
                ) : null}
              </>
            )}
          </Card>
        ))}
      </div>

      {archived.length > 0 ? (
        <div>
          <p className="mb-2 mt-6 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Archived
          </p>
          <div className="space-y-1.5">
            {archived.map((d) => (
              <Card key={d.id} className="flex items-center gap-2 p-2.5 opacity-60">
                <span className="flex-1 pl-1">{d.name}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={pending}
                  onClick={() => run(() => setDimensionArchived(d.id, false))}
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
