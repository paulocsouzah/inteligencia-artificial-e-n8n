# Security Group da EC2 — SSH restrito ao meu IP, HTTP público (onde o
# Nginx do host expõe o agente).
resource "aws_security_group" "web" {
  name        = "${var.project_name}-sg-web"
  description = "Libera SSH (restrito ao meu IP) e HTTP (publico)"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "SSH apenas do meu IP"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["${var.my_ip}/32"]
  }

  ingress {
    description = "HTTP publico"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description = "Todo trafego de saida"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-sg-web"
  }
}

# Security Group do banco — só aceita Postgres (5432) vindo do Security
# Group da EC2 (nunca de um CIDR aberto).
resource "aws_security_group" "rds" {
  name        = "${var.project_name}-sg-rds"
  description = "Permite Postgres apenas a partir da EC2 da aplicacao"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "Postgres a partir da EC2"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.web.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-sg-rds"
  }

  lifecycle {
    create_before_destroy = true
  }
}
