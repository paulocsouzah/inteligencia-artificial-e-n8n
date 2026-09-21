import { ToolArgError, validateAccusation } from "@/lib/agent/guardrails";
import { query } from "@/lib/db";
import { errorResponse } from "@/lib/errors";
import { listEvidenceIds } from "@/lib/rag/store";
import { suspects } from "@/case/suspects";

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/accusation — a decisão do detetive humano (AULA 05: human-in-the-loop).
//
// O agente só PROPÕE a acusação (tool proposeAccusation não grava nada). A ação
// que não tem volta — registrar a acusação — só acontece AQUI, depois que uma
// pessoa clicou em "Aprovar" ou "Rejeitar" na tela.
// ─────────────────────────────────────────────────────────────────────────────

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const decision = body?.decision;
    if (typeof body?.sessionId !== "string" || !/^[\w-]{8,64}$/.test(body.sessionId) || (decision !== "aprovada" && decision !== "rejeitada")) {
      return Response.json({ error: "Envie 'sessionId', 'decision' ('aprovada' | 'rejeitada') e 'report'." }, { status: 400 });
    }

    // O navegador também é fonte não confiável: o servidor revalida o relatório.
    let report;
    try {
      report = validateAccusation(body.report, suspects.map((s) => s.name), await listEvidenceIds());
    } catch (err) {
      if (err instanceof ToolArgError) return Response.json({ error: err.message }, { status: 400 });
      throw err;
    }

    await query("INSERT INTO accusations (session_id, decision, report) VALUES ($1, $2, $3)", [body.sessionId, decision, JSON.stringify(report)]);
    return Response.json({ status: decision });
  } catch (err) {
    return errorResponse(err);
  }
}
