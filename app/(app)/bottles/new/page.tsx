import { PageHeader } from "@/components/app/page-header";
import { BottleForm } from "@/components/forms/bottle-form";
import { listLines } from "@/lib/data/lines";
import {
  getActiveStores,
  getActiveDistilleries,
  getActiveBottleTypes,
  getActiveMashBillTypes,
  getActiveFinishTypes,
} from "@/lib/data/lookups";

export default async function NewBottlePage({
  searchParams,
}: {
  searchParams: Promise<{ lineId?: string }>;
}) {
  const { lineId } = await searchParams;
  const [lines, stores, distilleries, bottleTypes, mashBillTypes, finishTypes] =
    await Promise.all([
      listLines(),
      getActiveStores(),
      getActiveDistilleries(),
      getActiveBottleTypes(),
      getActiveMashBillTypes(),
      getActiveFinishTypes(),
    ]);
  return (
    <div>
      <PageHeader title="Add Bottle" backHref="/bottles" />
      <BottleForm
        defaultLineId={lineId}
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
      />
    </div>
  );
}
