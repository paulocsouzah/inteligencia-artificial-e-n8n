"use client";

// AULA 05 · HUMAN-IN-THE-LOOP — o agente propôs, o humano decide.
// Estes botões são o único caminho para a acusação ser registrada de verdade
// (a rota /api/accusation só é chamada depois do clique).

export default function AccusationActions({
  decision,
  disabled,
  onDecide,
}: {
  decision?: "aprovada" | "rejeitada";
  disabled: boolean;
  onDecide: (decision: "aprovada" | "rejeitada") => void;
}) {
  if (decision) {
    return (
      <p className={`mt-3 border-t border-border pt-3 text-xs font-medium ${decision === "aprovada" ? "text-ok" : "text-danger"}`}>
        {decision === "aprovada" ? "✅ Acusação aprovada e registrada." : "❌ Acusação rejeitada — a investigação continua."}
      </p>
    );
  }

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
      <span className="text-xs text-ink-dim">A decisão é sua:</span>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onDecide("aprovada")}
        className="rounded-md bg-ok px-3 py-1.5 text-xs font-semibold text-black transition-opacity disabled:opacity-40"
      >
        ✅ Aprovar
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onDecide("rejeitada")}
        className="rounded-md border border-danger/50 px-3 py-1.5 text-xs font-semibold text-danger transition-opacity disabled:opacity-40"
      >
        ❌ Rejeitar
      </button>
    </div>
  );
}
