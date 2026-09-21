// Tipos compartilhados entre o servidor (lib/, app/api/) e o navegador (components/).
// Ficam num arquivo só para que os dois lados "falem a mesma língua" — principalmente
// os eventos que o agente envia para a tela (AgentEvent).

// ─── Domínio do caso (a pasta case/ preenche estes tipos) ────────────────────

export interface Suspect {
  id: string;
  name: string;
  role: string;
  initials: string; // usadas no avatar
  description: string;
}

export type EvidenceKind = "pdf" | "image";

export type EvidenceCategory =
  | "depoimento"
  | "registro"
  | "inventario"
  | "relatorio"
  | "protocolo"
  | "camera";

export interface EvidenceMeta {
  id: string;
  kind: EvidenceKind;
  category: EvidenceCategory;
  title: string;
  filename: string;
  description: string;
  /** true para evidências enviadas pelo usuário, false para as do caso original */
  uploaded: boolean;
}

export interface TimelineEvent {
  time: string; // "HH:mm"
  title: string;
  description: string;
  /** ids das evidências que sustentam o evento — a fonte, nunca a conclusão */
  evidenceIds: string[];
}

// ─── Conversa ────────────────────────────────────────────────────────────────

export interface ChatMessageInput {
  role: "user" | "assistant";
  content: string;
}

// ─── Memória do agente (AULA 05) ─────────────────────────────────────────────

export type NoteKind = "plano" | "achado" | "contradicao";

export interface Note {
  kind: NoteKind;
  text: string;
}

// ─── Saída estruturada: a acusação proposta pelo agente (AULA 03) ────────────

export type Confidence = "baixa" | "media" | "alta";

export interface Accusation {
  suspect: string;
  confidence: Confidence;
  evidenceIds: string[];
  contradictions: string[];
  conclusion: string;
}

// ─── Eventos que o agente envia para a tela (via SSE) ────────────────────────
// Um único fluxo de eventos alimenta o chat (token), o painel de rastreio (step)
// e o cartão de aprovação (report).

export type StepStatus = "running" | "done" | "warning" | "error";

export interface AgentStep {
  id: string;
  label: string;
  status: StepStatus;
  /** JSON cru (argumentos ou resultado) — a tela mostra num bloco expansível */
  detail?: unknown;
  timestamp: string;
}

export type AgentEvent =
  | { type: "step"; step: AgentStep }
  | { type: "token"; text: string }
  | { type: "report"; report: Accusation }
  | { type: "done" }
  | { type: "error"; message: string };
