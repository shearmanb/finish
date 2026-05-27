import { notFound } from "next/navigation";
import { PageHeader } from "@/components/app/page-header";
import { GuidedTasting } from "@/components/forms/guided-tasting";
import { getPourEditorData, getBottleHeader } from "@/lib/data/pours";

export default async function GuidedPourPage({
  params,
}: {
  params: Promise<{ bottleId: string }>;
}) {
  const { bottleId } = await params;
  const [data, bottle] = await Promise.all([
    getPourEditorData(),
    getBottleHeader(bottleId),
  ]);
  if (!bottle) notFound();

  return (
    <div>
      <PageHeader
        title="Guided Tasting"
        subtitle={`${bottle.product.name} · ${bottle.product.distillery.name}`}
        backHref={`/bottles/${bottleId}`}
      />
      <GuidedTasting bottleId={bottleId} data={data} />
    </div>
  );
}
