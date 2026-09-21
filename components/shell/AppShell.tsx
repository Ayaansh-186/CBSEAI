"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { APP } from "@/lib/config";
import { Icon } from "@/components/ui/Icon";

const NAV = [
  { href: "/", label: "Ask", icon: Icon.Chat },
  { href: "/subjects", label: "Chapters", icon: Icon.Book },
  { href: "/graph", label: "Weak spots", icon: Icon.Graph },
  { href: "/plan", label: "Plan", icon: Icon.Calendar },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <div
      className="flex min-h-dvh"
      style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
    >
      {/* Desktop: a narrow vertical rail. Keeps the sheet as wide as possible. */}
      <nav className="hidden w-[188px] shrink-0 flex-col border-r px-4 py-6 md:flex"
        style={{ borderColor: "var(--rule)" }}
      >
        <Link href="/" className="mb-8 block">
          <span
            className="block text-[22px] leading-none tracking-[-0.03em]"
            style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}
          >
            {APP.name}
          </span>
          <span
            className="mt-1 block text-[11.5px] leading-tight"
            style={{ color: "var(--text-faint)" }}
          >
            Class {APP.grade} · {APP.board}
          </span>
        </Link>

        <div className="flex flex-col gap-0.5">
          {NAV.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[14px] transition-colors"
                style={{
                  color: active ? "var(--accent)" : "var(--text-soft)",
                  background: active ? "var(--accent-soft)" : "transparent",
                  fontWeight: active ? 600 : 450,
                }}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </div>

        <p
          className="mt-auto text-[11.5px] leading-snug"
          style={{ color: "var(--text-faint)" }}
        >
          Pinned to the NCERT edition your board sets this year.
        </p>
      </nav>

      <main className="flex min-w-0 flex-1 flex-col pb-[68px] md:pb-0">
        {children}
      </main>

      {/* Mobile: thumb-reach bar. */}
      <nav
        className="fixed inset-x-0 bottom-0 z-30 flex border-t md:hidden"
        style={{
          borderColor: "var(--rule)",
          background:
            "color-mix(in srgb, var(--surface) 88%, transparent)",
          backdropFilter: "blur(14px)",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        {NAV.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-1 flex-col items-center gap-1 py-2.5 text-[10.5px]"
              style={{
                color: active ? "var(--accent)" : "var(--text-faint)",
                fontWeight: active ? 600 : 450,
              }}
            >
              <item.icon size={21} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
