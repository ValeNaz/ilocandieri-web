"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { publicNav } from "@/lib/nav";
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
    <header className="sticky top-0 z-50 border-b border-line/70 bg-paper/90 backdrop-blur-md">
      <div className="mx-auto flex h-[4.25rem] max-w-6xl items-center justify-between gap-6 px-5 sm:px-8">
        <Link href="/" aria-label="I Locandieri - Home" className="rounded-lg">
          <Wordmark />
        </Link>

        <nav aria-label="Navigazione principale" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {publicNav.slice(1).map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link href={item.href} aria-current={active ? "page" : undefined}
                    className={cn("relative rounded-full px-3.5 py-2 text-[0.95rem] font-medium transition-colors hover:bg-paper-deep", active && "text-terracotta-deep")}>
                    {item.label}
                    {active && <span aria-hidden="true" className="absolute inset-x-3.5 -bottom-0.5 h-0.5 rounded bg-arancio" />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <button ref={btnRef} type="button" aria-expanded={isOpen} aria-controls="mobile-menu"
          onClick={() => { setOpenFor(pathname); setOpen((v) => !v); }}
          className="inline-flex size-11 items-center justify-center rounded-full border border-line-strong lg:hidden">
          <span className="sr-only">{isOpen ? "Chiudi il menu" : "Apri il menu"}</span>
          <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {isOpen ? <path d="m6 6 12 12M18 6 6 18" /> : <path d="M4 8h16M4 16h16" />}
          </svg>
        </button>
      </div>

    </header>
      <div id="mobile-menu" hidden={!isOpen} className="fixed inset-x-0 top-[4.25rem] bottom-0 z-40 overflow-y-auto bg-paper px-5 pb-10 pt-4 lg:hidden">
        <nav aria-label="Navigazione mobile">
          <ul className="divide-y divide-line">
            {publicNav.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link href={item.href} aria-current={active ? "page" : undefined}
                    className={cn("flex min-h-14 items-center justify-between font-display text-2xl", active && "text-terracotta-deep")}>
                    {item.label}
                    <span aria-hidden="true" className="text-arancio">→</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </>
  );
}
