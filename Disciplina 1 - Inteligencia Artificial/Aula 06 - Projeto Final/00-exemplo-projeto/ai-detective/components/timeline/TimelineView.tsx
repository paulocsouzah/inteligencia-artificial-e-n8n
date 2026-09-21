import type { TimelineEvent } from "@/types";
import { SectionHeader } from "@/components/ui/primitives";

// Só fatos, com a fonte de cada um. Nenhuma "contradição" marcada: descobrir isso é trabalho do agente.
export default function TimelineView({ timeline }: { timeline: TimelineEvent[] }) {
  return (
    <div>
      <SectionHeader icon="🕒" title="Linha do tempo" />
      <ol className="relative flex flex-col gap-4 border-l border-border pl-4">
        {timeline.map((event, i) => (
          <li key={i} className="relative">
            <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full border-2 border-bg-elevated bg-ink-faint" />
            <span className="font-mono text-xs font-semibold text-accent">{event.time}</span>
            <p className="mt-0.5 text-sm font-medium text-ink">{event.title}</p>
            <p className="mt-0.5 text-xs leading-relaxed text-ink-dim">{event.description}</p>
            <p className="mt-0.5 font-mono text-[10.5px] text-ink-faint">fonte: {event.evidenceIds.join(", ")}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
