# 6. Exercício 02 — JSON e expressions

**Nível: 🟡 Médio.**

No exercício anterior, você criou **um** item. Agora chegam **três**, e eles
vêm "sujos" — do jeito que dados de formulário de verdade chegam: espaços
sobrando, e-mail com maiúsculas, mensagens de tamanhos diferentes. Sua missão é
limpar e enriquecer cada item usando **expressions**, sem escrever nenhum laço.

## 🎯 Objetivo

Ver, com os próprios olhos, que um node roda **uma vez por item**; escrever seis
expressions que limpam e derivam campos; e cair (de propósito) na pegadinha do
`$json`.

## 📋 Passo a passo

### 1. Gerar os dados

Crie um workflow `Aula 01 - Ex 02 - JSON e expressions`. Adicione um **Manual
Trigger** e, ligado a ele, um node **Code** (renomeie para `Gerar clientes`).
Cole este código:

```javascript
// Devolvo 3 clientes "sujos" — do jeito que chegam de um formulário de verdade:
// espaços sobrando, e-mail com maiúsculas, mensagens de tamanhos diferentes.
return [
  { json: { nome: "  Maria Souza ", email: "MARIA.SOUZA@Gmail.com", pedidos: 14, mensagem: "Meu pedido 4521 ainda não chegou e já passou do prazo combinado." } },
  { json: { nome: "João Pereira", email: "joao@empresa.com.br", pedidos: 2, mensagem: "Quero trocar o tamanho." } },
  { json: { nome: "Ana Lima", email: "Ana.Lima@Outlook.com", pedidos: 31, mensagem: "Cobrança duplicada no cartão." } }
];
```

Note o formato: o `Code` devolve uma **lista** (`[ ... ]`), e cada elemento tem
uma chave **`json`**. É exatamente a estrutura de dados do módulo 03.

Execute o node e confirme: a saída mostra **3 itens**.

### 2. Limpar os dados

Adicione, ligado ao `Gerar clientes`, um **Edit Fields (Set)** chamado `Limpar
dados`. Crie **seis campos**, todos em modo **Expression**:

| Campo | Tipo | Expression | O que faz |
|---|---|---|---|
| `nome` | String | `{{ $json.nome.trim() }}` | Tira os espaços das pontas |
| `email` | String | `{{ $json.email.trim().toLowerCase() }}` | Tudo em minúsculas |
| `dominio` | String | `{{ $json.email.split('@')[1].toLowerCase() }}` | Só o que vem depois do `@` |
| `iniciais` | String | `{{ $json.nome.trim().split(' ').map(p => p[0].toUpperCase()).join('') }}` | Primeira letra de cada nome |
| `cliente_vip` | **Boolean** | `{{ $json.pedidos >= 10 }}` | Verdadeiro se tem 10 ou mais pedidos |
| `resumo` | String | `{{ $json.mensagem.length > 30 ? $json.mensagem.slice(0, 30) + '...' : $json.mensagem }}` | Corta a mensagem em 30 caracteres |

Execute o `Limpar dados`.

**Saída esperada:**

```json
[
  { "nome": "Maria Souza", "email": "maria.souza@gmail.com", "dominio": "gmail.com",
    "iniciais": "MS", "cliente_vip": true,  "resumo": "Meu pedido 4521 ainda não cheg..." },
  { "nome": "João Pereira", "email": "joao@empresa.com.br", "dominio": "empresa.com.br",
    "iniciais": "JP", "cliente_vip": false, "resumo": "Quero trocar o tamanho." },
  { "nome": "Ana Lima", "email": "ana.lima@outlook.com", "dominio": "outlook.com",
    "iniciais": "AL", "cliente_vip": true,  "resumo": "Cobrança duplicada no cartão." }
]
```

Repare em três coisas:

1. **Três itens entraram, três saíram** — sem nenhum laço. O node rodou 3 vezes.
2. **Os campos `pedidos` e `mensagem` sumiram.** O Edit Fields devolve só os campos
   que você criou. Para manter os originais, existe a opção **Include Other
   Input Fields**, que você liga em *Options* no rodapé do node. Ligue e
   execute de novo para ver a diferença.
3. O campo `cliente_vip` é **booleano** (`true`/`false`), não texto. O tipo do
   campo importa: mais para a frente, um node de decisão trata `true` de um jeito
   e `"true"` de outro.

### 3. Referenciar outro node

Suponha que você **precise** do valor original de `pedidos`, que o Edit Fields
descartou. Você não precisa ligar a opção acima: pode ir buscar em outro node.
Adicione o campo:

| Campo | Tipo | Expression |
|---|---|---|
| `pedidos_original` | Number | `{{ $('Gerar clientes').item.json.pedidos }}` |

Execute. O valor volta (14, 2, 31), lido diretamente do node `Gerar clientes`.

Outros dois campos para experimentar:

| Campo | Tipo | Expression |
|---|---|---|
| `posicao` | Number | `{{ $itemIndex + 1 }}` |
| `saudacao` | String | `Olá, {{ $json.nome.split(' ')[0] }}!` |

### 4. 🪤 A pegadinha — leia a `saudacao` da Maria

Olhe o resultado do campo `saudacao`:

```
Maria  →  "Olá, !"          ← cadê o nome?
João   →  "Olá, João!"
Ana    →  "Olá, Ana!"
```

**A saudação da Maria saiu vazia.** Todas as expressions estão "certas". Por
quê?

Pense no que eu disse no módulo 03: **`$json` é a *entrada* do node**. Dentro do
`Limpar dados`, o `$json.nome` é o nome que **chegou** — `"  Maria Souza "`, com
dois espaços na frente — e **não** o `nome` limpo que você acabou de criar no
mesmo node. `"  Maria Souza ".split(' ')[0]` é uma string vazia, porque o
primeiro pedaço antes do primeiro espaço é... nada.

Conserte de **duas** maneiras, e me diga qual você acha melhor:

- **Maneira 1:** limpe no próprio campo — `Olá, {{ $json.nome.trim().split(' ')[0] }}!`
- **Maneira 2:** faça a saudação num **segundo** node Edit Fields, depois do
  `Limpar dados`. Lá, `$json.nome` já é o nome limpo.

## ✅ Checklist

- [ ] O `Gerar clientes` devolve 3 itens.
- [ ] O `Limpar dados` devolve 3 itens com os seis campos corretos.
- [ ] `cliente_vip` é do tipo **Boolean**.
- [ ] Você referenciou outro node com `$('Gerar clientes').item.json`.
- [ ] Você reproduziu o erro da `saudacao` e o corrigiu.

> Gabarito (sem os campos extras da parte 3): [`assets/workflow-ex02-gabarito.json`](assets/workflow-ex02-gabarito.json).

## 📸 O que guardar para o relatório

- Print da saída do `Gerar clientes` (3 itens).
- Print da saída do `Limpar dados` (3 itens, seis campos).
- Print da saudação **errada** e da **corrigida**.
- O JSON exportado.

## 🧪 Perguntas de reflexão

1. Quantas vezes o node `Limpar dados` executou? Como você sabe, olhando a tela?
2. Por que os campos `pedidos` e `mensagem` sumiram da saída? Que opção os traz de
   volta, e quando você preferiria **não** trazê-los?
3. Explique, com suas palavras, por que a `saudacao` da Maria saiu vazia. O que
   `$json` representa dentro de um Edit Fields?
4. Das duas correções, qual você escolheria num workflow com vinte campos? Por quê?
5. `cliente_vip` é `true` ou `"true"`? Onde você vê essa diferença na tela, e por
   que ela vai importar quando você tiver um node que **decide** com base no valor?

**Próximo passo:** [07-exercicio-03-webhook](../07-exercicio-03-webhook/README.md)
