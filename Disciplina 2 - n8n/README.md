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
| 2 | Integrações e APIs | Online | REST, headers, autenticação, paginação | 🔜 Planejada |
| 3 | Workflows avançados | Presencial | IF/Switch, loops, error handling, sub-workflows | 🔜 Planejada |
| 4 | n8n + IA | Online | Classificação, extração e geração de conteúdo com LLM no workflow | 🔜 Planejada |
| 5 | AI Agents + n8n | Presencial | AI Agent nativo do n8n, tools, memória, guardrails | 🔜 Planejada |
| 6 | Projeto Final n8n | Presencial | Hackathon: automação real ponta a ponta | 🔜 Planejada |

**Como usar:** siga as aulas na ordem numérica. Dentro de cada aula, siga
também as subpastas na ordem — cada uma parte do que foi construído na
anterior.

## 🧭 Trilha de conceitos

```
Aula 1              Aula 2         Aula 3              Aula 4         Aula 5           Aula 6
Workflow, webhook → APIs e REST → IF, loop, erros  →  n8n + IA   →  AI Agent no n8n → Projeto Final
```

## 🎯 O projeto que atravessa a disciplina — AI Customer Service

Um cliente manda uma mensagem → o **n8n** recebe e organiza → uma **IA**
entende o que ele quer → o workflow consulta um sistema e **decide** → responde
sozinho ou chama uma pessoa. Cada aula entrega uma peça:

| Aula | A peça que você constrói |
|------|--------------------------|
| 1 | A **porta de entrada**: um webhook que recebe a mensagem, organiza os dados, gera um protocolo e responde |
| 2 | **Consultar sistemas**: buscar o status do pedido numa API |
| 3 | **Decidir e se proteger**: rotear por tipo, tratar erro, não deixar entrada inválida passar |
| 4 | **Entender**: um LLM classifica a mensagem e extrai os dados |
| 5 | **Agir**: um agente escolhe as ferramentas sozinho |
| 6 | **Juntar tudo** num hackathon |

📂 [Começar pela Aula 01](<Aula 01 - Fundamentos do n8n/README.md>)
