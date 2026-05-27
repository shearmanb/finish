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
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ProductOption = { id: string; name: string; distilleryName: string };

const STATUSES: { value: BottleStatus; label: string }[] = [
  { value: "SEALED", label: "Sealed" },
  { value: "OPEN", label: "Open" },
  { value: "FINISHED", label: "Finished" },
];

function numOrNull(s: string): number | null {
  return s.trim() === "" ? null : Number(s);
}

export function BottleForm({
  products,
  initial,
  bottleId,
  defaultProductId,
}: {
  products: ProductOption[];
  initial?: Partial<BottleInput>;
  bottleId?: string;
  defaultProductId?: string;
}) {
  const router = useRouter();
  const [pending, start] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);

  const [productId, setProductId] = React.useState(
    initial?.productId ?? defaultProductId ?? "",
  );
  const [bottlingName, setBottlingName] = React.useState(
    initial?.bottlingName ?? "",
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
  const [store, setStore] = React.useState(initial?.store ?? "");
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

  function submit() {
    setError(null);
    const input: BottleInput = {
      productId,
      bottlingName: bottlingName || null,
      status,
      fillLevel: numOrNull(fillLevel),
      purchaseDate: purchaseDate || null,
      store: store || null,
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
        <div>
          <Label>Expression</Label>
          {products.length === 0 ? (
            <p className="mt-1 text-sm text-muted-foreground">
              No expressions yet.{" "}
              <Link href="/products/new" className="text-primary underline">
                Create one first
              </Link>
              .
            </p>
          ) : (
            <Select value={productId} onValueChange={setProductId}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select expression" />
              </SelectTrigger>
              <SelectContent>
                {products.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} — {p.distilleryName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div>
          <Label htmlFor="bottling">Bottling / pick name (optional)</Label>
          <Input
            id="bottling"
            className="mt-1"
            value={bottlingName}
            onChange={(e) => setBottlingName(e.target.value)}
            placeholder="Single barrel #, store pick name…"
          />
        </div>

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
            <Label htmlFor="store">Store</Label>
            <Input
              id="store"
              className="mt-1"
              value={store}
              onChange={(e) => setStore(e.target.value)}
              placeholder="Where you bought it"
            />
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

        <div>
          <Label htmlFor="notes">Notes (optional)</Label>
          <Textarea
            id="notes"
            className="mt-1"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <div className="flex gap-2">
          <Button
            onClick={submit}
            disabled={pending || !productId}
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
