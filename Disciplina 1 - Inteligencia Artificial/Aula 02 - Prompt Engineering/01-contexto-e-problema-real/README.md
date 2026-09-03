# 1. Contexto e problema real

Antes de eu te apresentar as técnicas de hoje, vamos retomar um episódio
que você já viveu na própria pele, na aula passada.

---

## 🔁 O que você já descobriu, sem saber o nome disso

No [Exercício 02 da Aula 01](<../../Aula 01 - Fundamentos de IA e LLMs/05-exercicio-02-prompt-simples-x-estruturado/README.md>),
você rodou a **mesma mensagem de cliente** em dois prompts diferentes — um
vago, outro estruturado — e preencheu uma tabela comparando os resultados.
Muito provavelmente você observou algo assim:

- O prompt vago devolveu uma resposta **em prosa**, de tamanho e formato
  diferente a cada execução.
- O prompt estruturado devolveu **sempre os mesmos campos**, no mesmo
  formato, execução após execução.

Você já viu o efeito. Hoje eu te dou o **nome** e o **método** por trás
dele: isso é **Prompt Engineering** — a prática de projetar deliberadamente
a entrada que você dá a um LLM para obter, de forma confiável, o resultado
que você precisa.

## 📉 O problema real que isso resolve

Imagine que a triagem de mensagens de cliente do nosso cenário não é mais
feita por você, lendo a resposta na tela — ela é feita por um **sistema**,
que espera receber do modelo um texto no formato:

```
Categoria: Financeiro
Prioridade: Alta
Sentimento: Negativo
```

...e usa isso para decidir automaticamente para qual fila encaminhar o
caso. Se o modelo, numa das execuções, responder algo como *"Essa mensagem
parece ser uma reclamação financeira bem urgente"*, o sistema **não
consegue interpretar aquilo** — não há um campo `Categoria:` para ler, e o
pipeline quebra ou encaminha o caso para o lugar errado.

Esse é o problema real por trás da técnica de hoje: **um LLM não é
determinístico por padrão.** Sem instrução explícita, ele pode variar
formato, nível de detalhe e até o idioma da resposta a cada execução. Em
uma conversa de chat isso é só um estilo diferente; dentro de um sistema
automatizado, isso é uma **falha de integração**.

## 🌍 Isso já acontece de verdade

- **Times de suporte** que usam IA para pré-classificar tickets investem
  boa parte do trabalho de engenharia não no modelo em si, mas em garantir
  que a saída do modelo **sempre** venha no formato que o sistema de
  tickets espera.
- **Times de produto** que usam IA para gerar descrições de produto em
  massa (e-commerces, marketplaces) escrevem prompts com exemplos e regras
  bem explícitas — sem isso, metade das descrições sai fora do padrão da
  loja (tamanho, tom, campos obrigatórios) e precisa de revisão manual,
  o que anula o ganho de produtividade.
- **Equipes jurídicas e financeiras** que usam IA para extrair dados de
  contratos (valor, prazo, partes envolvidas) dependem inteiramente de o
  modelo devolver esses dados em um formato fixo e parseável — um prompt
  malfeito aqui significa dado errado entrando em um sistema financeiro.

Em todos os casos, a diferença entre "brincar com IA" e "colocar IA em
produção" é, na prática, **Prompt Engineering**.

## 🧭 Para onde isso vai

Vamos estender a tabela que fechou a Aula 01:

| Aula | O que construímos sobre o cenário |
|------|----------------------------------------|
| Aula 1 | Entender o "cérebro" (LLM) que vamos usar |
| Aula 2 (esta) | Escrever prompts que classificam a mensagem de forma **confiável e no formato certo** |
| Aula 3 | Colocar isso dentro de uma aplicação de verdade, via API — consumindo exatamente o formato que você vai treinar hoje |
| Aula 4 | Dar ao modelo acesso a documentos reais (manual, FAQ, políticas) via RAG |
| Aula 5 | Transformar isso num agente que consulta sistemas e age sozinho |
| n8n | Conectar tudo isso a WhatsApp, CRM, e-mail e planilhas, sem código |

Repare: tudo o que você construir hoje **não é exercício isolado** — o
formato de saída que você vai desenhar no Exercício 03 desta aula é
literalmente o que um código de verdade vai ler na Aula 03.

## 🧪 Exercício

Antes de seguir para as técnicas, volte à tabela comparativa que você
preencheu no [Exercício 02 da Aula 01](<../../Aula 01 - Fundamentos de IA e LLMs/05-exercicio-02-prompt-simples-x-estruturado/README.md>)
e responda por escrito (você vai reaproveitar isso no relatório final
desta aula):

1. Olhando sua própria tabela: o que, **especificamente**, no texto do
   prompt estruturado, foi responsável por deixar a resposta mais
   consistente? (Pense: foi dar um formato explícito? Foi restringir as
   opções possíveis? Foi outra coisa?)
2. Se você tivesse que explicar para um colega, em uma frase, por que um
   sistema automatizado **não pode** depender de um prompt vago, o que
   você diria?
3. Pense em uma tarefa do seu dia a dia em que a **forma exata** da
   resposta importa tanto quanto o conteúdo (ex.: preencher um campo de
   sistema, gerar uma linha de planilha). Isso vai te ajudar a enxergar o
   valor prático da aula de hoje.

**Próximo passo:** [02-conceitos-fundamentais](../02-conceitos-fundamentais/README.md)
