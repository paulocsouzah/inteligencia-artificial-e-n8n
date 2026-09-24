# 9. Exercício Final — Relatório da Aula 01

Este módulo fecha a aula. Você entrega um **relatório em PDF** e os
**workflows exportados** em JSON.

## 📦 O que entregar

### 1. Workflows exportados (JSON)

Os quatro workflows, exportados pelo menu **⋯ → Download**:

- `Aula 01 - Ex 01 - Primeiro workflow`
- `Aula 01 - Ex 02 - JSON e expressions`
- `Aula 01 - Ex 03 - Meu primeiro webhook`
- `Aula 01 - Ex 04 - Recepção de solicitações` (e o do desafio, se fez)

**Exporte antes de rodar `terraform destroy`** — os workflows moram no volume da
EC2 e vão embora junto com ela. **Não inclua** o `terraform.tfvars` nem o
`vockey.pem`.

### 2. Relatório em PDF, contendo

1. **Identificação:** seu nome e a data.
2. **Contexto e problema real:** suas respostas ao exercício do módulo
   [01-contexto-e-problema-real](../01-contexto-e-problema-real/README.md).
3. **Ambiente na AWS (módulo 02):**
   - Print do `terraform apply` finalizado, com os outputs.
   - Print do n8n aberto pelo IP (barra de endereço visível).
   - Print da **Production URL** de um node Webhook começando com o seu IP.
   - As respostas às perguntas de reflexão.
4. **Conceitos (módulo 03):** suas respostas ao exercício.
5. **Demonstração guiada (módulo 04):** os prints e a tabela dos quatro erros.
6. **Exercício 01 — Primeiro workflow:**
   - Print do canvas com os dois triggers.
   - Print da saída do `Montar mensagem` e da aba **Executions** com o agendamento.
   - As respostas às perguntas de reflexão.
7. **Exercício 02 — JSON e expressions:**
   - Print da saída do `Gerar clientes` (3 itens) e do `Limpar dados`.
   - Print da saudação **errada** e da **corrigida**.
   - As respostas às perguntas de reflexão.
8. **Exercício 03 — Seu primeiro webhook:**
   - Print das duas URLs com o seu IP e do dado chegando pela URL de teste.
   - O `curl` de produção com a resposta, e a aba **Executions**.
   - A tabela dos cinco erros, com a mensagem real de cada um.
   - As respostas às perguntas de reflexão.
9. **Exercício 04 — Recepção de solicitações:**
   - Print do canvas.
   - O resultado dos **quatro testes** (o `curl` e a resposta).
   - Print da execução do Teste 4 mostrando `email: null`.
   - (Desafio) O resultado dos três casos do `If`.
   - As respostas às perguntas de reflexão.
10. **Síntese final (obrigatória, ~1 parágrafo):** você passou a aula
    construindo a "porta de entrada" de um sistema de atendimento — e descobriu
    que o n8n aceita quase tudo que chega, sem reclamar, e termina em "sucesso"
    mesmo quando o dado está errado. Pensando em um processo real que você
    conhece (do seu trabalho, do seu estágio, ou o que você descreveu no módulo
    01): **quais validações você faria na entrada desse processo antes de deixá-lo
    seguir adiante?** E o que você **não** confiaria a um workflow sem uma pessoa
    revisando?

## ✅ Rubrica de avaliação

| Critério | Peso |
|---|---|
| Ambiente na AWS provisionado e funcionando (módulo 02) — prints e respostas | 15% |
| Exercícios de contexto, conceitos e demonstração (módulos 01, 03 e 04) respondidos | 10% |
| Exercício 01 completo (workflow + prints + reflexão) | 10% |
| Exercício 02 completo — expressions e a pegadinha do `$json` | 15% |
| Exercício 03 completo — URL de teste x produção e a tabela de erros | 15% |
| Exercício 04 completo — o contrato cumprido e os quatro testes | 20% |
| Síntese final — qualidade da reflexão sobre validação e supervisão humana | 15% |

**Bônus:** o **desafio do Exercício 04** (barrar a entrada inválida com o node
`If` e responder `400`) vale até **+10%** na nota final da aula. Ele adianta
conteúdo da Aula 3 e é o melhor exercício da aula para mostrar que você entendeu
o problema, não só a ferramenta.

## 📮 Como entregar

Envie o PDF **e** os JSONs (zip ou link de repositório) pelo canal que eu
indicar. Nomeie o PDF como:

```
n8n-Aula01-SeuNome.pdf
```

## 🧹 Antes de sair

Confirme que você **exportou** os workflows e rode:

```bash
cd 02-ambiente-n8n-na-aws/assets/terraform
terraform destroy
```

---

**Fim da Aula 01.** Você colocou um n8n no ar com Terraform, aprendeu a linguagem
dele — workflow, trigger, node, item, expression, webhook — e construiu a porta
de entrada do AI Customer Service. Mais importante: você viu, na tela, que um
workflow que "funciona" ainda pode estar errado. Na **Aula 02**, essa porta de
entrada passa a **conversar com outros sistemas**: você vai chamar APIs REST,
lidar com autenticação e paginação, e buscar o status do pedido do cliente.
