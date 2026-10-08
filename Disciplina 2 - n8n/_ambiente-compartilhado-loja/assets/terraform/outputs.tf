output "n8n_url" {
  description = "O n8n. Certificado autoassinado: o navegador vai avisar — veja o README"
  value       = "https://${aws_eip.n8n.public_ip}"
}

output "webhook_base_url" {
  description = "Base dos webhooks de produção do n8n"
  value       = "https://${aws_eip.n8n.public_ip}/webhook/"
}

output "google_oauth_redirect_uri" {
  description = "URI de callback para a credencial OAuth2 do Gmail no Google Cloud Console"
  value       = "https://${aws_eip.n8n.public_ip}/rest/oauth2-credential/callback"
}

output "loja_url" {
  description = "A loja (frontend + API), sem HTTPS"
  value       = "http://${aws_eip.n8n.public_ip}:8080"
}

output "loja_api_url" {
  description = "Base da API da loja, para o n8n chamar"
  value       = "http://${aws_eip.n8n.public_ip}:8080/api"
}

output "ec2_public_ip" {
  description = "IP fixo (Elastic IP) da EC2"
  value       = aws_eip.n8n.public_ip
}

output "ssh_command" {
  description = "Comando para entrar na EC2 e depurar"
  value       = "ssh -i vockey.pem ec2-user@${aws_eip.n8n.public_ip}"
}

output "db_endpoint" {
  description = "Endpoint do RDS (só alcançável de dentro da VPC — não tente abrir do seu notebook)"
  value       = aws_db_instance.main.address
}
