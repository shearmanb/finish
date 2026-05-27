import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DeletePourButton } from "@/components/forms/delete-pour-button";
import { getPour } from "@/lib/data/pours";
import { formatDate, formatScore } from "@/lib/utils";

const PREP_LABEL: Record<string, string> = {
  NEAT: "Neat",
  WATER: "With water",
  ICE: "On ice",
};

export default async function PourDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const pour = await getPour(id);
  if (!pour) notFound();

  const ratings = [...pour.ratings].sort(
    (a, b) => a.dimension.sortIndex - b.dimension.sortIndex,
  );

  // Group flavors by phase id.
  const flavorsByPhase = new Map<
    string,
    { phaseName: string; sortIndex: number; flavors: string[] }
  >();
  for (const pf of pour.flavors) {
    const entry = flavorsByPhase.get(pf.phaseId) ?? {
      phaseName: pf.phase.name,
      sortIndex: pf.phase.sortIndex,
      flavors: [],
    };
    entry.flavors.push(pf.flavor.name);
    flavorsByPhase.set(pf.phaseId, entry);
  }
  const notesByPhase = new Map(
    pour.notes.map((n) => [n.phaseId, { name: n.phase.name, sortIndex: n.phase.sortIndex, text: n.text }]),
  );

  const phaseIds = new Set<string>([
    ...flavorsByPhase.keys(),
    ...notesByPhase.keys(),
  ]);
  const phases = Array.from(phaseIds)
    .map((pid) => ({
      id: pid,
      name: notesByPhase.get(pid)?.name ?? flavorsByPhase.get(pid)?.phaseName ?? "",
      sortIndex:
        notesByPhase.get(pid)?.sortIndex ??
        flavorsByPhase.get(pid)?.sortIndex ??
        0,
      note: notesByPhase.get(pid)?.text,
      flavors: flavorsByPhase.get(pid)?.flavors ?? [],
    }))
    .sort((a, b) => a.sortIndex - b.sortIndex);

  return (
    <div>
      <PageHeader
        title={`${pour.bottle.product.name} · Pour #${pour.pourNumber}`}
        subtitle={`${formatDate(pour.pouredAt)}${pour.isGuided ? " · Guided tasting" : ""}`}
        backHref={`/bottles/${pour.bottleId}`}
        action={
          <Button asChild variant="outline">
            <Link href={`/pours/${pour.id}/edit`}>
              <Pencil className="size-4" /> Edit
            </Link>
          </Button>
        }
      />

      <div className="mb-5 flex flex-wrap gap-2">
        {pour.glassware ? <Badge variant="muted">{pour.glassware.name}</Badge> : null}
        <Badge variant="muted">{PREP_LABEL[pour.prep] ?? pour.prep}</Badge>
        {pour.pourSize ? (
          <Badge variant="muted">
            {pour.pourSize} {pour.pourSizeUnit.toLowerCase()}
          </Badge>
        ) : null}
        {pour.location ? <Badge variant="muted">{pour.location.name}</Badge> : null}
        {pour.companions ? (
          <Badge variant="muted">with {pour.companions}</Badge>
        ) : null}
      </div>

      {ratings.length > 0 ? (
        <Card className="mb-5">
          <CardContent className="pt-5">
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
              {ratings.map((r) => (
                <div key={r.id}>
                  <div className="text-2xl font-semibold tabular-nums">
                    {formatScore(r.value)}
                  </div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">
                    {r.dimension.name}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="space-y-3">
        {phases.map((p) => (
          <Card key={p.id}>
            <CardContent className="space-y-2 pt-5">
              <span className="font-semibold">{p.name}</span>
              {p.note ? <p className="text-sm">{p.note}</p> : null}
              {p.flavors.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {p.flavors.map((f) => (
                    <span
                      key={f}
                      className="rounded-full bg-secondary px-2.5 py-1 text-sm"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              ) : null}
            </CardContent>
          </Card>
        ))}

        {pour.mouthfeels.length > 0 ? (
          <Card>
            <CardContent className="space-y-2 pt-5">
              <span className="font-semibold">Mouthfeel</span>
              <div className="flex flex-wrap gap-1.5">
                {pour.mouthfeels.map((m) => (
                  <span
                    key={m.id}
                    className="rounded-full bg-secondary px-2.5 py-1 text-sm"
                  >
                    {m.mouthfeel.name}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>

      <div className="mt-6">
        <DeletePourButton pourId={pour.id} />
      </div>
    </div>
  );
}
