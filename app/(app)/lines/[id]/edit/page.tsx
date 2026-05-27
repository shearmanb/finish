import { notFound } from "next/navigation";
import { PageHeader } from "@/components/app/page-header";
import { LineForm } from "@/components/forms/line-form";
import { getLine } from "@/lib/data/lines";
import { getActiveDistilleries } from "@/lib/data/lookups";

export default async function EditLinePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [line, distilleries] = await Promise.all([
    getLine(id),
    getActiveDistilleries(),
  ]);
  if (!line) notFound();

  return (
    <div>
      <PageHeader title="Edit Line" backHref={`/lines/${id}`} />
      <LineForm
        lineId={line.id}
        distilleries={distilleries.map((d) => ({ id: d.id, name: d.name }))}
        initial={{ name: line.name, distilleryId: line.distilleryId }}
      />
    </div>
  );
}
