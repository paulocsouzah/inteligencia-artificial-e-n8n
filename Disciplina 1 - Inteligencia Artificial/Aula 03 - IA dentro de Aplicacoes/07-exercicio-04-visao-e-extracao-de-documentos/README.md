# 7. Exercício 04 — Visão Computacional: Ler um Documento e Extrair Dados

**Nível: 🔴 Avançado (o mais completo da aula).**

Este é o exercício mais impactante do módulo até aqui. Lembra da Aula 01,
quando eu falei sobre modelos **multimodais** — que um cliente pode
mandar uma **foto** do produto junto com a reclamação, e só um modelo que
enxerga imagem consegue atender isso de ponta a ponta? Hoje você constrói
exatamente essa peça: um script que **lê um documento** (imagem ou PDF) e
devolve os dados extraídos, já estruturados — como se estivesse
preenchendo um formulário sozinho.

## 🎯 Objetivo

Combinar tudo que você já aprendeu nesta aula — chamada de API,
tokens/custo, function calling — com **entrada multimodal** (imagem e
PDF), e comparar o custo e a precisão dos dois caminhos.

## 🌍 O cenário

Retomando o cenário integrador: um cliente manda uma mensagem pedindo
reembolso e anexa uma **foto (ou PDF) da confirmação do pedido**, em vez
de digitar o número do pedido, o valor e a data manualmente. Hoje seu
código vai ler esse anexo e extrair os dados sozinho — a mesma tarefa que,
em um produto real, elimina um formulário inteiro que o cliente teria que
preencher à mão.

## 📎 O documento de teste

Já deixei prontos, na pasta [`assets/`](assets/), dois arquivos com os
**mesmos dados**, em formatos diferentes:

- [`pedido-exemplo.png`](assets/pedido-exemplo.png) — uma "captura de tela"
  de uma confirmação de pedido (simulando uma foto que o cliente tiraria).
- [`pedido-exemplo.pdf`](assets/pedido-exemplo.pdf) — o mesmo pedido, em PDF.

Você pode usar esses arquivos direto, ou substituir por uma nota
fiscal/comprovante real seu (desde que não tenha dado sensível que você
não queira mandar para uma API externa — mais sobre isso na seção de
segurança do módulo de conceitos).

## 📋 Passo a passo

### Parte A — Extração a partir de imagem

1. No mesmo projeto das aulas anteriores, crie `visao-imagem.js`:

   ```js
   import "dotenv/config";
   import OpenAI from "openai";
   import { readFileSync } from "fs";

   const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

   const imagemBase64 = readFileSync("pedido-exemplo.png").toString("base64");

   const ferramentaExtracao = {
     type: "function",
     function: {
       name: "extrair_dados_pedido",
       description: "Extrai os dados de um pedido a partir da imagem de uma confirmação de pedido",
       parameters: {
         type: "object",
         properties: {
           numero_pedido: { type: "string" },
           cliente: { type: "string" },
           data_pedido: { type: "string" },
           produto: { type: "string" },
           quantidade: { type: "number" },
           valor_unitario: { type: "string" },
           valor_total: { type: "string" },
           forma_pagamento: { type: "string" },
           endereco_entrega: { type: "string" }
         },
         required: ["numero_pedido", "cliente", "valor_total"]
       }
     }
   };

   const response = await client.chat.completions.create({
     model: "gpt-4o-mini",
     messages: [
       {
         role: "user",
         content: [
           { type: "text", text: "Extraia os dados deste pedido." },
           { type: "image_url", image_url: { url: `data:image/png;base64,${imagemBase64}` } }
         ]
       }
     ],
     tools: [ferramentaExtracao],
     tool_choice: { type: "function", function: { name: "extrair_dados_pedido" } }
   });

   const chamada = response.choices[0].message.tool_calls[0];
   const dados = JSON.parse(chamada.function.arguments);
   console.log("--- Dados extraídos da IMAGEM ---");
   console.log(dados);
   console.log("\nTokens usados:", response.usage);
   ```

2. Copie `assets/pedido-exemplo.png` para dentro do seu projeto e rode:

   ```bash
   node visao-imagem.js
   ```

3. Confira: os 9 campos vieram preenchidos corretamente, comparando com o
   que está escrito na imagem?

### Parte B — Extração a partir de PDF

4. Crie `visao-pdf.js` — é quase idêntico, só muda **como o arquivo é
   enviado** (em vez de `image_url`, um content part do tipo `file`):

   ```js
   import "dotenv/config";
   import OpenAI from "openai";
   import { readFileSync } from "fs";

   const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

   const pdfBase64 = readFileSync("pedido-exemplo.pdf").toString("base64");

   const ferramentaExtracao = {
     type: "function",
     function: {
       name: "extrair_dados_pedido",
       description: "Extrai os dados de um pedido a partir do PDF de uma confirmação de pedido",
       parameters: {
         type: "object",
         properties: {
           numero_pedido: { type: "string" },
           cliente: { type: "string" },
           data_pedido: { type: "string" },
           produto: { type: "string" },
           quantidade: { type: "number" },
           valor_unitario: { type: "string" },
           valor_total: { type: "string" },
           forma_pagamento: { type: "string" },
           endereco_entrega: { type: "string" }
         },
         required: ["numero_pedido", "cliente", "valor_total"]
       }
     }
   };

   const response = await client.chat.completions.create({
     model: "gpt-4o-mini",
     messages: [
       {
         role: "user",
         content: [
           { type: "text", text: "Extraia os dados deste pedido." },
           { type: "file", file: { filename: "pedido-exemplo.pdf", file_data: `data:application/pdf;base64,${pdfBase64}` } }
         ]
       }
     ],
     tools: [ferramentaExtracao],
     tool_choice: { type: "function", function: { name: "extrair_dados_pedido" } }
   });

   const chamada = response.choices[0].message.tool_calls[0];
   const dados = JSON.parse(chamada.function.arguments);
   console.log("--- Dados extraídos do PDF ---");
   console.log(dados);
   console.log("\nTokens usados:", response.usage);
   ```

5. Copie `assets/pedido-exemplo.pdf` para dentro do seu projeto e rode:

   ```bash
   node visao-pdf.js
   ```

6. Compare o `response.usage` dos dois scripts — **imagem x PDF, mesmo
   documento, mesmos dados**.

### Parte C — Desafio

7. **🚀 Desafio:** troque o `pedido-exemplo.png` por uma foto real (tirada
   com celular, de qualquer documento com texto — um comprovante, um
   recibo, até uma etiqueta de produto) e ajuste o schema da função para
   os campos que fizerem sentido. Rode e veja se a extração continua
   precisa numa imagem "do mundo real" (não uma captura de tela limpa
   como a de exemplo).

## 📊 Comparação

| | Imagem (PNG) | PDF |
|---|---|---|
| Todos os 9 campos vieram corretos? | | |
| `prompt_tokens` | | |
| Custo estimado da chamada | | |
| Tempo de resposta (perceptível) | | |

## 🧪 Perguntas de reflexão

1. Os dois caminhos (imagem e PDF) extraíram os mesmos dados? Algum campo
   veio formatado de forma diferente entre um e outro (ex.: com ou sem o
   `#` no número do pedido)?
2. Compare o `prompt_tokens` dos dois testes. Qual foi mais caro? Por que
   você acha que enviar uma **imagem** consome tantos tokens a mais do
   que enviar um **PDF** com o mesmo conteúdo?
3. Pensando no cenário do módulo: se sua empresa recebe todo dia fotos
   E PDFs de comprovantes de clientes, essa diferença de custo muda
   alguma decisão de produto (ex.: pedir para o cliente preferencialmente
   anexar PDF, quando possível)?
4. No desafio, com uma foto "do mundo real": a extração continuou 100%
   correta, ou algum campo saiu errado/vazio? O que isso te diz sobre
   confiar cegamente nesse tipo de extração em produção, sem nenhuma
   revisão?
5. Esse tipo de extração lida com dado potencialmente sensível (nome,
   endereço, valor pago). Volte ao módulo de conceitos, seção de
   Segurança — o que muda na sua análise de risco quando o "dado do
   usuário" enviado à API não é mais só texto, mas um documento inteiro?

**Próximo passo:** [08-exercicio-final](../08-exercicio-final/README.md)
