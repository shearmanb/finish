import { redirect, notFound } from "next/navigation";
import { PageHeader } from "@/components/app/page-header";
import { QuickPourForm } from "@/components/forms/quick-pour-form";
import { getPourEditorData, getBottleHeader } from "@/lib/data/pours";

export default async function QuickPourPage({
  searchParams,
}: {
  searchParams: Promise<{ bottleId?: string }>;
}) {
  const { bottleId } = await searchParams;
  if (!bottleId) redirect("/pours/new");

  const [data, bottle] = await Promise.all([
    getPourEditorData(),
    getBottleHeader(bottleId),
  ]);
  if (!bottle) notFound();

  return (
    <div>
      <PageHeader
        title="Quick Log"
        subtitle={`${bottle.product.name} · ${bottle.product.distillery.name}`}
        backHref={`/bottles/${bottleId}`}
      />
      <QuickPourForm bottleId={bottleId} data={data} />
    </div>
  );
}
