# 1. Contexto e problema real

Antes de eu te falar de token, temperature ou LLM, quero te contar um
problema que qualquer empresa com um mínimo de volume de clientes tem —
porque é esse problema que vai justificar tudo o que vamos construir
juntos ao longo do módulo.

---

## 📞 O cenário

Uma empresa de médio porte recebe, todos os dias, **centenas de mensagens**
de clientes: dúvidas sobre pedidos, reclamações, solicitações de reembolso,
perguntas sobre produtos, problemas técnicos. Hoje, esse fluxo funciona
assim:

1. Um atendente **lê** cada mensagem.
2. **Decide** do que se trata (dúvida? reclamação? financeiro?).
3. **Prioriza** (é urgente ou pode esperar?).
4. **Escreve** uma resposta, ou encaminha para o time certo.

Isso é lento, caro, inconsistente (dois atendentes respondem a mesma
dúvida de formas diferentes) e não escala — dobrar o volume de mensagens
significa dobrar o time de atendimento.

## 🌍 Isso já está acontecendo — exemplos reais

Esse não é um problema hipotético que eu inventei para a aula. Repare
como esse mesmo padrão aparece em empresas que você provavelmente já
conhece:

- **Bancos e fintechs** usam assistentes com IA para triar dúvidas sobre
  fatura, empréstimo e cartão antes de qualquer coisa chegar a um
  atendente humano.
- **E-commerces e marketplaces** (Magazine Luiza, Mercado Livre, entre
  outros) têm assistentes de compra e suporte que respondem por conta
  própria a boa parte das mensagens, e só escalam para um humano os casos
  mais complexos ou sensíveis.
- **Operadoras de telefonia e internet** usam IA para classificar
  automaticamente reclamações (sinal fraco, cobrança indevida, cancelamento)
  e direcionar para a fila certa, sem um humano lendo cada uma primeiro.

Em todos esses casos, o princípio é o mesmo que eu vou te ensinar a
construir neste módulo: **um modelo de linguagem lê a mensagem e decide o
que fazer com ela.**

## 💡 Onde a IA generativa entra

Um **LLM** (Large Language Model) — o tipo de IA por trás do ChatGPT, do
Claude e do Gemini — consegue **ler texto em linguagem natural e produzir
texto em linguagem natural** de volta, sem que ninguém tenha programado
regra por regra o que fazer com cada tipo de mensagem.

Isso significa que, em vez de escrever centenas de `if/else` do tipo *"se
a mensagem contém a palavra 'reembolso', classifique como financeiro"*,
podemos simplesmente **descrever a tarefa em português** para o modelo e
deixar que ele generalize — inclusive para mensagens que nunca vimos antes,
escritas de um jeito que nenhum `if` previu.

Essa é a mudança de mentalidade central desta disciplina:

> IA tradicional (regras, `if/else`, machine learning clássico) exige que
> você **preveja** os casos.
> IA generativa exige que você **descreva** a tarefa — e lide com o fato
> de que a resposta não é 100% determinística.

## 🧭 Para onde isso vai

Este cenário — mensagem do cliente entra, sistema decide o que fazer — é o
fio condutor de **todo o módulo**. Ao longo das próximas aulas (e da
disciplina de n8n), vamos construir peças dele:

| Aula | O que construímos sobre este cenário |
|------|----------------------------------------|
| Aula 1 (esta) | Entender o que é o "cérebro" (LLM) que vamos usar |
| Aula 2 | Escrever prompts que classificam a mensagem de forma confiável |
| Aula 3 | Colocar isso dentro de uma aplicação de verdade, via API |
| Aula 4 | Dar ao modelo acesso a documentos reais (manual, FAQ, políticas) via RAG |
| Aula 5 | Transformar isso num agente que consulta sistemas e age sozinho |
| n8n | Conectar tudo isso a WhatsApp, CRM, e-mail e planilhas, sem código |

No final do módulo, esse cenário vira o **projeto integrador**: um
atendimento automatizado de ponta a ponta, combinando IA + n8n.

## 🧪 Exercício

Antes de seguir para os conceitos, responda por escrito (você vai
reaproveitar isso no relatório final da aula):

1. Pense em um processo do seu trabalho (ou de uma empresa que você
   conhece) parecido com esse cenário: alguém lê algo e decide o que
   fazer. Descreva-o em 3-4 frases.
2. Nesse processo, o que seria mais fácil: escrever regras fixas
   (`if/else`) para cobrir os casos, ou descrever a tarefa em linguagem
   natural para um modelo? Justifique.
3. O que você imagina que pode **dar errado** ao trocar uma pessoa por um
   modelo de IA nesse processo? (guarde essa resposta — vamos voltar a ela
   quando falarmos de alucinações, mais adiante nesta mesma aula).

**Próximo passo:** [02-conceitos-fundamentais](../02-conceitos-fundamentais/README.md)
