"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { Wordmark } from "@/components/public/Wordmark";
import { adminNav } from "@/lib/admin-nav";
import { adminPaths } from "@/lib/paths";
import { cn } from "@/lib/utils";

/** Responsive admin shell: fixed sidebar on desktop, slide-over drawer on mobile. `footer` = profile/logout slot. */
export function AdminShell({ children, footer, userLabel }: { children: ReactNode; footer: ReactNode; userLabel: string }) {
  const pathname = usePathname();
  const [openFor, setOpenFor] = useState<string | null>(null);
  const open = openFor === pathname;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenFor(null);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const nav = (
    <nav aria-label="Navigazione pannello" className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
      {adminNav.map((g) => (
        <div key={g.title}>
          <p className="px-3 pb-2 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-ink-soft">{g.title}</p>
          <ul className="space-y-0.5">
            {g.items.map((it) => {
              const active = it.exact ? pathname === it.href : pathname === it.href || pathname.startsWith(`${it.href}/`);
              return (
                <li key={it.href}>
                  <Link href={it.href} title={it.hint} aria-current={active ? "page" : undefined}
                    className={cn("flex min-h-10 items-center rounded-xl px-3 text-[0.95rem] font-medium transition-colors hover:bg-paper-deep",
                      active && "bg-terracotta-soft text-terracotta-deep hover:bg-terracotta-soft")}>
                    {it.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );

  const aside = (
    <div className="flex h-full flex-col bg-card">
      <div className="flex h-16 shrink-0 items-center border-b border-line px-5"><Wordmark className="text-xl" /></div>
      {nav}
      <div className="shrink-0 space-y-1 border-t border-line p-3">
        <a href="/" target="_blank" rel="noopener noreferrer" className="flex min-h-10 items-center rounded-xl px-3 text-[0.95rem] hover:bg-paper-deep">
          Vedi il sito<span className="sr-only"> (nuova scheda)</span><span aria-hidden="true" className="ml-1.5 text-ink-soft">↗</span>
        </a>
        <Link href={adminPaths.profile} className={cn("flex min-h-10 items-center rounded-xl px-3 text-[0.95rem] hover:bg-paper-deep", pathname.startsWith(adminPaths.profile) && "bg-terracotta-soft text-terracotta-deep")}>
          Profilo <span className="ml-auto max-w-[8rem] truncate text-xs text-ink-soft">{userLabel}</span>
        </Link>
        {footer}
      </div>
    </div>
  );

  return (
    <div className="min-h-dvh bg-paper lg:grid lg:grid-cols-[17rem_1fr]">
      <a href="#contenuto-admin" className="sr-only-focusable fixed left-4 top-4 z-[200] rounded-full bg-ink px-5 py-3 text-paper">Vai al contenuto</a>
      <aside className="sticky top-0 hidden h-dvh border-r border-line lg:block">{aside}</aside>

      <div className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-line bg-card/95 px-4 backdrop-blur lg:hidden">
        <Wordmark className="text-lg" />
        <button type="button" aria-expanded={open} aria-controls="admin-drawer" onClick={() => setOpenFor(open ? null : pathname)}
          className="inline-flex min-h-10 items-center rounded-full border border-line-strong px-4 text-sm font-medium">Menu</button>
      </div>
      {open && <button type="button" aria-label="Chiudi il menu" className="fixed inset-0 z-40 bg-ink/50 lg:hidden" onClick={() => setOpenFor(null)} />}
      <div id="admin-drawer" hidden={!open} className="fixed inset-y-0 left-0 z-50 w-[18rem] max-w-[85vw] shadow-pop lg:hidden">{aside}</div>

      <main id="contenuto-admin" tabIndex={-1} className="min-w-0 px-4 py-8 outline-none sm:px-8 lg:px-12 lg:py-12">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>
    </div>
  );
}
