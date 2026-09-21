# Variáveis do projeto — a MESMA infraestrutura das Aulas 04 e 05 (VPC + EC2 +
# RDS Postgres com pgvector). O que muda em relação àquelas aulas é só o que
# roda dentro da EC2: o container do AI Detective, que já vem com RAG e agente.
#
# Como usar: copie terraform.tfvars.example para terraform.tfvars, preencha e
# rode terraform init / plan / apply. O passo a passo está no README do projeto.

variable "aws_region" {
  description = "Região AWS onde os recursos serão criados"
  type        = string
  default     = "us-east-1"
}

variable "availability_zone" {
  description = "Availability Zone onde a subnet pública (EC2) será criada"
  type        = string
  default     = "us-east-1a"
}

variable "availability_zone_b" {
  description = "Segunda Availability Zone, usada pela subnet privada do RDS (precisa ser diferente da AZ da subnet pública)"
  type        = string
  default     = "us-east-1b"
}

variable "vpc_cidr" {
  description = "Faixa de IPs (CIDR) da VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidr" {
  description = "Faixa de IPs (CIDR) da subnet pública"
  type        = string
  default     = "10.0.1.0/24"
}

variable "private_subnet_cidr" {
  description = "Faixa de IPs (CIDR) da subnet privada, onde o RDS mora"
  type        = string
  default     = "10.0.2.0/24"
}

variable "project_name" {
  description = "Prefixo usado no nome/tags de todos os recursos deste projeto"
  type        = string
  default     = "ai-detective"
}

variable "my_ip" {
  description = "Seu IP público, usado para restringir o acesso SSH (defina em terraform.tfvars)"
  type        = string
}

variable "db_name" {
  description = "Nome do banco de dados (schema) criado dentro da instância RDS"
  type        = string
  default     = "ai_detective"
}

variable "db_username" {
  description = "Usuário administrador do RDS"
  type        = string
  default     = "agenteadmin"
}

variable "db_password" {
  description = "Senha do usuário administrador do RDS (defina em terraform.tfvars, nunca aqui)"
  type        = string
  sensitive   = true
}

variable "db_engine_version" {
  description = "Versão do PostgreSQL — precisa ser >= 15.2 para suportar a extensão pgvector nativamente. Confira com `aws rds describe-db-engine-versions --engine postgres` quais versões estão disponíveis na sua conta/região antes do apply, essa lista muda com o tempo."
  type        = string
  default     = "16.15"
}

variable "app_repo_url" {
  description = "URL HTTPS do repositório Git que contém este projeto (a EC2 clona e sobe o container). Repositório público, ou a EC2 não consegue clonar."
  type        = string
}

variable "openai_api_key" {
  description = "API key da OpenAI: embeddings, visão e o agente (defina em terraform.tfvars, nunca aqui)"
  type        = string
  sensitive   = true
}

variable "app_subdir" {
  description = "Pasta do projeto dentro do repositório, se ele não estiver na raiz. Ex.: \"ai-detective\" quando o repositório tem várias pastas. Deixe vazio se o Dockerfile está na raiz."
  type        = string
  default     = ""
}

variable "app_branch" {
  description = "Branch do repositório a clonar. Deixe vazio para usar a branch padrão."
  type        = string
  default     = ""
}

variable "instance_type" {
  description = "Tamanho da EC2. O `next build` dentro do Docker estoura a memória de uma t2.micro (1 GB); t3.small (2 GB) é o mínimo confortável."
  type        = string
  default     = "t3.small"
}
