# 2. Escolhendo o tema

A escolha do tema é a decisão mais importante do projeto inteiro — e a
que a maioria das equipes toma em cinco minutos, sem pensar. Um tema
ruim faz o projeto virar "um chatbot que responde qualquer coisa"; um
tema bom **puxa** as técnicas certas sem você precisar forçar.

Eu escolhi **detetive** para o meu exemplo por um motivo prático: um
caso criminal tem documentos (depoimentos, registros), tem
contradições que precisam ser cruzadas, exige que a IA **não invente**
fatos, e termina numa conclusão estruturada. Ou seja, o tema já pede
function calling, leitura de documentos, guardrails e um relatório com
formato fixo. Foi de propósito.

---

## ✅ O teste das quatro perguntas

Antes de fechar o tema, passe ele por estas quatro perguntas. Quanto
mais "sim", melhor:

| Pergunta | Se a resposta for "sim", o tema pede... |
|---|---|
| **1. Existe um conjunto de documentos ou dados próprios que o modelo não conhece?** (regulamento, manual, casos, catálogo, histórico) | **RAG** — o modelo precisa buscar antes de responder |
| **2. O caminho para chegar à resposta muda de um caso para outro?** (às vezes basta uma fonte, às vezes precisa cruzar três) | **Agente** — o modelo decide as ferramentas e a ordem |
| **3. Alguma parte da resposta precisa ter formato fixo?** (uma nota, uma classificação, um relatório, um JSON que outra parte do código consome) | **Structured Output** — o formato é garantido por schema |
| **4. Uma resposta errada tem consequência, mas controlável?** (dá para pedir aprovação, recusar, avisar limitação) | **Guardrails** — e aprovação humana, se for o caso |

Se a resposta da pergunta 1 e da 2 for "não" ao mesmo tempo, o seu tema
provavelmente não precisa de RAG nem de agente — e aí ele não serve
para este projeto. Troque de tema.

## 💡 Ideias para você se inspirar

Ideias soltas, cada uma ligada a um produto real para você ver que não
estou inventando problema. **Não copie**: use como ponto de partida e
mude o domínio, os dados e as regras.

| Tema | Parecido com (produto real) | O que pede |
|---|---|---|
| **Tutor que não entrega a resposta** — ensina um conteúdo (programação, matemática, inglês) guiando quem estuda com perguntas | Khanmigo (Khan Academy) e o modo de conversa do Duolingo Max, ambos construídos sobre GPT-4 em 2023 | Prompt engineering forte (regras de "nunca dê a resposta direta"), guardrails |
| **Assistente de regulamento** — responde dúvidas sobre um conjunto de normas (regimento da faculdade, política de RH, manual de um produto) e **cita o trecho** | Assistentes internos de bancos e consultorias sobre a própria base de documentos, como o do Morgan Stanley | RAG com citação de fonte, "não sei" quando não achar |
| **Triagem de suporte** — lê a mensagem do cliente, classifica, extrai os dados e encaminha | O atendimento automatizado de empresas como a Klarna | Structured Output, function calling, aprovação humana em casos sensíveis |
| **Investigador de incidentes** — investiga um erro cruzando logs, código e documentação | Agentes de engenharia de software; foi o tema da Aula 05 | Agente com loop, várias tools, guardrails |
| **Detetive / mistério** — o meu exemplo | Jogos de investigação com IA | Tools, leitura de documentos e imagens, relatório estruturado |
| **Analisador de contratos ou editais** — lê um PDF, extrai cláusulas, prazos e riscos | Harvey, assistente de IA para advogados, adotado pelo escritório Allen & Overy em 2023 | PDF + Structured Output + RAG |
| **Planejador com restrições** — viagem, treino, cardápio, estudos — que cruza preferências do usuário com uma base de dados real | Aplicativos de planejamento de viagens com IA | Agente (busca depende do pedido), Structured Output (o plano) |
| **Mestre de jogo de RPG** — conduz uma história, consulta as regras e o mundo (lore) para não se contradizer | AI Dungeon, jogo de aventura em texto conduzido por IA | RAG sobre o "livro de regras", memória, guardrails de coerência |

## 🚫 O que eu não quero que você escolha

- **"Um chatbot que responde qualquer pergunta".** Sem domínio, sem
  dados e sem limite, não tem RAG, não tem agente e não tem guardrail.
  É a demo mais genérica que existe.
- **Diagnóstico médico, aconselhamento jurídico ou financeiro "de
  verdade", com decisão automática.** O risco é real e o meu curso não
  te prepara para assumir essa responsabilidade. Se o seu tema for
  de saúde, direito ou finanças, ele precisa ser **informativo**, com
  aviso explícito de que não substitui um profissional.
- **Dados pessoais reais** (de clientes, de pacientes, de alunos).
  Use dados fictícios ou públicos.
- **Um tema que só funciona se você tiver acesso a um sistema fechado**
  (o banco de dados da sua empresa, uma API paga). Eu preciso conseguir
  rodar o seu projeto.

## 📝 A proposta de uma página

Antes de escrever a primeira linha de código, escrevam em equipe uma
proposta de **uma página** — pode ser o primeiro commit do repositório,
num arquivo `PROPOSTA.md`. Ela evita que a equipe descubra no meio do
caminho que cada pessoa imaginou um projeto diferente.

```markdown
# Nome do projeto

**Equipe:** nome1, nome2 (, nome3)

## Problema
Quem é o usuário e qual dor ele tem? (2-3 linhas)

## Solução
O que o sistema faz, do ponto de vista de quem usa? (3-5 linhas)

## Dados e conhecimento
De onde vêm os documentos/dados do sistema? (fictícios, públicos,
gerados por vocês) Quantos documentos, mais ou menos?

## Como cada técnica entra
- Prompt engineering: ...
- Structured output: onde e com que formato?
- Function calling: quais tools?
- RAG e/ou Agente: qual dos dois e por quê?

## Riscos e limites
O que pode dar errado? O que o sistema se recusa a fazer?

## Fora do escopo
O que vocês decidiram NÃO fazer (importante para caber no prazo).

## Cloud (opcional)
Vão fazer a parte de AWS? Se sim, o que vai para a nuvem?
```

Você não precisa da minha aprovação para seguir com a proposta, mas se
tiver dúvida se o tema atende aos requisitos do [módulo
03](../03-requisitos-do-projeto/README.md), **me pergunta antes de
codar** — é bem mais barato do que trocar de tema na metade.

## 🧪 Exercício

Antes de seguir, fechem em equipe:

1. Passem o tema de vocês pelo teste das quatro perguntas e anotem a
   resposta de cada uma. Qual delas foi "não"? O que isso diz sobre o
   que o projeto **não** vai precisar?
2. Escrevam a proposta de uma página e coloquem no repositório como
   `PROPOSTA.md`.
3. Listem, do jeito mais concreto que conseguirem, **5 perguntas ou
   pedidos** que um usuário real faria ao sistema — e a resposta ideal
   para cada um. Essa lista vai virar o seu conjunto de testes no
   módulo 05.

**Próximo passo:** [03-requisitos-do-projeto](../03-requisitos-do-projeto/README.md)
