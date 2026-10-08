# 2. Ambiente — a infraestrutura compartilhada (n8n + Loja FAEX)

**Nível: 🟢 Básico (obrigatório).**

A partir de hoje, o ambiente muda de padrão: em vez de um Terraform só para
o n8n, usamos um **ambiente compartilhado**, com o n8n de sempre **e** a
Loja FAEX (API + frontend + RDS MySQL). Essa infraestrutura vale para esta
aula, a Aula 05 e o projeto final (Aula 06) — você sobe uma vez e usa nas
três.

## 📋 O que fazer

Todo o Terraform, o passo a passo e as decisões técnicas estão num só
lugar, fora da numeração das aulas:

➡️ **[`_ambiente-compartilhado-loja/README.md`](<../../_ambiente-compartilhado-loja/README.md>)**

Siga aquele README até o fim antes de continuar aqui. Resumindo o que você
vai ter ao final:

- `https://<ip>` — o n8n, igual às Aulas 02 e 03 (HTTPS autoassinado).
- `http://<ip>:8080` — a Loja FAEX (frontend + API), sem HTTPS, só didático.
- Um RDS MySQL, numa subnet privada, com as tabelas `produtos`, `pedidos`,
  `reclamacoes` e `politicas` já criadas e com dados de exemplo.

> ⏳ **Esse `apply` demora de verdade** — de 10 a 15 minutos, porque o RDS
> leva de 5 a 10 minutos para ficar pronto, e a EC2 só começa a instalar
> depois que o RDS termina. Se você já tem o ambiente de pé (de uma aula
> anterior ou de quando eu testei antes da aula), **não precisa subir de
> novo** — só confirme que os dois endereços respondem.

## ✅ Confira antes de continuar

1. Abra `http://<ip>:8080` — a Loja FAEX deve carregar, com 5 produtos.
2. Compre um produto pela tela. Anote o protocolo (`PED-AAAAMMDD-N`).
3. Registre uma reclamação pela tela. Anote o protocolo (`REC-AAAAMMDD-N`).
4. Abra `https://<ip>` — o n8n deve carregar normalmente (aviso de
   certificado autoassinado, esperado).
5. Na credencial de API da sua LLM (a mesma das Aulas 02/03), confirme que
   a chave tem crédito.

## 🧪 Exercício

Antes de seguir, teste a API da loja direto, sem passar pelo n8n ainda —
isso ajuda a entender o que o workflow vai consultar:

```bash
curl http://<ip>:8080/api/produtos
curl "http://<ip>:8080/api/reclamacoes?status=nova"
curl http://<ip>:8080/api/politicas
```

1. Quantas reclamações aparecem com `status=nova`? Isso inclui a que você
   acabou de criar?
2. Olhe o JSON de uma política. Que campos ela tem? Como você imagina que
   um workflow usaria isso para responder uma pergunta do cliente?

**Próximo passo:** [03-conceitos-fundamentais](../03-conceitos-fundamentais/README.md)
