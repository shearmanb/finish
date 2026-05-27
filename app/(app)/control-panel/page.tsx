import Link from "next/link";
import {
  Citrus,
  Gauge,
  ListChecks,
  Factory,
  Wine,
  MapPin,
  Hand,
  Layers,
  Store,
  Tag,
  Wheat,
  Flame,
  ChevronRight,
} from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { Card } from "@/components/ui/card";

const SECTIONS = [
  {
    href: "/control-panel/flavors",
    title: "Flavors & Categories",
    desc: "Your editable flavor wheel.",
    icon: Citrus,
  },
  {
    href: "/control-panel/dimensions",
    title: "Rating Dimensions",
    desc: "Scored dimensions, scales & t8ke labels.",
    icon: Gauge,
  },
  {
    href: "/control-panel/guided-steps",
    title: "Guided Tasting Steps",
    desc: "The step-by-step tasting script.",
    icon: ListChecks,
  },
  {
    href: "/control-panel/phases",
    title: "Tasting Phases",
    desc: "Nose, palate, finish…",
    icon: Layers,
  },
  {
    href: "/control-panel/bottle-types",
    title: "Bottle Types",
    desc: "Bourbon, Rye, sub-types…",
    icon: Tag,
  },
  {
    href: "/control-panel/mashBill",
    title: "Mash Bill Options",
    desc: "High rye, wheated, etc.",
    icon: Wheat,
  },
  {
    href: "/control-panel/finishTypes",
    title: "Finish Types",
    desc: "Port, Sherry, Madeira…",
    icon: Flame,
  },
  {
    href: "/control-panel/distilleries",
    title: "Distilleries",
    desc: "Makers & brands.",
    icon: Factory,
  },
  {
    href: "/control-panel/stores",
    title: "Stores",
    desc: "Where you buy bottles.",
    icon: Store,
  },
  {
    href: "/control-panel/glassware",
    title: "Glassware",
    desc: "Glencairn, copita, rocks…",
    icon: Wine,
  },
  {
    href: "/control-panel/locations",
    title: "Locations",
    desc: "Where you taste.",
    icon: MapPin,
  },
  {
    href: "/control-panel/mouthfeel",
    title: "Mouthfeel",
    desc: "Texture quick-select.",
    icon: Hand,
  },
];

export default function ControlPanelPage() {
  return (
    <div>
      <PageHeader
        title="Control Panel"
        subtitle="Tweak every list the app uses — no code required."
      />
      <div className="grid gap-3 sm:grid-cols-2">
        {SECTIONS.map((s) => {
          const Icon = s.icon;
          return (
            <Link key={s.href} href={s.href}>
              <Card className="flex items-center gap-3 p-4 transition-colors hover:bg-accent">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/12 text-primary">
                  <Icon className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="font-medium">{s.title}</div>
                  <div className="truncate text-sm text-muted-foreground">
                    {s.desc}
                  </div>
                </div>
                <ChevronRight className="size-4 text-muted-foreground" />
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
