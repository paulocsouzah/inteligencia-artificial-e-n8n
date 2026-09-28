# 6. Exercício 02 — Paginação e Bearer Token

**Nível: 🟡 Médio.**

Duas partes independentes. Na primeira, você reutiliza o Bearer Token do
GitHub em outro endpoint. Na segunda, você pagina uma API diferente — que
usa o **outro** padrão de paginação que eu expliquei no módulo 03: um link
para a próxima página **dentro da própria resposta**, e não um número de
página que você incrementa.

## 🎯 Objetivo

Parte A: listar os repositórios públicos de uma organização do GitHub, com
Bearer Token. Parte B: percorrer **todos** os personagens da API pública
*Rick and Morty*, usando a paginação por link (`info.next`) do n8n.

## 📋 Parte A — Bearer Token num endpoint novo

1. Novo workflow, **Manual Trigger** → **HTTP Request**.
2. `GET https://api.github.com/orgs/n8n-io/repos?per_page=10`.
3. Na aba **Authentication**, reutilize a credencial Bearer Token que você
   criou na demonstração (ou crie uma nova, com um token seu).
4. Execute. Você recebe os repositórios da organização `n8n-io` — anote
   quantos itens vieram (deve ser 10, o `per_page`).

**Erro de propósito:** remova a credencial (**Authentication → None**) e
execute de novo com o mesmo `per_page=10`, mas troque a URL para um endpoint
que **exige** autenticação, por exemplo
`https://api.github.com/user` (dados do usuário **logado** — não faz
sentido sem token). Anote o código e a mensagem.

## 📋 Parte B — Paginação por link

1. Novo node **HTTP Request** (pode ser outro workflow, ou outro branch do
   mesmo): `GET https://rickandmortyapi.com/api/character`. Sem
   autenticação — essa API é pública, sem chave.
2. Execute uma vez, sem paginação. Olhe o campo `info` da resposta:
   ```json
   "info": { "count": 826, "pages": 42, "next": "https://rickandmortyapi.com/api/character?page=2", "prev": null }
   ```
   Repare: a própria resposta já diz **quantas páginas existem** e **qual é
   a URL da próxima**. Você não precisa calcular nada.
3. Abra a aba **Pagination**, ligue **Pagination Enabled** e escolha
   **Response Contains Next URL**. No campo que pede o caminho do JSON onde
   está essa URL, informe `info.next`.
4. Em **Continue**, escolha **Until a condition is met**: pare quando
   `info.next` vier **vazio/nulo** (é `null` na última página — o próprio
   formato da API já avisa que acabou).
5. **Antes de executar de verdade:** limite a **3 páginas** (o parâmetro de
   limite de páginas da própria aba Pagination) — são 42 páginas ao todo, e
   você não precisa de todas para o exercício.
6. Execute.

**O que observar:** a diferença para o Ato 3 da demonstração — lá, **você**
disse ao n8n como montar a próxima URL (`page = page + 1`); aqui, a própria
API te disse, e o n8n só seguiu o link.

## ✅ Checklist

- [ ] Parte A: a chamada com Bearer Token trouxe 10 repositórios.
- [ ] Parte A: você reproduziu o erro sem autenticação num endpoint que
      exige login, e anotou o código e a mensagem.
- [ ] Parte B: a paginação por `info.next` trouxe itens de mais de uma
      página, respeitando o limite de 3 que você configurou.
- [ ] Parte B: você entende por que essa configuração usa `null`, e não um
      número, como condição de parada.

## 📸 O que guardar para o relatório

- Print da Parte A: a resposta com Bearer Token e o erro sem autenticação.
- Print da configuração da aba **Pagination** da Parte B.
- Print da saída final da Parte B, mostrando itens de mais de uma página.

## 🧪 Perguntas de reflexão

1. A paginação por **número de página** (Ato 3 da demonstração) e a
   paginação por **link/cursor** (esta) resolvem o mesmo problema. Se, entre
   a sua página 1 e a sua página 2, **alguém apagar um item da página 1**,
   qual das duas formas tem mais chance de você **pular** ou **repetir** um
   item, e por quê?
2. Por que é importante limitar o número de páginas **antes** de rodar uma
   paginação automática pela primeira vez, principalmente numa API que você
   não conhece o tamanho total?

**Próximo passo:** [07-exercicio-03-chamando-uma-llm-por-api](../07-exercicio-03-chamando-uma-llm-por-api/README.md)
