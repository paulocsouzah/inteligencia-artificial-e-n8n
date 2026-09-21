"use client";

import { useRef, useState } from "react";
import Modal from "@/components/ui/Modal";

// Upload de uma evidência nova. O servidor extrai o texto (PDF) ou pede uma descrição
// ao modelo de visão (imagem), gera os embeddings e grava no banco: a partir daí, a
// busca semântica do agente já encontra o arquivo — sem reiniciar nada (AULA 04).

export default function UploadEvidenceModal({ onClose, onUploaded }: { onClose: () => void; onUploaded: () => Promise<void> }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    setBusy(true);
    setMessage(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/evidence", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Falha ao enviar o arquivo.");
      await onUploaded();
      setMessage({ tone: "ok", text: "✅ Evidência indexada. Pergunte sobre ela no chat." });
    } catch (err) {
      setMessage({ tone: "error", text: err instanceof Error ? err.message : "Falha ao enviar o arquivo." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal title="Nova evidência" subtitle="Envie um PDF ou uma imagem para adicionar ao caso" onClose={onClose}>
      <div className="flex flex-col gap-3">
        <button
          type="button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-3 rounded-lg border border-border bg-white/[0.02] px-4 py-3 text-left text-sm hover:border-border-soft hover:bg-white/[0.05] disabled:opacity-50"
        >
          <span className="text-xl">📎</span>
          <span>
            <span className="block font-medium text-ink">Escolher arquivo</span>
            <span className="block text-xs text-ink-dim">PDF, JPG, PNG ou WEBP — até 10 MB</span>
          </span>
          {busy && <span className="ml-auto animate-pulse text-xs text-accent">indexando…</span>}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) upload(file);
            e.target.value = "";
          }}
        />

        {message && <p className={`text-sm ${message.tone === "ok" ? "text-ok" : "text-danger"}`}>{message.text}</p>}

        <p className="text-xs text-ink-faint">
          Para testar o guardrail de <em>prompt injection</em>, envie o arquivo{" "}
          <code className="font-mono">evidence/samples/bilhete-anonimo.pdf</code> e peça ao agente para analisá-lo.
        </p>
      </div>
    </Modal>
  );
}
