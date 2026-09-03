# 4. Exercício 01 — Role e Contexto

Agora é sua vez. Vamos usar a mesma mensagem de cliente da Aula 01 e
escrever prompts com **personas e contextos diferentes**, para observar
o quanto isso muda a resposta final ao cliente.

## 🎯 Objetivo

Perceber, na prática, que role e contexto não são "só estilo" — eles
mudam o conteúdo, o tom e até as promessas que o modelo faz em nome da
sua empresa.

## 🧪 A mensagem do cliente

Vamos reaproveitar a mensagem do
[Exercício 02 da Aula 01](<../../Aula 01 - Fundamentos de IA e LLMs/05-exercicio-02-prompt-simples-x-estruturado/README.md>):

```
Comprei um notebook no site de vocês faz 3 dias e ele chegou com a tela
trincada. Já tentei falar no chat e ninguém resolveu. Quero meu dinheiro
de volta ou um produto novo, e rápido, porque preciso dele para trabalhar.
```

A tarefa, nos três prompts abaixo, é sempre a mesma: **escrever a resposta
que a empresa manda para esse cliente.**

### Prompt A — sem role nem contexto

```
Escreva uma resposta para o cliente abaixo.

Mensagem do cliente:
"Comprei um notebook no site de vocês faz 3 dias e ele chegou com a tela
trincada. Já tentei falar no chat e ninguém resolveu. Quero meu dinheiro
de volta ou um produto novo, e rápido, porque preciso dele para trabalhar."
```

### Prompt B — com role, sem contexto de política

```
Você é um atendente sênior de e-commerce, treinado para responder com
empatia e objetividade.

Escreva uma resposta para o cliente abaixo.

Mensagem do cliente:
"Comprei um notebook no site de vocês faz 3 dias e ele chegou com a tela
trincada. Já tentei falar no chat e ninguém resolveu. Quero meu dinheiro
de volta ou um produto novo, e rápido, porque preciso dele para trabalhar."
```

### Prompt C — com role e contexto de política

```
Você é um atendente sênior de e-commerce, treinado para responder com
empatia e objetividade.

Contexto: nossa política permite reembolso integral em até 7 dias após a
entrega, ou troca imediata, sem necessidade de devolver o produto
danificado, caso ele tenha chegado com defeito de fábrica. Casos com essa
justificativa têm prioridade máxima no envio da solução.

Escreva uma resposta para o cliente abaixo.

Mensagem do cliente:
"Comprei um notebook no site de vocês faz 3 dias e ele chegou com a tela
trincada. Já tentei falar no chat e ninguém resolveu. Quero meu dinheiro
de volta ou um produto novo, e rápido, porque preciso dele para trabalhar."
```

## 📋 Passo a passo

1. Escolha um modelo (ChatGPT, Claude.ai ou Gemini).
2. Rode os três prompts, **em conversas novas e separadas** (para um não
   "vazar" contexto para o outro). Guarde print de cada resposta.
3. Preencha a tabela comparativa abaixo.
4. **Desafio:** escreva um quarto prompt, com uma persona bem diferente
   das anteriores (ex.: "Você é um atendente extremamente formal e
   burocrático" ou "Você é um atendente descontraído, de uma marca jovem")
   — mantendo o mesmo contexto de política do Prompt C — e compare o tom.
5. **🚀 Desafio dev (mais completo):** repita a lógica do exercício, mas
   com um trecho de código seu (ou peça para um LLM gerar um trecho com
   um bug/vulnerabilidade de propósito, ex.: uma query SQL montada por
   concatenação de string). Rode:
   - **Sem role, sem contexto:** `Revise este código: <cole o trecho>`.
   - **Com role, sem contexto:** `Você é um revisor de código sênior
     focado em segurança. Revise este código: <cole o trecho>`.
   - **Com role e contexto:** adicione ao prompt anterior o contexto real
     do seu projeto (linguagem, framework, se é uma API pública ou
     interna, se já existe validação em outra camada).

   Compare se a versão só com role já identifica o problema de segurança,
   e se o contexto muda a **severidade** atribuída ou as sugestões dadas
   (ex.: "crítico numa API pública" x "baixo risco numa ferramenta
   interna").

## 📊 Comparação

| Critério | Prompt A | Prompt B | Prompt C |
|---|---|---|---|
| A resposta faz alguma promessa concreta (prazo, reembolso, troca)? | | | |
| Essa promessa é compatível com uma política real, ou o modelo "inventou" uma? | | | |
| O tom parece adequado para um cliente insatisfeito? | | | |
| Você confiaria em enviar essa resposta sem revisar, em nome da empresa? | | | |

## 🧪 Perguntas de reflexão

1. No Prompt A (sem contexto de política), o modelo precisou "decidir"
   sozinho o que oferecer ao cliente. Isso é um tipo de alucinação
   (lembra da Aula 01)? Por quê?
2. Compare Prompt B e Prompt C: o que mudou não foi a persona (era a
   mesma) — foi só o contexto. Isso mudou o conteúdo da resposta, o tom,
   ou os dois?
3. Se você fosse responsável pelo atendimento automatizado de uma empresa
   de verdade, você confiaria em publicar a resposta do Prompt A sem
   revisão humana? E a do Prompt C?
4. No desafio (persona diferente): o que muda quando você troca só a
   persona, mantendo o mesmo contexto de política? O conteúdo da
   resposta muda, ou só o tom?
5. Se você fez o desafio dev: o contexto de projeto mudou a severidade
   atribuída ao problema? Isso te lembra de algum caso real em que a
   mesma vulnerabilidade tem urgência bem diferente dependendo de onde o
   código roda?

**Próximo passo:** [05-exercicio-02-few-shot](../05-exercicio-02-few-shot/README.md)
