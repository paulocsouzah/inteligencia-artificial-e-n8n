# 3. Demonstração Guiada

Agora eu escrevo código ao vivo, na sua frente. Você pode acompanhar no
seu próprio computador, digitando junto — é o melhor jeito de fixar isso.
Antes de começar, confirme que você já tem Node.js instalado e uma API
key criada (pré-requisito desta aula).

---

## ⚙️ Setup do projeto

```bash
mkdir aula03-ia-api && cd aula03-ia-api
npm init -y
npm pkg set type=module
npm install openai dotenv
```

O `npm pkg set type=module` é o que permite usar `import` (em vez de
`require`) e `await` fora de uma função — sem isso, o Node reclama que
não reconhece a sintaxe.

```
# .env
OPENAI_API_KEY=sua-key-aqui
```

```
# .gitignore
node_modules/
.env
```

> 💬 **Pensa comigo:** por que o `.gitignore` entra **antes** de eu
> escrever qualquer linha de código que use a key?

---

## 📞 Demo 1 — Primeira chamada (sem streaming)

```js
// demo1.js
import "dotenv/config";
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const response = await client.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [
    { role: "system", content: "Você é um atendente sênior de e-commerce, treinado para responder com empatia e objetividade." },
    { role: "user", content: "Comprei um notebook e ele chegou com a tela trincada. Quero reembolso urgente." }
  ]
});

console.log("Resposta:", response.choices[0].message.content);
console.log("Tokens:", response.usage);
```

```bash
node demo1.js
```

Repare no `response.usage` — é o mesmo tipo de informação que você só via
"por fora" (contando na mão) na Aula 01. Agora vem pronto, na própria
resposta.

> 💬 **Pensa comigo:** esse `messages` array é a mesma coisa que o
> Prompt C do [Exercício 01 da Aula 02](<../../Aula 02 - Prompt Engineering/04-exercicio-01-role-e-contexto/README.md>)
> — o que mudou?

---

## 🌊 Demo 2 — A mesma chamada, em streaming

```js
// demo2.js
import "dotenv/config";
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const stream = await client.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [
    { role: "system", content: "Você é um atendente sênior de e-commerce, treinado para responder com empatia e objetividade." },
    { role: "user", content: "Comprei um notebook e ele chegou com a tela trincada. Quero reembolso urgente." }
  ],
  stream: true
});

for await (const chunk of stream) {
  process.stdout.write(chunk.choices[0]?.delta?.content || "");
}
console.log();
```

```bash
node demo2.js
```

Compare a experiência de rodar `demo1.js` (espera, depois aparece tudo de
uma vez) com `demo2.js` (o texto vai "escrevendo" no terminal).

> 💬 **Pensa comigo:** em que tipo de aplicação streaming é essencial? E
> em que tipo de automação (ex.: a triagem de mensagem, rodando sem
> ninguém olhando a tela) streaming não faz diferença nenhuma?

---

## 🛠️ Demo 3 — Function calling substituindo o JSON "implorado"

```js
// demo3.js
import "dotenv/config";
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const mensagem = "Comprei um notebook e ele chegou com a tela trincada. Quero reembolso urgente.";

const response = await client.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [{ role: "user", content: mensagem }],
  tools: [{
    type: "function",
    function: {
      name: "triar_mensagem",
      description: "Classifica uma mensagem de cliente de e-commerce",
      parameters: {
        type: "object",
        properties: {
          categoria: { type: "string", enum: ["Financeiro", "Tecnico", "Logistica", "Elogio"] },
          prioridade: { type: "string", enum: ["Baixa", "Media", "Alta", "Urgente"] },
          sentimento: { type: "string", enum: ["Positivo", "Neutro", "Negativo"] }
        },
        required: ["categoria", "prioridade", "sentimento"]
      }
    }
  }],
  tool_choice: { type: "function", function: { name: "triar_mensagem" } }
});

const chamada = response.choices[0].message.tool_calls[0];
const args = JSON.parse(chamada.function.arguments);
console.log(args);
```

```bash
node demo3.js
```

Compare mentalmente com o
[Exercício 03 da Aula 02](<../../Aula 02 - Prompt Engineering/06-exercicio-03-decomposicao-e-structured-output/README.md>):
lá, você tinha que **olhar** a resposta e verificar se era um JSON
válido. Aqui, o `JSON.parse` roda sobre um argumento que o **provedor já
validou** contra o schema antes de devolver.

> 💬 **Pensa comigo:** o que aconteceria com o código do
> Exercício 03 da Aula 02 (o `JSON.parse` numa resposta de texto) se,
> uma vez em mil execuções, o modelo decidisse escrever "Aqui está a
> classificação:" antes do JSON? E com function calling?

---

## 💥 Demo 4 — Provocando e tratando um erro

```js
// demo4.js
import "dotenv/config";
import OpenAI from "openai";

const client = new OpenAI({ apiKey: "sk-chave-invalida-de-propósito" });

try {
  await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: "Olá" }]
  });
} catch (erro) {
  console.log("Status:", erro.status);
  console.log("Mensagem:", erro.message);
}
```

```bash
node demo4.js
```

Isso simula uma key inválida (erro `401`). Para simular rate limit
(`429`) de verdade seria preciso disparar muitas chamadas rapidamente —
eu mostro o código do retry com backoff (do módulo de conceitos) e
explico o comportamento esperado, sem precisar estourar o limite de
verdade ao vivo.

> 💬 **Pensa comigo:** se esse `catch` não existisse, o que aconteceria
> com um script que roda 500 mensagens em sequência, e a chave expira na
> mensagem 250?

---

## 📸 Demo 5 — Lendo uma imagem e preenchendo um "formulário" sozinho

Esta é a demonstração mais impactante da aula — vale a pena guardá-la
para o fim. Lembra do que eu falei lá na Aula 01 sobre modelos
multimodais, com o exemplo do cliente que manda uma **foto** do produto
quebrado? Hoje você vê isso rodando de verdade.

```js
// demo5.js
import "dotenv/config";
import OpenAI from "openai";
import { readFileSync } from "fs";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const imagemBase64 = readFileSync("pedido-exemplo.png").toString("base64");

const response = await client.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [{
    role: "user",
    content: [
      { type: "text", text: "Extraia número do pedido, cliente e valor total deste documento, em JSON." },
      { type: "image_url", image_url: { url: `data:image/png;base64,${imagemBase64}` } }
    ]
  }]
});

console.log(response.choices[0].message.content);
console.log("Tokens:", response.usage);
```

```bash
node demo5.js
```

O arquivo `pedido-exemplo.png` está disponível no
[Exercício 04](<../07-exercicio-04-visao-e-extracao-de-documentos/assets/pedido-exemplo.png>)
— copie para a pasta da demonstração antes de rodar. Eu mostro isso ao
vivo com uma imagem de exemplo e, se der tempo, tiro uma foto de algum
documento real na hora (recibo, crachá, qualquer coisa com texto) para
provar que não é um caso preparado.

> 💬 **Pensa comigo:** o que esse único script substitui, se comparado a
> um formulário que o cliente teria que preencher campo por campo à mão?
> E o que pode dar errado se a foto vier tremida, cortada ou mal
> iluminada?

## 📝 O que anotar

- O tempo de resposta do `demo1.js` (sem streaming) x a sensação de
  velocidade do `demo2.js` (com streaming) — mesmo modelo, mesma
  pergunta.
- O `response.usage` da Demo 1 — quantos tokens custou aquela chamada
  específica.
- Se a resposta do `demo3.js` (function calling) veio exatamente no
  schema pedido, sem nenhum texto extra.
- O `response.usage` da Demo 5 — compare mentalmente com o da Demo 1
  (mesma pergunta, mas uma manda texto, a outra manda imagem).

**Próximo passo:** [04-exercicio-01-primeira-chamada-de-api](../04-exercicio-01-primeira-chamada-de-api/README.md)
