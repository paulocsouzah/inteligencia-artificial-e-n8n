# 4. Exercício 01 — Embeddings e Similaridade

**Nível: 🟢 Básico.**

Antes de construir um RAG completo, vamos confirmar que você entende o
que um embedding realmente captura: significado, não palavras.

## 🎯 Objetivo

Gerar embeddings de frases diferentes e comprovar, com números reais, que
frases com significado parecido têm similaridade alta — mesmo sem
compartilhar vocabulário.

## 📋 Passo a passo

1. No mesmo projeto das aulas anteriores, crie `similaridade.js`:

   ```js
   import "dotenv/config";
   import OpenAI from "openai";

   const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

   function similaridadeCosseno(a, b) {
     let produtoEscalar = 0, normaA = 0, normaB = 0;
     for (let i = 0; i < a.length; i++) {
       produtoEscalar += a[i] * b[i];
       normaA += a[i] * a[i];
       normaB += b[i] * b[i];
     }
     return produtoEscalar / (Math.sqrt(normaA) * Math.sqrt(normaB));
   }

   async function embed(texto) {
     const response = await client.embeddings.create({ model: "text-embedding-3-small", input: texto });
     return response.data[0].embedding;
   }

   const frases = [
     "Quero cancelar minha assinatura.",
     "Como faço para não ser mais cobrado?",
     "Qual o horário de funcionamento da loja física?",
     "Vocês entregam aos sábados?",
     "Meu pedido está atrasado, o que aconteceu?"
   ];

   const embeddings = [];
   for (const frase of frases) {
     embeddings.push({ frase, embedding: await embed(frase) });
   }

   console.log("Matriz de similaridade:\n");
   for (let i = 0; i < embeddings.length; i++) {
     for (let j = i + 1; j < embeddings.length; j++) {
       const score = similaridadeCosseno(embeddings[i].embedding, embeddings[j].embedding);
       console.log(`"${embeddings[i].frase}"\nx "${embeddings[j].frase}"\n→ ${score.toFixed(4)}\n`);
     }
   }
   ```

2. Rode e guarde print do resultado:

   ```bash
   node similaridade.js
   ```

3. Identifique, na matriz de similaridade impressa, o par de frases com
   o **maior** score e o par com o **menor** score.

4. **Desafio:** adicione mais duas frases suas — uma que deveria ter
   score alto com `"Quero cancelar minha assinatura."`, e outra
   completamente sem relação com nenhuma das cinco originais. Confirme se
   os scores bateram com sua expectativa.

## 📊 Comparação

| Par de frases | Score | Você esperava alto ou baixo? |
|---|---|---|
| (preencha os 3 pares com maior score) | | |
| (preencha os 3 pares com menor score) | | |

## 🧪 Perguntas de reflexão

1. Qual par de frases teve o maior score, mesmo sem palavras em comum? O
   resultado confirma o que você esperava?
2. Existe algum par de frases cujo score ficou "no meio do caminho" (nem
   muito alto, nem muito baixo)? Como você explicaria essa ambiguidade?
3. Se você tivesse que decidir um valor de corte (ex.: "só considero
   relevante se o score for maior que 0.5") para um sistema de busca de
   verdade, como você escolheria esse número, com base no que observou
   aqui?
4. No desafio: os scores confirmaram sua expectativa? Se não, o que isso
   te ensina sobre confiar cegamente na similaridade de embeddings?

**Próximo passo:** [05-exercicio-02-retrieval](../05-exercicio-02-retrieval/README.md)
