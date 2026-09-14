# 5. Exercício 02 — Retrieval sobre uma Base de FAQ

**Nível: 🟡 Médio.**

Agora vamos construir a peça de **busca** — dado um conjunto de
documentos e uma pergunta nova, encontrar automaticamente os mais
relevantes. Ainda sem gerar a resposta final (isso vem no Exercício 03).

## 🎯 Objetivo

Implementar uma função de retrieval reutilizável, testando com perguntas
que **não repetem o vocabulário** dos documentos de propósito.

## 🧪 A base de FAQ

```
1. "Aceitamos as bandeiras Visa, Mastercard e Elo, em até 12x sem juros no cartão de crédito."
2. "O prazo de entrega padrão é de 5 a 10 dias úteis para todo o Brasil, via transportadora."
3. "Produtos com defeito de fabricação têm garantia de 12 meses a partir da data da compra."
4. "Reembolsos são processados em até 7 dias após a confirmação da devolução, no mesmo método de pagamento usado na compra."
5. "Você pode rastrear seu pedido pelo código de rastreio enviado por e-mail assim que ele sai do centro de distribuição."
6. "Trocas por tamanho ou cor diferente podem ser feitas em até 30 dias, desde que o produto não tenha sido usado."
```

## 📋 Passo a passo

1. Crie `retrieval.js`:

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

   const faq = [
     "Aceitamos as bandeiras Visa, Mastercard e Elo, em até 12x sem juros no cartão de crédito.",
     "O prazo de entrega padrão é de 5 a 10 dias úteis para todo o Brasil, via transportadora.",
     "Produtos com defeito de fabricação têm garantia de 12 meses a partir da data da compra.",
     "Reembolsos são processados em até 7 dias após a confirmação da devolução, no mesmo método de pagamento usado na compra.",
     "Você pode rastrear seu pedido pelo código de rastreio enviado por e-mail assim que ele sai do centro de distribuição.",
     "Trocas por tamanho ou cor diferente podem ser feitas em até 30 dias, desde que o produto não tenha sido usado."
   ];

   async function construirBase(documentos) {
     const base = [];
     for (const texto of documentos) {
       base.push({ texto, embedding: await embed(texto) });
     }
     return base;
   }

   async function buscar(pergunta, base, topK = 2) {
     const perguntaEmbedding = await embed(pergunta);
     return base
       .map(doc => ({ texto: doc.texto, score: similaridadeCosseno(perguntaEmbedding, doc.embedding) }))
       .sort((a, b) => b.score - a.score)
       .slice(0, topK);
   }

   const base = await construirBase(faq);

   const perguntas = [
     "Posso parcelar minha compra?",
     "Meu produto parou de funcionar sozinho, ainda estou coberto?",
     "Quero uma cor diferente da que comprei, dá para trocar?"
   ];

   for (const pergunta of perguntas) {
     const resultados = await buscar(pergunta, base, 2);
     console.log(`\nPergunta: "${pergunta}"`);
     resultados.forEach((r, i) => console.log(`  ${i + 1}. (${r.score.toFixed(4)}) ${r.texto}`));
   }
   ```

2. Rode e confira se cada pergunta recuperou o item de FAQ certo:

   ```bash
   node retrieval.js
   ```

   Repare: nenhuma das três perguntas usa as palavras exatas do item de
   FAQ correspondente ("parcelar" x "12x sem juros no cartão", "parou de
   funcionar sozinho" x "defeito de fabricação", "cor diferente" x
   "trocas por tamanho ou cor").

3. **Desafio:** adicione uma pergunta **ambígua de propósito** — que
   poderia razoavelmente se relacionar com dois itens da FAQ ao mesmo
   tempo (ex.: algo sobre "quero meu dinheiro de volta porque o produto
   quebrou" — toca em reembolso E garantia). Rode com `topK: 3` e veja se
   os dois itens relevantes aparecem entre os 3 primeiros.

## 📊 Comparação

| Pergunta | Item recuperado (1º lugar) | Score | Era o item certo da FAQ? |
|---|---|---|---|
| "Posso parcelar minha compra?" | | | |
| "Meu produto parou de funcionar sozinho..." | | | |
| "Quero uma cor diferente..." | | | |

## 🧪 Perguntas de reflexão

1. O retrieval encontrou o item certo em todas as perguntas, mesmo sem
   vocabulário em comum? Alguma pergunta "confundiu" o sistema?
2. Por que seria um erro de design fazer essa busca com um simples
   `String.includes()` procurando palavras-chave, em vez de embeddings?
   Pense numa pergunta em que isso falharia.
3. No desafio (pergunta ambígua): os dois itens relevantes apareceram no
   top 3? O que isso te diz sobre escolher `topK` maior que 1 quando a
   pergunta pode tocar em mais de um assunto?
4. Se essa FAQ tivesse 5.000 itens em vez de 6, o que mudaria na sua
   implementação (pense na seção de vector database do módulo de
   conceitos)?

**Próximo passo:** [06-exercicio-03-rag-completo](../06-exercicio-03-rag-completo/README.md)
