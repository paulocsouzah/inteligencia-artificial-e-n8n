# 1. Contexto e problema real

Na Disciplina 1, você construiu capacidades: triar uma mensagem, buscar a
política certa entre vários documentos, investigar um incidente sozinho. Cada
uma delas funciona. Mas repare em uma coisa que a gente nunca discutiu: **como
a mensagem do cliente chegou até o seu código?** Em todos os exercícios, eu
entreguei a mensagem pronta, dentro de uma variável. No mundo real, ninguém
faz isso por você.

---

## 📋 O trabalho invisível: a "cola"

Pense na mesma loja virtual que a gente usa desde a Aula 03. Segunda-feira,
9h. Um cliente preenche o formulário do site: *"Meu pedido 4521 ainda não
chegou"*. O que acontece a seguir, na maioria das empresas:

| # | O que alguém faz | Tipo de trabalho |
|---|------------------|------------------|
| 1 | Abre o e-mail (ou o painel do formulário) e lê a mensagem | Receber |
| 2 | Copia o número do pedido | Copiar e colar |
| 3 | Abre o sistema de pedidos e consulta o status | Consultar |
| 4 | Abre uma planilha de reclamações e registra uma linha | Copiar e colar |
| 5 | Responde o cliente com o status | Responder |
| 6 | Se o pedido estiver atrasado, avisa o time de logística no chat | Avisar |

Nenhum desses passos é difícil. O problema é a **soma**: são minutos por
mensagem, multiplicados por centenas de mensagens, com uma chance real de erro
em cada cópia (o número do pedido digitado errado, o aviso que ficou
esquecido). Esse trabalho não aparece em nenhum organograma e ninguém foi
contratado para fazê-lo — mas alguém o faz todo dia. Eu chamo de **cola**: é
o que gruda um sistema no outro.

Repare que **nenhum passo exige julgamento**. É sempre a mesma regra: "chegou
mensagem → registra → consulta → responde". Isso é exatamente o tipo de coisa
que um **workflow** faz melhor que uma pessoa: sem cansar, sem errar a cópia,
às 3h da manhã.

## 🏢 Dois casos reais

Eu não quero que você acredite só porque eu estou dizendo. Olha o que
empresas grandes registraram, no site do próprio n8n:

**Delivery Hero — recuperação de conta.** A Delivery Hero é uma plataforma de
delivery presente em mais de 70 países, com mais de 53 mil funcionários. Uma
das dores do time de TI era gente bloqueada fora da própria conta: cerca de
**800 pedidos por mês**, e cada recuperação levava em média **35 minutos**.
Com um único workflow no n8n — os pedidos tratados automaticamente e o gerente
só aprovando — o tempo médio caiu de **35 para 20 minutos**, o que somou
cerca de **200 horas por mês** a menos de gente parada. E o mais interessante:
o resultado de *um* workflow fez a empresa procurar outros processos manuais
para automatizar, como desligamento de contas e atribuição de licenças de
software.

**StepStone — integração de dados de empregadores.** Os anúncios de vagas
chegam de empregadores diferentes, em formatos diferentes, e precisam ser
limpos e padronizados antes de entrar na plataforma. Conectar uma nova fonte
de dados levava cerca de **duas semanas** de engenharia. Com o n8n, o time
prototipa e integra uma nova fonte em cerca de **duas horas**, testando a
conexão da API e a transformação dos dados no mesmo lugar. Segundo o próprio
case, a empresa passou de **700 workflows ativos**.

> ℹ️ São números divulgados pelas próprias empresas nos estudos de caso do n8n
> ([Delivery Hero](https://n8n.io/case-studies/delivery-hero/) e
> [StepStone](https://n8n.io/case-studies/stepstone/)). Eu uso como **ordem de
> grandeza**, não como promessa: o que importa é ver que o ganho vem de tirar
> gente do meio de um processo repetitivo.

Repare no padrão dos dois casos: **nenhum deles inventou uma tecnologia
nova**. Pegaram passos que já existiam e passaram a executá-los sem alguém no
meio.

## 🧩 "Mas eu sei programar. Por que não escrevo um script?"

Boa pergunta — e a resposta honesta é: **você pode**, e muitas vezes deve. Na
Disciplina 1, você escreveu bastante código. A pergunta certa é *onde* cada
abordagem vence:

| | Escrever código | Montar no n8n |
|---|---|---|
| Ligar dois sistemas que já têm API | Você escreve o cliente, a autenticação, o tratamento de erro | Você arrasta um node e preenche |
| Ver o que aconteceu num passo | Você põe `console.log` e roda de novo | Cada node mostra a entrada e a saída, e a execução fica gravada |
| Alguém que não programa entender o processo | Precisa ler o código | Olha o desenho |
| Lógica de negócio muito complexa | ✅ Mais natural | Fica confuso rápido |
| Desempenho extremo, milhões de itens | ✅ Mais adequado | Não é o foco |
| Testes automatizados, revisão em pull request | ✅ Muito mais maduro | Possível, mas menos natural |

Minha regra de bolso: **o n8n é a cola e o maestro; o código continua onde a
lógica é pesada.** E o n8n tem um node de código (o `Code`, que você vai usar
no Exercício 02) exatamente para você não ter de escolher um lado.

## 🧠 E onde a IA entra?

Esta é a conexão com o que você fez antes. A IA é uma **capacidade** — entender
uma mensagem, extrair dados, decidir o próximo passo. O n8n é o **maestro** que
chama essa capacidade no momento certo, com os dados certos, e leva o
resultado até o sistema que precisa dele.

```
                       ┌──────────────┐
  Formulário  ───────▶ │              │ ────▶  Sistema de pedidos
  WhatsApp    ───────▶ │     n8n      │ ────▶  Planilha / banco
  E-mail      ───────▶ │  (o maestro) │ ────▶  Chat do time
                       │      │       │
                       └──────┼───────┘
                              ▼
                        🧠 IA (LLM, RAG, Agent)
```

## 🧭 Para onde isso vai

O nosso cenário integrador, o **AI Customer Service**, ganha uma peça por aula:

| Aula | O que você constrói |
|------|---------------------|
| **1 (esta)** | A **porta de entrada**: um webhook recebe a mensagem, organiza os dados, gera o protocolo e responde |
| 2 | Consultar o status do pedido numa API |
| 3 | Decidir por tipo, tratar erro e barrar entrada inválida |
| 4 | Um LLM classifica a mensagem e extrai os dados |
| 5 | Um agente escolhe as ferramentas sozinho |
| 6 | Hackathon: juntar tudo |

## 🧪 Exercício

Antes de seguir para o ambiente, responda por escrito:

1. Descreva uma tarefa repetitiva que **você** (ou alguém do seu trabalho, do seu
   estágio, da sua família) faz copiando dados de um lugar para outro. Quais
   são os passos? Quanto tempo leva por semana?
2. Dos passos que você listou, quais são **"sempre iguais"** (uma regra que dá
   para escrever) e quais **exigem julgamento** (é preciso entender o
   contexto)? Guarde essa divisão: os primeiros são candidatos a workflow; os
   segundos, a IA (Aula 4).
3. Se o volume dessa tarefa fosse **dez vezes maior**, o que quebraria primeiro
   — o tempo, a qualidade ou a paciência de quem faz?

**Próximo passo:** [02-ambiente-n8n-na-aws](../02-ambiente-n8n-na-aws/README.md)
