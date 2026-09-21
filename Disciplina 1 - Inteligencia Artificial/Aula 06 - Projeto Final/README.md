# 🏁 Aula 06 — Projeto Final de IA

**Formato:** Online
**Modalidade:** em **dupla ou trio** — este projeto é a sua prova da disciplina.

Nas cinco aulas anteriores, eu te dei o roteiro: cada exercício tinha um
enunciado, um resultado esperado e uma tabela para preencher. Hoje isso
acaba. Você e sua equipe vão **escolher um tema**, decidir o que
construir e entregar uma aplicação de IA completa — usando tudo o que a
gente viu: LLM por API, Prompt Engineering, Structured Output, Function
Calling, RAG e/ou Agentes. A parte de **Cloud (AWS) é opcional** e vale
bônus.

Não existe um tema certo. Eu montei um projeto de exemplo — o **AI
Detective**, uma IA que investiga um roubo de diamante lendo depoimentos,
câmeras e registros — só para você ver o que "uma aplicação de IA de
verdade" parece por dentro. O seu tema pode ser qualquer coisa que faça
sentido para você, desde que passe pelos requisitos do módulo 03.

## 📚 Estrutura

| Pasta | Conteúdo |
|-------|----------|
| [00-exemplo-projeto](00-exemplo-projeto/README.md) | O **AI Detective**: o projeto que eu construí para você usar como referência (e, se quiser, como ponto de partida) |
| [01-o-desafio](01-o-desafio/README.md) | O que muda entre um exercício e um produto, três casos reais, e as regras do jogo |
| [02-escolhendo-o-tema](02-escolhendo-o-tema/README.md) | Como escolher um tema que exercita tudo o que você aprendeu — e a proposta de uma página |
| [03-requisitos-do-projeto](03-requisitos-do-projeto/README.md) | A lista do que é obrigatório, do que é bônus, e como eu vou verificar cada item |
| [04-anatomia-do-exemplo](04-anatomia-do-exemplo/README.md) | Um passeio guiado pelo código do AI Detective: onde cada aula aparece, e o que ainda falta ele ter |
| [05-planejamento-e-trabalho-em-equipe](05-planejamento-e-trabalho-em-equipe/README.md) | Divisão de papéis, etapas, Git em equipe, controle de custo da API |
| [06-cloud-opcional-na-aws](06-cloud-opcional-na-aws/README.md) | (Opcional, vale bônus) Colocar o seu projeto no ar na AWS, reaproveitando as Aulas 04 e 05 |
| [07-entrega-e-avaliacao](07-entrega-e-avaliacao/README.md) | O que entregar (o link do repositório), o README do seu projeto e a rubrica |

## ▶️ Como usar

Siga as pastas na ordem numérica, começando pelo módulo 01 — o
`00-exemplo-projeto` você abre quando quiser, é a referência do módulo
04. Diferente das aulas anteriores, **não há relatório em PDF**: a sua
entrega é o repositório do projeto no GitHub.

**Pré-requisitos:**

- Ter concluído as Aulas 01 a 05 — o projeto usa tudo, e eu não vou
  reexplicar conceito aqui.
- Uma **equipe de 2 ou 3 pessoas** já formada antes de começar o
  módulo 02.
- Uma **API key** de um provedor de LLM (a OpenAI, como nas aulas
  anteriores, é o caminho mais simples) e Node.js instalado.
- Conta no GitHub (todo mundo da equipe) e o Git configurado.
- Só para quem for fazer a parte de Cloud: o Learner Lab da AWS Academy
  habilitado, como na Aula 04 e na Aula 05.

## 🎯 Objetivos de aprendizagem

Ao final desta aula, você será capaz de:

- Transformar uma ideia em um **produto de IA** com problema, usuário,
  dados e limites bem definidos — e não só numa demo que funciona uma
  vez.
- Combinar, numa mesma aplicação, **prompt engineering, chamada de API,
  structured output, function calling e RAG ou agente**, decidindo qual
  técnica usar em cada ponto e justificando a escolha.
- Aplicar **guardrails** no seu sistema: o que ele não pode fazer, o que
  ele responde quando não sabe, como ele resiste a conteúdo malicioso.
- Trabalhar em equipe com Git, dividindo responsabilidades e mantendo a
  chave da API fora do repositório.
- Documentar um projeto de forma que **outra pessoa consiga rodá-lo** em
  poucos minutos — que é o critério pelo qual eu vou avaliar o seu.
- *(Opcional)* Colocar o projeto no ar na **AWS**, com infraestrutura
  como código.

## 🏁 Avaliação

O módulo [07-entrega-e-avaliacao](07-entrega-e-avaliacao/README.md)
detalha tudo: o que enviar, o que o README do seu repositório precisa
ter e a rubrica com os pesos. Resumindo: você me envia **o link do
repositório no GitHub** — só isso — e eu avalio clonando, seguindo o seu
README e rodando o projeto.

**Fim da disciplina de Inteligência Artificial.** Na disciplina de
[n8n](<../../Disciplina 2 - n8n/README.md>), você vai pegar essas
capacidades que construiu aqui e **conectá-las** a processos, APIs e
sistemas reais — sem escrever o loop na mão.
