output "n8n_url" {
  description = "Abra este endereço (com http:// — não há HTTPS) depois de 2 a 4 minutos: o user_data ainda está instalando o Docker e baixando a imagem do n8n"
  value       = "http://${aws_eip.n8n.public_ip}"
}

output "webhook_base_url" {
  description = "Base dos seus webhooks de produção: http://<ip>/webhook/<caminho>  (teste: /webhook-test/<caminho>)"
  value       = "http://${aws_eip.n8n.public_ip}/webhook/"
}

output "ec2_public_ip" {
  description = "IP fixo (Elastic IP) da EC2 — não muda se a EC2 for desligada e religada"
  value       = aws_eip.n8n.public_ip
}

output "ssh_command" {
  description = "Comando para entrar na EC2 e depurar (baixe o vockey.pem antes)"
  value       = "ssh -i vockey.pem ec2-user@${aws_eip.n8n.public_ip}"
}
