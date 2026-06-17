import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Plus, Pencil, Wine } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/app/status-badge";
import { getLine } from "@/lib/data/lines";

export default async function LineDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const line = await getLine(id);
  if (!line) notFound();

  return (
    <div>
      <PageHeader
        title={line.name}
        subtitle={line.distillery.name}
        backHref="/lines"
        action={
          <Button asChild variant="outline">
            <Link href={`/lines/${line.id}/edit`}>
              <Pencil className="size-4" /> Edit
            </Link>
          </Button>
        }
      />

      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-semibold">Bottles ({line.bottles.length})</h2>
        <div className="flex gap-2">
          <Button asChild size="sm" variant="outline">
            <Link
              href={`/bottles/mass-add?distilleryId=${line.distillery.id}&lineId=${line.id}`}
            >
              <Plus className="size-4" /> Add multiple
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link href={`/bottles/new?lineId=${line.id}`}>
              <Plus className="size-4" /> Add bottle
            </Link>
          </Button>
        </div>
      </div>

      {line.bottles.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 p-8 text-center">
          <Wine className="size-7 text-muted-foreground" />
          <p className="text-muted-foreground">No bottles of this line yet.</p>
          <Button asChild size="sm">
            <Link href={`/bottles/new?lineId=${line.id}`}>Add bottle</Link>
          </Button>
        </Card>
      ) : (
        <div className="space-y-2">
          {line.bottles.map((b) => (
            <Link key={b.id} href={`/bottles/${b.id}`}>
              <Card className="flex items-center gap-3 p-3 transition-colors hover:bg-accent">
                <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
                  {b.photos[0] ? (
                    <Image
                      src={b.photos[0].url}
                      alt=""
                      width={48}
                      height={48}
                      unoptimized
                      className="size-12 object-cover"
                    />
                  ) : (
                    <Wine className="size-5 text-muted-foreground" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">
                    {b.name || line.name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {b._count.pours} {b._count.pours === 1 ? "pour" : "pours"}
                    {b.fillLevel != null ? ` · ${b.fillLevel}% full` : ""}
                  </div>
                </div>
                <StatusBadge status={b.status} />
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
