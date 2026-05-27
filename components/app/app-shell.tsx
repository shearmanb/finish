"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Wine,
  Plus,
  Star,
  SlidersHorizontal,
  LogOut,
  Boxes,
} from "lucide-react";
import { logout } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Home", icon: Home, exact: true },
  { href: "/bottles", label: "Bottles", icon: Wine },
  { href: "/pours/new", label: "Pour", icon: Plus, primary: true },
  { href: "/wishlist", label: "Wishlist", icon: Star },
  { href: "/control-panel", label: "Settings", icon: SlidersHorizontal },
];

const SIDEBAR = [
  { href: "/", label: "Dashboard", icon: Home, exact: true },
  { href: "/bottles", label: "Bottles", icon: Wine },
  { href: "/products", label: "Expressions", icon: Boxes },
  { href: "/wishlist", label: "Wishlist", icon: Star },
  { href: "/control-panel", label: "Control Panel", icon: SlidersHorizontal },
];

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(href + "/");
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-svh md:pl-60">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-border bg-card/60 backdrop-blur md:flex">
        <Link href="/" className="flex items-center gap-2 px-5 py-5">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary/12 text-lg">
            🥃
          </span>
          <span className="text-lg font-semibold tracking-tight">Finish</span>
        </Link>
        <nav className="flex-1 space-y-1 px-3">
          {SIDEBAR.map((item) => {
            const active = isActive(pathname, item.href, item.exact);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/12 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                <Icon className="size-4.5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3">
          <Link
            href="/pours/new"
            className="mb-2 flex items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
          >
            <Plus className="size-4" /> New Pour
          </Link>
          <form action={logout}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <LogOut className="size-4.5" /> Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile header */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-background/80 px-4 py-3 backdrop-blur md:hidden">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-lg">🥃</span>
          <span className="font-semibold tracking-tight">Finish</span>
        </Link>
        <form action={logout}>
          <button
            type="submit"
            className="rounded-md p-2 text-muted-foreground hover:text-foreground"
            aria-label="Sign out"
          >
            <LogOut className="size-5" />
          </button>
        </form>
      </header>

      <main className="mx-auto w-full max-w-3xl px-4 pb-28 pt-5 md:max-w-4xl md:px-8 md:pb-12">
        {children}
      </main>

      {/* Mobile bottom tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/90 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-3xl items-stretch justify-around">
          {NAV.map((item) => {
            const active = isActive(pathname, item.href, item.exact);
            const Icon = item.icon;
            if (item.primary) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex flex-1 items-center justify-center py-1.5"
                  aria-label={item.label}
                >
                  <span className="flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md">
                    <Icon className="size-6" />
                  </span>
                </Link>
              );
            }
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <Icon className="size-5" />
                {item.label}
              </Link>
            );
          })}
        </div>
        <div className="h-[env(safe-area-inset-bottom)]" />
      </nav>
    </div>
  );
}
