# Security Group da EC2 — SSH restrito ao meu IP; HTTP (80, só para
# redirecionar para HTTPS) e HTTPS (443, onde o n8n de fato responde agora).
resource "aws_security_group" "web" {
  name        = "${var.project_name}-sg-web"
  description = "Libera SSH (restrito ao meu IP), HTTP (redirect) e HTTPS para o n8n"
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

  egress {
    description = "Todo trafego de saida (o n8n precisa chamar APIs externas: GitHub, a LLM, o Google)"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-sg-web"
  }
}
