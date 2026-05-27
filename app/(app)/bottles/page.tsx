import Link from "next/link";
import Image from "next/image";
import { Plus, Wine } from "lucide-react";
import type { BottleStatus } from "@prisma/client";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/app/status-badge";
import { listBottles } from "@/lib/data/bottles";
import { cn } from "@/lib/utils";

const FILTERS: { label: string; value?: BottleStatus }[] = [
  { label: "All" },
  { label: "Sealed", value: "SEALED" },
  { label: "Open", value: "OPEN" },
  { label: "Finished", value: "FINISHED" },
];

export default async function BottlesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const active = (["SEALED", "OPEN", "FINISHED"] as const).includes(
    status as BottleStatus,
  )
    ? (status as BottleStatus)
    : undefined;
  const bottles = await listBottles({ status: active });

  return (
    <div>
      <PageHeader
        title="Bottles"
        subtitle="Your collection."
        action={
          <Button asChild>
            <Link href="/bottles/new">
              <Plus className="size-4" /> Add
            </Link>
          </Button>
        }
      />

      <div className="mb-4 flex gap-1.5 overflow-x-auto">
        {FILTERS.map((f) => {
          const isActive = f.value === active || (!f.value && !active);
          return (
            <Link
              key={f.label}
              href={f.value ? `/bottles?status=${f.value}` : "/bottles"}
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                isActive
                  ? "border-primary bg-primary/12 text-primary"
                  : "border-border text-muted-foreground hover:bg-accent",
              )}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      {bottles.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 p-10 text-center">
          <Wine className="size-8 text-muted-foreground" />
          <p className="text-muted-foreground">No bottles here yet.</p>
          <Button asChild>
            <Link href="/bottles/new">Add a bottle</Link>
          </Button>
        </Card>
      ) : (
        <div className="space-y-2">
          {bottles.map((b) => (
            <Link key={b.id} href={`/bottles/${b.id}`}>
              <Card className="flex items-center gap-3 p-3 transition-colors hover:bg-accent">
                <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
                  {b.photos[0] ? (
                    <Image
                      src={b.photos[0].url}
                      alt=""
                      width={56}
                      height={56}
                      unoptimized
                      className="size-14 object-cover"
                    />
                  ) : (
                    <Wine className="size-6 text-muted-foreground" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{b.name || b.line.name}</div>
                  <div className="truncate text-sm text-muted-foreground">
                    {b.line.distillery.name} · {b.line.name}
                  </div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
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
