# 1. Contexto e problema real

Todo workflow que eu te mostrei até agora funcionou. Eu testei na sua
frente, o `curl` voltou certo, a IA classificou direito. Isso é o
**caminho feliz** — tudo acontecendo exatamente como esperado. O problema é
que produção não é uma demonstração: a API do GitHub vai cair às vezes, a
LLM vai demorar 40 segundos numa hora de pico, e algum dia ela vai
devolver um texto que não é o JSON que você pediu. A pergunta de hoje não
é "o workflow funciona?" — é **"o que acontece quando ele não funciona?"**

---

## 📋 Três formas de quebrar que você ainda não tratou

Olha de novo o projeto final da Aula 02 — Gmail → IA → decide → responde.
Três coisas que eu **não** tratei, de propósito, para você sentir a falta
hoje:

| # | O que pode dar errado | O que acontece **hoje**, sem blindagem |
|---|------------------------|------------------------------------------|
| 1 | A API da LLM cai por 2 segundos (acontece, até com os grandes provedores) | O workflow inteiro falha. O e-mail do cliente **não é processado** — nem respondido, nem escalado. Ele só desaparece do seu radar |
| 2 | A LLM demora 30 segundos para responder (fila de tráfego do provedor) | Dependendo da sua configuração, o node espera para sempre, ou falha com um erro genérico de timeout, sem te dizer o que fazer a seguir |
| 3 | A LLM devolve `{"categoria": "troca", "sentimento": "negativo"...` — um JSON **cortado no meio** | O `JSON.parse` explode, o workflow para, e de novo: o cliente fica sem resposta, e **ninguém percebe**, porque a execução aparece como "erro" numa lista que ninguém olha todo dia |
| 4 | Você processa 500 e-mails de um boletim de volta às férias, todos de uma vez | Se cada um chama a LLM imediatamente, você pode estourar o rate limit do provedor no meio do lote — e os últimos 200 e-mails falham em cascata |

Repare no padrão: em **nenhum** desses casos o cliente recebe um erro
educado, nem um humano é avisado. O workflow simplesmente **para**, e a
falha fica invisível até alguém perguntar "por que o João não recebeu
resposta?". Isso é pior do que um erro visível — é um **erro silencioso**.

## 🏢 Dois casos reais: volume e confiabilidade

**iMi digital, migrando a importação de uma loja virtual.** A
[iMi digital](https://n8n.io/case-studies/imi-digital-gmbh/) precisava
importar produtos, preços e clientes para lojas Shopware a partir de
arquivos CSV — o importador antigo levava **cerca de um dia** para
rodar. Dois problemas apareceram ao tentar fazer isso em n8n: o volume
(**2,6 milhões de linhas de preço por semana**) e a memória — processar
tudo de uma vez travava o processo. A solução não foi "uma chamada de API
maior": foi **payloads em lote** (reduzindo o número de requisições) e
**sub-workflows** especificamente para controlar quanto dado fica em
memória a cada passo. Resultado: de ~1 dia para **menos de 10 minutos**.

**Oversee, operando em 60+ países.** A [Oversee](https://n8n.io/case-studies/oversee/)
(antes FairFly) atende companhias de viagem como a BCD Travel em mais de
60 países e 7 mil clientes. Um workflow que quebra silenciosamente, numa
escala dessas, não é um incômodo — é um ticket que nunca chega a ninguém.
O time reduziu o tempo de primeira resposta em **50%** automatizando a
investigação de cada chamado, exatamente porque o processo **não pode
parar no meio** sem ninguém perceber.

> ℹ️ De novo, ordem de grandeza — não promessa. O padrão que importa: nos
> dois casos, o ganho não veio só de "automatizar", veio de automatizar
> de um jeito que **aguenta volume e não quebra em silêncio**.

## 🧠 O que muda, com IA no meio

Com a Aula 02, o seu workflow ganhou uma dependência **nova e menos
previsível** que um banco de dados ou uma API interna: uma LLM de
terceiro, que você não controla, que pode ficar lenta, cara, ou
simplesmente "criativa demais" na hora de devolver um JSON. Tratar erro
de IA não é só "tratar erro de API" — tem uma camada a mais:

```
Erro de API comum          Erro "de IA"
─────────────────          ─────────────────────────────────
Caiu (5xx)                 Caiu, OU demorou demais (custo de tempo),
Autenticação (401)         OU respondeu "certo" só que o JSON não bate
Rate limit (429)           com o schema, OU custou mais tokens do que
                            devia, OU alucinou um dado que não existe
```

É por isso que a blindagem de hoje tem duas frentes: a **estrutural**
(retry, timeout, Error Workflow — vale para qualquer API) e a
**específica de IA** (validar a saída antes de confiar nela).

## 🧭 Para onde isso vai

| Aula | O que você constrói |
|------|---------------------|
| **3 (esta)** | Blindar o pipeline: Switch, retry, timeout, validação de saída, Error Workflow |
| 4 | Aprofundar a IA: extração em várias etapas, RAG, roteamento por intenção |
| 5 | Um agente escolhe as ferramentas sozinho |
| 6 | Hackathon: juntar tudo |

## 🧪 Exercício

Antes de seguir, responda por escrito:

1. Reveja a tabela dos 4 jeitos de quebrar. Para cada um, descreva **em
   uma frase** o que você, como cliente da loja, sentiria se fosse o seu
   e-mail que sumiu.
2. No caso da iMi digital, o problema não era "a API não funciona" — era
   memória estourando com volume alto. Que diferença isso faz na forma
   de resolver (comparado a, por exemplo, só adicionar um retry)?
3. Pensa num sistema que você usa no dia a dia (banco, e-commerce,
   delivery) que **nunca** parece quebrar silenciosamente — sempre te
   avisa quando algo deu errado. O que você imagina que existe por trás
   disso, tecnicamente?

**Próximo passo:** [02-ambiente-n8n-na-aws](../02-ambiente-n8n-na-aws/README.md)
