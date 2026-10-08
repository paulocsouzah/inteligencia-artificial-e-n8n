# 1. Contexto e problema real

Na Aula 03 você blindou a IA contra a falha **visível**: a API caiu, a
resposta veio cortada, o JSON não bateu. Nesses casos o workflow percebe que
algo deu errado e encaminha para um humano. Hoje a preocupação é outra, e
mais difícil de pegar: a IA responde **sem erro nenhum**, com um texto
educado, bem escrito, confiante, e **errado**.

Esse é o risco caro do atendimento. Um sistema que dá um erro de HTTP é
chato, mas o cliente percebe e reclama. Um sistema que diz "você tem direito
a reembolso integral em 24 horas" quando a política diz outra coisa cria um
compromisso que a loja vai ter que cumprir.

---

## 📋 O que a IA faz "de cabeça", e o que ela deveria buscar

Imagine um cliente que pergunta: *"Vocês aceitam troca depois de 15 dias?"*

| O que a IA faz sozinha | O que a loja precisa |
|---|---|
| Responde com uma regra geral de comércio, que parece razoável | Responde com a **política da loja**, que pode ser 7 dias, 30 dias ou "não aceita" |
| Inventa um prazo quando não sabe | Diz "não encontrei essa informação" e encaminha |
| Mistura duas políticas num texto só | Cita o trecho que usou, para quem atende conferir |

O modelo sabe muita coisa sobre o mundo. Ele **não sabe** a política da sua
loja, a não ser que você coloque essa política na conversa. Essa é a ideia
central de **RAG** (*retrieval-augmented generation*): buscar o trecho certo
da sua base e entregar esse trecho para a IA responder. Você já viu RAG na
Disciplina 1; hoje você monta essa mecânica dentro do workflow — e, de
propósito, a base não é mais um texto inventado num Code node. É uma tabela
de verdade, num banco de verdade, por trás de uma API: a **Loja FAEX**, o
ambiente que você vai usar hoje e nas próximas duas aulas.

## 🏢 Dois casos reais

**Dois casos publicados pelo próprio n8n mostram o mesmo padrão: a IA só entra
no processo quando os dados certos chegam até ela.**

**Oversee, investigando chamados de suporte.** A
[Oversee](https://n8n.io/case-studies/oversee/) (travel tech, 60+ países)
automatizou a montagem de contexto para o time de suporte: o workflow busca o
histórico do caso no banco de dados e monta um relatório estruturado. O ganho
de **50% no tempo de primeira resposta** não veio de uma IA que "sabe tudo",
e sim de uma IA que trabalha em cima dos dados da própria empresa.

**System AI, para o grupo imobiliário Srama.** No
[case publicado pelo n8n](https://n8n.io/case-studies/system-ai/), mensagens de
WhatsApp (muitas em áudio) eram transcritas e traduzidas por IA, e depois
**roteadas por intenção**: lead para o CRM, imóvel para a planilha. A IA não
decidia o destino sozinha; ela classificava, e o workflow decidia com base
nessa classificação.

> ℹ️ Como nas aulas anteriores, são números divulgados pelas próprias empresas.
> Use como ordem de grandeza. O padrão é o que importa: **a IA classifica e
> busca; o workflow decide.**

## 🧩 Por que uma etapa só não basta

Um prompt que pede "entenda a intenção, extraia o pedido, consulte a política
e responda" faz quatro trabalhos num passo só. Quando algo dá errado, você não
sabe qual dos quatro falhou. E quando você melhora um, pode piorar outro.

Dividir em etapas resolve dois problemas:

- **Cada etapa tem um contrato curto.** A etapa de intenção devolve uma palavra
  de um conjunto fechado. A de extração devolve campos com tipos. A de resposta
  devolve texto a partir de um trecho.
- **Você testa cada etapa separada.** Se a intenção saiu errada, você ajusta
  só ela.

## ⚠️ Três limites que você precisa ter em mente

1. **A base é tão boa quanto o que você coloca nela.** Se a política da loja
   está desatualizada, o RAG responde com segurança algo que já não vale.
2. **A busca pode trazer o trecho errado.** Por similaridade, um trecho sobre
   "reembolso" pode ser o mais próximo de uma pergunta sobre "estorno", mas
   também pode não ser o que responde a pergunta. Você precisa testar.
3. **A IA pode ignorar o contexto.** Mesmo com o trecho certo na conversa, o
   modelo pode completar com conhecimento geral. Por isso a instrução de
   "responda só com a base e diga quando não souber" faz parte do desenho.

## 🧭 Para onde isso vai

| Aula | O que você constrói |
|------|---------------------|
| 2 | Ligar a IA no workflow |
| 3 | Blindar a chamada: retry, timeout, validação, Error Workflow |
| **4 (esta)** | Extrair dados, buscar na base de conhecimento, responder em etapas |
| 5 | Um agente que escolhe as ferramentas sozinho |
| 6 | Hackathon |

## 🧪 Exercício

Antes do ambiente, responda por escrito:

1. Pense numa pergunta que um cliente faria à loja e que a IA responderia
   **de cabeça**, sem consultar nada. Qual é o risco de a resposta estar
   certa para outra loja e errada para a sua?
2. Dos três limites da seção anterior, qual você acha mais difícil de
   detectar em produção? Por quê?
3. Se o seu atendimento tivesse uma única pergunta que **nunca** pode ser
   respondida pela IA sem um humano, qual seria? Use isso para decidir o que
   a sua etapa de decisão precisa checar.

**Próximo passo:** [02-ambiente-n8n-na-aws](../02-ambiente-n8n-na-aws/README.md)
