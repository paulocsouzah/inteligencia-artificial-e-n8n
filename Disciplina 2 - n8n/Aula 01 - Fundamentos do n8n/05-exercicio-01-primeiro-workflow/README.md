# 5. Exercício 01 — Primeiro workflow

**Nível: 🟢 Básico.**

Vamos começar pelo menor workflow que faz algo útil: montar a **mensagem de
um cliente** como um dado organizado. Nada de internet ainda — só você, o
editor e o node Edit Fields. Depois, você troca quem *inicia* o workflow: de um
clique seu para o relógio.

## 🎯 Objetivo

Criar um workflow com Manual Trigger + Edit Fields, ler o resultado em três
formas (Schema, Table, JSON), e depois fazê-lo rodar sozinho, todo minuto, com
um Schedule Trigger.

## 📋 Passo a passo

### Parte A — Trigger manual

1. No n8n, crie um workflow novo e dê a ele o nome
   `Aula 01 - Ex 01 - Primeiro workflow`.
2. Adicione um **Manual Trigger** (busque "Manual" no **+**). Ele pode aparecer
   com o nome *When clicking 'Execute workflow'* — é o mesmo node.
3. Adicione, ligado a ele, um node **Edit Fields (Set)** e renomeie-o para
   `Montar mensagem`.
4. No `Montar mensagem`, crie **quatro campos**:

| Campo | Tipo | Valor | Modo |
|---|---|---|---|
| `cliente` | String | `Maria Souza` | Fixed |
| `canal` | String | `whatsapp` | Fixed |
| `mensagem` | String | `Meu pedido 4521 ainda não chegou` | Fixed |
| `recebido_em` | String | `{{ $now.toISO() }}` | **Expression** |

5. Clique em **Execute workflow**.

**Saída esperada** (o `recebido_em` será o seu horário):

```json
[
  {
    "cliente": "Maria Souza",
    "canal": "whatsapp",
    "mensagem": "Meu pedido 4521 ainda não chegou",
    "recebido_em": "2026-09-23T20:42:18.170-03:00"
  }
]
```

6. No painel de **saída** do `Montar mensagem`, alterne entre **Schema**,
   **Table** e **JSON**. Confirme que os três mostram a mesma coisa.
7. Clique de novo em **Execute workflow**, duas ou três vezes. Repare: o
   `recebido_em` muda a cada execução, e o restante não.

### Parte B — Trigger agendado

Agora o workflow vai rodar **sem você clicar**.

8. Adicione um **Schedule Trigger**. Configure **Trigger Interval** como
   **Minutes** e **Minutes Between Triggers** como **1**.
9. Ligue o Schedule Trigger **também** ao `Montar mensagem` (um node pode
   receber conexões de mais de um trigger). Seu canvas agora tem dois
   começos apontando para o mesmo node.
10. Clique em **Publish**.
11. **Espere 3 minutos** sem mexer em nada. Depois abra a aba **Executions**.

Você deve ver **cerca de 3 execuções**, uma por minuto, cada uma com o horário
em que rodou. Abra uma: o node `Montar mensagem` mostra o `recebido_em` daquele
minuto.

12. ⚠️ **Despublique o workflow.** Um workflow agendado que você esqueceu
    publicado continua rodando **para sempre** — 1.440 execuções por dia, na sua
    EC2, sem ninguém olhando. Faça disso um hábito.

### Parte C — Guardar o trabalho

13. Exporte o workflow: menu **⋯ → Download**. Guarde o `.json`.

> 💡 Se quiser conferir o seu resultado depois de tentar sozinho, o gabarito
> está em [`assets/workflow-ex01-gabarito.json`](assets/workflow-ex01-gabarito.json).
> Para usá-lo: no editor, menu **⋯ → Import from file**. **Só abra depois de
> tentar** — você aprende muito mais errando o passo 4 do que importando a
> resposta.

## ✅ Checklist

- [ ] O workflow tem Manual Trigger → Edit Fields e executa sem erro.
- [ ] O campo `recebido_em` usa uma **expression** (aparece em modo Expression) e
      muda a cada execução.
- [ ] Você viu o mesmo dado em Schema, Table e JSON.
- [ ] O Schedule Trigger gerou execuções na aba **Executions**.
- [ ] Você **despublicou** o workflow no final.

## 📸 O que guardar para o relatório

- Print do canvas com os dois triggers ligados ao `Montar mensagem`.
- Print da saída do `Montar mensagem` (em JSON ou Table).
- Print da aba **Executions** com as execuções do agendamento.
- O JSON exportado do workflow.

## 🧪 Perguntas de reflexão

1. Qual é a diferença, na prática, entre o **Manual Trigger** e o **Schedule
   Trigger**? Dê um exemplo real de processo para cada um.
2. O campo `cliente` tem valor fixo e o `recebido_em` é uma expression. Se
   você executar o workflow 5 vezes, quais campos mudam e quais não?
3. Na Parte B, o `Montar mensagem` recebeu conexões de **dois** triggers. Quantos
   itens saem dele em cada execução? Por quê?
4. Por que eu insisti em você despublicar o workflow agendado? O que aconteceria
   com a sua EC2 e com o seu histórico de execuções se você esquecesse?

**Próximo passo:** [06-exercicio-02-json-e-expressions](../06-exercicio-02-json-e-expressions/README.md)
