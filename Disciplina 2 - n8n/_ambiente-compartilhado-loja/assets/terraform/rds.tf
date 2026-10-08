# DB Subnet Group — cobre as duas subnets/AZs (exigência do RDS, mesmo sem
# Multi-AZ). O name é fixo (não usa project_name) de propósito: evita que a
# AWS recuse mover uma instância existente para um Subnet Group "novo" que
# cobre exatamente as mesmas subnets quando o project_name mudar entre aulas.
resource "aws_db_subnet_group" "main" {
  name       = "loja-db-subnet-group"
  subnet_ids = [aws_subnet.public.id, aws_subnet.private.id]

  tags = {
    Name = "${var.project_name}-db-subnet-group"
  }
}

resource "aws_db_instance" "main" {
  identifier             = "${var.project_name}-db"
  engine                 = "mysql"
  engine_version         = "8.0"
  instance_class         = "db.t3.micro"
  allocated_storage      = 20
  db_name                = var.db_name
  username               = var.db_username
  password               = var.db_password
  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  publicly_accessible    = false
  multi_az               = false
  skip_final_snapshot    = true

  tags = {
    Name = "${var.project_name}-db"
  }
}
