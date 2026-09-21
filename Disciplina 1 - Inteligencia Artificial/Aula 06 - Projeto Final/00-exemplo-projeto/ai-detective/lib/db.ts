import pg from "pg";
import { EMBEDDING_DIMENSIONS } from "./config";

// ─────────────────────────────────────────────────────────────────────────────
// AULA 04 · Postgres + pgvector — onde o RAG guarda os embeddings.
//
// A MESMA configuração serve para dois ambientes, só trocando o .env:
//   • local  → Postgres em Docker  (DB_HOST=localhost, DB_SSL=false)
//   • AWS    → RDS Postgres        (DB_HOST=<endpoint do RDS>, DB_SSL=true)
// O código não muda uma linha. É isso que deixa o projeto "pronto para Cloud".
// ─────────────────────────────────────────────────────────────────────────────

// O Next recarrega os módulos a cada alteração (hot reload). Guardamos a pool em
// globalThis para não abrir um monte de conexões novas a cada reload.
const globalForPool = globalThis as unknown as { pool?: pg.Pool };

export const pool =
  globalForPool.pool ??
  new pg.Pool({
    host: process.env.DB_HOST ?? "localhost",
    port: Number(process.env.DB_PORT ?? 5432),
    database: process.env.DB_NAME ?? "ai_detective",
    user: process.env.DB_USER ?? "postgres",
    password: process.env.DB_PASSWORD ?? "postgres",
    // O RDS exige conexão criptografada. Aqui aceitamos o certificado dele sem
    // validar a cadeia (simplificação de aula); em produção, use o certificado
    // oficial da AWS (rds-ca-*.pem).
    ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
  });
globalForPool.pool = pool;

// O schema é criado na primeira consulta (idempotente: "IF NOT EXISTS").
// Assim não existe um passo separado de "migração" para você esquecer de rodar.
//   evidence → uma linha por documento/imagem (o texto inteiro fica em `content`)
//   chunks   → os pedaços de cada evidência + o embedding (vetor de 1536 números)
//   notes    → o caderno de notas do agente (memória), por sessão
//   accusations → decisões do detetive humano (a ação irreversível)
const SCHEMA = `
  CREATE EXTENSION IF NOT EXISTS vector;

  CREATE TABLE IF NOT EXISTS evidence (
    id          text PRIMARY KEY,
    kind        text NOT NULL,
    category    text NOT NULL,
    title       text NOT NULL,
    filename    text NOT NULL,
    description text NOT NULL,
    content     text NOT NULL,
    uploaded    boolean NOT NULL DEFAULT false,
    created_at  timestamptz NOT NULL DEFAULT now()
  );

  CREATE TABLE IF NOT EXISTS chunks (
    id          serial PRIMARY KEY,
    evidence_id text NOT NULL REFERENCES evidence(id) ON DELETE CASCADE,
    position    int  NOT NULL,
    content     text NOT NULL,
    embedding   vector(${EMBEDDING_DIMENSIONS}) NOT NULL
  );

  CREATE TABLE IF NOT EXISTS notes (
    id          serial PRIMARY KEY,
    session_id  text NOT NULL,
    kind        text NOT NULL,
    text        text NOT NULL,
    created_at  timestamptz NOT NULL DEFAULT now()
  );
  CREATE INDEX IF NOT EXISTS notes_session_idx ON notes (session_id);

  CREATE TABLE IF NOT EXISTS accusations (
    id          serial PRIMARY KEY,
    session_id  text NOT NULL,
    decision    text NOT NULL,
    report      jsonb NOT NULL,
    decided_at  timestamptz NOT NULL DEFAULT now()
  );
`;
// Com milhões de chunks, você adicionaria um índice vetorial (HNSW) para a busca
// não varrer a tabela inteira:
//   CREATE INDEX ON chunks USING hnsw (embedding vector_cosine_ops);
// Com algumas dezenas de chunks, a varredura completa é instantânea.

let schemaReady: Promise<unknown> | null = null;

/** Executa uma consulta SQL (criando o schema antes, se ainda não existir). */
export async function query<T extends pg.QueryResultRow = pg.QueryResultRow>(
  text: string,
  params: unknown[] = []
): Promise<pg.QueryResult<T>> {
  schemaReady ??= pool.query(SCHEMA).catch((err) => {
    schemaReady = null; // se falhou (ex.: banco fora do ar), tenta de novo na próxima consulta
    throw err;
  });
  await schemaReady;
  return pool.query<T>(text, params);
}
