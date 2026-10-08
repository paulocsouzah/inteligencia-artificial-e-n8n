# AMI mais recente do Amazon Linux 2023
data "aws_ami" "amazon_linux" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-*-x86_64"]
  }
}

data "aws_iam_instance_profile" "lab_profile" {
  name = "LabInstanceProfile"
}

data "aws_key_pair" "vockey" {
  key_name = "vockey"
}

# IP fixo (Elastic IP) — mesma razão das aulas anteriores.
resource "aws_eip" "n8n" {
  domain = "vpc"

  tags = {
    Name = "${var.project_name}-eip"
  }

  depends_on = [aws_internet_gateway.main]
}

# A EC2 referencia aws_db_instance.main.address no user_data — por isso o
# Terraform só cria a EC2 DEPOIS do RDS terminar de subir (5 a 10 minutos).
# É demorado, mas é a única forma de a loja já nascer com o endereço certo
# do banco, sem passo manual.
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

  # user_data normal (texto puro) tem limite de 16 KB na AWS, e o nosso,
  # com os arquivos da loja embutidos em base64, passa disso. base64gzip()
  # comprime o script inteiro; o cloud-init da EC2 reconhece o cabecalho
  # gzip sozinho e descomprime antes de rodar — nao precisa de nada
  # especial no script em si.
  user_data_base64 = base64gzip(templatefile("${path.module}/user_data.sh.tpl", {
    public_ip   = aws_eip.n8n.public_ip
    n8n_version = var.n8n_version
    timezone    = var.timezone
    db_host     = aws_db_instance.main.address
    db_name     = var.db_name
    db_user     = var.db_username
    db_password = var.db_password
    # Os arquivos da loja vao em base64: o server.js e o index.html tem
    # varios "${...}" (template literals do JavaScript), e o templatefile()
    # do Terraform tentaria interpretar isso como variavel do Terraform.
    # Em base64 o conteudo vira so [A-Za-z0-9+/=], sem colisao nenhuma.
    server_js_b64    = filebase64("${path.module}/../../app/server.js")
    package_json_b64 = filebase64("${path.module}/../../app/package.json")
    dockerfile_b64   = filebase64("${path.module}/../../app/Dockerfile")
    index_html_b64   = filebase64("${path.module}/../../app/public/index.html")
  }))

  user_data_replace_on_change = true

  tags = {
    Name = "${var.project_name}-ec2"
  }
}

resource "aws_eip_association" "n8n" {
  instance_id   = aws_instance.web.id
  allocation_id = aws_eip.n8n.id
}
