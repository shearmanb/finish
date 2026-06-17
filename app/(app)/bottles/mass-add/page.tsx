import { PageHeader } from "@/components/app/page-header";
import { MassAddForm } from "@/components/forms/mass-add-form";
import { listLines } from "@/lib/data/lines";
import { getActiveDistilleries, getActiveStores } from "@/lib/data/lookups";

export default async function MassAddBottlesPage({
  searchParams,
}: {
  searchParams: Promise<{ distilleryId?: string; lineId?: string }>;
}) {
  const { distilleryId, lineId } = await searchParams;
  const [lines, distilleries, stores] = await Promise.all([
    listLines(),
    getActiveDistilleries(),
    getActiveStores(),
  ]);

  return (
    <div>
      <PageHeader title="Mass Add Bottles" backHref="/bottles" />
      <MassAddForm
        lines={lines.map((l) => ({
          id: l.id,
          name: l.name,
          distilleryId: l.distillery.id,
          distilleryName: l.distillery.name,
        }))}
        distilleries={distilleries.map((d) => ({ id: d.id, name: d.name }))}
        stores={stores.map((s) => ({ id: s.id, name: s.name }))}
        defaultDistilleryId={distilleryId}
        defaultLineId={lineId}
      />
    </div>
  );
}
