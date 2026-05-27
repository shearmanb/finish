"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { BottleStatus } from "@prisma/client";
import { createBottle, updateBottle } from "@/lib/actions/bottles";
import type { BottleInput } from "@/lib/data/bottles";
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
  stores,
  initial,
  bottleId,
  defaultLineId,
}: {
  lines: LineOption[];
  stores: StoreOption[];
  initial?: Partial<BottleInput>;
  bottleId?: string;
  defaultLineId?: string;
}) {
  const router = useRouter();
  const [pending, start] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);

  const [lineId, setLineId] = React.useState(
    initial?.lineId ?? defaultLineId ?? "",
  );
  const [name, setName] = React.useState(initial?.name ?? "");
  const [proofVal, setProofVal] = React.useState(
    initial?.proof != null ? String(initial.proof) : "",
  );
  const [singleBarrel, setSingleBarrel] = React.useState(
    initial?.singleBarrel ?? false,
  );
  const [caskStrength, setCaskStrength] = React.useState(
    initial?.caskStrength ?? false,
  );
  const [category, setCategory] = React.useState(initial?.category ?? "");
  const [mashBill, setMashBill] = React.useState(initial?.mashBill ?? "");
  const [ageStatement, setAgeStatement] = React.useState(
    initial?.ageStatement ?? "",
  );
  const [release, setRelease] = React.useState(initial?.release ?? "");
  const [t8kePick, setT8kePick] = React.useState(initial?.t8kePick ?? false);
  const [bottleNumber, setBottleNumber] = React.useState(
    initial?.bottleNumber ?? "",
  );
  const [finish, setFinish] = React.useState(initial?.finish ?? "");
  const [producerNotes, setProducerNotes] = React.useState(
    initial?.producerNotes ?? "",
  );
  const [status, setStatus] = React.useState<BottleStatus>(
    initial?.status ?? "SEALED",
  );
  const [fillLevel, setFillLevel] = React.useState(
    initial?.fillLevel != null ? String(initial.fillLevel) : "",
  );
  const [purchaseDate, setPurchaseDate] = React.useState(
    initial?.purchaseDate ?? "",
  );
  const [storeId, setStoreId] = React.useState(initial?.storeId ?? "");
  const [pricePaid, setPricePaid] = React.useState(
    initial?.pricePaid != null ? String(initial.pricePaid) : "",
  );
  const [msrp, setMsrp] = React.useState(
    initial?.msrp != null ? String(initial.msrp) : "",
  );
  const [storageLocation, setStorageLocation] = React.useState(
    initial?.storageLocation ?? "",
  );
  const [notes, setNotes] = React.useState(initial?.notes ?? "");

  const proofNum = proofVal.trim() === "" ? null : Number(proofVal);

  function submit() {
    setError(null);
    const input: BottleInput = {
      lineId,
      name: name || null,
      proof: numOrNull(proofVal),
      singleBarrel,
      caskStrength,
      category: category || null,
      mashBill: mashBill || null,
      ageStatement: ageStatement || null,
      release: release || null,
      t8kePick,
      bottleNumber: bottleNumber || null,
      finish: finish || null,
      producerNotes: producerNotes || null,
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
      <CardContent className="space-y-4 pt-5">

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

        {/* Proof / ABV */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="proof">Proof</Label>
            <Input
              id="proof"
              className="mt-1"
              inputMode="decimal"
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
              inputMode="decimal"
              value={
                proofNum != null && !Number.isNaN(proofNum)
                  ? String(proofNum / 2)
                  : ""
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

        {/* Category, age, mash bill */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="category">Type / category</Label>
            <Input
              id="category"
              className="mt-1"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Bourbon, Rye…"
            />
          </div>
          <div>
            <Label htmlFor="age">Age statement</Label>
            <Input
              id="age"
              className="mt-1"
              value={ageStatement}
              onChange={(e) => setAgeStatement(e.target.value)}
              placeholder="10 Year, NAS…"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="mash">Mash bill</Label>
            <Input
              id="mash"
              className="mt-1"
              value={mashBill}
              onChange={(e) => setMashBill(e.target.value)}
              placeholder="75/13/12…"
            />
          </div>
          <div>
            <Label htmlFor="finish">Finish (barrel type)</Label>
            <Input
              id="finish"
              className="mt-1"
              value={finish}
              onChange={(e) => setFinish(e.target.value)}
              placeholder="Port, Honey Barrel…"
            />
          </div>
        </div>

        {/* Release & bottle # */}
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
              inputMode="numeric"
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
            <Select value={storeId} onValueChange={setStoreId}>
              <SelectTrigger className="mt-1">
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
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="price">Price paid ($)</Label>
            <Input
              id="price"
              className="mt-1"
              inputMode="decimal"
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
              inputMode="decimal"
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
          <Label htmlFor="notes">Notes / special (optional)</Label>
          <Textarea
            id="notes"
            className="mt-1"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Personal notes about this bottle…"
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
          <Button
            onClick={submit}
            disabled={pending || !lineId}
            size="lg"
          >
            {bottleId ? "Save changes" : "Add bottle"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="lg"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
