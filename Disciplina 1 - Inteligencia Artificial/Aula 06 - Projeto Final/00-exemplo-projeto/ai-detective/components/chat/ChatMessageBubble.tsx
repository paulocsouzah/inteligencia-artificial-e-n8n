import type { ReactNode } from "react";
import SimpleMarkdown from "./SimpleMarkdown";

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1 py-1">
      {[0, 1, 2].map((i) => (
        <span key={i} className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-ink-faint" style={{ animationDelay: `${i * 0.15}s` }} />
      ))}
    </span>
  );
}

export default function ChatMessageBubble({
  role,
  content,
  streaming,
  children,
}: {
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
  /** Conteúdo extra abaixo do texto (ex.: os botões de aprovação). */
  children?: ReactNode;
}) {
  const isUser = role === "user";

  return (
    <div className={`flex animate-fade-in-up ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[88%] rounded-lg border px-3.5 py-2.5 sm:max-w-[75%] ${
          isUser ? "border-accent/25 bg-accent-soft text-ink" : "border-border bg-panel-2 text-ink"
        }`}
      >
        {!isUser && <p className="mb-1 font-mono text-[10px] uppercase tracking-wide text-ink-faint">🤖 Investigador IA</p>}
        {content ? <SimpleMarkdown text={content} /> : streaming ? <TypingDots /> : null}
        {streaming && content && <span className="ml-0.5 inline-block h-3.5 w-1.5 animate-caret bg-accent align-middle" />}
        {children}
      </div>
    </div>
  );
}
