# Security Group da EC2 — SSH restrito ao meu IP; HTTP (redirect), HTTPS
# (n8n) e 8080 (a loja, sem TLS, só para fins didáticos).
resource "aws_security_group" "web" {
  name        = "${var.project_name}-sg-web"
  description = "Libera SSH (meu IP), HTTP/HTTPS do n8n e 8080 da loja"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "SSH apenas do meu IP"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["${var.my_ip}/32"]
  }

  ingress {
    description = "HTTP - so redireciona para HTTPS (nginx faz o 301)"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = [var.http_allowed_cidr]
  }

  ingress {
    description = "HTTPS do n8n (editor, webhooks e o callback do OAuth2)"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = [var.http_allowed_cidr]
  }

  ingress {
    description = "Loja (API + frontend), sem TLS, so didatico"
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = [var.http_allowed_cidr]
  }

  egress {
    description = "Todo trafego de saida (chamadas a APIs externas e ao RDS)"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-sg-web"
  }
}

# Security Group do banco — só aceita MySQL (3306) vindo do Security Group
# da EC2, nunca de um CIDR aberto. Mesmo padrão validado no curso de DevOps.
resource "aws_security_group" "rds" {
  name        = "${var.project_name}-sg-rds"
  description = "Permite MySQL apenas a partir da EC2 da loja"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "MySQL a partir da EC2"
    from_port       = 3306
    to_port         = 3306
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
