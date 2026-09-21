import type { Accusation } from "@/types";

// Transforma a acusação estruturada (JSON validado) em texto Markdown. Serve para
// duas coisas: mostrar o relatório no chat e guardar no histórico da conversa
// — assim, no turno seguinte, o agente "lembra" o que propôs.

export function formatAccusation(report: Accusation): string {
  const cite = report.evidenceIds.map((id) => `[${id}]`).join(" ");
  const contradictions = report.contradictions.length > 0 ? report.contradictions.map((c, i) => `${i + 1}. ${c}`).join("\n") : "Nenhuma registrada.";

  return `## ⚖️ Acusação proposta

**Suspeito principal:** ${report.suspect}
**Nível de confiança:** ${report.confidence} — estimativa da IA, não uma probabilidade estatística.

**Evidências:** ${cite}

**Contradições encontradas:**
${contradictions}

**Conclusão:**
${report.conclusion}`;
}
