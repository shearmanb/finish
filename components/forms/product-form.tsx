"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { createProduct, updateProduct } from "@/lib/actions/products";
import { createSimpleLookup } from "@/lib/actions/lookups";
import type { ProductInput } from "@/lib/data/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Distillery = { id: string; name: string };

export function ProductForm({
  distilleries,
  initial,
  productId,
}: {
  distilleries: Distillery[];
  initial?: Partial<ProductInput>;
  productId?: string;
}) {
  const router = useRouter();
  const [pending, start] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);

  const [name, setName] = React.useState(initial?.name ?? "");
  const [distilleryId, setDistilleryId] = React.useState(
    initial?.distilleryId ?? "",
  );
  const [proof, setProof] = React.useState(
    initial?.proof != null ? String(initial.proof) : "",
  );
  const [caskStrength, setCaskStrength] = React.useState(
    initial?.caskStrength ?? false,
  );
  const [category, setCategory] = React.useState(initial?.category ?? "");
  const [mashBill, setMashBill] = React.useState(initial?.mashBill ?? "");
  const [ageStatement, setAgeStatement] = React.useState(
    initial?.ageStatement ?? "",
  );

  const [addingDist, setAddingDist] = React.useState(false);
  const [newDist, setNewDist] = React.useState("");

  function addDistillery() {
    if (!newDist.trim()) return;
    start(async () => {
      const res = await createSimpleLookup("distilleries", newDist);
      if (res.ok && res.id) {
        setDistilleryId(res.id);
        setNewDist("");
        setAddingDist(false);
        router.refresh();
      } else {
        setError(res.error ?? "Could not add distillery.");
      }
    });
  }

  function submit() {
    setError(null);
    const input: ProductInput = {
      name,
      distilleryId,
      proof: proof.trim() === "" ? null : Number(proof),
      caskStrength,
      category: category || null,
      mashBill: mashBill || null,
      ageStatement: ageStatement || null,
    };
    start(async () => {
      const res = productId
        ? await updateProduct(productId, input)
        : await createProduct(input);
      if (res && !res.ok) setError(res.error ?? "Something went wrong.");
    });
  }

  const proofNum = proof.trim() === "" ? null : Number(proof);

  return (
    <Card>
      <CardContent className="space-y-4 pt-5">
        <div>
          <Label htmlFor="name">Expression name</Label>
          <Input
            id="name"
            className="mt-1"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Eagle Rare 10 Year"
            autoFocus
          />
        </div>

        <div>
          <Label>Distillery</Label>
          {addingDist ? (
            <div className="mt-1 flex gap-2">
              <Input
                value={newDist}
                onChange={(e) => setNewDist(e.target.value)}
                placeholder="New distillery name"
                autoFocus
              />
              <Button type="button" onClick={addDistillery} disabled={pending}>
                Add
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setAddingDist(false)}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <div className="mt-1 flex gap-2">
              <Select value={distilleryId} onValueChange={setDistilleryId}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select distillery" />
                </SelectTrigger>
                <SelectContent>
                  {distilleries.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="outline"
                onClick={() => setAddingDist(true)}
              >
                + New
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="proof">Proof</Label>
            <Input
              id="proof"
              className="mt-1"
              inputMode="decimal"
              value={proof}
              onChange={(e) => setProof(e.target.value)}
              placeholder="e.g. 90"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              {proofNum != null && !Number.isNaN(proofNum)
                ? `${proofNum / 2}% ABV`
                : "ABV auto-calculated"}
            </p>
          </div>
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
        </div>

        <label className="flex items-center gap-3 rounded-lg border border-border p-3 text-sm">
          <Switch checked={caskStrength} onCheckedChange={setCaskStrength} />
          <span>Cask strength / barrel proof</span>
        </label>

        <div className="grid grid-cols-2 gap-3">
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
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <div className="flex gap-2">
          <Button onClick={submit} disabled={pending} size="lg">
            {productId ? "Save changes" : "Create expression"}
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
