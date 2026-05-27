import { notFound } from "next/navigation";
import { PageHeader } from "@/components/app/page-header";
import { QuickPourForm } from "@/components/forms/quick-pour-form";
import { getPour, getPourEditorData } from "@/lib/data/pours";
import type { DraftInitial } from "@/components/forms/use-pour-draft";

export default async function EditPourPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [pour, data] = await Promise.all([getPour(id), getPourEditorData()]);
  if (!pour) notFound();

  const flavors: Record<string, string[]> = {};
  for (const pf of pour.flavors) {
    (flavors[pf.phaseId] ??= []).push(pf.flavorId);
  }
  const notes: Record<string, string> = {};
  for (const n of pour.notes) notes[n.phaseId] = n.text;
  const ratings: Record<string, number> = {};
  for (const r of pour.ratings) ratings[r.dimensionId] = r.value;

  const initial: DraftInitial = {
    glasswareId: pour.glasswareId ?? undefined,
    locationId: pour.locationId ?? undefined,
    prep: pour.prep,
    prepNote: pour.prepNote ?? undefined,
    pourSize: pour.pourSize != null ? String(pour.pourSize) : undefined,
    pourSizeUnit: pour.pourSizeUnit,
    companions: pour.companions ?? undefined,
    pouredAt: pour.pouredAt.toISOString().slice(0, 10),
    notes,
    flavors,
    mouthfeel: pour.mouthfeels.map((m) => m.mouthfeelId),
    ratings,
  };

  return (
    <div>
      <PageHeader
        title={`Edit Pour #${pour.pourNumber}`}
        backHref={`/pours/${pour.id}`}
      />
      <QuickPourForm
        bottleId={pour.bottleId}
        data={data}
        pourId={pour.id}
        initial={initial}
      />
    </div>
  );
}
