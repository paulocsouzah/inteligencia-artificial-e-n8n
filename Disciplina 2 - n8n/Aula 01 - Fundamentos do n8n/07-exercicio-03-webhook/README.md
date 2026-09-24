# 7. Exercício 03 — Seu primeiro webhook

**Nível: 🟡 Médio.**

Agora o workflow deixa de ser algo que só **você** dispara. Você vai criar uma
URL na sua EC2, chamá-la de fora com `curl`, e receber uma resposta — o mesmo
mecanismo pelo qual o Stripe, o GitHub e qualquer formulário conversam com os
sistemas dos outros.

## 🎯 Objetivo

Criar um webhook que recebe uma mensagem de cliente, lê os campos do corpo da
requisição e responde com um JSON; usar a **URL de teste** para desenvolver e a
**URL de produção** para usar de verdade; e provocar, de propósito, os erros
mais comuns.

## 📋 Passo a passo

### 1. Criar o webhook

Crie um workflow `Aula 01 - Ex 03 - Meu primeiro webhook`. Adicione um node
**Webhook** e configure:

| Campo | Valor |
|---|---|
| **HTTP Method** | `POST` |
| **Path** | `atendimento` |
| **Respond** | `Using 'Respond to Webhook' Node` |

Dentro do node, confira as duas URLs (**Test URL** e **Production URL**). As
duas devem começar com `http://<seu-ip>/`. Se aparecer `localhost`, volte ao
[módulo 02](../02-ambiente-n8n-na-aws/README.md) — o `WEBHOOK_URL` não foi
aplicado.

### 2. Chamar a URL de teste

Clique em **Listen for test event**. O node fica esperando. Em **outro
terminal**:

```bash
curl -i -X POST http://<ip>/webhook-test/atendimento \
  -H "Content-Type: application/json" \
  -d '{"nome":"Maria Souza","mensagem":"Meu pedido 4521 ainda nao chegou"}'
```

Volte ao editor: o dado apareceu no node Webhook. Olhe o JSON. Os campos que
você enviou estão dentro de **`body`**, junto com `headers`, `params` e `query`.

Como ainda não existe o node de resposta, o `curl` volta com um erro cuja
mensagem diz que **não há um node Respond to Webhook no workflow** (o texto é
*"No Respond to Webhook node found in the workflow"*). Isso é esperado — a
gente vai resolver agora.

### 3. Ler o corpo da requisição

Adicione, ligado ao Webhook, um **Edit Fields** chamado `Ler o corpo`, com dois
campos (modo **Expression**):

| Campo | Expression |
|---|---|
| `nome` | `{{ $json.body.nome }}` |
| `mensagem` | `{{ $json.body.mensagem }}` |

> ⚠️ Repare no `body`. É `$json.body.nome`, **não** `$json.nome`. Esse é o
> erro número 1 de quem começa com webhooks.

### 4. Responder ao cliente

Adicione, ligado ao `Ler o corpo`, um node **Respond to Webhook**. Configure:

| Campo | Valor |
|---|---|
| **Respond With** | `JSON` |
| **Response Body** | `{{ { ok: true, recebi_de: $json.nome, tamanho_da_mensagem: $json.mensagem.length } }}` |

Clique em **Listen for test event** e repita o `curl` do passo 2. Desta vez
ele volta:

```
HTTP/1.1 200 OK
{"ok":true,"recebi_de":"Maria Souza","tamanho_da_mensagem":32}
```

### 5. Publicar e usar a URL de produção

Clique em **Publish**. Agora troque `webhook-test` por `webhook` no `curl`:

```bash
curl -i -X POST http://<ip>/webhook/atendimento \
  -H "Content-Type: application/json" \
  -d '{"nome":"Maria Souza","mensagem":"Meu pedido 4521 ainda nao chegou"}'
```

Chame **três vezes**. Depois abra a aba **Executions** e confira: as três
execuções estão lá, com os dados de cada node. No canvas, **nada** aconteceu —
é assim que a produção funciona.

### 6. Quebrar de propósito

Provoque os erros abaixo e **anote a mensagem exata** que volta em cada um:

| # | O que fazer | Resultado esperado |
|---|-------------|--------------------|
| 1 | `curl -i http://<ip>/webhook/atendimento` (GET, sem `-X POST`) | `404` — *"This webhook is not registered for GET requests. Did you mean to make a POST request?"* |
| 2 | Chamar `/webhook/atendimentoo` (um `o` a mais) | `404` — *"The requested webhook "POST atendimentoo" is not registered."* |
| 3 | Chamar `/webhook-test/atendimento` **sem** clicar em *Listen* | `404` — mensagem com a dica *"Click the 'Execute workflow' button on the canvas..."* |
| 4 | **Despublicar** e chamar `/webhook/atendimento` | `404` — *"The requested webhook "POST atendimento" is not registered."* |
| 5 | Enviar o POST **sem o campo `mensagem`** (`-d '{"nome":"Maria"}'`) | `200 OK` com o **corpo em branco** — o pior tipo de erro: não parece erro |

O erro 5 é o que eu mais quero que você repare. Olhe a execução dele na aba
**Executions**: está marcada como **sucesso**. Uma resposta vazia com `200 OK`
faz quem chamou acreditar que funcionou. O Exercício 04 mostra como evitar isso.

> Gabarito: [`assets/workflow-ex03-gabarito.json`](assets/workflow-ex03-gabarito.json)
> (importe pelo menu **⋯ → Import from file**). Só depois de tentar.

## ✅ Checklist

- [ ] As duas URLs do node Webhook começam com o **seu IP**.
- [ ] A URL de teste devolveu o dado no editor e a resposta JSON no `curl`.
- [ ] O workflow está publicado e a URL de produção respondeu 3 vezes.
- [ ] As 3 execuções aparecem na aba **Executions**.
- [ ] Você anotou a mensagem de cada um dos 5 erros.

## 📸 O que guardar para o relatório

- Print do node Webhook mostrando a Test URL e a Production URL com o seu IP.
- Print do dado chegando no editor (URL de teste), com `body` visível.
- O `curl` da produção com a resposta JSON.
- Print da aba **Executions**.
- A tabela dos 5 erros, com a mensagem real de cada um.
- O JSON exportado.

## 🧪 Perguntas de reflexão

1. O que acontece com a URL de teste depois de uma única chamada? Em que
   momento você usa cada uma das duas URLs?
2. Você chamou a URL de produção e "nada aconteceu" no canvas. Como você tem
   certeza de que o workflow rodou?
3. Os erros 2 e 4 devolvem praticamente a mesma mensagem. Se você recebesse esse
   404 de um colega, qual é a sua **lista de três coisas** para checar?
4. No erro 5, a execução aparece como **sucesso** e a resposta é `200 OK` — mas o
   cliente não recebe nada. Por que isso é mais perigoso que um erro `500`?
5. Este webhook **não tem autenticação**. Quem sabe a URL, chama. O que poderia
   dar errado se você usasse um webhook assim para **disparar um e-mail** ou
   **gravar num banco**?

**Próximo passo:** [08-exercicio-04-recepcao-de-solicitacoes](../08-exercicio-04-recepcao-de-solicitacoes/README.md)
