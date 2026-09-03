# 2. Conceitos Fundamentais

Cinco técnicas, um método. Elas se combinam — o prompt estruturado que
você testou na Aula 01 já usava, sem você nomear, várias delas ao mesmo
tempo.

---

## 🧩 Anatomia de um prompt

Todo prompt eficaz, por mais simples que pareça, é composto por até
quatro partes. Nem todo prompt precisa das quatro, mas é essa a lista de
verificação mental que eu uso:

| Parte | Pergunta que ela responde | Exemplo |
|---|---|---|
| **Instrução** | O que eu quero que o modelo faça? | "Classifique a mensagem abaixo." |
| **Contexto** | Que informação de fundo o modelo precisa para fazer isso bem? | "Você está triando mensagens de um e-commerce." |
| **Dado de entrada** | Sobre o que, exatamente, ele deve trabalhar? | O texto da mensagem do cliente. |
| **Indicador de formato** | Como a resposta deve ser estruturada? | "Responda apenas no formato: Categoria / Prioridade / Sentimento." |

As cinco técnicas a seguir são, no fundo, formas diferentes de fortalecer
uma ou mais dessas quatro partes.

---

## 🎭 Role / Persona

> Atribuir um papel ao modelo muda o vocabulário, a profundidade e até os
> critérios que ele usa para responder.

Quando você diz `Você é um médico`, `Você é um advogado tributarista` ou
`Você é um professor explicando para uma criança de 8 anos`, você está
restringindo o espaço de respostas possíveis a algo consistente com esse
papel — o modelo tende a usar o vocabulário, o nível de detalhe e até os
cuidados (ex.: um médico menciona "procure atendimento presencial") que
esperaríamos daquele papel.

**Exemplo prático, no nosso cenário:** um prompt sem role tende a gerar
uma resposta genérica para o cliente. Com
`Você é um atendente sênior de e-commerce, treinado para responder com
empatia e objetividade`, a resposta tende a vir mais alinhada ao tom que a
empresa realmente quer usar com o cliente.

Role não é "fingir que o modelo é outra coisa" — é uma forma eficiente de
comprimir, em uma frase, um monte de restrições de tom e critério que
seriam difíceis de listar uma por uma.

**💻 Exemplo real (dev):** peça a mesma revisão de um trecho de código,
uma vez sem role, outra vez com
`Você é um revisor de código sênior, focado em segurança e performance,
revisando um Pull Request de um desenvolvedor júnior`. Sem role, a
resposta tende a ser um comentário genérico ("está funcional"). Com role,
o modelo tende a apontar especificamente falhas de segurança (ex.: SQL
injection, segredo hardcoded) e sugestões de performance que um revisor
sênior de verdade cobraria — é basicamente o que ferramentas como GitHub
Copilot Code Review e Amazon CodeGuru fazem: um "papel" de revisor
embutido no prompt que roda por trás da ferramenta.

---

## 🗺️ Contexto

> Contexto é toda informação de fundo que muda a resposta certa, mesmo
> sem mudar a pergunta.

A mesma pergunta pode ter respostas bem diferentes dependendo do contexto
em que ela é feita. `Escreva uma resposta para este cliente` é ambíguo:
resposta de quem, para qual tipo de empresa, com que política de
reembolso? Contexto é onde você coloca isso:

```
Você atende clientes de um e-commerce de eletrônicos. Nossa política
permite reembolso integral em até 7 dias após a entrega, sem necessidade
de devolver o produto se ele chegou com defeito.
```

Sem esse contexto, o modelo **inventa** uma política (e isso é, na
prática, uma forma de alucinação: o modelo preenche a lacuna com algo
plausível, mas que pode não ser verdade sobre a sua empresa).

**💻 Exemplo real (dev):** peça para o modelo `Escreva uma função que
valida CPF` sem contexto nenhum, e depois peça de novo informando
`Projeto em TypeScript, sem dependências externas, seguindo o padrão de
funções puras do restante do repositório, com testes em Jest`. Sem
contexto, o modelo escolhe a stack e o estilo por conta própria — pode
vir em Python, pode usar uma lib que seu projeto nem tem instalada, pode
nem gerar teste. Esse é o mesmo motivo pelo qual assistentes de código
como GitHub Copilot e Cursor ficam melhores quanto mais contexto de
projeto (arquivos abertos, `README`, convenções) eles conseguem enxergar
automaticamente — eles estão, por baixo dos panos, injetando contexto no
prompt antes de gerar a resposta.

---

## 🎯 Zero-shot x Few-shot

> Mostrar exemplos no próprio prompt costuma ser mais eficaz do que
> apenas descrever a regra.

- **Zero-shot**: você só descreve a tarefa, sem exemplo nenhum. Funciona
  bem para tarefas simples e comuns.
- **Few-shot**: você inclui, dentro do prompt, alguns exemplos de
  entrada→saída antes de pedir a resposta real. Isso "ancora" o modelo no
  formato e no critério que você quer, principalmente em casos ambíguos
  que uma descrição em palavras não cobre bem.

```
Exemplo 1
Mensagem: "Meu pedido não chegou e já faz 15 dias."
Categoria: Logística

Exemplo 2
Mensagem: "Vocês cobraram duas vezes no meu cartão."
Categoria: Financeiro

Agora classifique:
Mensagem: "O produto veio, mas não é bem o que eu esperava pela foto."
Categoria:
```

O terceiro caso é ambíguo (poderia parecer "Logística" ou até
"Elogio/Reclamação" genérica) — os dois exemplos anteriores ajudam o
modelo a calibrar o critério de classificação antes de decidir.

**Quantos exemplos usar?** Normalmente de 2 a 5 já trazem a maior parte do
ganho. Exemplos demais custam tokens (lembra da Aula 01?) sem necessariamente
melhorar mais a resposta.

**💻 Exemplo real (dev):** times que usam IA para triar issues do GitHub
automaticamente (bug x feature x dúvida, severidade P0-P3) quase sempre
usam few-shot: descrevem em palavras o que é um "P0" e o modelo erra
metade dos casos de borda; dão 4-5 issues reais já rotuladas como exemplo
e a consistência sobe muito, porque o modelo passa a "calibrar" pelo
padrão de rotulagem do próprio time, não por uma definição genérica de
dicionário.

---

## 🪜 Decomposição de problemas

> Pedir para o modelo "pensar antes de responder" melhora tarefas que
> exigem raciocínio em várias etapas.

Para tarefas simples, pedir a resposta direta funciona bem. Mas em
tarefas que envolvem várias etapas de raciocínio (matemática, lógica,
decisões com múltiplos critérios), pedir a resposta final **direto** pode
levar o modelo a "pular" etapas e errar. Pedir para ele **decompor o
problema** — mostrar o raciocínio passo a passo antes de concluir — tende
a produzir respostas mais corretas, porque cada etapa fica mais simples e
os erros ficam mais fáceis de você auditar.

```
Pense passo a passo antes de responder:
1. Primeiro, identifique do que se trata a mensagem.
2. Depois, avalie o tom e a urgência.
3. Só então decida a categoria e a prioridade finais.

Mensagem: "..."
```

**No nosso cenário:** decidir a prioridade de um ticket não é uma decisão
de um passo só — envolve avaliar o assunto, o tom, e se há um prazo
envolvido. Pedir para o modelo raciocinar sobre cada um desses pontos
antes de decidir a prioridade final tende a gerar uma decisão mais
consistente do que pedir só "dê a prioridade".

**💻 Exemplo real (dev):** cole um stack trace de erro e peça direto
`Conserte esse bug` — o modelo às vezes já "chuta" uma correção plausível,
mas errada, sem checar a causa raiz. Peça em vez disso:
`Antes de propor uma correção: 1) identifique em qual linha/função o erro
ocorre, 2) explique a causa raiz, 3) só então proponha a correção` — o
mesmo princípio por trás de ferramentas de análise de logs que você já
viu no curso de DevOps (ex.: investigar um alarme do CloudWatch): pular
direto para a "solução" sem diagnosticar a causa raiz é como se cria bug
em cima de bug.

---

## 📐 Structured Output

> Pedir um formato explícito de saída — e proibir qualquer coisa fora
> dele — é o que torna a resposta de um LLM consumível por um sistema.

Não basta pedir "responda em JSON" — modelos frequentemente acrescentam
texto explicativo antes/depois do JSON, ou embrulham a resposta em uma
cerca de código markdown (` ```json `). Para reduzir isso, o prompt
precisa ser explícito sobre:

- O **schema** exato esperado (quais campos, e os valores possíveis de
  cada um).
- Que **nada além** do formato pedido deve aparecer na resposta.

```
Responda APENAS com um JSON válido, sem nenhum texto antes ou depois,
seguindo exatamente este formato:

{
  "categoria": "Financeiro" | "Tecnico" | "Logistica" | "Elogio",
  "prioridade": "Baixa" | "Media" | "Alta" | "Urgente",
  "sentimento": "Positivo" | "Neutro" | "Negativo"
}
```

Isso é o que torna a saída do modelo algo que um programa (na Aula 03,
literalmente uma linha de código) consegue ler com `JSON.parse()` sem
quebrar.

**💻 Exemplo real (dev):** imagine um passo de CI/CD que usa um LLM para
analisar o log de um pipeline que falhou (você viu pipelines de verdade
na Aula 05 do curso de DevOps) e decidir se deve reexecutar
automaticamente. Se o prompt pedir só "analise o log", a resposta vem em
texto livre e nenhum script consegue agir sobre ela. Com um schema
explícito — `{"causa_provavel": string, "acao_recomendada": "retry" |
"notificar_time" | "bloquear_deploy", "confianca": number}` — a resposta
vira uma decisão que o próprio pipeline consegue interpretar e agir
automaticamente. É exatamente esse tipo de saída estruturada que
ferramentas de "AI on-call"/observabilidade (ex.: integrações de IA no
Datadog, PagerDuty) precisam para conseguir automatizar uma reação.

---

## 📝 Resumo visual

| Técnica | Em uma frase | Fortalece qual parte do prompt |
|---|---|---|
| Role/Persona | Define o "quem" que está respondendo | Instrução + tom |
| Contexto | Preenche o que o modelo não pode adivinhar sozinho | Contexto |
| Few-shot | Mostra exemplos em vez de só descrever a regra | Formato + critério |
| Decomposição | Pede raciocínio em etapas antes da resposta final | Instrução (tarefas complexas) |
| Structured Output | Define o formato exato e proíbe qualquer coisa fora dele | Indicador de formato |

---

## 🧪 Exercício

Responda por escrito, sem usar nenhum LLM para responder (a prática vem
no próximo módulo):

1. No cenário da mensagem de cliente, escreva **de próprio punho** uma
   frase de role/persona que você usaria para um atendente de suporte
   técnico de uma empresa de software (diferente do exemplo de e-commerce
   usado acima).
2. Dê um exemplo de informação de **contexto** que, se omitida, faria o
   modelo "inventar" uma resposta errada sobre a sua própria empresa ou
   área de trabalho.
3. Monte, no papel, dois exemplos few-shot (entrada → saída) para uma
   tarefa de classificação à sua escolha (pode ser fora do cenário do
   e-commerce).
4. Por que pedir para o modelo "pensar passo a passo" tende a ajudar mais
   em problemas de raciocínio complexo do que em perguntas simples de
   fato (ex.: "qual a capital da França?")?
5. Por que "responda em JSON" sozinho, sem mais nenhuma instrução, ainda
   pode dar errado?

**Próximo passo:** [03-demonstracao-guiada](../03-demonstracao-guiada/README.md)
