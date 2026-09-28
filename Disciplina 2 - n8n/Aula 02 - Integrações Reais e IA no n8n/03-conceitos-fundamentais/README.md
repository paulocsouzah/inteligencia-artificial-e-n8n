# 3. Conceitos fundamentais

Esta aula tem um vocabulário maior que a anterior, mas ele se apoia todo
numa ideia só: **toda API é uma conversa com regras**. Você manda uma
requisição no formato certo, prova quem é do jeito que ela pede, e ela
devolve uma resposta — ou um erro que, se você souber ler, já te diz o que
fazer.

São **sete ideias**.

---

## 1. REST: os verbos do HTTP como um contrato

Uma API **REST** organiza as ações em torno de **recursos** (um pedido, um
cliente, uma mensagem) e usa o **verbo HTTP** para dizer o que você quer
fazer com aquele recurso:

| Verbo | Intenção | Exemplo |
|---|---|---|
| **GET** | Ler, sem alterar nada | Buscar o status de um pedido |
| **POST** | Criar algo novo | Enviar uma mensagem, criar um ticket |
| **PUT** | Substituir por completo | Atualizar o cadastro inteiro de um cliente |
| **PATCH** | Alterar só uma parte | Marcar só o campo `status` como `resolvido` |
| **DELETE** | Remover | Cancelar um pedido |

No n8n, você escolhe o verbo no node **HTTP Request**, no campo **Method** —
e o resto do node muda de acordo (GET normalmente não tem corpo; POST/PUT/
PATCH têm).

## 2. Headers: o envelope da requisição

Um **header** é uma informação **sobre** a requisição, separada dos dados
em si — como o remetente e o tipo de carta escritos no envelope, não na
carta. Os que você mais vai usar:

| Header | Para que serve |
|---|---|
| `Content-Type: application/json` | Avisa que o corpo da requisição é JSON |
| `Authorization: Bearer <token>` | Prova quem você é (item 4) |
| `Accept: application/json` | Avisa que você **espera** receber JSON de volta |
| `X-RateLimit-Remaining` (resposta) | Quantas chamadas ainda restam antes do limite (item 6) |

No HTTP Request, você adiciona headers na seção **Headers**, ligando
**Send Headers** e preenchendo nome/valor — ou deixando a **credencial**
preencher sozinha (item 5).

## 3. JSON: você já sabe isso

Da Aula 01: tudo no n8n é uma lista de itens, cada um com um `json`. O corpo
de uma resposta de API vira, automaticamente, o `json` do item que sai do
node HTTP Request. Nada novo aqui — só reforçando que **é a mesma estrutura
que você já domina**, agora vindo de fora.

## 4. Três formas de provar quem você é

Esta é a parte central da aula. Toda API decide **como** você prova sua
identidade, e três formas cobrem a maioria dos casos:

| Forma | Como funciona | Vantagem | Risco |
|---|---|---|---|
| **API Key** | Uma chave fixa, no header ou na query string (`?apikey=...`) | Simples de usar | Se vazar, dá acesso **para sempre**, até alguém revogar |
| **Bearer Token** | Um token no header `Authorization: Bearer <token>` | Um pouco mais padronizado; muitas vezes tem prazo de validade | Mesmo risco da API Key se o token não expirar |
| **OAuth2** | Você faz login na tela do próprio provedor; ele devolve um token **temporário**, que o n8n renova sozinho, e só com as permissões que você aceitou | Você nunca vê nem guarda a senha; o acesso pode ser revogado a qualquer momento, só daquele app | Configuração inicial mais trabalhosa |

A regra prática: **quanto mais sensível o dado, maior a chance de a API
exigir OAuth2.** Ler e-mail e enviar mensagem em nome de alguém (o Gmail) é
sensível — por isso ele exige OAuth2, e não uma chave simples.

## 5. Credenciais no n8n: nunca cole um segredo dentro de um node

O n8n tem uma área separada, **Credentials**, para guardar qualquer segredo
— API Key, Bearer Token, usuário/senha, ou a autorização OAuth2 completa.
Existem dois jeitos de usar isso no HTTP Request:

- **Generic Credential Type**: você escolhe "Header Auth", "Query Auth" ou
  "Bearer Token" na aba **Authentication** do node, e o n8n cria uma
  credencial genérica para guardar aquele valor.
- **Predefined Credential Type**: para APIs muito usadas (Google, GitHub,
  Slack, OpenAI...), o n8n já vem com um "conector" pronto — você só
  preenche a chave ou faz o login OAuth2, e ele sabe onde e como aplicar.

**Por que isso importa, e não é só organização:** um segredo escrito direto
num campo do node **aparece no JSON exportado do workflow**. Se você mandar
esse export para alguém (ou subir num repositório Git, como este), a chave
vaza junto. Uma credencial, ao contrário, **nunca** é exportada com o
workflow — só uma referência a ela, pelo nome. É por isso que os `.json` de
gabarito desta aula não têm nenhuma chave real dentro: eles referenciam uma
credencial que você recria, com a sua própria chave, na sua conta.

## 6. Paginação: quando a resposta não cabe de uma vez

Uma API raramente devolve **tudo** numa chamada só — ela devolve um
**pedaço** (uma página) e um jeito de pedir a próxima. Os dois padrões mais
comuns:

| Padrão | Como funciona | Exemplo |
|---|---|---|
| **Por número de página** | Você manda `?page=1`, depois `?page=2`... até a resposta vir vazia ou menor que o tamanho da página | Muitas APIs REST simples |
| **Por cursor / link** | A própria resposta (no corpo, ou num header `Link`) já traz a URL da próxima página | GitHub, e boa parte das APIs modernas |

O node **HTTP Request** do n8n tem uma aba **Pagination** que automatiza os
dois padrões: você não precisa montar um loop manual (`Loop Over Items`) só
para isso — o node repete a chamada sozinho até a condição de parada que
você configurar. Você vai usar isso no Exercício 02.

## 7. E a IA, neste vocabulário?

Uma API de LLM (OpenAI, Anthropic, ou qualquer outra) **é uma API REST como
outra qualquer**: verbo `POST`, autenticação por **Bearer Token**, corpo em
**JSON**, resposta em **JSON**. A diferença é só o que vai dentro:

```json
// O que você manda
{
  "model": "gpt-4o-mini",
  "messages": [
    { "role": "system", "content": "Você classifica mensagens de suporte..." },
    { "role": "user", "content": "Meu pedido não chegou, já faz 10 dias!" }
  ],
  "response_format": { "type": "json_schema", "json_schema": { ... } }
}
```

```json
// O que ela devolve
{
  "choices": [{
    "message": {
      "content": "{\"categoria\":\"logistica\",\"sentimento\":\"negativo\",\"prioridade\":\"alta\"}"
    }
  }]
}
```

Repare em duas coisas que você já viu na Disciplina 1 e que agora reaparecem
com outra roupa:

- O **system prompt** é só o primeiro item da lista `messages` — o mesmo
  conceito de "Role" da Aula 02 de Prompt Engineering.
- O **`response_format` com `json_schema`** é a mesma ideia de **Structured
  Output**: em vez de confiar que o modelo "vai escrever um JSON direitinho",
  você **obriga** o formato da resposta. É o que faz você conseguir ler
  `$json.categoria` no próximo node do n8n, sem parsing manual arriscado.

**Uma diferença real, e importante:** essa chamada **custa dinheiro** e tem
**limite de taxa** — os dois próximos itens.

## 8. Rate limit e custo: a IA não é "grátis e sem limite"

Duas coisas que toda API paga (e quase toda API gratuita também) impõe:

- **Rate limit** — um número máximo de chamadas por minuto/hora. Estourar
  devolve `429 Too Many Requests`, geralmente com um header
  `Retry-After` dizendo quanto esperar.
- **Custo por chamada** — em APIs de LLM, o custo é medido em **tokens**
  (você já viu isso na Aula 01 de IA): quanto maior o prompt e a resposta,
  mais caro. Um workflow que chama a IA para **cada e-mail que chega**, sem
  nenhum filtro antes, pode gerar uma conta que ninguém esperava se a caixa
  de entrada receber spam em volume.

Isso não é teórico: é uma das perguntas de reflexão do exercício final, e a
gente volta a esse assunto, a fundo, na Aula 03 (retry, timeout, orçamento).

---

## 🗺️ Juntando tudo

O padrão que se repete em **toda** chamada de API desta aula, seja a uma API
pública ou a uma LLM:

```
 ┌──────────────┐    ┌─────────────────────────┐    ┌───────────────────┐
 │ Node/Trigger │───▶│    HTTP Request          │───▶│  Próximo node      │
 │ (o gatilho)  │    │  Method + URL + Headers  │    │  lê $json.<campo>  │
 │              │    │  + Autenticação (credencial) │  da resposta        │
 └──────────────┘    └─────────────────────────┘    └───────────────────┘
```

## 🧪 Exercício

Antes da demonstração, responda por escrito:

1. Uma API devolve `401 Unauthorized`. Outra devolve `403 Forbidden`. As
   mensagens parecem parecidas — qual é a diferença entre "eu não sei quem
   você é" e "eu sei quem você é, mas você não pode fazer isso"?
2. Por que uma credencial no n8n **não aparece** no JSON exportado do
   workflow, e um valor digitado direto no campo do node **aparece**? O que
   isso significa para um workflow que você vai subir num repositório Git
   (como os desta disciplina)?
3. Se uma API pagina por **cursor** (a resposta já traz o link da próxima
   página) em vez de **número de página**, por que isso é mais confiável
   quando os dados mudam **enquanto você está lendo** (alguém cria um novo
   registro no meio da sua leitura)?
4. Volte no exemplo da chamada de LLM. Se você **não** usasse
   `response_format` com `json_schema`, e pedisse "responda em JSON" só no
   texto do prompt, o que poderia dar errado no node seguinte do n8n?

**Próximo passo:** [04-demonstracao-guiada](../04-demonstracao-guiada/README.md)
