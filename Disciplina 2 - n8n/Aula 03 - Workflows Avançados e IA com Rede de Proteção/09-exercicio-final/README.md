# 9. Exercício Final — o projeto da aula

**Nível: 🎯 Projeto.**

Hoje você pega o pipeline da Aula 02 (Gmail → IA analisa → decide →
responde ou escala) e o torna **robusto**: ele continua funcionando
quando algo dá errado, e nada passa em silêncio.

## 🎯 Objetivo

Evoluir o projeto da Aula 02 com três mudanças:

1. O roteamento por categoria vira **Switch** (não mais um `If` só).
2. A chamada de IA vira um **Sub-workflow** com retry, timeout e
   validação de saída (o que você construiu no Exercício 03).
3. O workflow principal ganha um **Error Workflow**, para qualquer
   falha que escape da blindagem.

## 📜 O contrato

### O pipeline

```
Gmail Trigger
      │
      ▼
Execute Workflow (sub-workflow "Analisar mensagem com IA":
   chama a LLM com retry + timeout, valida a saída)
      │
      ▼
 precisa_humano == true ? ──sim──▶ Registrar como escalado
      │ não
      ▼
    Switch (por categoria)
      │
   ┌──┼────────┬─────────┬─────────┐
logistica  financeiro  elogio    duvida/default
   │          │           │          │
   ▼          ▼           ▼          ▼
Responder  Responder   Responder  Escalar
(SLA normal) (SLA normal) (SLA normal) (revisão)
```

### A regra de decisão (reaproveitando a Aula 02, com um ajuste)

| Condição | Ação |
|---|---|
| `precisa_humano == true` (o sub-workflow não validou a saída) | **Sempre** escala — nem passa pelo Switch |
| `precisa_humano == false` **e** `categoria` reconhecida **e** `sentimento != negativo` **e** `confianca >= 0.7` | Responde sozinho, roteado pelo `Switch` conforme a `categoria` |
| Qualquer outro caso (inclusive `categoria` fora da lista — cai no `default` do Switch) | Escala |

### O Error Workflow

Deve estar configurado nas Settings do workflow principal, apontando
para o workflow com Error Trigger que você criou no Exercício 04.

## 📋 Passo a passo sugerido

1. Comece do projeto final da Aula 02.
2. Troque a chamada de IA "solta" pelo **Execute Workflow**, apontando
   para o sub-workflow do Exercício 04 (que já tem retry, timeout e
   validação).
3. Logo depois, um **If**: `precisa_humano == true` → escala direto,
   sem passar pelo `Switch`.
4. No ramo "não precisa humano", um **Switch** por `categoria`, com uma
   saída por categoria reconhecida e um `default` que escala.
5. Configure o **Error Workflow** nas Settings.
6. Publique tudo (workflow principal, sub-workflow e error workflow).

## 🧪 Os testes

**Teste 1 — caminho feliz:** um e-mail normal de dúvida. Esperado:
sub-workflow valida, `categoria = duvida` ou similar, responde sozinho
pelo caminho certo do Switch.

**Teste 2 — IA retorna algo inválido:** force (temporariamente) o
sub-workflow a receber uma resposta mal formada da LLM (ajuste o prompt
para confundir o modelo, como no Exercício 03). Esperado:
`precisa_humano = true`, e o item **nem chega** no Switch — vai direto
para escalado.

**Teste 3 — categoria fora da lista:** force a IA a devolver uma
categoria inventada (ex.: peça no prompt "classifique como
'institucional'"). Esperado: cai no `default` do Switch, escala.

**Teste 4 — falha de infraestrutura:** derrube de propósito algo fora da
blindagem (por exemplo, aponte a credencial do Gmail para uma inválida
só no node de resposta) e confirme que o **Error Workflow** disparou.

## ✅ Checklist

- [ ] O sub-workflow de IA está sendo chamado via Execute Workflow.
- [ ] `precisa_humano = true` escala **antes** de chegar no Switch.
- [ ] O Switch tem uma saída por categoria reconhecida, e o `default`
      escala.
- [ ] Os 4 testes foram reproduzidos, com o resultado esperado em cada
      um.
- [ ] O Error Workflow está configurado e disparou no Teste 4.

## 📸 O que guardar para o relatório

- Print do canvas do workflow principal (com Switch e Execute Workflow
  visíveis) e do sub-workflow.
- Os quatro testes: entrada, saída do sub-workflow, e ação tomada.
- Print da execução automática do Error Workflow no Teste 4.

## 🚀 Desafio — dead-letter com reprocessamento

O Error Workflow de hoje só **registra** a falha. Acrescente: se a falha
veio de um **timeout** ou de um código `429`/`5xx` (ou seja, algo
passageiro — releia a tabela do módulo 03), o Error Workflow **tenta
reprocessar** a execução original depois de um `Wait` de 30 segundos,
usando o node **Execute Workflow** apontando de volta para o workflow
principal com os dados originais. Se a falha foi de outro tipo (ex.:
`401`), só registra, sem tentar de novo.

**Dica:** os dados da execução original estão disponíveis no item que
chega no Error Trigger (`$json.execution.*"`); você vai precisar guardar
o **payload de entrada** (o e-mail) em algum lugar acessível ao
reprocessamento — pense em como a Aula 01 guardava o `protocolo` para
rastrear cada chamada.

> Gabarito do projeto principal (sem o desafio do dead-letter):
> [`assets/workflow-projeto-gabarito.json`](assets/workflow-projeto-gabarito.json).
> Só depois de tentar — e, como sempre, sem nenhuma chave ou credencial
> real dentro, só referências por nome.

## ✅ Checklist do desafio

- [ ] O Error Workflow distingue falha passageira de falha permanente.
- [ ] Uma falha passageira simulada é reprocessada depois de 30s.
- [ ] Uma falha permanente simulada **não** é reprocessada, só
      registrada.

## 🧪 Perguntas de reflexão

1. No Teste 2, o item **nunca chega** no Switch. Por que eu desenhei a
   checagem de `precisa_humano` **antes** do roteamento por categoria,
   em vez de depois?
2. Pensa no pipeline inteiro, hoje: quantas camadas diferentes de
   proteção existem entre "um e-mail chega" e "uma ação errada acontece"
   (conte: validação de schema, Switch com default, Error Workflow...).
   Qual delas você tiraria **por último**, se tivesse que simplificar o
   sistema por falta de tempo?
3. (Se fez o desafio) Reprocessar automaticamente uma falha passageira
   tem um risco: e se a falha não for realmente passageira, e o sistema
   tentar de novo, de novo, sem parar? O que você acrescentaria para
   evitar isso?

## 📦 O que entregar

### 1. Workflows exportados (JSON)

- `Aula 03 - Ex 01 - De If para Switch`
- `Aula 03 - Ex 02 - Merge e Loop Over Items`
- `Aula 03 - Ex 03 - Blindando a chamada de IA`
- `Aula 03 - Error Workflow`
- `Aula 03 - Sub-workflow - Analisar mensagem com IA`
- `Aula 03 - Projeto - AI Customer Service (blindado)` (e o do desafio,
  se fez)

**Não inclua** nenhuma chave de API real, nem `terraform.tfvars`, nem
`.pem`.

### 2. Relatório em PDF, contendo

1. Identificação, data.
2. Módulos 01, 03, 04: respostas e prints pedidos.
3. Exercícios 01 a 04: checklists, prints, respostas.
4. Projeto final: os quatro testes, o desafio (se fez), respostas de
   reflexão.
5. **Síntese final (obrigatória, ~1 parágrafo):** compare o workflow que
   você entregou na Aula 02 com o de hoje. O **comportamento visível**
   para um cliente que manda um e-mail normal é o mesmo — mas o que
   mudou por baixo? E: existe algum tipo de falha que você ainda acha
   que **não** está coberta por nenhuma das camadas de proteção que você
   construiu até aqui?

## ✅ Rubrica de avaliação

| Critério | Peso |
|---|---|
| Módulos de contexto, conceitos e demonstração (01, 03, 04) | 10% |
| Exercício 01 — Switch substituindo If encadeado | 10% |
| Exercício 02 — Merge e Loop Over Items | 15% |
| Exercício 03 — retry, timeout e validação da IA | 15% |
| Exercício 04 — Error Workflow e Sub-workflow | 15% |
| Projeto final — pipeline integrado, os quatro testes | 25% |
| Síntese final | 10% |

**Bônus:** o desafio do dead-letter com reprocessamento vale até **+10%**.

## 📮 Como entregar

```
n8n-Aula03-SeuNome.pdf
```

---

**Fim da Aula 03.** O comportamento que um cliente vê, no caminho feliz,
não mudou nada desde a Aula 02. O que mudou foi tudo que acontece quando
o caminho **não** é feliz: retry, timeout, validação, Error Workflow,
sub-workflow. Na **Aula 04**, a gente aprofunda o lado da IA: extração
de dados em várias etapas, uma base de conhecimento (RAG) conectada ao
workflow, e roteamento por intenção entre vários fluxos diferentes —
tudo já rodando em cima da base sólida que você construiu hoje.
