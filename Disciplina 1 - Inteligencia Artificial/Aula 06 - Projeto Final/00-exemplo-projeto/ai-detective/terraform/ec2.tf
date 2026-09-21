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
# antes do apply, mesmo procedimento das aulas anteriores.
data "aws_key_pair" "vockey" {
  key_name = "vockey"
}

# Instância EC2 — se autoprovisiona via user_data (templatefile), já
# conectada ao RDS criado neste mesmo projeto.
resource "aws_instance" "web" {
  ami                    = data.aws_ami.amazon_linux.id
  instance_type          = var.instance_type
  subnet_id              = aws_subnet.public.id
  vpc_security_group_ids = [aws_security_group.web.id]
  key_name               = data.aws_key_pair.vockey.key_name
  iam_instance_profile   = data.aws_iam_instance_profile.lab_profile.name

  # O snapshot por trás da AMI do Amazon Linux 2023 já exige, sozinho,
  # 30GB no mínimo (a AWS rejeita qualquer volume menor que o snapshot
  # de origem — confirmado num teste real: "Volume of size 20GB is
  # smaller than snapshot ..., expect size >= 30GB"). 32GB dá uma
  # margem pequena além do mínimo, para "dnf update" + Docker + a
  # imagem da aplicação não ficarem no limite.
  root_block_device {
    volume_size = 32
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
    app_subdir     = var.app_subdir
    app_branch     = var.app_branch
  })

  tags = {
    Name = "${var.project_name}-ec2-web"
  }
}
