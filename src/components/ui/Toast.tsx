"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "info";
type ToastItem = { id: number; type: ToastType; message: string };
type Ctx = { push: (type: ToastType, message: string) => void };

const ToastCtx = createContext<Ctx>({ push: () => {} });

/** `const toast = useToast(); toast.push("success", "Salvato.")` */
export const useToast = () => useContext(ToastCtx);

const FLASH_COOKIE = "il_flash"; // keep in sync with src/lib/flash.ts

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const seq = useRef(0);

  const push = useCallback((type: ToastType, message: string) => {
    const id = ++seq.current;
    setItems((s) => [...s, { id, type, message }]);
    setTimeout(() => setItems((s) => s.filter((t) => t.id !== id)), type === "error" ? 9000 : 5500);
  }, []);

  // Show a server-queued flash message (cookie) once, then delete it. Polled because a server action
  // redirect is a client-side navigation: the root layout (and this provider) does not remount.
  useEffect(() => {
    const check = () => {
      const m = document.cookie.split("; ").find((c) => c.startsWith(`${FLASH_COOKIE}=`));
      if (!m) return;
      document.cookie = `${FLASH_COOKIE}=; Max-Age=0; Path=/`;
      try {
        const data = JSON.parse(decodeURIComponent(m.slice(FLASH_COOKIE.length + 1)));
        if (data && typeof data.message === "string") push(data.type === "error" || data.type === "info" ? data.type : "success", data.message);
      } catch {
        /* ignore malformed flash */
      }
    };
    check();
    const t = setInterval(check, 400);
    return () => clearInterval(t);
  }, [push]);

  const value = useMemo(() => ({ push }), [push]);
  return (
    <ToastCtx.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex flex-col items-center gap-2 p-4 sm:items-end sm:p-6">
        {items.map((t) => (
          <div key={t.id} role={t.type === "error" ? "alert" : "status"}
            className={cn("pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border px-4 py-3 text-[0.95rem] shadow-pop reveal",
              t.type === "success" && "border-success/30 bg-success-soft text-ink",
              t.type === "error" && "border-danger/30 bg-danger-soft text-ink",
              t.type === "info" && "border-line bg-card text-ink")}>
            <span aria-hidden="true" className={cn("mt-1.5 size-2.5 shrink-0 rounded-full", t.type === "success" && "bg-success", t.type === "error" && "bg-danger", t.type === "info" && "bg-arancio")} />
            <p className="flex-1">{t.message}</p>
            <button type="button" aria-label="Chiudi messaggio" className="-m-1 rounded p-1 text-ink-soft hover:text-ink" onClick={() => setItems((s) => s.filter((x) => x.id !== t.id))}>
              <svg viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="m5 5 10 10M15 5 5 15" /></svg>
            </button>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
