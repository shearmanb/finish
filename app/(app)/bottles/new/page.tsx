import { PageHeader } from "@/components/app/page-header";
import { BottleForm } from "@/components/forms/bottle-form";
import { listLines } from "@/lib/data/lines";
import { getActiveStores } from "@/lib/data/lookups";

export default async function NewBottlePage({
  searchParams,
}: {
  searchParams: Promise<{ lineId?: string }>;
}) {
  const { lineId } = await searchParams;
  const [lines, stores] = await Promise.all([listLines(), getActiveStores()]);
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
      />
    </div>
  );
}
