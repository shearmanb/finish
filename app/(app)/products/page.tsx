import Link from "next/link";
import { Plus, ChevronRight, Boxes } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { listProducts } from "@/lib/data/products";

export default async function ProductsPage() {
  const products = await listProducts();

  return (
    <div>
      <PageHeader
        title="Expressions"
        subtitle="Every bourbon you've logged — group your bottles by expression."
        action={
          <Button asChild>
            <Link href="/products/new">
              <Plus className="size-4" /> New
            </Link>
          </Button>
        }
      />

      {products.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 p-10 text-center">
          <Boxes className="size-8 text-muted-foreground" />
          <p className="text-muted-foreground">No expressions yet.</p>
          <Button asChild>
            <Link href="/products/new">Add your first expression</Link>
          </Button>
        </Card>
      ) : (
        <div className="space-y-2">
          {products.map((p) => (
            <Link key={p.id} href={`/products/${p.id}`}>
              <Card className="flex items-center gap-3 p-4 transition-colors hover:bg-accent">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-medium">{p.name}</span>
                    {p.caskStrength ? (
                      <Badge variant="default">CS</Badge>
                    ) : null}
                  </div>
                  <div className="truncate text-sm text-muted-foreground">
                    {p.distillery.name}
                    {p.proof ? ` · ${p.proof} proof` : ""}
                    {p.category ? ` · ${p.category}` : ""}
                  </div>
                </div>
                <Badge variant="muted">
                  {p._count.bottles}{" "}
                  {p._count.bottles === 1 ? "bottle" : "bottles"}
                </Badge>
                <ChevronRight className="size-4 text-muted-foreground" />
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
