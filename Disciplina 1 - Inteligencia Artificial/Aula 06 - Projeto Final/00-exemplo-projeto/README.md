# 🕵️ 00 — Projeto de exemplo: AI Detective

Esta pasta guarda o projeto que eu construí para você usar como **referência** no seu projeto final.

## O que é

O [**AI Detective**](ai-detective/README.md) é uma aplicação em que um agente de IA investiga um
roubo fictício (**Caso #001 — O Roubo do Diamante Aurora**): ele busca nas evidências, cruza
depoimentos, registros e fotos de câmera, anota o que descobre e propõe um culpado — que **você**
aprova ou rejeita.

Ele junta, numa aplicação só, tudo o que a gente viu nas cinco aulas:

| Aula | O que aparece no projeto |
|---|---|
| 01 — LLMs | Escolha de modelos e limites |
| 02 — Prompt Engineering | System prompt com papel, método e regras |
| 03 — IA em aplicações | API só no servidor, streaming, function calling, structured output, visão e PDF |
| 04 — RAG e Embeddings | Chunking, embeddings e busca semântica no Postgres (pgvector) |
| 05 — Agentes | Agent loop, memória, guardrails, aprovação humana e observabilidade |

## Como usar

- **Estudar:** leia o [módulo 04 — Anatomia do exemplo](../04-anatomia-do-exemplo/README.md), rode o
  projeto e faça os experimentos da seção 7 do README dele.
- **Como ponto de partida:** copie a pasta `ai-detective/` para o seu repositório e troque o conteúdo
  de `case/` pelo tema da sua equipe (o README explica passo a passo na seção 8). Você também pode
  começar do zero — o desenho da arquitetura é o mesmo.

## Como rodar

```bash
cd ai-detective
npm install
cp .env.example .env     # cole a sua OPENAI_API_KEY
npm run db:up            # Postgres + pgvector (precisa do Docker)
npm run setup            # gera as evidências e indexa no banco (RAG)
npm run dev              # http://localhost:3000
```

Todos os detalhes — arquitetura, ferramentas, guardrails, AWS com Terraform, problemas comuns — estão
no [README do projeto](ai-detective/README.md).
