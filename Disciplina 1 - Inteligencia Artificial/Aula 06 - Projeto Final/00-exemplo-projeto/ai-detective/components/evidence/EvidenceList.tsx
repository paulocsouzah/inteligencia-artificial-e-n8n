"use client";

import { useState } from "react";
import type { EvidenceCategory, EvidenceMeta } from "@/types";
import EvidenceViewerModal from "./EvidenceViewerModal";
import { SectionHeader, Badge } from "@/components/ui/primitives";

const CATEGORY_ORDER: EvidenceCategory[] = ["depoimento", "registro", "inventario", "relatorio", "protocolo", "camera"];

const CATEGORY_LABEL: Record<EvidenceCategory, string> = {
  depoimento: "📄 Depoimentos",
  registro: "📄 Registros",
  inventario: "📄 Inventário",
  relatorio: "📄 Relatórios",
  protocolo: "📄 Protocolos",
  camera: "📷 Câmeras & fotos",
};

export default function EvidenceList({ evidence }: { evidence: EvidenceMeta[] }) {
  const [selected, setSelected] = useState<EvidenceMeta | null>(null);

  const groups = CATEGORY_ORDER.map((cat) => ({
    cat,
    items: evidence.filter((e) => e.category === cat),
  })).filter((g) => g.items.length > 0);

  return (
    <div>
      <SectionHeader icon="🗂️" title="Evidências" />
      <div className="flex flex-col gap-4">
        {groups.map((g) => (
          <div key={g.cat}>
            <p className="mb-1.5 px-1 font-mono text-[11px] uppercase tracking-wide text-ink-faint">
              {CATEGORY_LABEL[g.cat]}
            </p>
            <div className="flex flex-col gap-1.5">
              {g.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelected(item)}
                  className="flex items-start gap-2 rounded-md border border-border bg-white/[0.02] px-2.5 py-2 text-left text-sm transition-colors hover:border-border-soft hover:bg-white/[0.05]"
                >
                  <span className="mt-0.5 shrink-0">{item.kind === "pdf" ? "📄" : "📷"}</span>
                  <span className="min-w-0 flex-1 leading-snug text-ink-dim">{item.title}</span>
                  {item.uploaded && (
                    <Badge tone="info" className="mt-0.5 shrink-0">
                      novo
                    </Badge>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      {selected && <EvidenceViewerModal evidence={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
