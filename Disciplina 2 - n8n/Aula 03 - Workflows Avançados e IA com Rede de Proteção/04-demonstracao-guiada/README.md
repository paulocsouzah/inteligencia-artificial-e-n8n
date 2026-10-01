# 4. Demonstração guiada

Hoje eu construo em **oito atos**: começo trocando um `If` por `Switch`,
passo por `Merge` e `Loop Over Items`, e termino quebrando uma chamada de
IA de três jeitos diferentes, na sua frente, para você ver a blindagem
seguindo cada um até o Error Workflow.

---

## 🎬 Ato 1 — De `If` encadeado para `Switch`

Eu pego um workflow com dois `If` encadeados (`categoria == 'logistica'`
→ ..., senão `categoria == 'financeiro'` → ..., senão → elogio) e
substituo pelos dois por **um** `Switch`, com quatro saídas nomeadas
(`logistica`, `financeiro`, `elogio`, `default`).

**O que observar:** o canvas fica mais raso (menos aninhamento) e mais
fácil de ler de cima para baixo. Eu testo mandando um item com
`categoria: "duvida"` — que não bate em nenhuma regra — e mostro que ele
sai pela saída **default**. Se eu não tivesse ligado nada nessa saída, o
item simplesmente sumiria, sem erro nenhum.

## 🎬 Ato 2 — `Merge` nos três modos

Crio dois ramos: um busca dados de um "cliente" (nome, e-mail), outro
busca o "histórico de pedidos" dele (por `cliente_id`). Ligo um `Merge`
em modo **Combine (by Matching Fields)**, casando pelo campo `id`.

Depois eu troco para **Append** e executo de novo.

**O que observar:** com Combine, a saída tem **um item por cliente**, com
os dois conjuntos de campos juntos. Com Append, a saída tem **o dobro de
itens** — os dois conjuntos empilhados, sem juntar nada. É o mesmo par de
entradas, resultado completamente diferente.

## 🎬 Ato 3 — `Loop Over Items` processando um lote

Gero, com um `Code`, uma lista de **12 "e-mails"** fictícios. Ligo num
`Loop Over Items` com tamanho de lote **3**, e dentro do loop coloco um
`Wait` de 1 segundo antes de seguir para o próximo lote.

**O que observar:** na aba Executions, dá para ver o workflow passando
**4 vezes** pelo mesmo trecho (12 itens ÷ 3 por lote), com a pausa entre
cada passagem. Pergunto: se isso fosse uma chamada de API com limite de
5 por segundo, o que aconteceria **sem** o `Loop Over Items` — os 12 de
uma vez?

## 🎬 Ato 4 — Retry On Fail, ao vivo

Uso um `HTTP Request` apontando para `https://httpbin.org/status/503` —
um endpoint de teste que **sempre** devolve `503`, de propósito — e
configuro **Retry On Fail: 3 tentativas, 1000ms de intervalo**.

**O que observar:** a execução mostra as três tentativas acontecendo
(visível no detalhe do node, com o número da tentativa) — e, como esse
mock **sempre** falha, as três dão errado mesmo. Eu deixo isso claro: na
vida real, um `503` costuma ser passageiro, e a segunda ou terceira
tentativa **resolve sozinha** — aqui eu uso um endpoint "sempre quebrado"
só para você ver o mecanismo de retry disparando, não para fingir que ele
conserta tudo.

Troco a URL para `https://httpbin.org/status/401` — um erro que não é
passageiro — e pergunto: faz sentido configurar retry aqui? (Resposta:
não — três tentativas de um 401 só atrasam em 3 segundos a certeza de que
a chave está errada.)

## 🎬 Ato 5 — Timeout, e o preço de esperar demais

Aponto o `HTTP Request` para `https://httpbin.org/delay/15` (um endpoint
que demora 15 segundos de propósito antes de responder) e configuro
**Timeout: 5000ms** nas Options do node.

**O que observar:** o node falha em 5 segundos, não em 15 — com uma
mensagem clara de timeout. Sem essa configuração, o workflow ficaria
**preso** esperando, e se isso acontecesse com 50 execuções simultâneas
(50 e-mails chegando ao mesmo tempo), seriam 50 execuções paradas,
segurando recursos, por 15 segundos cada.

## 🎬 Ato 6 — Validando a saída da IA, e pegando o JSON quebrado

Chamo a LLM pedindo a classificação de sempre, mas desta vez **sem**
`response_format` e com um prompt mal escrito de propósito ("responda em
JSON, mas pode comentar antes se quiser"). A IA devolve algo como:

```
Claro! Aqui está a análise:
{"categoria": "troca", "sentimento": "negativo"
```

— texto antes do JSON, **e** o JSON cortado, sem o `}` final.

Adiciono um node **Code** logo depois:

```javascript
let dados;
try {
  const match = $input.item.json.content.match(/\{[\s\S]*\}/);
  dados = JSON.parse(match[0]);
  if (!dados.categoria || !dados.sentimento) throw new Error('campo faltando');
} catch (e) {
  return { json: { erro: true, motivo: e.message, precisa_humano: true } };
}
return { json: { ...dados, precisa_humano: false } };
```

**O que observar:** em vez do workflow **quebrar**, ele captura o erro de
parsing (`e.message`) e marca o item como `precisa_humano: true`. O
cliente não recebe uma resposta errada — e também não é ignorado.

## 🎬 Ato 7 — O Error Workflow pegando o que sobrou

Crio um segundo workflow, só com um **Error Trigger** → **Edit Fields**
(monta uma mensagem) → `Respond`/log simples (na aula real, isso seria um
Slack ou e-mail para o time; hoje eu só registro). **Publico esse
workflow.**

Nas **Settings** de um terceiro workflow (que começa com um **Webhook**,
não um Manual Trigger — já explico por quê), defino **Error Workflow** =
o workflow que acabei de publicar. Daí eu **removo de propósito** o Retry
On Fail de um node e aponto ele para uma URL que não existe
(`https://api.naoexiste123.com`). Publico este workflow também.

Chamo o **webhook de produção** com `curl`. O node falha, o workflow
principal para — e, segundos depois, a aba Executions do **workflow de
erro** mostra uma execução nova, disparada sozinha, com os dados de qual
workflow falhou e em qual node.

**Duas armadilhas que eu quero que você veja agora, porque eu mesmo caí
nelas montando esta aula:**

1. **O Error Workflow precisa estar publicado.** Enquanto ele não estiver
   "Published" (igual a um Webhook), o n8n não dispara nada para ele —
   mesmo com a referência certa nas Settings do outro workflow.
2. **Falha de execução manual não dispara o Error Workflow.** Se eu
   clicasse em *Execute workflow* no editor (em vez de chamar o webhook de
   fora), o node falharia do mesmo jeito, mas o Error Workflow **não**
   seria chamado. Ele só reage a falhas de execuções **de produção**
   (webhook, Schedule Trigger, Gmail Trigger...) — exatamente o tipo de
   falha que acontece sem ninguém olhando, que é o problema que ele
   resolve.

**O que observar:** eu **não** fiz nada manualmente para disparar isso —
mas só depois de acertar as duas armadilhas acima. É esse o ponto do
Error Workflow: ele pega o que você **não** blindou explicitamente, **em
produção**.

## 🎬 Ato 8 — Extraindo a chamada de IA para um Sub-workflow

Pego o bloco "Chamar LLM → Validar saída" (Atos 4 a 6, já blindado) e
**corto** ele para um workflow novo, trocando o início por um **Execute
Workflow Trigger**. No workflow original, no lugar onde esse bloco
estava, coloco um node **Execute Workflow**, apontando para esse novo.

**O que observar:** executo o workflow principal de novo, e o resultado é
**idêntico** a antes — só que agora, se eu quiser melhorar a validação,
mexo em **um** lugar, e qualquer outro workflow que use esse
sub-workflow ganha a melhoria junto.

## 🧾 O que eu quero que você leve daqui

| O que vimos | A frase para guardar |
|---|---|
| Switch | Três ou mais caminhos, chega de encadear `If` |
| Merge | O modo muda o resultado — Combine ≠ Append |
| Loop Over Items | Processa em lotes: protege memória e rate limit |
| Retry On Fail | Só para erro **passageiro** — não conserta um 401 |
| Timeout | Sem ele, uma API lenta trava recursos por tempo indefinido |
| Validar saída da IA | JSON quebrado não devia derrubar o workflow — devia virar "precisa humano" |
| Error Workflow | Pega o que você **não** previu — a rede para o desconhecido |
| Sub-workflow | Lógica repetida mora **num** lugar só |

## 🧪 Exercício

Reproduza os Atos 4, 5 e 6 no seu n8n, com endpoints/prompts diferentes
dos meus (use `httpbin.org` com outros códigos, por exemplo
`https://httpbin.org/status/429` e `https://httpbin.org/status/500`).
Registre:

1. Print do Retry On Fail funcionando (as tentativas visíveis).
2. Print do Timeout interrompendo uma chamada lenta.
3. O JSON quebrado que você provocou, e o resultado do seu node de
   validação.

**Próximo passo:** [05-exercicio-01-if-para-switch](../05-exercicio-01-if-para-switch/README.md)
