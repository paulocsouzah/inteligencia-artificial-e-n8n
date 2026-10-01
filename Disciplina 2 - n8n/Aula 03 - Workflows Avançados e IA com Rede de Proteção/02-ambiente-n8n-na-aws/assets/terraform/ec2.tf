# AMI mais recente do Amazon Linux 2023, buscada dinamicamente
data "aws_ami" "amazon_linux" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-*-x86_64"]
  }
}

# Papel IAM já existente na AWS Academy — reaproveitado, nunca criado
data "aws_iam_instance_profile" "lab_profile" {
  name = "LabInstanceProfile"
}

# Key pair já existente na AWS Academy ("vockey")
data "aws_key_pair" "vockey" {
  key_name = "vockey"
}

# IP fixo (Elastic IP) — mesma razão da Aula 01: o n8n precisa saber o
# próprio endereço antes de subir, e o certificado autoassinado também
# precisa desse IP para o CN (Common Name).
resource "aws_eip" "n8n" {
  domain = "vpc"

  tags = {
    Name = "${var.project_name}-eip"
  }

  depends_on = [aws_internet_gateway.main]
}

# Instância EC2 — se autoprovisiona via user_data: Docker + n8n + nginx com HTTPS.
resource "aws_instance" "web" {
  ami                    = data.aws_ami.amazon_linux.id
  instance_type          = var.instance_type
  subnet_id              = aws_subnet.public.id
  vpc_security_group_ids = [aws_security_group.web.id]
  key_name               = data.aws_key_pair.vockey.key_name
  iam_instance_profile   = data.aws_iam_instance_profile.lab_profile.name

  root_block_device {
    volume_size = 32
    volume_type = "gp3"
  }

  user_data = templatefile("${path.module}/user_data.sh.tpl", {
    public_ip   = aws_eip.n8n.public_ip
    n8n_version = var.n8n_version
    timezone    = var.timezone
  })

  user_data_replace_on_change = true

  tags = {
    Name = "${var.project_name}-ec2-n8n"
  }
}

resource "aws_eip_association" "n8n" {
  instance_id   = aws_instance.web.id
  allocation_id = aws_eip.n8n.id
}
