# 6. Exercício 02 — Classificação e roteamento, gravando na loja

**Nível: 🟡 Médio.**

## 🎯 Objetivo

Classificar a intenção de uma reclamação real, rotear com um `Switch`, e
**gravar o resultado de volta na loja** com `PATCH` — fechando o ciclo
ler → processar → escrever pela primeira vez hoje.

## 📋 Passo a passo

1. **Manual Trigger** → **HTTP Request** (`GET
   /api/reclamacoes?status=nova`) → **Code** (escolha uma reclamação) →
   classificação (schema com `intencao`: `venda`/`suporte`/`financeiro`/`outro`,
   e `confianca`) → **Switch** com quatro saídas.
2. Em cada saída do Switch, monte o corpo do `PATCH` (`status` e
   `intencao`) e chame `PATCH /api/reclamacoes/:id`. Use o `id` da
   reclamação que você escolheu no passo 1 (`$('Escolher reclamacao').first().json.id`).
3. No prompt de classificação, **descreva** cada intenção — não basta
   listar os nomes. Exemplo: `financeiro (cobranca, estorno, reembolso,
   pagamento ou boleto)`.
4. Teste com reclamações de intenções diferentes, uma de cada vez.

## 🧪 Confirme que gravou de verdade

Depois de cada execução, confira pela API — não só pela tela do n8n:

```bash
curl http://<ip>:8080/api/reclamacoes
```

A reclamação que você processou deve aparecer com o `status` e a
`intencao` novos. Se ela ainda aparecer como `"nova"`, o `PATCH` não
funcionou — confira a URL (o `id` está certo?) e o corpo da requisição.

## ✅ Checklist

- [ ] A classificação bate com o conteúdo da reclamação.
- [ ] O `Switch` roteia para a saída certa.
- [ ] O `PATCH` realmente mudou o registro no banco — confirmado pela API,
      não só pela tela do n8n.
- [ ] Uma reclamação fora das três intenções principais cai na saída
      `extra` do Switch.

## 📸 O que guardar para o relatório

- Print do `Switch` com as quatro saídas.
- Print do `curl` **antes** e **depois** do `PATCH`, mostrando a mudança.

## 🧪 Perguntas de reflexão

1. Por que conferir pela API, e não só pela tela de execução do n8n, é uma
   forma mais confiável de saber se o `PATCH` funcionou?
2. Se o `PATCH` falhasse silenciosamente (por exemplo, um `id` errado que
   não dá erro 404, só não atualiza nada), como você perceberia isso num
   workflow rodando sozinho, sem você conferir manualmente todo dia?

> Gabarito do exercício (só depois de tentar): [`assets/workflow-ex02-gabarito.json`](assets/workflow-ex02-gabarito.json).

**Próximo passo:** [07-exercicio-03-rag-em-memoria](../07-exercicio-03-rag-em-memoria/README.md)
