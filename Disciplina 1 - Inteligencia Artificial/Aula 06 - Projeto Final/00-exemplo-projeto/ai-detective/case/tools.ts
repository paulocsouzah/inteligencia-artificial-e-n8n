import type { NoteKind } from "@/types";
import type { AgentTool, ToolContext } from "@/lib/agent/types";
import { ToolArgError, detectInjection, requireEnum, requireString, truncate, validateAccusation, wrapAsData } from "@/lib/agent/guardrails";
import { addNote, listNotes } from "@/lib/agent/memory";
import { retrieve } from "@/lib/rag/retrieve";
import { getEvidence, listEvidenceIds } from "@/lib/rag/store";
import { MAX_TOOL_OUTPUT_CHARS } from "@/lib/config";
import { suspects } from "./suspects";
import { timeline } from "./timeline";

// ─────────────────────────────────────────────────────────────────────────────
// AULA 03 + 05 · AS FERRAMENTAS DO AGENTE (function / tool calling)
//
// Cada tool é um objeto com: name, description e parameters (o que o modelo LÊ)
// e run (o que o SEU servidor EXECUTA). O modelo só pede "chame searchEvidence
// com este argumento"; quem roda o código é o loop, depois de validar tudo.
//
// Regras para escrever uma boa tool:
//   1. A `description` é o "manual de instruções" do modelo: diga QUANDO usar.
//   2. Uma tool = uma responsabilidade. Prefira poucas tools bem descritas.
//   3. Valide os argumentos em código (requireString, requireEnum…).
//   4. Texto que vem de fora (documentos) volta embrulhado em wrapAsData().
//
// Para o SEU tema, este é o arquivo que mais muda: defina as ferramentas que o
// seu agente precisa (buscar num catálogo, consultar uma API, calcular algo…).
// ─────────────────────────────────────────────────────────────────────────────

/** Avisa no painel se o texto de uma evidência parece tentar dar ordens ao modelo. */
function warnIfInjection(evidenceId: string, text: string, ctx: ToolContext): void {
  if (detectInjection(text)) {
    ctx.warn(`⚠️ Possível instrução escondida em [${evidenceId}] — tratada como dado, não como ordem`, { evidenceId });
  }
}

/** Aceita "registro-crachas", "Registro-Crachas.pdf"… (o modelo às vezes coloca a extensão). */
function normalizeId(raw: string): string {
  return raw.trim().toLowerCase().replace(/\.(pdf|jpe?g|png|webp)$/, "");
}

// ── RAG: a busca semântica (AULA 04) ─────────────────────────────────────────
const searchEvidence: AgentTool = {
  name: "searchEvidence",
  description:
    "Busca SEMÂNTICA nas evidências do caso (depoimentos, registros, laudo, protocolo de segurança e descrição das câmeras). Devolve os trechos mais relevantes com o id da evidência de onde vieram. Use frases completas, por exemplo: 'quem pode usar o código de override?'. Comece por aqui para descobrir onde olhar.",
  parameters: {
    type: "object",
    properties: { query: { type: "string", description: "A pergunta ou o assunto a procurar, em linguagem natural." } },
    required: ["query"],
    additionalProperties: false,
  },
  describe: (args) => `🔎 Buscando nas evidências: "${String(args.query ?? "")}"`,
  async run(args, ctx) {
    const query = requireString(args, "query", 300);
    const results = await retrieve(query);

    if (results.length === 0) {
      // O "não sei" começa aqui: sem trecho parecido o bastante, dizemos isso ao modelo.
      return { output: { results: [], message: "Nenhum trecho relevante nas evidências. Não invente: diga ao usuário que não há evidência sobre isso." } };
    }

    for (const r of results) warnIfInjection(r.evidenceId, r.content, ctx);
    return {
      output: {
        results: results.map((r) => ({
          evidenceId: r.evidenceId,
          title: r.title,
          score: Number(r.score.toFixed(2)),
          excerpt: wrapAsData(r.evidenceId, r.content),
        })),
      },
    };
  },
};

// ── Ler o documento inteiro ──────────────────────────────────────────────────
const readEvidence: AgentTool = {
  name: "readEvidence",
  description:
    "Lê uma evidência INTEIRA pelo id (ex.: 'registro-crachas', 'camera-corredor'). Use quando um trecho da busca não bastar. Para imagens, devolve a descrição visual gerada na ingestão.",
  parameters: {
    type: "object",
    properties: { evidenceId: { type: "string", description: "Id da evidência, como veio em searchEvidence." } },
    required: ["evidenceId"],
    additionalProperties: false,
  },
  describe: (args) => `📄 Lendo a evidência: ${String(args.evidenceId ?? "")}`,
  async run(args, ctx) {
    const id = normalizeId(requireString(args, "evidenceId", 100));
    const evidence = await getEvidence(id);

    if (!evidence) {
      // Devolver os ids válidos deixa o modelo se corrigir sozinho na próxima rodada.
      return { output: { found: false, message: `Não existe evidência com o id "${id}".`, validIds: await listEvidenceIds() }, status: "warning" };
    }

    warnIfInjection(id, evidence.content, ctx);
    return {
      output: {
        found: true,
        id,
        title: evidence.title,
        kind: evidence.kind,
        content: wrapAsData(id, truncate(evidence.content, MAX_TOOL_OUTPUT_CHARS)),
      },
    };
  },
};

// ── Dados estruturados: linha do tempo e suspeitos ───────────────────────────
// Diferente dos documentos, estes dados são uma TABELA (horário, evento, fonte).
// Para dado estruturado, uma ferramenta simples resolve — não precisa de RAG.
const getTimeline: AgentTool = {
  name: "getTimeline",
  description: "Devolve a linha do tempo do caso: horário, evento e as evidências que sustentam cada evento. Use para ver a ORDEM dos acontecimentos.",
  parameters: { type: "object", properties: {}, additionalProperties: false },
  describe: () => "🕒 Consultando a linha do tempo",
  async run() {
    return { output: { events: timeline } };
  },
};

const listSuspects: AgentTool = {
  name: "listSuspects",
  description: "Lista os suspeitos do caso: nome, função e descrição. Não traz depoimentos — para isso, use searchEvidence ou readEvidence.",
  parameters: { type: "object", properties: {}, additionalProperties: false },
  describe: () => "👥 Listando os suspeitos",
  async run() {
    return { output: { suspects: suspects.map(({ name, role, description }) => ({ name, role, description })) } };
  },
};

// ── Memória: o caderno de notas (AULA 05) ────────────────────────────────────
const NOTE_KINDS: readonly NoteKind[] = ["plano", "achado", "contradicao"];
const NOTE_ICON: Record<NoteKind, string> = { plano: "📋", achado: "📌", contradicao: "⚠️" };

const saveNote: AgentTool = {
  name: "saveNote",
  description:
    "Anota no caderno da investigação (sua memória entre perguntas). kind='plano' ao começar (2 a 4 passos), 'achado' para um fato relevante, 'contradicao' quando duas fontes se contradizem. Cite os ids das evidências no texto.",
  parameters: {
    type: "object",
    properties: {
      kind: { type: "string", enum: [...NOTE_KINDS], description: "Tipo da nota." },
      text: { type: "string", description: "A anotação, curta e objetiva, citando as evidências." },
    },
    required: ["kind", "text"],
    additionalProperties: false,
  },
  describe: (args) => `${NOTE_ICON[args.kind as NoteKind] ?? "📝"} Anotando (${String(args.kind ?? "?")}): ${String(args.text ?? "").slice(0, 90)}`,
  async run(args, ctx) {
    const kind = requireEnum(args, "kind", NOTE_KINDS);
    const text = requireString(args, "text", 500);

    const total = await addNote(ctx.sessionId, { kind, text });
    if (total === null) return { output: { saved: false, message: "O caderno está cheio. Conclua a investigação com o que já tem." }, status: "warning" };
    return { output: { saved: true, totalNotes: total }, status: kind === "contradicao" ? "warning" : "done" };
  },
};

// ── Saída estruturada + aprovação humana (AULA 03 + 05) ──────────────────────
const proposeAccusation: AgentTool = {
  name: "proposeAccusation",
  description:
    "Propõe a acusação final para o detetive humano aprovar ou rejeitar. É a ÚNICA forma de propor uma acusação: se você escrever \"proponho acusar…\" ou \"vamos seguir com a proposta?\" em texto, sem chamar esta ferramenta, a proposta NÃO existe e o detetive não recebe os botões de aprovação. Chame-a assim que tiver base nas evidências e uma descoberta anotada. Isso NÃO encerra o caso: a decisão é humana.",
  parameters: {
    type: "object",
    properties: {
      suspect: { type: "string", enum: suspects.map((s) => s.name), description: "Nome do suspeito principal." },
      confidence: { type: "string", enum: ["baixa", "media", "alta"], description: "Sua confiança (estimativa, não uma probabilidade estatística)." },
      evidenceIds: { type: "array", items: { type: "string" }, description: "Ids das evidências que sustentam a conclusão." },
      contradictions: { type: "array", items: { type: "string" }, description: "Contradições encontradas, uma por item, citando as fontes." },
      conclusion: { type: "string", description: "Conclusão explicada, baseada só nas evidências consultadas." },
    },
    required: ["suspect", "confidence", "evidenceIds", "contradictions", "conclusion"],
    additionalProperties: false,
  },
  describe: (args) => `⚖️ Propondo acusação: ${String(args.suspect ?? "?")}`,
  async run(args, ctx) {
    // Trava de PROCESSO em código: o prompt pede para anotar as descobertas, mas o modelo pode
    // esquecer. Aqui garantimos: sem nenhuma descoberta anotada, não há acusação. O erro volta
    // ao modelo, que anota e tenta de novo.
    const notes = await listNotes(ctx.sessionId);
    if (!notes.some((note) => note.kind !== "plano")) {
      throw new ToolArgError('Antes de propor a acusação, registre com saveNote ao menos uma descoberta (kind "achado" ou "contradicao"), citando as evidências.');
    }

    // Validação em código: o suspeito precisa existir e as evidências citadas também.
    const report = validateAccusation(args, suspects.map((s) => s.name), await listEvidenceIds());
    return {
      output: { status: "aguardando_aprovacao_humana", message: "Acusação enviada ao detetive humano. Não diga que o caso está encerrado." },
      finalReport: report, // ← o loop para aqui e mostra o cartão Aprovar/Rejeitar
    };
  },
};

export const caseTools: AgentTool[] = [searchEvidence, readEvidence, getTimeline, listSuspects, saveNote, proposeAccusation];
