# 3. Memória, Planejamento, Guardrails — e os Riscos de um Agente

O Agent Loop do módulo anterior já **funciona**. Mas "funciona numa
demonstração" e "está pronto para investigar incidentes de verdade, sem
alguém olhando por cima do ombro o tempo todo" são coisas bem diferentes.
Este módulo fecha essa distância: como o agente lembra do que já
descobriu, como ele lida com uma investigação de muitas etapas, e — o
mais importante — como ele é impedido de causar um estrago maior que o
incidente que estava investigando.

---

## 🧠 Memória

> O que o agente "lembra" entre uma mensagem e outra da mesma
> investigação — e o que ele **não** lembra.

O array `messages` do loop já é, por si só, a memória de **uma**
investigação. Mas um engenheiro raramente resolve um incidente numa
mensagem só — ele volta, pergunta algo novo, pede pra aprofundar um
ponto. Sem passar o histórico de volta a cada nova pergunta, o agente
trataria a segunda pergunta como se fosse a primeira:

```js
async function investigar(pergunta, historico = []) {
  const messages = [
    { role: "system", content: "Você é um engenheiro investigando incidentes." },
    ...historico,                    // memória de curto prazo: tudo que já foi perguntado/descoberto
    { role: "user", content: pergunta }
  ];
  // ...loop igual ao módulo anterior...
  return { resposta, historico: messages.slice(1) }; // devolve pro chamador continuar depois
}
```

- **Curto prazo** (o que vamos usar hoje): o histórico da investigação
  atual — some quando a investigação termina.
- **Longo prazo** (fora do escopo de hoje, mas vale saber que existe):
  lembrar, semanas depois, que "esse mesmo erro já aconteceu em março, e
  a causa foi X" — isso normalmente vive num banco externo (um histórico
  de incidentes), consultado como **mais uma tool**, não como parte do
  prompt.

## 🗺️ Planejamento

> Para tarefas com várias etapas **dependentes**, vale a pena o agente
> esboçar um plano antes de agir — em vez de decidir só o próximo passo,
> às cegas.

Até aqui, o loop decide **um passo de cada vez**: raciocina, age, observa,
raciocina de novo. Isso funciona bem quando cada passo é razoavelmente
independente. Mas pensa numa investigação como "o pedido #4521 sumiu do
painel do cliente" — isso pode exigir: (1) achar o pedido no banco, (2)
se achar, checar se o status bate com os logs de processamento, (3) se
não achar, checar os logs de erro na hora da criação, (4) só então checar
o código do endpoint correspondente. São passos **condicionais entre si**
— o passo 2 só faz sentido dependendo do resultado do passo 1.

Duas formas de lidar com isso:

1. **Planejamento implícito** (o que o loop já faz sozinho): a cada
   iteração, o modelo "vê" o resultado anterior e decide o próximo passo
   — na prática, é exatamente o comportamento condicional do exemplo
   acima, sem você ter que fazer nada a mais. Para a maioria das
   investigações do dia a dia, **isso já basta**.
2. **Planejamento explícito**: para tarefas muito maiores (dezenas de
   passos possíveis, investigações que abrangem múltiplos sistemas), você
   pede ao modelo, antes de agir, um plano estruturado —
   `"Liste, em ordem, os passos que você pretende seguir para investigar isso, antes de executar o primeiro"`
   — e só então libera o loop. Isso ajuda a auditar a intenção do agente
   **antes** de qualquer ferramenta ser chamada — mas cada passo do plano
   ainda pode mudar durante a execução, conforme o que for descoberto.

No projeto de hoje (módulo 08), o planejamento fica implícito — o loop já
dá conta das investigações propostas. Fica registrado que existe o
próximo degrau, para quando você precisar dele.

## 🚧 Guardrails

> As quatro travas que separam "um agente que funciona numa demo" de "um
> agente que você deixaria rodar sozinho".

### 1. Limite de iterações

Já visto no módulo anterior — o `for (let i = 0; i < 6; i++)`. Sem ele,
um agente "confuso" (chamando a mesma tool repetidamente, sem nunca ter
informação suficiente) roda para sempre, gastando tokens sem parar.

### 2. Ferramentas permitidas — e validadas **em código**, não só na `description`

O array `tools` já é um guardrail de escopo: o agente só pode chamar o
que está declarado ali. Mas isso não basta sozinho — a ferramenta
`consultar_banco`, por exemplo, precisa **recusar em código** qualquer
coisa que não seja leitura, mesmo que a `description` diga "somente
leitura":

```js
async function consultarBanco(query) {
  const normalizada = query.trim().toUpperCase();
  if (!normalizada.startsWith("SELECT")) {
    return { erro: "Operação não permitida. Esta ferramenta só executa consultas SELECT." };
  }
  return executarSelect(query); // só chega aqui se realmente for um SELECT
}
```

Confiar que "o modelo vai se comportar porque eu pedi educadamente na
`description`" é o mesmo erro que vocês já rejeitaram desde a Aula 01 —
a diferença é que aqui o preço de confiar demais pode ser um `DELETE`
em produção, não só uma resposta feia.

### 3. Escalonamento / Human-in-the-loop

> Nenhuma ação que **muda** algo de verdade deveria acontecer sem
> confirmação humana explícita.

Todas as ferramentas de investigação (logs, código, banco, documentação)
são **somente leitura** — investigar não muda nada, então pode rodar sem
supervisão. Mas o momento em que o agente propõe uma **ação** (aplicar um
patch, reiniciar um serviço, abrir um ticket) é diferente: aí ele precisa
parar e esperar aprovação.

```js
async function sugerirCorrecao(acaoProposta) {
  console.log(`\n🤖 O agente quer executar: "${acaoProposta}"`);
  const aprovado = await perguntarAoHumano("Aprovar esta ação? (s/n) "); // pausa de verdade, espera humano
  if (!aprovado) return { status: "rejeitado_pelo_humano" };
  // só executa (ou, no nosso caso, só REGISTRA que executaria) depois do "sim"
  return { status: "aprovado_e_registrado" };
}
```

Repare: essa tool **nunca** executa nada sozinha, mesmo que o modelo
"decida" chamá-la — a implementação da tool é que decide não agir sem
confirmação. O guardrail vive no código da ferramenta, não na vontade do
modelo.

### 4. Observabilidade e limites de execução

> Você não confia num sistema que não consegue explicar o que fez —
> guardrail é sobre **impedir**; observabilidade é sobre **enxergar**.

Em produção, cada chamada de ferramenta deveria ser registrada — não só
o resultado, mas **qual** tool, **com quais argumentos**, **quanto
tempo** levou, e **quantos tokens** aquela rodada consumiu:

```js
async function executarToolComLog(nome, args) {
  const inicio = Date.now();
  const resultado = await executarTool(nome, args);
  console.log(`[trace] tool=${nome} args=${JSON.stringify(args)} duracao=${Date.now() - inicio}ms`);
  return resultado;
}
```

Sem isso, quando o agente errar (e vai errar), você não tem como saber
**onde** o raciocínio desandou — só que a resposta final ficou estranha.
Isso é o equivalente, para um agente, ao log estruturado que qualquer
serviço em produção já deveria ter.

---

## ⚠️ Riscos de agentes — o que pode dar errado, de verdade

Um agente que decide sozinho é poderoso — e é a primeira vez, no módulo,
que o **modelo** controla quantas chamadas de API acontecem e (com a tool
certa) o que é lido ou alterado no seu sistema. Seis riscos concretos, e
como cada guardrail acima os neutraliza:

| Risco | O que pode acontecer | Mitigado por |
|---|---|---|
| **Loop infinito** | Um raciocínio ruim chama a mesma tool sem parar, gastando tokens sem fim | Limite de iterações |
| **Custo** | Uma investigação "simples" vira uma conta gigante, sem ninguém perceber até a fatura chegar | Limite de iterações + observabilidade (custo por investigação) |
| **Ferramenta perigosa** | Dar ao agente uma tool `excluir_pedido` ou `executar_sql` sem restrição — um raciocínio errado (ou um ataque) a usa | Nunca declarar tools destrutivas; validar em código, não confiar na `description` |
| **Permissões amplas demais** | Um agente com acesso de escrita "porque era mais fácil" acaba usando esse acesso num caso em que não devia | Tools somente leitura por padrão; escrita sempre atrás de aprovação humana |
| **Prompt injection** | Um **dado que o agente lê** (um log, um comentário de código, um campo de banco) contém uma instrução escondida, tentando manipular o próximo passo do agente | Guardrail de escopo (a tool perigosa nem existe) + nunca tratar conteúdo de dados como instrução de sistema |
| **Alteração indevida no sistema** | O agente "corrige" algo sozinho, e a correção piora a situação | Toda ação de escrita é só uma **sugestão**, nunca uma execução automática |

O módulo [04-demonstracao-guiada](../04-demonstracao-guiada/README.md)
mostra o risco de **prompt injection** acontecendo de verdade — um log
fictício contém uma instrução escondida tentando fazer o agente chamar
uma ferramenta destrutiva. Vocês vão ver, ao vivo, por que ela falha.

---

## 📝 Resumo visual

| Conceito | Em uma frase |
|---|---|
| Memória (curto prazo) | O histórico da investigação atual, no array `messages` |
| Planejamento | Implícito (o loop decide passo a passo) ou explícito (plano antes de agir) — implícito basta na maioria dos casos |
| Guardrail: iterações | Trava contra loop caro/infinito |
| Guardrail: tools validadas em código | Nunca confiar só na `description` — valide o que a tool realmente faz |
| Guardrail: human-in-the-loop | Toda ação de escrita para e espera aprovação humana explícita |
| Guardrail: observabilidade | Log de cada tool call — nome, argumentos, duração, custo |
| Prompt injection | Dado lido pelo agente tentando se passar por instrução — neutralizado pelo escopo de tools, não pela "boa vontade" do modelo |

---

## 🧪 Exercício

Responda por escrito, sem escrever código (a prática vem no próximo
módulo):

1. Reescreva a tool `consultar_banco` do módulo acima supondo que ela
   **não** validasse o prefixo `SELECT` em código, confiando só numa
   `description` bem escrita ("use apenas para leitura"). Descreva um
   cenário de mensagem/instrução que conseguiria contornar isso.
2. Por que a tool `sugerir_correcao` **nunca** deveria, sozinha, aplicar
   a correção de verdade — mesmo que o modelo "tenha certeza" e o
   guardrail de iterações não tenha sido violado?
3. Pensa num log de aplicação que **você** já viu na vida real, contendo
   texto livre digitado por um usuário (nome, endereço, campo de busca).
   Como esse campo poderia, teoricamente, ser usado para um ataque de
   prompt injection contra um agente que lê logs?
4. A tabela de riscos lista "custo" como risco separado de "loop
   infinito" — mas o limite de iterações já não resolveria os dois
   igualmente? Em que situação um agente **sem** loop infinito ainda
   assim custaria caro demais?
5. Se você tivesse que escolher **uma única** das quatro tools de
   investigação (logs, código, banco, documentação) para dar a um
   agente **sem nenhum outro guardrail**, qual você escolheria como a
   mais segura, e qual como a mais arriscada? Justifique.

**Próximo passo:** [04-demonstracao-guiada](../04-demonstracao-guiada/README.md)
