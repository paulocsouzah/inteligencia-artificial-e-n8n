import type { Suspect } from "@/types";
import SuspectCard from "./SuspectCard";
import { SectionHeader } from "@/components/ui/primitives";

export default function SuspectList({ suspects }: { suspects: Suspect[] }) {
  return (
    <div>
      <SectionHeader icon="🧑‍🤝‍🧑" title="Suspeitos" />
      <div className="flex flex-col gap-2">
        {suspects.map((s) => (
          <SuspectCard key={s.id} suspect={s} />
        ))}
      </div>
    </div>
  );
}
