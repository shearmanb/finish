import "server-only";

// Read-only client for Cellar — the centralized bottle catalog and single source
// of truth for bottle *identity* across all apps. Finish owns ownership/tasting
// data; it defers name/brand/distillery/category/MSRP to Cellar via these reads.
// Reads are open (no token); see Cellar's GET /api/bottles contract.

export type CellarBottle = {
  id: number;
  name: string;
  brand: string;
  distillery: string | null;
  category: string | null;
  tier: string | null;
  myTier: string | null;
  vabcCode: string | null;
  msrp: number | null;
  warn: string | null;
  notes: string | null;
  shortcodes: string[];
  releases: {
    id: number;
    year: string | null;
    batch: string | null;
    label: string | null;
    notes: string | null;
  }[];
  isArchived: boolean;
  updatedAt: string;
};

export function cellarConfigured(): boolean {
  return !!process.env.CELLAR_API_URL?.trim();
}

function baseUrl(): string {
  const url = process.env.CELLAR_API_URL?.trim();
  if (!url) throw new Error("CELLAR_API_URL is not set.");
  return url.replace(/\/+$/, "");
}

// Public base URL for linking out to Cellar's web UI (same origin as the API).
export function cellarBottleUrl(id: number): string | null {
  const url = process.env.CELLAR_API_URL?.trim();
  if (!url) return null;
  return `${url.replace(/\/+$/, "")}/bottles/${id}/edit`;
}

export async function fetchCellarCatalog(): Promise<CellarBottle[]> {
  const res = await fetch(`${baseUrl()}/api/bottles`, {
    headers: { Accept: "application/json" },
    // Small catalog; cache briefly so a burst of searches isn't a burst of fetches.
    next: { revalidate: 60 },
  });
  if (!res.ok) {
    throw new Error(`Cellar returned ${res.status} ${res.statusText}.`);
  }
  const data = (await res.json()) as { bottles?: CellarBottle[] };
  return data.bottles ?? [];
}

export async function getCellarBottle(id: number): Promise<CellarBottle | null> {
  const all = await fetchCellarCatalog();
  return all.find((b) => b.id === id) ?? null;
}
