# 3. Conceitos fundamentais

Este é o vocabulário da disciplina inteira. Eu prefiro que você o aprenda
agora, com poucos conceitos e bem entendidos, do que tenha de voltar aqui na
Aula 5 sem saber por que o agente não recebe o dado que você mandou.

São **seis ideias**. Cada uma se apoia na anterior.

---

## 1. Workflow: uma receita que roda sozinha

Um **workflow** é uma sequência de passos ligados por setas, que começa quando
**algo acontece** e termina quando o trabalho está feito. Pense numa linha de
montagem: chega uma peça, passa por estações, sai um produto.

```
[ Algo acontece ] ──▶ [ Passo 1 ] ──▶ [ Passo 2 ] ──▶ [ Passo 3 ]
   (trigger)             (node)         (node)          (node)
```

Todo workflow tem **exatamente um começo**: o *trigger*. Tudo o que vem depois
são *nodes* de trabalho.

## 2. Node: uma estação da linha de montagem

Um **node** é um passo. Cada node faz **uma coisa só** e tem sempre a mesma
anatomia:

```
   entrada ──▶ [ configuração ] ──▶ saída
 (o que chega)   (o que você      (o que sai para
                  preencheu)       o próximo node)
```

Existem dois tipos, e a diferença importa:

| Tipo | O que faz | Quando roda | Tem entrada? |
|---|---|---|---|
| **Trigger** | *Inicia* o workflow | Quando algo acontece (um clique, um horário, uma chamada HTTP) | Não — é o começo |
| **Node de ação** | Faz um trabalho (transforma dados, chama uma API, envia uma mensagem) | Quando o node anterior termina | Sim |

Os nodes que a gente vai usar hoje:

| Node | Tipo | O que faz |
|---|---|---|
| **Manual Trigger** | Trigger | Inicia o workflow quando você clica em *Execute workflow*. É o mais simples, ótimo para testar |
| **Schedule Trigger** | Trigger | Inicia o workflow num horário ou intervalo ("a cada minuto", "toda segunda às 9h") |
| **Webhook** | Trigger | Inicia o workflow quando alguém **chama uma URL** dele |
| **Edit Fields (Set)** | Ação | Cria, renomeia e transforma campos dos dados |
| **Code** | Ação | Roda um trecho de JavaScript seu, quando os nodes prontos não bastam |
| **Respond to Webhook** | Ação | Devolve a resposta HTTP para quem chamou o webhook |

## 3. Conexão e execução

- Uma **conexão** é a seta entre dois nodes: ela leva a **saída** de um até a
  **entrada** do próximo.
- Uma **execução** é **uma vez** que o workflow rodou, do trigger ao último
  node. Cada execução fica gravada na aba **Executions**, com os dados de cada
  node — o que entrou e o que saiu. É o seu "log com dados", e é a ferramenta
  que você mais vai usar para entender por que algo deu errado.

> 💡 A execução gravada é uma das grandes vantagens sobre um script: você não
> precisa rodar de novo com `console.log` para descobrir o que aconteceu. O
> dado de cada passo já está lá.

## 4. Os dados: uma lista de itens, cada um com um JSON

Esta é a ideia que mais gera confusão, então vou ser explícito. No n8n, **tudo
o que passa de um node para outro é uma lista de itens**, e cada item carrega os
seus dados dentro de uma chave `json`:

```json
[
  { "json": { "nome": "Maria Souza", "pedidos": 14 } },
  { "json": { "nome": "João Pereira", "pedidos": 2 } },
  { "json": { "nome": "Ana Lima", "pedidos": 31 } }
]
```

Isso é uma lista de **3 itens**. E aqui está a regra de ouro:

> **Um node roda uma vez para cada item que chega nele.**

Se chegam 3 itens no node Edit Fields, ele executa **3 vezes**, uma por item, e
devolve 3 itens. Você não escreve um `for`: o n8n faz o laço por você. Por isso
a primeira pergunta que eu faço ao olhar um workflow que "não funciona direito"
é: **quantos itens estão chegando em cada node?** O n8n mostra a contagem em
cada saída.

Você vai ver os mesmos dados de três formas no painel de um node: **Schema**
(a árvore de campos), **Table** (uma tabela, uma linha por item) e **JSON** (o
texto cru). São só formas de olhar a mesma coisa.

## 5. Expressions: a forma de ler os dados dentro de um node

Quando você preenche um campo de um node, ele pode ser **fixo** (o texto que
você digitou) ou uma **expression** (algo calculado a partir dos dados que
chegaram). Uma expression fica entre chaves duplas:

```
{{ ... }}
```

Dentro delas, você escreve **JavaScript**. As variáveis que você mais vai usar:

| Expression | O que devolve | Exemplo |
|---|---|---|
| `{{ $json.campo }}` | Um campo do **item que chegou** neste node | `{{ $json.nome }}` → `"Maria Souza"` |
| `{{ $json.a.b }}` | Um campo aninhado | `{{ $json.body.email }}` |
| `{{ $('Nome do node').item.json.campo }}` | Um campo de **outro node**, mais atrás no fluxo | `{{ $('Gerar clientes').item.json.pedidos }}` |
| `{{ $now }}` | A data e hora **agora** | `{{ $now.toISO() }}` |
| `{{ $itemIndex }}` | A posição do item na lista (começa em 0) | `{{ $itemIndex + 1 }}` |
| `{{ $execution.id }}` | O número da execução atual | `SAC-{{ $execution.id }}` |

Como é JavaScript, tudo o que você já sabe funciona: `.trim()`, `.toLowerCase()`,
`.split('@')[1]`, `.length`, operador ternário `a ? b : c`, `||`.

**Duas armadilhas que eu quero que você conheça agora**, porque todo mundo cai
nelas:

**Armadilha 1 — `$json` é sempre a *entrada* do node.** Dentro de um node Edit
Fields, `$json` aponta para o item que **chegou**, não para os campos que você
está criando nesse mesmo node. Se num node você cria `nome` (já limpo) e, no
mesmo node, cria `saudacao` usando `$json.nome`, a `saudacao` enxerga o `nome`
**sujo**, o de antes. Você vai ver isso acontecer no Exercício 02.

**Armadilha 2 — campo que não existe vira `null`, sem reclamar.** Se você lê
`$json.body.email` e o cliente não mandou `email`, o n8n **não dá erro**: o
valor simplesmente vem vazio (`null`), a execução termina como *sucesso* e o
workflow segue adiante como se estivesse tudo certo. Eu testei isso de dois
jeitos: um POST sem e-mail devolveu `201 Created` e **gerou um protocolo** para
um cliente sem e-mail; e um POST sem a mensagem devolveu `200 OK` com o **corpo
em branco**. **O n8n não valida os seus dados — quem valida é você.** Vamos
consertar isso no desafio do Exercício 04, e a fundo na Aula 3.

## 6. Webhook: uma URL que espera ser chamada

Até aqui, o trigger era *você* clicando, ou o *relógio*. O **webhook** é o
trigger que liga o n8n ao resto do mundo: ele cria uma **URL** e fica esperando.
Quando alguém faz uma requisição HTTP para essa URL, o workflow começa — e os
dados da requisição viram o primeiro item.

Você já usa webhooks sem saber: quando o Stripe avisa a sua loja que um
pagamento foi aprovado, quando o GitHub avisa que houve um push, quando um
formulário avisa que alguém preencheu — em todos eles, **um sistema chama uma
URL do outro**. É o jeito padrão de dois sistemas conversarem sem ficar
perguntando "aconteceu algo?" a cada segundo.

### O que chega dentro do item

Uma requisição chega ao workflow com esta forma:

```json
{
  "headers": { "content-type": "application/json", "...": "..." },
  "params":  { },
  "query":   { "origem": "site" },
  "body":    { "nome": "Maria", "email": "maria@gmail.com", "mensagem": "Meu pedido..." }
}
```

O que o cliente enviou no corpo da requisição está em **`$json.body`**. Por isso
a expression para ler o e-mail é `{{ $json.body.email }}` — e não
`{{ $json.email }}`. (Esse é o primeiro erro que quase todo mundo comete.)

### Duas URLs: a de teste e a de produção

Todo node Webhook tem **duas** URLs, e entender a diferença poupa muita dor de
cabeça:

| | URL de **teste** | URL de **produção** |
|---|---|---|
| Caminho | `/webhook-test/<caminho>` | `/webhook/<caminho>` |
| Quando funciona | **Uma única chamada**, depois que você clica em *Listen for test event* (ou *Execute workflow*) | **Sempre**, enquanto o workflow estiver **publicado** |
| Onde os dados aparecem | Direto no editor, na tela | **Só na aba Executions** — nada aparece no canvas |
| Para que serve | Desenvolver: você vê o dado chegar e monta o resto do fluxo | Usar de verdade, chamada por outros sistemas |

E há um passo que todo mundo esquece: **o workflow precisa estar publicado**
para a URL de produção existir. Enquanto não estiver, a URL de produção
devolve 404. (Nas versões mais antigas do n8n esse botão se chamava *Active*; na
versão que a gente usa, é **Publish**.)

### Como o webhook responde

O node Webhook tem três jeitos de responder a quem chamou (opção **Respond**):

| Opção | O que acontece |
|---|---|
| **Immediately** | Responde na hora, com uma mensagem padrão ("Workflow got started"), e o resto do workflow roda depois |
| **When Last Node Finishes** | Espera o workflow terminar e devolve o dado do último node |
| **Using 'Respond to Webhook' Node** | Você decide **quando e o que** responder, com um node **Respond to Webhook** no meio do fluxo |

Nos exercícios a gente usa a terceira, porque ela dá controle total: o código
HTTP (200, 201, 400...), o corpo, os cabeçalhos. É assim que você faz um
webhook que responde "recebi, seu protocolo é tal" — em vez de uma mensagem
genérica.

---

## 🗺️ Juntando tudo

O workflow que você vai construir hoje, com os seis conceitos marcados:

```
 ┌─────────────┐    ┌──────────────────────┐    ┌───────────────────┐
 │  Webhook    │───▶│ Edit Fields (Set)    │───▶│ Respond to Webhook│
 │  (trigger)  │    │ usa expressions:     │    │ (devolve o JSON   │
 │  cria a URL │    │ {{ $json.body.nome }}│    │  com o protocolo) │
 └─────────────┘    └──────────────────────┘    └───────────────────┘
      │                        │                          │
   1 item                  1 item                     resposta HTTP
   {headers, body...}      {protocolo, nome...}       201 Created
```

## 🧪 Exercício

Antes da demonstração, responda por escrito:

1. Um Webhook recebe uma requisição e liga a um node Edit Fields. Chegam **5
   itens** no Edit Fields. Quantas vezes ele executa? E quantos itens saem?
2. O cliente enviou `{"email": "Maria@X.com"}` num POST. Escreva a expression
   que devolve esse e-mail **em minúsculas**.
3. Por que uma URL de teste "some" depois de uma chamada, e a de produção não?
   Em que situação você usaria cada uma?
4. Você publicou o workflow e chamou a URL de produção. Abriu o editor e **não
   viu nada acontecer no canvas**. O workflow rodou? Onde você olha para ter
   certeza?

**Próximo passo:** [04-demonstracao-guiada](../04-demonstracao-guiada/README.md)
