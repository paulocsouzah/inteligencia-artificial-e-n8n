# Variáveis do ambiente n8n — a mesma família de infraestrutura do curso de DevOps
# e da disciplina de IA (VPC + subnet pública + EC2), agora com o n8n rodando em
# Docker dentro da EC2. Não há RDS aqui: o n8n guarda tudo num SQLite dentro de um
# volume Docker, que é o suficiente para a disciplina inteira.
#
# Como usar: copie terraform.tfvars.example para terraform.tfvars, preencha e rode
# terraform init / plan / apply. O passo a passo está no README do módulo.

variable "aws_region" {
  description = "Região AWS onde os recursos serão criados"
  type        = string
  default     = "us-east-1"
}

variable "availability_zone" {
  description = "Availability Zone da subnet pública (onde a EC2 mora)"
  type        = string
  default     = "us-east-1a"
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

variable "project_name" {
  description = "Prefixo usado no nome/tags de todos os recursos deste ambiente"
  type        = string
  default     = "n8n-faex"
}

variable "my_ip" {
  description = "Seu IP público, usado para restringir o acesso SSH (defina em terraform.tfvars)"
  type        = string
}

variable "http_allowed_cidr" {
  description = "Quem pode abrir o n8n (porta 80). O padrão é a internet inteira, porque serviços externos precisam chamar seus webhooks. Para fechar só para você, use \"SEU_IP/32\"."
  type        = string
  default     = "0.0.0.0/0"
}

variable "instance_type" {
  description = "Tamanho da EC2. O n8n roda bem em 2 GB de RAM (t3.small); numa t3.micro (1 GB) ele sobe, mas fica apertado com workflows maiores."
  type        = string
  default     = "t3.small"
}

variable "n8n_version" {
  description = "Tag da imagem n8nio/n8n. Fixo de propósito: com \"latest\", o n8n da sua aula muda sozinho entre um apply e outro."
  type        = string
  default     = "2.40.5"
}

variable "timezone" {
  description = "Fuso horário do n8n e da EC2 — decide a hora em que um Schedule Trigger dispara"
  type        = string
  default     = "America/Sao_Paulo"
}
