import Link from "next/link";
import {
  Wine,
  GlassWater,
  Boxes,
  DollarSign,
  Sparkles,
  Plus,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getDashboard } from "@/lib/data/analytics";
import { formatMoney, formatScore, formatDate } from "@/lib/utils";

function Stat({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
  sub?: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/12 text-primary">
          <Icon className="size-5" />
        </span>
        <div className="min-w-0">
          <div className="text-xl font-semibold leading-none">{value}</div>
          <div className="mt-1 truncate text-xs text-muted-foreground">
            {sub ?? label}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Bar({ label, value, max, suffix }: { label: string; value: number; max: number; suffix?: string }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span className="truncate pr-2">{label}</span>
        <span className="font-medium tabular-nums">
          {suffix === "score" ? formatScore(value) : value}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${max > 0 ? (value / max) * 100 : 0}%` }}
        />
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  const d = await getDashboard();
  const empty = d.counts.bottles === 0 && d.counts.pours === 0;

  return (
    <div className="space-y-6 animate-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Your Journal</h1>
        <Button asChild size="sm">
          <Link href="/pours/new">
            <Plus className="size-4" /> Pour
          </Link>
        </Button>
      </div>

      {empty ? (
        <Card className="flex flex-col items-center gap-4 p-10 text-center">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/12 text-2xl">
            🥃
          </span>
          <div>
            <p className="font-medium">Welcome to your bourbon journal.</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Add your first bottle, then log a guided or quick tasting.
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild>
              <Link href="/bottles/new">Add a bottle</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/control-panel">Customize lists</Link>
            </Button>
          </div>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat
              icon={Wine}
              label="Bottles"
              value={d.counts.bottles}
              sub={`${d.counts.open} open · ${d.counts.sealed} sealed`}
            />
            <Stat icon={GlassWater} label="Pours" value={d.counts.pours} sub="pours logged" />
            <Stat icon={Boxes} label="Expressions" value={d.counts.expressions} sub="expressions" />
            <Stat
              icon={DollarSign}
              label="Value"
              value={formatMoney(d.collectionValue)}
              sub="collection value"
            />
          </div>

          {d.topPours.length > 0 ? (
            <section>
              <h2 className="mb-2 flex items-center gap-2 font-semibold">
                <Sparkles className="size-4 text-primary" /> Top pours
              </h2>
              <Card>
                <CardContent className="divide-y divide-border p-0">
                  {d.topPours.map((p) => (
                    <Link
                      key={p.pourId}
                      href={`/pours/${p.pourId}`}
                      className="flex items-center justify-between gap-3 p-3 transition-colors hover:bg-accent"
                    >
                      <div className="min-w-0">
                        <div className="truncate font-medium">{p.productName}</div>
                        <div className="truncate text-xs text-muted-foreground">
                          {p.distillery} · Pour #{p.pourNumber}
                        </div>
                      </div>
                      <span className="text-lg font-semibold tabular-nums">
                        {formatScore(p.value)}
                      </span>
                    </Link>
                  ))}
                </CardContent>
              </Card>
            </section>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            {d.byDistillery.length > 0 ? (
              <section>
                <h2 className="mb-2 font-semibold">By distillery (avg overall)</h2>
                <Card>
                  <CardContent className="space-y-3 pt-5">
                    {d.byDistillery.map((row) => (
                      <Bar
                        key={row.name}
                        label={`${row.name} (${row.n})`}
                        value={row.avg}
                        max={10}
                        suffix="score"
                      />
                    ))}
                  </CardContent>
                </Card>
              </section>
            ) : null}

            {d.topFlavors.length > 0 ? (
              <section>
                <h2 className="mb-2 font-semibold">Most-noted flavors</h2>
                <Card>
                  <CardContent className="space-y-3 pt-5">
                    {d.topFlavors.map((f) => (
                      <Bar
                        key={f.name}
                        label={f.name}
                        value={f.count}
                        max={d.maxFlavor}
                      />
                    ))}
                  </CardContent>
                </Card>
              </section>
            ) : null}
          </div>

          {d.bestValue.length > 0 ? (
            <section>
              <h2 className="mb-2 flex items-center gap-2 font-semibold">
                <TrendingUp className="size-4 text-primary" /> Best value
              </h2>
              <Card>
                <CardContent className="divide-y divide-border p-0">
                  {d.bestValue.map((v) => (
                    <div
                      key={v.name}
                      className="flex items-center justify-between gap-3 p-3"
                    >
                      <span className="truncate font-medium">{v.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {formatScore(v.bestOverall)} · {formatMoney(v.price)}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </section>
          ) : null}

          {d.recent.length > 0 ? (
            <section>
              <h2 className="mb-2 font-semibold">Recent pours</h2>
              <div className="space-y-2">
                {d.recent.map((p) => (
                  <Link key={p.id} href={`/pours/${p.id}`}>
                    <Card className="flex items-center justify-between gap-3 p-3 transition-colors hover:bg-accent">
                      <div className="min-w-0">
                        <div className="truncate font-medium">{p.productName}</div>
                        <div className="text-xs text-muted-foreground">
                          Pour #{p.pourNumber} · {formatDate(p.pouredAt)}
                        </div>
                      </div>
                      {p.overall != null ? (
                        <span className="text-lg font-semibold tabular-nums">
                          {formatScore(p.overall)}
                        </span>
                      ) : null}
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}
        </>
      )}
    </div>
  );
}
