import { notFound } from "next/navigation";
import { PageHeader } from "@/components/app/page-header";
import { BottleForm } from "@/components/forms/bottle-form";
import { getBottle } from "@/lib/data/bottles";
import { listLines } from "@/lib/data/lines";
import {
  getActiveStores,
  getActiveDistilleries,
  getActiveBottleTypes,
  getActiveMashBillTypes,
  getActiveFinishTypes,
} from "@/lib/data/lookups";

export default async function EditBottlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [bottle, lines, stores, distilleries, bottleTypes, mashBillTypes, finishTypes] =
    await Promise.all([
      getBottle(id),
      listLines(),
      getActiveStores(),
      getActiveDistilleries(),
      getActiveBottleTypes(),
      getActiveMashBillTypes(),
      getActiveFinishTypes(),
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
        distilleries={distilleries.map((d) => ({ id: d.id, name: d.name }))}
        bottleTypes={bottleTypes.map((t) => ({
          id: t.id,
          name: t.name,
          parentId: t.parentId,
        }))}
        mashBillTypes={mashBillTypes.map((m) => ({ id: m.id, name: m.name }))}
        finishTypes={finishTypes.map((f) => ({ id: f.id, name: f.name }))}
        initial={{
          lineId: bottle.lineId,
          name: bottle.name,
          proof: bottle.proof ? Number(bottle.proof) : null,
          singleBarrel: bottle.singleBarrel,
          caskStrength: bottle.caskStrength,
          typeId: bottle.typeId,
          subTypeId: bottle.subTypeId,
          mashBillId: bottle.mashBillId,
          ageStatement: bottle.ageStatement,
          release: bottle.release,
          t8kePick: bottle.t8kePick,
          bottleNumber: bottle.bottleNumber,
          barrelNumber: bottle.barrelNumber,
          hasBarrelFinish: bottle.hasBarrelFinish,
          finishTypeId: bottle.finishTypeId,
          producerNotes: bottle.producerNotes,
          websiteNotes: bottle.websiteNotes,
          distilledDate: bottle.distilledDate
            ? bottle.distilledDate.toISOString().slice(0, 10)
            : null,
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
