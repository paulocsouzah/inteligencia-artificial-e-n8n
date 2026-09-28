# 5. Exercício 01 — Consumindo uma API pública

**Nível: 🟢 Básico.**

Na demonstração eu usei a API do GitHub, com autenticação por **header**
(Bearer Token). Aqui você vai repetir a ideia com uma API diferente, que
autentica por **query string** — o outro lugar comum onde uma API Key mora.

## 🎯 Objetivo

Chamar a API pública da **NASA** (Astronomy Picture of the Day), primeiro
com a chave de demonstração compartilhada, depois com a sua própria chave, e
comparar os limites.

## 📋 Passo a passo

### 1. A chamada com `DEMO_KEY`

Crie um workflow: **Manual Trigger** → **HTTP Request**. Configure:

- **Method:** GET
- **URL:** `https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY`

Execute. Você recebe de volta o título, a explicação e a URL da imagem
astronômica do dia — sem precisar de nenhuma credencial criada no n8n, a
chave já vai na própria URL.

Abra os **headers da resposta** e anote `x-ratelimit-limit` e
`x-ratelimit-remaining`.

### 2. Sua própria chave

Vá até [api.nasa.gov](https://api.nasa.gov/), preencha o formulário simples
(nome e e-mail) e você recebe uma chave própria. No node, troque `DEMO_KEY`
pela sua chave.

Execute de novo e compare o `x-ratelimit-limit`.

| | `DEMO_KEY` | Sua chave |
|---|---|---|
| Limite por hora | Baixo, por IP (a doc da NASA fala em 30; eu medi **10** ao testar este material — a NASA ajusta isso sem avisar) | **1000** |
| Onde a chave vai | Na própria URL (`?api_key=...`) | Igual |

> ⚠️ **Não decore o número — leia o header.** Eu escrevi este exercício
> testando a chamada de verdade, e o `x-ratelimit-limit` do `DEMO_KEY` veio
> **10**, não os 30 que a documentação da NASA promete. Isso não é erro seu
> nem meu: é uma API de terceiro mudando um limite sem avisar ninguém — e é
> exatamente por isso que você **confia no que o header da resposta diz
> agora**, não no que a documentação disse ontem. Se o seu número vier
> diferente do meu, isso **confirma** o ponto, não o contradiz.

### 3. Provocando o erro de propósito

Troque o valor da sua chave por algo inválido (`api_key=chave-errada`) e
execute. Anote o código HTTP e a mensagem.

## 🔍 Um passo a mais: tirando a chave da URL

Deixar a chave **na URL**, do jeito que fizemos, funciona — mas ela fica
visível em qualquer log de acesso do servidor, e some do controle do n8n
sobre "isto é um segredo". Refaça a chamada assim:

1. Tire o `?api_key=...` da URL (deixe só `https://api.nasa.gov/planetary/apod`).
2. Na aba **Query Parameters**, ligue **Send Query Parameters** e adicione
   `api_key` = a sua chave, **mas** em vez de digitar o valor direto, clique
   no ícone de credencial ao lado e crie uma **Generic Credential Type →
   Query Auth**, com `Name = api_key` e `Value = <sua chave>`.
3. Na aba **Authentication**, escolha essa credencial.

Execute de novo: o resultado é o mesmo, mas agora a chave está guardada como
**credencial** — não aparece no JSON exportado do workflow (item 5 do módulo
03).

## ✅ Checklist

- [ ] A chamada com `DEMO_KEY` funcionou e você anotou o rate limit.
- [ ] A chamada com a sua chave mostrou um limite maior.
- [ ] Você reproduziu o erro com uma chave inválida e anotou o código e a
      mensagem.
- [ ] A versão final usa a chave como **credencial** (Query Auth), não
      digitada na URL.

## 📸 O que guardar para o relatório

- Print da resposta com `DEMO_KEY` e os headers de rate limit.
- Print da resposta com a sua própria chave e o novo rate limit.
- Print do erro com a chave inválida (código e mensagem).
- Print da configuração da credencial Query Auth.

## 🧪 Perguntas de reflexão

1. Uma API Key na **URL** (query string) tem um risco que uma API Key num
   **header** não tem, relacionado a onde a URL costuma ficar registrada
   (histórico do navegador, logs de proxy, favoritos). Qual é?
2. Por que o rate limit do `DEMO_KEY` é medido **por IP**, e não por chave
   (já que a chave é a mesma para todo mundo)? O que aconteceria se fosse
   medido só pela chave?

**Próximo passo:** [06-exercicio-02-paginacao-e-bearer-token](../06-exercicio-02-paginacao-e-bearer-token/README.md)
