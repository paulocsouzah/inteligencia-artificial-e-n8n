# 2. Conceitos Fundamentais — A Escada

Cinco formas de resolver "por que a rota `/pedidos` está devolvendo erro
500?" com IA — da mais simples à mais autônoma. Nenhuma delas invalida a
anterior; cada uma resolve um problema que a anterior não resolvia. No
fim deste módulo, você vai ser capaz de olhar qualquer código com LLM e
dizer, com uma frase, **qual desses cinco degraus** ele implementa.

---

## 🥉 Degrau 1 — LLM simples

> Uma pergunta, um texto de resposta. O modelo não vê nada do seu
> sistema — só o que você escreveu no prompt.

```js
const resposta = await client.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [{ role: "user", content: "Por que a rota /pedidos de um e-commerce poderia devolver erro 500?" }]
});
console.log(resposta.choices[0].message.content);
```

O modelo vai listar causas **genéricas e plausíveis** ("erro de banco de
dados", "exceção não tratada", "timeout de rede") — nenhuma delas
específica ao **seu** sistema, porque ele não tem acesso a nada real.
Isso é puro conhecimento paramétrico (lembra da Aula 01?): útil para
brainstorm, inútil para diagnóstico.

## 🥈 Degrau 2 — LLM + Tool Calling (revisão da Aula 03)

> Você dá ao modelo **uma** ferramenta e força a chamada. O modelo
> preenche os argumentos; **você** decide chamar, e decide o que fazer
> com o resultado.

```js
const tools = [{
  type: "function",
  function: {
    name: "consultar_logs",
    description: "Busca entradas de log por um filtro de texto",
    parameters: { type: "object", properties: { filtro: { type: "string" } }, required: ["filtro"] }
  }
}];

const response = await client.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [{ role: "user", content: "Investigue erros na rota /pedidos" }],
  tools,
  tool_choice: { type: "function", function: { name: "consultar_logs" } }  // forçado
});

const args = JSON.parse(response.choices[0].message.tool_calls[0].function.arguments);
const logs = await consultarLogs(args.filtro);
console.log(logs); // e para por aqui — UMA chamada, decidida por você
```

Agora o modelo tem **formato garantido** de saída (a mesma garantia da
Aula 03), mas a decisão de **qual** ferramenta chamar, e **quando parar**,
continua sendo sua — o `tool_choice` forçado é você dizendo "chame essa,
já sei que preciso dela".

## 🥇 Degrau 3 — Workflow determinístico

> Uma sequência de passos **fixa, escrita por você**, que sempre executa
> na mesma ordem — a IA pode aparecer em um ou mais desses passos, mas
> não decide a ordem nem quais passos rodam.

```js
async function investigarWorkflow(rota) {
  const logs = await consultarLogs(rota);           // SEMPRE roda, nessa ordem
  const registrosBanco = await consultarBanco(rota); // SEMPRE roda, mesmo se os logs já explicaram tudo
  const trechoCodigo = await buscarCodigo(rota);      // SEMPRE roda, por último

  const resposta = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{
      role: "user",
      content: `Com base nestes dados, qual a causa provável?\n\nLogs: ${JSON.stringify(logs)}\n\nBanco: ${JSON.stringify(registrosBanco)}\n\nCódigo: ${trechoCodigo}`
    }]
  });
  return resposta.choices[0].message.content;
}
```

Repare: isso **usa** IA (a chamada final resume e conclui), mas o
**controle de fluxo** — quais fontes consultar, em que ordem — é um `if`/
sequência comum, sem nenhum raciocínio do modelo sobre isso. É rápido,
previsível, fácil de testar... e desperdiça duas chamadas inteiras
(banco e código) num caso onde os logs já explicavam tudo sozinhos. Essa
é a peça central do Exercício 02 — vocês vão medir esse desperdício com
números reais.

## 🏆 Degrau 4 — AI Agent

> Você dá ao modelo **várias** ferramentas e deixa **ele** escolher —
> `tool_choice: "auto"` — quais usar, em que ordem, repetindo até ter
> informação suficiente.

```js
const tools = [toolLogs, toolBanco, toolCodigo, toolDocumentacao]; // as 4-5 fontes

const response = await client.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [{ role: "user", content: "Investigue por que /pedidos está devolvendo 500" }],
  tools,
  tool_choice: "auto"   // o modelo decide, não você
});
```

Igual ao Degrau 2 no código, diferente no espírito: aqui existem **N**
ferramentas disponíveis e o modelo escolhe livremente. Mas uma chamada
só ainda não é um agente completo — falta o que faz o Degrau 4 valer a
pena de verdade: **repetir**.

## 🏆🏆 Degrau 5 — O Agent Loop (Reason → Act → Observe)

> O ciclo que transforma "uma decisão" em "uma investigação completa" —
> repete até o modelo ter o suficiente para responder.

```js
async function investigarComAgente(pergunta) {
  const messages = [
    { role: "system", content: "Você é um engenheiro investigando um incidente. Use as ferramentas disponíveis." },
    { role: "user", content: pergunta }
  ];

  for (let i = 0; i < 6; i++) {                 // guardrail: limite de iterações (módulo 03)
    const response = await client.chat.completions.create({ model: "gpt-4o-mini", messages, tools });
    const msg = response.choices[0].message;
    messages.push(msg);

    if (!msg.tool_calls) return msg.content;     // RESPONDE: já tem o suficiente

    for (const chamada of msg.tool_calls) {       // AGE
      const args = JSON.parse(chamada.function.arguments);
      const resultado = await executarTool(chamada.function.name, args);
      messages.push({ role: "tool", tool_call_id: chamada.id, content: JSON.stringify(resultado) }); // OBSERVA
    }
    // volta pro topo: RACIOCINA de novo, agora sabendo o que cada tool devolveu
  }
}
```

Isso é **exatamente** o loop que vocês vão implementar nos exercícios de
hoje. A diferença para o Degrau 4 é sutil no código (um `for` a mais) e
enorme na prática: o resultado de uma ferramenta pode mudar a decisão
sobre a **próxima** — "os logs mostraram um erro de tipo `undefined`,
então agora preciso ver o código daquele arquivo" — sem você ter
programado esse "então" em lugar nenhum.

---

## 📝 Resumo visual — a escada completa

| Degrau | Quem decide o que fazer? | Quantas chamadas? | Quando usar |
|---|---|---|---|
| 1. LLM simples | Ninguém decide nada — só gera texto | 1 | Brainstorm, texto criativo, nada que dependa de dado real |
| 2. LLM + Tool Calling (forçado) | Você, no código (`tool_choice` fixo) | 1 chamada de tool | Você já sabe exatamente qual dado precisa |
| 3. Workflow determinístico | Você, no código (sequência fixa) | N chamadas fixas, sempre as mesmas | O processo é sempre igual, você sabe o roteiro de cor |
| 4. AI Agent (uma rodada) | O modelo, entre as tools disponíveis | 1 rodada, mas a tool é escolhida | Você sabe as opções, não sabe qual se aplica a cada caso |
| 5. Agent Loop | O modelo, repetindo até decidir parar | Variável — depende do caso | O caminho depende do que cada passo descobre |

---

## 🧪 Exercício

Responda por escrito, sem escrever código (a prática vem nos próximos
módulos):

1. Reclassifique o `triar_mensagem` da Aula 03: ele é Degrau 2 ou Degrau
   3? E o chatbot RAG da Aula 04 (retrieval + geração, sempre nessa
   ordem) — Degrau 2, 3 ou 4? Justifique.
2. No `investigarWorkflow` (Degrau 3), o que aconteceria com o **custo**
   (tokens, chamadas de API) se você rodasse essa função 1.000 vezes por
   dia, para 1.000 incidentes diferentes, sabendo que 80% deles são só
   de código (nunca precisam do banco)?
3. Por que o Degrau 4 (uma rodada de agente) **ainda não** é suficiente
   para investigar um bug de verdade? Pensa num caso onde uma única
   ferramenta chamada não seria suficiente para concluir nada.
4. No Agent Loop, a cada iteração o array `messages` cresce (a mensagem
   do modelo + o resultado da tool são adicionados). O que aconteceria,
   depois de muitas iterações, com o **custo** de cada chamada seguinte
   dentro do mesmo loop? (Dica: pensa em quantos tokens de entrada cada
   chamada da API está processando.)

**Próximo passo:** [03-memoria-planejamento-e-guardrails](../03-memoria-planejamento-e-guardrails/README.md)
