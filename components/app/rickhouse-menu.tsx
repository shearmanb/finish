"use client";

import * as Popover from "@radix-ui/react-popover";
import { Home } from "lucide-react";
import { cn } from "@/lib/utils";

type RickHouseApp = {
  name: string;
  tag: string;
  href: string | null; // null = current app
};

const APPS: RickHouseApp[] = [
  { name: "Beacon", tag: "Tracking", href: "https://shearmanb.github.io/beacon/" },
  {
    name: "Unicorn Slayer",
    tag: "Hunting",
    href: "https://shearmanb.github.io/drop-tracker/",
  },
  {
    name: "Cellar",
    tag: "Bottle DB",
    href: "https://cellar-production-1ba7.up.railway.app/bottles",
  },
  { name: "Finish", tag: "Tasting", href: null },
];

export function RickHouseMenu({ className }: { className?: string }) {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          type="button"
          className={cn(
            "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
            className,
          )}
        >
          <Home className="size-4.5" />
          RickHouse
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={8}
          className="z-50 w-60 rounded-xl border border-border bg-popover p-1.5 text-popover-foreground shadow-lg"
        >
          <p className="px-2.5 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            RickHouse apps
          </p>
          {APPS.map((app) =>
            app.href ? (
              <a
                key={app.name}
                href={app.href}
                className="flex items-center justify-between gap-3 rounded-lg px-2.5 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <span className="font-medium">{app.name}</span>
                <span className="text-xs uppercase tracking-wide text-muted-foreground">
                  {app.tag}
                </span>
              </a>
            ) : (
              <div
                key={app.name}
                className="flex items-center justify-between gap-3 rounded-lg px-2.5 py-2 text-sm opacity-60"
              >
                <span className="font-medium">{app.name}</span>
                <span className="text-xs uppercase tracking-wide text-primary">
                  here
                </span>
              </div>
            ),
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
