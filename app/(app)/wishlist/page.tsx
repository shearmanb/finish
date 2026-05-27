import { PageHeader } from "@/components/app/page-header";
import { WishlistManager } from "@/components/forms/wishlist-manager";
import { listWishlist } from "@/lib/data/wishlist";

export default async function WishlistPage() {
  const items = await listWishlist();
  return (
    <div>
      <PageHeader title="Wishlist" subtitle="Bottles you're hunting for." />
      <WishlistManager
        items={items.map((i) => ({
          id: i.id,
          name: i.freeTextName ?? i.product?.name ?? "Untitled",
          targetPrice: i.targetPrice ? i.targetPrice.toString() : null,
          notes: i.notes,
          acquired: i.acquired,
        }))}
      />
    </div>
  );
}
