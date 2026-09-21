// ─────────────────────────────────────────────────────────────────────────────
// Todos os "números mágicos" do projeto num lugar só.
//
// Quando alguém perguntar "por que o agente para depois de 10 passos?" ou "qual
// modelo estamos usando?", a resposta está aqui — e é aqui que você mexe.
// ─────────────────────────────────────────────────────────────────────────────

// ── Modelos (AULA 01) ────────────────────────────────────────────────────────
export const CHAT_MODEL = process.env.OPENAI_CHAT_MODEL || "gpt-4o-mini";
export const VISION_MODEL = process.env.OPENAI_VISION_MODEL || CHAT_MODEL;
export const EMBEDDING_MODEL = process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small";
// text-embedding-3-small gera vetores de 1536 números. Se trocar o modelo de
// embedding, ajuste aqui E recrie a tabela (o tamanho do vetor é fixo no banco).
export const EMBEDDING_DIMENSIONS = 1536;

// ── RAG (AULA 04) ────────────────────────────────────────────────────────────
export const RAG = {
  /** tamanho máximo de cada chunk, em caracteres */
  chunkChars: 400,
  /** quanto do fim de um chunk se repete no início do próximo (mantém o contexto) */
  overlapChars: 80,
  /** quantos trechos a busca devolve ao agente */
  topK: 4,
  /**
   * Similaridade mínima (0 a 1). Abaixo disso, o trecho é descartado e o agente diz "não sei".
   * Este valor foi MEDIDO neste corpus (text-embedding-3-small): perguntas sobre o caso
   * têm o melhor trecho entre 0.54 e 0.62; perguntas sem relação (receita de bolo, copa do
   * mundo) ficam em 0.19–0.23. O corte fica no vão entre os dois grupos. No SEU corpus o
   * vão será outro: meça com perguntas dentro e fora do assunto antes de escolher.
   */
  minScore: 0.3,
};

// ── Guardrails do agente (AULA 05) ───────────────────────────────────────────
/** Limite de rodadas do loop. Sem ele, um bug de prompt pode gastar créditos sem parar. */
export const MAX_AGENT_STEPS = 10;
/** Quantas mensagens do histórico entram no contexto do modelo. */
export const MAX_HISTORY_MESSAGES = 20;
/** Tamanho máximo de uma mensagem do usuário. */
export const MAX_MESSAGE_CHARS = 4000;
/** Uma evidência enorme não pode estourar o contexto: cortamos o que passar disso. */
export const MAX_TOOL_OUTPUT_CHARS = 6000;
/** Máximo de notas por conversa (o caderno inteiro volta para o prompt a cada turno). */
export const MAX_NOTES = 30;

// ── Upload de evidências ─────────────────────────────────────────────────────
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB
