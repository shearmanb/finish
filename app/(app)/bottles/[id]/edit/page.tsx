import { notFound } from "next/navigation";
import { PageHeader } from "@/components/app/page-header";
import { BottleForm } from "@/components/forms/bottle-form";
import { getBottle } from "@/lib/data/bottles";
import { listLines } from "@/lib/data/lines";
import { getActiveStores } from "@/lib/data/lookups";

export default async function EditBottlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [bottle, lines, stores] = await Promise.all([
    getBottle(id),
    listLines(),
    getActiveStores(),
  ]);
  if (!bottle) notFound();

  return (
    <div>
      <PageHeader title="Edit Bottle" backHref={`/bottles/${id}`} />
      <BottleForm
        bottleId={bottle.id}
        lines={lines.map((l) => ({
          id: l.id,
          name: l.name,
          distilleryName: l.distillery.name,
        }))}
        stores={stores.map((s) => ({ id: s.id, name: s.name }))}
        initial={{
          lineId: bottle.lineId,
          name: bottle.name,
          proof: bottle.proof ? Number(bottle.proof) : null,
          singleBarrel: bottle.singleBarrel,
          caskStrength: bottle.caskStrength,
          category: bottle.category,
          mashBill: bottle.mashBill,
          ageStatement: bottle.ageStatement,
          release: bottle.release,
          t8kePick: bottle.t8kePick,
          bottleNumber: bottle.bottleNumber,
          finish: bottle.finish,
          producerNotes: bottle.producerNotes,
          status: bottle.status,
          fillLevel: bottle.fillLevel,
          purchaseDate: bottle.purchaseDate
            ? bottle.purchaseDate.toISOString().slice(0, 10)
            : null,
          storeId: bottle.storeId,
          pricePaid: bottle.pricePaid ? Number(bottle.pricePaid) : null,
          msrp: bottle.msrp ? Number(bottle.msrp) : null,
          storageLocation: bottle.storageLocation,
          notes: bottle.notes,
        }}
      />
    </div>
  );
}
