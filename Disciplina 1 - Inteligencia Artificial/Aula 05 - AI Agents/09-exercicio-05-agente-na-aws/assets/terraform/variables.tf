# Variáveis do projeto — a MESMA infraestrutura da Aula 04 (VPC + EC2 +
# RDS Postgres com pgvector). Nada muda aqui em relação à Aula 04, exceto
# o nome do projeto e o repositório da aplicação: quem muda é o agente
# que roda dentro da EC2, não a infraestrutura em si.

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
  default     = "aula05-agente"
}

variable "my_ip" {
  description = "Seu IP público, usado para restringir o acesso SSH (defina em terraform.tfvars)"
  type        = string
}

variable "db_name" {
  description = "Nome do banco de dados (schema) criado dentro da instância RDS"
  type        = string
  default     = "agente_aula05"
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
  description = "URL HTTPS do repositório Git da aplicação (assets/app desta aula), clonado pelo user_data"
  type        = string
}

variable "openai_api_key" {
  description = "API key da OpenAI, usada pelo agente para gerar embeddings, decidir tool calls e responder (defina em terraform.tfvars, nunca aqui)"
  type        = string
  sensitive   = true
}
