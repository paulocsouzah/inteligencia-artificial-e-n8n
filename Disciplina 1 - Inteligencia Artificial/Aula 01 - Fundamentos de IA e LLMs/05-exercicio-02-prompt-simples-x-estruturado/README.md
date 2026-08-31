# 5. Exercício 02 — Prompt Simples x Prompt Estruturado

Este é o exercício-chave da aula (é a prática citada no plano de ensino).
Vamos comparar um prompt **vago** com um prompt **estruturado**, para a
mesma tarefa, e observar a diferença de qualidade e consistência. Isso é
um "gostinho" do que a Aula 2 (Prompt Engineering) vai aprofundar.

## 🎯 Objetivo

Perceber que **como você pede** muda tanto o resultado quanto **qual**
modelo você usa — e que isso é uma técnica (Prompt Engineering), não sorte.

## 🧪 A tarefa

Vamos usar o cenário da mensagem de atendimento ao cliente, o mesmo do
módulo [01-contexto-e-problema-real](../01-contexto-e-problema-real/README.md).

Mensagem do cliente a ser processada (use exatamente esta, para poder
comparar depois com os colegas):

```
Comprei um notebook no site de vocês faz 3 dias e ele chegou com a tela
trincada. Já tentei falar no chat e ninguém resolveu. Quero meu dinheiro
de volta ou um produto novo, e rápido, porque preciso dele para trabalhar.
```

### Prompt simples (vago)

```
O que eu faço com esta mensagem de cliente: "Comprei um notebook no site
de vocês faz 3 dias e ele chegou com a tela trincada. Já tentei falar no
chat e ninguém resolveu. Quero meu dinheiro de volta ou um produto novo,
e rápido, porque preciso dele para trabalhar."
```

### Prompt estruturado

```
Você é um assistente de triagem de atendimento ao cliente de um
e-commerce.

Analise a mensagem do cliente abaixo e responda APENAS no formato:

Categoria: [Financeiro | Técnico | Logística | Elogio]
Prioridade: [Baixa | Média | Alta | Urgente]
Sentimento: [Positivo | Neutro | Negativo]
Resumo: [uma frase resumindo o pedido do cliente]

Mensagem do cliente:
"Comprei um notebook no site de vocês faz 3 dias e ele chegou com a tela
trincada. Já tentei falar no chat e ninguém resolveu. Quero meu dinheiro
de volta ou um produto novo, e rápido, porque preciso dele para trabalhar."
```

## 📋 Passo a passo

1. Escolha um modelo (pode ser o mesmo do exercício anterior).
2. Rode o **prompt simples** e guarde a resposta (print).
3. Abra uma conversa **nova** (importante: não continue na mesma conversa,
   para o modelo não "aproveitar" contexto do prompt anterior) e rode o
   **prompt estruturado**. Guarde a resposta (print).
4. Repita o prompt estruturado mais **duas vezes**, em conversas novas,
   para checar se o formato de saída se mantém consistente.
5. **Desafio:** repita os dois prompts (simples e estruturado) em um
   **segundo modelo** diferente do primeiro.

## 📊 Comparação

| Critério | Prompt simples | Prompt estruturado |
|---|---|---|
| A resposta é fácil de "ler por um sistema" (ex.: separar campos por código)? | | |
| A resposta variou entre as execuções? | | |
| O modelo seguiu exatamente o formato pedido? | | |
| A resposta incluiu informação além do que foi pedido? | | |

## 🧪 Perguntas de reflexão

1. Se este processo fosse automatizado (a resposta do modelo alimentasse
   automaticamente um sistema, sem um humano lendo), qual dos dois
   prompts você usaria? Por quê?
2. O prompt estruturado deu **menos liberdade** ao modelo de propósito.
   Em que situação dar mais liberdade (prompt mais aberto) seria
   preferível?
3. No passo do desafio (segundo modelo), o formato estruturado se manteve
   igualmente consistente nos dois modelos, ou um seguiu as instruções de
   formato melhor que o outro?
4. Conecte com o módulo de conceitos: em qual temperature (alta ou baixa)
   você rodaria o prompt estruturado, se tivesse esse controle disponível?
   Por quê?

**Próximo passo:** [06-exercicio-03-temperature-e-alucinacao](../06-exercicio-03-temperature-e-alucinacao/README.md)
