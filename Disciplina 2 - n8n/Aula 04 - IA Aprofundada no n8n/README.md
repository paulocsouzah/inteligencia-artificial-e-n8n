# 🧠🏬 Aula 04 — IA Aprofundada no n8n

**Formato:** Online

Eu ouvi o feedback das últimas aulas: muita teoria, pouca integração de
verdade. Hoje eu corrijo isso. Em vez de uma base de conhecimento inventada
dentro de um Code node, você vai trabalhar em cima de um sistema real: a
**Loja FAEX** — uma lojinha de verdade, com frontend, API e banco de dados
(RDS MySQL), que recebe pedidos e reclamações de clientes de verdade.

O workflow de hoje não lê mais um JSON de teste. Ele faz um `GET` numa API
real, processa o que vier, e grava a resposta **de volta no banco**, com um
`PATCH`. É o mesmo tipo de sistema que você vai encontrar no mercado.

## 🛒 A Loja FAEX

Antes de tudo, [leia o README do ambiente compartilhado](<../_ambiente-compartilhado-loja/README.md>) —
é ele que sobe a EC2, o RDS e o sistema da loja. Essa infraestrutura é
**compartilhada**: vale para esta aula, para a Aula 05 e para o projeto
final (Aula 06).

Resumo rápido: a loja tem produtos, pedidos e reclamações. Um cliente compra
um produto (gera um pedido, com protocolo). Se algo dá errado, ele registra
uma reclamação. É essa reclamação que o seu workflow de n8n vai processar:
entender o que o cliente quer, consultar as políticas da loja, decidir e
responder — ou escalar para um humano.

## 📚 Estrutura

| Pasta | Conteúdo |
|-------|----------|
| [01-contexto-e-problema-real](01-contexto-e-problema-real/README.md) | Por que uma IA que "inventa bem" é o risco mais caro do atendimento |
| [02-ambiente-n8n-na-aws](02-ambiente-n8n-na-aws/README.md) | A infraestrutura compartilhada: n8n + a Loja FAEX + RDS |
| [03-conceitos-fundamentais](03-conceitos-fundamentais/README.md) | Schema fechado, consultar um sistema real em vez de dado inventado, cadeia de etapas, a pegadinha do "uma vez por item" |
| [04-demonstracao-guiada](04-demonstracao-guiada/README.md) | Eu construo ao vivo: comprar na loja, reclamar, e o workflow processando isso de verdade |
| [05-exercicio-01-extracao-estruturada](05-exercicio-01-extracao-estruturada/README.md) | 🟢 Extrair dados de uma reclamação **real**, vinda da API |
| [06-exercicio-02-classificacao-e-roteamento](06-exercicio-02-classificacao-e-roteamento/README.md) | 🟡 Classificar a intenção e **gravar de volta** na loja com `PATCH` |
| [07-exercicio-03-rag-em-memoria](07-exercicio-03-rag-em-memoria/README.md) | 🟠 Responder com as políticas **reais** da loja, buscadas pela API |
| [08-exercicio-04-multiplas-etapas](08-exercicio-04-multiplas-etapas/README.md) | 🟠 Encadear as três etapas numa reclamação real, do início ao fim |
| [09-exercicio-final](09-exercicio-final/README.md) | 🎯 **O projeto da aula:** processar **todas** as reclamações novas, decidir e responder por e-mail |

## ▶️ Como usar

Siga as pastas na ordem numérica. Diferente das aulas anteriores, hoje a
infraestrutura é compartilhada com as Aulas 05 e 06 — veja o módulo 02 antes
de tudo.

**Pré-requisitos:**

- Ter feito as Aulas 02 e 03.
- O ambiente compartilhado no ar (módulo 02): n8n + Loja FAEX + RDS.
- Uma chave de API da OpenAI com crédito.

## 🎯 Objetivos de aprendizagem

Ao final desta aula, você será capaz de:

- Consultar um sistema real por `GET` e gravar o resultado do seu
  processamento de volta por `PATCH` — fechando o ciclo "ler → processar →
  escrever", em vez de só ler um dado de teste.
- Pedir uma saída estruturada com um **schema fechado** e explicar por que
  `additionalProperties: false` e `strict: true` importam.
- Responder com base numa fonte de dados real (a tabela de políticas da
  loja), em vez de um texto fixo dentro do workflow.
- Dividir uma tarefa em **etapas com uma responsabilidade cada**, e perceber
  quando uma instrução que mistura duas tarefas degrada a resposta.
- Reconhecer e corrigir a diferença entre um Code node rodando **uma vez
  para todos os itens** e **uma vez por item** — um erro que não lança
  exceção, só processa menos do que devia.
- Processar **uma lista inteira** de registros reais (não só um de teste),
  e saber por que isso quebra fácil se você não prestar atenção no ponto
  acima.

## 🏁 Avaliação

O módulo [09-exercicio-final](09-exercicio-final/README.md) fecha a aula.
Relatório em PDF com prints e respostas, mais o workflow exportado em JSON.
Rubrica no próprio módulo.

**Próxima aula:** Aula 05 — AI Agents com n8n (um agente que escolhe as
ferramentas sozinho, consultando a mesma Loja FAEX).
