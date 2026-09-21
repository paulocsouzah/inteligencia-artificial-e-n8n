# 🕹️ Aula 05 — AI Agents

**Formato:** Presencial

Nas últimas duas aulas, **você** decidiu o que o modelo faz: na Aula 03,
você forçou a chamada de `triar_mensagem`; na Aula 04, você mandou buscar
no RAG sempre, antes de toda resposta. Hoje essa decisão sai da sua mão e
vai para o modelo — e a gente vira a câmera do cenário integrador: até
aqui, a IA que vocês construíram atendia o **cliente** da loja. Hoje ela
trabalha para **vocês**, o time que mantém essa loja no ar. Vocês vão
construir um **AI Software Engineer** — um agente que investiga
incidentes reais (erro 500, lentidão, vulnerabilidade, dado inconsistente)
no mesmo sistema `app-aula03`/`app-aula04`, decidindo sozinho quais
ferramentas usar, em que ordem, até ter uma causa raiz.

## 📚 Estrutura

| Pasta | Conteúdo |
|-------|----------|
| [01-contexto-e-problema-real](01-contexto-e-problema-real/README.md) | Por que investigar incidente manualmente não escala — mesmo com toda a IA das Aulas 03 e 04 |
| [02-conceitos-fundamentais](02-conceitos-fundamentais/README.md) | A escada: LLM simples → Tool Calling → Workflow determinístico → AI Agent → Agent Loop |
| [03-memoria-planejamento-e-guardrails](03-memoria-planejamento-e-guardrails/README.md) | Memória, Planejamento, Guardrails, Human-in-the-loop, Observabilidade — e os riscos reais de um agente |
| [04-demonstracao-guiada](04-demonstracao-guiada/README.md) | Eu mostro ao vivo: o mesmo bug resolvido 4 formas, o loop rodando, e um ataque de prompt injection sendo bloqueado |
| [05-exercicio-01-primeira-tool-e-decisao](05-exercicio-01-primeira-tool-e-decisao/README.md) | 🟢 Básico — uma tool só; o modelo decide sozinho quando chamá-la |
| [06-exercicio-02-workflow-vs-agent](06-exercicio-02-workflow-vs-agent/README.md) | 🟡 Médio — a mesma investigação, como pipeline fixo x como agente, cabeça a cabeça |
| [07-exercicio-03-multiplas-tools-e-loop](07-exercicio-03-multiplas-tools-e-loop/README.md) | 🟡 Médio — três tools, agent loop completo |
| [08-exercicio-04-ai-software-engineer-completo](08-exercicio-04-ai-software-engineer-completo/README.md) | 🟠 Complexo — **o projeto da aula:** o AI Software Engineer completo, com memória, planejamento, guardrails e aprovação humana |
| [09-exercicio-05-agente-na-aws](09-exercicio-05-agente-na-aws/README.md) | 🔴 Avançado (opcional) — o mesmo agente rodando na infraestrutura AWS da Aula 04 |
| [10-exercicio-final](10-exercicio-final/README.md) | Relatório final da aula + entrega do código-fonte |

## ▶️ Como usar

Siga as pastas na ordem numérica. Você pode reaproveitar o mesmo projeto
Node.js das aulas anteriores — só precisa continuar com o pacote `openai`
instalado.

**Pré-requisitos:**

- Ter concluído a Aula 04 (os exercícios de hoje reaproveitam diretamente
  o pipeline de RAG — chunking, embedding, retrieval — como uma das
  ferramentas do agente).
- Nenhuma instalação nova é necessária para os Exercícios 01-04.
- O Exercício 05 (opcional) reaproveita Terraform, Docker e AWS Academy,
  exatamente como o Exercício 04 da Aula 04 — só precisa habilitar o
  Learner Lab quando for fazer esse exercício especificamente.

## 🎯 Objetivos de aprendizagem

Ao final desta aula, você será capaz de:

- Explicar, com uma frase cada, a diferença entre **LLM simples**, **LLM +
  Tool Calling**, **Workflow determinístico** e **AI Agent** — e apontar
  qual dessas quatro coisas um código específico implementa.
- Implementar o **agent loop** (Reason → Act → Observe → repete) até o
  modelo ter informação suficiente para responder.
- Justificar, com um experimento (não só de memória), por que um agente
  vence um workflow fixo em tarefas com caminhos variáveis — e por que o
  workflow ainda vence em tarefas totalmente previsíveis.
- Manter **memória de curto prazo** e aplicar **planejamento** numa
  tarefa de investigação com múltiplas etapas dependentes.
- Aplicar os quatro **guardrails** de um agente de produção, incluir uma
  etapa de **aprovação humana** antes de qualquer ação irreversível, e
  descrever como instrumentar **observabilidade** (log de cada tool call,
  custo, tempo) sobre o loop.
- Reconhecer e demonstrar, na prática, um ataque de **prompt injection**
  contra um agente — e por que os guardrails de escopo o neutralizam.

## 🏁 Avaliação

O módulo [10-exercicio-final](10-exercicio-final/README.md) fecha a aula
consolidando os exercícios anteriores. A entrega inclui **código-fonte**,
além do relatório em PDF — os detalhes de entrega e a rubrica estão no
próprio módulo.

**Próxima aula:** [Aula 06 — Projeto Final de IA](<../Aula 06 - Projeto Final/README.md>).
