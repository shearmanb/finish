import { notFound } from "next/navigation";
import { PageHeader } from "@/components/app/page-header";
import { SimpleLookupManager } from "@/components/lookups/simple-lookup-manager";
import {
  SIMPLE_LOOKUPS,
  listLookup,
  type SimpleLookupKey,
} from "@/lib/data/lookups";

function isSimpleKey(k: string): k is SimpleLookupKey {
  return k in SIMPLE_LOOKUPS;
}

export default async function LookupPage({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const { key } = await params;
  if (!isSimpleKey(key)) notFound();

  const cfg = SIMPLE_LOOKUPS[key];
  const items = await listLookup(key);

  return (
    <div>
      <PageHeader title={cfg.label} backHref="/control-panel" />
      <SimpleLookupManager
        lookupKey={key}
        extraField={cfg.extraField}
        items={items}
      />
    </div>
  );
}
