"use client";

import { useEffect, useRef } from "react";
import type { AgentStep, StepStatus } from "@/types";
import { SectionHeader } from "@/components/ui/primitives";

// AULA 05 · OBSERVABILIDADE — ver o agente trabalhando.
//
// Cada linha é um passo do loop: o modelo raciocinando, uma tool sendo chamada,
// uma nota salva, um alerta de segurança. Clique em "JSON" para ver o dado cru
// (os argumentos que o modelo mandou e o que a tool devolveu). Sem isso, um
// agente é uma caixa-preta: quando erra, você não sabe onde.

const STATUS_COLOR: Record<StepStatus, string> = {
  running: "text-accent",
  done: "text-ink-dim",
  warning: "text-danger",
  error: "text-danger",
};

export default function AgentTrace({ steps }: { steps: AgentStep[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [steps]);

  return (
    <div className="flex h-full flex-col">
      <SectionHeader icon="📡" title="Rastreio do agente" />
      <div ref={scrollRef} className="scroll-thin flex-1 space-y-1 overflow-y-auto font-mono text-[11.5px]">
        {steps.length === 0 && <p className="px-1 text-ink-faint">Aguardando a primeira pergunta…</p>}

        {steps.map((step) => (
          <div
            key={step.id}
            className={`animate-fade-in-up rounded px-2 py-1.5 ${step.status === "warning" || step.status === "error" ? "bg-danger-soft" : "bg-white/[0.015]"}`}
          >
            <div className="flex items-start gap-2">
              <span className="shrink-0 text-ink-faint">{new Date(step.timestamp).toLocaleTimeString("pt-BR", { hour12: false })}</span>
              <span className={`${STATUS_COLOR[step.status]} min-w-0 break-words leading-snug`}>{step.label}</span>
              {step.status === "running" && <span className="ml-auto mt-1 h-1.5 w-1.5 shrink-0 animate-pulse-dot rounded-full bg-accent" />}
            </div>

            {step.detail !== undefined && (
              <details className="mt-1 pl-1">
                <summary className="cursor-pointer text-[10.5px] text-ink-faint hover:text-ink-dim">JSON</summary>
                <pre className="scroll-thin mt-1 max-h-48 overflow-auto whitespace-pre-wrap break-words rounded bg-black/30 p-2 text-[10.5px] text-ink-dim">
                  {JSON.stringify(step.detail, null, 2).slice(0, 4000)}
                </pre>
              </details>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
