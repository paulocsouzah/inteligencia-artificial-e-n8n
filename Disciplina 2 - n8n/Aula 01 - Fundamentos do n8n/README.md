# 🔌 Aula 01 — Fundamentos do n8n

**Formato:** Presencial

Até agora, tudo o que você construiu na Disciplina 1 vivia dentro de um
programa seu: um script que triava mensagens, um app que respondia com RAG, um
agente que investigava incidentes. Mas o mundo real não chega até o seu código
sozinho. O cliente preenche um formulário, escreve no WhatsApp, um sistema de
pedidos dispara um aviso — e **alguém precisa pegar aquilo e levar até a sua
IA**. Hoje esse "alguém" deixa de ser uma pessoa copiando e colando e passa a
ser um **workflow**.

Hoje eu te apresento o **n8n**: uma ferramenta para montar, de forma visual,
processos que ligam sistemas entre si. E como todo o resto da disciplina depende
dele, a primeira coisa que a gente faz é colocá-lo no ar — **na sua própria EC2,
com Terraform**, do jeito que você já sabe fazer.

No fim da aula você terá a **porta de entrada** do nosso projeto integrador, o
AI Customer Service: um endereço na internet que recebe a mensagem de um
cliente, organiza os dados, gera um número de protocolo e responde. Ainda sem IA
— ela entra na Aula 4. Antes de ligar o cérebro, eu quero que você domine o
corpo.

## 📚 Estrutura

| Pasta | Conteúdo |
|-------|----------|
| [01-contexto-e-problema-real](01-contexto-e-problema-real/README.md) | O trabalho invisível de copiar e colar entre sistemas — e dois casos reais de empresas que o automatizaram |
| [02-ambiente-n8n-na-aws](02-ambiente-n8n-na-aws/README.md) | **Terraform:** uma EC2 com o n8n configurado, IP fixo e webhooks funcionando. Você sobe o ambiente que vai usar a disciplina toda |
| [03-conceitos-fundamentais](03-conceitos-fundamentais/README.md) | Workflow, trigger, node, items e JSON, expressions, webhook — o vocabulário completo da aula |
| [04-demonstracao-guiada](04-demonstracao-guiada/README.md) | Eu construo ao vivo, em seis passos, e mostro os quatro erros que você vai encontrar |
| [05-exercicio-01-primeiro-workflow](05-exercicio-01-primeiro-workflow/README.md) | 🟢 Básico — trigger manual, trigger agendado e o node Edit Fields |
| [06-exercicio-02-json-e-expressions](06-exercicio-02-json-e-expressions/README.md) | 🟡 Médio — três itens, seis expressions, e a pegadinha do `$json` |
| [07-exercicio-03-webhook](07-exercicio-03-webhook/README.md) | 🟡 Médio — seu primeiro webhook: URL de teste x URL de produção |
| [08-exercicio-04-recepcao-de-solicitacoes](08-exercicio-04-recepcao-de-solicitacoes/README.md) | 🟠 Complexo — **o projeto da aula:** a porta de entrada do AI Customer Service |
| [09-exercicio-final](09-exercicio-final/README.md) | Relatório final da aula + workflows exportados |

## ▶️ Como usar

Siga as pastas na ordem numérica. O módulo 02 é o único que você **precisa**
fazer antes de tudo: sem o n8n no ar, os exercícios não têm onde rodar.

**Pré-requisitos:**

- Ter feito o curso de DevOps (ou conhecer Terraform, Docker e EC2) — o módulo
  02 reaproveita tudo isso.
- **AWS Academy Learner Lab** ativo, com as credenciais configuradas na sua
  máquina (o mesmo procedimento do curso de DevOps), e o Terraform instalado.
- Um terminal com `curl` (você vai usá-lo nos exercícios 03 e 04).
- Nenhum conhecimento prévio de n8n. Eu construo tudo do zero.

**Não vai conseguir usar o Learner Lab hoje?** O módulo 02 tem um plano B (n8n
Cloud ou Docker local) que permite fazer **todos** os exercícios. Você só perde
a parte de o webhook ser alcançável de fora da sua máquina.

## 🎯 Objetivos de aprendizagem

Ao final desta aula, você será capaz de:

- Provisionar um n8n self-hosted na AWS com **Terraform** e explicar por que cada
  variável do container existe (`WEBHOOK_URL`, `N8N_SECURE_COOKIE`, o IP fixo).
- Explicar, com suas palavras, o que é um **workflow**, um **trigger**, um
  **node**, uma **conexão** e uma **execução**.
- Descrever como o n8n representa dados — uma **lista de itens**, cada um com um
  `json` — e prever quantas vezes um node vai rodar olhando quantos itens
  chegam nele.
- Escrever **expressions** (`{{ }}`, `$json`, `$('Node').item.json`, `$now`) para
  ler, limpar e combinar dados entre nodes.
- Criar um **webhook**, distinguir a **URL de teste** da **URL de produção**,
  publicar o workflow e responder ao cliente com o node **Respond to Webhook**.
- Reconhecer os erros mais comuns de um webhook (404 por método, por caminho, por
  workflow não publicado) e saber a causa de cada um só pela mensagem.
- Perceber que o n8n **não valida** o que chega — e saber o que isso significa
  para a segurança e a qualidade dos seus dados.

## 🏁 Avaliação

O módulo [09-exercicio-final](09-exercicio-final/README.md) fecha a aula. Você
entrega um **relatório em PDF** com os prints e as respostas às perguntas de
reflexão, **mais** os workflows exportados em JSON. Os detalhes e a rubrica estão
no próprio módulo.

**Próxima aula:** Aula 02 — Integrações e APIs (em breve).
