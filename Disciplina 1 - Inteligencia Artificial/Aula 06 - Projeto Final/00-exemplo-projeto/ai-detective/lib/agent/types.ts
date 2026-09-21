import type { Accusation, StepStatus } from "@/types";

// ─────────────────────────────────────────────────────────────────────────────
// AULA 03/05 · O que é uma "tool" (ferramenta) do agente.
//
// Uma tool tem duas metades:
//   1. a DESCRIÇÃO que o modelo lê (name, description, parameters) — é assim que
//      ele decide quando e como usá-la;
//   2. o CÓDIGO que o SEU servidor executa (run) — o modelo nunca executa nada,
//      só pede "chame tal função com estes argumentos".
//
// As tools do projeto ficam em case/tools.ts (são específicas do tema). O loop
// (lib/agent/loop.ts) só sabe percorrer uma lista de AgentTool.
// ─────────────────────────────────────────────────────────────────────────────

export interface ToolContext {
  sessionId: string;
  /** Emite um aviso no painel de rastreio (ex.: "possível instrução escondida"). */
  warn: (label: string, detail?: unknown) => void;
}

export interface ToolResult {
  /** O que volta para o modelo (vira o conteúdo da mensagem de role "tool"). */
  output: unknown;
  /** "warning" pinta o passo de vermelho no painel de rastreio. */
  status?: Extract<StepStatus, "done" | "warning">;
  /**
   * Se preenchido, o loop PARA aqui e entrega este relatório ao humano, em vez de
   * deixar o modelo continuar. É o "human-in-the-loop": a ação final espera aprovação.
   */
  finalReport?: Accusation;
}

export interface AgentTool {
  name: string;
  description: string;
  /** JSON Schema dos parâmetros. */
  parameters: Record<string, unknown>;
  /** Texto curto para o painel de rastreio ("🔎 Buscando: …"). Nunca mostra o raciocínio do modelo. */
  describe: (args: Record<string, unknown>) => string;
  run: (args: Record<string, unknown>, ctx: ToolContext) => Promise<ToolResult>;
}
