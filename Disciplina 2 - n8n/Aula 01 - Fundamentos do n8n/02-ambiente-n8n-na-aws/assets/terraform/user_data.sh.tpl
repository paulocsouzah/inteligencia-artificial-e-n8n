#!/bin/bash
set -e   # para o script na primeira falha (assim o erro aparece em /var/log/cloud-init-output.log)

# Este script roda UMA vez, quando a EC2 nasce. Ele faz o que você faria à mão:
# instala o Docker, escreve o docker-compose.yml do n8n e sobe o container.
# Diferente das aulas de IA, aqui não há repositório para clonar nem imagem para
# construir: o n8n é uma imagem pronta, então o docker-compose vai escrito aqui dentro.

dnf update -y
dnf install -y docker
systemctl enable --now docker

# O Amazon Linux 2023 não traz o Docker Compose. Instalamos como plugin do Docker.
mkdir -p /usr/local/lib/docker/cli-plugins
curl -SL https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64 \
  -o /usr/local/lib/docker/cli-plugins/docker-compose
chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

# Fuso horário da própria EC2 (o do n8n vai no compose, abaixo).
timedatectl set-timezone ${timezone}

mkdir -p /opt/n8n
cd /opt/n8n

# Chave que criptografa as credenciais salvas no n8n (as suas chaves de API, por exemplo).
# Gerada aqui, uma vez, e guardada no .env. Se você a perder, as credenciais salvas
# ficam ilegíveis — por isso o n8n a guarda também dentro do volume dele.
echo "N8N_ENCRYPTION_KEY=$(openssl rand -hex 24)" > .env
chmod 600 .env

# O Terraform troca cada marcador de variável pelo valor real antes de enviar o script.
# Os $${...} abaixo são do Docker Compose (ele mesmo lê o .env), não do Terraform.
cat > docker-compose.yml <<'COMPOSE'
services:
  n8n:
    image: n8nio/n8n:${n8n_version}
    container_name: n8n
    restart: always
    ports:
      - "80:5678"        # o n8n escuta na 5678 dentro do container; na EC2 expomos na 80
    environment:
      - N8N_HOST=${public_ip}
      - N8N_PORT=5678
      - N8N_PROTOCOL=http
      # A URL que o n8n mostra como "URL do webhook". Sem isto ele mostraria
      # http://localhost:5678/... — um endereço que ninguém de fora consegue chamar.
      - WEBHOOK_URL=http://${public_ip}/
      # Sem HTTPS, o n8n recusa o login (o cookie de sessão só viaja por HTTPS por padrão).
      # É aceitável numa EC2 de aula; em produção, você coloca HTTPS na frente e volta para true.
      - N8N_SECURE_COOKIE=false
      - GENERIC_TIMEZONE=${timezone}
      - TZ=${timezone}
      - N8N_ENCRYPTION_KEY=$${N8N_ENCRYPTION_KEY}
      - N8N_ENFORCE_SETTINGS_FILE_PERMISSIONS=true
      - N8N_DIAGNOSTICS_ENABLED=false
    volumes:
      - n8n_data:/home/node/.n8n     # workflows, credenciais e execuções ficam aqui, no disco da EC2

volumes:
  n8n_data:
COMPOSE

docker compose up -d

# Espera o n8n ficar PRONTO (o primeiro start leva um tempinho: ele cria o banco e roda
# as migrações). Não dá para usar o /healthz: ele já responde 200 durante as migrações,
# quando o n8n ainda devolve "n8n is starting up". O /rest/settings só devolve JSON
# (com "data") quando o n8n terminou de subir.
for i in $(seq 1 60); do
  if curl -fs http://localhost/rest/settings | grep -q '"data"'; then
    echo "n8n no ar: http://${public_ip}"
    exit 0
  fi
  sleep 5
done

echo "n8n NAO respondeu em 5 minutos. Veja: docker compose -f /opt/n8n/docker-compose.yml logs" >&2
exit 1
