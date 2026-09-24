# 8. Exercício 04 — Recepção de solicitações

**Nível: 🟠 Complexo.** É o **projeto da aula.**

Este é o exercício que amarra tudo. Você vai construir a **porta de entrada**
do AI Customer Service: um endereço que recebe a solicitação de um cliente,
**organiza** os dados, gera um **número de protocolo**, e **responde** confirmando
— com o código HTTP certo. É a primeira peça real do projeto integrador. Nas
próximas aulas, ela ganha consulta a APIs (Aula 2), decisões (Aula 3) e um LLM
que entende a mensagem (Aula 4).

## 🎯 Objetivo

Construir, do zero, um workflow **Webhook → Edit Fields → Respond to Webhook**
que cumpre um contrato bem definido; testá-lo com casos normais e casos ruins; e
descobrir por que um workflow que "funciona" ainda pode estar errado.

## 📜 O contrato

Quem chamar a sua URL vai enviar isto (POST, JSON):

```json
{
  "nome": "  Maria Souza ",
  "email": "MARIA.SOUZA@Gmail.com",
  "mensagem": "  Meu pedido 4521 ainda não chegou.  ",
  "canal": "whatsapp"
}
```

O campo `canal` é **opcional**. E o seu workflow deve responder **`201 Created`**
com:

```json
{
  "protocolo": "SAC-20260923-2",
  "status": "recebida",
  "recebido_em": "2026-09-23T20:38:27.894-03:00",
  "aviso": "Recebemos sua solicitação, Maria. Guarde o protocolo."
}
```

### As regras

| # | Regra | Como você implementa |
|---|-------|----------------------|
| 1 | O `protocolo` tem o formato `SAC-AAAAMMDD-N`, onde `N` é o número da execução | `SAC-{{ $now.toFormat('yyyyLLdd') }}-{{ $execution.id }}` |
| 2 | `nome`, `email` e `mensagem` chegam **sem espaços nas pontas** | `.trim()` |
| 3 | O `email` é guardado **em minúsculas** | `.toLowerCase()` |
| 4 | Se o `canal` não vier, o valor é `formulario` | `{{ $json.body.canal \|\| 'formulario' }}` |
| 5 | Guardar o `tamanho_mensagem` (número de caracteres, depois do trim) | `.length` |
| 6 | Guardar o `recebido_em` (data e hora atuais) | `$now.toISO()` |
| 7 | O `status` inicial é sempre `recebida` | valor fixo |
| 8 | O `aviso` cumprimenta o cliente **só pelo primeiro nome** | `$json.nome.split(' ')[0]` |
| 9 | A resposta HTTP é **201**, não 200 | opção **Response Code** do Respond to Webhook |

## 📋 Passo a passo

Este exercício não tem um roteiro clique a clique — você já tem todas as peças
dos três exercícios anteriores. A ordem que eu sugiro:

1. Crie o workflow `Aula 01 - Ex 04 - Recepção de solicitações`.
2. Adicione um **Webhook**: `POST`, caminho `solicitacao`, **Respond** =
   *Using 'Respond to Webhook' Node*.
3. Adicione um **Edit Fields** chamado `Normalizar e protocolar`, com os campos
   das regras 1 a 7. **Lembre-se do `body`**: o que o cliente enviou está em
   `$json.body`.
4. Adicione um **Respond to Webhook** (`Respond With: JSON`). Monte o corpo com
   `protocolo`, `status`, `recebido_em` e `aviso` (regra 8) e, em **Options**,
   defina o **Response Code** como `201`.
5. Use a URL de **teste** para desenvolver: clique em *Listen for test event*,
   chame com `curl`, ajuste, repita.
6. Quando estiver funcionando, **publique** e teste tudo de novo pela URL de
   **produção**.

> 💡 **Dica sobre a regra 8.** Como você já está **depois** do Edit Fields, dentro
> do Respond to Webhook o `$json.nome` já é o nome **limpo** — a pegadinha do
> Exercício 02 não te pega aqui. Por quê?

## 🧪 Os testes

Guarde estes quatro `curl`. **Rode todos** na URL de produção e registre a
resposta:

**Teste 1 — o caso normal:**

```bash
curl -i -X POST http://<ip>/webhook/solicitacao \
  -H "Content-Type: application/json" \
  -d '{"nome":"  Maria Souza ","email":"MARIA.SOUZA@Gmail.com","mensagem":"  Meu pedido 4521 ainda não chegou.  ","canal":"whatsapp"}'
```

Esperado: `201 Created`, com o protocolo e o aviso *"Recebemos sua solicitação,
Maria. Guarde o protocolo."*

**Teste 2 — sem `canal`:**

```bash
curl -i -X POST http://<ip>/webhook/solicitacao \
  -H "Content-Type: application/json" \
  -d '{"nome":"Joao Pereira","email":"J@X.com","mensagem":"Quero trocar o tamanho."}'
```

Esperado: `201`. Abra a execução e confira que o `canal` gravado é `formulario`.

**Teste 3 — o protocolo muda a cada chamada:** rode o Teste 1 três vezes.
Esperado: três protocolos diferentes, com o `N` **crescendo** (`...-2`, `...-3`,
`...-4`). Cada chamada é uma execução, e `$execution.id` é o número dela.

**Teste 4 — sem o `email`:**

```bash
curl -i -X POST http://<ip>/webhook/solicitacao \
  -H "Content-Type: application/json" \
  -d '{"nome":"Maria","mensagem":"oi"}'
```

Qual é o resultado? **Preste atenção.** Se o seu workflow é igual ao meu, ele
responde:

```
HTTP/1.1 201 Created
{"protocolo":"SAC-20260923-3","status":"recebida", ... }
```

**O workflow gerou um protocolo para uma solicitação sem e-mail.** Abra a
execução, olhe o node `Normalizar e protocolar` e veja o campo `email`:
**`null`**. Nenhum erro, nenhum aviso, a execução aparece como sucesso. Se o
próximo passo do workflow fosse "enviar a confirmação por e-mail", ele tentaria
enviar para ninguém.

Isso é o que eu venho chamando de **o n8n não valida os seus dados**. Repare
que o workflow cumpre o contrato para todos os casos **certos** — e mesmo assim
está errado.

## 🚀 Desafio — barrar a entrada inválida

Adiante um pouco da Aula 3. Faça o workflow responder **`400 Bad Request`** quando
o `email` não vier (ou vier vazio), **sem gerar protocolo**.

**Dica:** o node que decide entre dois caminhos é o **If**. Coloque-o logo
depois do Webhook, com a condição *"o `email` não está vazio"* (`$json.body.email`
**is not empty**). O ramo **true** segue para o `Normalizar e protocolar`; o ramo
**false** vai para um **segundo** Respond to Webhook, com **Response Code** `400`
e o corpo `{ "erro": "O campo email é obrigatório." }`.

```
                       ┌── true ──▶ Normalizar e protocolar ──▶ Responder 201
 Webhook ──▶ [ If ] ───┤
                       └── false ─▶ Responder 400
```

**Resultado esperado**, com o novo caminho `solicitacao-validada` (copie o
workflow, ou mude o path):

| Chamada | Resposta |
|---|---|
| Com e-mail | `201 Created` + protocolo |
| **Sem** o campo `email` | `400 Bad Request` + `{"erro":"O campo email é obrigatório."}` |
| `"email": ""` (vazio) | `400 Bad Request` + `{"erro":"O campo email é obrigatório."}` |

O gabarito do desafio está em
[`assets/workflow-ex04-desafio-validacao-gabarito.json`](assets/workflow-ex04-desafio-validacao-gabarito.json).

> Gabarito do exercício principal: [`assets/workflow-ex04-gabarito.json`](assets/workflow-ex04-gabarito.json).
> Só depois de tentar.

## ✅ Checklist

- [ ] O Teste 1 devolve `201` com `protocolo`, `status`, `recebido_em` e `aviso`.
- [ ] O e-mail é guardado em minúsculas e o nome sem espaços nas pontas.
- [ ] O Teste 2 grava `canal = formulario`.
- [ ] O protocolo muda a cada chamada, com `N` crescendo.
- [ ] Você reproduziu o Teste 4 e viu o `email: null` na execução.
- [ ] O workflow está **publicado** e você testou pela URL de **produção**.
- [ ] (Desafio) O caminho com `If` responde `400` para e-mail ausente e vazio.

## 📸 O que guardar para o relatório

- Print do canvas com os três nodes (ou os cinco, se fez o desafio).
- O resultado de cada um dos quatro testes (o `curl` e a resposta).
- Print da execução do **Teste 4**, mostrando `email: null` e o status *sucesso*.
- Print da aba **Executions** com as chamadas.
- (Desafio) O resultado dos três casos da tabela.
- O JSON exportado.

## 🧪 Perguntas de reflexão

1. O `N` do protocolo vem de `$execution.id`. Isso garante que dois clientes
   **nunca** recebam o mesmo protocolo? E se você destruir a EC2 e subir outra —
   o que acontece com a numeração? O que você usaria num sistema de verdade?
2. No Teste 4, o workflow "funcionou" e mesmo assim gerou um protocolo inválido.
   Cite **três** coisas que poderiam dar errado adiante se essa solicitação
   seguisse para os próximos passos.
3. O `400` do desafio vale mais para **quem chama** ou para **quem mantém** o
   workflow? Pense no que cada um consegue fazer ao receber essa resposta.
4. Este webhook aceita chamadas de **qualquer um** que saiba a URL. Que tipo de
   abuso é possível? (Pense em quantidade, e em conteúdo.) O que você
   acrescentaria antes de colocar isso em produção de verdade?
5. Ligando com o que você fez na Disciplina 1: onde, neste workflow, você
   colocaria a **classificação por LLM** (Aula 3 de IA / Aula 4 daqui)? Entre
   quais dois nodes?

**Próximo passo:** [09-exercicio-final](../09-exercicio-final/README.md)
