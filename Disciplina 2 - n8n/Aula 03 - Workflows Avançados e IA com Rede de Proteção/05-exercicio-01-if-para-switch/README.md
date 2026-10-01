# 5. Exercício 01 — De `If` encadeado para `Switch`

**Nível: 🟢 Básico.**

## 🎯 Objetivo

Construir um roteador de prioridade de chamados com `If` encadeado,
sentir o problema, e refatorar para `Switch`.

## 📋 Passo a passo

### 1. A versão ruim, de propósito

Monte: **Manual Trigger** → **Edit Fields** (crie um campo `prioridade`
com um dos valores `baixa`, `media`, `alta`, `critica` — teste com cada
um) → três `If` encadeados:

- `If 1`: `prioridade == 'critica'` → **true**: Edit Fields "Notificar
  plantão agora". **false**: segue para o `If 2`.
- `If 2`: `prioridade == 'alta'` → **true**: Edit Fields "Responder em
  até 1 hora". **false**: segue para o `If 3`.
- `If 3`: `prioridade == 'media'` → **true**: Edit Fields "Responder em
  até 4 horas". **false**: Edit Fields "Responder em até 24 horas" (cobre
  `baixa` **e qualquer outra coisa**).

Teste com `prioridade = "baixa"`, depois com `prioridade = "urgente"`
(um valor que você inventou, que não existe em nenhuma regra).

**O que você deve notar:** `"urgente"` cai no mesmo lugar que `"baixa"` —
no último `else`. Um valor **errado** e um valor **legitimamente baixo**
tomam exatamente a mesma ação. Ninguém percebe a diferença.

### 2. Refatorando para `Switch`

Substitua os três `If` por **um** `Switch`, com quatro saídas:
`critica`, `alta`, `media`, e uma saída **default** explícita (não
reaproveite ela para `baixa`). Ligue `baixa` numa saída própria também —
agora você tem 5 saídas: `critica`, `alta`, `media`, `baixa`, `default`.

Ligue a saída **default** a um Edit Fields separado: "Prioridade não
reconhecida — revisar manualmente".

Teste de novo com `prioridade = "urgente"`.

**Resultado esperado:** agora "urgente" cai no `default`, **separado**
de "baixa" — o erro de digitação não se disfarça mais de prioridade
baixa.

## ✅ Checklist

- [ ] A versão com `If` encadeado funciona para os 4 valores válidos.
- [ ] Você reproduziu o problema: `"urgente"` caindo junto com `"baixa"`.
- [ ] O `Switch` tem 5 saídas, incluindo um `default` que **não**
      reaproveita a lógica de `baixa`.
- [ ] Com o `Switch`, `"urgente"` sai separado, no `default`.

## 📸 O que guardar para o relatório

- Print da versão com `If` encadeado e o resultado do teste com
  `"urgente"`.
- Print do `Switch` com as 5 saídas e o mesmo teste, mostrando o
  resultado diferente.

## 🧪 Perguntas de reflexão

1. Quantas regras a mais você precisaria mexer, no `If` encadeado, para
   acrescentar uma prioridade `"bloqueante"` acima de `"critica"`? E no
   `Switch`?
2. Por que eu insisti para você **não** reaproveitar a lógica de `baixa`
   como o `default` do `Switch`, mesmo cobrindo os mesmos casos "menos
   urgentes" na prática?

**Próximo passo:** [06-exercicio-02-merge-e-loop](../06-exercicio-02-merge-e-loop/README.md)
