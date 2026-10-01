# 7. Exercício 03 — Blindando a chamada de IA

**Nível: 🟡 Médio / 🟠 Complexo.**

Você vai pegar a chamada de LLM do Exercício 03 da Aula 02 e aplicar três
camadas de proteção: retry, timeout, e validação da saída.

## 🎯 Objetivo

Um node de chamada de IA que **não quebra o workflow** quando a API
falha, demora, ou devolve algo inesperado.

## 📋 Passo a passo

### 1. Retry e Timeout na chamada real

Pegue o workflow do Exercício 03 da Aula 02 (ou refaça: `HTTP Request`
chamando a API da sua LLM). Nas **Settings** do node:

- **Retry On Fail:** ligado, 3 tentativas, 1000ms de intervalo.
- Em **Options → Timeout:** `8000` (8 segundos — generoso o bastante
  para uma resposta normal, curto o bastante para não travar o
  workflow).

### 2. Provocando a falha, de verdade

Troque a URL por `https://httpbin.org/status/503` por um instante,
execute, e confirme: 3 tentativas aparecem na execução, e o node termina
em erro (porque esse mock sempre falha). Depois **volte a URL correta**
da LLM.

### 3. Validando a saída

Depois do `HTTP Request`, adicione um **Code**:

```javascript
let dados;
const texto = $input.item.json.choices?.[0]?.message?.content;

try {
  dados = JSON.parse(texto);
} catch (e) {
  return { json: { precisa_humano: true, motivo: 'JSON invalido: ' + e.message } };
}

const camposObrigatorios = ['categoria', 'sentimento', 'prioridade'];
const faltando = camposObrigatorios.filter((c) => !(c in dados));
if (faltando.length > 0) {
  return { json: { precisa_humano: true, motivo: 'Campos faltando: ' + faltando.join(', ') } };
}

const sentimentosValidos = ['positivo', 'neutro', 'negativo'];
if (!sentimentosValidos.includes(dados.sentimento)) {
  return { json: { precisa_humano: true, motivo: 'Sentimento fora do esperado: ' + dados.sentimento } };
}

return { json: { ...dados, precisa_humano: false } };
```

### 4. Testando os três casos

1. Com a LLM respondendo normalmente → `precisa_humano: false`.
2. Mude o prompt temporariamente para pedir uma resposta **sem** JSON
   (ex.: "responda só com um emoji") → o node deve cair no
   `catch` e marcar `precisa_humano: true`, sem quebrar o workflow.
3. Se conseguir, peça para a LLM usar um valor fora do esperado
   (ex.: "classifique o sentimento como 'indiferente'") → o node deve
   pegar isso na checagem de `sentimentosValidos`.

## ✅ Checklist

- [ ] O Retry On Fail está configurado e você viu as 3 tentativas
      acontecendo contra o endpoint que sempre falha.
- [ ] O Timeout está configurado (8000ms).
- [ ] O node de validação captura JSON inválido sem quebrar o workflow.
- [ ] O node de validação captura um campo obrigatório faltando.
- [ ] O node de validação captura um valor de `sentimento` fora da lista
      esperada.

## 📸 O que guardar para o relatório

- Print das 3 tentativas de retry contra o endpoint que sempre falha.
- Print dos três testes do Passo 4, com o resultado de cada um.

## 🧪 Perguntas de reflexão

1. O `Timeout` de 8 segundos é um número que eu escolhi "no olho". O que
   você levaria em conta para escolher esse número num sistema real —
   tanto para não cortar uma resposta legítima quanto para não deixar o
   usuário esperando demais?
2. A validação de `sentimentosValidos` pega um valor que a própria LLM
   inventou, mesmo dentro de um JSON **tecnicamente válido**. Por que
   isso não seria pego só com `response_format: json_object`?
3. Pensa nos três testes do Passo 4. Se isso fosse realmente o workflow
   de atendimento de uma loja, o que você faria com cada um dos itens
   marcados `precisa_humano: true` — eles deveriam todos cair na mesma
   fila, ou fazem sentido filas diferentes?

**Próximo passo:** [08-exercicio-04-error-workflow-e-sub-workflows](../08-exercicio-04-error-workflow-e-sub-workflows/README.md)
