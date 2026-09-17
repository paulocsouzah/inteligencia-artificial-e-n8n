# 7. Exercício 03 — Múltiplas Tools e Agent Loop

**Nível: 🟡 Médio.**

No exercício anterior, você mediu a diferença entre workflow e agente.
Agora o foco muda para o **mecanismo** do loop em si: com quatro
ferramentas disponíveis — as três do exercício passado mais
`consultar_documentacao` (a RAG da Aula 04, de volta) — o agente precisa
**encadear** chamadas, usando o resultado de uma para decidir a
próxima.

## 🎯 Objetivo

Implementar o loop completo (Reason → Act → Observe) com quatro tools, e
confirmar que o agente consegue resolver uma investigação que
**depende** de mais de uma fonte em sequência — não só "várias fontes
soltas".

## 📋 Passo a passo

1. Reaproveite `fixtures.js` e as três funções de tool do Exercício 02.
   Adicione `consultar_documentacao` (RAG sobre o runbook, igual à Demo
   3 da demonstração guiada):

   ```js
   import "dotenv/config";
   import OpenAI from "openai";
   import { logs, codigoFonte, bancoPedidos, documentacao } from "./fixtures.js";

   const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

   function similaridadeCosseno(a, b) {
     let p = 0, na = 0, nb = 0;
     for (let i = 0; i < a.length; i++) { p += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i]; }
     return p / (Math.sqrt(na) * Math.sqrt(nb));
   }
   async function embed(texto) {
     const r = await client.embeddings.create({ model: "text-embedding-3-small", input: texto });
     return r.data[0].embedding;
   }
   const chunksDoc = documentacao.split(/\n\n/).filter(Boolean);
   const baseDoc = [];
   for (const chunk of chunksDoc) baseDoc.push({ texto: chunk, embedding: await embed(chunk) });

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
   async function consultarBanco(filtroStatus) { return bancoPedidos.filter(p => !filtroStatus || p.status === filtroStatus); }
   async function consultarDocumentacao(pergunta) {
     const e = await embed(pergunta);
     baseDoc.sort((a, b) => similaridadeCosseno(e, b.embedding) - similaridadeCosseno(e, a.embedding));
     return { trecho: baseDoc[0].texto };
   }
   ```

2. Declare as quatro tools e o loop completo, contando iterações:

   ```js
   const tools = [
     { type: "function", function: { name: "consultar_logs", description: "Busca logs por filtro de texto", parameters: { type: "object", properties: { filtro: { type: "string" } }, required: ["filtro"] } } },
     { type: "function", function: { name: "buscar_codigo", description: "Busca um padrão de texto no código-fonte", parameters: { type: "object", properties: { padrao: { type: "string" } }, required: ["padrao"] } } },
     { type: "function", function: { name: "consultar_banco", description: "Lista pedidos no banco, opcionalmente filtrando por status", parameters: { type: "object", properties: { filtroStatus: { type: "string" } } } } },
     { type: "function", function: { name: "consultar_documentacao", description: "Busca no runbook/documentação de arquitetura do sistema", parameters: { type: "object", properties: { pergunta: { type: "string" } }, required: ["pergunta"] } } }
   ];

   async function executarTool(nome, args) {
     if (nome === "consultar_logs") return consultarLogs(args.filtro);
     if (nome === "buscar_codigo") return buscarCodigo(args.padrao);
     if (nome === "consultar_banco") return consultarBanco(args.filtroStatus);
     if (nome === "consultar_documentacao") return consultarDocumentacao(args.pergunta);
   }

   async function investigar(pergunta) {
     const messages = [
       { role: "system", content: "Você é um engenheiro investigando um incidente. Use as ferramentas até ter uma causa raiz e uma recomendação, baseada no runbook quando existir uma." },
       { role: "user", content: pergunta }
     ];
     const toolsChamadas = [];

     for (let i = 0; i < 6; i++) {
       const response = await client.chat.completions.create({ model: "gpt-4o-mini", messages, tools });
       const msg = response.choices[0].message;
       messages.push(msg);
       if (!msg.tool_calls) return { resposta: msg.content, toolsChamadas, iteracoes: i };

       for (const chamada of msg.tool_calls) {
         toolsChamadas.push(chamada.function.name);
         const args = JSON.parse(chamada.function.arguments);
         const resultado = await executarTool(chamada.function.name, args);
         messages.push({ role: "tool", tool_call_id: chamada.id, content: JSON.stringify(resultado) });
       }
     }
     throw new Error("Limite de iterações excedido.");
   }
   ```

3. Teste com três perguntas que exigem **encadeamento** — o resultado de
   uma tool afeta a decisão sobre a próxima:

   ```js
   const perguntas = [
     "A rota /pedidos está devolvendo 500. Ache a causa no código e diga se o runbook já documenta esse tipo de problema.",
     "O serviço de pagamento está lento. Confirme nos logs, ache o trecho de código responsável, e explique se é um padrão conhecido segundo a documentação.",
     "Existe algum pedido no banco cujo status é 'Cancelado' mas o total não é zero nem negativo de forma consistente? Investigue e explique."
   ];

   for (const pergunta of perguntas) {
     const resultado = await investigar(pergunta);
     console.log(`\nPergunta: "${pergunta}"`);
     console.log("Tools chamadas (em ordem):", resultado.toolsChamadas.join(", "));
     console.log("Iterações:", resultado.iteracoes + 1);
     console.log("Resposta:", resultado.resposta);
   }
   ```

   ```bash
   node investigador-loop.js
   ```

4. **Desafio:** adicione um `console.log(messages.length)` dentro do
   `for`, e rode a primeira pergunta de novo. Observe como o histórico
   cresce a cada iteração — e o que isso significa para o custo de
   tokens de uma investigação longa (ligação direta com o Exercício de
   reflexão do módulo 02).

## 📊 Comparação

| Pergunta | Tools chamadas (em ordem) | Iterações | A resposta citou o runbook quando fazia sentido? |
|---|---|---|---|
| Erro 500 + runbook | | | |
| Lentidão no pagamento + runbook | | | |
| Inconsistência específica no banco | | | |

## 🧪 Perguntas de reflexão

1. Na primeira pergunta, o agente consultou `buscar_codigo` **antes** ou
   **depois** de `consultar_documentacao`? Faz sentido nos dois casos, ou
   uma ordem é claramente melhor?
2. Compare com o Exercício 02: lá, cada incidente precisava de fontes
   **diferentes**, mas raramente encadeadas. Aqui, as perguntas pedem
   explicitamente para **combinar** achados ("ache X **e** diga se Y").
   Isso mudou o número de iterações, comparado ao exercício anterior?
3. Na terceira pergunta (inconsistência específica), o agente conseguiu
   aplicar um filtro além do que a tool `consultar_banco` oferece
   diretamente (ela só filtra por `status`, não por "total inconsistente
   com o status")? Como ele resolveu isso?
4. Pensando no guardrail de limite de iterações (módulo 03): nenhuma das
   três perguntas chegou perto do limite de 6. Reescreva uma das
   perguntas de um jeito que você imagina que chegaria mais perto desse
   limite — sem ser um caso "impossível" de propósito.

**Próximo passo:** [08-exercicio-04-ai-software-engineer-completo](../08-exercicio-04-ai-software-engineer-completo/README.md)
