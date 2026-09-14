// Popula o RDS Postgres com o manual de políticas, dividido em chunks,
// cada um com seu embedding — a etapa "1. (uma vez, ao preparar a base)"
// do pipeline de RAG que você viu no módulo de conceitos da Aula 04.
import "dotenv/config";
import pg from "pg";
import pgvector from "pgvector/pg";
import OpenAI from "openai";

const { Client } = pg;
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Mesmo manual do Exercício 03 (em memória) — agora ele vai morar no RDS.
const manual = `POLÍTICA DE REEMBOLSO
Reembolso integral em até 7 dias após a entrega. Caso o produto tenha
chegado com defeito de fábrica, o cliente não precisa devolver o produto
para receber o reembolso ou a troca — basta enviar fotos do defeito.
Casos com defeito de fábrica têm prioridade máxima no atendimento.

POLÍTICA DE GARANTIA
Todos os produtos eletrônicos têm 12 meses de garantia contra defeito de
fabricação, contados a partir da data de compra. A garantia não cobre
danos causados por mau uso, quedas ou contato com líquidos.

POLÍTICA DE FRETE E ENTREGA
Frete grátis para compras acima de R$ 200. Prazo de entrega de 5 a 10
dias úteis para regiões metropolitanas, podendo chegar a 15 dias úteis
para outras regiões. Pedidos atrasados além do prazo informado têm
prioridade de investigação junto à transportadora.

POLÍTICA DE TROCA
Trocas por tamanho, cor ou modelo diferente podem ser solicitadas em até
30 dias corridos após o recebimento, desde que o produto esteja sem uso e
com a embalagem original.

POLÍTICA DE CANCELAMENTO
Pedidos podem ser cancelados sem custo enquanto ainda não tiverem sido
despachados. Após o despacho, o cliente deve aguardar a entrega e seguir
o processo de reembolso.`;

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
    // O RDS Postgres exige conexão criptografada por padrão. Em produção
    // de verdade, use o certificado da AWS (rds-ca-*.pem) em vez de
    // "rejectUnauthorized: false" — aqui simplificamos para a aula.
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();

  console.log("Habilitando extensão pgvector...");
  await client.query("CREATE EXTENSION IF NOT EXISTS vector");

  // registerTypes só funciona DEPOIS da extensão existir — ela consulta
  // o tipo "vector" em pg_type, que só existe a partir daqui.
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

  const chunks = manual.split(/\n\s*\n/).map(c => c.trim()).filter(Boolean);
  console.log(`Documento dividido em ${chunks.length} chunks.\n`);

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
