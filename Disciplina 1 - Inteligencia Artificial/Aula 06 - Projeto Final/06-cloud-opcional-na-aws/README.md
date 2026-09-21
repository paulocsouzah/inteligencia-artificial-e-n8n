# 6. Cloud opcional na AWS

**Nível: 🔴 Avançado (opcional — vale até +10 pontos).**

Você não é obrigado a colocar o seu projeto na nuvem. Mas quem fez o
curso de DevOps comigo e as Aulas 04 e 05 daqui já tem **quase tudo
pronto**: a mesma infraestrutura de Terraform (VPC, EC2, RDS com
pgvector) serve para o seu projeto, com poucas adaptações. Se a sua
equipe tem fôlego, esta é a parte que transforma "roda na minha máquina"
em "roda na internet".

> Se o prazo estiver apertado, **não faça**. Um projeto local, bem
> feito e bem documentado, vale mais que um projeto na AWS que quebra.
> O bônus existe para quem já terminou o resto.

---

## 🧱 O que você já tem pronto

| Peça | Onde está | O que faz |
|---|---|---|
| Terraform da VPC, EC2 e RDS | [Aula 05, Exercício 05](<../../Aula 05 - AI Agents/09-exercicio-05-agente-na-aws/README.md>) (`assets/terraform/`) | Cria a rede, o Security Group, a EC2 (Amazon Linux 2023) e o RDS Postgres com pgvector |
| O passo a passo do RAG na AWS | [Aula 04, Exercício 04](<../../Aula 04 - RAG e Embeddings/07-exercicio-04-rag-com-infra-aws/README.md>) | Explica o pgvector, o Security Group do banco e o `terraform apply` |
| O script `user_data` | `assets/terraform/user_data.sh.tpl` | Instala Docker, clona o **seu** repositório, cria o `.env`, sobe o `docker compose` e configura o Nginx |

Ou seja: você **não** vai escrever Terraform do zero. O projeto de exemplo, o
[AI Detective](../00-exemplo-projeto/README.md), já traz uma pasta `terraform/` **adaptada**: ela
sobe o container do app, gera as evidências, indexa tudo no RDS (o `npm run setup` roda de dentro da
EC2) e configura o Nginx para o streaming e para o upload de PDFs. **Se você partiu do AI Detective,
é só copiar essa pasta para o seu repositório** e preencher o `terraform.tfvars`. O passo a passo está
na seção 9 do README do projeto.

A lista da próxima seção é para quem começou **do zero** e vai adaptar o Terraform das aulas ao seu
próprio projeto.

## 🎚️ Dois níveis de bônus

| Nível | O que entregar | Bônus |
|---|---|---|
| **Nível 1 — App no ar** | Sua aplicação rodando numa EC2, acessível por um IP público, provisionada com Terraform | até **+5** |
| **Nível 2 — Serviço gerenciado de verdade** | Nível 1 **+** um serviço da AWS usado de forma real pelo projeto — por exemplo, o **RDS com pgvector** como vector store do seu RAG, ou um bucket **S3** guardando os documentos | até **+10** |

## 🔧 O que adaptar no Terraform (se você não partiu do AI Detective)

O `user_data` das Aulas 04 e 05 foi escrito para os apps daquelas aulas. Para o seu, confira
cada item:

1. **`app_repo_url`** (em `terraform.tfvars`): a URL do **seu** repositório.
2. **O `Dockerfile` e o `docker-compose.yml`** precisam existir na raiz
   do seu repositório, e a aplicação precisa escutar na **porta 3000**
   (é para onde o Nginx aponta). Se o seu projeto usa outra porta,
   ajuste o `proxy_pass` no `user_data`.
3. **As variáveis do `.env`** que o `user_data` gera (`DB_HOST`,
   `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `OPENAI_API_KEY`)
   precisam ter os mesmos nomes que o seu código lê. Se o seu projeto
   usa outros nomes, ajuste o trecho `cat > /opt/app/.env`.
4. **O comando de seed.** O `user_data` roda
   `docker compose exec -T app node seed.js`. Se o seu projeto **não**
   tem um `seed.js` (ou se o comando é outro), troque ou remova essa
   linha. Atenção: o script começa com `set -e` — se esse comando
   falhar, o script **para ali** e o Nginx nunca chega a ser
   configurado. O sintoma é uma EC2 no ar cujo IP não abre nada.
5. **A conexão com o RDS exige SSL.** O RDS Postgres recusa conexão sem
   criptografia por padrão; nas aulas, o código usa
   `ssl: { rejectUnauthorized: false }`. Se o seu código conecta de outro
   jeito, ele precisa aceitar SSL.
6. **Tamanho da instância.** As aulas usam uma `t2.micro` (1 GB de RAM).
   Um `next build` costuma estourar a memória nesse tamanho. Se o seu
   projeto for Next.js e o build falhar, aumente o `instance_type` para
   um tamanho maior ou faça o build em outra etapa.
7. **Nome do projeto.** Mude `project_name` para não colidir com nada
   que você já tenha na conta.
8. **Nginx e streaming.** Se o seu app usa streaming (SSE) ou recebe
   uploads, o Nginx precisa de `proxy_buffering off` (senão a resposta
   chega toda de uma vez, no final) e de `client_max_body_size` maior
   que o padrão de 1 MB (senão o upload de um PDF é barrado). A versão do
   AI Detective já traz os dois.

## ⏱️ O que esperar de tempo

Do que eu vi rodando o mesmo Terraform:

- O `terraform apply` leva **uns 5 a 6 minutos**, e quase tudo isso é o
  RDS sendo criado.
- Depois do `apply` terminar, o `user_data` ainda continua rodando **mais
  2 a 3 minutos** dentro da EC2 (instalando Docker, buildando a imagem).
  Não adianta abrir o IP antes disso.
- O `terraform destroy` também espera o RDS ser removido — não
  interrompa no meio, senão sobram recursos ligados na sua conta.

## ⚠️ Quatro armadilhas

**1. Abra o IP com `http://` na frente.** Colar só o IP na barra do
navegador faz muitos navegadores tentarem `https://`. Como o projeto
não tem certificado nem nada ouvindo na porta 443, a página fica
carregando até dar timeout — e parece que o servidor caiu. A porta 80
está funcionando; o problema é o protocolo. Quando você passar o link
para alguém, escreva sempre `http://<ip>`.

**2. O seu app está aberto para a internet, com a sua chave dentro.**
O Security Group libera a porta 80 para todo mundo (senão eu não
conseguiria abrir o seu projeto). Só que o projeto não tem
autenticação: **qualquer pessoa que descobrir o IP consegue usar a sua
chave de API**, e o gasto é seu. Por isso:

- Configure um **limite de gasto** no painel do provedor.
- Deixe o projeto no ar só durante o período de avaliação.
- Se quiser um pouco mais de segurança, restrinja a porta 80 ao seu IP
  quando não estiver mostrando para ninguém.

**3. Learner Lab tem prazo e orçamento.** A sessão do laboratório
expira, e os recursos param ou somem com ela. Não conte que a infra
vai estar de pé quando eu for avaliar — por isso, veja a próxima seção.

**4. Algumas funções do navegador só existem em HTTPS.** Como o projeto é servido por `http://<ip>`,
o navegador o trata como "contexto inseguro" e **desliga** APIs como `crypto.randomUUID()`, a área de
transferência e a geolocalização. Na primeira versão do AI Detective, isso travava o chat na AWS: tudo
funcionava no `localhost` (que é considerado seguro) e na EC2 a tela ficava em "investigando…" para
sempre. Foi por isso que o projeto tem `components/chat/newId.ts`, que usa `crypto.getRandomValues`
(essa funciona em qualquer contexto). **Teste o seu projeto pelo IP da EC2, não só no `localhost`.**

## 📸 Como provar que funcionou

Como a infraestrutura pode não estar no ar na hora em que eu avaliar,
o bônus de Cloud precisa de **evidência dentro do repositório**:

- A pasta `terraform/` (sem `terraform.tfvars`, `.terraform/` nem
  `*.pem` — o `.gitignore` da aula já cuida disso).
- Uma seção **"Deploy na AWS"** no README explicando o que foi criado e
  como reproduzir.
- **Prints** (numa pasta `docs/`) do `terraform apply` finalizado, com
  os outputs, e da aplicação aberta no navegador pelo IP público.
- O IP público, se a infra ainda estiver no ar — mas como um extra, não
  como a única evidência.

## 🧹 Quando terminar

```bash
cd terraform
terraform destroy
```

Assim que eu confirmar a avaliação (ou assim que você tiver as
evidências), destrua a infraestrutura. Recurso esquecido ligado consome
o orçamento do laboratório.

## 🧪 Perguntas de reflexão

1. O que, no seu projeto, **precisou mudar** para rodar na AWS que não
   era problema na sua máquina?
2. Por que o RDS fica numa subnet privada e só aceita conexão do
   Security Group da EC2? O que aconteceria se ele tivesse IP público?
3. O que falta, no mínimo, para o seu projeto ser exposto na internet
   sem risco para a sua chave da API?

**Próximo passo:** [07-entrega-e-avaliacao](../07-entrega-e-avaliacao/README.md)
