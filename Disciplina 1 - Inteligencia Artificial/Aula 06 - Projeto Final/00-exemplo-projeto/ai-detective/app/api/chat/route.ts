import type { ChatMessageInput } from "@/types";
import { MAX_HISTORY_MESSAGES, MAX_MESSAGE_CHARS } from "@/lib/config";
import { runAgent } from "@/lib/agent/loop";
import { sseResponse } from "@/lib/sse";
import { CASE_PROMPT } from "@/case/prompt";
import { caseTools } from "@/case/tools";

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/chat — a única porta de entrada do agente.
//
// Esta rota só faz três coisas: valida a entrada, liga as peças do projeto
// (prompt do tema + ferramentas do tema + loop genérico) e devolve o stream.
// A chave da OpenAI nunca passa por aqui — quem fala com ela é lib/openai.ts.
// ─────────────────────────────────────────────────────────────────────────────

export const runtime = "nodejs";

/** Guardrail: nunca confie no que vem do navegador. Confere formato e tamanhos. */
function isValidHistory(messages: unknown): messages is ChatMessageInput[] {
  return (
    Array.isArray(messages) &&
    messages.length > 0 &&
    messages.every(
      (m) =>
        m &&
        typeof m === "object" &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.length <= MAX_MESSAGE_CHARS
    ) &&
    messages[messages.length - 1].role === "user"
  );
}

export async function POST(request: Request) {
  let body: { sessionId?: unknown; messages?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Corpo da requisição inválido (esperado JSON)." }, { status: 400 });
  }

  // sessionId identifica a conversa: é a chave do caderno de notas (memória) no banco.
  const { sessionId, messages } = body;
  if (typeof sessionId !== "string" || !/^[\w-]{8,64}$/.test(sessionId) || !isValidHistory(messages)) {
    return Response.json(
      { error: "Envie 'sessionId' e 'messages': lista de { role: 'user'|'assistant', content }, terminando numa mensagem do usuário." },
      { status: 400 }
    );
  }

  return sseResponse((emit) =>
    runAgent({
      sessionId,
      history: messages.slice(-MAX_HISTORY_MESSAGES),
      systemPrompt: CASE_PROMPT,
      tools: caseTools,
      emit,
    })
  );
}
