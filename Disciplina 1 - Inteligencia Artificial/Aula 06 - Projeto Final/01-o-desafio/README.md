# 1. O desafio

Até aqui, cada peça que você construiu funcionava **sozinha**: um script
que chama a API, outro que faz RAG, outro que roda um agente. Hoje eu te
peço o passo seguinte, o mais difícil de todos: juntar tudo num
**produto** — algo que outra pessoa consegue abrir, usar e confiar.

---

## 🔧 Script não é produto

Você já sabe fazer o modelo responder. O que separa um script de um
produto é tudo o que vem em volta da resposta:

| Um script... | Um produto... |
|---|---|
| Roda no seu terminal, na sua máquina | Tem uma interface que outra pessoa consegue usar |
| Confia no que o modelo devolveu | Valida o que o modelo devolveu, em código, antes de usar |
| Quebra quando a API dá erro | Trata o erro e avisa o usuário |
| Responde qualquer coisa | Sabe dizer "não sei" e recusar o que está fora do escopo |
| Tem a chave da API dentro do código | Guarda a chave em variável de ambiente, fora do Git |
| Só você entende como rodar | Tem um README que qualquer pessoa segue |

É a última linha da tabela que eu mais vou olhar na sua entrega — e é a
que mais gente esquece.

## 🌍 Três casos reais

Antes de você escolher o tema, olha o que aconteceu quando empresas de
verdade colocaram IA em produto. Cada caso mexe num pilar do que você
aprendeu:

**Air Canada (2024) — guardrails e alucinação.** Em 2024, um tribunal
canadense (o Civil Resolution Tribunal, da Colúmbia Britânica) julgou o
caso de um passageiro que perguntou ao chatbot da Air Canada sobre a
tarifa de luto. O chatbot inventou uma regra que não existia na política
da empresa, o passageiro comprou a passagem confiando nela, e a
companhia tentou se defender dizendo que o chatbot era "uma entidade
separada". O tribunal não aceitou: **a empresa responde pelo que o
chatbot diz**. Lição para o seu projeto: o que o modelo afirma precisa
vir de uma fonte confiável (é para isso que serve o RAG, da Aula 04) e
ele precisa saber admitir quando não sabe.

**Morgan Stanley (2023) — RAG sobre conhecimento próprio.** O banco
colocou um assistente baseado em GPT-4 para os consultores financeiros
perguntarem em linguagem natural sobre a base interna de pesquisas e
documentos da empresa — algo que a OpenAI documentou como caso de
cliente. O modelo não "sabe" nada sobre o banco: ele **busca** nos
documentos e responde com base no que encontrou. É exatamente o pipeline
da Aula 04, em escala.

**Klarna (2024) — o agente que resolve e o limite da automação.** Em
fevereiro de 2024, a Klarna anunciou que seu assistente de IA tinha
atendido 2,3 milhões de conversas no primeiro mês, cerca de dois terços
dos chats de atendimento. Tempo depois, a própria empresa admitiu que
priorizar só custo prejudicou a qualidade em alguns casos e voltou a
contratar atendentes humanos para parte da operação. Lição: um agente
bom não é o que responde tudo — é o que **sabe quando chamar uma
pessoa** (a aprovação humana da Aula 05).

Repara que nenhum desses três casos é "um chatbot que responde qualquer
coisa". Todos têm um **domínio claro, dados próprios e limites**. É isso
que eu quero ver no seu projeto.

## 🎯 As regras do jogo

1. **Equipe:** dupla ou trio. Nada de projeto individual, e nada de
   quarta pessoa.
2. **Tema:** livre — você escolhe (módulo 02).
3. **Recursos de IA:** todos os que a gente viu, cada um no seu lugar
   certo (módulo 03). Você não precisa usar tudo em tudo; precisa usar
   cada técnica **onde ela faz sentido** e saber explicar por quê.
4. **Cloud (AWS):** opcional. Quem fizer ganha bônus (módulo 06).
5. **Entrega:** o link do repositório no GitHub. Sem PDF, sem
   apresentação obrigatória (módulo 07).
6. **Stack:** eu recomendo Node.js/TypeScript, que é a stack de todas as
   aulas e do projeto de exemplo. Outra stack é permitida, desde que o
   README explique como rodar.

## 🧠 O que eu realmente quero ver

Não é o projeto mais bonito nem o mais complexo. É o projeto em que eu
consigo perceber que **você entendeu o que fez**:

- Você escolheu RAG **ou** agente porque o problema pedia, não porque
  estava na lista.
- O system prompt tem regras claras, e você consegue me dizer o que cada
  uma delas evita.
- Quando o modelo erra, o seu código percebe.
- Eu clono o repositório, sigo o README e funciona.

## 🧪 Exercício

Antes de partir para o módulo 02, conversem em equipe e respondam por
escrito (é o rascunho da sua proposta):

1. Que produto de IA que vocês usam no dia a dia (ChatGPT à parte) vocês
   acham que usa RAG? E qual acham que usa um agente? Como vocês
   chegaram a essa conclusão?
2. Pensem no Air Canada: se o seu projeto respondesse algo errado com
   total segurança, qual seria o pior cenário realista? O que o seu
   código poderia fazer para evitar isso?
3. Qual das cinco aulas (LLMs, prompt, API, RAG, agentes) foi a que
   vocês sentiram mais dificuldade? Como vocês vão garantir que ela
   esteja bem representada no projeto — e quem da equipe vai puxar essa
   parte?

**Próximo passo:** [02-escolhendo-o-tema](../02-escolhendo-o-tema/README.md)
