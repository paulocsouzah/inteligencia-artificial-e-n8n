# 7. Exercício 03 — Responder com a base de políticas real

**Nível: 🟠 Complexo.**

## 🎯 Objetivo

Buscar as políticas da loja pela API (não mais um texto fixo num Code
node) e responder uma reclamação **só** com base nelas — inclusive dizendo
"não encontrei" quando a pergunta não tem resposta na base.

## 📋 Passo a passo

1. Monte: **Manual Trigger** → **HTTP Request** (`GET
   /api/reclamacoes?status=nova`) → **Code** (escolha uma reclamação) →
   **HTTP Request** (`GET /api/politicas`) → **Code** (junte a pergunta com
   as políticas) → resposta com a LLM → **Code** (extrai a resposta).
2. O `GET /api/politicas` devolve uma **lista** de itens no n8n — um item
   por política. No Code que junta tudo, use `$input.all().map(i =>
   i.json)` para pegar **todas**, não só a primeira.
3. No prompt de resposta: *"Responda somente com base na base de
   conhecimento. Cite o trecho que usou. Se a informação não estiver na
   base, responda exatamente: Não encontrei essa informação."*
4. Teste com duas reclamações: uma com resposta clara na base (ex.: prazo
   de troca, horário de atendimento), e uma sem (ex.: "vocês vendem
   produtos para pets?").

## ✅ Checklist

- [ ] A pergunta com resposta na base traz o trecho certo, citado.
- [ ] A pergunta sem resposta devolve exatamente "Não encontrei essa
      informação.".
- [ ] Você confirmou que o Code que junta a pergunta com as políticas
      pegou **todas** as políticas (`$input.all()`), não só uma.

## 📸 O que guardar para o relatório

- Print de `GET /api/politicas`, mostrando a lista completa.
- As duas respostas (dentro e fora da base).

## 🧪 Perguntas de reflexão

1. Se você tivesse usado `$input.first().json` em vez de
   `$input.all().map(...)` para juntar as políticas, o que teria
   acontecido? (Dica: teste e veja a mensagem de erro.)
2. A base está no banco da loja, não mais escrita no workflow. Dê um
   exemplo de mudança de política que você faria **sem** tocar no
   workflow — só mudando o dado.
3. Se a loja tivesse 5.000 políticas em vez de 5, buscar todas numa
   chamada só ainda faria sentido? O que você mudaria?

> Gabarito do exercício (só depois de tentar): [`assets/workflow-ex03-gabarito.json`](assets/workflow-ex03-gabarito.json).

**Próximo passo:** [08-exercicio-04-multiplas-etapas](../08-exercicio-04-multiplas-etapas/README.md)
