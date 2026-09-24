# 2. Ambiente — o n8n na sua EC2, com Terraform

**Nível: 🟢 Básico (obrigatório — todos os exercícios dependem dele).**

Antes de qualquer workflow, eu preciso que você tenha um n8n rodando num
endereço que a internet alcança. Você já sabe fazer o essencial disso: VPC,
subnet, Security Group, EC2 e Docker, do curso de DevOps. Eu deixei tudo
pronto em [`assets/terraform/`](assets/terraform) — o que muda em relação ao
que você já viu é *o que roda dentro da EC2*.

> 🔁 **Vale para a disciplina inteira.** Toda aula de n8n vai trazer, junto, o
> Terraform que sobe esse mesmo ambiente — com os acréscimos que aquela aula
> pedir (um banco na Aula 3, por exemplo). Você sobe uma vez por aula e
> descarta no fim.

## 🎯 Objetivo

Provisionar, com **um** `terraform apply`, uma EC2 com o n8n configurado,
abri-lo no navegador pelo IP, criar a sua conta de administrador e confirmar
que a URL de webhook que o n8n mostra é a do **seu** IP — e não `localhost`.

## 🧭 Visão geral da arquitetura

```
Você (navegador / curl)          Serviços externos (Typeform, GitHub, WhatsApp...)
        │  http://<ip>                          │  http://<ip>/webhook/...
        └───────────────────┬───────────────────┘
                            ▼
                 ┌──────────────────────┐
                 │ Elastic IP (fixo)    │
                 └──────────┬───────────┘
                            ▼
        ┌─────────────────────────────────────────┐
        │ EC2 t3.small (subnet pública)           │
        │   Docker ── container n8n  (porta 5678) │
        │              ▲ exposta na porta 80      │
        │   volume n8n_data: workflows,           │
        │   credenciais e execuções (SQLite)      │
        └─────────────────────────────────────────┘
```

**O que você vai notar de diferente das aulas de IA:** não há RDS (o n8n guarda
tudo num SQLite dentro de um volume Docker, suficiente para a disciplina) e
não há repositório para clonar (o n8n é uma imagem pronta — o
`docker-compose.yml` vai escrito dentro do próprio `user_data`).

## 📎 O que já está pronto, em [`assets/terraform/`](assets/terraform)

| Arquivo | O que faz |
|---|---|
| `main.tf`, `variables.tf` | Provedor AWS e as variáveis (só `my_ip` é obrigatória) |
| `network.tf` | VPC, subnet pública, Internet Gateway e tabela de rotas — igual ao que você já conhece |
| `security-group.tf` | SSH só do seu IP; HTTP (porta 80) para o n8n |
| `ec2.tf` | A EC2, o **Elastic IP** e a associação entre os dois |
| `user_data.sh.tpl` | O script que roda uma vez quando a EC2 nasce: instala Docker, escreve o compose e sobe o n8n |
| `outputs.tf` | Imprime a URL do n8n, a base dos webhooks e o comando SSH |

## 📋 Passo a passo

### 1. Ativar o Learner Lab e conferir as credenciais

Inicie o Learner Lab, copie as credenciais (*AWS Details → AWS CLI*) para o seu
`~/.aws/credentials`, e confirme:

```bash
aws sts get-caller-identity
```

Se o comando devolver um erro de token expirado, as credenciais da sessão
venceram — inicie o lab de novo e copie as novas.

### 2. Preencher o `terraform.tfvars`

```bash
cd assets/terraform
cp terraform.tfvars.example terraform.tfvars
```

Abra o arquivo e troque `SEU_IP_PUBLICO_AQUI` pelo seu IP (descubra com
`curl https://checkip.amazonaws.com`). É só isso: o resto tem valor padrão.

> 💡 **Rede diferente, IP diferente.** Se você trocar de Wi-Fi (da faculdade
> para a sua casa, por exemplo), o seu IP muda e o SSH deixa de funcionar. Atualize
> o `my_ip` e rode `terraform apply` de novo — ele só ajusta o Security Group.

### 3. Provisionar

```bash
terraform init
terraform plan
terraform apply
```

O `plan` deve mostrar **9 recursos** a criar. Confirme o `apply` com `yes`. Ao
final, o Terraform imprime algo assim:

```
Outputs:

ec2_public_ip    = "52.21.100.124"
n8n_url          = "http://52.21.100.124"
ssh_command      = "ssh -i vockey.pem ec2-user@52.21.100.124"
webhook_base_url = "http://52.21.100.124/webhook/"
```

### 4. Esperar o `user_data` terminar

O `apply` termina rápido, mas a EC2 ainda está instalando o Docker e baixando a
imagem do n8n. **Nos meus testes, o `apply` levou menos de 1 minuto e o n8n
respondeu cerca de 2 minutos depois.** Espere de 2 a 4 minutos.

Para saber que está pronto, abra o `n8n_url` no navegador. Se a página ainda
não carrega, espere mais um pouco — não é erro.

> ⚠️ **Abra com `http://` na frente.** Colar só o IP na barra faz muitos
> navegadores tentarem `https://`. Como não há nada ouvindo na porta 443, a
> página fica carregando até dar timeout — e parece que o servidor caiu. A porta
> 80 está funcionando; o problema é o protocolo.

### 5. Criar a sua conta de administrador

Na primeira vez, o n8n abre uma tela pedindo e-mail, nome e senha: você está
criando o **dono** da instância. Use uma senha forte (o n8n exige no mínimo 8
caracteres).

> 🔒 **Faça isso imediatamente.** Enquanto ninguém criou o dono, **o primeiro
> visitante que abrir o IP vira o administrador** do seu n8n. Como a porta 80
> está aberta para a internet, não deixe essa janela aberta: suba o ambiente e
> crie a conta em seguida.

### 6. Conferir a URL do webhook

Esta é a verificação que mostra que o ambiente está certo:

1. Crie um workflow novo.
2. Adicione um node **Webhook** (clique em **+** e busque "Webhook").
3. Olhe a **Production URL** dentro do node.

Ela deve começar com **`http://<seu-ip>/webhook/`** — e **não** com
`http://localhost:5678/...`. Se aparecer `localhost`, a variável `WEBHOOK_URL`
não foi aplicada (veja a seção de depuração abaixo).

### 7. (Opcional) Entrar na EC2 e olhar por dentro

Baixe o `vockey.pem` no Learner Lab (*SSH key → Download PEM*), salve na pasta
`assets/terraform/` e:

```bash
chmod 400 vockey.pem
ssh -i vockey.pem ec2-user@<ec2_public_ip>

# o log do user_data (o que a EC2 fez ao nascer):
sudo tail -50 /var/log/cloud-init-output.log

# o n8n em si:
sudo docker ps
sudo docker logs n8n --tail 30
```

## 🔍 O que o `user_data` faz, e por que cada decisão

Não copie e cole sem entender. Cada linha do container existe por um motivo:

| Configuração | O que faz | Por que está ali |
|---|---|---|
| `image: n8nio/n8n:2.40.5` | Versão fixa do n8n | Com `latest`, o n8n da sua aula mudaria sozinho entre um `apply` e outro — e o passo a passo que eu escrevi deixaria de bater com a tela |
| `ports: "80:5678"` | O n8n escuta na 5678; a EC2 expõe na 80 | Assim você abre `http://<ip>` sem digitar porta, e a URL do webhook fica limpa |
| `WEBHOOK_URL=http://<ip>/` | A URL base que o n8n mostra para os webhooks | Sem ela, o n8n mostraria `http://localhost:5678/...` — um endereço que ninguém de fora consegue chamar |
| `N8N_SECURE_COOKIE=false` | Permite login por HTTP | Por padrão o cookie de sessão só viaja por HTTPS; sem HTTPS, o login não funciona. É aceitável numa EC2 de aula; **em produção** você coloca HTTPS na frente e volta para `true` |
| `GENERIC_TIMEZONE` e `TZ` | Fuso `America/Sao_Paulo` | Decide a hora em que um Schedule Trigger dispara e o horário que aparece em `$now` |
| `N8N_ENCRYPTION_KEY` | Chave que criptografa as credenciais salvas | Gerada no `user_data` e guardada num `.env`; se a perdesse, as credenciais salvas ficariam ilegíveis |
| `volumes: n8n_data` | Guarda `/home/node/.n8n` no disco | É onde ficam workflows, credenciais e execuções. Sem volume, tudo some quando o container é recriado |
| **Elastic IP** | IP fixo | O n8n precisa saber o próprio endereço **antes** de subir, e o Learner Lab desliga a EC2 no fim da sessão: com IP comum, o endereço mudaria a cada religada |

**Um detalhe de Terraform que vale a atenção:** o Elastic IP é criado
**sozinho** e só depois associado à EC2 (`aws_eip_association`). Se ele já
nascesse ligado à instância, o `user_data` (que precisa do IP) e a EC2 (que
precisa do `user_data`) ficariam esperando um ao outro — um ciclo de
dependência.

**E um detalhe de shell:** o script espera o n8n ficar pronto olhando o
`/rest/settings`, e não o `/healthz`. Eu descobri testando: o `/healthz` já
responde 200 **durante** as migrações do banco, quando o n8n ainda devolve
"n8n is starting up". Só o `/rest/settings` devolve JSON quando ele terminou
de subir.

## ⚠️ Quatro armadilhas

**1. O n8n está aberto para a internet.** A porta 80 é liberada para
`0.0.0.0/0`, porque serviços externos precisam chamar seus webhooks. O n8n tem
login, mas **os seus webhooks não têm autenticação**: quem descobrir a URL
consegue disparar o seu workflow. Nada que você construir hoje é sensível, mas
não guarde chaves de API reais nas credenciais deste ambiente sem antes ler
sobre autenticação de webhook (Aula 2). Se quiser fechar tudo só para você, mude
`http_allowed_cidr` no `terraform.tfvars` para `"SEU_IP/32"` — em troca, só
você consegue chamar os webhooks.

**2. Learner Lab tem prazo.** A sessão expira e a EC2 é **parada**. Eu testei o
que acontece: parei e religuei a instância, e o **IP continuou o mesmo**, o n8n
voltou em cerca de 20 segundos e **o workflow continuou publicado**. Os dados
sobrevivem porque estão no disco (EBS) da EC2. Mas o que **não** sobrevive é um
`terraform destroy`.

**3. Exporte seus workflows antes de destruir.** Os workflows moram no volume
da EC2. Quando você rodar `terraform destroy`, eles vão embora junto. Antes,
exporte cada um: no editor, menu **⋯ → Download**. Guarde os `.json` no
Git — é o que você vai entregar no relatório.

**4. Mudar uma variável recria a EC2.** O `user_data` só roda quando a EC2
**nasce**. Por isso o Terraform está configurado com
`user_data_replace_on_change = true`: se você mudar a versão do n8n ou o fuso e
rodar `apply`, ele **destrói e recria** a instância — e o n8n recomeça do zero.
Exporte antes.

## 🩹 Se não funcionou

| Sintoma | Causa provável | O que fazer |
|---|---|---|
| A página fica carregando | Você abriu `https://` ou o `user_data` ainda roda | Use `http://` e espere até 4 minutos |
| `ExpiredToken` no `terraform` | A sessão do Learner Lab venceu | Reinicie o lab e copie as credenciais novas |
| O login do n8n "não entra" | `N8N_SECURE_COOKIE` não está `false` | Veja `sudo docker exec n8n env \| grep SECURE` na EC2 |
| A URL do webhook mostra `localhost` | `WEBHOOK_URL` não aplicada | Veja `sudo cat /opt/n8n/docker-compose.yml` e o log do cloud-init |
| O SSH dá `timeout` | Seu IP mudou | Atualize `my_ip` e rode `terraform apply` |
| `terraform apply` reclama do `LabInstanceProfile` ou `vockey` | Learner Lab não iniciado | Inicie o lab e tente de novo |

## 🛟 Plano B — se o Learner Lab não estiver disponível

Você consegue fazer os exercícios 01 a 04 sem a AWS:

- **n8n Cloud** (trial gratuito, [n8n.io](https://n8n.io/)) — abre no navegador,
  já com HTTPS e URL de webhook pública.
- **n8n em Docker local:**

```bash
docker volume create n8n_data
docker run -it --rm --name n8n -p 5678:5678 \
  -e GENERIC_TIMEZONE="America/Sao_Paulo" -e TZ="America/Sao_Paulo" \
  -v n8n_data:/home/node/.n8n \
  n8nio/n8n:2.40.5
```

Depois abra `http://localhost:5678`. Nos exercícios, troque `http://<ip>` por
`http://localhost:5678`. A única coisa que você perde é chamar o webhook **de
fora** da sua máquina — que só faz falta a partir da Aula 2.

## 🧹 Quando terminar

```bash
cd assets/terraform
terraform destroy
```

Exporte os workflows **antes**. O `destroy` leva cerca de 1 minuto. Recurso
esquecido ligado consome o orçamento do laboratório — inclusive o Elastic IP.

## 📸 O que guardar para o relatório

- Print do `terraform apply` finalizado, com os outputs.
- Print do n8n aberto pelo IP (com a barra de endereço visível).
- Print da **Production URL** de um node Webhook começando com o seu IP.

## 🧪 Perguntas de reflexão

1. Por que o Elastic IP foi criado **antes** da EC2 e associado **depois**? O
   que aconteceria se ele já nascesse ligado à instância?
2. O que muda, para quem recebe o seu webhook, se você deixar `WEBHOOK_URL` de
   fora? O n8n deixa de funcionar?
3. O `N8N_SECURE_COOKIE=false` é uma decisão de segurança que você tomou por
   conveniência. O que você faria para poder voltá-lo para `true`?
4. Comparando com o Terraform das aulas de IA: quais peças você já conhecia e o
   que foi novo aqui?

**Próximo passo:** [03-conceitos-fundamentais](../03-conceitos-fundamentais/README.md)
