import type { Note } from "@/types";
import { query } from "../db";
import { MAX_NOTES } from "../config";

// ─────────────────────────────────────────────────────────────────────────────
// AULA 05 · MEMÓRIA — o caderno de notas do agente.
//
// Duas memórias trabalham juntas:
//   • curto prazo → o histórico da conversa (o navegador reenvia a cada pergunta);
//   • trabalho    → este caderno. O agente escreve nele com a tool saveNote e,
//                    a cada turno, o conteúdo volta para dentro do system prompt.
//
// Por que precisa do caderno? Entre um turno e outro, o histórico guarda só o
// TEXTO das respostas — os resultados das ferramentas (o PDF que ele leu, o que
// a busca achou) se perdem. O que o agente anotou, não.
//
// As notas ficam no banco, amarradas a um sessionId (um por conversa).
// ─────────────────────────────────────────────────────────────────────────────

/** Grava uma nota. Devolve o total de notas da sessão, ou null se o limite já foi atingido. */
export async function addNote(sessionId: string, note: Note): Promise<number | null> {
  const { rows } = await query<{ total: string }>("SELECT count(*) AS total FROM notes WHERE session_id = $1", [sessionId]);
  const total = Number(rows[0].total);
  if (total >= MAX_NOTES) return null; // guardrail: um caderno sem limite viraria custo sem limite no prompt

  await query("INSERT INTO notes (session_id, kind, text) VALUES ($1, $2, $3)", [sessionId, note.kind, note.text]);
  return total + 1;
}

export async function listNotes(sessionId: string): Promise<Note[]> {
  const { rows } = await query<Note>("SELECT kind, text FROM notes WHERE session_id = $1 ORDER BY id", [sessionId]);
  return rows;
}

/** Bloco de texto que entra no system prompt a cada turno. */
export function notesToPrompt(notes: Note[]): string {
  const body = notes.length === 0 ? "(vazio — esta é uma investigação nova)" : notes.map((n) => `- [${n.kind}] ${n.text}`).join("\n");
  return `# Caderno de notas desta investigação (sua memória)
As notas abaixo foram escritas por você em turnos anteriores. Use-as para não repetir trabalho e para manter o plano.
<notas>
${body}
</notas>`;
}
