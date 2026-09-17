#!/bin/bash
set -e   # para o script imediatamente se qualquer comando falhar

dnf update -y
dnf install -y docker git nginx
systemctl enable --now docker

# Amazon Linux 2023 nao vem com o Docker Compose nem com o Buildx por
# padrao — instala os dois plugins oficiais. O Buildx e' exigido pelo
# "docker compose build" (confirmado num teste real: sem ele, o build
# falha com "compose build requires buildx 0.17.0 or later").
mkdir -p /usr/local/lib/docker/cli-plugins

curl -SL https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64 \
  -o /usr/local/lib/docker/cli-plugins/docker-compose
chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

BUILDX_VERSION=$(curl -s https://api.github.com/repos/docker/buildx/releases/latest | grep -oP '"tag_name": "\K[^"]+')
curl -SL "https://github.com/docker/buildx/releases/download/$${BUILDX_VERSION}/buildx-$${BUILDX_VERSION}.linux-amd64" \
  -o /usr/local/lib/docker/cli-plugins/docker-buildx
chmod +x /usr/local/lib/docker/cli-plugins/docker-buildx

# Clona o repositorio da aplicacao (o conteudo de assets/app desta aula,
# copiado para o SEU proprio repositorio — ver o README do exercicio)
cd /opt
git clone ${repo_url} app
cd app

# Gera o .env com os dados do banco e a key da OpenAI, injetados pelo
# Terraform via templatefile() — ${db_host} etc. ja chegam substituidos,
# nao sao variaveis de shell.
cat > /opt/app/.env <<EOF
DB_HOST=${db_host}
DB_PORT=${db_port}
DB_NAME=${db_name}
DB_USER=${db_user}
DB_PASSWORD=${db_password}
OPENAI_API_KEY=${openai_api_key}
EOF

# Sobe a aplicacao
cd /opt/app
docker compose up -d --build

# Popula o RDS automaticamente com as politicas (o "documentos" que o
# agente usa na tool buscar_politica) — o banco fica pronto assim que a
# EC2 termina de subir, sem passo manual separado (o RDS nao tem IP
# publico, entao isso so pode rodar daqui de dentro da VPC mesmo).
docker compose exec -T app node seed.js

# Configura o Nginx do host como reverse proxy — unica rota, "/" para o
# container da aplicacao (porta 3000).
cat > /etc/nginx/conf.d/app.conf <<'EOF'
server {
    listen 80;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
EOF

systemctl enable --now nginx
systemctl restart nginx
