# 🔌 Disciplina 2 — n8n

**Meu objetivo com esta disciplina** é fazer você sair sabendo **conectar**
sistemas, APIs, bancos de dados e IA num processo que roda sozinho —
projetando workflows que validam, tratam erro e não quebram na primeira
mensagem estranha que chegar.

Na disciplina irmã, [Inteligência Artificial](<../Disciplina 1 - Inteligencia Artificial/README.md>),
eu te ensinei a **criar** capacidades inteligentes: triar uma mensagem, buscar
a política certa, investigar um incidente. Aqui eu te ensino a **ligar**
essas capacidades ao resto do mundo — o formulário que o cliente preenche, o
WhatsApp que ele usa, o sistema de pedidos que guarda a resposta.

## ☁️ O ambiente: n8n numa EC2, sempre com Terraform

Toda aula desta disciplina traz, junto, o **Terraform que sobe o seu n8n na
AWS**: uma EC2 com o n8n já instalado e configurado em Docker, com IP fixo,
pronta para receber webhooks de verdade. É a mesma infraestrutura que você
construiu no curso de
[DevOps com AWS](https://github.com/paulocsouzah/devops-com-aws-infraestrutura-e-automacao),
agora servindo a um propósito novo.

Por que eu insisto em subir o n8n **você mesmo**, em vez de só abrir uma conta
em um serviço pronto? Porque um webhook precisa de um endereço que a internet
alcança — e é isso que faz o n8n deixar de ser "um brinquedo que roda no meu
notebook" e virar uma automação de verdade. E porque, no mercado, é assim que
muita empresa opera: n8n hospedado por conta própria, dentro da própria nuvem,
com os dados sob controle.

> Se o Learner Lab estiver fora do ar num dia de aula, eu deixo um plano B em
> cada aula: o n8n Cloud (trial gratuito) ou o n8n num Docker local. Você não
> fica parado. Mas o caminho principal é a EC2.

## 📚 Aulas

| # | Aula | Formato | Tema | Status |
|---|------|---------|------|--------|
| 1 | [Fundamentos do n8n](<Aula 01 - Fundamentos do n8n/README.md>) | Presencial | Workflow, trigger, node, JSON, expressions, webhooks — e o n8n no ar na sua EC2 | ✅ Disponível |
| 2 | [Integrações reais e IA no fluxo](<Aula 02 - Integrações Reais e IA no n8n/README.md>) | Online | REST, headers, autenticação (API Key, Bearer, OAuth2), paginação — e uma IA de verdade lendo e-mail e respondendo pelo Gmail | ✅ Disponível |
| 3 | Workflows avançados e IA com rede de proteção | Online | IF/Switch, loops, error handling, sub-workflows — e como blindar uma chamada de IA (retry, custo, timeout, validação da saída) | 🔜 Planejada |
| 4 | IA aprofundada no n8n | Online | Extração estruturada em múltiplas etapas, RAG conectado ao workflow, roteamento por intenção entre vários fluxos | 🔜 Planejada |
| 5 | AI Agents + n8n | Online | AI Agent nativo do n8n, tools, memória, guardrails | 🔜 Planejada |
| 6 | Projeto Final n8n | Presencial | Hackathon: automação real ponta a ponta | 🔜 Planejada |

> 📝 **Nota de percurso (turma 2026):** depois da Aula 01, a turma já chegou
> com domínio sólido de n8n. Por isso eu adiantei, para a Aula 02, o que
> originalmente só entraria na Aula 04: uma IA de verdade dentro do workflow.
> Vocês já sabem IA (Disciplina 1) — o que faltava era só a mecânica de chamá-la
> de dentro do n8n, e isso é, no fundo, mais uma API com autenticação. As Aulas
> 3 e 4 mudam de foco: em vez de *apresentar* IA no n8n, elas **aprofundam** —
> proteger essas chamadas e orquestrar fluxos mais sofisticados.

**Como usar:** siga as aulas na ordem numérica. Dentro de cada aula, siga
também as subpastas na ordem — cada uma parte do que foi construído na
anterior.

## 🧭 Trilha de conceitos

```
Aula 1              Aula 2              Aula 3              Aula 4            Aula 5        Aula 6
Workflow, webhook → API, auth, 1ª IA → IF/erro, IA blindada → IA aprofundada → AI Agent  → Projeto Final
                                                                 (RAG, roteio)   no n8n
```

## 🎯 O projeto que atravessa a disciplina — AI Customer Service

Um cliente manda uma mensagem → o **n8n** recebe e organiza → uma **IA**
entende o que ele quer → o workflow consulta um sistema e **decide** → responde
sozinho ou chama uma pessoa. Cada aula entrega uma peça:

| Aula | A peça que você constrói |
|------|--------------------------|
| 1 | A **porta de entrada**: um webhook que recebe a mensagem, organiza os dados, gera um protocolo e responde |
| 2 | **Consultar e entender**: chamar APIs de verdade (com autenticação) e ligar uma IA que lê o e-mail do cliente, analisa e responde sozinha |
| 3 | **Decidir e se proteger**: rotear por tipo, tratar erro — inclusive erro de IA (timeout, custo, saída malformada) |
| 4 | **Aprofundar**: extrair dados estruturados em várias etapas e decidir o fluxo certo (venda/suporte/financeiro) consultando uma base de conhecimento (RAG) |
| 5 | **Agir**: um agente escolhe as ferramentas sozinho |
| 6 | **Juntar tudo** num hackathon |

📂 [Começar pela Aula 01](<Aula 01 - Fundamentos do n8n/README.md>)
