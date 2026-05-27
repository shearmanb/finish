import Link from "next/link";
import { Plus, ChevronRight, Boxes } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { listLines } from "@/lib/data/lines";

export default async function LinesPage() {
  const lines = await listLines();

  return (
    <div>
      <PageHeader
        title="Lines"
        subtitle="Your bourbon lines — group bottles by product line."
        action={
          <Button asChild>
            <Link href="/lines/new">
              <Plus className="size-4" /> New
            </Link>
          </Button>
        }
      />

      {lines.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 p-10 text-center">
          <Boxes className="size-8 text-muted-foreground" />
          <p className="text-muted-foreground">No lines yet.</p>
          <Button asChild>
            <Link href="/lines/new">Add your first line</Link>
          </Button>
        </Card>
      ) : (
        <div className="space-y-2">
          {lines.map((l) => (
            <Link key={l.id} href={`/lines/${l.id}`}>
              <Card className="flex items-center gap-3 p-4 transition-colors hover:bg-accent">
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{l.name}</div>
                  <div className="truncate text-sm text-muted-foreground">
                    {l.distillery.name}
                  </div>
                </div>
                <span className="shrink-0 rounded-full bg-secondary px-2.5 py-0.5 text-sm font-medium">
                  {l._count.bottles}{" "}
                  {l._count.bottles === 1 ? "bottle" : "bottles"}
                </span>
                <ChevronRight className="size-4 text-muted-foreground" />
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
