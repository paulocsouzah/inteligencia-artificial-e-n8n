#!/bin/bash
set -e   # para o script na primeira falha (assim o erro aparece em /var/log/cloud-init-output.log)

# Igual à Aula 01 (Docker + n8n), com UM acréscimo: um nginx na frente, com
# HTTPS, porque a Aula 02 usa OAuth2 (Gmail) e o Google recusa URL de retorno
# (redirect_uri) que não seja https:// (ou localhost). O n8n continua rodando
# exatamente igual; só passa a escutar apenas em 127.0.0.1, e quem fala com o
# mundo é o nginx.

dnf update -y
dnf install -y docker nginx

systemctl enable --now docker

mkdir -p /usr/local/lib/docker/cli-plugins
curl -SL https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64 \
  -o /usr/local/lib/docker/cli-plugins/docker-compose
chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

timedatectl set-timezone ${timezone}

mkdir -p /opt/n8n
cd /opt/n8n

echo "N8N_ENCRYPTION_KEY=$(openssl rand -hex 24)" > .env
chmod 600 .env

# --- n8n, igual à Aula 01, com três diferenças: ---
#  1) a porta só é exposta em 127.0.0.1 (o nginx é quem fala com a internet)
#  2) N8N_PROTOCOL=https e WEBHOOK_URL com https:// (o n8n agora sabe que
#     está atrás de um HTTPS, mesmo terminando em nginx e não nele mesmo)
#  3) N8N_SECURE_COOKIE=true — dá para voltar a true porque agora existe HTTPS
#     de verdade na frente (era a pergunta que ficou em aberto na Aula 01)
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
      # Quantos proxies reversos existem na frente do n8n. Sem isto, o
      # Express (que o n8n usa por baixo) não confia no header
      # X-Forwarded-Proto que o nginx manda, e o cookie seguro falha mesmo
      # com HTTPS de verdade.
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

# --- Certificado autoassinado ---
# Não usamos Let's Encrypt porque ele exige um domínio de verdade (com DNS
# apontando pro IP) — e o IP muda de laboratório para laboratório. Um
# certificado autoassinado resolve o que a gente precisa aqui: o Google só
# valida que a URL de retorno COMEÇA com "https://" no cadastro do OAuth2 —
# ele não confere se o certificado é confiável. O preço: o SEU navegador vai
# mostrar um aviso de "conexão não segura" na primeira vez que você abrir o
# n8n. Isso é esperado; eu explico como prosseguir no README.
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

    # O n8n manda respostas grandes (workflows, execuções) e o Gmail Trigger
    # baixa anexos — sem isto, o nginx corta requisições grandes com 413.
    client_max_body_size 50M;

    location / {
        proxy_pass http://127.0.0.1:5678;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;

        # Webhooks e o editor usam websocket (push de execuções em tempo real).
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
NGINX

# Remove o server block padrão do nginx (Amazon Linux traz um em conflito
# na porta 80/mesma raiz), sem isso a config acima concorre com o default.
rm -f /etc/nginx/conf.d/default.conf 2>/dev/null || true
nginx -t
systemctl enable --now nginx

# Espera o n8n ficar pronto (primeiro, direto na porta interna: mais rápido
# de diagnosticar se o problema é o n8n ou o nginx).
for i in $(seq 1 60); do
  if curl -fs http://127.0.0.1:5678/rest/settings | grep -q '"data"'; then
    echo "n8n pronto internamente"
    break
  fi
  sleep 5
done

# Confere que o nginx está de fato repassando (curl -k porque o cert é autoassinado).
for i in $(seq 1 30); do
  if curl -fsk https://localhost/rest/settings | grep -q '"data"'; then
    echo "n8n no ar: https://${public_ip}"
    exit 0
  fi
  sleep 5
done

echo "n8n/nginx NAO respondeu a tempo. Veja: docker compose -f /opt/n8n/docker-compose.yml logs; e journalctl -u nginx" >&2
exit 1
