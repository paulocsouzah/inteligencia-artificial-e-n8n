# 3. Demonstração Guiada

Agora eu escrevo código ao vivo, compartilhando a tela. Acompanhe no seu
próprio computador — o projeto é o mesmo Node.js das aulas anteriores
(pode reaproveitar o projeto da Aula 03, só precisa do mesmo `openai` já
instalado).

---

## 🔢 Demo 1 — Gerando um embedding

```js
// demo1.js
import "dotenv/config";
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const response = await client.embeddings.create({
  model: "text-embedding-3-small",
  input: "Qual é a política de reembolso de vocês?"
});

const vetor = response.data[0].embedding;
console.log("Dimensão do vetor:", vetor.length);
console.log("Primeiros 5 valores:", vetor.slice(0, 5));
console.log("Tokens usados:", response.usage);
```

```bash
node demo1.js
```

> 💬 **Pensa comigo:** esse vetor de mais de mil números não significa
> nada "lido" por um humano — mas para o computador comparar dois
> textos, isso é muito mais útil do que comparar as letras. Por quê?

---

## 📐 Demo 2 — Comparando similaridade

```js
// demo2.js
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

const referencia = await embed("Quero cancelar minha assinatura.");
const parecida = await embed("Como faço para não ser mais cobrado?");
const diferente = await embed("Qual o horário de funcionamento da loja física?");

console.log("Referência x Parecida:", similaridadeCosseno(referencia, parecida));
console.log("Referência x Diferente:", similaridadeCosseno(referencia, diferente));
```

```bash
node demo2.js
```

> 💬 **Pensa comigo:** as duas frases sobre cancelamento não compartilham
> quase nenhuma palavra. Ainda assim, qual score você espera que seja
> maior?

---

## 🔍 Demo 3 — RAG do zero, com uma base pequena

```js
// demo3.js
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

const documentos = [
  "Política de reembolso: reembolso integral em até 7 dias após a entrega, ou troca imediata sem devolução se o produto chegou com defeito.",
  "Política de frete: frete grátis para compras acima de R$ 200. Prazo de entrega de 5 a 10 dias úteis.",
  "Garantia: todos os produtos eletrônicos têm 12 meses de garantia contra defeito de fabricação, contados a partir da data de compra."
];

// 1. Preparar a base: gerar embedding de cada documento
const base = [];
for (const texto of documentos) {
  base.push({ texto, embedding: await embed(texto) });
}

// 2. Pergunta do cliente
const pergunta = "Meu produto quebrou sozinho depois de 3 meses de uso, o que eu faço?";
const perguntaEmbedding = await embed(pergunta);

// 3. Retrieval: achar o documento mais similar
const comScore = base.map(doc => ({ ...doc, score: similaridadeCosseno(perguntaEmbedding, doc.embedding) }));
comScore.sort((a, b) => b.score - a.score);
const maisRelevante = comScore[0];

console.log("Documento recuperado:", maisRelevante.texto);
console.log("Score:", maisRelevante.score);

// 4. Gerar a resposta usando o contexto recuperado (igual à Aula 03)
const resposta = await client.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [
    { role: "system", content: `Responda a pergunta do cliente usando APENAS o contexto abaixo.\n\nContexto: ${maisRelevante.texto}` },
    { role: "user", content: pergunta }
  ]
});

console.log("\nResposta final:", resposta.choices[0].message.content);
```

```bash
node demo3.js
```

> 💬 **Pensa comigo:** a pergunta não usa a palavra "garantia" nenhuma
> vez — ainda assim, o sistema deveria recuperar o documento certo. Isso
> aconteceu?

---

## ⚖️ Demo 4 — Com RAG x sem RAG (o contraste)

```js
// demo4.js
import "dotenv/config";
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const pergunta = "Vocês dão quantos dias de garantia para eletrônicos?";

// SEM contexto — o modelo "chuta" com base no que aprendeu no treinamento
const semRag = await client.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [{ role: "user", content: pergunta }]
});

console.log("--- SEM RAG ---");
console.log(semRag.choices[0].message.content);
```

```bash
node demo4.js
```

Compare a resposta "sem RAG" (o modelo provavelmente chuta um número
genérico, tipo "geralmente 90 dias", porque ele não faz ideia da política
**real** da sua empresa) com a resposta do `demo3.js` (que usou o contexto
recuperado de verdade, "12 meses").

> 💬 **Pensa comigo:** a resposta "sem RAG" pareceu confiante mesmo sem
> saber a resposta certa? Isso é o quê, lá da Aula 01?

---

## 📝 O que anotar

- A dimensão do vetor da Demo 1 (quantos números tem).
- Os dois scores da Demo 2 — a diferença entre "parecida" e "diferente"
  foi clara?
- Se a Demo 3 recuperou o documento de **garantia**, mesmo a pergunta não
  usando essa palavra.
- A diferença entre a resposta com e sem RAG, na Demo 4 — e se a resposta
  "sem RAG" veio com a mesma confiança da resposta certa.

**Próximo passo:** [04-exercicio-01-embeddings-e-similaridade](../04-exercicio-01-embeddings-e-similaridade/README.md)
