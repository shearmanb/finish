import { PageHeader } from "@/components/app/page-header";
import { LineForm } from "@/components/forms/line-form";
import { getActiveDistilleries } from "@/lib/data/lookups";

export default async function NewLinePage() {
  const distilleries = await getActiveDistilleries();
  return (
    <div>
      <PageHeader title="New Line" backHref="/lines" />
      <LineForm
        distilleries={distilleries.map((d) => ({ id: d.id, name: d.name }))}
      />
    </div>
  );
}
