import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Plus, Pencil, Wine } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/app/status-badge";
import { getProduct } from "@/lib/data/products";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();

  return (
    <div>
      <PageHeader
        title={product.name}
        subtitle={product.distillery.name}
        backHref="/products"
        action={
          <Button asChild variant="outline">
            <Link href={`/products/${product.id}/edit`}>
              <Pencil className="size-4" /> Edit
            </Link>
          </Button>
        }
      />

      <div className="mb-5 flex flex-wrap gap-2">
        {product.caskStrength ? <Badge>Cask strength</Badge> : null}
        {product.proof ? (
          <Badge variant="secondary">
            {product.proof} proof · {product.abv}% ABV
          </Badge>
        ) : null}
        {product.category ? (
          <Badge variant="muted">{product.category}</Badge>
        ) : null}
        {product.ageStatement ? (
          <Badge variant="muted">{product.ageStatement}</Badge>
        ) : null}
        {product.mashBill ? (
          <Badge variant="muted">Mash {product.mashBill}</Badge>
        ) : null}
      </div>

      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-semibold">
          Bottles ({product.bottles.length})
        </h2>
        <Button asChild size="sm">
          <Link href={`/bottles/new?productId=${product.id}`}>
            <Plus className="size-4" /> Add bottle
          </Link>
        </Button>
      </div>

      {product.bottles.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 p-8 text-center">
          <Wine className="size-7 text-muted-foreground" />
          <p className="text-muted-foreground">
            No bottles of this expression yet.
          </p>
          <Button asChild size="sm">
            <Link href={`/bottles/new?productId=${product.id}`}>Add bottle</Link>
          </Button>
        </Card>
      ) : (
        <div className="space-y-2">
          {product.bottles.map((b) => (
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
                    {b.bottlingName || "Bottle"}
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
