import { toSql } from "pgvector";
import { query } from "../db";
import { embedQuery } from "./embed";
import { RAG } from "../config";

// ─────────────────────────────────────────────────────────────────────────────
// AULA 04 · RETRIEVAL — dado uma pergunta, achar os trechos mais parecidos.
//
//   pergunta → embedding → "quais chunks têm o vetor mais próximo?"
//
// O operador `<=>` do pgvector calcula a DISTÂNCIA de cosseno (0 = idêntico).
// Convertemos para SIMILARIDADE (1 - distância): quanto mais perto de 1, mais
// parecido o significado.
// ─────────────────────────────────────────────────────────────────────────────

export interface RetrievedChunk {
  evidenceId: string;
  title: string;
  score: number;
  content: string;
}

export async function retrieve(question: string, topK = RAG.topK, minScore = RAG.minScore): Promise<RetrievedChunk[]> {
  const embedding = toSql(await embedQuery(question));

  const { rows } = await query<{ evidence_id: string; title: string; content: string; score: number }>(
    `SELECT c.evidence_id, e.title, c.content, 1 - (c.embedding <=> $1::vector) AS score
     FROM chunks c
     JOIN evidence e ON e.id = c.evidence_id
     ORDER BY c.embedding <=> $1::vector
     LIMIT $2`,
    [embedding, topK]
  );

  // Guardrail contra alucinação: trecho pouco parecido é descartado. Se nada
  // passar do corte, o agente recebe uma lista vazia e responde "não sei" em
  // vez de tentar fingir que o que veio tem a ver com a pergunta.
  return rows
    .filter((row) => row.score >= minScore)
    .map((row) => ({ evidenceId: row.evidence_id, title: row.title, score: Number(row.score), content: row.content }));
}
