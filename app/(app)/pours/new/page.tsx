import Link from "next/link";
import { Sparkles, PencilLine, Wine, Plus } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { listBottles } from "@/lib/data/bottles";

export default async function NewPourPage() {
  const bottles = await listBottles();

  return (
    <div>
      <PageHeader title="New Pour" subtitle="Pick a bottle to taste." />

      {bottles.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 p-10 text-center">
          <Wine className="size-8 text-muted-foreground" />
          <p className="text-muted-foreground">
            Add a bottle first, then you can log a tasting.
          </p>
          <Button asChild>
            <Link href="/bottles/new">
              <Plus className="size-4" /> Add a bottle
            </Link>
          </Button>
        </Card>
      ) : (
        <div className="space-y-2">
          {bottles.map((b) => (
            <Card key={b.id} className="p-3">
              <div className="mb-2">
                <div className="font-medium">{b.name || b.line.name}</div>
                <div className="text-sm text-muted-foreground">
                  {b.line.distillery.name} · {b.line.name}
                </div>
              </div>
              <div className="flex gap-2">
                <Button asChild size="sm" className="flex-1">
                  <Link href={`/pours/new/guided/${b.id}`}>
                    <Sparkles className="size-4" /> Guided
                  </Link>
                </Button>
                <Button asChild size="sm" variant="outline" className="flex-1">
                  <Link href={`/pours/new/quick?bottleId=${b.id}`}>
                    <PencilLine className="size-4" /> Quick
                  </Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
