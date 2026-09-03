# 6. Exercício 03 — Decomposição + Structured Output

Este é o exercício que mais aponta para frente: o formato que você vai
desenhar aqui é **exatamente** o tipo de resposta que, na Aula 03, um
código de verdade vai consumir via API. Vamos combinar as duas últimas
técnicas: pedir raciocínio em etapas, mas exigir que a conclusão saia em
JSON puro.

## 🎯 Objetivo

Construir um prompt que (1) raciocina em etapas antes de decidir e (2)
devolve **apenas** JSON válido, de forma consistente em múltiplas
execuções — a combinação que torna um LLM confiável dentro de um
pipeline automatizado.

## 🧪 O prompt combinado

```
Você é um sistema de triagem de atendimento ao cliente de um e-commerce.

Antes de responder, raciocine internamente pelas etapas abaixo (não
mostre esse raciocínio na resposta final):
1. Identifique do que se trata a mensagem.
2. Avalie o tom do cliente (positivo, neutro, negativo).
3. Avalie se há urgência ou risco envolvido (prazo, dinheiro, saúde).
4. Com base nisso, decida categoria, prioridade e sentimento.

Depois de raciocinar, responda APENAS com um JSON válido, sem nenhum
texto antes ou depois, sem cercas de código markdown, exatamente neste
formato:

{
  "categoria": "Financeiro" | "Tecnico" | "Logistica" | "Elogio",
  "prioridade": "Baixa" | "Media" | "Alta" | "Urgente",
  "sentimento": "Positivo" | "Neutro" | "Negativo"
}

Mensagem do cliente:
"<cole aqui a mensagem>"
```

Use estas três mensagens de teste:

```
Mensagem A: "Comprei um notebook no site de vocês faz 3 dias e ele chegou
com a tela trincada. Já tentei falar no chat e ninguém resolveu. Quero
meu dinheiro de volta ou um produto novo, e rápido, porque preciso dele
para trabalhar."

Mensagem B: "Só queria dizer que o atendimento de vocês foi excelente,
super rápido."

Mensagem C: "Comprei um remédio de uso contínuo há 5 dias e ele nunca
chegou. Estou sem o remédio desde ontem."
```

## 📋 Passo a passo

1. Escolha um modelo.
2. Rode o prompt combinado para **cada uma das três mensagens**, em
   conversas novas. Guarde print de cada resposta.
3. Para cada resposta, verifique se ela é um **JSON válido de verdade**:
   tente colar em um validador de JSON online, ou verifique manualmente
   se abre e fecha chaves corretamente, se as aspas estão certas e se não
   sobrou nenhum texto fora do bloco `{ ... }`.
4. Repita a **Mensagem A** mais duas vezes (total de 3 execuções dela),
   em conversas novas, para checar consistência.
5. **Desafio:** rode a Mensagem A também com o prompt ingênuo da
   [Demo 4](../03-demonstracao-guiada/README.md) (sem instrução explícita
   de "só JSON, sem texto extra") e compare se esse veio mais "sujo".
6. **🚀 Desafio dev (o mais completo da aula):** monte o mesmo tipo de
   prompt combinado, agora para **triagem de falha de pipeline de
   CI/CD** — o cenário que você já viveu de verdade na Aula 05 do curso
   de DevOps.

   ```
   Você é um sistema de triagem de falhas de pipeline de CI/CD.

   Antes de responder, raciocine internamente pelas etapas abaixo (não
   mostre esse raciocínio na resposta final):
   1. Identifique em qual etapa do pipeline (build, test, deploy) a falha
      ocorreu.
   2. Identifique a causa provável, a partir do log.
   3. Avalie se é um problema transitório (ex.: rede, timeout) ou
      estrutural (ex.: erro de código, configuração quebrada).
   4. Com base nisso, decida a ação recomendada.

   Depois de raciocinar, responda APENAS com um JSON válido, sem nenhum
   texto antes ou depois, sem cercas de código markdown, exatamente
   neste formato:

   {
     "etapa_falha": "build" | "test" | "deploy",
     "causa_provavel": string,
     "tipo": "transitorio" | "estrutural",
     "acao_recomendada": "retry_automatico" | "notificar_time" | "bloquear_deploy"
   }

   Log:
   "<cole aqui um trecho de log>"
   ```

   Teste com **dois logs diferentes** — um que pareça um erro transitório
   (ex.: timeout de conexão, rate limit de uma API externa) e outro que
   pareça um erro estrutural (ex.: teste unitário quebrado, erro de
   sintaxe). Se não tiver um log real à mão, peça para o próprio LLM
   gerar dois exemplos plausíveis de log de falha antes de começar.

## 📊 Comparação

| Execução | JSON válido? | Categoria | Prioridade | Sentimento |
|---|---|---|---|---|
| Mensagem A — 1ª execução | | | | |
| Mensagem A — 2ª execução | | | | |
| Mensagem A — 3ª execução | | | | |
| Mensagem B | | | | |
| Mensagem C | | | | |

### 📊 Comparação (desafio dev)

| Log | JSON válido? | Etapa | Tipo (transitório/estrutural) | Ação recomendada |
|---|---|---|---|---|
| Log 1 (transitório) | | | | |
| Log 2 (estrutural) | | | | |

## 🧪 Perguntas de reflexão

1. As três execuções da Mensagem A deram o mesmo resultado? Se não,
   onde exatamente elas divergiram (categoria? prioridade? sentimento?)?
2. A Mensagem C (remédio de uso contínuo que não chegou) recebeu
   prioridade `Urgente` ou `Alta`? Você concorda com a decisão do modelo,
   considerando o risco à saúde do cliente?
3. No desafio: o prompt ingênuo (sem instrução explícita de formato)
   realmente veio mais "sujo" (texto extra, cerca de markdown) do que o
   prompt combinado desta seção? Se um código tentasse rodar
   `JSON.parse()` em cada um, qual quebraria?
4. Pensando na Aula 03 (onde isso vai virar código de verdade via API):
   que consequência prática teria, para o sistema, receber um JSON
   inválido em uma das execuções? Como você imagina que um sistema
   real se protegeria disso?
5. Se você fez o desafio dev: o modelo distinguiu corretamente o erro
   transitório do estrutural? Se um pipeline de verdade agisse
   automaticamente com base em `"acao_recomendada": "retry_automatico"`,
   que risco existiria se o modelo errasse essa classificação num erro
   que na verdade é estrutural?

**Próximo passo:** [07-exercicio-final](../07-exercicio-final/README.md)
