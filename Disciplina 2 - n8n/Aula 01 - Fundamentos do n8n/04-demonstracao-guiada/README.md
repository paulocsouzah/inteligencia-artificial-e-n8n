# 4. Demonstração guiada

Agora eu construo na sua frente. São **seis atos**, do mais simples ao mais
completo, e no último eu quebro o workflow de propósito, de quatro jeitos, para
você reconhecer cada erro quando ele aparecer no seu.

Acompanhe no **seu** n8n, no seu IP. Eu vou usar `http://<ip>` nos comandos:
troque pelo `n8n_url` que o Terraform te devolveu.

---

## 🎬 Ato 1 — O menor workflow possível

Eu crio um workflow novo e adiciono **Manual Trigger** → **Edit Fields (Set)**.
No Edit Fields, crio um campo `cliente` com o valor `Maria Souza` e clico em
**Execute workflow**.

**O que eu quero que você observe:**

- O Manual Trigger não tem entrada — é o começo.
- O painel de saída do Edit Fields mostra **1 item**. Alterno entre **Schema**,
  **Table** e **JSON**: é o mesmo dado, três formas de olhar.
- O item tem só o campo `cliente`. Os campos que **chegaram** não foram
  repassados — o Edit Fields devolve só o que você mandou criar (a menos que
  você ligue a opção de manter os outros campos).

## 🎬 Ato 2 — Do valor fixo para a expression

Volto no campo e, em vez de digitar o texto, troco o modo do campo de **Fixed**
para **Expression** e escrevo:

```
{{ $now.toISO() }}
```

Executo de novo. O campo agora traz a **data e hora atuais**, já no fuso de São
Paulo (foi para isso que o Terraform configurou `GENERIC_TIMEZONE`).

**O que observar:** o mesmo campo, executado duas vezes, dá dois valores
diferentes. É essa a diferença entre um valor fixo e uma expression.

## 🎬 Ato 3 — Três itens, e o node que roda três vezes

Adiciono, entre o trigger e o Edit Fields, um node **Code** que devolve **três
clientes**. Depois, no Edit Fields, escrevo `{{ $json.nome.trim() }}` num
campo `nome`.

**O que observar:**

- A saída do Code mostra **3 itens**.
- A saída do Edit Fields também mostra **3 itens** — e eu **não escrevi laço
  nenhum**. O Edit Fields rodou 3 vezes, uma por item. Esta é a regra de ouro do
  módulo anterior, acontecendo na tela.

## 🎬 Ato 4 — O primeiro webhook, com a URL de teste

Crio um workflow novo. Adiciono um node **Webhook**, com método `POST` e
caminho `atendimento`. Em **Respond**, escolho **Using 'Respond to Webhook'
Node**. Clico em **Listen for test event** — o node fica esperando.

Em outro terminal, eu chamo a **URL de teste**:

```bash
curl -X POST http://<ip>/webhook-test/atendimento \
  -H "Content-Type: application/json" \
  -d '{"nome":"Maria Souza","mensagem":"Meu pedido 4521 ainda nao chegou"}'
```

**O que observar:**

- O dado **aparece no editor** na hora — é para isso que a URL de teste serve.
- O que eu enviei está dentro de **`body`**: `$json.body.nome`, e não
  `$json.nome`.
- O `curl` volta com um **erro**, e a mensagem é reveladora: ela diz que não
  há um node Respond to Webhook (`No Respond to Webhook node found in the
  workflow`). Eu escolhi responder
  por um node **Respond to Webhook**, e ele ainda não existe. O n8n prefere
  te avisar a ficar te deixando esperando.

## 🎬 Ato 5 — Fechando o ciclo: responder ao cliente

Adiciono um **Edit Fields** que lê `{{ $json.body.nome }}` e
`{{ $json.body.mensagem }}`, e depois um **Respond to Webhook** com o corpo:

```
{{ { ok: true, recebi_de: $json.nome, tamanho_da_mensagem: $json.mensagem.length } }}
```

Clico em **Listen for test event** de novo e repito o `curl`. Agora ele volta:

```json
{"ok":true,"recebi_de":"Maria Souza","tamanho_da_mensagem":32}
```

**O que observar:** a URL de teste funcionou **uma vez** e parou. Se eu repetir
o `curl` sem clicar em *Listen* outra vez, ele falha (veja o Ato 6).

## 🎬 Ato 6 — Publicar, e depois quebrar de quatro jeitos

Clico em **Publish**. Agora a **URL de produção** existe. Chamo com `-i` para ver
o código HTTP:

```bash
curl -i -X POST http://<ip>/webhook/atendimento \
  -H "Content-Type: application/json" \
  -d '{"nome":"Maria Souza","mensagem":"Meu pedido 4521 ainda nao chegou"}'
```

```
HTTP/1.1 200 OK
{"ok":true,"recebi_de":"Maria Souza","tamanho_da_mensagem":32}
```

Abro o editor: **nada apareceu no canvas**. Mas na aba **Executions**, a
execução está lá, com os dados de cada node. A produção não desenha no canvas.

Agora eu quebro. Estes são os **quatro erros** que você vai ver, com as
mensagens reais:

**Erro 1 — método errado (GET em vez de POST):**

```bash
curl -i http://<ip>/webhook/atendimento
```

```
HTTP/1.1 404 Not Found
{"code":404,"message":"This webhook is not registered for GET requests. Did you mean to make a POST request?"}
```

A mensagem já diz a causa: o webhook existe, mas só aceita POST.

**Erro 2 — caminho errado (um erro de digitação):**

```bash
curl -i -X POST http://<ip>/webhook/atendimentoo
```

```
HTTP/1.1 404 Not Found
{"code":404,"message":"The requested webhook \"POST atendimentoo\" is not registered.","hint":"The workflow must be active for a production URL to run successfully. ..."}
```

**Erro 3 — URL de teste sem estar ouvindo:**

```bash
curl -i -X POST http://<ip>/webhook-test/atendimento
```

```
HTTP/1.1 404 Not Found
{"code":404,"message":"The requested webhook \"atendimento\" is not registered.","hint":"Click the 'Execute workflow' button on the canvas, then try again. (In test mode, the webhook only works for one call after you click this button)"}
```

**Erro 4 — workflow despublicado.** Clico em despublicar e repito a chamada de
produção: o resultado é igual ao Erro 2. **Repare que o Erro 2 e o Erro 4 dão a
mesma mensagem** — "não está registrado". Por isso, diante de um 404 de
webhook, a checagem é sempre a mesma trinca: **o método está certo? O caminho
está certo? O workflow está publicado?**

## 🎁 Bônus — o erro que *não* dá erro

Por fim, mando uma chamada **sem o campo `mensagem`**:

```bash
curl -i -X POST http://<ip>/webhook/atendimento \
  -H "Content-Type: application/json" \
  -d '{"nome":"Maria Souza"}'
```

Espero um erro. Não vem. O que volta é:

```
HTTP/1.1 200 OK
(corpo vazio)
```

O n8n aceitou, executou e respondeu **200 OK** — mas o `mensagem.length` do meu
Respond to Webhook não tinha de onde ler, e a resposta saiu **em branco**. Quem
chamou acha que deu tudo certo, e não recebeu nada. Na aba **Executions**, a
execução aparece como **sucesso**.

Guarde esta imagem: **um workflow que termina em "sucesso" não é um workflow
que está certo.** A gente volta a isso no desafio do Exercício 04, onde eu te
mostro como responder um `400` de verdade.

## 🧾 O que eu quero que você leve daqui

| O que vimos | A frase para guardar |
|---|---|
| Nodes e itens | Um node roda **uma vez por item** que chega |
| Expressions | `$json` é a **entrada** do node; o que o cliente mandou está em `$json.body` |
| URL de teste x produção | Teste: uma chamada, aparece no editor. Produção: sempre, aparece em **Executions** |
| 404 de webhook | Confira: método, caminho, **e se está publicado** |
| Sucesso | Sucesso na execução ≠ dado correto |

## 🧪 Exercício

Reproduza o Ato 4 ao Ato 6 no seu n8n, **sem copiar o que eu fiz na tela**: use o
caminho `meu-teste` em vez de `atendimento`. Registre:

1. Um print da URL de teste devolvendo o dado no editor.
2. Um print da aba **Executions** mostrando uma execução de produção.
3. Os quatro erros: para cada um, o `curl` que você usou e a mensagem que voltou.

**Próximo passo:** [05-exercicio-01-primeiro-workflow](../05-exercicio-01-primeiro-workflow/README.md)
