# 8. Exercício 04 — Credencial OAuth2 do Gmail

**Nível: 🟠 Complexo.**

Este é o exercício que prepara o terreno para o projeto da aula. Você vai
criar um **app OAuth2 de verdade** no Google Cloud, autorizar o n8n a ler e
enviar e-mail em nome de uma conta Gmail, e confirmar que consegue puxar o
conteúdo de um e-mail real para dentro de um workflow.

## 🎯 Objetivo

Configurar a credencial **Gmail OAuth2 API** no n8n e usar um **Gmail
Trigger** para capturar um e-mail de teste, extraindo remetente, assunto e
corpo.

> 💡 **Use uma conta de teste, se preferir.** Você não precisa autorizar o
> n8n na sua conta pessoal — crie uma conta Gmail nova só para os
> exercícios da disciplina, se ficar mais confortável.

## 📋 Parte 1 — Criar o app no Google Cloud

### 1. Criar o projeto

Em [console.cloud.google.com](https://console.cloud.google.com/), crie um
projeto novo (ex.: `n8n-faex-aula02`).

### 2. Ativar a Gmail API

**APIs e serviços → Biblioteca**, busque **Gmail API**, clique em **Ativar**.

### 3. Configurar a tela de consentimento OAuth

**APIs e serviços → Tela de permissão OAuth**:

- **Tipo de usuário:** Externo.
- Preencha nome do app, e-mail de suporte, e-mail de contato do
  desenvolvedor.
- Em **Escopos**, adicione:
  - `https://www.googleapis.com/auth/gmail.readonly` (ler)
  - `https://www.googleapis.com/auth/gmail.send` (enviar)
  - `https://www.googleapis.com/auth/gmail.modify` (marcar como lido, etc. —
    opcional, mas útil)
- Em **Usuários de teste**, adicione o **próprio e-mail** que você vai usar
  nos exercícios. Enquanto o app estiver em modo **Testing** (e ele vai
  ficar, para esta disciplina), só os e-mails cadastrados aqui conseguem
  autorizar.

### 4. Criar as credenciais OAuth2

**APIs e serviços → Credenciais → Criar credenciais → ID do cliente OAuth**:

- **Tipo de aplicativo:** Aplicativo da Web.
- **URIs de redirecionamento autorizados:** cole **exatamente** o valor que
  o Terraform imprimiu no módulo 02 —
  `https://<seu-ip>/rest/oauth2-credential/callback`.

Ao salvar, o Google mostra o **Client ID** e o **Client Secret**. Guarde os
dois — você não vai vê-los de novo na íntegra depois de fechar essa tela
(mas pode gerar um novo secret se perder).

> ⚠️ **Se o Google recusar a URI de redirecionamento** dizendo que ela
> precisa ser HTTPS: confira se você está usando o output do módulo 02
> (`https://`, não `http://`) e se copiou sem espaços extras.

## 📋 Parte 2 — A credencial no n8n

1. No n8n, **Credentials → New → Gmail OAuth2 API**.
2. Cole o **Client ID** e o **Client Secret**.
3. Clique em **Sign in with Google**: abre a tela de login do Google. Faça
   login com a conta que você cadastrou como usuária de teste.
4. O Google vai avisar que **"este app não foi verificado pelo Google"** —
   é esperado, porque o app está em modo Testing. Clique em **Avançado** →
   **Acessar [nome do app] (não seguro)**. (Esse aviso é do Google sobre o
   **seu** app, não sobre o certificado autoassinado do módulo 02 — são
   dois avisos parecidos, mas de coisas diferentes.)
5. Aceite as permissões (ler e enviar e-mail). O n8n confirma
   **"Connection successful"**.

## 📋 Parte 3 — O primeiro e-mail de verdade

1. Novo workflow: adicione um **Gmail Trigger**.
2. Selecione a credencial que você acabou de criar.
3. **Event:** `Message Received`. **Poll Times:** a cada minuto (para o
   exercício; num ambiente real você ajustaria conforme o volume).
4. (Opcional) Em **Filters**, restrinja por rótulo (`Label` = `INBOX`) ou só
   não lidos (`Q` = `is:unread`), para não disparar em e-mails antigos.
5. Salve e **publique** o workflow (Gmail Trigger também precisa do
   workflow publicado para funcionar em produção, igual ao Webhook da Aula
   01).
6. De outra conta (ou peça para um colega), mande um e-mail de teste para a
   caixa configurada, com um assunto e corpo claros.
7. Espere até 1 minuto (o intervalo do polling) e confira a aba
   **Executions**: deve aparecer uma execução nova, com os campos `from`,
   `subject`, `snippet`/`text` do e-mail que chegou.

## 🛟 Plano B — sem Gmail de verdade

Se você não conseguiu configurar o OAuth2 a tempo (app do Google Cloud em
revisão, Learner Lab fora do ar, etc.), simule a caixa de entrada com um
**Webhook**, do jeito que você já sabe da Aula 01, recebendo um JSON no
formato:

```json
{
  "from": "cliente@exemplo.com",
  "subject": "Pedido não chegou",
  "body": "Meu pedido 4521 ainda não chegou, já fazem 10 dias."
}
```

O resto do pipeline (Exercício Final) funciona igual — a única peça que
muda é o gatilho. Onde o módulo 09 pedir "responder por Gmail", você
responde com um **Respond to Webhook**, simulando a resposta.

## ✅ Checklist

- [ ] O app OAuth2 está criado, com os três escopos do Gmail e você mesmo
      cadastrado como usuário de teste.
- [ ] A URI de redirecionamento cadastrada bate **exatamente** com o output
      do Terraform.
- [ ] A credencial no n8n mostra "Connection successful".
- [ ] Um e-mail de teste real apareceu na aba Executions, com `from`,
      `subject` e o corpo.

## 📸 O que guardar para o relatório

- Print da tela de escopos da tela de consentimento OAuth.
- Print da credencial Gmail OAuth2 no n8n, com a mensagem de sucesso.
- Print da execução do Gmail Trigger mostrando o e-mail de teste capturado.

## 🧪 Perguntas de reflexão

1. Por que o Google exige que você **liste manualmente** os usuários de
   teste, em vez de deixar qualquer conta Gmail autorizar o seu app
   enquanto ele está em modo Testing?
2. O Gmail Trigger funciona por **polling** (verifica de tempos em tempos),
   não por webhook (o Google avisando na hora). Que tipo de atraso isso
   introduz no seu pipeline? Existe uma forma de reduzir esse atraso, e que
   custo isso tem (pense no rate limit)?
3. Se alguém conseguisse roubar o **Client Secret** do seu app Google Cloud,
   o que essa pessoa conseguiria fazer? E se roubasse só o **token** salvo
   na credencial do n8n (não o secret)? A resposta é a mesma?

**Próximo passo:** [09-exercicio-final](../09-exercicio-final/README.md)
