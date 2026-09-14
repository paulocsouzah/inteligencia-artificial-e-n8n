output "ec2_public_ip" {
  description = "IP público da EC2 — acesse http://<esse-ip> para abrir o chatbot"
  value       = aws_instance.web.public_ip
}

output "rds_endpoint" {
  description = "Endpoint do RDS (host:porta) — use para rodar o seed.js da sua máquina, se precisar popular/repopular o banco manualmente"
  value       = aws_db_instance.main.endpoint
}

output "rds_address" {
  description = "Apenas o host do RDS (sem a porta)"
  value       = aws_db_instance.main.address
}
