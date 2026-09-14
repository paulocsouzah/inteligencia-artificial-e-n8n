# 7. Exercício 04 — RAG com Infraestrutura Real (VPC + EC2 + RDS)

**Nível: 🔴 Avançado (opcional — vale bônus, pode terminar depois da aula).**

Este é o exercício que fecha o **módulo inteiro**, não só a aula de hoje.
Lembra do curso de DevOps — VPC, EC2, RDS, Terraform? Hoje você reaproveita
exatamente essa infraestrutura para hospedar o RAG que construiu nos
exercícios anteriores: em vez de um array em memória (que "esquece" tudo
quando o script termina), os documentos e embeddings vão morar num **RDS
Postgres com a extensão pgvector**, e o chatbot roda numa **EC2** de
verdade, acessível por qualquer navegador.

## 🎯 Objetivo

Provisionar a infraestrutura com Terraform, popular o banco com os
documentos + embeddings, e conversar com o chatbot RAG rodando na nuvem —
juntando, num único exercício, tudo que você aprendeu no curso de DevOps
e neste módulo de IA.

## 🧭 Visão geral da arquitetura

```
Você (navegador)
      │  HTTP
      ▼
┌─────────────────────────────┐
│  EC2 (subnet pública)        │
│  Nginx → Node.js (porta 3000)│
│  Chatbot RAG                 │
└──────────────┬────────────────┘
               │  Postgres (5432), só de dentro da VPC
               ▼
┌─────────────────────────────┐
│  RDS Postgres + pgvector     │
│  (subnet privada)             │
│  tabela "documentos"          │
└─────────────────────────────┘
```

Repare: é a **mesma arquitetura** do `app-aula03` que você já provisionou
no curso de DevOps (EC2 pública + RDS privado, Nginx como reverse proxy,
Docker Compose subindo a aplicação via `user_data`) — só troca o MySQL
por Postgres+pgvector, e a aplicação de estoque pelo chatbot RAG.

## 📎 O que já está pronto, em [`assets/`](assets/)

- **`assets/terraform/`** — todo o Terraform (VPC, subnets, security
  groups, RDS Postgres, EC2), adaptado do que você já usou nas Aulas 03 e
  04 do curso de DevOps. Já rodei `terraform validate` neste material —
  a sintaxe está correta.
- **`assets/app/`** — o chatbot (Node.js/Express) + o script `seed.js`
  que popula o banco. Já testei o boot da aplicação e o `node --check`
  dos dois scripts.

## 📋 Passo a passo

### 1. Preparar seu próprio repositório da aplicação

O Terraform faz `git clone` do repositório da aplicação dentro da EC2 —
então você precisa de um repositório **seu** com o conteúdo de
`assets/app/`:

```bash
# Copie assets/app/ para uma pasta nova, fora deste repositório
cp -r assets/app ~/rag-aula04-app
cd ~/rag-aula04-app
git init
git add .
git commit -m "Chatbot RAG - Aula 04"
# Crie um repositório novo no GitHub e faça o push
git remote add origin https://github.com/SEU-USUARIO/rag-aula04-app.git
git push -u origin main
```

### 2. Habilitar o AWS Academy e configurar o Terraform

1. Habilite o Learner Lab e copie as credenciais da AWS Academy (mesmo
   procedimento do curso de DevOps).
2. Baixe o `vockey.pem` do Learner Lab e salve dentro de
   `assets/terraform/`.
3. Copie `terraform.tfvars.example` para `terraform.tfvars` e preencha:
   `my_ip`, `db_password`, `openai_api_key`, e `app_repo_url` (a URL do
   repositório que você criou no passo 1).

### 3. Provisionar a infraestrutura

```bash
cd assets/terraform
terraform init
terraform plan
terraform apply
```

Isso leva alguns minutos — o RDS demora mais que a EC2 para ficar
disponível (na minha validação, uns 5-6 minutos só o RDS). A EC2 sobe a
aplicação sozinha via `user_data`: instala Docker, clona seu repositório,
builda e inicia o container, **popula o banco automaticamente** (o
`seed.js` roda como parte do próprio `user_data` — o RDS não tem IP
público, então esse passo só pode acontecer de dentro da VPC mesmo, não
da sua máquina) e configura o Nginx. Ao final, o Terraform imprime o
`ec2_public_ip` e o `rds_endpoint` (outputs).

> ⚠️ Dê uns 2-3 minutos depois do `apply` terminar antes de acessar o
> `ec2_public_ip` — o `user_data` continua rodando em segundo plano
> depois que a EC2 aparece como "criada".

### 4. Se precisar depurar (opcional)

Se o chatbot não responder depois de alguns minutos, entre via SSH (com o
`vockey.pem` baixado do Learner Lab) e confira o que rodou:

```bash
ssh -i vockey.pem ec2-user@<ec2_public_ip>
sudo tail -100 /var/log/cloud-init-output.log
sudo docker compose -f /opt/app/docker-compose.yml logs
```

Para repopular o banco manualmente (ex.: depois de editar o manual de
políticas em `seed.js`), rode de dentro da EC2:

```bash
cd /opt/app && sudo docker compose exec app node seed.js
```

### 5. Conversar com o chatbot

Abra `http://<ec2_public_ip>` no navegador e faça perguntas sobre
reembolso, garantia, frete, troca e cancelamento — as mesmas do
Exercício 03, agora respondidas por uma aplicação de verdade, hospedada
na AWS, consultando um banco de dados real.

### 6. Destruir a infraestrutura ao terminar

**Importante:** RDS e EC2 custam enquanto estiverem no ar. Ao terminar os
testes:

```bash
cd assets/terraform
terraform destroy
```

## 🧪 Perguntas de reflexão

1. Compare a arquitetura deste exercício com a do Exercício 03 (array em
   memória). O que mudou na forma como os dados são **guardados**? E na
   forma como o RAG em si funciona (retrieval + geração)?
2. Por que o RDS fica numa subnet **privada**, sem IP público, e só
   aceita conexão vindo do Security Group da EC2? Que problema de
   segurança isso evita?
3. Se você precisasse adicionar um novo documento à base (ex.: uma nova
   política), o que mudaria no seu fluxo de trabalho comparado ao array
   em memória do Exercício 03?
4. Pensando em tudo que você já construiu no curso de DevOps: quais
   peças dessa infraestrutura você já tinha visto antes? O que foi
   genuinamente novo?
5. Esse chatbot está rodando com HTTP simples, sem HTTPS, sem
   autenticação, e o Security Group libera a porta 80 para qualquer IP.
   O que faltaria, no mínimo, antes de considerar isso pronto para
   clientes reais usarem?

**Próximo passo:** [08-exercicio-final](../08-exercicio-final/README.md)
