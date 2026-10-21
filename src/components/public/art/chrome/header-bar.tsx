"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { navGroups } from "@/lib/nav";
import { paths } from "@/lib/paths";
import { Wordmark } from "../../Wordmark";
import { EmailText } from "@/components/public/EmailText";
import { NavIcon } from "./nav-icons";
import { barPathCompact, barPathDesktop, hillsPath, panelPath } from "./organic";

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

function Arrow({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12h15.5M13.5 6l6 6-6 6" />
    </svg>
  );
}

/**
 * Measures the element the svg sits in (its parent), re-measuring on any resize of it or of `watch` (children whose
 * width moves the geometry, e.g. when the web font arrives). `read` turns the element into the numbers a path needs.
 */
function useMeasure<T>(read: (host: HTMLElement) => T, watch = "") {
  const ref = useRef<HTMLSpanElement>(null);
  const [m, setM] = useState<T | null>(null);
  const readRef = useRef(read);
  useLayoutEffect(() => { readRef.current = read; });
  useLayoutEffect(() => {
    const host = ref.current?.parentElement;
    if (!host) return;
    let last = "";
    const update = () => {
      const next = readRef.current(host);
      const key = JSON.stringify(next);
      if (key !== last) { last = key; setM(next); }
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(host);
    if (watch) host.querySelectorAll(watch).forEach((el) => ro.observe(el));
    return () => ro.disconnect();
  }, [watch]);
  return [ref, m] as const;
}

type BarGeo = { w: number; h: number; desk: { logoRight: number; ctaLeft: number } | null };
function readBar(bar: HTMLElement): BarGeo {
  const w = bar.offsetWidth, h = bar.offsetHeight;
  const nav = bar.querySelector<HTMLElement>(".hdr-nav");
  const logo = bar.querySelector<HTMLElement>(".hdr-logo");
  const cta = bar.querySelector<HTMLElement>(".hdr-cta");
  if (!nav || !nav.offsetWidth || !logo || !cta) return { w, h, desk: null };
  return { w, h, desk: { logoRight: logo.offsetLeft + logo.offsetWidth, ctaLeft: cta.offsetLeft } };
}

/**
 * The bar's organic outline (organic.ts): the full symmetric silhouette when the links are shown, a soft capsule when
 * compact. Ivory fill, thin ink line drawn once. Before it is measured, chrome.css draws a plain pill.
 */
function BarShape() {
  const [ref, g] = useMeasure(readBar, ".hdr-nav, .hdr-logo, .hdr-cta");
  return (
    <span ref={ref} className="hdr-shape" aria-hidden="true">
      {g && (
        <svg width={g.w} height={g.h} viewBox={`0 0 ${g.w} ${g.h}`}>
          <path d={g.desk ? barPathDesktop(g.w, g.desk) : barPathCompact(g.w, g.h)} className="hdr-shape-body" />
        </svg>
      )}
    </span>
  );
}

/** A panel's outline, grown from the bar through a cusp centred under its trigger; yellow hills clipped in its foot. */
function PanelShape({ id }: { id: string }) {
  const [ref, g] = useMeasure((panel) => {
    const li = panel.parentElement;
    return { w: panel.offsetWidth, h: panel.offsetHeight, nx: li ? -panel.offsetLeft + li.offsetWidth / 2 : 60 };
  });
  const p = g && panelPath(g.w, g.h, g.nx);
  return (
    <span ref={ref} className="hdr-pshape" aria-hidden="true">
      {g && p && (
        <svg width={g.w} height={g.h} viewBox={`0 0 ${g.w} ${g.h}`}>
          <defs><clipPath id={`${id}-clip`}><path d={p.clip} /></clipPath></defs>
          <path d={p.fill} className="hdr-pshape-fill" />
          <path d={hillsPath(g.w, g.h)} clipPath={`url(#${id}-clip)`} className="hdr-hills" />
          <path d={p.stroke} className="hdr-pshape-line" />
        </svg>
      )}
    </span>
  );
}

/**
 * Behind the left end: a green leaf (top, diagonal) over a yellow petal (bottom-left), both mostly hidden by the bar.
 * Off the right end: three short sun rays in a fan.
 * Desktop only; they stir when the bar is hovered, and belong to the hero: once it is scrolled away they tuck in behind
 * the bar, and come back out with it (chrome.css).
 */
function Decor() {
  return (
    <>
      <svg className="hdr-deco hdr-deco-petal" viewBox="0 0 124 70" aria-hidden="true" focusable="false">
        <path d="M118 22 C108 46 72 66 38 66 C14 66 2 56 4 44 C6 30 28 18 58 14 C86 10 112 10 118 22 Z" fill="var(--c-yellow)" />
      </svg>
      <svg className="hdr-deco hdr-deco-leaf" viewBox="0 0 92 72" aria-hidden="true" focusable="false">
        <path d="M8 8 C30 4 62 18 80 42 C86 50 86 60 78 64 C70 68 60 64 52 58 C30 42 12 26 8 8 Z" fill="var(--c-green)" />
        <path d="M12 12 C34 26 56 42 76 60" fill="none" stroke="color-mix(in oklab, var(--c-green) 70%, var(--c-ink))" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
      <svg className="hdr-deco hdr-deco-rays" viewBox="0 0 44 64" aria-hidden="true" focusable="false">
        {["M6 18 L24 5", "M7 32 L35 31", "M6 46 L24 59"].map((d, i) => (
          <g key={d} className="hdr-ray" style={{ "--i": i } as CSSProperties}>
            <path d={d} stroke="var(--c-yellow)" strokeWidth="8" strokeLinecap="round" />
          </g>
        ))}
      </svg>
    </>
  );
}

/**
 * Client part of the public header: an organic ivory bar (logo, groups, one CTA) whose group panels grow out of its
 * bottom line under their trigger, and a full-page white mobile menu with collapsible groups.
 * Groups open on hover (mouse, with a short grace on leave) and on click; a click on a hover-opened group pins it.
 * Accessibility: aria-expanded/aria-controls on every toggle, ESC closes and returns focus, focus trapped in the mobile menu.
 */
export function HeaderBar({ contacts }: { contacts: HeaderContacts }) {
  const pathname = usePathname();
  const [mobile, setMobile] = useState<string | null>(null); // pathname at which the mobile menu was opened
  const [group, setGroup] = useState<{ key: string; at: string; by: "hover" | "click" } | null>(null);
  const [mmOpen, setMmOpen] = useState<string | null>(null); // mobile: the expanded group (null = the current page's group)
  const leaveTimer = useRef<number | undefined>(undefined);
  const barRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  // Menus count as closed after any navigation.
  const isOpen = mobile === pathname;
  // The mobile menu plays a short exit before it is hidden (chrome.css .mm[data-closing]); reduced motion: at once.
  const [closing, setClosing] = useState(false);
  const closeTimer = useRef<number | undefined>(undefined);
  const closeMobile = useCallback(() => {
    window.clearTimeout(closeTimer.current);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setMobile(null); return; }
    setClosing(true);
    closeTimer.current = window.setTimeout(() => { setMobile(null); setClosing(false); }, 260);
  }, []);
  useEffect(() => () => window.clearTimeout(closeTimer.current), []);
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
      if (e.key === "Escape") { closeMobile(); toggleRef.current?.focus(); return; }
      if (e.key !== "Tab") return;
      const scope = [barRef.current, menuRef.current].flatMap((r) => (r ? [...r.querySelectorAll<HTMLElement>(FOCUSABLE)] : []));
      const items = scope.filter((el) => el.offsetParent !== null && !el.closest("[hidden]"));
      const first = items[0], last = items[items.length - 1];
      if (!first || !last) return;
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    const mq = window.matchMedia("(min-width: 73.75rem)");
    const onMq = () => { if (mq.matches) setMobile(null); };
    document.addEventListener("keydown", onKey);
    mq.addEventListener("change", onMq);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); mq.removeEventListener("change", onMq); document.body.style.overflow = ""; };
  }, [isOpen, closeMobile]);

  useEffect(() => () => window.clearTimeout(leaveTimer.current), []);

  // The decorations live with the hero (the page's first block): gone once its bottom rises above mid-screen.
  const [decoAway, setDecoAway] = useState(false);
  useEffect(() => {
    const main = document.getElementById("contenuto");
    const hero = main && [...main.children].find((el) => el instanceof HTMLElement && el.offsetHeight > 0);
    if (!hero) return;
    // root = the lower half of the screen: the hero leaves it only by rising above the middle
    const io = new IntersectionObserver(([e]) => { if (e) setDecoAway(!e.isIntersecting && e.boundingClientRect.top < (e.rootBounds?.top ?? 0)); }, { rootMargin: "-50% 0px 0px 0px" });
    io.observe(hero);
    return () => io.disconnect();
  }, [pathname]);
  const hoverOpen = (key: string) => {
    window.clearTimeout(leaveTimer.current);
    setGroup((g) => (g && g.key === key && g.at === pathname ? g : { key, at: pathname, by: "hover" }));
  };
  const hoverLeave = () => {
    window.clearTimeout(leaveTimer.current);
    leaveTimer.current = window.setTimeout(() => setGroup((g) => (g?.by === "hover" ? null : g)), 180);
  };
  const mmGroup = mmOpen ?? navGroups.find((g) => g.children && groupActive(pathname, g))?.label ?? null;

  const tel = contacts.phone ? contacts.phone.replace(/[^+\d]/g, "") : "";

  return (
    <>
      <header data-site-header className="hdr">
        <div ref={barRef} className="hdr-bar" data-deco={decoAway ? "away" : undefined}>
          <BarShape />
          <Decor />
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
                  <li key={g.label} className="hdr-item"
                    onBlur={(e) => { if (open && !e.currentTarget.contains(e.relatedTarget as Node | null)) closeGroup(); }}
                    onPointerEnter={(e) => { if (e.pointerType === "mouse") hoverOpen(g.label); }}
                    onPointerLeave={(e) => { if (e.pointerType === "mouse") hoverLeave(); }}>
                    <button
                      type="button"
                      className="hdr-top"
                      data-group={g.label}
                      data-active={active || undefined}
                      aria-expanded={open}
                      aria-controls={panelId}
                      onClick={() => setGroup(open && group?.by === "click" ? null : { key: g.label, at: pathname, by: "click" })}
                    >
                      {g.label}
                      <Chevron />
                    </button>
                    <div id={panelId} role="group" aria-label={g.label} hidden={!open} className="hdr-panel">
                      {open && <PanelShape id={panelId} />}
                      <ul>
                        {g.children.map((c) => (
                          <li key={c.href}>
                            <Link href={c.href} className="hdr-link" aria-current={pathname === c.href ? "page" : undefined}>
                              <NavIcon href={c.href} className="hdr-link-ic" />
                              <span className="hdr-link-tx">
                                <span className="hdr-link-t">{c.label}</span>
                                <span className="hdr-link-n">{c.note}</span>
                              </span>
                              <Arrow className="hdr-link-ar" />
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

          <a href={paths.abesShop} target="_blank" rel="noopener noreferrer" className="pill pill-solid hdr-cta">
            Shop ABES<span className="sr-only"> (si apre in una nuova scheda)</span> <span className="arrow"><Arrow className="hdr-cta-ar" /></span>
          </a>

          <button
            ref={toggleRef}
            type="button"
            className="hdr-burger"
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
            data-open={isOpen && !closing ? "" : undefined}
            onClick={() => { if (isOpen) closeMobile(); else { window.clearTimeout(closeTimer.current); setClosing(false); setMobile(pathname); } }}
          >
            {/* both words stacked in one cell, one slides in as the other slides out; the two lines fold into an X */}
            <span className="hdr-burger-w">
              <span aria-hidden={isOpen}>Menu</span>
              <span aria-hidden={!isOpen}>Chiudi</span>
            </span>
            <svg aria-hidden="true" viewBox="0 0 24 24" className="hdr-burger-ic size-5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
              <path d="M4 9h16" /><path d="M4 15h16" />
            </svg>
          </button>
        </div>
      </header>

      <div id="mobile-menu" ref={menuRef} hidden={!isOpen} className="mm" data-closing={closing ? "" : undefined}>
        <nav aria-label="Navigazione mobile" className="mm-nav">
          <ul className="mm-groups">
            {navGroups.filter((g) => g.children).map((g, gi) => {
              // same entries as the desktop panels, one group open at a time (the current page's group to start with)
              const subs = g.children ?? [];
              const expanded = mmGroup === g.label;
              return (
                <li key={g.label} className="mm-group" style={{ "--k": gi } as CSSProperties}>
                  <button type="button" className="mm-big mm-toggle" aria-expanded={expanded} aria-controls={`mm-subs-${gi}`}
                    data-active={groupActive(pathname, g) || undefined} onClick={() => setMmOpen(expanded ? "" : g.label)}>
                    {g.label}
                    <Chevron />
                  </button>
                  {/* height animates 0fr -> 1fr; closed = inert (out of the tab order and the a11y tree) */}
                  <div id={`mm-subs-${gi}`} className="mm-subs-wrap" data-open={expanded ? "" : undefined} inert={!expanded}>
                  <ul className="mm-subs">
                    {subs.map((c, ci) => (
                      <li key={c.href} style={{ "--j": ci } as CSSProperties}>
                        <Link href={c.href} className="mm-sub" aria-current={isActive(pathname, c.href) ? "page" : undefined}>
                          <NavIcon href={c.href} className="mm-sub-ic" />
                          <span className="mm-sub-tx"><span>{c.label}</span><span className="mm-sub-n">{c.note}</span></span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                  </div>
                </li>
              );
            })}
            <li className="mm-group" style={{ "--k": 3 } as CSSProperties}>
              <ul className="mm-solo">
                {navGroups.filter((g) => !g.children).map((g) => (
                  <li key={g.href}>
                    <Link href={g.href} className="mm-big" aria-current={isActive(pathname, g.href) ? "page" : undefined}>{g.label}</Link>
                  </li>
                ))}
              </ul>
            </li>
          </ul>
          <Link href={paths.events} className="pill pill-solid mm-cta" style={{ "--k": 4 } as CSSProperties}>Partecipa <span className="arrow" aria-hidden="true">→</span></Link>
        </nav>
        {(tel || contacts.email || contacts.address) && (
          <div className="mm-contacts" style={{ "--k": 5 } as CSSProperties}>
            <p className="mm-contacts-h">Contatti</p>
            {tel && <a href={`tel:${tel}`}>{contacts.phone}</a>}
            {contacts.email && <a href={`mailto:${contacts.email}`}><EmailText email={contacts.email} /></a>}
            {contacts.address && <p>{contacts.address}</p>}
          </div>
        )}
      </div>

      {/* Phones and tablets: the shop is always one tap away (main CTA). Not on the shop itself, not over the open menu. */}
      {!isActive(pathname, paths.shop) && (
        <Link href={paths.shop} className="shop-cta" data-hidden={isOpen && !closing ? "" : undefined} tabIndex={isOpen ? -1 : undefined}>
          <svg aria-hidden="true" viewBox="0 0 24 24" className="shop-cta-ic" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 8h14l-1.4 11.2a1.5 1.5 0 0 1-1.5 1.3H7.9a1.5 1.5 0 0 1-1.5-1.3Z" /><path d="M9 8a3 3 0 0 1 6 0" />
          </svg>
          Vai allo shop
          <Arrow className="shop-cta-ar" />
        </Link>
      )}
    </>
  );
}
