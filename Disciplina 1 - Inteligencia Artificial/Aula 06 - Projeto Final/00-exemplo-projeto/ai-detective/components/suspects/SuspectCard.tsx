import type { Suspect } from "@/types";

export default function SuspectCard({ suspect }: { suspect: Suspect }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-white/[0.02] px-3 py-2.5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-panel-2 font-mono text-xs font-semibold text-ink-dim">
        {suspect.initials}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-ink">{suspect.name}</span>
        <span className="block text-xs uppercase leading-snug tracking-wide text-ink-faint">{suspect.role}</span>
        <span className="mt-1 block text-xs leading-relaxed text-ink-dim">{suspect.description}</span>
      </span>
    </div>
  );
}
