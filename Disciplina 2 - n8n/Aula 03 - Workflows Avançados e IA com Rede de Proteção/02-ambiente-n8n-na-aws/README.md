# 2. Ambiente — sem mudanças hoje, de propósito

**Nível: 🟢 Básico.**

Toda aula desta disciplina traz o Terraform do ambiente — é a regra que eu
abri lá na Aula 01. Hoje ele está aqui **idêntico** ao da Aula 02: mesma
EC2, mesmo nginx com HTTPS autoassinado, mesmo n8n. Eu decidi, de
propósito, **não** acrescentar nada na infraestrutura.

## ❓ Por que eu não trouxe nada novo

Cada aula só acrescenta infraestrutura quando o **conteúdo** pede. Hoje o
conteúdo — Switch, Merge, Loop, retry, timeout, Error Workflow,
sub-workflows — mora inteiramente **dentro do workflow**, não no servidor.
Subir um banco de dados só para "ter mais Terraform" seria exatamente o
tipo de complexidade sem propósito que eu passo a disciplina inteira
pedindo para você evitar.

> 💡 Guarde essa decisão como exemplo: **nem toda aula avançada precisa de
> infraestrutura nova.** Às vezes "avançado" significa um desenho de
> workflow mais inteligente em cima do que você já tem — não mais peças.

## 📋 O que fazer

**Se a sua EC2 da Aula 02 ainda está no ar:** não faça nada aqui. Abra o
mesmo `https://<ip>` e siga direto para o módulo 03.

**Se você já destruiu o ambiente (ou o Learner Lab expirou):** suba de
novo, do zero igual à Aula 02:

```bash
cd assets/terraform
cp terraform.tfvars.example terraform.tfvars
# preencha my_ip (curl https://checkip.amazonaws.com)
terraform init
terraform apply
```

Os detalhes (HTTPS autoassinado, o aviso do navegador, as credenciais
OAuth2 que sobreviveram ou não à recriação) são exatamente os da Aula 02 —
veja o [módulo 02 daquela aula](<../../Aula 02 - Integrações Reais e IA no n8n/02-ambiente-n8n-na-aws/README.md>)
se precisar relembrar algum passo.

> ⚠️ **Credencial OAuth2 do Gmail não sobrevive a uma EC2 nova.** Se você
> recriou o ambiente, a credencial fica salva no volume da instância
> antiga — que já não existe. Refaça o login do Gmail (módulo 08 da Aula
> 02) antes do exercício 08 de hoje, que depende dela.

## 🛟 Rodando localmente, sem AWS

Se você está testando em Docker local (como plano B da Aula 01) ou numa
máquina sem Learner Lab disponível, todos os módulos desta aula funcionam
igual — nenhum exercício de hoje depende do IP público ou do HTTPS. A
única exceção é o módulo 08/09 se você quiser reautenticar o Gmail: nesse
caso, revise a seção de OAuth2 local da Aula 02 (o callback muda para
`http://localhost:5678/...`, e o Google aceita `localhost` sem exigir
HTTPS).

## 🧹 Quando terminar

```bash
cd assets/terraform
terraform destroy
```

Exporte os workflows antes — igual sempre.

**Próximo passo:** [03-conceitos-fundamentais](../03-conceitos-fundamentais/README.md)
