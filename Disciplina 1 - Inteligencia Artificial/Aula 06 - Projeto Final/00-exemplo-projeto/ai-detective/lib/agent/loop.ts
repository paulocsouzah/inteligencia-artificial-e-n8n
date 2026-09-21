import { randomUUID } from "crypto";
import type { ChatCompletionMessageParam, ChatCompletionMessageToolCall, ChatCompletionTool } from "openai/resources/chat/completions";
import type { AgentEvent, ChatMessageInput, StepStatus } from "@/types";
import { getOpenAI } from "../openai";
import { CHAT_MODEL, MAX_AGENT_STEPS, MAX_HISTORY_MESSAGES } from "../config";
import { GUARDRAIL_RULES, ToolArgError } from "./guardrails";
import { listNotes, notesToPrompt } from "./memory";
import type { AgentTool, ToolContext, ToolResult } from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// AULA 05 · O AGENT LOOP — o coração do projeto.
//
//   ┌──► 1. RACIOCINAR   o modelo lê tudo e decide: responder OU chamar tools
//   │    2. AGIR         nosso código executa as tools que ele pediu
//   │    3. OBSERVAR     o resultado volta para a conversa (role: "tool")
//   └────────── repete até o modelo responder só com texto…
//
//   …ou até um guardrail cortar: o limite de MAX_AGENT_STEPS rodadas, ou uma tool
//   pedir aprovação humana (finalReport).
//
// Quem "decide" o caminho é o modelo (tool_choice: "auto"); o loop só executa.
// É a diferença entre um AGENTE e um workflow com ordem fixa (Aula 05).
// ─────────────────────────────────────────────────────────────────────────────

export interface RunAgentParams {
  sessionId: string;
  history: ChatMessageInput[];
  /** O prompt do TEMA (case/prompt.ts). O loop acrescenta os guardrails e o caderno de notas. */
  systemPrompt: string;
  tools: AgentTool[];
  /** Recebe cada evento (passo, token, relatório…) — a rota transforma em SSE. */
  emit: (event: AgentEvent) => void;
}

/** Converte a nossa AgentTool no formato que a API da OpenAI espera. */
function toDefinition(tool: AgentTool): ChatCompletionTool {
  return { type: "function", function: { name: tool.name, description: tool.description, parameters: tool.parameters } };
}

export async function runAgent({ sessionId, history, systemPrompt, tools, emit }: RunAgentParams): Promise<void> {
  const client = getOpenAI();
  const toolsByName = new Map(tools.map((tool) => [tool.name, tool]));
  const definitions = tools.map(toDefinition);

  // ── Observabilidade: cada passo vira um evento que a tela mostra ao vivo ────
  // Reusar o mesmo `id` atualiza o passo (ex.: "running" → "done") em vez de criar outro.
  const step = (id: string, label: string, status: StepStatus, detail?: unknown) =>
    emit({ type: "step", step: { id, label, status, detail, timestamp: new Date().toISOString() } });

  const ctx: ToolContext = {
    sessionId,
    warn: (label, detail) => step(randomUUID(), label, "warning", detail),
  };

  // ── Memória: o caderno de notas volta para dentro do prompt a cada turno ────
  const notes = await listNotes(sessionId);
  const messages: ChatCompletionMessageParam[] = [
    { role: "system", content: [systemPrompt, GUARDRAIL_RULES, notesToPrompt(notes)].join("\n\n") },
    ...history.slice(-MAX_HISTORY_MESSAGES), // memória de curto prazo, com limite
  ];

  for (let round = 1; round <= MAX_AGENT_STEPS; round++) {
    // ── 1. RACIOCINAR ────────────────────────────────────────────────────────
    const thinkingId = randomUUID();
    step(thinkingId, round === 1 ? "🧠 Analisando o pedido" : `🧠 Avaliando o que descobri (rodada ${round})`, "running");

    // stream(): a resposta chega aos poucos. Cada pedaço de texto vai direto
    // para a tela; ao final, finalChatCompletion() devolve a mensagem completa,
    // já com as chamadas de tool remontadas (o SDK cuida de juntar os pedaços).
    const stream = client.chat.completions.stream({ model: CHAT_MODEL, messages, tools: definitions, tool_choice: "auto" });
    stream.on("content", (delta) => emit({ type: "token", text: delta }));
    const completion = await stream.finalChatCompletion();
    step(thinkingId, round === 1 ? "🧠 Analisando o pedido" : `🧠 Avaliando o que descobri (rodada ${round})`, "done");

    const message = completion.choices[0].message;
    messages.push(message);

    // Sem pedido de tool = o modelo já respondeu em texto. Fim do loop.
    const calls = (message.tool_calls ?? []).filter((call): call is ChatCompletionMessageToolCall & { type: "function" } => call.type === "function");
    if (calls.length === 0) return;

    // ── 2. AGIR + 3. OBSERVAR ────────────────────────────────────────────────
    for (const call of calls) {
      const result = await executeTool(call.function.name, call.function.arguments, toolsByName, ctx, step);

      // O resultado volta para o modelo como uma mensagem "tool" ligada ao pedido (tool_call_id).
      messages.push({ role: "tool", tool_call_id: call.id, content: JSON.stringify(result.output) });

      // HUMAN-IN-THE-LOOP: a tool pediu aprovação. Entregamos o relatório ao humano
      // e PARAMOS — o modelo não segue em frente sozinho.
      if (result.finalReport) {
        emit({ type: "report", report: result.finalReport });
        return;
      }
    }
  }

  // ── Guardrail: limite de rodadas ───────────────────────────────────────────
  step(randomUUID(), `⛔ Parei: limite de ${MAX_AGENT_STEPS} rodadas atingido`, "warning");
  emit({
    type: "token",
    text: "\n\nAtingi o limite de consultas para esta resposta. Pode repetir o pedido de forma mais específica? O que eu já anotei continua no meu caderno.",
  });
}

/**
 * Executa UMA chamada de tool: valida o JSON, roda a tool, registra o passo.
 * Erros de argumento (ToolArgError) NÃO derrubam o agente: voltam para o modelo
 * como resultado da tool, e ele corrige e tenta de novo. Erros de verdade
 * (banco fora do ar, OpenAI caiu…) sobem e encerram a requisição.
 */
async function executeTool(
  name: string,
  rawArgs: string,
  toolsByName: Map<string, AgentTool>,
  ctx: ToolContext,
  step: (id: string, label: string, status: StepStatus, detail?: unknown) => void
): Promise<ToolResult> {
  const id = randomUUID();
  const tool = toolsByName.get(name);

  let args: Record<string, unknown> = {};
  try {
    const parsed = rawArgs ? JSON.parse(rawArgs) : {};
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) throw new Error("não é um objeto");
    args = parsed;
  } catch {
    step(id, `⚠️ ${name}: argumentos inválidos`, "warning", { rawArgs });
    return { output: { error: "Os argumentos não são um JSON válido. Envie um objeto JSON." } };
  }

  if (!tool) {
    step(id, `⚠️ Ferramenta desconhecida: ${name}`, "warning", args);
    return { output: { error: `A ferramenta "${name}" não existe.` } };
  }

  const label = tool.describe(args);
  step(id, label, "running", args);
  try {
    const result = await tool.run(args, ctx);
    step(id, label, result.status ?? "done", result.output);
    return result;
  } catch (err) {
    if (err instanceof ToolArgError) {
      step(id, `${label} — ${err.message}`, "warning", args);
      return { output: { error: err.message } };
    }
    step(id, `${label} — falhou`, "error");
    throw err;
  }
}
