"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { Wordmark } from "@/components/public/Wordmark";
import { adminNav, type AdminBadges } from "@/lib/admin-nav";
import { adminPaths } from "@/lib/paths";
import { CommandPalette, openPalette } from "./CommandPalette";
import { Icon } from "./icons";

const noop = () => () => {};
const isMac = () => /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
const initials = (s: string) => s.split(/[\s@.]+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join("");

/**
 * Responsive admin shell: fixed sidebar on desktop, slide-over drawer on mobile, command palette (⌘K) everywhere.
 * `footer` = the logout control; `badges` = live counts of what is waiting (shown next to their section).
 */
export function AdminShell({ children, footer, userLabel, badges }: { children: ReactNode; footer: ReactNode; userLabel: string; badges: AdminBadges }) {
  const pathname = usePathname();
  const [openFor, setOpenFor] = useState<string | null>(null);
  const open = openFor === pathname;
  const mac = useSyncExternalStore(noop, isMac, () => true);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenFor(null);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const search = (
    <button type="button" onClick={() => { setOpenFor(null); openPalette(); }} className="adm-search">
      <Icon name="search" className="size-[1.05rem]" />
      <span className="flex-1 text-left">Cerca o vai a…</span>
      <kbd className="adm-kbd">{mac ? "⌘" : "Ctrl"} K</kbd>
    </button>
  );

  const aside = (
    <div className="adm-aside">
      <div className="flex h-[4.25rem] shrink-0 items-center justify-between gap-2 px-5">
        <Link href={adminPaths.dashboard} aria-label="Dashboard del pannello" className="rounded-lg"><Wordmark compact /></Link>
        <button type="button" onClick={() => setOpenFor(null)} aria-label="Chiudi il menu" className="adm-iconbtn lg:hidden"><Icon name="close" /></button>
      </div>
      <div className="px-3 pb-2">{search}</div>
      <nav aria-label="Navigazione pannello" className="flex-1 overflow-y-auto px-3 pb-4">
        {adminNav.map((g) => (
          <div key={g.title} className="pt-4">
            <p className="px-3 pb-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.15em] text-ink-soft/80">{g.title}</p>
            <ul className="space-y-px">
              {g.items.map((it) => {
                const active = it.exact ? pathname === it.href : pathname === it.href || pathname.startsWith(`${it.href}/`);
                const n = it.badge ? badges[it.badge] : 0;
                return (
                  <li key={it.href}>
                    <Link href={it.href} title={it.hint} aria-current={active ? "page" : undefined} className="adm-nav-link">
                      <Icon name={it.icon} className="adm-nav-ic" />
                      <span className="flex-1 truncate">{it.label}</span>
                      {n > 0 && <span className="adm-count" aria-label={`${n} da guardare`}>{n > 99 ? "99+" : n}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
      <div className="shrink-0 space-y-1 border-t border-line p-3">
        <a href="/" target="_blank" rel="noopener noreferrer" className="adm-nav-link">
          <Icon name="external" className="adm-nav-ic" />
          <span className="flex-1">Vedi il sito</span>
          <span className="sr-only"> (nuova scheda)</span>
        </a>
        <div className="flex items-center gap-1">
          <Link href={adminPaths.profile} aria-current={pathname.startsWith(adminPaths.profile) ? "page" : undefined} className="adm-nav-link min-w-0 flex-1 !py-2">
            <span className="adm-avatar" aria-hidden="true">{initials(userLabel) || "?"}</span>
            <span className="min-w-0 flex-1 leading-tight">
              <span className="block truncate text-[0.9rem] font-semibold">{userLabel}</span>
              <span className="block text-xs text-ink-soft">Profilo</span>
            </span>
          </Link>
          {footer}
        </div>
      </div>
    </div>
  );

  return (
    <div className="adm min-h-dvh lg:grid lg:grid-cols-[16.5rem_1fr]">
      <a href="#contenuto-admin" className="sr-only-focusable fixed left-4 top-4 z-[200] rounded-full bg-ink px-5 py-3 text-paper">Vai al contenuto</a>
      <aside className="sticky top-0 hidden h-dvh border-r border-line lg:block">{aside}</aside>

      <div className="adm-topbar lg:hidden">
        <Link href={adminPaths.dashboard} aria-label="Dashboard del pannello"><Wordmark compact /></Link>
        <div className="flex items-center gap-1.5">
          <button type="button" onClick={openPalette} aria-label="Cerca nel pannello" className="adm-iconbtn"><Icon name="search" /></button>
          <button type="button" aria-expanded={open} aria-controls="admin-drawer" onClick={() => setOpenFor(open ? null : pathname)} className="adm-iconbtn relative">
            <Icon name="menu" /><span className="sr-only">Menu</span>
            {badges.registrations + badges.applications + badges.messages + badges.email > 0 && <span className="adm-dot" aria-hidden="true" />}
          </button>
        </div>
      </div>
      <div className="adm-scrim lg:hidden" data-open={open || undefined} onClick={() => setOpenFor(null)} aria-hidden="true" />
      <div id="admin-drawer" className="adm-drawer lg:hidden" data-open={open || undefined} inert={!open}>{aside}</div>

      <main id="contenuto-admin" tabIndex={-1} className="min-w-0 px-4 pb-16 pt-6 outline-none sm:px-8 lg:px-12 lg:pt-10">
        <div className="adm-page mx-auto max-w-6xl" key={pathname}>{children}</div>
      </main>
      <CommandPalette />
    </div>
  );
}
