# Security Group da EC2 — SSH restrito ao meu IP; HTTP (porta 80) onde o n8n
# responde, tanto o editor quanto os webhooks.
resource "aws_security_group" "web" {
  name        = "${var.project_name}-sg-web"
  description = "Libera SSH (restrito ao meu IP) e HTTP para o n8n"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "SSH apenas do meu IP"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["${var.my_ip}/32"]
  }

  ingress {
    description = "HTTP do n8n (editor e webhooks)"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = [var.http_allowed_cidr]
  }

  egress {
    description = "Todo trafego de saida (o n8n precisa chamar APIs externas)"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-sg-web"
  }
}
