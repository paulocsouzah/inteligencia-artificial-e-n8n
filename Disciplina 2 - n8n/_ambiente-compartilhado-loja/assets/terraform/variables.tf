# Variáveis do ambiente compartilhado — n8n + a "loja" (API/frontend em Node,
# banco MySQL no RDS) na mesma EC2. Reaproveitado pelas Aulas 04, 05 e 06.
#
# Como usar: copie terraform.tfvars.example para terraform.tfvars, preencha
# e rode terraform init / plan / apply.

variable "aws_region" {
  description = "Região AWS onde os recursos serão criados"
  type        = string
  default     = "us-east-1"
}

variable "availability_zone" {
  description = "AZ da subnet pública (onde a EC2 mora)"
  type        = string
  default     = "us-east-1a"
}

variable "availability_zone_b" {
  description = "AZ da subnet privada (exigência do DB Subnet Group do RDS)"
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
  description = "Faixa de IPs (CIDR) da subnet privada (RDS)"
  type        = string
  default     = "10.0.2.0/24"
}

variable "project_name" {
  description = "Prefixo usado no nome/tags de todos os recursos deste ambiente"
  type        = string
  default     = "n8n-faex-loja"
}

variable "my_ip" {
  description = "Seu IP público, usado para restringir o acesso SSH (defina em terraform.tfvars)"
  type        = string
}

variable "http_allowed_cidr" {
  description = "Quem pode abrir o n8n e a loja. Padrão é a internet inteira (precisamos receber webhooks reais). Para fechar só para você, use \"SEU_IP/32\"."
  type        = string
  default     = "0.0.0.0/0"
}

variable "instance_type" {
  description = "Tamanho da EC2. t3.small roda bem o n8n + a API da loja juntos."
  type        = string
  default     = "t3.small"
}

variable "n8n_version" {
  description = "Tag da imagem n8nio/n8n. Fixo de propósito."
  type        = string
  default     = "2.40.5"
}

variable "timezone" {
  description = "Fuso horário do n8n e da EC2"
  type        = string
  default     = "America/Sao_Paulo"
}

variable "db_name" {
  description = "Nome do banco MySQL da loja"
  type        = string
  default     = "loja"
}

variable "db_username" {
  description = "Usuário do banco MySQL da loja"
  type        = string
  default     = "loja_admin"
}

variable "db_password" {
  description = "Senha do banco MySQL da loja (defina em terraform.tfvars — nunca commitada)"
  type        = string
  sensitive   = true
}
