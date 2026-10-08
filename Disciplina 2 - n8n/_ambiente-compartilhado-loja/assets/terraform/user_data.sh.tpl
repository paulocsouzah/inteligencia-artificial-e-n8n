#!/bin/bash
set -e   # para o script na primeira falha (assim o erro aparece em /var/log/cloud-init-output.log)

# Ambiente compartilhado: n8n (com HTTPS, igual as Aulas 02/03) + a "loja"
# (API/frontend em Node, conectada ao RDS). Tudo na mesma EC2, em containers
# Docker separados.

dnf update -y
dnf install -y docker nginx

systemctl enable --now docker

mkdir -p /usr/local/lib/docker/cli-plugins
curl -SL https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64 \
  -o /usr/local/lib/docker/cli-plugins/docker-compose
chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

timedatectl set-timezone ${timezone}

# ============================================================ n8n ==========
mkdir -p /opt/n8n
cd /opt/n8n

echo "N8N_ENCRYPTION_KEY=$(openssl rand -hex 24)" > .env
chmod 600 .env

cat > docker-compose.yml <<'COMPOSE'
services:
  n8n:
    image: n8nio/n8n:${n8n_version}
    container_name: n8n
    restart: always
    ports:
      - "127.0.0.1:5678:5678"
    environment:
      - N8N_HOST=${public_ip}
      - N8N_PORT=5678
      - N8N_PROTOCOL=https
      - WEBHOOK_URL=https://${public_ip}/
      - N8N_SECURE_COOKIE=true
      - N8N_PROXY_HOPS=1
      - GENERIC_TIMEZONE=${timezone}
      - TZ=${timezone}
      - N8N_ENCRYPTION_KEY=$${N8N_ENCRYPTION_KEY}
      - N8N_ENFORCE_SETTINGS_FILE_PERMISSIONS=true
      - N8N_DIAGNOSTICS_ENABLED=false
    volumes:
      - n8n_data:/home/node/.n8n

volumes:
  n8n_data:
COMPOSE

docker compose up -d

# ===================================================== nginx + HTTPS =======
mkdir -p /etc/nginx/certs
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/nginx/certs/n8n.key \
  -out /etc/nginx/certs/n8n.crt \
  -subj "/CN=${public_ip}"

cat > /etc/nginx/conf.d/n8n.conf <<'NGINX'
server {
    listen 80;
    server_name _;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name _;

    ssl_certificate     /etc/nginx/certs/n8n.crt;
    ssl_certificate_key /etc/nginx/certs/n8n.key;

    client_max_body_size 50M;

    location / {
        proxy_pass http://127.0.0.1:5678;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
NGINX

rm -f /etc/nginx/conf.d/default.conf 2>/dev/null || true
nginx -t
systemctl enable --now nginx

# ============================================================ loja =========
# Os arquivos vem em base64 (evita qualquer colisao dos template literals
# do JavaScript com a interpolacao do Terraform — veja o comentario no ec2.tf).
mkdir -p /opt/loja/public
echo '${server_js_b64}'    | base64 -d > /opt/loja/server.js
echo '${package_json_b64}' | base64 -d > /opt/loja/package.json
echo '${dockerfile_b64}'   | base64 -d > /opt/loja/Dockerfile
echo '${index_html_b64}'   | base64 -d > /opt/loja/public/index.html

cat > /opt/loja/docker-compose.yml <<'COMPOSE'
services:
  loja:
    image: loja-app:local
    container_name: loja
    restart: always
    ports:
      - "8080:4000"
    environment:
      - DB_HOST=${db_host}
      - DB_PORT=3306
      - DB_USER=${db_user}
      - DB_PASSWORD=${db_password}
      - DB_NAME=${db_name}
COMPOSE

cd /opt/loja
# "docker compose build" exige o plugin buildx, que nao vem instalado no
# Amazon Linux 2023 por padrao. O builder classico (DOCKER_BUILDKIT=0)
# resolve sem precisar instalar mais nada.
DOCKER_BUILDKIT=0 docker build -t loja-app:local .
docker compose up -d

# ========================================================= esperar tudo ====
echo "Esperando o n8n..."
for i in $(seq 1 60); do
  if curl -fs http://127.0.0.1:5678/rest/settings | grep -q '"data"'; then
    echo "n8n pronto internamente"
    break
  fi
  sleep 5
done

for i in $(seq 1 30); do
  if curl -fsk https://localhost/rest/settings | grep -q '"data"'; then
    echo "n8n no ar: https://${public_ip}"
    break
  fi
  sleep 5
done

echo "Esperando a loja (pode demorar: ela espera o RDS responder)..."
for i in $(seq 1 60); do
  if curl -fs http://127.0.0.1:8080/api/status | grep -q '"mensagem"'; then
    echo "loja no ar: http://${public_ip}:8080"
    exit 0
  fi
  sleep 10
done

echo "ALGO NAO FICOU PRONTO A TEMPO. Veja: docker compose -f /opt/n8n/docker-compose.yml logs; docker compose -f /opt/loja/docker-compose.yml logs" >&2
exit 1
