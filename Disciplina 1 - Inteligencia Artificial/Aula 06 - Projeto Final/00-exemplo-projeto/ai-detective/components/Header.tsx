import { StatusDot } from "@/components/ui/primitives";

export default function Header({ caseTitle, caseId }: { caseTitle: string; caseId: string }) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-bg-elevated/80 px-4 py-3 backdrop-blur-sm sm:px-6">
      <div className="flex items-center gap-3">
        <span className="text-2xl leading-none">🕵️</span>
        <div className="leading-tight">
          <div className="flex items-center gap-2">
            <h1 className="font-mono text-sm font-bold tracking-[0.08em] text-ink sm:text-base">AI DETECTIVE</h1>
            <span className="text-ink-faint">·</span>
            <span className="font-mono text-xs text-ink-dim sm:text-sm">{caseId}</span>
          </div>
          <p className="mt-0.5 text-xs text-ink-dim sm:text-sm">&ldquo;{caseTitle}&rdquo;</p>
        </div>
      </div>

      <div className="hidden items-center gap-1.5 sm:flex">
        <StatusDot tone="danger" />
        <span className="font-mono text-[11px] font-semibold uppercase tracking-wide text-danger">Investigação ativa</span>
      </div>
    </header>
  );
}
