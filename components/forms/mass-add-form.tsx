"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import type { BottleStatus } from "@prisma/client";
import { createBottlesBatch } from "@/lib/actions/bottles";
import type { BottleInput } from "@/lib/data/bottles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type LineOption = {
  id: string;
  name: string;
  distilleryId: string;
  distilleryName: string;
};
type DistilleryOption = { id: string; name: string };
type StoreOption = { id: string; name: string };

type MassAddFormProps = {
  lines: LineOption[];
  distilleries: DistilleryOption[];
  stores: StoreOption[];
  defaultDistilleryId?: string;
  defaultLineId?: string;
};

type RowState = {
  id: string;
  lineId: string;
  name: string;
  proof: string;
  ageStatement: string;
  release: string;
  status: BottleStatus;
  purchaseDate: string;
  storeId: string;
  pricePaid: string;
};

const NONE = "__none__";

const STATUSES: { value: BottleStatus; label: string }[] = [
  { value: "SEALED", label: "Sealed" },
  { value: "OPEN", label: "Open" },
  { value: "FINISHED", label: "Finished" },
];

const AGE_OPTIONS = [
  "NAS",
  ...Array.from({ length: 29 }, (_, i) => String(i + 2)),
  "30+",
];

function ageLabel(v: string) {
  if (v === "NAS") return "NAS (Not Age Stated)";
  if (v === "30+") return "30+ years";
  return `${v} year${v === "1" ? "" : "s"}`;
}

function makeRow(): RowState {
  return {
    id: crypto.randomUUID(),
    lineId: "",
    name: "",
    proof: "",
    ageStatement: "",
    release: "",
    status: "SEALED",
    purchaseDate: "",
    storeId: "",
    pricePaid: "",
  };
}

type BottleRowProps = {
  row: RowState;
  lineOptions: LineOption[];
  storeOptions: StoreOption[];
  showLineColumn: boolean;
  onChange: (patch: Partial<RowState>) => void;
  onDelete: () => void;
  canDelete: boolean;
};

function BottleRow({
  row,
  lineOptions,
  storeOptions,
  showLineColumn,
  onChange,
  onDelete,
  canDelete,
}: BottleRowProps) {
  return (
    <tr className="border-b border-border last:border-0">
      {showLineColumn && (
        <td className="py-1.5 pr-2 min-w-[160px]">
          <Select
            value={row.lineId || NONE}
            onValueChange={(v) => onChange({ lineId: v === NONE ? "" : v })}
          >
            <SelectTrigger className="h-9 text-xs">
              <SelectValue placeholder="Pick line…" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE}>—</SelectItem>
              {lineOptions.map((l) => (
                <SelectItem key={l.id} value={l.id}>
                  {l.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </td>
      )}
      <td className="py-1.5 pr-2 min-w-[140px]">
        <Input
          className="h-9 text-xs"
          value={row.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="Name"
        />
      </td>
      <td className="py-1.5 pr-2 w-20">
        <Input
          className="h-9 text-xs"
          type="number"
          min="0"
          step="0.1"
          value={row.proof}
          onChange={(e) => onChange({ proof: e.target.value })}
          placeholder="Proof"
        />
      </td>
      <td className="py-1.5 pr-2 min-w-[130px]">
        <Select
          value={row.ageStatement || NONE}
          onValueChange={(v) =>
            onChange({ ageStatement: v === NONE ? "" : v })
          }
        >
          <SelectTrigger className="h-9 text-xs">
            <SelectValue placeholder="Age" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NONE}>—</SelectItem>
            {AGE_OPTIONS.map((a) => (
              <SelectItem key={a} value={a}>
                {ageLabel(a)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </td>
      <td className="py-1.5 pr-2 min-w-[120px]">
        <Input
          className="h-9 text-xs"
          value={row.release}
          onChange={(e) => onChange({ release: e.target.value })}
          placeholder="Release"
        />
      </td>
      <td className="py-1.5 pr-2 min-w-[105px]">
        <Select
          value={row.status}
          onValueChange={(v) => onChange({ status: v as BottleStatus })}
        >
          <SelectTrigger className="h-9 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUSES.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </td>
      <td className="py-1.5 pr-2 w-36">
        <Input
          className="h-9 text-xs"
          type="date"
          value={row.purchaseDate}
          onChange={(e) => onChange({ purchaseDate: e.target.value })}
        />
      </td>
      <td className="py-1.5 pr-2 w-24">
        <Input
          className="h-9 text-xs"
          type="number"
          min="0"
          step="0.01"
          value={row.pricePaid}
          onChange={(e) => onChange({ pricePaid: e.target.value })}
          placeholder="$0.00"
        />
      </td>
      <td className="py-1.5 pr-2 min-w-[130px]">
        <Select
          value={row.storeId || NONE}
          onValueChange={(v) => onChange({ storeId: v === NONE ? "" : v })}
        >
          <SelectTrigger className="h-9 text-xs">
            <SelectValue placeholder="Store" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NONE}>—</SelectItem>
            {storeOptions.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </td>
      <td className="py-1.5 w-10">
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={onDelete}
          disabled={!canDelete}
          className="size-8 text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="size-4" />
        </Button>
      </td>
    </tr>
  );
}

export function MassAddForm({
  lines,
  distilleries,
  stores,
  defaultDistilleryId,
  defaultLineId,
}: MassAddFormProps) {
  const router = useRouter();
  const [distilleryId, setDistilleryId] = React.useState(
    defaultDistilleryId ?? "",
  );
  const [lockedLineId, setLockedLineId] = React.useState(
    defaultLineId ?? "",
  );
  const [rows, setRows] = React.useState<RowState[]>([makeRow()]);
  const [pending, start] = React.useTransition();
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const linesForDistillery = React.useMemo(
    () => lines.filter((l) => l.distilleryId === distilleryId),
    [lines, distilleryId],
  );

  const lineIsLocked = Boolean(distilleryId && lockedLineId);

  const validRowCount = rows.filter((r) =>
    lineIsLocked ? true : Boolean(r.lineId),
  ).length;

  const canSubmit = Boolean(distilleryId) && validRowCount >= 1 && !pending;

  function handleDistilleryChange(newId: string) {
    setDistilleryId(newId);
    setLockedLineId("");
    setRows((prev) => prev.map((r) => ({ ...r, lineId: "" })));
  }

  function updateRow(id: string, patch: Partial<RowState>) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function deleteRow(id: string) {
    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  function addRow() {
    setRows((prev) => [...prev, makeRow()]);
  }

  function submit() {
    setSubmitError(null);
    const inputs: BottleInput[] = rows.map((r) => ({
      lineId: lockedLineId || r.lineId,
      name: r.name || null,
      proof: r.proof.trim() === "" ? null : Number(r.proof),
      ageStatement: r.ageStatement || null,
      release: r.release || null,
      status: r.status,
      purchaseDate: r.purchaseDate || null,
      storeId: r.storeId || null,
      pricePaid: r.pricePaid.trim() === "" ? null : Number(r.pricePaid),
      ndpDistilleryId: null,
      singleBarrel: false,
      caskStrength: false,
      typeId: null,
      subTypeId: null,
      mashBillId: null,
      t8kePick: false,
      bottleNumber: null,
      barrelNumber: null,
      hasBarrelFinish: false,
      finishTypeId: null,
      producerNotes: null,
      websiteNotes: null,
      distilledDate: null,
      fillLevel: null,
      msrp: null,
      storageLocation: null,
      notes: null,
    }));

    start(async () => {
      const results = await createBottlesBatch(inputs);
      const failed = results.filter((r) => !r.ok);
      if (failed.length > 0) {
        setSubmitError(
          `${failed.length} row(s) failed — check that every row has a line selected.`,
        );
        return;
      }
      router.push("/bottles");
    });
  }

  return (
    <Card>
      <CardContent className="pt-6">
        {/* Scope selectors */}
        <div className="mb-6 flex flex-wrap gap-4 items-end">
          <div className="min-w-[200px]">
            <Label className="mb-1.5 block">Distillery</Label>
            <Select value={distilleryId || NONE} onValueChange={(v) => handleDistilleryChange(v === NONE ? "" : v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select distillery…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>— select —</SelectItem>
                {distilleries.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {distilleryId && (
            <div className="min-w-[200px]">
              <Label className="mb-1.5 block">
                Line{" "}
                <span className="text-muted-foreground font-normal">
                  (optional — locks all rows)
                </span>
              </Label>
              <Select
                value={lockedLineId || NONE}
                onValueChange={(v) =>
                  setLockedLineId(v === NONE ? "" : v)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="— pick per row —" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>— pick per row —</SelectItem>
                  {linesForDistillery.map((l) => (
                    <SelectItem key={l.id} value={l.id}>
                      {l.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Row table */}
        {distilleryId && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  {!lineIsLocked && <th className="pb-2 pr-2 font-medium">Line</th>}
                  <th className="pb-2 pr-2 font-medium">Name</th>
                  <th className="pb-2 pr-2 font-medium">Proof</th>
                  <th className="pb-2 pr-2 font-medium">Age</th>
                  <th className="pb-2 pr-2 font-medium">Release</th>
                  <th className="pb-2 pr-2 font-medium">Status</th>
                  <th className="pb-2 pr-2 font-medium">Purchase Date</th>
                  <th className="pb-2 pr-2 font-medium">Price Paid</th>
                  <th className="pb-2 pr-2 font-medium">Store</th>
                  <th className="pb-2 w-10" />
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <BottleRow
                    key={row.id}
                    row={row}
                    lineOptions={linesForDistillery}
                    storeOptions={stores}
                    showLineColumn={!lineIsLocked}
                    onChange={(patch) => updateRow(row.id, patch)}
                    onDelete={() => deleteRow(row.id)}
                    canDelete={rows.length > 1}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        {distilleryId && (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addRow}
              disabled={pending}
            >
              <Plus className="size-4" /> Add row
            </Button>
            {submitError && (
              <p className="text-sm text-destructive">{submitError}</p>
            )}
            <Button
              className="ml-auto"
              onClick={submit}
              disabled={!canSubmit}
              size="lg"
            >
              {pending
                ? "Adding…"
                : `Add ${validRowCount} bottle${validRowCount === 1 ? "" : "s"}`}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
