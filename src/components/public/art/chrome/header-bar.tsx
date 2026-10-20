"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { navGroups } from "@/lib/nav";
import { paths } from "@/lib/paths";
import { Wordmark } from "../../Wordmark";

export type HeaderContacts = { phone: string; email: string; address: string };

const isActive = (pathname: string, href: string) => (href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`));
const groupActive = (pathname: string, g: (typeof navGroups)[number]) => isActive(pathname, g.href) || (g.children ?? []).some((c) => isActive(pathname, c.href));

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

function Chevron() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="hdr-chev" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m5.5 8 4.5 4.5L14.5 8" />
    </svg>
  );
}

/**
 * Client part of the public header: white bar (logo, groups, one CTA), plain dropdown lists, full-page white mobile menu.
 * Accessibility: aria-expanded/aria-controls on every toggle, ESC closes and returns focus, focus trapped in the mobile menu.
 */
export function HeaderBar({ contacts }: { contacts: HeaderContacts }) {
  const pathname = usePathname();
  const [mobile, setMobile] = useState<string | null>(null); // pathname at which the mobile menu was opened
  const [group, setGroup] = useState<{ key: string; at: string } | null>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  // Menus count as closed after any navigation.
  const isOpen = mobile === pathname;
  const openKey = group && group.at === pathname ? group.key : null;

  const closeGroup = useCallback((focus?: boolean) => {
    setGroup((g) => {
      if (g && focus) barRef.current?.querySelector<HTMLButtonElement>(`[data-group="${g.key}"]`)?.focus();
      return null;
    });
  }, []);

  // Desktop group panels: ESC closes and returns focus to the trigger; a click anywhere else closes.
  useEffect(() => {
    if (!openKey) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeGroup(true); };
    const onDown = (e: PointerEvent) => { if (!barRef.current?.contains(e.target as Node)) closeGroup(); };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => { document.removeEventListener("keydown", onKey); document.removeEventListener("pointerdown", onDown); };
  }, [openKey, closeGroup]);

  // Mobile menu: ESC closes, focus stays inside (header bar + menu), page does not scroll behind it.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setMobile(null); toggleRef.current?.focus(); return; }
      if (e.key !== "Tab") return;
      const scope = [barRef.current, menuRef.current].flatMap((r) => (r ? [...r.querySelectorAll<HTMLElement>(FOCUSABLE)] : []));
      const items = scope.filter((el) => el.offsetParent !== null && !el.closest("[hidden]"));
      const first = items[0], last = items[items.length - 1];
      if (!first || !last) return;
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    const mq = window.matchMedia("(min-width: 64rem)");
    const onMq = () => { if (mq.matches) setMobile(null); };
    document.addEventListener("keydown", onKey);
    mq.addEventListener("change", onMq);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); mq.removeEventListener("change", onMq); document.body.style.overflow = ""; };
  }, [isOpen]);

  const tel = contacts.phone ? contacts.phone.replace(/[^+\d]/g, "") : "";

  return (
    <>
      <header data-site-header className="hdr">
        <div ref={barRef} className="hdr-bar">
          <Link href="/" className="hdr-logo" aria-label="I Locandieri, cooperativa sociale: home">
            <Wordmark />
          </Link>

          <nav aria-label="Navigazione principale" className="hdr-nav">
            <ul>
              {navGroups.map((g, gi) => {
                const active = groupActive(pathname, g);
                if (!g.children) {
                  return (
                    <li key={g.href}>
                      <Link href={g.href} className="hdr-top" aria-current={isActive(pathname, g.href) ? "page" : undefined} data-active={active || undefined}>{g.label}</Link>
                    </li>
                  );
                }
                const open = openKey === g.label;
                const panelId = `hdr-panel-${gi}`;
                return (
                  <li key={g.label} className="hdr-item" onBlur={(e) => { if (open && !e.currentTarget.contains(e.relatedTarget as Node | null)) closeGroup(); }}>
                    <button
                      type="button"
                      className="hdr-top"
                      data-group={g.label}
                      data-active={active || undefined}
                      aria-expanded={open}
                      aria-controls={panelId}
                      onClick={() => setGroup(open ? null : { key: g.label, at: pathname })}
                    >
                      {g.label}
                      <Chevron />
                    </button>
                    <div id={panelId} role="group" aria-label={g.label} hidden={!open} className="hdr-panel">
                      <ul>
                        {g.children.map((c) => (
                          <li key={c.href}>
                            <Link href={c.href} className="hdr-link" aria-current={pathname === c.href ? "page" : undefined}>
                              <span className="hdr-link-t">{c.label}</span>
                              <span className="hdr-link-n">{c.note}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </li>
                );
              })}
            </ul>
          </nav>

          <Link href={paths.shop} className="pill pill-solid hdr-cta" aria-current={isActive(pathname, paths.shop) ? "page" : undefined}>
            Shop ABES <span className="arrow" aria-hidden="true">→</span>
          </Link>

          <button
            ref={toggleRef}
            type="button"
            className="hdr-burger"
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
            onClick={() => setMobile(isOpen ? null : pathname)}
          >
            <span>{isOpen ? "Chiudi" : "Menu"}</span>
            <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
              {isOpen ? <path d="m6.5 6.5 11 11M17.5 6.5l-11 11" /> : <path d="M4 9h16M4 15h16" />}
            </svg>
          </button>
        </div>
      </header>

      <div id="mobile-menu" ref={menuRef} hidden={!isOpen} className="mm">
        <nav aria-label="Navigazione mobile" className="mm-nav">
          <ul className="mm-groups">
            {navGroups.filter((g) => g.children).map((g) => {
              const subs = (g.children ?? []).filter((c) => c.href !== g.href);
              return (
                <li key={g.label} className="mm-group">
                  <Link href={g.href} className="mm-big" aria-current={pathname === g.href ? "page" : undefined}>
                    {g.label}
                  </Link>
                  {subs.length > 0 && (
                    <ul className="mm-subs">
                      {subs.map((c) => (
                        <li key={c.href}>
                          <Link href={c.href} className="mm-sub" aria-current={isActive(pathname, c.href) ? "page" : undefined}>{c.label}</Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
            <li className="mm-group">
              <ul className="mm-solo">
                {navGroups.filter((g) => !g.children).map((g) => (
                  <li key={g.href}>
                    <Link href={g.href} className="mm-big" aria-current={isActive(pathname, g.href) ? "page" : undefined}>{g.label}</Link>
                  </li>
                ))}
              </ul>
            </li>
          </ul>
          <Link href={paths.shop} className="pill pill-solid mm-cta">Shop ABES <span className="arrow" aria-hidden="true">→</span></Link>
        </nav>
        {(tel || contacts.email || contacts.address) && (
          <div className="mm-contacts">
            <p className="mm-contacts-h">Contatti</p>
            {tel && <a href={`tel:${tel}`}>{contacts.phone}</a>}
            {contacts.email && <a className="break-all" href={`mailto:${contacts.email}`}>{contacts.email}</a>}
            {contacts.address && <p>{contacts.address}</p>}
          </div>
        )}
      </div>
    </>
  );
}
