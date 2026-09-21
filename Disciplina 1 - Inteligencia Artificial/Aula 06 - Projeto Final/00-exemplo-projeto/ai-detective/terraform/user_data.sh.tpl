#!/bin/bash
set -e   # para o script na primeira falha (assim o erro aparece em /var/log/cloud-init-output.log)

# Este script roda UMA vez, quando a EC2 nasce. Ele faz o que você faria à mão:
# instala Docker, baixa o projeto, sobe o container e indexa as evidências no RDS.

dnf update -y
dnf install -y docker git nginx
systemctl enable --now docker

# O Amazon Linux 2023 não traz o Docker Compose nem o Buildx (o `compose build` exige os dois).
mkdir -p /usr/local/lib/docker/cli-plugins
curl -SL https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64 \
  -o /usr/local/lib/docker/cli-plugins/docker-compose
chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

BUILDX_VERSION=$(curl -s https://api.github.com/repos/docker/buildx/releases/latest | grep -oP '"tag_name": "\K[^"]+')
curl -SL "https://github.com/docker/buildx/releases/download/$${BUILDX_VERSION}/buildx-$${BUILDX_VERSION}.linux-amd64" \
  -o /usr/local/lib/docker/cli-plugins/docker-buildx
chmod +x /usr/local/lib/docker/cli-plugins/docker-buildx

# Baixa o projeto (o repositório precisa ser público).
cd /opt
git clone %{ if app_branch != "" }--branch ${app_branch} %{ endif }${repo_url} app
cd "/opt/app/${app_subdir}"

# Cria o .env com o endereço do RDS e a chave da OpenAI (o Terraform troca cada marcador de variável pelo valor real antes de enviar o script).
# DB_SSL=true: o RDS só aceita conexão criptografada.
cat > .env <<ENVFILE
OPENAI_API_KEY=${openai_api_key}
DB_HOST=${db_host}
DB_PORT=${db_port}
DB_NAME=${db_name}
DB_USER=${db_user}
DB_PASSWORD=${db_password}
DB_SSL=true
ENVFILE

# Sobe SÓ o serviço "app". O banco (perfil "local" do compose) não sobe: aqui o banco é o RDS.
docker compose up -d --build app

# Gera as evidências e indexa no RDS (chunks + embeddings). Só dá para rodar de DENTRO da VPC,
# porque o RDS não tem IP público. Se falhar, o `set -e` para aqui — veja o log do cloud-init.
docker compose exec -T app npm run setup

# Nginx na porta 80, repassando para o container (porta 3000).
#  - proxy_buffering off      → o streaming (SSE) do agente chega aos poucos, em vez de tudo de uma vez
#  - client_max_body_size 12m → o padrão do Nginx (1 MB) barraria o upload de PDFs
#  - proxy_read_timeout 300s  → uma investigação com vários passos pode demorar
cat > /etc/nginx/conf.d/app.conf <<'NGINXCONF'
server {
    listen 80;
    client_max_body_size 12m;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_buffering off;
        proxy_read_timeout 300s;
    }
}
NGINXCONF

systemctl enable --now nginx
systemctl restart nginx
