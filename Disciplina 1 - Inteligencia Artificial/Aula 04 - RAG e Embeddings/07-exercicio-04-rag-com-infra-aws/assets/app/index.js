// Chatbot RAG — recebe uma pergunta, busca os chunks mais relevantes no
// RDS Postgres (via pgvector) e gera a resposta com base neles. É o
// mesmo pipeline do Exercício 03 (retrieval + geração), só que o "array
// em memória" virou uma tabela num banco de verdade.
import "dotenv/config";
import express from "express";
import pg from "pg";
import pgvector from "pgvector/pg";
import OpenAI from "openai";

const { Pool } = pg;
const app = express();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const pool = new Pool({
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

app.use(express.urlencoded({ extended: true }));

function escapeHtml(texto) {
  return String(texto)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function embed(texto) {
  const response = await openai.embeddings.create({ model: "text-embedding-3-small", input: texto });
  return response.data[0].embedding;
}

function paginaBase(conteudo) {
  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <title>Chatbot RAG — Aula 04</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 640px; margin: 48px auto; padding: 0 16px; color: #1a1a1a; }
    h1 { font-size: 20px; }
    input[type=text] { width: 75%; padding: 10px; font-size: 14px; }
    button { padding: 10px 16px; font-size: 14px; }
    .resposta { background: #f2f5fb; border-left: 4px solid #1a3c8f; padding: 12px 16px; margin: 16px 0; }
    .pergunta { color: #555; }
    details { margin-top: 8px; }
  </style>
</head>
<body>
  <h1>🤖 Chatbot RAG — Políticas da Loja</h1>
  <p>Pergunte sobre reembolso, garantia, frete, troca ou cancelamento — a resposta vem do RDS, não de um prompt escrito à mão.</p>
  ${conteudo}
</body>
</html>`;
}

const formulario = `
  <form method="POST" action="/perguntar">
    <input type="text" name="pergunta" placeholder="Ex.: meu produto quebrou sozinho, o que eu faço?" required />
    <button type="submit">Perguntar</button>
  </form>
`;

app.get("/", (req, res) => {
  res.send(paginaBase(formulario));
});

app.post("/perguntar", async (req, res) => {
  const pergunta = req.body.pergunta || "";
  const client = await pool.connect();

  try {
    await pgvector.registerTypes(client);
    const perguntaEmbedding = await embed(pergunta);

    const resultado = await client.query(
      "SELECT texto, embedding <=> $1 AS distancia FROM documentos ORDER BY distancia LIMIT 2",
      [pgvector.toSql(perguntaEmbedding)]
    );

    const contexto = resultado.rows.map(r => r.texto).join("\n\n");

    const resposta = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Você é um atendente de e-commerce. Responda a pergunta do cliente usando APENAS as informações do contexto abaixo. Se o contexto não tiver a resposta, diga que vai verificar com a equipe responsável.\n\nContexto:\n${contexto}`
        },
        { role: "user", content: pergunta }
      ]
    });

    const html = `
      <p class="pergunta"><strong>Você perguntou:</strong> ${escapeHtml(pergunta)}</p>
      <div class="resposta">${escapeHtml(resposta.choices[0].message.content)}</div>
      <details>
        <summary>Contexto recuperado do RDS (${resultado.rows.length} chunk(s))</summary>
        <pre>${escapeHtml(contexto)}</pre>
      </details>
      ${formulario}
    `;
    res.send(paginaBase(html));
  } catch (erro) {
    console.error(erro);
    res.status(500).send(paginaBase(`<p>Erro ao processar a pergunta: ${escapeHtml(erro.message)}</p>${formulario}`));
  } finally {
    client.release();
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Chatbot RAG rodando na porta ${PORT}`));
