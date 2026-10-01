# 6. Exercício 02 — `Merge` e `Loop Over Items`

**Nível: 🟡 Médio.**

Duas partes independentes: juntar dados de fontes diferentes com
`Merge`, e processar uma lista grande em lotes com `Loop Over Items`.

## 📋 Parte A — `Merge`

1. Novo workflow. Num node **Code**, gere 3 "clientes":
   ```javascript
   return [
     { json: { id: 1, nome: "Maria Souza" } },
     { json: { id: 2, nome: "João Pereira" } },
     { json: { id: 3, nome: "Ana Lima" } },
   ];
   ```
2. Em outro **Code** (ramo separado, mesmo trigger), gere 3 "pedidos":
   ```javascript
   return [
     { json: { cliente_id: 2, pedido: "Tênis", status: "entregue" } },
     { json: { cliente_id: 1, pedido: "Camiseta", status: "atrasado" } },
     { json: { cliente_id: 3, pedido: "Boné", status: "a caminho" } },
   ];
   ```
3. Ligue os dois num **Merge**, modo **Combine → Matching Fields**,
   casando `id` (da primeira entrada) com `cliente_id` (da segunda).
4. Execute. Confira: cada item de saída tem o **nome** do cliente e os
   dados do **pedido** dele — mesmo os clientes tendo chegado em ordens
   diferentes nas duas listas.
5. Troque o modo para **Append** e execute de novo. Compare o número de
   itens de saída.

## 📋 Parte B — `Loop Over Items`

1. Novo workflow. Num **Code**, gere uma lista de **10 "mensagens"**
   (`{ id: 1..10, texto: "mensagem N" }`).
2. Ligue num **Loop Over Items**, com tamanho de lote **3**.
3. Dentro do loop, adicione um **Wait** de 1 segundo, e depois um
   **Edit Fields** marcando `processado: true`.
4. Feche o laço: a saída "loop" do **Loop Over Items** volta para o
   início dele (é assim que ele sabe processar o próximo lote); a saída
   "done" segue para fora, para um node final (`Edit Fields`:
   `"total_processado": true`).
5. Execute e acompanhe na aba **Executions**: quantas "passagens" pelo
   loop aconteceram para 10 itens em lotes de 3?

## ✅ Checklist

- [ ] Parte A: o `Merge` por Matching Fields juntou cada cliente com o
      pedido certo, mesmo fora de ordem.
- [ ] Parte A: você comparou o número de itens entre Combine e Append.
- [ ] Parte B: o `Loop Over Items` processou os 10 itens em lotes de 3,
      com a pausa entre cada lote visível na aba Executions.

## 📸 O que guardar para o relatório

- Print da saída do `Merge` nos dois modos (Combine e Append).
- Print da aba Executions da Parte B, mostrando as passagens do loop.

## 🧪 Perguntas de reflexão

1. Na Parte A, o que aconteceria se dois clientes diferentes tivessem,
   por engano, o mesmo `cliente_id` num pedido? O `Combine by Matching
   Fields` perceberia o erro, ou juntaria silenciosamente?
2. Na Parte B, quantos "lotes" seriam necessários para 10.000 itens, em
   lotes de 3? Que outro problema (além de rate limit) o `Loop Over
   Items` evita nesse volume?

**Próximo passo:** [07-exercicio-03-blindando-a-chamada-de-ia](../07-exercicio-03-blindando-a-chamada-de-ia/README.md)
