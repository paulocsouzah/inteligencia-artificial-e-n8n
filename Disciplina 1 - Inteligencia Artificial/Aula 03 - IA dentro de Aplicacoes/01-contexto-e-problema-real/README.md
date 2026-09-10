# 1. Contexto e problema real

Nas duas últimas aulas, você colou prompt numa interface de chat, leu a
resposta na tela e decidiu o que fazer com ela. Hoje isso muda: o prompt
sai do chat e vai para dentro de um **programa**.

---

## 🖱️ O limite do "copiar e colar"

Pensa no cenário que a gente vem construindo desde a Aula 01: uma empresa
recebe centenas de mensagens de cliente por dia e precisa classificá-las.
Nas Aulas 01 e 02, você resolveu isso **manualmente** — copiou a mensagem,
colou no ChatGPT/Claude.ai, leu a resposta, comparou com outra execução.

Isso funciona para aprender e para prototipar. Mas repare no que isso
**exige**: um humano sentado na frente da tela, copiando e colando, 24
horas por dia, para cada uma das centenas de mensagens. Não escala, não
funciona fora do horário comercial, e é exatamente o trabalho manual que
o cenário inteiro do módulo nasceu para eliminar (lembra do
[01-contexto-e-problema-real da Aula 01](<../../Aula 01 - Fundamentos de IA e LLMs/01-contexto-e-problema-real/README.md>)?).

## 💻 A mudança de hoje

A diferença entre "brincar com IA no chat" e "colocar IA dentro de um
produto" é uma coisa só: **quem está mandando o prompt**. Até agora, era
você, digitando. A partir de hoje, é o **seu código**, chamando uma API.

```
Antes (Aulas 01-02):  Você → cola prompt → interface de chat → lê resposta
Hoje (Aula 03):        Código → chama API → recebe resposta → decide sozinho
```

Isso não é uma técnica nova de prompt — é a **mesma engenharia de prompt
que você já aprendeu na Aula 02**, só que agora o texto do prompt está
dentro de uma variável no seu programa, e quem lê a resposta não é você,
é a próxima linha de código.

## 🌍 Isso já é o que roda por trás de qualquer produto com IA

Toda feature de IA que você já usou em um produto — o assistente de
escrita do Notion, a sugestão de código do GitHub Copilot, o chat de
suporte de um e-commerce, o resumo automático de reunião do Google Meet —
por trás das telas bonitas, é **a mesma coisa que você vai escrever hoje**:
um programa que monta um prompt, chama a API de um modelo, e faz algo com
a resposta. Não tem mágica adicional — é o que você aprendeu nas Aulas 01
e 02, chamado de dentro de um `fetch`/SDK em vez de uma interface de chat.

## 🧭 Para onde isso vai

Estendendo a tabela que já vem desde a Aula 01:

| Aula | O que construímos sobre o cenário |
|------|----------------------------------------|
| Aula 1 | Entender o "cérebro" (LLM) que vamos usar |
| Aula 2 | Escrever prompts que classificam a mensagem de forma confiável |
| Aula 3 (esta) | Fazer o **código** chamar o modelo sozinho — sem humano colando prompt |
| Aula 4 | A mesma chamada, mas buscando contexto real (RAG) antes de montar o prompt |
| Aula 5 | A mesma chamada, dentro de um loop onde o próprio modelo decide usar ferramentas |
| n8n | A mesma chamada, disparada por um workflow (webhook, planilha, CRM) sem escrever código |

Repare: a Aula 03 não é "mais uma técnica" — é a aula que faz tudo que
veio antes **rodar sozinho**, sem você.

## 🧪 Exercício

Antes de seguir para os conceitos, responda por escrito:

1. No [Exercício 03 da Aula 02](<../../Aula 02 - Prompt Engineering/06-exercicio-03-decomposicao-e-structured-output/README.md>),
   você validou "no olho" se o JSON que o modelo devolveu era válido.
   Se isso fosse rodar **sem você olhando**, centenas de vezes por dia,
   o que você imagina que aconteceria na primeira vez que o JSON saísse
   inválido?
2. Pense em uma tarefa do seu dia a dia que hoje você faz colando prompt
   num chat. O que mudaria (para melhor e para pior) se essa tarefa virasse
   um script rodando sozinho, sem você revisando cada resposta?
3. Que tipo de **controle** (limite, validação, aviso) você acha que um
   sistema automatizado precisa ter, que um humano colando prompt no chat
   não precisa, exatamente porque o humano está ali olhando cada resposta?

**Próximo passo:** [02-conceitos-fundamentais](../02-conceitos-fundamentais/README.md)
