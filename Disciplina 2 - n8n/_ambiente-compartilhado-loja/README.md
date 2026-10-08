# 🏬 Ambiente compartilhado — a "Loja FAEX"

Este não é um módulo de aula — é a **infraestrutura** que as Aulas 04, 05 e 06
reaproveitam: o mesmo n8n de sempre, agora ao lado de um sistema real, com
banco de dados de verdade. Em vez de o workflow consultar um JSON inventado
num Code node, ele consulta uma **API real**, que guarda os dados num **RDS
MySQL** de verdade.

## 🧭 Por que isto existe

Da Aula 02 até aqui, a "base de conhecimento" e os "pedidos" sempre foram
texto digitado dentro de um node. Isso ensina a mecânica, mas não é
realista: um sistema de atendimento de verdade consulta um banco, não um
Code node. A Loja FAEX resolve isso com o menor sistema possível que ainda é
real: produtos, pedidos e reclamações, com uma API HTTP na frente.

## 🧱 O que tem

```
                      Internet
                          │
                 ┌────────┴─────────┐
                 │   Elastic IP     │
                 └────────┬─────────┘
                          ▼
        ┌──────────────────────────────────────┐
        │ EC2 (subnet pública)                  │
        │                                        │
        │  nginx :443 (HTTPS) ──▶ n8n :5678      │
        │  loja (Node/Express) :8080 ─────┐       │
        └──────────────────────────────────┼───────┘
                                            ▼
                              ┌──────────────────────────┐
                              │ RDS MySQL (subnet privada)│
                              │ produtos, pedidos,        │
                              │ reclamacoes, politicas     │
                              └──────────────────────────┘
```

- **n8n** continua em `https://<ip>`, exatamente como nas Aulas 02 e 03.
- **A loja** (frontend + API) fica em `http://<ip>:8080`, sem HTTPS — é um
  sistema didático, não precisa do mesmo cuidado do n8n.
- **O RDS** fica numa subnet privada, sem IP público — só a EC2 consegue
  falar com ele.

## 📎 A API da loja

| Rota | Método | O que faz |
|---|---|---|
| `/api/produtos` | GET | Lista os produtos (nome, preço, estoque) |
| `/api/pedidos` | POST | Cria um pedido (`produto_id`, `cliente_nome`, `cliente_email`, `quantidade`) e baixa o estoque |
| `/api/pedidos` | GET | Lista os últimos pedidos |
| `/api/pedidos/:id` | GET | Busca um pedido pelo id **ou** pelo protocolo (`PED-AAAAMMDD-N`) |
| `/api/reclamacoes` | POST | Registra uma reclamação (`pedido_id` opcional, `cliente_nome`, `cliente_email`, `mensagem`) |
| `/api/reclamacoes?status=nova` | GET | Lista reclamações por status — é isso que o n8n vai consultar |
| `/api/reclamacoes/:id` | PATCH | Atualiza `status`, `intencao` e `resposta` de uma reclamação |
| `/api/politicas` | GET | As políticas da loja (trocas, frete, prazo, reembolso, atendimento) |

## 📋 Como subir

```bash
cd assets/terraform
cp terraform.tfvars.example terraform.tfvars
# preencha my_ip e db_password
terraform init
terraform apply
```

⏳ **Isso demora de verdade.** O RDS leva de 5 a 10 minutos para ficar
disponível, e a EC2 só começa a instalar depois que o RDS termina (o
`user_data` precisa do endereço dele). Conte de 10 a 15 minutos no total.

Ao final, os outputs trazem `n8n_url`, `loja_url` e `loja_api_url`.

## 🔍 Decisões técnicas que você deve conhecer

- **Duas subnets, duas AZs.** O RDS exige um DB Subnet Group cobrindo pelo
  menos duas Availability Zones, mesmo sem réplica — o mesmo padrão
  validado no curso de DevOps (Aula 03). A subnet nova é privada: sem rota
  para a internet, porque o RDS só precisa falar com a EC2.
- **Security Group do RDS por referência, não por IP.** A porta 3306 só
  aceita tráfego vindo do Security Group da EC2 (`security_groups =
  [aws_security_group.web.id]`), não de um CIDR. Isso sobrevive a qualquer
  mudança de IP da EC2.
- **`user_data` comprimido com gzip.** Os arquivos da loja (API +
  frontend) vão embutidos no script que configura a EC2, em base64. Isso
  passa do limite de 16 KB que a AWS impõe para `user_data` em texto puro —
  por isso o Terraform usa `user_data_base64 = base64gzip(...)`: o
  `cloud-init` da EC2 reconhece o cabeçalho gzip e descomprime sozinho,
  sem precisar de nada especial no script.
- **Build sem buildx.** O Amazon Linux 2023 não traz o plugin `buildx` do
  Docker por padrão, e `docker compose build` depende dele nesta versão.
  O `user_data` usa `DOCKER_BUILDKIT=0 docker build` (o builder clássico)
  para não precisar instalar mais nada.
- **`db_subnet_group_name` fixo.** Não usa `project_name` no nome (só na
  tag), pelo mesmo motivo documentado no curso de DevOps: evita que a AWS
  recuse mover uma instância existente para um Subnet Group "novo" que
  cobre exatamente as mesmas subnets.

## 🧹 Quando terminar (Aula 06, hackathon)

```bash
cd assets/terraform
terraform destroy
```

Isso remove **tudo**: EC2, RDS, rede inteira. Exporte os workflows do n8n
antes — eles vivem no volume da EC2, não sobrevivem ao destroy.

## 🩹 Se não funcionou

| Sintoma | Causa provável | O que fazer |
|---|---|---|
| `terraform apply` demora muito e parece travado | É o RDS — normal, 5-10 min | Espere; acompanhe no Console AWS → RDS |
| A loja não responde na porta 8080 | O container ainda está buildando, ou travou numa versão antiga do Docker | SSH na EC2: `sudo docker logs loja` |
| `docker compose build` falha com erro de `buildx` | Terraform desatualizado nesta pasta (versão antiga do `user_data.sh.tpl`) | Confirme que está usando o `user_data.sh.tpl` atual, que usa `docker build` clássico |
| n8n funciona, loja não | Pode ser falha na conexão com o RDS | `sudo docker logs loja` — o app tenta reconectar por até ~5 min antes de desistir |
