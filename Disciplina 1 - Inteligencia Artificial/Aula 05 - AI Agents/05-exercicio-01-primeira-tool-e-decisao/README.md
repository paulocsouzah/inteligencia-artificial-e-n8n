# 5. Exercício 01 — Primeira Tool e Decisão

**Nível: 🟢 Básico.**

Antes de montar um agente com várias ferramentas, vamos confirmar o
comportamento mais básico: com **uma única tool** disponível
(`tool_choice: "auto"`, não forçado), o modelo precisa decidir sozinho
se ela se aplica — para uma pergunta de investigação, para uma pergunta
qualquer, ou para nada.

## 🎯 Objetivo

Declarar a tool `consultar_logs` sobre os fixtures da demonstração e
testar com mensagens que precisam dela e mensagens que não precisam,
confirmando que o modelo não chama a ferramenta a torto e a direito.

## 📋 Passo a passo

1. Reaproveite `fixtures.js` da demonstração guiada. Crie
   `investigador-basico.js`:

   ```js
   import "dotenv/config";
   import OpenAI from "openai";
   import { logs } from "./fixtures.js";

   const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

   async function consultarLogs(filtro) {
     // Considera relevante um log que bate com a MAIORIA das palavras do
     // filtro (ignorando preposições) — não a frase inteira, igual a um
     // motor de busca com ranking, não um grep de frase exata.
     const stopwords = new Set(["de", "da", "do", "por", "para", "com", "um", "uma", "a", "o", "e", "no", "na"]);
     const termos = filtro.toLowerCase().split(/\s+/).filter(t => t.length > 2 && !stopwords.has(t));
     const alvo = termos.length ? termos : [filtro.toLowerCase()];
     const minimo = Math.ceil(alvo.length / 2);
     return logs.filter(l => alvo.filter(t => l.mensagem.toLowerCase().includes(t)).length >= minimo);
   }

   const tools = [{
     type: "function",
     function: {
       name: "consultar_logs",
       description: "Busca entradas de log do sistema por um filtro de texto (ex.: código de erro, nome de rota, nome de serviço)",
       parameters: { type: "object", properties: { filtro: { type: "string" } }, required: ["filtro"] }
     }
   }];

   async function perguntar(mensagem) {
     const messages = [
       { role: "system", content: "Você é um engenheiro de plantão. Use a ferramenta consultar_logs quando precisar de informação real sobre o que está acontecendo no sistema." },
       { role: "user", content: mensagem }
     ];
     const response = await client.chat.completions.create({ model: "gpt-4o-mini", messages, tools });
     const msg = response.choices[0].message;

     if (msg.tool_calls) {
       const args = JSON.parse(msg.tool_calls[0].function.arguments);
       const resultado = await consultarLogs(args.filtro);
       return { chamouTool: true, argumentos: args, resultado };
     }
     return { chamouTool: false, resposta: msg.content };
   }

   const mensagens = [
     "A rota /pedidos está devolvendo erro 500 pros clientes, o que está acontecendo?",
     "O serviço de pagamento está lento, tem algo nos logs sobre isso?",
     "Qual a diferença entre SQL e NoSQL?",
     "Bom dia! Alguma novidade no sistema hoje?",
     "Me explica o que é um índice de banco de dados."
   ];

   for (const mensagem of mensagens) {
     const resultado = await perguntar(mensagem);
     console.log(`\nMensagem: "${mensagem}"`);
     console.log(resultado);
   }
   ```

2. Rode e guarde print do resultado das cinco mensagens:

   ```bash
   node investigador-basico.js
   ```

3. Confirme, para cada mensagem, se o modelo chamou (ou não) a tool — e
   se essa decisão fazia sentido.

4. **Desafio:** adicione uma sexta mensagem **ambígua de propósito** —
   algo que soa como incidente mas não é (ex.: *"os logs da minha
   lareira registraram uma temperatura estranha ontem"*). O modelo
   tentou chamar `consultar_logs` mesmo assim? O que isso te ensina sobre
   a importância de uma `description` bem escrita?

## 📊 Comparação

| Mensagem | Chamou `consultar_logs`? | Deveria ter chamado? | Resultado/Resposta |
|---|---|---|---|
| "A rota /pedidos está devolvendo erro 500..." | | | |
| "O serviço de pagamento está lento..." | | | |
| "Qual a diferença entre SQL e NoSQL?" | | | |
| "Bom dia! Alguma novidade..." | | | |
| "Me explica o que é um índice de banco..." | | | |

## 🧪 Perguntas de reflexão

1. O modelo chamou a tool em todas as mensagens que realmente eram sobre
   o sistema em produção, e **só** nessas? Alguma decisão te surpreendeu?
2. Compare com a Aula 03: lá, você usava `tool_choice` para **forçar** a
   chamada. Aqui, o que aconteceria se você forçasse `consultar_logs` na
   mensagem "Qual a diferença entre SQL e NoSQL?"
3. As mensagens 3 e 5 são perguntas técnicas legítimas, mas **não** são
   sobre o sistema real — são conhecimento geral (o mesmo conhecimento
   paramétrico do Degrau 1, módulo 02). O modelo conseguiu diferenciar
   "pergunta sobre o MEU sistema" de "pergunta técnica genérica"?
4. Se você fez o desafio: a `description` da tool foi específica o
   suficiente para evitar a ambiguidade? Reescreva a `description` de um
   jeito que reduza essa chance de confusão.

**Próximo passo:** [06-exercicio-02-workflow-vs-agent](../06-exercicio-02-workflow-vs-agent/README.md)
