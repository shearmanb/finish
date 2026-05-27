import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil, Sparkles, PencilLine, GlassWater } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/app/status-badge";
import { BottlePhotos } from "@/components/forms/bottle-photos";
import { getBottle } from "@/lib/data/bottles";
import { formatMoney, formatDate, formatScore } from "@/lib/utils";

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

export default async function BottleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const bottle = await getBottle(id);
  if (!bottle) notFound();

  const { line } = bottle;

  return (
    <div>
      <PageHeader
        title={bottle.name || line.name}
        subtitle={`${line.distillery.name} · ${line.name}${bottle.name && bottle.name !== line.name ? ` · ${bottle.name}` : ""}`}
        backHref="/bottles"
        action={
          <Button asChild variant="outline">
            <Link href={`/bottles/${bottle.id}/edit`}>
              <Pencil className="size-4" /> Edit
            </Link>
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <StatusBadge status={bottle.status} />
        {bottle.fillLevel != null ? (
          <Badge variant="muted">{bottle.fillLevel}% full</Badge>
        ) : null}
        {bottle.singleBarrel ? <Badge variant="secondary">Single Barrel</Badge> : null}
        {bottle.caskStrength ? <Badge>Cask Strength</Badge> : null}
        {bottle.t8kePick ? <Badge variant="default">T8ke Pick</Badge> : null}
        {bottle.proof ? (
          <Badge variant="muted">{Number(bottle.proof)} proof · {Number(bottle.proof) / 2}% ABV</Badge>
        ) : null}
        {bottle.release ? <Badge variant="muted">{bottle.release}</Badge> : null}
      </div>

      {/* Tasting CTAs */}
      <div className="mb-5 grid grid-cols-2 gap-3">
        <Button asChild size="lg" className="h-auto py-3">
          <Link href={`/pours/new/guided/${bottle.id}`}>
            <Sparkles className="size-5" />
            <div className="text-left">
              <div className="font-semibold">Guided</div>
              <div className="text-xs opacity-80">Step-by-step</div>
            </div>
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="h-auto py-3">
          <Link href={`/pours/new/quick?bottleId=${bottle.id}`}>
            <PencilLine className="size-5" />
            <div className="text-left">
              <div className="font-semibold">Quick log</div>
              <div className="text-xs text-muted-foreground">One screen</div>
            </div>
          </Link>
        </Button>
      </div>

      {/* Photos */}
      <Card className="mb-5">
        <CardContent className="pt-5">
          <p className="mb-3 text-sm font-medium">Photos</p>
          <BottlePhotos
            bottleId={bottle.id}
            photos={bottle.photos.map((p) => ({ id: p.id, url: p.url }))}
          />
        </CardContent>
      </Card>

      {/* Details */}
      <Card className="mb-5">
        <CardContent className="divide-y divide-border pt-2">
          {bottle.category ? <InfoRow label="Type" value={bottle.category} /> : null}
          {bottle.ageStatement ? <InfoRow label="Age" value={bottle.ageStatement} /> : null}
          {bottle.mashBill ? <InfoRow label="Mash bill" value={bottle.mashBill} /> : null}
          {bottle.finish ? <InfoRow label="Finish" value={bottle.finish} /> : null}
          {bottle.bottleNumber ? <InfoRow label="Bottle #" value={bottle.bottleNumber} /> : null}
          <InfoRow label="Bought" value={formatDate(bottle.purchaseDate)} />
          {bottle.store ? <InfoRow label="Store" value={bottle.store.name} /> : null}
          <InfoRow label="Price paid" value={formatMoney(bottle.pricePaid?.toString())} />
          <InfoRow label="MSRP" value={formatMoney(bottle.msrp?.toString())} />
          {bottle.storageLocation ? (
            <InfoRow label="Storage" value={bottle.storageLocation} />
          ) : null}
        </CardContent>
      </Card>

      {bottle.notes ? (
        <Card className="mb-5">
          <CardContent className="pt-5">
            <p className="mb-1 text-sm font-medium">Notes</p>
            <p className="text-sm">{bottle.notes}</p>
          </CardContent>
        </Card>
      ) : null}

      {bottle.producerNotes ? (
        <Card className="mb-5">
          <CardContent className="pt-5">
            <p className="mb-1 text-sm font-medium">Producer notes</p>
            <p className="text-sm text-muted-foreground">{bottle.producerNotes}</p>
          </CardContent>
        </Card>
      ) : null}

      {/* Pours */}
      <h2 className="mb-3 font-semibold">Pours ({bottle.pours.length})</h2>
      {bottle.pours.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 p-8 text-center">
          <GlassWater className="size-7 text-muted-foreground" />
          <p className="text-muted-foreground">No pours logged yet.</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {bottle.pours.map((pour) => {
            const ratings = [...pour.ratings].sort(
              (a, b) => a.dimension.sortIndex - b.dimension.sortIndex,
            );
            const overall = ratings.find((r) => r.dimension.name === "Overall");
            return (
              <Link key={pour.id} href={`/pours/${pour.id}`}>
                <Card className="flex items-center gap-3 p-3 transition-colors hover:bg-accent">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/12 text-sm font-semibold text-primary">
                    #{pour.pourNumber}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium">
                      {formatDate(pour.pouredAt)}
                      {pour.isGuided ? (
                        <span className="ml-2 text-xs text-primary">Guided</span>
                      ) : null}
                    </div>
                    <div className="truncate text-xs text-muted-foreground">
                      {pour.glassware?.name ?? "—"}
                      {pour.location ? ` · ${pour.location.name}` : ""}
                    </div>
                  </div>
                  {overall ? (
                    <div className="text-right">
                      <div className="text-lg font-semibold">
                        {formatScore(overall.value)}
                      </div>
                      <div className="text-[10px] uppercase text-muted-foreground">
                        overall
                      </div>
                    </div>
                  ) : null}
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
