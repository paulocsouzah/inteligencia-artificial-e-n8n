output "n8n_url" {
  description = "Abra este endereço depois de 2 a 4 minutos. O certificado é autoassinado: o navegador vai avisar — veja o README para prosseguir"
  value       = "https://${aws_eip.n8n.public_ip}"
}

output "webhook_base_url" {
  description = "Base dos seus webhooks de produção: https://<ip>/webhook/<caminho>  (teste: /webhook-test/<caminho>)"
  value       = "https://${aws_eip.n8n.public_ip}/webhook/"
}

output "google_oauth_redirect_uri" {
  description = "Cole exatamente isto em 'Authorized redirect URIs', no Google Cloud Console, ao criar a credencial OAuth2 do Gmail (módulo 08)"
  value       = "https://${aws_eip.n8n.public_ip}/rest/oauth2-credential/callback"
}

output "ec2_public_ip" {
  description = "IP fixo (Elastic IP) da EC2 — não muda se a EC2 for desligada e religada"
  value       = aws_eip.n8n.public_ip
}

output "ssh_command" {
  description = "Comando para entrar na EC2 e depurar (baixe o vockey.pem antes)"
  value       = "ssh -i vockey.pem ec2-user@${aws_eip.n8n.public_ip}"
}
