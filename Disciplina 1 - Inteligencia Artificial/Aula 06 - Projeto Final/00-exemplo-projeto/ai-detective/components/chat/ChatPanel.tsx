"use client";

import { useEffect, useRef, useState } from "react";
import ChatMessageBubble from "./ChatMessageBubble";
import AccusationActions from "./AccusationActions";
import { SectionHeader } from "@/components/ui/primitives";
import type { UIMessage } from "./useAgentChat";

export default function ChatPanel({
  messages,
  isStreaming,
  error,
  suggestions,
  onSend,
  onDecide,
}: {
  messages: UIMessage[];
  isStreaming: boolean;
  error: string | null;
  suggestions: string[];
  onSend: (text: string) => void;
  onDecide: (messageId: string, decision: "aprovada" | "rejeitada") => void;
}) {
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  function submit(text?: string) {
    const value = (text ?? draft).trim();
    if (!value || isStreaming) return;
    onSend(value);
    setDraft("");
  }

  const lastId = messages[messages.length - 1]?.id;

  return (
    <div className="flex h-full flex-col">
      <SectionHeader
        icon="💬"
        title="Investigador IA"
        action={
          isStreaming ? (
            <span className="flex items-center gap-1.5 font-mono text-[11px] text-accent">
              <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-accent" />
              investigando…
            </span>
          ) : undefined
        }
      />

      <div ref={scrollRef} className="scroll-thin flex-1 space-y-3 overflow-y-auto pr-1">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-4 py-10 text-center">
            <p className="text-sm text-ink-dim">Pergunte ao Investigador IA sobre o caso, ou experimente:</p>
            <div className="flex max-w-md flex-wrap justify-center gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => submit(s)}
                  className="rounded-full border border-border px-3 py-1.5 text-xs text-ink-dim transition-colors hover:border-accent/40 hover:text-accent"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) => (
          <ChatMessageBubble key={m.id} role={m.role} content={m.content} streaming={isStreaming && m.id === lastId && m.role === "assistant"}>
            {m.report && <AccusationActions decision={m.decision} disabled={isStreaming} onDecide={(d) => onDecide(m.id, d)} />}
          </ChatMessageBubble>
        ))}

        {error && <p className="rounded-md border border-danger/30 bg-danger-soft px-3 py-2 text-xs text-danger">⚠️ {error}</p>}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="mt-3 flex gap-2"
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Pergunte sobre o caso…"
          disabled={isStreaming}
          className="flex-1 rounded-md border border-border bg-white/[0.03] px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-accent/50 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isStreaming || !draft.trim()}
          className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-black transition-opacity disabled:opacity-40"
        >
          Enviar
        </button>
      </form>
    </div>
  );
}
