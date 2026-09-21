// ─────────────────────────────────────────────────────────────────────────────
// npm run ingest            → indexa as evidências que ainda não estão no banco
// npm run ingest -- --force → reindexa tudo (use depois de mudar o chunking ou o texto)
//
// AULA 04 · A INGESTÃO, do arquivo até o banco:
//
//   arquivo (PDF/imagem) → texto → chunks → embeddings → Postgres (pgvector)
//
// O que cada etapa faz está comentado em lib/rag/. Este script só percorre as
// evidências de case/evidence.ts e chama o pipeline para cada uma. Precisa de:
//   • o banco no ar   (npm run db:up)
//   • os arquivos     (npm run seed-case)
//   • a OPENAI_API_KEY no .env (embeddings + descrição das imagens)
// ─────────────────────────────────────────────────────────────────────────────
import "dotenv/config"; // carrega o .env ANTES dos outros imports (fora do Next, ninguém faz isso por nós)
import { promises as fs } from "fs";
import path from "path";
import { seedEvidence } from "../case/evidence";
import { pool } from "../lib/db";
import { CASE_DIR } from "../lib/rag/files";
import { ingestEvidence, readEvidenceText } from "../lib/rag/ingest";
import { isIndexed } from "../lib/rag/store";
import { toAppError } from "../lib/errors";

async function main() {
  const force = process.argv.includes("--force");

  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY não encontrada. Copie .env.example para .env e preencha a chave.");
  }

  console.log(`\n🕵️  AI Detective — indexando ${seedEvidence.length} evidências (RAG)\n`);
  let chunkTotal = 0;

  for (const meta of seedEvidence) {
    if (!force && (await isIndexed(meta.id))) {
      console.log(`  ⏭️   ${meta.id} — já indexada`);
      continue;
    }

    const buffer = await fs.readFile(path.join(CASE_DIR, meta.filename)).catch(() => {
      throw new Error(`Arquivo ${meta.filename} não encontrado. Rode antes: npm run seed-case`);
    });

    const text = await readEvidenceText(meta, buffer); // PDF → texto  |  imagem → descrição do modelo de visão
    const chunks = await ingestEvidence(meta, text); // chunks → embeddings → banco
    chunkTotal += chunks;
    console.log(`  ✅  ${meta.id} — ${text.length} caracteres, ${chunks} chunk(s)`);
  }

  console.log(`\n✅  Pronto: ${chunkTotal} chunk(s) novos no banco.\n`);
}

main()
  .catch((err) => {
    console.error("\n❌  Falha na ingestão:", err instanceof Error && !("code" in err) ? err.message : toAppError(err).message);
    if (process.env.DEBUG) console.error(err);
    process.exitCode = 1;
  })
  .finally(() => pool.end()); // fecha as conexões, senão o processo não termina
