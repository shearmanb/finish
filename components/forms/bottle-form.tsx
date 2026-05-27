"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Check, X } from "lucide-react";
import type { BottleStatus } from "@prisma/client";
import { createBottle, updateBottle } from "@/lib/actions/bottles";
import { createStoreInline } from "@/lib/actions/lookups";
import type { BottleInput } from "@/lib/data/bottles";
import { AgeStatementPicker } from "@/components/forms/age-statement-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type LineOption = { id: string; name: string; distilleryName: string };
type StoreOption = { id: string; name: string };
type BottleTypeOption = { id: string; name: string; parentId: string | null };
type SimpleLookup = { id: string; name: string };

const STATUSES: { value: BottleStatus; label: string }[] = [
  { value: "SEALED", label: "Sealed" },
  { value: "OPEN", label: "Open" },
  { value: "FINISHED", label: "Finished" },
];

function numOrNull(s: string): number | null {
  return s.trim() === "" ? null : Number(s);
}

export function BottleForm({
  lines,
  stores: initialStores,
  bottleTypes,
  mashBillTypes,
  finishTypes,
  initial,
  bottleId,
  defaultLineId,
}: {
  lines: LineOption[];
  stores: StoreOption[];
  bottleTypes: BottleTypeOption[];
  mashBillTypes: SimpleLookup[];
  finishTypes: SimpleLookup[];
  initial?: Partial<BottleInput>;
  bottleId?: string;
  defaultLineId?: string;
}) {
  const router = useRouter();
  const [pending, start] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);

  // Derive the default bourbon type id from the list
  const defaultBourbonId = React.useMemo(
    () => bottleTypes.find((t) => t.name === "Bourbon" && t.parentId === null)?.id ?? "",
    [bottleTypes],
  );

  const [lineId, setLineId] = React.useState(initial?.lineId ?? defaultLineId ?? "");
  const [name, setName] = React.useState(initial?.name ?? "");
  const [proofVal, setProofVal] = React.useState(
    initial?.proof != null ? String(initial.proof) : "",
  );
  const [singleBarrel, setSingleBarrel] = React.useState(initial?.singleBarrel ?? false);
  const [caskStrength, setCaskStrength] = React.useState(initial?.caskStrength ?? false);
  const [t8kePick, setT8kePick] = React.useState(initial?.t8kePick ?? false);

  // Type & sub-type
  const [typeId, setTypeId] = React.useState(
    initial?.typeId ?? (bottleId ? "" : defaultBourbonId),
  );
  const [subTypeId, setSubTypeId] = React.useState(initial?.subTypeId ?? "");

  // Derived sub-types for selected parent type
  const subTypeOptions = bottleTypes.filter((t) => t.parentId === typeId);
  const parentTypes = bottleTypes.filter((t) => t.parentId === null);

  // When type changes, clear sub-type if it's no longer a valid child
  function handleTypeChange(v: string) {
    setTypeId(v);
    setSubTypeId("");
  }

  // Age statement
  const [ageStatement, setAgeStatement] = React.useState(initial?.ageStatement ?? "");

  // Mash bill
  const [mashBillId, setMashBillId] = React.useState(initial?.mashBillId ?? "");

  // Barrel finish
  const [hasBarrelFinish, setHasBarrelFinish] = React.useState(
    initial?.hasBarrelFinish ?? false,
  );
  const [finishTypeId, setFinishTypeId] = React.useState(initial?.finishTypeId ?? "");

  // Spec fields
  const [release, setRelease] = React.useState(initial?.release ?? "");
  const [bottleNumber, setBottleNumber] = React.useState(initial?.bottleNumber ?? "");
  const [barrelNumber, setBarrelNumber] = React.useState(initial?.barrelNumber ?? "");
  const [distilledDate, setDistilledDate] = React.useState(initial?.distilledDate ?? "");

  // Status
  const [status, setStatus] = React.useState<BottleStatus>(initial?.status ?? "SEALED");
  const [fillLevel, setFillLevel] = React.useState(
    initial?.fillLevel != null ? String(initial.fillLevel) : "",
  );

  // Purchase
  const [purchaseDate, setPurchaseDate] = React.useState(initial?.purchaseDate ?? "");
  const [stores, setStores] = React.useState<StoreOption[]>(initialStores);
  const [storeId, setStoreId] = React.useState(initial?.storeId ?? "");
  const [addingStore, setAddingStore] = React.useState(false);
  const [newStoreName, setNewStoreName] = React.useState("");
  const [storeError, setStoreError] = React.useState<string | null>(null);
  const [pricePaid, setPricePaid] = React.useState(
    initial?.pricePaid != null ? String(initial.pricePaid) : "",
  );
  const [msrp, setMsrp] = React.useState(
    initial?.msrp != null ? String(initial.msrp) : "",
  );

  // Notes
  const [storageLocation, setStorageLocation] = React.useState(
    initial?.storageLocation ?? "",
  );
  const [notes, setNotes] = React.useState(initial?.notes ?? "");
  const [producerNotes, setProducerNotes] = React.useState(initial?.producerNotes ?? "");
  const [websiteNotes, setWebsiteNotes] = React.useState(initial?.websiteNotes ?? "");

  const proofNum = proofVal.trim() === "" ? null : Number(proofVal);

  async function addStore() {
    if (!newStoreName.trim()) return;
    setStoreError(null);
    const res = await createStoreInline(newStoreName);
    if (!res.ok || !res.store) {
      setStoreError(res.error ?? "Failed to create store.");
      return;
    }
    setStores((prev) => [...prev, res.store!]);
    setStoreId(res.store.id);
    setAddingStore(false);
    setNewStoreName("");
  }

  function submit() {
    setError(null);
    const input: BottleInput = {
      lineId,
      name: name || null,
      proof: numOrNull(proofVal),
      singleBarrel,
      caskStrength,
      typeId: typeId || null,
      subTypeId: subTypeId || null,
      mashBillId: mashBillId || null,
      ageStatement: ageStatement || null,
      release: release || null,
      t8kePick,
      bottleNumber: bottleNumber || null,
      barrelNumber: barrelNumber || null,
      hasBarrelFinish,
      finishTypeId: finishTypeId || null,
      producerNotes: producerNotes || null,
      websiteNotes: websiteNotes || null,
      distilledDate: distilledDate || null,
      status,
      fillLevel: numOrNull(fillLevel),
      purchaseDate: purchaseDate || null,
      storeId: storeId || null,
      pricePaid: numOrNull(pricePaid),
      msrp: numOrNull(msrp),
      storageLocation: storageLocation || null,
      notes: notes || null,
    };
    start(async () => {
      const res = bottleId
        ? await updateBottle(bottleId, input)
        : await createBottle(input);
      if (res && !res.ok) setError(res.error ?? "Something went wrong.");
    });
  }

  return (
    <Card>
      <CardContent className="space-y-5 pt-5">

        {/* Line picker */}
        <div>
          <Label>Line</Label>
          {lines.length === 0 ? (
            <p className="mt-1 text-sm text-muted-foreground">
              No lines yet.{" "}
              <Link href="/lines/new" className="text-primary underline">
                Create one first
              </Link>
              .
            </p>
          ) : (
            <Select value={lineId} onValueChange={setLineId}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select line" />
              </SelectTrigger>
              <SelectContent>
                {lines.map((l) => (
                  <SelectItem key={l.id} value={l.id}>
                    {l.name} — {l.distilleryName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Bottle name */}
        <div>
          <Label htmlFor="bottleName">Bottle name (optional)</Label>
          <Input
            id="bottleName"
            className="mt-1"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Eagle Rare 10 Year, Single Barrel #1234"
          />
        </div>

        {/* Type & sub-type */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Type</Label>
            <Select value={typeId} onValueChange={handleTypeChange}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {parentTypes.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Sub-type</Label>
            <Select
              value={subTypeId}
              onValueChange={setSubTypeId}
              disabled={subTypeOptions.length === 0}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder={subTypeOptions.length ? "Select…" : "—"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {subTypeOptions.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Proof / ABV */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="proof">Proof</Label>
            <Input
              id="proof"
              className="mt-1"
              type="number"
              min="0"
              step="0.1"
              value={proofVal}
              onChange={(e) => setProofVal(e.target.value)}
              placeholder="e.g. 90"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              {proofNum != null && !Number.isNaN(proofNum)
                ? `${proofNum / 2}% ABV`
                : "ABV auto-calculated"}
            </p>
          </div>
          <div>
            <Label htmlFor="abv">ABV %</Label>
            <Input
              id="abv"
              className="mt-1"
              type="number"
              min="0"
              step="0.05"
              value={
                proofNum != null && !Number.isNaN(proofNum) ? String(proofNum / 2) : ""
              }
              onChange={(e) => {
                const v = e.target.value.trim();
                setProofVal(v === "" ? "" : String(Number(v) * 2));
              }}
              placeholder="e.g. 45"
            />
          </div>
        </div>

        {/* Flags */}
        <div className="space-y-2">
          <label className="flex items-center gap-3 rounded-lg border border-border p-3 text-sm">
            <Switch checked={singleBarrel} onCheckedChange={setSingleBarrel} />
            <span>Single barrel</span>
          </label>
          <label className="flex items-center gap-3 rounded-lg border border-border p-3 text-sm">
            <Switch checked={caskStrength} onCheckedChange={setCaskStrength} />
            <span>Cask strength / barrel proof</span>
          </label>
          <label className="flex items-center gap-3 rounded-lg border border-border p-3 text-sm">
            <Switch checked={t8kePick} onCheckedChange={setT8kePick} />
            <span>T8ke pick</span>
          </label>
        </div>

        {/* Age statement */}
        <div>
          <Label>Age statement</Label>
          <AgeStatementPicker value={ageStatement} onChange={setAgeStatement} />
        </div>

        {/* Mash bill */}
        <div>
          <Label>Mash bill</Label>
          <Select value={mashBillId} onValueChange={setMashBillId}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select mash bill…" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Unknown / not set</SelectItem>
              {mashBillTypes.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Barrel finish */}
        <div>
          <label className="flex items-center gap-3 rounded-lg border border-border p-3 text-sm">
            <Switch checked={hasBarrelFinish} onCheckedChange={(v) => {
              setHasBarrelFinish(v);
              if (!v) setFinishTypeId("");
            }} />
            <span>Barrel finish</span>
          </label>
          {hasBarrelFinish ? (
            <Select value={finishTypeId} onValueChange={setFinishTypeId}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select finish type…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Unknown finish type</SelectItem>
                {finishTypes.map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    {f.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : null}
        </div>

        {/* Release, bottle #, barrel # */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="release">Release</Label>
            <Input
              id="release"
              className="mt-1"
              value={release}
              onChange={(e) => setRelease(e.target.value)}
              placeholder="2024 BTAC, Spring…"
            />
          </div>
          <div>
            <Label htmlFor="bottleNumber">Bottle #</Label>
            <Input
              id="bottleNumber"
              className="mt-1"
              value={bottleNumber}
              onChange={(e) => setBottleNumber(e.target.value)}
              placeholder="1234 / 5000"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="barrelNumber">Barrel #</Label>
            <Input
              id="barrelNumber"
              className="mt-1"
              value={barrelNumber}
              onChange={(e) => setBarrelNumber(e.target.value)}
              placeholder="Optional barrel #"
            />
          </div>
          <div>
            <Label htmlFor="distilledDate">Distilled date</Label>
            <Input
              id="distilledDate"
              type="date"
              className="mt-1"
              value={distilledDate}
              onChange={(e) => setDistilledDate(e.target.value)}
            />
          </div>
        </div>

        {/* Status & fill */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Status</Label>
            <Select
              value={status}
              onValueChange={(v) => setStatus(v as BottleStatus)}
            >
              <SelectTrigger className="mt-1">
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
          </div>
          <div>
            <Label htmlFor="fill">Fill level (%)</Label>
            <Input
              id="fill"
              className="mt-1"
              type="number"
              min="0"
              max="100"
              value={fillLevel}
              onChange={(e) => setFillLevel(e.target.value)}
              placeholder="100"
            />
          </div>
        </div>

        {/* Purchase details */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="purchaseDate">Date bought</Label>
            <Input
              id="purchaseDate"
              type="date"
              className="mt-1"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
            />
          </div>
          <div>
            <Label>Store</Label>
            {addingStore ? (
              <div className="mt-1 flex items-center gap-1">
                <Input
                  autoFocus
                  value={newStoreName}
                  onChange={(e) => setNewStoreName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addStore(); } }}
                  placeholder="Store name"
                  className="flex-1"
                />
                <Button type="button" size="icon" variant="ghost" onClick={addStore}>
                  <Check className="size-4" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => { setAddingStore(false); setNewStoreName(""); setStoreError(null); }}
                >
                  <X className="size-4" />
                </Button>
              </div>
            ) : (
              <div className="mt-1 flex items-center gap-1">
                <Select value={storeId} onValueChange={setStoreId}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select store" />
                  </SelectTrigger>
                  <SelectContent>
                    {stores.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => setAddingStore(true)}
                  title="Add new store"
                >
                  <Plus className="size-4" />
                </Button>
              </div>
            )}
            {storeError ? (
              <p className="mt-1 text-xs text-destructive">{storeError}</p>
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="price">Price paid ($)</Label>
            <Input
              id="price"
              className="mt-1"
              type="number"
              min="0"
              step="0.01"
              value={pricePaid}
              onChange={(e) => setPricePaid(e.target.value)}
              placeholder="0.00"
            />
          </div>
          <div>
            <Label htmlFor="msrp">MSRP ($)</Label>
            <Input
              id="msrp"
              className="mt-1"
              type="number"
              min="0"
              step="0.01"
              value={msrp}
              onChange={(e) => setMsrp(e.target.value)}
              placeholder="0.00"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="storage">Storage location (optional)</Label>
          <Input
            id="storage"
            className="mt-1"
            value={storageLocation}
            onChange={(e) => setStorageLocation(e.target.value)}
            placeholder="Top shelf, bar cart…"
          />
        </div>

        {/* Notes */}
        <div>
          <Label htmlFor="notes">Personal notes (optional)</Label>
          <Textarea
            id="notes"
            className="mt-1"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Personal notes about this bottle…"
          />
        </div>

        <div>
          <Label htmlFor="websiteNotes">Website / review notes (optional)</Label>
          <Textarea
            id="websiteNotes"
            className="mt-1"
            value={websiteNotes}
            onChange={(e) => setWebsiteNotes(e.target.value)}
            placeholder="Notes copied from a review or product page…"
          />
        </div>

        <div>
          <Label htmlFor="producerNotes">Producer tasting notes (optional)</Label>
          <Textarea
            id="producerNotes"
            className="mt-1"
            value={producerNotes}
            onChange={(e) => setProducerNotes(e.target.value)}
            placeholder="Official notes from the distillery…"
          />
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <div className="flex gap-2">
          <Button onClick={submit} disabled={pending || !lineId} size="lg">
            {bottleId ? "Save changes" : "Add bottle"}
          </Button>
          <Button type="button" variant="ghost" size="lg" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
