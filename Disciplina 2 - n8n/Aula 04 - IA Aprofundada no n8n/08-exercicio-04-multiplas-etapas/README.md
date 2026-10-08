# 8. Exercício 04 — Três etapas, do início ao fim, numa reclamação real

**Nível: 🟠 Complexo.**

## 🎯 Objetivo

Encadear intenção → extração → resposta numa reclamação real só, do
início ao fim, montando o `Resultado final` que o projeto de hoje vai
usar para decidir e gravar.

## 📋 Passo a passo

1. **Manual Trigger** → **HTTP Request** (`GET
   /api/reclamacoes?status=nova`) → **Code** (escolha uma reclamação).
2. **Etapa 1 — intenção:** classifica, só isso.
3. **Etapa 2 — extração:** usa o `mensagem` original, não o resultado da
   etapa 1. Junte o resultado com o da etapa 1 (`intencao`, `confianca`).
4. **Etapa 3 — resposta:** busca `/api/politicas`, junta todas
   (`$input.all()`), e responde só com a base.
5. **Resultado final:** um Code juntando tudo — `reclamacao_id`,
   `protocolo`, `intencao`, `confianca`, `extracao`, `resposta`.

## 🧪 Experimento obrigatório: o prompt misturado

Depois de montar a versão correta, crie uma **cópia** da Etapa 3 com um
prompt que mistura tarefas: *"se a intenção for venda, diga que um
consultor entrará em contato; se for suporte ou financeiro, responda com a
base"*. Rode a mesma reclamação com as duas versões e compare.

## ✅ Checklist

- [ ] Cada etapa tem um prompt, com uma tarefa.
- [ ] O `Resultado final` tem os cinco campos.
- [ ] Você rodou o experimento do prompt misturado e comparou as respostas.

## 📸 O que guardar para o relatório

- Print do canvas com as três etapas.
- O `Resultado final` de uma reclamação real, completo.
- A comparação do prompt misturado x separado.

## 🧪 Perguntas de reflexão

1. Por que a Etapa 2 usa `mensagem` (o texto original), e não o resultado
   da Etapa 1? O que daria errado se ela usasse a saída da Etapa 1 como
   entrada?
2. No prompt misturado, o erro não lança exceção. Como você perceberia
   isso, numa reclamação de verdade, sem comparar as duas versões lado a
   lado como fizemos aqui?

> Gabarito do exercício (só depois de tentar): [`assets/workflow-ex04-gabarito.json`](assets/workflow-ex04-gabarito.json).

**Próximo passo:** [09-exercicio-final](../09-exercicio-final/README.md)
