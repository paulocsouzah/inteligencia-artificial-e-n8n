# 3. Conceitos fundamentais

Cinco ideias. As duas primeiras são sobre **consultar e gravar** num
sistema real. As outras três são sobre **estruturar** o trabalho da IA em
cima disso.

---

## 1. Ler de um sistema real: `GET` com filtro

Até a Aula 03, você chamava APIs externas (GitHub, NASA, a LLM). Hoje você
chama **o seu próprio sistema** — a Loja FAEX. A mecânica é idêntica, só o
dono da API que muda:

```
GET http://<ip>:8080/api/reclamacoes?status=nova
```

Isso devolve só as reclamações que **ainda não foram tratadas**. O filtro
por `status` é o que evita reprocessar a mesma reclamação toda vez que o
workflow rodar — o mesmo problema que você resolveria de qualquer jeito,
com qualquer fonte de dados.

## 2. Gravar de volta: fechando o ciclo com `PATCH`

Nas aulas anteriores, o workflow **lia** um dado e **respondia** — ponto
final. Hoje ele também **escreve**: depois de decidir o que fazer com uma
reclamação, ele grava o resultado de volta:

```
PATCH http://<ip>:8080/api/reclamacoes/7
Body: { "status": "respondida", "intencao": "suporte", "resposta": "..." }
```

Isso fecha o ciclo: **ler → processar → escrever**. É o que faz a próxima
consulta por `status=nova` não trazer mais essa reclamação — sem isso, o
workflow processaria a mesma coisa para sempre.

## 3. Saída estruturada com schema fechado

Continua igual ao que você já viu: `json_schema` com `strict: true`,
`enum` para valores fechados, e `type: ["string", "null"]` quando um campo
pode não existir. A diferença é só a fonte do texto que entra — antes era
uma mensagem fixa, agora é `mensagem` de uma reclamação real, vinda do
`GET`.

## 4. Responder com uma base real, não um texto fixo

A "base de conhecimento" de hoje é a tabela `politicas` do banco da loja,
servida em `GET /api/politicas`. Mecanicamente, o padrão é o mesmo de
sempre: busca o conteúdo, monta o contexto, instrui a IA a responder **só**
com ele. A diferença prática: se você editar uma política no banco (ou,
mais realista, num sistema de verdade), a resposta muda **sem precisar
mexer no workflow**. Numa base escrita num Code node, você teria que
editar o workflow para mudar uma política.

## 5. A pegadinha do "uma vez por item"

Esta é a que mais gente perde tempo procurando, porque ela **não dá
erro**. Todo node **Code** do n8n tem um modo de execução:

| Modo | O que faz |
|---|---|
| **Run Once for All Items** (padrão) | O script roda **uma vez só**, mesmo que cheguem 10 itens |
| **Run Once for Each Item** | O script roda **uma vez por item** |

Se o seu Code node recebe 5 reclamações e você escreve `return { json:
{...} }` (um objeto só, não uma lista), no modo padrão o n8n entende que
você só quer devolver **um** item — e os outros 4 somem, **sem nenhum
erro**. A execução termina como sucesso, só que processou um quinto do
que devia.

> 🔍 **Isso aconteceu de verdade enquanto eu montava esta aula.** O
> projeto final processou só a primeira reclamação da lista, mesmo com
> cinco esperando. A execução deu "sucesso" — nada acusava o problema. A
> causa era exatamente essa: os Code nodes da cadeia estavam no modo
> padrão. A correção foi marcar **Run Once for Each Item** em cada um
> deles.

**Regra prática:** sempre que o seu workflow processa uma **lista** (não
um item escolhido de propósito, como nos exercícios de hoje), confira o
modo de cada Code node. Se o número de itens que entra for diferente do
número que sai, comece a investigação por aqui.

---

## 🗺️ Juntando tudo

```
GET /api/reclamacoes?status=nova
          │
          ▼
  (para CADA reclamação, modo "each item")
          │
    ┌─────┼─────┬──────────────┐
    ▼     ▼     ▼              ▼
 Etapa 1  Etapa 2  GET /api/politicas
 intenção extração        │
    └─────┴─────┬─────────┘
                 ▼
          Etapa 3: responder com a base
                 │
                 ▼
          Decisão em código
                 │
                 ▼
       PATCH /api/reclamacoes/:id
```

## 🧪 Exercício

Antes da demonstração, responda por escrito:

1. Por que o filtro `?status=nova` evita processar a mesma reclamação duas
   vezes? O que aconteceria se o workflow não atualizasse o `status` depois
   de responder?
2. Se você editasse o texto de uma política direto no banco (via API, com
   um `PATCH` em `/api/politicas/:id` — que não existe hoje, mas poderia),
   o workflow precisaria de alguma mudança para usar o texto novo? Por quê?
3. Um Code node no modo padrão recebe 8 itens e você escreve `return
   items[0]`. Quantos itens saem? E se você escrever `return items`?

**Próximo passo:** [04-demonstracao-guiada](../04-demonstracao-guiada/README.md)
