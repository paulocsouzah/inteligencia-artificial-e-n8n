# 9. Exercício 05 — O AI Software Engineer na AWS

**Nível: 🔴 Avançado (opcional — vale bônus, pode terminar depois da aula).**

Este é o exercício que fecha o **módulo inteiro**, não só a aula de hoje.
A infraestrutura é a **mesma** da Aula 04 (VPC, EC2, RDS Postgres com
pgvector) — não muda uma linha de Terraform. O que muda é a
**aplicação**: a EC2 agora hospeda o AI Software Engineer completo do
Exercício 04 — as cinco ferramentas, o loop com guardrail, e a aprovação
humana — só que **web**, acessível por qualquer navegador, com um
detalhe importante: aprovação humana numa aplicação web não pode
"pausar" a requisição HTTP como o `readline` fazia no terminal — ela
precisa **devolver o controle** e retomar na próxima requisição. É o
padrão real de produção (uma fila de aprovação), não uma simplificação
de aula.

## 🎯 Objetivo

Provisionar a infraestrutura com Terraform (idêntica à da Aula 04),
popular o RDS com o runbook, e investigar incidentes através do AI
Software Engineer rodando na nuvem — incluindo o fluxo de aprovação
humana funcionando de verdade, através de requisições HTTP separadas.

## 🧭 Visão geral da arquitetura

```
Você (navegador)
      │  HTTP
      ▼
┌────────────────────────────────────┐
│  EC2 (subnet pública)                │
│  Nginx → Node.js (porta 3000)        │
│  AI Software Engineer:                │
│    buscar_codigo, ler_arquivo         │──── código/logs/banco em memória, no processo
│    consultar_logs, consultar_banco    │
│    consultar_documentacao (RAG) ──────┼──┐
│    sugerir_correcao (aprovação humana)│  │  Postgres (5432), só de dentro da VPC
└────────────────────────────────────┘  │
                                          ▼
                          ┌─────────────────────────────┐
                          │  RDS Postgres + pgvector     │
                          │  (subnet privada)             │
                          │  tabela "documentos"           │
                          └─────────────────────────────┘
```

> 💡 **Por que código/logs/banco não viraram tabelas no RDS:** o foco
> deste exercício é a arquitetura do agente (tools, loop, guardrails,
> aprovação humana) rodando de verdade na nuvem, com uma fonte real de
> dados (o RDS) para a documentação — não recriar três tabelas extras.
> Fica como evolução natural: migrar `bancoPedidos` para uma tabela de
> verdade no mesmo RDS, e trocar `consultarBanco` para consultar via SQL.

## 📎 O que já está pronto, em [`assets/`](assets/)

- **`assets/terraform/`** — a mesma VPC, EC2 e RDS Postgres+pgvector das
  Aulas 04 e do Exercício 04 desta aula. Já rodei `terraform validate`
  neste material — a sintaxe está correta.
- **`assets/app/`** — o AI Software Engineer completo (Node.js/Express,
  as cinco tools, o loop com guardrail, a aprovação humana como fluxo
  web de duas requisições) + `seed.js`, que popula o RDS com o runbook.
  Já testei o `node --check` dos três scripts.

## 📋 Passo a passo

### 1. Preparar seu próprio repositório da aplicação

```bash
cp -r assets/app ~/ai-software-engineer-aula05-app
cd ~/ai-software-engineer-aula05-app
git init
git add .
git commit -m "AI Software Engineer - Aula 05"
git remote add origin https://github.com/SEU-USUARIO/ai-software-engineer-aula05-app.git
git push -u origin main
```

### 2. Habilitar o AWS Academy e configurar o Terraform

1. Habilite o Learner Lab e copie as credenciais da AWS Academy.
2. Baixe o `vockey.pem` do Learner Lab e salve dentro de
   `assets/terraform/`.
3. Copie `terraform.tfvars.example` para `terraform.tfvars` e preencha:
   `my_ip`, `db_password`, `openai_api_key`, e `app_repo_url` (a URL do
   repositório do passo 1).

### 3. Provisionar a infraestrutura

```bash
cd assets/terraform
terraform init
terraform plan
terraform apply
```

A EC2 sobe a aplicação sozinha via `user_data`: instala Docker, clona seu
repositório, builda e inicia o container, **popula o RDS automaticamente**
com o runbook, e configura o Nginx. Ao final, o Terraform imprime o
`ec2_public_ip` e o `rds_endpoint`.

> ⚠️ Dê uns 2-3 minutos depois do `apply` terminar antes de acessar o
> `ec2_public_ip` — o `user_data` continua rodando em segundo plano.

### 4. Investigar um incidente

Abra `http://<ec2_public_ip>` no navegador e descreva um incidente, por
exemplo: *"a rota /pedidos está devolvendo erro 500 de forma
intermitente"*. Acompanhe o agente investigar. Se ele propuser uma
correção, você vai ver uma tela de **Aprovar / Rejeitar** — teste as duas
opções, em investigações diferentes.

### 5. Se precisar depurar (opcional)

```bash
ssh -i vockey.pem ec2-user@<ec2_public_ip>
sudo tail -100 /var/log/cloud-init-output.log
sudo docker compose -f /opt/app/docker-compose.yml logs
```

### 6. Destruir a infraestrutura ao terminar

```bash
cd assets/terraform
terraform destroy
```

## 🚀 Desafio extra — métricas AWS como sexta ferramenta

Fora do escopo obrigatório desta aula, mas se você quiser ir além: o AWS
Academy Learner Lab tem acesso limitado ao CloudWatch, mas, se disponível
na sua conta, vale explorar adicionar uma sexta tool,
`consultar_metricas_aws`, usando o SDK da AWS (`@aws-sdk/client-cloudwatch`)
para trazer métricas reais (CPU, latência) da própria EC2 como mais uma
fonte de investigação. Não é cobrado na avaliação desta aula — é uma
sugestão para quem quiser continuar depois.

## 🧪 Perguntas de reflexão

1. Compare este exercício com o Exercício 04 (terminal). O que mudou na
   **infraestrutura**? E o que mudou na forma como a aprovação humana
   funciona, mecanicamente?
2. No fluxo web, o estado da investigação pendente (mensagens, tool call
   pendente, iterações restantes) viaja inteiro num campo oculto do
   formulário, em texto aberto. Em produção de verdade, onde esse estado
   deveria viver, e por quê?
3. Teste rejeitar uma correção proposta. O agente conseguiu continuar a
   investigação depois da rejeição, ou parou ali? O que isso te diz sobre
   como o resultado da aprovação (aprovado ou rejeitado) precisa ser
   comunicado de volta ao modelo?
4. Pensando em tudo que você já construiu no curso de DevOps e nesta
   disciplina de IA: quais peças dessa infraestrutura você já tinha visto
   antes? O que foi genuinamente novo?
5. Esse agente está rodando com HTTP simples, sem HTTPS, sem
   autenticação — qualquer pessoa que soubesse o IP poderia investigar
   (e aprovar correções) no seu sistema. O que faltaria, no mínimo, antes
   de considerar isso pronto para uma equipe de verdade usar?

**Próximo passo:** [10-exercicio-final](../10-exercicio-final/README.md)
