"use client";

import { useCallback, useRef, useState } from "react";
import type { Accusation, AgentStep, ChatMessageInput } from "@/types";
import { formatAccusation } from "./formatAccusation";
import { newId } from "./newId";

export interface UIMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  /** Preenchido quando o agente propôs uma acusação (mostra o cartão Aprovar/Rejeitar). */
  report?: Accusation;
  decision?: "aprovada" | "rejeitada";
}

const MAX_STEPS_SHOWN = 120;

/**
 * Tudo o que a tela precisa para conversar com o agente:
 *  • manda o histórico para /api/chat e lê a resposta em streaming (SSE);
 *  • alimenta o chat (messages), o painel de rastreio (steps) e o cartão de aprovação;
 *  • guarda o histórico e o sessionId (a "identidade" da conversa no servidor).
 */
export function useAgentChat() {
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [steps, setSteps] = useState<AgentStep[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Memória de curto prazo: o servidor não guarda a conversa, quem reenvia tudo a cada pergunta somos nós.
  const historyRef = useRef<ChatMessageInput[]>([]);
  // sessionId = chave do caderno de notas do agente (memória de trabalho) no banco.
  const sessionRef = useRef<string | null>(null);
  const busyRef = useRef(false);

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || busyRef.current) return;

    busyRef.current = true;
    setIsStreaming(true);
    setError(null);

    const assistantId = newId();
    const patchAssistant = (patch: Partial<UIMessage>) =>
      setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, ...patch } : m)));

    const nextHistory: ChatMessageInput[] = [...historyRef.current, { role: "user", content: trimmed }];
    historyRef.current = nextHistory;
    let assistantText = "";

    // Tudo abaixo fica dentro do try/finally: se algo falhar, o finally SEMPRE libera a tela.
    try {
      sessionRef.current ??= newId();
      setMessages((prev) => [
        ...prev,
        { id: newId(), role: "user", content: trimmed },
        { id: assistantId, role: "assistant", content: "" },
      ]);

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sessionRef.current, messages: nextHistory }),
      });
      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Falha ao falar com o agente.");
      }

      // Lê o stream SSE: blocos separados por linha em branco, cada um com "event:" e "data:".
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const blocks = buffer.split("\n\n");
        buffer = blocks.pop() ?? ""; // o último pedaço pode estar incompleto: espera o resto

        for (const block of blocks) {
          let event = "message";
          let data = "";
          for (const line of block.split("\n")) {
            if (line.startsWith("event:")) event = line.slice(6).trim();
            else if (line.startsWith("data:")) data += line.slice(5).trim();
          }
          if (!data) continue;
          const payload = JSON.parse(data);

          if (event === "token") {
            assistantText += payload.text;
            patchAssistant({ content: assistantText });
          } else if (event === "step") {
            const step = payload.step as AgentStep;
            // Mesmo id = atualiza o passo (running → done); id novo = passo novo.
            setSteps((prev) => {
              const i = prev.findIndex((s) => s.id === step.id);
              if (i === -1) return [...prev, step].slice(-MAX_STEPS_SHOWN);
              const copy = [...prev];
              copy[i] = step;
              return copy;
            });
          } else if (event === "report") {
            const report = payload.report as Accusation;
            assistantText = formatAccusation(report);
            patchAssistant({ content: assistantText, report });
          } else if (event === "error") {
            setError(payload.message);
          }
        }
      }

      if (assistantText) historyRef.current = [...nextHistory, { role: "assistant", content: assistantText }];
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setIsStreaming(false);
      busyRef.current = false;
    }
  }, []);

  /** O humano aprova ou rejeita a acusação. Só aqui o servidor registra a decisão (human-in-the-loop). */
  const decide = useCallback(
    async (messageId: string, decision: "aprovada" | "rejeitada") => {
      const message = messages.find((m) => m.id === messageId);
      if (!message?.report || !sessionRef.current || busyRef.current) return;

      try {
        const res = await fetch("/api/accusation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId: sessionRef.current, decision, report: message.report }),
        });
        if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Falha ao registrar a decisão.");

        setMessages((prev) => prev.map((m) => (m.id === messageId ? { ...m, decision } : m)));
        // Avisa o agente da decisão, como uma mensagem normal do usuário.
        await sendMessage(
          decision === "aprovada"
            ? "✅ Aprovei a acusação. Encerre o caso com um resumo curto do que ficou provado."
            : "❌ Rejeitei a acusação. Diga o que ainda falta apurar e continue a investigação."
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro inesperado.");
      }
    },
    [messages, sendMessage]
  );

  /** Começa uma investigação nova: histórico limpo e um sessionId novo (caderno de notas vazio). */
  const reset = useCallback(() => {
    if (busyRef.current) return;
    historyRef.current = [];
    sessionRef.current = null;
    setMessages([]);
    setSteps([]);
    setError(null);
  }, []);

  return { messages, steps, isStreaming, error, sendMessage, decide, reset };
}
