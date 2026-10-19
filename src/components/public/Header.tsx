"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { publicNav } from "@/lib/nav";
import { paths } from "@/lib/paths";
import { cn } from "@/lib/utils";
import { Wordmark } from "./Wordmark";

const isActive = (pathname: string, href: string) => (href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`));

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [openFor, setOpenFor] = useState(pathname);
  const btnRef = useRef<HTMLButtonElement>(null);
  // Menu is considered closed after any navigation.
  const isOpen = open && openFor === pathname;

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        btnRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      <header className="sticky top-0 z-50 h-[var(--header-h)] border-b border-line bg-paper/95 backdrop-blur-sm">
        <div className="mx-auto flex h-full max-w-[88rem] items-center justify-between gap-6 px-5 sm:px-8">
          <Link href="/" aria-label="I Locandieri - Home" className="rounded-lg">
            <Wordmark />
          </Link>

          <nav aria-label="Navigazione principale" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {publicNav.slice(1).map((item) => {
                const active = isActive(pathname, item.href);
                const shop = item.href === paths.shop;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "inline-flex min-h-10 items-center px-3.5 text-[0.95rem] font-medium",
                        shop ? "ml-2 rounded-full bg-terracotta px-4 font-semibold text-white transition-colors hover:bg-terracotta-deep" : "marker text-ink-soft hover:text-ink aria-[current=page]:text-ink",
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <button
            ref={btnRef}
            type="button"
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
            onClick={() => { setOpenFor(pathname); setOpen((v) => !v); }}
            className="inline-flex min-h-11 items-center gap-2.5 rounded-full border border-line-strong px-4 text-sm font-semibold lg:hidden"
          >
            {isOpen ? "Chiudi" : "Menu"}
            <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {isOpen ? <path d="m6 6 12 12M18 6 6 18" /> : <path d="M4 8h16M4 16h16" />}
            </svg>
          </button>
        </div>
        <div aria-hidden="true" className="progress-bar" />
      </header>

      <div id="mobile-menu" hidden={!isOpen} className="fixed inset-x-0 bottom-0 top-[var(--header-h)] z-40 overflow-y-auto bg-paper px-5 pb-10 pt-4 text-ink lg:hidden">
        <nav aria-label="Navigazione mobile">
          <ol className="grid gap-1">
            {publicNav.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn("flex min-h-14 items-center border-b border-line text-2xl font-semibold", active && "text-terracotta-deep")}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ol>
        </nav>
      </div>
    </>
  );
}
