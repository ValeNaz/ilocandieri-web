"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminPaths } from "@/lib/paths";
import { cn } from "@/lib/utils";

const tabs = [
  { href: adminPaths.email, label: "Modelli dei messaggi", match: (p: string) => p === adminPaths.email || p.startsWith(`${adminPaths.email}/modelli`) },
  { href: adminPaths.emailOutbox, label: "Registro degli invii", match: (p: string) => p.startsWith(adminPaths.emailOutbox) },
];

export function EmailTabs() {
  const pathname = usePathname();
  return (
    <nav aria-label="Sezioni email" className="mb-6 flex flex-wrap gap-2">
      {tabs.map((t) => {
        const active = t.match(pathname);
        return (
          <Link key={t.href} href={t.href} aria-current={active ? "page" : undefined}
            className={cn("inline-flex min-h-10 items-center rounded-full border px-4 text-sm font-medium transition-colors", active ? "border-terracotta bg-terracotta-soft text-terracotta-deep" : "border-line-strong bg-card hover:bg-paper-deep")}>
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
