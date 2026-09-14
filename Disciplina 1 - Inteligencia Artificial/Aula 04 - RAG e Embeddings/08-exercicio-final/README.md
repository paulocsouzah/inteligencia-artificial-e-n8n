# 8. Exercício Final — Relatório da Aula 04

Este módulo fecha a aula. Assim como na Aula 03, você entrega relatório
em PDF **e** código-fonte.

## 📦 O que entregar

### 1. Código-fonte

Pasta ou repositório com `similaridade.js`, `retrieval.js` e
`rag-completo.js`. Se fez o Exercício 04, inclua também o link do
repositório da aplicação (o que você criou a partir de `assets/app`) e,
se ainda estiver no ar, o IP público da EC2 para eu testar o chatbot
diretamente. **Não inclua** `node_modules/`, `.env` nem
`terraform.tfvars`/`*.pem`.

### 2. Relatório em PDF, contendo

1. **Identificação:** seu nome e a data.
2. **Contexto e problema real:** suas respostas ao exercício do módulo
   [01-contexto-e-problema-real](../01-contexto-e-problema-real/README.md).
3. **Exercício 01 — Embeddings e Similaridade:**
   - Print da matriz de similaridade.
   - A tabela preenchida.
   - As respostas às perguntas de reflexão.
4. **Exercício 02 — Retrieval sobre uma Base de FAQ:**
   - Print dos resultados das 3 perguntas.
   - A tabela preenchida.
   - As respostas às perguntas de reflexão.
5. **Exercício 03 — RAG Completo:**
   - Print das 3 respostas geradas (com os chunks usados).
   - A tabela preenchida.
   - As respostas às perguntas de reflexão.
   - *Opcional:* print do desafio (pergunta sem resposta no manual).
6. **Exercício 04 — RAG com Infraestrutura Real (opcional):**
   - Print do `terraform apply` finalizado (outputs incluídos).
   - Print do chatbot rodando no navegador, respondendo pelo menos 2
     perguntas diferentes.
   - As respostas às perguntas de reflexão.
7. **Síntese final (obrigatória, ~1 parágrafo):** conecte os três
   últimos módulos do curso — Prompt Engineering (Aula 02) ensinou a
   escrever contexto à mão; IA por API (Aula 03) ensinou o código a
   chamar o modelo sozinho; RAG (esta aula) ensinou o código a **encontrar
   sozinho** o contexto certo. Na sua opinião, qual dessas três peças
   seria a mais difícil de tirar do seu cenário de atendimento
   automatizado, sem quebrar a qualidade das respostas? Por quê?

## ✅ Rubrica de avaliação

| Critério | Peso |
|---|---|
| Exercício de contexto (módulo 01) respondido | 10% |
| Exercício 01 completo (código + print + tabela + reflexão) | 15% |
| Exercício 02 completo (código + print + tabela + reflexão) | 20% |
| Exercício 03 completo (código + prints + tabela + reflexão) | 35% |
| Síntese final — qualidade da conexão entre Aula 02, 03 e 04 | 20% |

**Bônus:** o Exercício 04 (RAG com VPC+EC2+RDS na AWS) vale até **+15%**
na nota final da aula — é significativamente mais trabalho que os
desafios opcionais de outras aulas, então o bônus é maior.

## 📮 Como entregar

Envie o PDF **e** o código (zip ou link de repositório) pelo canal que eu
indicar. Nomeie o PDF como:

```
IA-Aula04-SeuNome.pdf
```

---

**Fim da Aula 04.** Na próxima aula (AI Agents), a mesma busca que você
implementou hoje vira uma **ferramenta** que o próprio modelo decide
quando usar — em vez de você decidir "sempre buscar antes de responder",
o modelo vai raciocinar sobre quando vale a pena buscar, quando responder
direto, e quando usar outras ferramentas.
