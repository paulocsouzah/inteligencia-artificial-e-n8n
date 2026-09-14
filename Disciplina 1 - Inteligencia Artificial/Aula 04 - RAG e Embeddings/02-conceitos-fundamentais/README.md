# 2. Conceitos Fundamentais

Cinco conceitos que, juntos, formam RAG. Nenhum deles é complicado
isoladamente — a mágica está em como eles se encaixam.

---

## 🔢 Embeddings

> Um embedding é uma lista de números que representa o **significado** de
> um texto.

Um **embedding** é o resultado de mandar um texto para um modelo
especializado, que devolve um **vetor** (uma lista de números, geralmente
centenas ou milhares deles) representando o significado daquele texto —
não as palavras em si, o **sentido**.

```js
const embedding = await client.embeddings.create({
  model: "text-embedding-3-small",
  input: "Qual é a política de reembolso de vocês?"
});

console.log(embedding.data[0].embedding);
// [0.0123, -0.0456, 0.0789, ..., 0.0012]  (1536 números)
```

A propriedade mágica: **textos com significado parecido geram vetores
parecidos** — mesmo que usem palavras completamente diferentes.
`"Quero meu dinheiro de volta"` e `"Como funciona o reembolso?"` têm
embeddings próximos, mesmo sem compartilhar quase nenhuma palavra —
porque o **significado** é parecido.

## 📐 Similaridade de cosseno

> A forma padrão de medir "quão parecidos" dois embeddings são.

Como você compara dois vetores de 1536 números? Com **similaridade de
cosseno** — um número entre -1 e 1 que mede o quão "alinhados" dois
vetores estão. Quanto mais perto de 1, mais parecido o significado.

```js
function similaridadeCosseno(a, b) {
  let produtoEscalar = 0, normaA = 0, normaB = 0;
  for (let i = 0; i < a.length; i++) {
    produtoEscalar += a[i] * b[i];
    normaA += a[i] * a[i];
    normaB += b[i] * b[i];
  }
  return produtoEscalar / (Math.sqrt(normaA) * Math.sqrt(normaB));
}
```

Você não precisa entender a fórmula matemática de cor — o que importa é o
comportamento: `similaridadeCosseno(embeddingA, embeddingB)` próximo de
`1` = textos com significado parecido; próximo de `0` = textos sem
relação nenhuma.

## ✂️ Chunking

> Dividir um documento grande em pedaços menores antes de gerar os
> embeddings.

Você não gera **um** embedding para um manual de 80 páginas — isso
misturaria dezenas de assuntos diferentes num único vetor, tornando a
busca inútil (o vetor ficaria "genérico demais"). Em vez disso, você
**quebra o documento em pedaços** (chunks) — parágrafos, seções, ou blocos
de N caracteres — e gera um embedding **para cada pedaço**.

```
Manual de 80 páginas
       │
       ▼
Divide em ~200 chunks (um por seção/parágrafo)
       │
       ▼
Gera 1 embedding por chunk (200 chamadas de API, ou em lote)
```

**Trade-off de tamanho do chunk:** chunk pequeno demais perde contexto
(uma frase sozinha pode não fazer sentido); chunk grande demais volta ao
problema original (mistura assuntos, fica "genérico"). Um ponto de
partida comum: pedaços de 200-500 palavras, respeitando quebras naturais
(parágrafo, seção) em vez de cortar no meio de uma frase.

## 🗄️ Vector database (vector store)

> Onde os embeddings ficam guardados, prontos para busca rápida.

Depois de gerar o embedding de cada chunk, você precisa **guardá-los** em
algum lugar que permita perguntar "quais desses 10.000 vetores são mais
parecidos com ESTE vetor aqui?" rapidamente. Isso é um **vector database**
(ou *vector store*).

- Para protótipos e bases pequenas (o que vamos fazer hoje): um **array
  em memória** já resolve — você calcula a similaridade contra cada item,
  um por um.
- Para produção, em escala (milhões de vetores): bancos especializados
  como **Chroma**, **pgvector** (extensão do PostgreSQL) ou serviços
  gerenciados (Pinecone) usam estruturas de indexação que buscam sem
  precisar comparar vetor por vetor — muito mais rápido.

O **conceito** de busca é o mesmo nos dois casos; o que muda é a
performance em escala.

## 🔍 Retrieval

> O passo de buscar os trechos mais relevantes para uma pergunta.

Juntando tudo: **retrieval** é gerar o embedding da **pergunta**, comparar
com o embedding de cada chunk guardado, e pegar os `top-k` (ex.: os 3
mais similares) — esses viram o contexto que vai para o prompt.

```js
function buscar(perguntaEmbedding, chunks, topK = 3) {
  return chunks
    .map(chunk => ({ ...chunk, score: similaridadeCosseno(perguntaEmbedding, chunk.embedding) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}
```

**Quantos chunks recuperar (`topK`)?** Poucos demais (`topK: 1`) e você
arrisca perder informação relevante que estava em outro chunk. Demais
(`topK: 20`) e você volta a gastar tokens à toa, com informação pouco
relevante "diluindo" o contexto — o mesmo trade-off de custo x qualidade
que você já viu com tokens na Aula 03.

## 🧩 Juntando tudo: RAG

```
1. (Uma vez, ao preparar a base) Chunking dos documentos → embedding de cada chunk → guardar no vector store
2. (A cada pergunta) Embedding da pergunta → retrieval dos chunks mais similares
3. Montar o prompt: "Responda com base no contexto abaixo: [chunks recuperados] Pergunta: [pergunta do cliente]"
4. Chamar o LLM (exatamente como você já faz desde a Aula 03) e devolver a resposta
```

Repare: os passos 3 e 4 são **literalmente** o que você já fez na Aula 03
— RAG não substitui nada que você aprendeu, só automatiza a escolha do
contexto que antes você escrevia à mão.

## 💰 Custo de embeddings

Embeddings também são cobrados por token — mas o modelo de embedding é
**bem mais barato** que um modelo de chat (ex.: `text-embedding-3-small`
custa uma fração do preço do `gpt-4o-mini`). Isso importa porque, na fase
de preparação da base, você pode gerar milhares de embeddings (um por
chunk) — vale sempre conferir o preço atual do modelo de embedding
escolhido, mas o custo dessa etapa costuma ser bem menor do que parece à
primeira vista.

---

## 📝 Resumo visual

| Conceito | Em uma frase |
|---|---|
| Embedding | Vetor de números que representa o significado de um texto |
| Similaridade de cosseno | Mede o quanto dois embeddings são parecidos (-1 a 1) |
| Chunking | Dividir documentos grandes em pedaços antes de gerar embedding |
| Vector database | Onde os embeddings ficam guardados para busca rápida |
| Retrieval | Buscar os chunks mais similares à pergunta |
| RAG | Retrieval + o prompt/chamada de API que você já sabe fazer desde a Aula 03 |

---

## 🧪 Exercício

Responda por escrito, sem escrever código (a prática vem no próximo
módulo):

1. Por que `"Quero cancelar minha assinatura"` e `"Como faço para não
   ser mais cobrado?"` deveriam ter embeddings parecidos, mesmo sem
   compartilhar nenhuma palavra em comum?
2. Se você chunkar um documento em pedaços de 1 frase cada, o que pode
   dar errado numa busca? E se você usar o documento inteiro como um
   chunk só?
3. Explique com suas palavras por que RAG **não é** o modelo "aprendendo"
   o documento novo — o modelo continua sendo o mesmo de sempre; o que
   muda é o quê?
4. Pensando no cenário do módulo: dê um exemplo de pergunta de cliente em
   que `topK: 1` (só o chunk mais similar) seria suficiente, e outro
   exemplo em que você precisaria de `topK: 3` ou mais para responder
   direito.

**Próximo passo:** [03-demonstracao-guiada](../03-demonstracao-guiada/README.md)
