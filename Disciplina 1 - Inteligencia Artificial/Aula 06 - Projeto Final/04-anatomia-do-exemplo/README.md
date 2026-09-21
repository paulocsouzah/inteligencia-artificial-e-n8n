# 4. Anatomia do exemplo — o AI Detective por dentro

Neste módulo eu abro o [AI Detective](../00-exemplo-projeto/README.md) com você. A ideia não é você
copiar o projeto — é você **enxergar onde cada aula aparece dentro de uma aplicação de verdade**,
para saber por onde começar o seu. Você pode usá-lo como ponto de partida (trocando o tema) ou
começar do zero; nos dois casos, o desenho é o mesmo.

---

## 🕵️ O que ele faz

O **Caso #001 — O Roubo do Diamante Aurora**: um diamante some de um museu, quatro pessoas estavam no
local e o museu tem depoimentos, registros de crachá e de segurança, fotos de câmera, um laudo da
perícia e um protocolo de segurança. Você conversa com um "Investigador IA" que **só pode afirmar o
que as evidências mostram**. Ele busca, lê, cruza, anota o que descobre e, quando tem base, propõe um
culpado. Mas a acusação só vale depois que **você** clica em Aprovar. Enquanto isso, um painel mostra
cada passo do agente ao vivo.

Nada no caso traz a resposta pronta: contradições e conclusões são trabalho do agente. Se o dado já
trouxesse "culpado: Maria", a IA só repetiria o gabarito, e não haveria nada para investigar.

Como rodar (os detalhes estão no README do projeto):

```bash
cd 00-exemplo-projeto/ai-detective
npm install
cp .env.example .env     # cole a sua OPENAI_API_KEY
npm run db:up            # Postgres + pgvector, em Docker
npm run setup            # gera as evidências e indexa no banco (RAG)
npm run dev              # http://localhost:3000
```

## 🗺️ O caminho de uma pergunta

Quando você escreve "quem pode usar o código de override?", isto acontece:

```
Navegador (components/chat)
   │  POST /api/chat  (sessionId + histórico)
   ▼
app/api/chat/route.ts        ← valida a entrada e abre o stream SSE
   │
   ▼
lib/agent/loop.ts            ← o agent loop: chama o modelo, executa as ferramentas,
   │                            devolve o resultado, repete (máximo de 10 rodadas)
   ├──► case/prompt.ts             o system prompt do tema
   ├──► lib/agent/guardrails.ts    regras de segurança + validação em código
   ├──► lib/agent/memory.ts        o caderno de notas (memória)
   └──► case/tools.ts              as 6 ferramentas
            └──► lib/rag/retrieve.ts   busca semântica: embedding da pergunta → pgvector
   │
   ▼  eventos SSE: step · token · report · done
Navegador (chat em streaming + rastreio do agente + cartão de aprovação)
```

Repare em duas decisões de arquitetura que eu tomei de propósito:

- **A pasta `case/` é o tema; a pasta `lib/` é o motor.** O loop, o RAG e os guardrails não sabem que
  o assunto é um detetive. Para fazer o seu projeto, você troca o `case/`.
- **O RAG é uma ferramenta do agente.** O agente decide *quando* buscar. Num RAG "puro", a busca
  acontece sempre, antes de toda resposta; aqui ela é uma das ferramentas, ao lado de ler um
  documento, consultar a linha do tempo e anotar. Eu chamo isso de agente com RAG.

## 🧩 Onde cada aula aparece

| Aula | O que aparece no projeto | Onde olhar |
|---|---|---|
| **01 — LLMs** | Escolha de modelos e os limites de contexto, tudo em um lugar só | `lib/config.ts` |
| **02 — Prompt Engineering** | System prompt com papel, ferramentas, método de trabalho e regras | `case/prompt.ts` |
| **03 — IA em aplicações** | Chamada de API só no servidor, **streaming**, **function calling**, **structured output**, **visão** e **PDF** | `lib/openai.ts`, `lib/sse.ts`, `case/tools.ts`, `lib/rag/vision.ts`, `lib/rag/pdf.ts` |
| **04 — RAG e Embeddings** | Chunking, embeddings, pgvector, busca semântica e ingestão | `lib/rag/*`, `lib/db.ts`, `scripts/ingest.ts` |
| **05 — Agentes** | O loop, memória, guardrails, aprovação humana e observabilidade | `lib/agent/*`, `components/trace/AgentTrace.tsx` |

## ✅ O projeto contra os requisitos do módulo 03

| Requisito | No exemplo |
|---|---|
| 1. LLM por API, só no backend | ✅ A chave é lida só em `lib/openai.ts` |
| 2. Prompt Engineering | ✅ `case/prompt.ts`: papel, ferramentas, método (plano → investigar → anotar → concluir), regras e recusa ("não é possível concluir") |
| 3. Structured Output | ✅ A tool `proposeAccusation` devolve JSON com schema, **validado em código** (`validateAccusation`): o suspeito e as evidências precisam existir |
| 4. Function Calling | ✅ 6 tools em `case/tools.ts`, com descrição, parâmetros validados e execução no servidor |
| 5. RAG **e** Agente | ✅ Os dois. RAG em `lib/rag/`; agente em `lib/agent/loop.ts`, com 6 tools, limite de rodadas e rastreio de cada passo |
| 6. Guardrails (mínimo 3 de 5) | ✅ Os cinco: recusa e "não sei" (`minScore` na busca), conteúdo como dado (`wrapAsData` + `detectInjection`), validação em código, limites de custo e de loop, **aprovação humana** |
| 7. Engenharia básica | ✅ README, `.env.example`, `.gitignore`, erros amigáveis (`lib/errors.ts`), Docker |
| Bônus | ✅ Streaming · ✅ Visão e PDF · ✅ Testes (`npm test`) · ✅ RAG + Agente juntos · ✅ Cloud (`terraform/` pronto) · ❌ Modo mock (fica para você) |

O exemplo passa por tudo de propósito, para você ver as peças funcionando juntas. O seu projeto
**não precisa** ter tudo isso: precisa cumprir o mínimo do módulo 03 e ter uma boa razão para cada
escolha.

## 🔍 O que ele ainda deixa para você

Eu deixei limitações à mostra (a seção 12 do README do projeto lista todas). Elas são ótimos pontos
de partida para o seu projeto ir além do meu:

- O `minScore` da busca (0.3) foi **medido para este corpus**: o valor certo depende dos seus
  documentos. No seu projeto, meça com perguntas dentro e fora do assunto.
- A busca é só por vetor. Uma busca **híbrida** (vetor + palavra-chave) ajudaria com códigos exatos,
  como `M.OLIVEIRA-4471`.
- **Não há login.** Toda rota `POST` é um ponto de gasto da sua chave.
- **Não há avaliação automática** da qualidade das respostas: um conjunto de perguntas com respostas
  esperadas, rodado a cada mudança, seria o próximo passo.
- **Não há modo mock**: um bônus (+2) que você pode implementar.

## 🔁 Como sair do detetive e chegar no seu tema

Tudo o que descreve o **caso** vive numa pasta só, `case/`. O resto é infraestrutura que não conhece o
tema. Para montar o seu, o roteiro é:

1. **Troque `case/evidence.ts`** pelos documentos do seu domínio: eles são a base de conhecimento do RAG.
2. **Reescreva `case/prompt.ts`**: novo papel, novo método, novas regras.
3. **Redefina `case/tools.ts`**: as ferramentas que o seu agente precisa. Mantenha a busca (RAG) e o
   caderno de notas.
4. **Ajuste `case/suspects.ts`, `case/timeline.ts` e `case/info.ts`** (dados estruturados e perguntas
   de exemplo), e a interface em `components/`.
5. **Rode `npm run ingest -- --force`** e teste com as 5 perguntas do módulo 02.

## 🧪 Exercício

1. Rode o AI Detective e faça três perguntas diferentes. Para cada uma, abra o **JSON** dos passos do
   painel de rastreio e anote **quais ferramentas ele chamou e em que ordem**. A ordem mudou de uma
   pergunta para outra? O que isso confirma da Aula 05?
2. Pergunte "quem tem permissão para o código de emergência das vitrines?". O documento diz *override*,
   não *emergência*. Como o agente encontrou a resposta? Qual parte do projeto faz isso?
3. Envie `evidence/samples/bilhete-anonimo.pdf` e peça para o agente analisá-lo. O que apareceu no
   rastreio? Agora comente a regra de segurança em `GUARDRAIL_RULES` (`lib/agent/guardrails.ts`) e
   repita. O que mudou?
4. Ponha `MAX_AGENT_STEPS = 2` em `lib/config.ts` e peça a análise do caso. O que acontece? E se
   remover o limite — qual é o risco (pense em custo)?
5. Rejeite uma acusação proposta. O agente continua investigando? Onde, no código, está a garantia de
   que a acusação **não** foi registrada antes do seu clique?

**Próximo passo:** [05-planejamento-e-trabalho-em-equipe](../05-planejamento-e-trabalho-em-equipe/README.md)
