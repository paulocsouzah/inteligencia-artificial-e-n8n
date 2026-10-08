# 9. Exercício Final — Atendimento automático da Loja FAEX

**Nível: 🎯 Projeto.**

Hoje o projeto processa **todas** as reclamações novas da loja, de uma vez
— não mais uma reclamação de teste escolhida à mão. É o exercício que mais
expõe a pegadinha do módulo 03 (Run Once for Each Item), porque só aparece
quando há mais de um item para processar.

## 🎯 Objetivo

Um workflow com **Schedule Trigger** que, a cada execução: busca todas as
reclamações `nova`, processa cada uma (intenção → extração → resposta),
decide a ação, grava o resultado na loja com `PATCH`, e responde por
e-mail quando a ação é automática.

## 📜 O contrato

### A regra de decisão (nesta ordem)

| Condição | `acao` | `status` gravado |
|---|---|---|
| `confianca < 0.7` **ou** a resposta contém "Não encontrei" | `encaminhado_humano` | `escalada` |
| `intencao` é `venda` | `encaminhado_vendas` | `encaminhado_vendas` |
| Qualquer outro caso | `respondido_automaticamente` | `respondida` |

### O que o workflow grava, por reclamação

```json
PATCH /api/reclamacoes/:id
{ "status": "respondida", "intencao": "suporte", "resposta": "..." }
```

### Quando responde por e-mail

Só quando `acao = "respondido_automaticamente"`: um node **Gmail → Send**
manda a `resposta` para o `cliente_email` da reclamação.

## 📋 Passo a passo sugerido

1. **Schedule Trigger** (a cada 1 minuto, para testar — em produção você
   ajustaria o intervalo).
2. **HTTP Request:** `GET /api/reclamacoes?status=nova`.
3. As três etapas do Exercício 04, **sem** o "escolher uma reclamação" —
   deixe todas as reclamações da lista passarem.
4. **Em cada Code node da cadeia, confira o modo: Run Once for Each
   Item.** Esse é o passo que mais gente esquece — e é exatamente o que
   eu errei montando esta aula (veja o módulo 04).
5. **Decisão** (Code, com a tabela acima) → **Montar patch** (Code) →
   **HTTP Request PATCH**.
6. **If:** `acao == "respondido_automaticamente"`? Preste atenção: depois
   do `PATCH`, `$json` é a **resposta da API**, que não tem o campo
   `acao`. Use `$('Montar patch').item.json.acao` na condição do `If`.
7. No ramo verdadeiro: **Gmail → Send**, para `cliente_email`, com a
   `resposta`.

## 🧪 Os testes

1. Registre, pela tela da loja, **pelo menos três** reclamações
   diferentes: uma com resposta clara na base, uma fora da base, e uma
   claramente de intenção de venda.
2. Rode o workflow manualmente uma vez (clique em *Execute workflow*, ou
   dispare o Schedule Trigger).
3. Confira pela API que **todas** foram atualizadas:
   ```bash
   curl http://<ip>:8080/api/reclamacoes
   ```
4. Confira que o e-mail chegou para as reclamações com
   `respondido_automaticamente`.

## 🚀 Desafio — relatório automático

Acrescente um segundo workflow, com **Schedule Trigger** (uma vez por
dia), que:
1. Busca todas as reclamações (`GET /api/reclamacoes`, sem filtro).
2. Conta quantas foram `respondida`, `escalada` e `encaminhado_vendas`.
3. Escreve essa contagem numa aba nova de uma planilha do **Google
   Sheets** (reaproveite a credencial que você já tem).

Isso fecha outro ciclo: de "a IA responde" para "alguém consegue ver, sem
abrir o n8n, o que a IA andou fazendo". Vale até **+10%**.

## ✅ Checklist

- [ ] O workflow processa **todas** as reclamações novas numa execução —
      confirmado comparando o número de reclamações `nova` antes e depois.
- [ ] Os Code nodes da cadeia estão em **Run Once for Each Item**.
- [ ] O `PATCH` grava `status`, `intencao` e `resposta` corretos para cada
      uma.
- [ ] O `If` usa `$('Montar patch').item.json.acao`, não `$json.acao`.
- [ ] Pelo menos um e-mail de resposta automática chegou de verdade.
- [ ] (Desafio) O relatório diário grava na planilha.

## 📸 O que guardar para o relatório

- Print de `GET /api/reclamacoes` **antes** (várias `nova`) e **depois**
  (todas processadas).
- Print de um e-mail de resposta automática recebido.
- Print mostrando o modo **Run Once for Each Item** configurado.
- (Desafio) Print da planilha com a contagem.

## 🧪 Perguntas de reflexão

1. A regra de decisão tem uma ordem. Se você trocasse a ordem — checasse
   `venda` antes de `confianca`/"não encontrei" — o que mudaria no
   resultado de uma reclamação de venda sem resposta na base?
2. O e-mail só sai para quem a ação for automática. O que você faria,
   hoje, para avisar um humano sobre as reclamações `escalada` — sem ser
   "alguém abre o n8n e olha as execuções"?
3. Se a credencial do Gmail expirar no meio da madrugada (acontece — veja
   o aviso da Aula 02 sobre apps em modo *Testing*), o que acontece com as
   reclamações daquela execução? O `PATCH` ainda roda? A resposta ainda é
   gravada no banco, mesmo sem o e-mail sair?

## 📦 O que entregar

### 1. Workflow(s) exportado(s) (JSON)

- `Aula 04 - Projeto - Atendimento da loja`
- (Desafio) `Aula 04 - Relatorio diario`

### 2. Relatório em PDF, contendo

1. Identificação e data.
2. Módulos 01, 03 e 04: respostas e prints.
3. Exercícios 01 a 04: checklists, prints, respostas.
4. Projeto final: os testes, os prints pedidos, o desafio se fez.
5. **Síntese (~1 parágrafo):** compare o workflow de hoje com o da Aula
   02. Lá, a "base de conhecimento" e os "pedidos" eram inventados num
   Code node; hoje são um sistema real. O que isso mudou na forma como
   você testou o seu trabalho? E: a pegadinha do "Run Once for Each Item"
   só apareceu quando você testou com uma **lista** de verdade — que outro
   tipo de problema você imagina que só aparece testando em escala, e não
   com um item só?

## ✅ Rubrica de avaliação

| Critério | Peso |
|---|---|
| Módulos de contexto, conceitos e demonstração (01, 03, 04) | 10% |
| Exercício 01 — extração de uma reclamação real | 10% |
| Exercício 02 — classificação, roteamento e `PATCH` | 15% |
| Exercício 03 — resposta com a base de políticas real | 15% |
| Exercício 04 — três etapas + experimento do prompt misturado | 15% |
| Projeto final — todas as reclamações processadas, e-mail real enviado | 25% |
| Síntese final | 10% |

**Bônus:** o relatório diário na planilha vale até **+10%**.

## 📮 Como entregar

```
n8n-Aula04-SeuNome.pdf
```

---

**Fim da Aula 04.** O workflow deixou de ler um dado inventado e passou a
ler, processar e **escrever** num sistema real — com um bug real
(processar só 1 de 5 itens) que não dava erro nenhum, e que só aparece
quando você testa com mais de um item. Na **Aula 05**, a Loja FAEX
continua no ar: um **AI Agent** vai decidir sozinho quando consultar
pedidos, quando buscar políticas e quando pedir ajuda — escolhendo as
ferramentas, em vez de você desenhar cada passo.
