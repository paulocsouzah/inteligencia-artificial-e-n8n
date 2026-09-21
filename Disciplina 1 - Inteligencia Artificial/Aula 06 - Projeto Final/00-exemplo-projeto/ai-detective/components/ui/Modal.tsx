"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import type { ReactNode } from "react";

export default function Modal({
  title,
  subtitle,
  onClose,
  children,
  wide,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  // Portal para document.body: os painéis do dashboard usam backdrop-blur
  // (backdrop-filter), que cria um novo "containing block" para elementos
  // position:fixed — sem o portal, o modal ficaria preso dentro do painel
  // em vez de cobrir a tela toda.
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className={`scroll-thin flex max-h-[85vh] w-full ${wide ? "max-w-3xl" : "max-w-lg"} flex-col overflow-y-auto rounded-xl border border-border bg-bg-elevated shadow-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-border bg-bg-elevated/95 px-5 py-4 backdrop-blur-sm">
          <div>
            <h3 className="font-mono text-sm font-semibold uppercase tracking-wide text-ink">{title}</h3>
            {subtitle && <p className="mt-0.5 text-xs text-ink-dim">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-border px-2 py-1 text-xs text-ink-dim hover:text-ink"
          >
            Fechar ✕
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>,
    document.body
  );
}
