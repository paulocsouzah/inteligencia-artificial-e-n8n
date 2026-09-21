output "ec2_public_ip" {
  description = "IP público da EC2"
  value       = aws_instance.web.public_ip
}

output "app_url" {
  description = "Abra este endereço (com http:// — não há HTTPS) depois de 3 a 5 minutos: o user_data ainda está instalando e indexando"
  value       = "http://${aws_instance.web.public_ip}"
}

output "rds_address" {
  description = "Host do RDS (sem a porta)"
  value       = aws_db_instance.main.address
}
