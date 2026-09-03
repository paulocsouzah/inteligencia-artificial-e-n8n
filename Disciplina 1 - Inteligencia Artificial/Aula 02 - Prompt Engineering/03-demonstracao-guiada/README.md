# 3. Demonstração Guiada

Agora eu mostro, ao vivo, cada uma das cinco técnicas em ação. Você pode
reproduzir comigo em qualquer interface de chat gratuita (ChatGPT,
Claude.ai ou Gemini). Anote o que observar — você vai comparar com o que
encontrar sozinho, nos exercícios a seguir.

---

## 🎭 Demo 1 — Role muda a resposta

Eu peço a mesma pergunta duas vezes, em conversas novas:

**Sem role:**
```
Meu código está dando erro "undefined is not a function". O que eu faço?
```

**Com role:**
```
Você é um desenvolvedor sênior fazendo revisão de código para um estagiário
no primeiro mês de estágio. Explique de forma didática, com analogias
simples: meu código está dando erro "undefined is not a function". O que
eu faço?
```

Compare: tom, nível de detalhe, se a segunda resposta explica conceitos
que a primeira assumiu que eu já sabia.

> 💬 **Pensa comigo:** se você fosse construir um assistente de suporte
> técnico para **desenvolvedores experientes** (não estagiários), que role
> você escreveria? E para um cliente **não técnico**?

---

## 🎯 Demo 2 — Few-shot ancorando um caso ambíguo

Eu peço para classificar uma mensagem **ambígua de propósito**, primeiro
sem exemplo, depois com exemplos:

**Zero-shot:**
```
Classifique a mensagem abaixo em: Financeiro, Tecnico, Logistica ou Elogio.

Mensagem: "O produto chegou, mas o aplicativo de vocês não reconhece o
número de série para ativar a garantia."
```

**Few-shot:**
```
Exemplo 1
Mensagem: "Meu pedido não chegou e já faz 15 dias."
Categoria: Logistica

Exemplo 2
Mensagem: "O app trava toda vez que eu tento fazer login."
Categoria: Tecnico

Agora classifique:
Mensagem: "O produto chegou, mas o aplicativo de vocês não reconhece o
número de série para ativar a garantia."
Categoria:
```

Essa mensagem tem um pouco de Logística (produto chegou) e um pouco de
Técnico (problema no app) — é proposital. Compare se a versão zero-shot e
a versão few-shot chegam à mesma categoria, e qual delas você acha mais
justificável.

> 💬 **Pensa comigo:** os exemplos que eu dei mudaram o critério de
> decisão do modelo, ou só o formato da resposta?

**💻 Variante dev:** o mesmo exercício, mas triando uma **issue de
GitHub** em vez de uma mensagem de cliente. Zero-shot: `Classifique esta
issue em: bug, feature, duvida ou documentacao. Issue: "O botão de salvar
não aparece no Firefox, mas funciona no Chrome — é assim que deveria
ser?"`. Few-shot: dê 2 exemplos de issues já rotuladas pelo seu próprio
critério antes de pedir a classificação. Repare como o few-shot resolve
exatamente o mesmo tipo de ambiguidade (é bug de compatibilidade? é uma
dúvida de comportamento esperado?) que times de open source enfrentam
todos os dias ao triar issues reais.

---

## 🪜 Demo 3 — Decomposição em um problema de várias etapas

Eu peço a mesma decisão de prioridade, direto e depois decompondo:

**Resposta direta:**
```
Qual a prioridade desta mensagem: Baixa, Media, Alta ou Urgente?

Mensagem: "Comprei um remédio de uso contínuo há 5 dias e ele nunca
chegou. Estou sem o remédio desde ontem."
```

**Com decomposição:**
```
Pense passo a passo antes de responder:
1. Do que se trata a mensagem?
2. Há algum risco (à saúde, financeiro, de prazo) envolvido?
3. Esse risco é imediato ou pode esperar?
4. Com base nisso, qual a prioridade: Baixa, Media, Alta ou Urgente?

Mensagem: "Comprei um remédio de uso contínuo há 5 dias e ele nunca
chegou. Estou sem o remédio desde ontem."
```

Compare se a versão decomposta chega numa prioridade mais alta/justificada
— e se o raciocínio exposto realmente identifica o risco (a pessoa está
sem um remédio de uso contínuo).

> 💬 **Pensa comigo:** por que expor o raciocínio passo a passo facilita
> para você **auditar** se o modelo decidiu bem, mesmo que a resposta
> final seja parecida?

**💻 Variante dev:** cole um stack trace real (pode ser um erro que você
já enfrentou) e peça `Conserte este erro` direto, depois peça de novo com
`Antes de propor a correção: 1) identifique a linha/função onde o erro se
origina, 2) explique a causa raiz, 3) liste possíveis efeitos colaterais
da correção, 4) só então proponha o código corrigido`. Compare se a
versão decomposta identifica a causa raiz corretamente ou se a versão
direta "chuta" uma correção que só trata o sintoma.

---

## 📐 Demo 4 — Structured Output: o que dá errado sem instrução explícita

Eu peço a mesma classificação em JSON, primeiro de forma ingênua, depois
com instrução explícita:

**Prompt ingênuo:**
```
Classifique esta mensagem em JSON, com categoria, prioridade e sentimento.

Mensagem: "Comprei um notebook e ele chegou com a tela trincada. Quero
reembolso urgente."
```

**Prompt com schema explícito:**
```
Responda APENAS com um JSON válido, sem nenhum texto antes ou depois, sem
cercas de código markdown, seguindo exatamente este formato:

{
  "categoria": "Financeiro" | "Tecnico" | "Logistica" | "Elogio",
  "prioridade": "Baixa" | "Media" | "Alta" | "Urgente",
  "sentimento": "Positivo" | "Neutro" | "Negativo"
}

Mensagem: "Comprei um notebook e ele chegou com a tela trincada. Quero
reembolso urgente."
```

No primeiro caso, é comum a resposta vir com uma frase de abertura
("Claro, aqui está a classificação:") e/ou embrulhada em ` ```json `. No
segundo caso, a resposta tende a vir **só** o JSON. Tente colar a
resposta de cada um em um validador de JSON (ou simplesmente tentar
copiar só o miolo `{ ... }`) e veja qual das duas exige edição manual
antes de ser válida.

> 💬 **Pensa comigo:** se um código short precisasse rodar
> `JSON.parse()` direto na resposta do modelo, qual dos dois prompts
> você usaria em produção? O que quebraria com o outro?

**💻 Variante dev:** peça, de forma ingênua, para o modelo extrair de uma
função os parâmetros e o tipo de retorno em JSON — depois peça de novo
com schema explícito (`{"nome": string, "parametros": [{"nome": string,
"tipo": string}], "retorno": string}` + "responda só com JSON"). Esse é
literalmente o tipo de saída que uma ferramenta de geração automática de
documentação de API (ex.: gerar um trecho de OpenAPI/Swagger a partir do
código) precisa conseguir parsear sem falhar.

---

## 📝 O que anotar

Durante a demonstração, anote (você vai usar isso nos próximos
exercícios):

- Se a resposta com role realmente mudou tom/profundidade, ou só
  ficou "parecida, mas com outra palavra de abertura".
- Se o few-shot mudou a categoria escolhida no caso ambíguo, ou só
  confirmou o que o zero-shot já tinha dito.
- Se a decomposição te fez confiar mais na prioridade decidida.
- Se o prompt ingênuo de JSON realmente veio "sujo" (texto extra/cerca de
  código) no seu teste.

**Próximo passo:** [04-exercicio-01-role-e-contexto](../04-exercicio-01-role-e-contexto/README.md)
