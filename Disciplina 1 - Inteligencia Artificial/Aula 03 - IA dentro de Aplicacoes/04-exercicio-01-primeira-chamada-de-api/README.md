# 4. Exercício 01 — Primeira Chamada de API

**Nível: 🟢 Básico.**

Agora é sua vez. Vamos configurar o projeto do zero e escrever seu
primeiro script que chama um LLM via código, sem passar por nenhuma
interface de chat.

## 🎯 Objetivo

Sair do zero absoluto — projeto configurado, API key protegida, primeira
chamada funcionando — e entender o que compõe o custo de uma chamada de
API.

## 🧰 O que você precisa

- Node.js instalado.
- Uma conta e API key criada em **um** destes provedores (o mesmo padrão
  de "pelo menos um serviço" das aulas anteriores, mas agora com conta de
  API, não só de chat):
  - [OpenAI Platform](https://platform.openai.com/) (`openai`)
  - [Anthropic Console](https://console.anthropic.com/) (`@anthropic-ai/sdk`)
  - [Google AI Studio](https://aistudio.google.com/) (`@google/genai`)

Os passos abaixo usam a OpenAI como exemplo — se você escolheu outro
provedor, a lógica é a mesma, só muda o nome do pacote e o formato exato
da resposta (consulte a documentação oficial do SDK escolhido).

## 📋 Passo a passo

1. Crie a pasta do projeto e inicialize:

   ```bash
   mkdir aula03-exercicio01 && cd aula03-exercicio01
   npm init -y
   npm pkg set type=module
   npm install openai dotenv
   ```

   O `npm pkg set type=module` permite usar `import`/`await` no estilo
   dos exemplos desta aula (sem isso, o Node não reconhece a sintaxe).

2. Crie o arquivo `.env` com sua key:

   ```
   OPENAI_API_KEY=sua-key-aqui
   ```

3. Crie o `.gitignore`:

   ```
   node_modules/
   .env
   ```

4. Crie `index.js`:

   ```js
   import "dotenv/config";
   import OpenAI from "openai";

   const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

   const prompt = "Escreva uma frase de boas-vindas para um cliente novo de um e-commerce.";

   const response = await client.chat.completions.create({
     model: "gpt-4o-mini",
     messages: [{ role: "user", content: prompt }]
   });

   const resposta = response.choices[0].message.content;
   const uso = response.usage;

   console.log("--- Resposta ---");
   console.log(resposta);
   console.log("\n--- Uso de tokens ---");
   console.log(uso);
   ```

5. Rode e guarde print do resultado:

   ```bash
   node index.js
   ```

6. No painel do seu provedor, encontre o **preço por milhão de tokens**
   (entrada e saída) do modelo que você usou, e calcule o custo dessa
   chamada específica, usando a fórmula do módulo de conceitos.

7. **Desafio:** rode o mesmo `index.js` trocando o `prompt` para algo bem
   mais longo (ex.: peça um texto de 5 parágrafos) e compare o
   `usage.completion_tokens` e o custo entre as duas execuções.

## 📊 Comparação

| | Prompt curto | Prompt do desafio (mais longo) |
|---|---|---|
| `prompt_tokens` | | |
| `completion_tokens` | | |
| Custo estimado da chamada | | |

## 🧪 Perguntas de reflexão

1. Qual foi o preço por milhão de tokens (entrada e saída) do modelo que
   você usou? Onde você encontrou essa informação?
2. No desafio: o custo cresceu proporcionalmente ao tamanho do texto
   pedido, ou teve alguma surpresa (ex.: `prompt_tokens` quase não mudou,
   `completion_tokens` mudou muito)? Isso faz sentido, considerando o que
   cada um mede?
3. Se essa chamada rodasse 10.000 vezes por dia (o volume do cenário da
   Aula 01), qual seria o custo mensal aproximado? Vale a pena para uma
   empresa, comparado a um atendente humano fazendo a mesma tarefa?
4. O que teria acontecido se você tivesse esquecido de colocar `.env` no
   `.gitignore` e desse um `git push` deste projeto para um repositório
   público?

**Próximo passo:** [05-exercicio-02-streaming](../05-exercicio-02-streaming/README.md)
