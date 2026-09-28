# 2. Ambiente — o mesmo n8n, agora com HTTPS

**Nível: 🟢 Básico (obrigatório — o módulo 08 e o exercício final dependem do HTTPS).**

O ambiente é o mesmo da Aula 01 — mesma VPC, mesma EC2, mesmo Docker, mesmo
n8n. A única peça nova é um **nginx na frente**, com um certificado
autoassinado, para o n8n passar a responder em **HTTPS**. Se você ainda tem a
EC2 da Aula 01 de pé, pode até reaproveitá-la à mão (instalando o nginx por
SSH) — mas eu recomendo destruir e subir de novo com este Terraform: é mais
rápido, e garante que o ambiente bate exatamente com o que eu vou mostrar.

> 🔁 **Vale para a disciplina inteira.** Cada aula acrescenta ao Terraform só
> o que ela pedir. Na Aula 01 foi o n8n em si; hoje é o HTTPS.

## 🎯 Objetivo

Provisionar a EC2 com **um** `terraform apply`, abrir o n8n em `https://<ip>`,
confirmar que a **Production URL** de um webhook e a URL de callback do
OAuth2 já vêm com `https://` — e entender por que isso importa.

## ❓ Por que HTTPS, se a Aula 01 funcionou sem?

Curto: **porque hoje você vai configurar uma credencial OAuth2 (Gmail)**, e
o Google, como praticamente todo provedor de OAuth2 sério, **recusa cadastrar
uma URL de retorno que não seja `https://`** (a única exceção é
`http://localhost`, que não serve para uma EC2 na internet). Sem isso, você
nem consegue salvar a credencial no Google Cloud Console — o erro aparece
antes de você chegar a autorizar nada.

## 🧭 Visão geral da arquitetura

```
Você (navegador / curl)          Serviços externos (GitHub, a LLM, Google/Gmail...)
        │  https://<ip>                          │  https://<ip>/webhook/...
        └───────────────────┬───────────────────┘
                            ▼
                 ┌──────────────────────┐
                 │ Elastic IP (fixo)    │
                 └──────────┬───────────┘
                            ▼
        ┌───────────────────────────────────────────────┐
        │ EC2 t3.small (subnet pública)                 │
        │                                                │
        │   nginx :80  ──301──▶  nginx :443 (TLS)       │
        │                          │ certificado         │
        │                          │ autoassinado        │
        │                          ▼                     │
        │                 container n8n :5678            │
        │                 (só ouve em 127.0.0.1)          │
        │   volume n8n_data: workflows, credenciais,      │
        │   execuções (SQLite)                            │
        └───────────────────────────────────────────────┘
```

**O que mudou da Aula 01:** o n8n não fala mais diretamente com a internet.
Ele escuta só em `127.0.0.1:5678`; quem recebe a conexão de fora é o
**nginx**, na porta 443, com TLS — e repassa (`proxy_pass`) para o n8n por
dentro da própria máquina. A porta 80 continua aberta, mas só para
redirecionar (`301`) para a 443.

## 📎 O que já está pronto, em [`assets/terraform/`](assets/terraform)

| Arquivo | O que faz | Mudou da Aula 01? |
|---|---|---|
| `main.tf`, `variables.tf` | Provedor AWS e variáveis | Não |
| `network.tf` | VPC, subnet, IGW, rotas | Não |
| `security-group.tf` | SSH (meu IP), HTTP e **HTTPS** liberados | **Sim** — porta 443 nova |
| `ec2.tf` | EC2, Elastic IP e associação | Não (mesma lógica) |
| `user_data.sh.tpl` | Instala Docker **e nginx**, sobe o n8n só em loopback, gera o certificado e configura o proxy | **Sim** |
| `outputs.tf` | URLs, agora em `https://`, **e a URL de callback do OAuth2** pronta para copiar | **Sim** |

## 📋 Passo a passo

### 1. Learner Lab e credenciais

Igual à Aula 01: inicie o lab, copie as credenciais para `~/.aws/credentials`,
confirme com `aws sts get-caller-identity`.

### 2. `terraform.tfvars`

```bash
cd assets/terraform
cp terraform.tfvars.example terraform.tfvars
```

Preencha `my_ip` (descubra com `curl https://checkip.amazonaws.com`).

### 3. Provisionar

```bash
terraform init
terraform plan   # deve mostrar 9 recursos
terraform apply
```

Ao final, o Terraform imprime, entre outras coisas:

```
Outputs:

n8n_url                    = "https://52.21.100.124"
webhook_base_url           = "https://52.21.100.124/webhook/"
google_oauth_redirect_uri  = "https://52.21.100.124/rest/oauth2-credential/callback"
ec2_public_ip              = "52.21.100.124"
ssh_command                = "ssh -i vockey.pem ec2-user@52.21.100.124"
```

Guarde o `google_oauth_redirect_uri` — você vai colar ele, sem mudar nada, no
Google Cloud Console no módulo 08.

### 4. Esperar o `user_data` terminar

Espere de 2 a 4 minutos (o script agora instala nginx **e** gera o
certificado, além de tudo que já fazia na Aula 01).

### 5. Abrir o n8n — e o aviso do navegador

Abra `n8n_url`. O navegador vai mostrar uma tela de aviso: **"A conexão não
é particular"** (Chrome) ou **"Atenção: risco potencial de segurança"**
(Firefox). **Isso é esperado.** O certificado é autoassinado — ele prova que
o tráfego está criptografado, mas não prova, para o seu navegador, que "este
servidor é quem diz ser" (isso normalmente é atestado por uma autoridade
certificadora, o que custaria um domínio de verdade). Clique em **Avançado**
→ **Prosseguir para o site (não seguro)**. Você só vai precisar fazer isso
uma vez por navegador.

> 🔒 **Isto não seria aceitável em produção.** Um certificado autoassinado é
> uma solução de **laboratório**: ele resolve "o Google aceita a URL",
> não "seus usuários confiam no certificado". Um n8n real, com clientes de
> verdade batendo nos seus webhooks, usa um domínio e um certificado emitido
> (Let's Encrypt, por exemplo — que é de graça, mas exige um domínio
> apontando para o IP, o que este laboratório não tem).

Se sua sessão de admin sobreviveu da Aula 01 (você reaproveitou a EC2), faça
login normalmente. Se é uma EC2 nova, crie a conta de administrador — e
faça isso **imediatamente**, pela mesma razão da Aula 01: o primeiro
visitante vira o dono.

### 6. Conferir as duas URLs

1. Crie um workflow novo, adicione um **Webhook**, e olhe a **Production
   URL**: deve começar com `https://<seu-ip>/webhook/`.
2. Guarde a `google_oauth_redirect_uri` à mão — você vai usá-la no módulo 08.

### 7. (Opcional) Entrar na EC2

```bash
chmod 400 vockey.pem
ssh -i vockey.pem ec2-user@<ec2_public_ip>

sudo tail -80 /var/log/cloud-init-output.log
sudo docker logs n8n --tail 30
sudo journalctl -u nginx --no-pager | tail -30
sudo nginx -t                      # valida a config do nginx
curl -sk https://localhost/rest/settings   # -k ignora o cert autoassinado
```

## 🔍 O que mudou por dentro, e por quê

| Configuração | O que faz | Por que está ali |
|---|---|---|
| `ports: "127.0.0.1:5678:5678"` | O n8n só aceita conexão da própria máquina | Ninguém de fora fala com o n8n sem passar pelo nginx — é o nginx que decide o que entra |
| `N8N_PROTOCOL=https` + `WEBHOOK_URL=https://<ip>/` | O n8n **acha** que está em HTTPS | Ele mesmo não termina TLS nenhum — é o nginx quem faz isso — mas ele precisa gerar as URLs certas (webhook, OAuth2 callback) com `https://` |
| `N8N_SECURE_COOKIE=true` | Volta ao padrão seguro | Só é possível porque agora existe HTTPS de verdade na frente. Era a pergunta em aberto no fim da Aula 01 |
| `N8N_PROXY_HOPS=1` | O n8n passa a confiar no header `X-Forwarded-Proto` que o nginx manda | Sem isso, mesmo com HTTPS de verdade, o n8n não sabe que a conexão original era segura, e o cookie seguro falha |
| Certificado autoassinado, `CN=<ip>` | TLS sem precisar de um domínio | O Google só confere que a URL **começa com https://**; não valida a cadeia de confiança do certificado no cadastro |
| `client_max_body_size 50M` no nginx | Libera corpos de requisição maiores | O Gmail Trigger baixa anexos, e sem isso o nginx corta com `413 Request Entity Too Large` antes mesmo do n8n ver a requisição |

## ⚠️ Armadilhas desta aula

**1. `-k` no `curl` para tudo que fala com o seu n8n.** Como o certificado é
autoassinado, `curl` (sem flag) vai recusar a conexão com um erro de
certificado. Use sempre `curl -k` (ou `curl --insecure`) nos exercícios desta
aula quando o alvo for o **seu** n8n. Isso é só para o seu ambiente de
laboratório — nunca use `-k` contra uma API de produção de verdade.

**2. O redirect de 80 para 443 muda a URL nos seus testes.** Se você chamar
`http://<ip>/webhook/algo`, o nginx responde `301` para
`https://<ip>/webhook/algo` — a maioria dos clientes HTTP segue o redirect
sozinha, mas confira com `curl -iL` se algo parecer "sumir".

**3. Learner Lab e o certificado.** Se você destruir e recriar a EC2, o
Elastic IP pode mudar (a menos que você não destrua o EIP — nesta aula ele
nasce e morre junto com o resto). Um IP novo significa um certificado novo
(o `CN` é gerado a partir do IP) — normal, o Terraform recria tudo sozinho.

## 🩹 Se não funcionou

| Sintoma | Causa provável | O que fazer |
|---|---|---|
| Navegador trava, sem nem mostrar o aviso de certificado | `user_data` ainda rodando, ou porta 443 não liberada | Espere até 4 min; confira o Security Group |
| `curl` recusa com erro de certificado | Você esqueceu o `-k` | Normal — use `-k` contra o seu próprio n8n |
| A URL do webhook mostra `http://` em vez de `https://` | `WEBHOOK_URL` não aplicada | `sudo cat /opt/n8n/docker-compose.yml` na EC2 |
| Google recusa a URL de callback ao criar a credencial | Você copiou errado, ou colocou `http://` | Copie o output `google_oauth_redirect_uri` **exatamente** como veio |
| `502 Bad Gateway` do nginx | O container n8n não subiu | `sudo docker logs n8n` |
| `nginx -t` reclama de config | Editou algo manualmente | Restaure com `terraform apply` (recria a EC2) |

## 🛟 Plano B — se o Learner Lab não estiver disponível

Os exercícios 01, 02 e 03 (que não usam OAuth2) funcionam com **n8n Cloud**
ou **Docker local**, do jeito que já era na Aula 01 — nenhum deles exige
HTTPS. O exercício 04 (Gmail) e o projeto final **exigem** uma URL pública em
HTTPS para o callback do OAuth2:

- **n8n Cloud** (trial gratuito) já resolve isso de fábrica — é o caminho mais
  simples se a EC2 não for uma opção.
- Sem AWS e sem n8n Cloud, dá para usar um túnel HTTPS temporário
  (por exemplo `ngrok http 5678` apontando para um n8n local) só durante a
  configuração da credencial OAuth2 — mas isso foge do escopo desta aula;
  fale comigo se for o seu caso.

## 🧹 Quando terminar

```bash
cd assets/terraform
terraform destroy
```

Exporte os workflows **antes** — igual à Aula 01, eles vivem no volume da EC2.

## 📸 O que guardar para o relatório

- Print do `terraform apply` finalizado, com os outputs (inclua o
  `google_oauth_redirect_uri`).
- Print do aviso de certificado autoassinado no navegador, e do n8n aberto
  logo depois, em `https://`.
- Print da **Production URL** de um webhook começando com `https://`.

## 🧪 Perguntas de reflexão

1. O Google valida a **string** da URL de callback (`https://...`), não o
   certificado em si. Isso significa que o HTTPS autoassinado "engana" o
   Google? O que ele realmente garante, e o que ele **não** garante?
2. Por que o n8n precisa de `N8N_PROTOCOL=https` **e** de `N8N_PROXY_HOPS=1`
   para o cookie seguro funcionar, se quem termina o TLS é o nginx, e não o
   n8n?
3. Se este fosse um ambiente de produção real, com clientes de verdade, o
   que mudaria na escolha do certificado? E na exposição do n8n (a porta 443
   está aberta para `0.0.0.0/0`)?

**Próximo passo:** [03-conceitos-fundamentais](../03-conceitos-fundamentais/README.md)
