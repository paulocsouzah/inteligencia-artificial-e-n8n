// Popula o RDS Postgres com o runbook, dividido em chunks, cada um com
// seu embedding — a tabela "documentos" é usada pela tool
// consultar_documentacao do AI Software Engineer. Mesmo padrão da
// Aula 04 e do Exercício 04 desta aula.
import "dotenv/config";
import pg from "pg";
import pgvector from "pgvector/pg";
import OpenAI from "openai";
import { documentacao } from "./fixtures.js";

const { Client } = pg;
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function embed(texto) {
  const response = await openai.embeddings.create({ model: "text-embedding-3-small", input: texto });
  return response.data[0].embedding;
}

async function main() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();

  console.log("Habilitando extensão pgvector...");
  await client.query("CREATE EXTENSION IF NOT EXISTS vector");
  await pgvector.registerTypes(client);

  console.log("Criando tabela documentos (se não existir)...");
  await client.query(`
    CREATE TABLE IF NOT EXISTS documentos (
      id SERIAL PRIMARY KEY,
      texto TEXT NOT NULL,
      embedding vector(1536)
    )
  `);

  console.log("Limpando dados antigos...");
  await client.query("TRUNCATE documentos");

  const chunks = documentacao.split(/\n\n/).map(c => c.trim()).filter(Boolean);
  console.log(`Runbook dividido em ${chunks.length} chunks.\n`);

  for (const chunk of chunks) {
    const embedding = await embed(chunk);
    await client.query(
      "INSERT INTO documentos (texto, embedding) VALUES ($1, $2)",
      [chunk, pgvector.toSql(embedding)]
    );
    console.log("Inserido:", chunk.split("\n")[0]);
  }

  console.log(`\n✅ ${chunks.length} chunks inseridos no RDS.`);
  await client.end();
}

main().catch(erro => {
  console.error("Erro ao popular o banco:", erro.message);
  process.exit(1);
});
