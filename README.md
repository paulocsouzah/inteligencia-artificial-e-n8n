# 🤖 Inteligência Artificial + n8n

Bem-vindo(a) ao módulo de **Inteligência Artificial e Automação** da sua
**Pós-Graduação em Full Stack Developer**, aqui na **FAEX — Faculdade de
Extrema**. Este é o material completo que eu preparei para você, na
sequência natural do curso de
[DevOps com AWS — Infraestrutura e Automação](https://github.com/paulocsouzah/devops-com-aws-infraestrutura-e-automacao).

Eu dividi o módulo em **2 disciplinas de 6 aulas cada** (3 online + 3
presenciais por disciplina), e a abordagem vai ser predominantemente
prática — você vai passar mais tempo construindo do que ouvindo teoria:

- **Disciplina 1 — Inteligência Artificial:** eu vou te ensinar a
  **criar** capacidades inteligentes (LLMs, prompting, APIs, RAG, agentes).
- **Disciplina 2 — n8n:** eu vou te ensinar a **conectar** essas
  capacidades a processos, sistemas e automações reais.

> **Guarde essa ideia, porque ela é o fio condutor do módulo inteiro:**
> IA ensina a criar capacidades inteligentes; n8n ensina a conectar essas
> capacidades a processos, APIs, sistemas e automações.

---

## 🎯 O que você vai saber fazer ao final

- Compreender os principais conceitos de **IA generativa e LLMs**.
- Aplicar técnicas de **Prompt Engineering** em problemas reais.
- Integrar modelos de IA **por API**.
- Construir soluções utilizando **Structured Output, RAG e AI Agents**.
- Compreender **automação de processos** com n8n.
- Integrar **APIs, webhooks, bancos de dados, serviços externos e IA**.
- Projetar **workflows robustos**, com validação e tratamento de erros.
- Construir uma **solução final integrando IA + n8n**.

## 👤 Para quem é este material e o que você precisa

- Você é aluno(a) da Pós-Graduação em Full Stack Developer da FAEX — este
  material foi escrito pensando em você.
- Não precisa saber nada de IA, LLMs ou n8n antes de começar. Eu construo
  tudo do zero, aula a aula, do jeito que já fiz no curso de DevOps. O
  único pré-requisito é lógica de programação básica.
- Separe um notebook próprio, contas gratuitas nas plataformas de IA que
  eu indico em cada aula, e uma conta na
  [AWS Academy](https://www.awsacademy.com/) (explico onde ela entra na
  seção [AWS Academy neste módulo](#-aws-academy-neste-módulo) mais
  abaixo).

## 🧭 Como eu organizei cada aula

Mesma filosofia do curso de DevOps: você vai construir muito mais do que
ouvir teoria solta. Toda aula segue esta estrutura:

1. **Contexto e problema real** — antes de te apresentar qualquer
   ferramenta, eu conto um cenário real que ela resolve.
2. **Conceitos essenciais** — só o vocabulário que você precisa para
   seguir em frente, sem enrolação.
3. **Demonstração guiada** — eu construo na sua frente, passo a passo,
   para você ver acontecendo antes de tentar sozinho.
4. **Laboratório prático** — agora é sua vez de construir, com um roteiro
   que eu deixo pronto.
5. **Desafio** — você pega o que construiu e evolui sozinho, sem um
   passo a passo tão guiado.
6. **Fechamento** — eu amarro o que vimos e conecto com a próxima aula.

Sempre que der, organize-se em grupo. As duas disciplinas terminam em um
**hackathon** (projeto final).

### 📝 Como eu avalio

Ao final de cada aula (com exceção dos projetos finais), você me envia um
**relatório em PDF** com prints das evidências, os comandos/prompts que
você usou e as respostas às perguntas de reflexão — o mesmo padrão que
usei no curso de DevOps. Eu olho para:

- Sua participação e os exercícios práticos.
- A qualidade técnica das suas soluções e dos seus prompts.
- Sua capacidade de integrar ferramentas e APIs.
- Como você trata erros, segurança e uso responsável de IA.
- A arquitetura e organização da sua solução/workflow.
- No projeto final: sua apresentação e sua capacidade de explicar as
  decisões técnicas que você tomou e o impacto delas no negócio.

Os dois **projetos finais** (Aula 06 de cada disciplina) fogem desse
padrão: são hackathons que eu avalio ao vivo, sem relatório em PDF — os
detalhes ficam no próprio módulo, quando eu o construir.

---

## 🗂️ Estrutura do repositório

```
inteligencia-artificial-e-n8n/
├── Disciplina 1 - Inteligencia Artificial/
│   ├── Aula 01 - Fundamentos de IA e LLMs/
│   ├── Aula 02 - Prompt Engineering/
│   ├── Aula 03 - IA dentro de Aplicacoes/
│   ├── Aula 04 - RAG e Embeddings/
│   ├── Aula 05 - AI Agents/
│   └── Aula 06 - Projeto Final de IA/
└── Disciplina 2 - n8n/
    ├── Aula 01 - Fundamentos do n8n/
    ├── Aula 02 - Integracoes e APIs/
    ├── Aula 03 - Workflows Avancados/
    ├── Aula 04 - n8n com IA/
    ├── Aula 05 - AI Agents com n8n/
    └── Aula 06 - Projeto Final n8n/
```

Dentro de cada aula, os módulos são numerados sequencialmente
(`01-contexto...`, `02-conceitos...`, ..., `exercicio-final`), cada um com
seu próprio `README.md` — o mesmo padrão do curso de DevOps.

### 📑 Resumo para slides (uso interno meu)

Toda aula que eu crio ganha também um arquivo `00-resumo-para-slides.md`
na raiz da própria pasta da aula — um resumo condensado (conceitos,
definições, exemplos-chave e uma sugestão de estrutura de slides) que eu
uso para gerar a apresentação da aula em ferramentas como o **NotebookLM**.
O `README.md` de cada aula é o seu material completo, com exercícios,
tabelas de entrega e passo a passo; o resumo é só o meu rascunho de
preparação de aula.

Por isso, esses arquivos ficam **fora do controle de versão** (listados
no `.gitignore` como `**/00-resumo-para-slides.md`) — são material de
apoio de uso meu, não fazem parte do que chega até você por aqui.

Algumas aulas também podem ganhar um `00-exemplo-professor.md` — meu
aprofundamento pessoal de cada técnica (teoria por trás, armadilhas
comuns, perguntas frequentes) e exemplos extras além dos que estão no seu
material, para eu variar em aula ou responder pergunta com mais
profundidade. Mesmo esquema: local, fora do Git (`**/00-exemplo-professor.md`
no `.gitignore`).

## 📚 Grade do curso

### Disciplina 1 — Inteligência Artificial

| # | Data | Aula | Formato | Tema | Status |
|---|------|------|---------|------|--------|
| 1 | 31/08/2026 | [Fundamentos de IA e LLMs](<Disciplina 1 - Inteligencia Artificial/Aula 01 - Fundamentos de IA e LLMs/README.md>) | Online | IA tradicional x generativa, LLMs, tokens, context window, temperature, alucinações | ✅ Disponível |
| 2 | 03/09/2026 | [Prompt Engineering](<Disciplina 1 - Inteligencia Artificial/Aula 02 - Prompt Engineering/README.md>) | Online | Role, contexto, few-shot, decomposição, structured output | ✅ Disponível |
| 3 | 10/09/2026 | [IA dentro de aplicações](<Disciplina 1 - Inteligencia Artificial/Aula 03 - IA dentro de Aplicacoes/README.md>) | Presencial | APIs de LLM, SDKs, streaming, function calling, custos, segurança | ✅ Disponível |
| 4 | 14/09/2026 | RAG + Embeddings | Online | Embeddings, vector database, chunking, retrieval | 🔜 Planejada |
| 5 | 17/09/2026 | AI Agents | Presencial | Tools, memory, planejamento, guardrails | 🔜 Planejada |
| 6 | 21/09/2026 | Projeto Final de IA | Online | Hackathon: LLM + Prompt Engineering + API + RAG/Agent | 🔜 Planejada |

### Disciplina 2 — n8n

| # | Data | Aula | Formato | Tema | Status |
|---|------|------|---------|------|--------|
| 1 | 24/09/2026 | Fundamentos do n8n | Presencial | Workflow, trigger, node, JSON, expressions, webhooks | 🔜 Planejada |
| 2 | 28/09/2026 | Integrações e APIs | Online | REST, headers, autenticação, paginação | 🔜 Planejada |
| 3 | 01/10/2026 | Workflows avançados | Presencial | IF/Switch, loops, error handling, sub-workflows | 🔜 Planejada |
| 4 | 05/10/2026 | n8n + IA | Online | Classificação, extração e geração de conteúdo com LLM no workflow | 🔜 Planejada |
| 5 | 08/10/2026 | AI Agents + n8n | Presencial | AI Agent nativo do n8n, tools, memória, guardrails | 🔜 Planejada |
| 6 | 22/10/2026 | Projeto Final n8n | Presencial | Hackathon: automação real ponta a ponta | 🔜 Planejada |

**Como usar:** siga as disciplinas e aulas na ordem. Dentro de cada aula,
siga também as subpastas na ordem numérica — cada uma parte do que você
construiu na anterior.

---

## 🔗 Como as duas disciplinas se conectam

Eu planejei as duas disciplinas como partes de uma mesma jornada:

```
IA:  LLMs → Prompt Engineering → API → RAG → Agents
n8n: Automação → APIs → Workflows → IA + n8n → AI Agents
                                                    │
                                                    ▼
                              Projeto final: solução integrada IA + n8n
```

### 🎯 Projeto integrador — AI Customer Service

Este é o cenário que vai te acompanhar do início ao fim do módulo: um
cliente envia uma mensagem (WhatsApp/Formulário) → o **n8n** recebe e
orquestra o processo → um **AI Agent** interpreta a solicitação → o
sistema consulta **RAG, CRM ou APIs** → o workflow decide e responde
automaticamente ou encaminha para atendimento humano.

Cada aula das duas disciplinas vai te entregar uma peça desse cenário, até
você juntar tudo no projeto final.

---

## 🧰 Ferramentas que vamos usar

**IA**
- Interfaces web gratuitas de LLMs para comparação (ChatGPT, Claude.ai,
  Gemini) — aulas 1 e 2, sem precisar de API paga.
- APIs de LLM (OpenAI, Anthropic, Google) e/ou **Amazon Bedrock** a partir
  da Aula 3 — veja a nota sobre AWS Academy logo abaixo.
- Vector database (ex.: Chroma, pgvector ou um serviço gerenciado) — Aula 4.

**n8n**
- [n8n Cloud](https://n8n.io/) (trial gratuito) **ou** n8n self-hosted via
  Docker — inclusive numa EC2 que você mesmo provisiona com o que já
  aprendeu no curso de DevOps (Terraform + Docker). Vamos reaproveitar
  esse conhecimento como infraestrutura desta disciplina.

**Ferramentas gratuitas**
- GitHub, Visual Studio Code, Docker.

### ☁️ AWS Academy neste módulo

No curso de DevOps, a gente usou a AWS Academy o tempo todo, para toda a
infraestrutura. Aqui o uso vai ser **mais pontual**, porque boa parte do
trabalho com IA (comparar modelos, prompt engineering) não depende de
nuvem nenhuma:

- **Aulas 1 e 2 (IA):** você não vai precisar de AWS. Vamos usar
  interfaces web gratuitas dos próprios provedores de LLM.
- **Aula 3 em diante (IA):** aqui é onde a decisão de verdade acontece.
  Eu pretendo usar a AWS Academy Learner Lab, via **Amazon Bedrock**, para
  te dar acesso a múltiplos modelos fundacionais (Anthropic Claude,
  Amazon Titan, Meta Llama, Mistral) com uma única credencial — mas isso
  só funciona se o plano de AWS Academy da FAEX tiver o **Bedrock
  habilitado e com acesso aos modelos liberado**, algo que eu preciso
  confirmar antes da Aula 3 (em vários planos de Learner Lab, o acesso a
  modelos de terceiros como o Claude exige aceite de EULA vinculado à
  conta, e a conta restrita do Academy costuma bloquear isso). Se não
  der, meu plano B é usar diretamente as APIs gratuitas/de baixo custo da
  OpenAI, Anthropic ou Google.
- **Disciplina de n8n:** aqui o encaixe é mais natural e garantido — você
  vai hospedar o **n8n self-hosted via Docker numa EC2**, exatamente como
  fizemos com as aplicações no curso de DevOps (lá na Aula 03). Isso
  também conecta diretamente as duas disciplinas que você está cursando.

> Assim que eu confirmar a disponibilidade do Bedrock, atualizo a Aula 3
> de IA (e as instruções de infraestrutura da disciplina de n8n) com a
> decisão final.

---

## 👨‍🏫 Sobre

Módulo que eu ministro na **FAEX — Faculdade de Extrema**, no curso de
Pós-Graduação em Full Stack Developer, em continuidade ao curso de
[DevOps com AWS](https://github.com/paulocsouzah/devops-com-aws-infraestrutura-e-automacao).
