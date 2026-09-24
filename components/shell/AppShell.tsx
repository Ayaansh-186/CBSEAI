"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  CalendarDays,
  GraduationCap,
  Menu,
  MessageSquare,
  Network,
  SquarePen,
  X,
} from "lucide-react";
import { APP } from "@/lib/config";

const NAV = [
  { href: "/", label: "Chat", icon: MessageSquare },
  { href: "/subjects", label: "Chapters", icon: BookOpen },
  { href: "/graph", label: "Weak spots", icon: Network },
  { href: "/plan", label: "Study plan", icon: CalendarDays },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const sidebar = (
    <div className="flex h-full flex-col p-2.5">
      <div className="flex items-center justify-between px-1 pb-2">
        <Link
          href="/"
          onClick={() => setMobileOpen(false)}
          className="flex min-w-0 items-center gap-2 rounded-lg px-2 py-2 text-[14px]"
          style={{ fontWeight: 600 }}
        >
          <span
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
            style={{ background: "var(--assistant-avatar)", color: "var(--surface)" }}
          >
            <GraduationCap size={16} strokeWidth={2} />
          </span>
          <span className="truncate">{APP.name}</span>
        </Link>
        <Link
          href="/"
          onClick={() => setMobileOpen(false)}
          className="flex h-9 w-9 items-center justify-center rounded-lg"
          aria-label="New chat"
          title="New chat"
        >
          <SquarePen size={19} />
        </Link>
      </div>

      <nav className="flex flex-col gap-1">
        {NAV.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="flex h-10 items-center gap-3 rounded-lg px-3 text-[14px] transition-colors"
              style={{
                background: active ? "var(--hover)" : "transparent",
                color: "var(--text)",
                fontWeight: active ? 550 : 400,
              }}
            >
              <item.icon size={18} strokeWidth={1.8} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t px-1 pt-2" style={{ borderColor: "var(--rule)" }}>
        <div className="flex items-center gap-2.5 rounded-lg px-2 py-2">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-full text-[12px]"
            style={{ background: "var(--input)", fontWeight: 600 }}
          >
            10
          </span>
          <span className="min-w-0">
            <span className="block truncate text-[13px]" style={{ fontWeight: 550 }}>
              CBSE Class 10
            </span>
            <span className="block text-[11px]" style={{ color: "var(--text-faint)" }}>
              UI preview
            </span>
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-dvh" style={{ background: "var(--surface)" }}>
      <aside
        className="hidden h-dvh w-[260px] shrink-0 md:block"
        style={{ background: "var(--sidebar)" }}
      >
        {sidebar}
      </aside>

      <header
        className="fixed inset-x-0 top-0 z-30 flex h-14 items-center justify-between px-3 md:hidden"
        style={{ background: "var(--surface)" }}
      >
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-lg"
          aria-label="Open menu"
        >
          <Menu size={21} />
        </button>
        <Link href="/" className="text-[15px]" style={{ fontWeight: 600 }}>
          {APP.name}
        </Link>
        <Link
          href="/"
          className="flex h-10 w-10 items-center justify-center rounded-lg"
          aria-label="New chat"
        >
          <SquarePen size={20} />
        </Link>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/45"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          />
          <aside
            className="relative h-full w-[min(86vw,320px)]"
            style={{ background: "var(--sidebar)" }}
          >
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-lg"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      <main className="flex min-h-dvh min-w-0 flex-1 flex-col pt-14 md:pt-0">
        {children}
      </main>
    </div>
  );
}
