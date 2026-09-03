# ✍️ Aula 02 — Prompt Engineering

**Formato:** Online

Na Aula 01 você viu, na prática, que a forma como você pede algo a um LLM
muda o resultado. Hoje eu te dou o **método** por trás disso: cinco
técnicas que, combinadas, transformam um prompt de "brincadeira de chat"
em algo confiável o suficiente para alimentar um sistema de verdade — o
que você vai construir na Aula 03.

Como turma de programadores, cada técnica também vem com um exemplo real
do seu dia a dia (revisão de código, triagem de issue, debugging,
documentação de API) — e cada um dos três exercícios tem um "🚀 Desafio
dev" opcional, mais completo, além da versão base ligada ao cenário de
atendimento ao cliente.

## 📚 Estrutura

| Pasta | Conteúdo |
|-------|----------|
| [00-resumo-para-slides](00-resumo-para-slides.md) | Conteúdo condensado da aula, pronto para gerar uma apresentação (ex.: NotebookLM) — arquivo local, fora do Git (`.gitignore`) |
| [01-contexto-e-problema-real](01-contexto-e-problema-real/README.md) | Por que prompts confiáveis importam: o que quebra quando um pipeline automatizado depende de um prompt vago |
| [02-conceitos-fundamentais](02-conceitos-fundamentais/README.md) | Anatomia de um prompt, role/persona, contexto, zero-shot x few-shot, decomposição de problemas, structured output |
| [03-demonstracao-guiada](03-demonstracao-guiada/README.md) | Eu mostro ao vivo cada técnica em ação, comparando com e sem ela |
| [04-exercicio-01-role-e-contexto](04-exercicio-01-role-e-contexto/README.md) | Reescrever a resposta ao cliente com personas e contextos diferentes |
| [05-exercicio-02-few-shot](05-exercicio-02-few-shot/README.md) | Classificar mensagens ambíguas com e sem exemplos no prompt |
| [06-exercicio-03-decomposicao-e-structured-output](06-exercicio-03-decomposicao-e-structured-output/README.md) | Prompt combinado: raciocínio em etapas + saída em JSON puro e consistente |
| [07-exercicio-final](07-exercicio-final/README.md) | Relatório final da aula — consolidando todas as observações |

## ▶️ Como usar

Siga as pastas na ordem numérica. Assim como na Aula 01, você não precisa
instalar nada nem criar conta paga — toda a prática desta aula usa
**interfaces web gratuitas** de LLMs (ChatGPT, Claude.ai, Gemini ou
equivalentes). É só a partir da Aula 03 que trago APIs e, possivelmente,
AWS para a jogada.

**Pré-requisito:** ter concluído a Aula 01 (o cenário e os exercícios de
hoje partem diretamente do que você fez lá, principalmente do
[Exercício 02](<../Aula 01 - Fundamentos de IA e LLMs/05-exercicio-02-prompt-simples-x-estruturado/README.md>)).
Conta gratuita em pelo menos **dois** dos serviços abaixo:

- [ChatGPT](https://chatgpt.com/) (OpenAI)
- [Claude.ai](https://claude.ai/) (Anthropic)
- [Gemini](https://gemini.google.com/) (Google)

## 🎯 Objetivos de aprendizagem

Ao final desta aula, você será capaz de:

- Explicar as quatro partes de um prompt (instrução, contexto, dado de
  entrada, indicador de formato) e identificá-las em qualquer prompt.
- Usar role/persona e contexto para controlar tom e conteúdo da resposta.
- Usar few-shot para ancorar formato e critério de decisão em casos
  ambíguos.
- Usar decomposição de problemas para melhorar respostas que exigem
  raciocínio em várias etapas.
- Escrever prompts que produzem structured output (JSON) válido e
  consistente entre execuções — pronto para ser consumido por um sistema.

## 🏁 Avaliação

O módulo [07-exercicio-final](07-exercicio-final/README.md) fecha a aula
consolidando as observações dos três exercícios anteriores. Ao final dele,
você me envia um **relatório em PDF** com prints das evidências, os
prompts que você usou e as respostas às perguntas de reflexão — é esse
PDF que eu uso para te avaliar e lançar sua nota. Os detalhes de entrega e
a rubrica estão no próprio módulo.

**Próxima aula:** Aula 03 — IA dentro de aplicações *(em breve)*.
