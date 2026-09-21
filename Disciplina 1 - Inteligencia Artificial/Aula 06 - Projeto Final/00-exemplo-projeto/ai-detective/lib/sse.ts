import type { AgentEvent } from "@/types";
import { toAppError } from "./errors";

// ─────────────────────────────────────────────────────────────────────────────
// AULA 03 · STREAMING via SSE (Server-Sent Events).
//
// Em vez de esperar o agente terminar para responder, a rota abre uma conexão e
// vai enviando eventos conforme eles acontecem: cada passo do agente, cada
// pedaço de texto, o relatório final. O formato do SSE é texto puro:
//
//   event: token
//   data: {"text":"Olá"}
//   <linha em branco>
//
// O navegador lê isso com fetch().body.getReader() (components/chat/useAgentChat.ts).
// Não usamos EventSource porque ele só aceita GET, e precisamos enviar um POST
// com o histórico da conversa.
// ─────────────────────────────────────────────────────────────────────────────

export function sseResponse(run: (emit: (event: AgentEvent) => void) => Promise<void>): Response {
  const encoder = new TextEncoder();
  let closed = false;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const emit = (event: AgentEvent) => {
        if (closed) return;
        const { type, ...data } = event; // o nome do evento vai no cabeçalho; o resto, no corpo
        controller.enqueue(encoder.encode(`event: ${type}\ndata: ${JSON.stringify(data)}\n\n`));
      };

      // Roda "solto" (sem await) para a resposta começar a fluir imediatamente.
      void (async () => {
        try {
          await run(emit);
          emit({ type: "done" });
        } catch (err) {
          const appError = toAppError(err);
          console.error(`[${appError.code}]`, appError.cause ?? err);
          emit({ type: "error", message: appError.message }); // mensagem segura, nunca o erro original
        } finally {
          closed = true;
          controller.close();
        }
      })();
    },
    cancel() {
      closed = true; // o usuário fechou a aba: para de enviar
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no", // pede ao Nginx para não segurar (buffer) o stream
    },
  });
}
