# 🤖 Aula 01 — Fundamentos de IA e LLMs

**Formato:** Online

Esta é a primeira aula da nossa disciplina de Inteligência Artificial.
Antes de eu te ensinar a escrever um prompt "profissional" ou a integrar
uma API (isso vem nas próximas aulas), quero que você entenda **o que
realmente acontece** por trás de um LLM — o que ele é, o que ele não é, e
onde ele quebra.

## 📚 Estrutura

| Pasta | Conteúdo |
|-------|----------|
| [00-resumo-para-slides](00-resumo-para-slides.md) | Conteúdo condensado da aula, pronto para gerar uma apresentação (ex.: NotebookLM) — arquivo local, fora do Git (`.gitignore`) |
| [01-contexto-e-problema-real](01-contexto-e-problema-real/README.md) | Por que este módulo existe: o problema do atendimento manual |
| [02-conceitos-fundamentais](02-conceitos-fundamentais/README.md) | IA tradicional x generativa, ML x DL, LLMs, tokens, context window, temperature, multimodalidade, alucinações, modelos fechados x open source |
| [03-demonstracao-guiada](03-demonstracao-guiada/README.md) | Eu mostro ao vivo: tokens, context window, temperature e alucinação na prática |
| [04-exercicio-01-comparando-modelos](04-exercicio-01-comparando-modelos/README.md) | Rodar o mesmo prompt em modelos diferentes e comparar |
| [05-exercicio-02-prompt-simples-x-estruturado](05-exercicio-02-prompt-simples-x-estruturado/README.md) | Comparar um prompt vago com um prompt estruturado |
| [06-exercicio-03-temperature-e-alucinacao](06-exercicio-03-temperature-e-alucinacao/README.md) | Explorar temperature e provocar (e detectar) uma alucinação |
| [07-exercicio-final](07-exercicio-final/README.md) | Relatório final da aula — consolidando todas as observações |

## ▶️ Como usar

Siga as pastas na ordem numérica. Você não precisa instalar nada nem criar
conta paga — toda a prática desta aula usa **interfaces web gratuitas** de
LLMs (ChatGPT, Claude.ai, Gemini ou equivalentes). É só a partir da Aula 03
que eu trago APIs e, possivelmente, AWS para a jogada.

**Pré-requisito:** nenhum conhecimento prévio de IA. Só uma conta gratuita
em pelo menos **dois** dos serviços abaixo (crie os que ainda não tiver
antes da aula):

- [ChatGPT](https://chatgpt.com/) (OpenAI)
- [Claude.ai](https://claude.ai/) (Anthropic)
- [Gemini](https://gemini.google.com/) (Google)

## 🎯 Objetivos de aprendizagem

Ao final desta aula, você será capaz de:

- Explicar a diferença entre IA tradicional e IA generativa, e entre
  Machine Learning e Deep Learning.
- Explicar o que é um LLM, um token, uma context window e o parâmetro
  temperature — e prever, na prática, o efeito de cada um.
- Reconhecer uma alucinação e explicar por que ela acontece.
- Comparar criticamente o comportamento de diferentes modelos e diferentes
  formatos de prompt para a mesma tarefa.
- Distinguir modelos fechados de modelos open source e justificar quando
  cada um faz sentido.

## 🏁 Avaliação

O módulo [07-exercicio-final](07-exercicio-final/README.md) fecha a aula
consolidando as observações dos três exercícios anteriores. Ao final dele,
você me envia um **relatório em PDF** com prints das evidências, os
prompts que você usou e as respostas às perguntas de reflexão — é esse
PDF que eu uso para te avaliar e lançar sua nota. Os detalhes de entrega e
a rubrica estão no próprio módulo.

**Próxima aula:** Aula 02 — Prompt Engineering *(em breve)*.
