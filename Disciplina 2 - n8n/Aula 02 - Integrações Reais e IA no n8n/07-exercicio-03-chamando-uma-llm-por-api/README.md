# 7. Exercício 03 — Chamando uma LLM por API

**Nível: 🟡 Médio / 🟠 Complexo.**

Lembra do classificador que você construiu na Disciplina 1, Aula 02 de
Prompt Engineering — aquele que recebia uma mensagem e devolvia JSON com
categoria, prioridade, sentimento e resposta? Você vai construir a **mesma
coisa**, mas agora **dentro de um workflow do n8n**, chamando a API da LLM
como mais uma integração.

## 🎯 Objetivo

Montar, no n8n, uma chamada HTTP para uma API de LLM que recebe uma
mensagem de cliente e devolve `categoria`, `prioridade`, `sentimento` e
`resposta_sugerida` — primeiro sem forçar o formato (e ver o problema),
depois com saída estruturada garantida.

## 📋 Passo a passo

### 1. A chamada sem `response_format`

**Manual Trigger** → **Edit Fields** (crie um campo `mensagem_cliente` com o
texto: *"Comprei um produto errado por engano, preciso trocar, mas já faz
uma semana e ninguém respondeu meu e-mail anterior."*) → **HTTP Request**:

- `POST` para o endpoint de chat da sua LLM (ex.:
  `https://api.openai.com/v1/chat/completions`)
- **Authentication:** Bearer Token (credencial com a sua chave)
- **Body (JSON):**
  ```json
  {
    "model": "gpt-4o-mini",
    "messages": [
      { "role": "system", "content": "Classifique a mensagem do cliente e responda em JSON com categoria (troca, duvida, elogio, reclamacao), prioridade (baixa, media, alta), sentimento (positivo, neutro, negativo) e resposta_sugerida." },
      { "role": "user", "content": "{{ $json.mensagem_cliente }}" }
    ]
  }
  ```

Execute. Olhe `choices[0].message.content`: é uma **string**. Tente, num
node **Edit Fields** seguinte, ler `{{ $json.choices[0].message.content.categoria }}`
— e reproduza o erro de expression do Ato 4 da demonstração.

### 2. Forçando o formato

Volte ao corpo da requisição e acrescente:

```json
"response_format": { "type": "json_object" }
```

Execute de novo. Agora `content` é uma string que é **sempre** um JSON
válido (ainda uma string — o `response_format: json_object` garante a
validade do JSON, não que o n8n o interprete sozinho). Adicione um node
**Code** logo depois, com:

```javascript
const dados = JSON.parse($input.item.json.choices[0].message.content);
return { json: dados };
```

Execute o workflow inteiro. Agora `{{ $json.categoria }}` funciona.

### 3. Com o node pronto

Adicione, em paralelo, um node **OpenAI** (categoria AI), operação
**Message a Model**, mesma credencial (agora como Predefined Credential
Type), mesmo prompt, e configure a **saída estruturada** direto na
interface do node (schema com os quatro campos).

Compare a saída dos dois caminhos — devem chegar ao mesmo resultado, por
rotas diferentes.

## ✅ Checklist

- [ ] Você reproduziu o erro de tentar ler um campo dentro de uma string.
- [ ] Com `response_format: json_object` + `Code` (`JSON.parse`), os quatro
      campos ficam acessíveis por `$json.campo`.
- [ ] O node OpenAI pronto chega ao mesmo resultado, sem o `Code` manual.
- [ ] Você testou com pelo menos **duas** mensagens de cliente diferentes.

## 📸 O que guardar para o relatório

- Print do erro de expression (Passo 1).
- Print da saída final com os quatro campos, pelos dois caminhos (manual e
  node pronto).
- As duas mensagens de teste e o resultado de cada uma.

## 🧪 Perguntas de reflexão

1. O `response_format: json_object` garante que o JSON é **válido**. Ele
   garante que os campos são **os que você pediu** (`categoria`,
   `prioridade`...)? O que aconteceria se o modelo devolvesse um JSON válido,
   mas com um campo `categoria_da_mensagem` em vez de `categoria`?
2. No Passo 3, o node pronto pede um **schema** para a saída estruturada —
   não só "responda em JSON". Isso é mais parecido com `json_object` ou com
   um `json_schema`? Qual a diferença prática para o seu `Code` node?
3. Comparando o esforço do Passo 2 (HTTP Request + Code manual) com o do
   Passo 3 (node pronto): em que situação você ainda preferiria o caminho
   manual, mesmo dando mais trabalho?

**Próximo passo:** [08-exercicio-04-gmail-oauth2](../08-exercicio-04-gmail-oauth2/README.md)
