# 6. Exercício 02 — Workflow x Agent, Cabeça a Cabeça

**Nível: 🟡 Médio.**

Este é o exercício mais importante da aula para fixar a diferença
conceitual do módulo 02. Você vai implementar a **mesma** investigação
de duas formas — um workflow com passos fixos, e um agente que decide —
e rodar as duas contra três incidentes diferentes, medindo o que cada
abordagem gasta e o que cada uma acerta.

## 🎯 Objetivo

Provar, com números (não só com teoria), que um workflow determinístico
desperdiça chamadas quando o caminho certo varia de caso a caso — e que
o agente se adapta a cada caso sem você reprogramar nada.

## 📋 Passo a passo

1. Reaproveite `fixtures.js`. Crie `workflow-vs-agent.js` com as três
   ferramentas de investigação:

   ```js
   import "dotenv/config";
   import OpenAI from "openai";
   import { logs, codigoFonte, bancoPedidos } from "./fixtures.js";

   const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

   async function consultarLogs(filtro) {
     // Considera relevante um log que bate com a MAIORIA das palavras do
     // filtro (ignorando preposições) — não a frase inteira.
     const stopwords = new Set(["de", "da", "do", "por", "para", "com", "um", "uma", "a", "o", "e", "no", "na"]);
     const termos = filtro.toLowerCase().split(/\s+/).filter(t => t.length > 2 && !stopwords.has(t));
     const alvo = termos.length ? termos : [filtro.toLowerCase()];
     const minimo = Math.ceil(alvo.length / 2);
     return logs.filter(l => alvo.filter(t => l.mensagem.toLowerCase().includes(t)).length >= minimo);
   }
   async function buscarCodigo(padrao) {
     // Mesma ideia: bate com a MAIORIA das palavras-chave do padrão
     // (ignorando preposições) — não a frase exata, como um grep tolerante.
     const stopwords = new Set(["de", "da", "do", "por", "para", "com", "um", "uma", "a", "o", "e", "no", "na"]);
     const termos = padrao.toLowerCase().split(/\s+/).filter(t => t.length > 2 && !stopwords.has(t));
     const alvo = termos.length ? termos : [padrao.toLowerCase()];
     const minimo = Math.ceil(alvo.length / 2);
     const achados = [];
     for (const [arquivo, conteudo] of Object.entries(codigoFonte)) {
       const c = conteudo.toLowerCase();
       if (alvo.filter(t => c.includes(t)).length >= minimo) achados.push({ arquivo, trecho: conteudo });
     }
     return achados;
   }
   async function consultarBanco(filtroStatus) {
     return bancoPedidos.filter(p => !filtroStatus || p.status === filtroStatus);
   }
   ```

2. Implemente o **workflow determinístico** — sempre as três chamadas,
   sempre nessa ordem, contando quantas foram realmente úteis:

   ```js
   async function investigarWorkflow(descricaoIncidente) {
     const chamadas = [];

     chamadas.push("consultar_logs");
     const resultLogs = await consultarLogs("erro");

     chamadas.push("buscar_codigo");
     const resultCodigo = await buscarCodigo("cliente");

     chamadas.push("consultar_banco");
     const resultBanco = await consultarBanco();

     const resposta = await client.chat.completions.create({
       model: "gpt-4o-mini",
       messages: [{
         role: "user",
         content: `Incidente: ${descricaoIncidente}\n\nLogs: ${JSON.stringify(resultLogs)}\n\nCódigo: ${JSON.stringify(resultCodigo)}\n\nBanco: ${JSON.stringify(resultBanco)}\n\nQual a causa raiz provável?`
       }]
     });

     return { chamadas, resposta: resposta.choices[0].message.content };
   }
   ```

3. Implemente o **agente** — mesmas três tools, `tool_choice: "auto"`,
   contando quantas ele realmente decidiu chamar:

   ```js
   const tools = [
     { type: "function", function: { name: "consultar_logs", description: "Busca logs por filtro de texto", parameters: { type: "object", properties: { filtro: { type: "string" } }, required: ["filtro"] } } },
     { type: "function", function: { name: "buscar_codigo", description: "Busca um padrão de texto no código-fonte", parameters: { type: "object", properties: { padrao: { type: "string" } }, required: ["padrao"] } } },
     { type: "function", function: { name: "consultar_banco", description: "Lista pedidos no banco, opcionalmente filtrando por status", parameters: { type: "object", properties: { filtroStatus: { type: "string" } } } } }
   ];

   async function investigarAgente(descricaoIncidente) {
     const messages = [
       { role: "system", content: "Você é um engenheiro investigando um incidente. Use só as ferramentas que realmente precisar." },
       { role: "user", content: descricaoIncidente }
     ];
     const chamadas = [];

     for (let i = 0; i < 5; i++) {
       const response = await client.chat.completions.create({ model: "gpt-4o-mini", messages, tools });
       const msg = response.choices[0].message;
       messages.push(msg);
       if (!msg.tool_calls) return { chamadas, resposta: msg.content };

       for (const chamada of msg.tool_calls) {
         chamadas.push(chamada.function.name);
         const args = JSON.parse(chamada.function.arguments);
         let resultado;
         if (chamada.function.name === "consultar_logs") resultado = await consultarLogs(args.filtro);
         if (chamada.function.name === "buscar_codigo") resultado = await buscarCodigo(args.padrao);
         if (chamada.function.name === "consultar_banco") resultado = await consultarBanco(args.filtroStatus);
         messages.push({ role: "tool", tool_call_id: chamada.id, content: JSON.stringify(resultado) });
       }
     }
   }
   ```

4. Rode as duas abordagens contra os três incidentes abaixo — escolhidos
   de propósito, cada um precisando de uma combinação diferente de
   fontes:

   ```js
   const incidentes = [
     "Encontre um problema de segurança no código de busca de pedidos por cliente.",           // só precisa de código
     "Por que a rota /pedidos está devolvendo erro 500 de forma intermitente?",                // precisa de logs + código
     "Existem pedidos com dados inconsistentes no banco? Quais e por quê?"                     // só precisa do banco
   ];

   for (const incidente of incidentes) {
     console.log(`\n\n========== ${incidente} ==========`);

     const w = await investigarWorkflow(incidente);
     console.log("\n[WORKFLOW] chamadas:", w.chamadas.join(", "));
     console.log("[WORKFLOW] resposta:", w.resposta);

     const a = await investigarAgente(incidente);
     console.log("\n[AGENTE] chamadas:", a.chamadas.join(", ") || "nenhuma");
     console.log("[AGENTE] resposta:", a.resposta);
   }
   ```

   ```bash
   node workflow-vs-agent.js
   ```

5. Para cada incidente, conte quantas chamadas o workflow fez **sem
   precisar** (fontes que não tinham nada a ver com aquele caso) e
   compare com o que o agente decidiu chamar.

## 📊 Comparação

| Incidente | Chamadas do Workflow | Chamadas "desperdiçadas" pelo Workflow | Chamadas do Agente | O agente foi mais eficiente? |
|---|---|---|---|---|
| Problema de segurança no código | 3 (sempre) | | | |
| Erro 500 intermitente | 3 (sempre) | | | |
| Inconsistência no banco | 3 (sempre) | | | |

## 🧪 Perguntas de reflexão

1. No incidente de segurança (só precisa de código), quantas chamadas o
   workflow desperdiçou? E o agente — ele percebeu que `consultar_logs`
   e `consultar_banco` não ajudavam nesse caso?
2. No incidente do banco (inconsistência de dados), o workflow **ainda
   assim** chegou à resposta certa, só que com mais chamadas do que
   precisava. Isso é um problema pequeno ou grande, se multiplicado por
   1.000 incidentes por mês? Pensa em custo de tokens.
3. Existe algum incidente, entre os três, onde o workflow e o agente
   fizeram **exatamente** as mesmas chamadas? Isso significa que o
   workflow "estava certo" para aquele caso específico — mas ele saberia
   disso **de antemão**, sem você ter rodado o experimento?
4. Pensa num quarto incidente hipotético que precisasse das **três**
   fontes, na ordem certa. Nesse caso, o workflow fixo teria alguma
   vantagem sobre o agente? Qual?
5. Com base neste experimento, complete a frase: "Um workflow
   determinístico vale mais a pena que um agente quando ___________."

**Próximo passo:** [07-exercicio-03-multiplas-tools-e-loop](../07-exercicio-03-multiplas-tools-e-loop/README.md)
