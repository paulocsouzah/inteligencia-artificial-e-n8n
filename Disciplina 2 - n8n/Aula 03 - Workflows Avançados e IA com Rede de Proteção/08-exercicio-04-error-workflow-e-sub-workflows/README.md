# 8. Exercício 04 — Error Workflow e Sub-workflows

**Nível: 🟠 Complexo.**

## 🎯 Objetivo

Criar um Error Workflow central, ligá-lo a um workflow que você faz
falhar de propósito, e depois extrair um pedaço de lógica para um
Sub-workflow reutilizável.

## 📋 Parte A — Error Workflow

1. Crie um workflow novo, **"Aula 03 - Error Workflow"**: **Error
   Trigger** → **Edit Fields**, montando uma mensagem a partir dos dados
   que o Error Trigger entrega (`$json.workflow.name`,
   `$json.execution.id`, `$json.execution.error.message` — confira os
   nomes exatos no painel do node depois de uma execução de teste).
   **Publique esse workflow.** Sem publicar, o n8n não o chama — ele
   "existir" não é suficiente, igual a um Webhook.
2. Crie (ou reaproveite) um segundo workflow que comece com um
   **Webhook** (não um Manual Trigger — você vai entender por que já já)
   seguido de um `HTTP Request`. Nas **Settings** desse workflow, campo
   **Error Workflow**, selecione o workflow que você criou no passo 1.
   **Publique este workflow também.**
3. Force uma falha: aponte o `HTTP Request` para uma URL que não existe
   (`https://api.naoexisteaula03.com.br`), **sem** Retry On Fail. Chame a
   **URL de produção** do webhook com `curl` — **não** clique em *Execute
   workflow* no editor.

   > ⚠️ **Por que o `curl`, e não o botão Execute workflow?** Eu testei
   > as duas formas montando esta aula: executar manualmente pelo editor
   > faz o node falhar do mesmo jeito, mas o Error Workflow **não**
   > dispara. Ele só reage a falhas de execuções **de produção**. Se você
   > testar pelo botão e achar que "não funcionou", é essa a causa mais
   > provável — não um erro de configuração.
4. Vá até o workflow de erro e confira a aba **Executions**: deve ter
   uma execução nova, disparada sozinha, com os dados da falha.

## 📋 Parte B — Sub-workflow

1. Pegue o workflow do Exercício 03 (Chamar LLM com retry/timeout →
   Validar saída). Selecione os dois nodes (clique e arraste para
   selecionar, ou Shift+clique em cada um).
2. Copie (Ctrl+C), crie um workflow novo, cole (Ctrl+V). No início desse
   novo workflow, substitua o Manual Trigger por um **Execute Workflow
   Trigger**. Nomeie o workflow: **"Aula 03 - Sub-workflow - Analisar
   mensagem com IA"**. Publique.
3. No workflow original, apague os dois nodes que você moveu e, no lugar
   deles, adicione um **Execute Workflow**, apontando para o
   sub-workflow que você acabou de criar.
4. Execute o workflow original de ponta a ponta. O resultado deve ser
   **idêntico** ao que era antes — só que agora passando por dentro do
   sub-workflow.

> Gabaritos: [`assets/workflow-ex04-error-workflow-gabarito.json`](assets/workflow-ex04-error-workflow-gabarito.json)
> (Parte A) e
> [`assets/workflow-sub-workflow-analisar-ia-gabarito.json`](assets/workflow-sub-workflow-analisar-ia-gabarito.json)
> (Parte B). Só depois de tentar.

## ✅ Checklist

- [ ] O Error Workflow está publicado e configurado nas Settings do
      workflow de teste.
- [ ] Você forçou uma falha e viu a execução automática no Error
      Workflow, sem disparar nada manualmente.
- [ ] O sub-workflow "Analisar mensagem com IA" existe, publicado, com
      Execute Workflow Trigger.
- [ ] O workflow original chama o sub-workflow via Execute Workflow e o
      resultado bate com a versão anterior.

## 📸 O que guardar para o relatório

- Print da configuração **Error Workflow** nas Settings.
- Print da execução automática no workflow de erro.
- Print do canvas do sub-workflow e do workflow principal chamando ele.

## 🧪 Perguntas de reflexão

1. O Error Workflow pegou uma falha que você causou de propósito. Ele
   também pegaria uma falha num node que tivesse **Retry On Fail**
   configurado, se as 3 tentativas falhassem todas? Por quê?
2. Se dois workflows diferentes (o do e-mail e o de um futuro canal de
   WhatsApp) chamarem o **mesmo** sub-workflow de análise de IA, e você
   mudar a validação dentro dele, o que acontece com os dois workflows
   que o chamam — você precisa editar os dois, ou só o sub-workflow?

**Próximo passo:** [09-exercicio-final](../09-exercicio-final/README.md)
