# 3. Requisitos do projeto

Este módulo é o contrato entre nós. Tudo o que está na tabela
"obrigatório" precisa estar no seu repositório; tudo o que está em
"bônus" soma pontos, mas não substitui um obrigatório. E para cada item
eu digo **onde eu vou procurar** — assim você não precisa adivinhar o que
eu quero ver.

---

## 🧱 Requisitos obrigatórios

| # | Requisito | Vem de | O que eu vou procurar no seu código |
|---|---|---|---|
| 1 | **LLM por API, só no backend** | Aula 03 | Chamada ao modelo num arquivo de servidor; a chave lida de variável de ambiente; **nenhuma** chave no frontend nem no Git |
| 2 | **Prompt Engineering de verdade** | Aula 02 | Um system prompt em arquivo próprio, com **papel**, **contexto**, **regras** (o que fazer e o que nunca fazer) e **formato de saída**. Pelo menos um exemplo (few-shot) ou uma regra explícita de recusa |
| 3 | **Structured Output** | Aulas 02 e 03 | Pelo menos um ponto em que o modelo devolve **JSON com schema** (function calling ou `response_format`) e o **seu código valida** o resultado antes de usar, tratando o caso de o formato vir errado |
| 4 | **Function / Tool Calling** | Aulas 03 e 05 | No mínimo **2 tools** com nome, descrição e parâmetros bem definidos, executadas no servidor, com o resultado devolvido ao modelo |
| 5 | **RAG _ou_ Agente** (escolha pelo menos um) | Aulas 04 e 05 | Veja a seção abaixo |
| 6 | **Guardrails e uso responsável** | Aulas 03 e 05 | Veja a seção abaixo |
| 7 | **Engenharia básica** | Todas | README que funciona, `.env.example`, `.gitignore` correto, tratamento de erro da API (ex.: chave ausente, rate limit, timeout) |

### 5. RAG ou Agente — como decidir

Na Aula 05, eu te mostrei a escada: quem decide o roteiro? A regra
continua valendo:

- Escolha **RAG** quando **sempre** que o usuário perguntar, o sistema
  precisa buscar numa base de conhecimento antes de responder. O
  roteiro é fixo: buscar → responder. O que eu procuro:
  - Documentos divididos em **chunks**, com **embeddings** gerados e
    guardados (em memória ou em banco vetorial, como o pgvector).
  - Uma etapa de **retrieval** que traz os trechos mais parecidos com a
    pergunta.
  - A resposta gerada **com base nesses trechos**, citando de onde vieram.
  - Um comportamento definido para quando **nada relevante** é
    encontrado (o "não sei").
- Escolha **Agente** quando o caminho **muda de caso para caso**: às
  vezes uma ferramenta basta, às vezes são quatro, e o modelo decide.
  O que eu procuro:
  - Um **loop** (pensar → agir → observar) que repete até o modelo
    decidir que já sabe.
  - **3 ou mais tools**, de tipos diferentes.
  - **Limite de iterações** no código, para o loop não rodar para sempre.
  - **Observabilidade**: você consegue ver, na tela ou no log, qual tool
    foi chamada, com quais argumentos, em que ordem.

Fazer **os dois** (um agente que tem uma tool de RAG, como no
Exercício 04 da Aula 05) não é obrigatório, mas é o desenho mais forte —
e é o que eu recomendo quando o tema comportar.

### 6. Guardrails — o mínimo que eu espero

Escolha e implemente **pelo menos três** destes cinco, e me diga no
README quais foram:

1. **Recusa e "não sei":** o sistema tem uma resposta definida para o
   que está fora do escopo ou sem evidência — e você testou isso.
2. **Conteúdo é dado, não instrução:** o texto vindo de documentos ou
   de ferramentas é tratado como dado. Você testou pelo menos um ataque
   de *prompt injection* (um documento dizendo "ignore as instruções
   anteriores…") e mostrou que ele **não funciona**.
3. **Validação em código:** o que o modelo devolve (argumentos de tool,
   JSON, IDs) é validado **no seu código**, nunca só pedido no prompt.
4. **Limites de custo e de loop:** limite de iterações, tamanho máximo
   de entrada, ou modelo mais barato onde der.
5. **Aprovação humana:** qualquer ação irreversível ou sensível (enviar,
   apagar, gastar, publicar) só acontece depois de um "sim" explícito da
   pessoa.

## ⭐ Bônus

| Bônus | Vale | Como eu verifico |
|---|---|---|
| **Cloud na AWS** (módulo 06) | até **+10 pontos** | Código de infraestrutura no repositório + evidência de que rodou |
| **Streaming** de resposta na interface | +2 | A resposta aparece token a token, não de uma vez |
| **Visão ou PDF** (ler imagem ou documento enviado pelo usuário) | +3 | Um fluxo real de upload que o modelo interpreta |
| **Modo mock** (o projeto roda sem chamar a API, com dados de exemplo) | +2 | Uma variável de ambiente liga o modo; o README explica |
| **Testes automatizados** dos guardrails ou das tools | +3 | Um comando (`npm test`) que roda e passa |
| **RAG + Agente juntos** | +3 | Um agente cujo conjunto de tools inclui a busca no RAG |

Os bônus somam até o teto da nota (100) — eles compensam pontos
perdidos em outros critérios, mas não ultrapassam a nota máxima.
(A rubrica completa está no [módulo 07](../07-entrega-e-avaliacao/README.md).)

## 🗺️ Arquitetura de referência

Todo projeto que eu espero ver segue, no fundo, este desenho:

```
Usuário
   │
   ▼
Interface (web ou terminal)
   │  HTTP
   ▼
Backend ──────────────► Provedor de LLM (a chave mora aqui)
   │   ▲
   │   └── resposta validada (Structured Output)
   │
   ├──► Tools (function calling): busca, cálculo, consulta, ação
   │
   ├──► RAG: chunks + embeddings + retrieval  (e/ou)
   │
   └──► Agente: loop com limite + trace do que foi chamado
```

Quem decide o que fica em cada caixa é você. O importante é que **cada
caixa tenha um motivo** para existir no seu tema.

## ⚙️ Regras técnicas de ouro

Estas não valem pontos — elas **tiram** pontos se você quebrar:

1. **A chave da API nunca vai para o Git.** Nem em commit antigo, nem
   "só por enquanto". Se vazar, considere a chave perdida e gere outra.
2. **Eu preciso conseguir rodar.** O projeto tem que subir com
   `npm install` + `npm run dev` (ou equivalente) e **uma única
   variável obrigatória**: a chave do provedor de LLM. Se precisar de
   mais serviços (um banco, por exemplo), traga um `docker compose` que
   suba tudo.
3. **Sem dependência de conta paga sua.** Eu vou rodar o projeto com a
   **minha** chave. Não use serviço que só funcione com o seu cartão.
4. **Dados fictícios ou públicos.** Nada de dado pessoal real no
   repositório.

**Próximo passo:** [04-anatomia-do-exemplo](../04-anatomia-do-exemplo/README.md)
