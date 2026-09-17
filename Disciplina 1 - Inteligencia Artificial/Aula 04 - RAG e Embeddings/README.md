# 🔎 Aula 04 — RAG + Embeddings

**Formato:** Online

Na Aula 03, seu código aprendeu a chamar um LLM sozinho. Hoje ele aprende
algo mais: **encontrar sozinho** o contexto certo, entre muitos
documentos, antes de responder — em vez de você escrever o contexto à
mão (Aula 02) ou tentar colar tudo no prompt (impossível, na prática).
Os exercícios também sobem de nível ao longo da aula, do básico até
hospedar o RAG numa infraestrutura AWS de verdade — reaproveitando o que
você já construiu no curso de DevOps.

## 📚 Estrutura

| Pasta | Conteúdo |
|-------|----------|
| [01-contexto-e-problema-real](01-contexto-e-problema-real/README.md) | Por que colar todo o documento no prompt não escala, e o que RAG resolve |
| [02-conceitos-fundamentais](02-conceitos-fundamentais/README.md) | Embeddings, similaridade de cosseno, chunking, vector database, retrieval, RAG |
| [03-demonstracao-guiada](03-demonstracao-guiada/README.md) | Eu mostro ao vivo: gerar embedding, comparar similaridade, RAG do zero, com x sem RAG |
| [04-exercicio-01-embeddings-e-similaridade](04-exercicio-01-embeddings-e-similaridade/README.md) | 🟢 Básico — gerar embeddings e comparar similaridade entre frases |
| [05-exercicio-02-retrieval](05-exercicio-02-retrieval/README.md) | 🟡 Médio — implementar busca sobre uma base de FAQ |
| [06-exercicio-03-rag-completo](06-exercicio-03-rag-completo/README.md) | 🟠 Complexo — chunking de um documento + RAG completo no cenário integrador |
| [07-exercicio-04-rag-com-infra-aws](07-exercicio-04-rag-com-infra-aws/README.md) | 🔴 Avançado (opcional) — subir VPC+EC2+RDS (pgvector) com Terraform e hospedar o chatbot RAG na AWS |
| [08-exercicio-final](08-exercicio-final/README.md) | Relatório final da aula + entrega do código-fonte |

## ▶️ Como usar

Siga as pastas na ordem numérica. Você pode reaproveitar o mesmo projeto
Node.js da Aula 03 — só precisa continuar com o pacote `openai`
instalado.

**Pré-requisitos:**

- Ter concluído a Aula 03 (o projeto, o `.env` com a API key e o
  cenário integrador são reaproveitados diretamente).
- Nenhuma instalação nova é necessária para os Exercícios 01-03.
- O Exercício 04 (opcional) reaproveita Terraform, Docker e AWS Academy
  do curso de DevOps — só precisa habilitar o Learner Lab quando for
  fazer esse exercício especificamente.

## 🎯 Objetivos de aprendizagem

Ao final desta aula, você será capaz de:

- Explicar o que é um embedding e por que textos com significado
  parecido geram vetores parecidos.
- Calcular e interpretar similaridade de cosseno entre embeddings.
- Dividir um documento em chunks de forma sensata.
- Implementar um pipeline de retrieval do zero.
- Montar um RAG completo: retrieval + geração, usando o que já aprendeu
  desde a Aula 03.
- Explicar a diferença entre um vector store em memória e um vector
  database de produção.

## 🏁 Avaliação

O módulo [08-exercicio-final](08-exercicio-final/README.md) fecha a aula
consolidando os exercícios anteriores. A entrega inclui **código-fonte**,
além do relatório em PDF — os detalhes de entrega e a rubrica estão no
próprio módulo.

**Próxima aula:** [Aula 05 — AI Agents](<../Aula 05 - AI Agents/README.md>).
