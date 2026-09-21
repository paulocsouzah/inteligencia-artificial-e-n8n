"use client";

import type { EvidenceMeta } from "@/types";
import Modal from "@/components/ui/Modal";
import { Badge } from "@/components/ui/primitives";

export default function EvidenceViewerModal({ evidence, onClose }: { evidence: EvidenceMeta; onClose: () => void }) {
  // O arquivo é servido por /api/evidence/file/[id], que busca o caminho no banco.
  const fileUrl = `/api/evidence/file/${evidence.id}`;

  return (
    <Modal title={evidence.title} subtitle={evidence.id} onClose={onClose} wide>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="neutral">{evidence.kind === "pdf" ? "📄 PDF" : "📷 Imagem"}</Badge>
          <Badge tone="neutral">{evidence.category}</Badge>
          {evidence.uploaded && <Badge tone="info">Enviada por você</Badge>}
          <a href={fileUrl} target="_blank" rel="noreferrer" className="ml-auto text-xs text-accent hover:underline">
            Abrir em nova aba ↗
          </a>
        </div>

        <p className="text-sm leading-relaxed text-ink-dim">{evidence.description}</p>

        <div className="overflow-hidden rounded-lg border border-border bg-black/40">
          {evidence.kind === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={fileUrl} alt={evidence.title} className="w-full object-contain" />
          ) : (
            <iframe src={fileUrl} title={evidence.title} className="h-[60vh] w-full bg-white" />
          )}
        </div>
      </div>
    </Modal>
  );
}
