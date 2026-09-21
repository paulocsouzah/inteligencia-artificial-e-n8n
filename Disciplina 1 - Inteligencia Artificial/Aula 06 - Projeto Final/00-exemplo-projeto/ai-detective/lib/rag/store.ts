import { toSql } from "pgvector";
import type { EvidenceMeta } from "@/types";
import { query } from "../db";

// ─────────────────────────────────────────────────────────────────────────────
// AULA 04 · VECTOR STORE — gravar e ler evidências e chunks no Postgres.
//
// Só SQL aqui, nada de OpenAI. Se um dia você trocar o banco vetorial
// (Pinecone, Chroma, OpenSearch…), este é o único arquivo que muda.
// ─────────────────────────────────────────────────────────────────────────────

type EvidenceRow = {
  id: string;
  kind: EvidenceMeta["kind"];
  category: EvidenceMeta["category"];
  title: string;
  filename: string;
  description: string;
  uploaded: boolean;
};

const META_COLUMNS = "id, kind, category, title, filename, description, uploaded";

/** Grava (ou atualiza) uma evidência. `content` é o texto INTEIRO: o do PDF ou a descrição da imagem. */
export async function saveEvidence(meta: EvidenceMeta, content: string): Promise<void> {
  await query(
    `INSERT INTO evidence (id, kind, category, title, filename, description, content, uploaded)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     ON CONFLICT (id) DO UPDATE SET
       kind = $2, category = $3, title = $4, filename = $5, description = $6, content = $7, uploaded = $8`,
    [meta.id, meta.kind, meta.category, meta.title, meta.filename, meta.description, content, meta.uploaded]
  );
}

/** Troca todos os chunks de uma evidência pelos novos (re-ingerir não duplica nada). */
export async function replaceChunks(evidenceId: string, contents: string[], embeddings: number[][]): Promise<void> {
  await query("DELETE FROM chunks WHERE evidence_id = $1", [evidenceId]);
  if (contents.length === 0) return;

  // Um INSERT só, com todos os chunks: cada embedding vira o texto "[0.1,0.2,…]"
  // (toSql) e o Postgres converte para o tipo vector (::vector).
  await query(
    `INSERT INTO chunks (evidence_id, position, content, embedding)
     SELECT $1, t.position, t.content, t.embedding::vector
     FROM unnest($2::int[], $3::text[], $4::text[]) AS t(position, content, embedding)`,
    [evidenceId, contents.map((_, i) => i), contents, embeddings.map((e) => toSql(e))]
  );
}

export async function listEvidence(): Promise<EvidenceMeta[]> {
  const { rows } = await query<EvidenceRow>(`SELECT ${META_COLUMNS} FROM evidence ORDER BY uploaded, created_at, id`);
  return rows;
}

export async function getEvidence(id: string): Promise<(EvidenceMeta & { content: string }) | null> {
  const { rows } = await query<EvidenceRow & { content: string }>(
    `SELECT ${META_COLUMNS}, content FROM evidence WHERE id = $1`,
    [id]
  );
  return rows[0] ?? null;
}

export async function listEvidenceIds(): Promise<string[]> {
  const { rows } = await query<{ id: string }>("SELECT id FROM evidence ORDER BY id");
  return rows.map((r) => r.id);
}

/** A evidência já foi indexada de verdade? (existe ao menos um chunk dela) */
export async function isIndexed(id: string): Promise<boolean> {
  const { rows } = await query("SELECT 1 FROM chunks WHERE evidence_id = $1 LIMIT 1", [id]);
  return rows.length > 0;
}
