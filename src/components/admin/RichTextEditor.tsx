"use client";

import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Simple WYSIWYG for non-technical editors, zero dependencies. A contenteditable region + toolbar
 * (paragraph, headings, bold, italic, lists, quote, link). The HTML is mirrored into a hidden input and is
 * ALWAYS sanitised again on the server (cleanNewsBody / sanitizeHtml), so the browser output is never trusted.
 * Pasting inserts plain text only (no foreign styles). Keyboard: Tab leaves the editor; toolbar is a roving group of buttons.
 */
export function RichTextEditor({ name, defaultHtml, label, hint, error }: { name: string; defaultHtml: string; label: string; hint?: string; error?: string | null }) {
  const uid = useId();
  const labelId = `${uid}-label`;
  const ref = useRef<HTMLDivElement>(null);
  const hidden = useRef<HTMLInputElement>(null);
  const saved = useRef<Range | null>(null);
  const [linkOpen, setLinkOpen] = useState(false);
  const [url, setUrl] = useState("https://");

  const sync = () => {
    if (hidden.current && ref.current) hidden.current.value = ref.current.innerHTML;
  };

  useEffect(() => {
    try { document.execCommand("defaultParagraphSeparator", false, "p"); } catch { /* unsupported: server normalises <div> */ }
  }, []);

  const exec = (cmd: string, arg?: string) => {
    ref.current?.focus();
    document.execCommand(cmd, false, arg);
    sync();
  };
  const block = (tag: "h2" | "h3" | "p" | "blockquote") => {
    ref.current?.focus();
    const cur = (document.queryCommandValue("formatBlock") || "").toLowerCase().replace(/[<>]/g, "");
    document.execCommand("formatBlock", false, cur === tag ? "p" : tag);
    sync();
  };
  const openLink = () => {
    const sel = window.getSelection();
    saved.current = sel && sel.rangeCount ? sel.getRangeAt(0).cloneRange() : null;
    setLinkOpen(true);
  };
  const applyLink = () => {
    const sel = window.getSelection();
    ref.current?.focus();
    if (saved.current && sel) { sel.removeAllRanges(); sel.addRange(saved.current); }
    if (/^(https?:\/\/|mailto:|tel:)/i.test(url.trim()) && url.trim().length > 8) document.execCommand("createLink", false, url.trim());
    setLinkOpen(false);
    sync();
  };

  const btn = "min-h-9 min-w-9 rounded-lg px-2.5 text-sm font-medium text-ink hover:bg-paper-deep focus-visible:outline-offset-0";
  const run = (id: string) => {
    switch (id) {
      case "h2": return block("h2");
      case "h3": return block("h3");
      case "p": return block("p");
      case "bold": return exec("bold");
      case "italic": return exec("italic");
      case "ul": return exec("insertUnorderedList");
      case "ol": return exec("insertOrderedList");
      case "quote": return block("blockquote");
      case "link": return openLink();
      case "unlink": return exec("unlink");
    }
  };
  const tools: { id: string; label: string; text: React.ReactNode }[] = [
    { id: "h2", label: "Titolo grande", text: "Titolo" },
    { id: "h3", label: "Titolo piccolo", text: "Sottotitolo" },
    { id: "p", label: "Paragrafo normale", text: "Testo" },
    { id: "bold", label: "Grassetto", text: <strong>B</strong> },
    { id: "italic", label: "Corsivo", text: <em>I</em> },
    { id: "ul", label: "Elenco puntato", text: "• Elenco" },
    { id: "ol", label: "Elenco numerato", text: "1. Elenco" },
    { id: "quote", label: "Citazione", text: "“ ”" },
    { id: "link", label: "Inserisci link", text: "Link" },
    { id: "unlink", label: "Togli il link", text: "Senza link" },
  ];

  return (
    <div className="space-y-1.5">
      <span id={labelId} className="block text-sm font-medium">{label}</span>
      <div className={cn("overflow-hidden rounded-control border bg-card focus-within:ring-4 focus-within:ring-terracotta/20", error ? "border-danger" : "border-line-strong focus-within:border-terracotta")}>
        <div role="toolbar" aria-label="Formattazione del testo" aria-controls={`${uid}-edit`} className="flex flex-wrap gap-1 border-b border-line bg-paper-deep/50 p-1.5">
          {tools.map((t) => (
            <button key={t.label} type="button" aria-label={t.label} title={t.label} className={btn}
              onMouseDown={(e) => e.preventDefault()} onClick={() => run(t.id)}>
              {t.text}
            </button>
          ))}
        </div>
        {linkOpen && (
          <div className="flex flex-wrap items-end gap-2 border-b border-line bg-card p-3">
            <label className="min-w-[14rem] flex-1 text-sm font-medium">Indirizzo del link
              <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); applyLink(); } if (e.key === "Escape") setLinkOpen(false); }}
                className="mt-1 w-full rounded-control border border-line-strong bg-card px-3 py-2 font-normal" autoFocus />
            </label>
            <button type="button" onClick={applyLink} className="min-h-10 rounded-full bg-ink px-4 text-sm font-medium text-paper">Applica</button>
            <button type="button" onClick={() => setLinkOpen(false)} className="min-h-10 rounded-full px-4 text-sm font-medium underline">Annulla</button>
          </div>
        )}
        <div
          id={`${uid}-edit`}
          ref={ref}
          role="textbox"
          aria-multiline="true"
          aria-labelledby={labelId}
          aria-describedby={hint ? `${uid}-hint` : undefined}
          aria-invalid={error ? true : undefined}
          contentEditable
          suppressContentEditableWarning
          tabIndex={0}
          spellCheck
          lang="it"
          className="prose-it min-h-[18rem] max-w-none px-5 py-4 outline-none [&_p:empty]:min-h-[1.2em]"
          dangerouslySetInnerHTML={{ __html: defaultHtml }}
          onInput={sync}
          onBlur={sync}
          onPaste={(e) => {
            e.preventDefault();
            const text = e.clipboardData.getData("text/plain");
            const html = text.split(/\r?\n+/).filter((l) => l.trim()).map((l) => `<p>${l.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!)}</p>`).join("");
            document.execCommand("insertHTML", false, html);
            sync();
          }}
        />
      </div>
      <input ref={hidden} type="hidden" name={name} defaultValue={defaultHtml} />
      {hint && <p id={`${uid}-hint`} className="text-sm text-ink-soft">{hint}</p>}
      {error && <p role="alert" className="text-sm font-medium text-danger">{error}</p>}
    </div>
  );
}
