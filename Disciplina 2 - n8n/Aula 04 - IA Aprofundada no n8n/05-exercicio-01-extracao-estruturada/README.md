# 5. Exercício 01 — Extração estruturada de uma reclamação real

**Nível: 🟢 Básico.**

## 🎯 Objetivo

Buscar uma reclamação de verdade na API da loja e extrair dela um objeto
com campos fixos: número do pedido, produto, motivo e urgência.

## 📋 Passo a passo

1. Registre, pela tela da loja (`http://<ip>:8080`), uma reclamação citando
   um pedido — ou use uma que já exista com `status=nova`.
2. Monte: **Manual Trigger** → **HTTP Request** (`GET
   /api/reclamacoes?status=nova`) → **Code** (escolha uma reclamação da
   lista, por `id` ou pelo texto) → **Code** (monta o corpo) → **HTTP
   Request** (chat da LLM) → **Code** (lê o JSON).
3. O schema da extração: `numero_pedido` (texto ou `null`), `produto`
   (texto ou `null`), `motivo` (um de `troca`, `defeito`, `atraso`,
   `outro`), `urgente` (`true`/`false`). `strict: true`,
   `additionalProperties: false`.
4. No Code que monta o corpo, **não** escreva o schema dentro de uma
   expressão `{{ }}` — o `}}` do schema fecha a expressão antes da hora.
   Monte o corpo inteiro em JavaScript e envie `={{ $json.corpo }}`.

## ✅ Checklist

- [ ] A reclamação veio de verdade da API, não foi digitada num Set node.
- [ ] Os campos extraídos batem com o texto da reclamação.
- [ ] Uma reclamação sem número de pedido no texto devolve `numero_pedido: null`.

## 📸 O que guardar para o relatório

- Print da resposta de `GET /api/reclamacoes?status=nova`.
- Print da extração, com os quatro campos preenchidos.

## 🧪 Perguntas de reflexão

1. Por que a mensagem não vem mais de um Set node, e sim de uma chamada
   HTTP? O que isso muda na forma como você testa o exercício?
2. Se duas reclamações diferentes citassem o mesmo número de pedido, como
   você descobriria isso só olhando a saída da extração?

> Gabarito do exercício (só depois de tentar): [`assets/workflow-ex01-gabarito.json`](assets/workflow-ex01-gabarito.json).

**Próximo passo:** [06-exercicio-02-classificacao-e-roteamento](../06-exercicio-02-classificacao-e-roteamento/README.md)
