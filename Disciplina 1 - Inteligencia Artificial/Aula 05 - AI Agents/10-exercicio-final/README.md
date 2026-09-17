# 10. Exercício Final — Relatório da Aula 05

Este módulo fecha a aula. Assim como nas Aulas 03 e 04, você entrega
relatório em PDF **e** código-fonte.

## 📦 O que entregar

### 1. Código-fonte

Pasta ou repositório com `fixtures.js`, `investigador-basico.js`,
`workflow-vs-agent.js`, `investigador-loop.js` e
`ai-software-engineer.js`. Se fez o Exercício 05, inclua também o link
do repositório da aplicação web e, se ainda estiver no ar, o IP público
da EC2. **Não inclua** `node_modules/`, `.env` nem
`terraform.tfvars`/`*.pem`.

### 2. Relatório em PDF, contendo

1. **Identificação:** seu nome e a data.
2. **Contexto e problema real:** suas respostas ao exercício do módulo
   [01-contexto-e-problema-real](../01-contexto-e-problema-real/README.md).
3. **A escada de conceitos (módulo 02):** suas respostas ao exercício,
   reclassificando o `triar_mensagem` (Aula 03) e o chatbot RAG
   (Aula 04) na escada LLM → Tool Calling → Workflow → Agent.
4. **Memória, planejamento, guardrails e riscos (módulo 03):** suas
   respostas ao exercício, incluindo o cenário de prompt injection que
   você descreveu.
5. **Exercício 01 — Primeira Tool e Decisão:**
   - Print do resultado das cinco (ou seis) mensagens.
   - A tabela preenchida.
   - As respostas às perguntas de reflexão.
6. **Exercício 02 — Workflow x Agent:**
   - Print dos três incidentes, mostrando as chamadas do workflow e do
     agente lado a lado.
   - A tabela preenchida, com as chamadas desperdiçadas contadas.
   - As respostas às perguntas de reflexão.
7. **Exercício 03 — Múltiplas Tools e Loop:**
   - Print das três investigações, com tools chamadas em ordem e número
     de iterações.
   - A tabela preenchida.
   - As respostas às perguntas de reflexão.
8. **Exercício 04 — AI Software Engineer Completo:**
   - Print das cinco missões, com o relatório final de cada uma.
   - A tabela preenchida.
   - Print do desafio de prompt injection (a Missão 3 rodada com o log
     envenenado), mostrando a tela de aprovação humana aparecendo
     normalmente.
   - As respostas às perguntas de reflexão.
9. **Exercício 05 — O AI Software Engineer na AWS (opcional):**
   - Print do `terraform apply` finalizado (outputs incluídos).
   - Print de uma investigação completa no navegador, incluindo uma tela
     de aprovação humana (aprovada ou rejeitada).
   - As respostas às perguntas de reflexão.
10. **Síntese final (obrigatória, ~1 parágrafo):** você passou o dia
    subindo uma escada — LLM simples, Tool Calling, Workflow
    determinístico, AI Agent, Agent Loop — e viu, com números reais no
    Exercício 02, por que "deixar o modelo decidir" nem sempre é a
    escolha certa. Na sua opinião, pensando no seu próprio trabalho (ou
    no trabalho que você pretende ter): que tipo de tarefa você
    automatizaria com um **workflow fixo**, e que tipo você confiaria a
    um **agente**? Dê um exemplo real de cada.

## ✅ Rubrica de avaliação

| Critério | Peso |
|---|---|
| Exercícios de contexto e conceitos (módulos 01-03) respondidos | 10% |
| Exercício 01 completo (código + print + tabela + reflexão) | 10% |
| Exercício 02 completo — a comparação Workflow x Agent | 15% |
| Exercício 03 completo (código + print + tabela + reflexão) | 15% |
| Exercício 04 completo — o AI Software Engineer, as 5 missões + desafio de prompt injection | 30% |
| Síntese final — qualidade da reflexão sobre workflow x agente aplicada ao seu contexto | 20% |

**Bônus:** o Exercício 05 (AI Software Engineer rodando na AWS, com
aprovação humana via web) vale até **+15%** na nota final da aula — é
significativamente mais trabalho que os desafios opcionais de outras
aulas, então o bônus é maior.

## 📮 Como entregar

Envie o PDF **e** o código (zip ou link de repositório) pelo canal que eu
indicar. Nomeie o PDF como:

```
IA-Aula05-SeuNome.pdf
```

---

**Fim da Aula 05.** Vocês construíram, em cinco aulas, o caminho completo
de um sistema de IA de verdade: entender o modelo (Aula 01), escrever
prompts confiáveis (Aula 02), chamar o modelo por código com formato
garantido (Aula 03), buscar contexto automaticamente entre documentos
(Aula 04), e hoje, subir a escada completa até um agente que decide
sozinho o próprio caminho de investigação — sobre o sistema real de
vocês, com os guardrails que separam "funciona numa demo" de "eu
confiaria nisso rodando sem mim olhando". Na Aula 06 (Projeto Final de
IA), vocês vão juntar tudo isso num hackathon; na disciplina de n8n, esse
mesmo raciocínio de agente vira um nó visual, orquestrado sem escrever o
loop na mão.
