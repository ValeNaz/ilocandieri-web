"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { adminNav, adminPages, adminQuickActions } from "@/lib/admin-nav";
import { adminPaths } from "@/lib/paths";
import { cn } from "@/lib/utils";
import { Icon, type IconName } from "./icons";

type Entry = { group: string; label: string; hint: string; href: string; icon: IconName; text: string };

const fold = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

const ENTRIES: Entry[] = [
  ...adminNav.flatMap((g) => g.items.map((it) => ({ group: "Vai a", label: it.label, hint: it.hint, href: it.href, icon: it.icon, text: "" }))),
  ...adminQuickActions.map((a) => ({ group: "Azioni", label: a.label, hint: a.hint, href: a.href, icon: a.icon, text: a.keywords ?? "" })),
  ...adminPages.map((p) => ({ group: "Modifica una pagina", label: p.title, hint: p.text, href: adminPaths.page(p.key), icon: "pages" as const, text: "pagina testi" })),
].map((e) => ({ ...e, text: fold(`${e.label} ${e.hint} ${e.text} ${e.group}`) }));

/** Opens the palette from anywhere (sidebar button, top bar): `openPalette()`. ⌘K / Ctrl+K also work. */
export const openPalette = () => window.dispatchEvent(new Event("adm:palette"));

/**
 * Command palette: type a few letters, arrows to move, Enter to go. Every section, the quick actions and the pages.
 * A native <dialog> (focus trap, Escape, top layer for free); results are a listbox driven from the input.
 */
export function CommandPalette() {
  const router = useRouter();
  const ref = useRef<HTMLDialogElement>(null);
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const listId = useId();

  const results = useMemo(() => {
    const words = fold(q).split(/\s+/).filter(Boolean);
    return words.length ? ENTRIES.filter((e) => words.every((w) => e.text.includes(w))) : ENTRIES;
  }, [q]);

  useEffect(() => {
    const open = () => {
      setQ("");
      setSel(0);
      if (!ref.current?.open) ref.current?.showModal();
    };
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (ref.current?.open) ref.current.close();
        else open();
      }
    };
    window.addEventListener("adm:palette", open);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("adm:palette", open);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  // keep the highlighted row in view
  useEffect(() => {
    document.getElementById(`${listId}-${sel}`)?.scrollIntoView({ block: "nearest" });
  }, [sel, listId]);

  const go = (e?: Entry) => {
    if (!e) return;
    ref.current?.close();
    // the CSV export is a download (route handler), not a page
    if (e.href === adminPaths.registrationsExport) window.location.assign(e.href);
    else router.push(e.href);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setSel((s) => Math.min(s + 1, results.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setSel((s) => Math.max(s - 1, 0)); }
    else if (e.key === "Enter") { e.preventDefault(); go(results[sel]); }
  };

  return (
    <dialog ref={ref} aria-label="Cerca nel pannello" className="adm-palette" onClick={(e) => e.target === ref.current && ref.current?.close()}>
      <div className="adm-palette-box">
        <div className="flex items-center gap-3 border-b border-line px-4">
          <Icon name="search" className="size-5 shrink-0 text-ink-soft" />
          <input
            autoFocus
            value={q}
            onChange={(e) => { setQ(e.target.value); setSel(0); }}
            onKeyDown={onKeyDown}
            placeholder="Cerca una sezione o un'azione…"
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-activedescendant={results[sel] ? `${listId}-${sel}` : undefined}
            className="h-14 min-w-0 flex-1 bg-transparent text-[1.05rem] outline-none placeholder:text-ink-soft/70"
          />
          <kbd className="adm-kbd">Esc</kbd>
        </div>
        <ul id={listId} role="listbox" aria-label="Risultati" className="max-h-[min(60vh,28rem)] overflow-y-auto p-2">
          {results.length === 0 && <li className="px-3 py-10 text-center text-ink-soft">Nessun risultato per «{q}».</li>}
          {results.map((e, i) => {
            const head = i === 0 || results[i - 1]!.group !== e.group ? e.group : null;
            return (
              <li key={`${e.group}-${e.href}`} role="presentation">
                {head && <p className="px-3 pb-1.5 pt-3 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-ink-soft" aria-hidden="true">{head}</p>}
                <div
                  id={`${listId}-${i}`}
                  role="option"
                  aria-selected={i === sel}
                  onMouseMove={() => setSel(i)}
                  onClick={() => go(e)}
                  className={cn("flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5", i === sel && "bg-terracotta-soft")}
                >
                  <span className={cn("grid size-9 shrink-0 place-items-center rounded-lg border border-line bg-card", i === sel && "border-transparent text-terracotta-deep")}>
                    <Icon name={e.icon} className="size-[1.1rem]" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{e.label}</span>
                    <span className="block truncate text-sm text-ink-soft">{e.hint}</span>
                  </span>
                  {i === sel && <Icon name="arrow" className="size-4 shrink-0 text-terracotta-deep" />}
                </div>
              </li>
            );
          })}
        </ul>
        <div className="flex items-center gap-4 border-t border-line px-4 py-2.5 text-xs text-ink-soft">
          <span><kbd className="adm-kbd">↑</kbd> <kbd className="adm-kbd">↓</kbd> per scegliere</span>
          <span><kbd className="adm-kbd">Invio</kbd> per aprire</span>
        </div>
      </div>
    </dialog>
  );
}
