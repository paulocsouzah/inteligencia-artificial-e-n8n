# Instância RDS PostgreSQL — gerenciada pela AWS, sem IP público, isolada
# na subnet privada (via DB Subnet Group). Precisa de PostgreSQL >= 15.2
# para a extensão pgvector estar disponível nativamente (sem precisar de
# parameter group customizado — pgvector não exige shared_preload_libraries).
resource "aws_db_instance" "main" {
  identifier             = "${var.project_name}-db"
  engine                 = "postgres"
  engine_version         = var.db_engine_version
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
