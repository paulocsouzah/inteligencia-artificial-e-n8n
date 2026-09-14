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

# Key pair já existente na AWS Academy ("vockey") — baixe o
# "vockey.pem" pela tela do Learner Lab (seção "SSH key" > Download PEM)
# antes do apply, mesmo procedimento do curso de DevOps.
data "aws_key_pair" "vockey" {
  key_name = "vockey"
}

# Instância EC2 — se autoprovisiona via user_data (templatefile), já
# conectada ao RDS criado neste mesmo projeto.
resource "aws_instance" "web" {
  ami                    = data.aws_ami.amazon_linux.id
  instance_type          = "t2.micro"
  subnet_id              = aws_subnet.public.id
  vpc_security_group_ids = [aws_security_group.web.id]
  key_name               = data.aws_key_pair.vockey.key_name
  iam_instance_profile   = data.aws_iam_instance_profile.lab_profile.name

  # O AMI padrão do Amazon Linux 2023 vem com um volume raiz pequeno
  # demais (2GB) para "dnf update" + Docker + a imagem da aplicação —
  # confirmado num teste real, onde o build da imagem falhou por falta
  # de espaço em disco. 20GB dá folga confortável (mesmo tamanho do RDS).
  root_block_device {
    volume_size = 20
    volume_type = "gp3"
  }

  user_data = templatefile("${path.module}/user_data.sh.tpl", {
    db_host        = aws_db_instance.main.address
    db_port        = aws_db_instance.main.port
    db_name        = var.db_name
    db_user        = var.db_username
    db_password    = var.db_password
    openai_api_key = var.openai_api_key
    repo_url       = var.app_repo_url
  })

  tags = {
    Name = "${var.project_name}-ec2-web"
  }
}
