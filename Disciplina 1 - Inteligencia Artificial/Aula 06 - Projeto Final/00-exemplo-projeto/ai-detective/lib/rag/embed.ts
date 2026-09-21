import { getOpenAI } from "../openai";
import { EMBEDDING_MODEL } from "../config";

// ─────────────────────────────────────────────────────────────────────────────
// AULA 04 · EMBEDDINGS — transformar texto em números.
//
// Um embedding é uma lista de 1536 números que representa o SIGNIFICADO de um
// texto. Textos com significado parecido geram vetores próximos, mesmo sem
// palavras em comum ("crachá" e "credencial", por exemplo). É isso que permite
// a busca semântica — a busca por palavra-chave do projeto antigo não achava
// essas equivalências.
//
// IMPORTANTE: o chunk e a pergunta precisam ser vetorizados com o MESMO modelo.
// ─────────────────────────────────────────────────────────────────────────────

const BATCH_SIZE = 64; // a API aceita vários textos por chamada — bem mais barato e rápido

export async function embedTexts(texts: string[]): Promise<number[][]> {
  const client = getOpenAI();
  const vectors: number[][] = [];

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const response = await client.embeddings.create({
      model: EMBEDDING_MODEL,
      input: texts.slice(i, i + BATCH_SIZE),
    });
    vectors.push(...response.data.map((item) => item.embedding));
  }
  return vectors;
}

export async function embedQuery(text: string): Promise<number[]> {
  const [vector] = await embedTexts([text]);
  return vector;
}
