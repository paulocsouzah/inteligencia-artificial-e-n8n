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

# Key pair já existente na AWS Academy ("vockey") — o mesmo procedimento do curso
# de DevOps: baixe o "vockey.pem" na tela do Learner Lab (SSH key > Download PEM).
data "aws_key_pair" "vockey" {
  key_name = "vockey"
}

# IP fixo (Elastic IP). Por que não usar o IP público comum? Porque o n8n precisa
# saber o próprio endereço ANTES de subir (a variável WEBHOOK_URL) e porque o
# Learner Lab desliga a EC2 quando a sessão acaba: com IP comum, o endereço muda
# a cada religada e todo webhook que você cadastrou em outro serviço quebra.
#
# O EIP é criado SOZINHO, sem instância, e só depois associado (aws_eip_association).
# Se ele já nascesse ligado à EC2, o user_data (que precisa do IP) e a EC2 (que
# precisa do user_data) ficariam esperando um ao outro — um ciclo.
resource "aws_eip" "n8n" {
  domain = "vpc"

  tags = {
    Name = "${var.project_name}-eip"
  }

  depends_on = [aws_internet_gateway.main]
}

# Instância EC2 — se autoprovisiona via user_data: instala o Docker e sobe o n8n.
resource "aws_instance" "web" {
  ami                    = data.aws_ami.amazon_linux.id
  instance_type          = var.instance_type
  subnet_id              = aws_subnet.public.id
  vpc_security_group_ids = [aws_security_group.web.id]
  key_name               = data.aws_key_pair.vockey.key_name
  iam_instance_profile   = data.aws_iam_instance_profile.lab_profile.name

  # O snapshot da AMI do Amazon Linux 2023 já exige 30 GB no mínimo; 32 GB deixa
  # uma folga para o Docker, a imagem do n8n e o banco SQLite crescerem.
  root_block_device {
    volume_size = 32
    volume_type = "gp3"
  }

  user_data = templatefile("${path.module}/user_data.sh.tpl", {
    public_ip   = aws_eip.n8n.public_ip
    n8n_version = var.n8n_version
    timezone    = var.timezone
  })

  # O user_data só roda quando a EC2 NASCE. Sem isto, mudar uma variável (versão do
  # n8n, fuso) e rodar apply não faria nada na máquina. Com isto, o Terraform recria
  # a EC2 — e o n8n recomeça do zero (workflows e credenciais ficam no disco antigo).
  user_data_replace_on_change = true

  tags = {
    Name = "${var.project_name}-ec2-n8n"
  }
}

resource "aws_eip_association" "n8n" {
  instance_id   = aws_instance.web.id
  allocation_id = aws_eip.n8n.id
}
