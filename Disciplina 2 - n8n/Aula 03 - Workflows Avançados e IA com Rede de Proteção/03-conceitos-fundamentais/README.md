# 3. Conceitos fundamentais

Oito ideias hoje, divididas em dois grupos: as quatro primeiras são
**controle de fluxo** (como desenhar um workflow com mais de um caminho
possível); as quatro últimas são **blindagem** (o que fazer quando algo
dá errado). Elas se encaixam: você vai usar `Switch` para decidir **para
onde** vai um item, e retry/timeout para decidir **o que fazer** quando
esse caminho falha.

---

## 1. Switch: quando o `If` vira gambiarra

Um `If` tem exatamente dois caminhos: verdadeiro e falso. Funciona bem
até você precisar de um terceiro. Aí a maioria das pessoas encadeia um
`If` dentro do `else` de outro `If`, dentro do `else` de outro... Isso
**funciona**, mas fica ilegível rápido, e cada novo caminho significa
mexer num `If` que já existe.

O **Switch** resolve isso: um node só, várias saídas nomeadas. Você
define regras (`categoria == 'logistica'` → saída 0, `categoria ==
'financeiro'` → saída 1...) e uma saída **padrão**, de "nenhuma regra
bateu" — que você nunca deve deixar vazia, porque é exatamente aí que um
item entra e desaparece sem ninguém perceber.

```
          ┌── logistica  ──▶ ...
          ├── financeiro ──▶ ...
 Switch ──┼── elogio     ──▶ ...
          ├── duvida     ──▶ ...
          └── (default)  ──▶ Escalar para humano (nunca deixe sem destino)
```

**Regra de bolso:** dois caminhos, `If`. Três ou mais, `Switch`.

## 2. Merge: juntando o que veio de fontes diferentes

`Merge` pega **duas (ou mais) entradas** e produz uma saída. O modo que
você escolhe muda tudo:

| Modo | O que faz | Quando usar |
|---|---|---|
| **Append** | Empilha os itens das duas entradas, um atrás do outro | Juntar duas listas sem combinar campos |
| **Combine** (by Matching Fields) | Casa o item da entrada 1 com o da entrada 2 que tem o mesmo valor num campo (ex.: `id`) | Juntar dados do cliente (de uma API) com o histórico dele (de outra) |
| **Combine** (by Position) | Junta o item 1 da entrada 1 com o item 1 da entrada 2, e assim por diante | Duas listas que você sabe que já vêm na mesma ordem |
| **Choose Branch** | Descarta uma das entradas e segue só com a outra | "Se a entrada 1 tiver dado, uso ela; senão, uso a 2" (um fallback) |

**A armadilha mais comum:** usar Combine by Position quando as listas têm
tamanhos diferentes ou vêm em ordens diferentes. O resultado não dá erro
— ele só junta a coisa errada com a coisa errada, calado.

## 3. Loop Over Items (Split in Batches): processar sem travar

Até agora, um node roda uma vez por item, todos "ao mesmo tempo" (na
prática, em sequência, mas sem você controlar o ritmo). Isso é ótimo até
você ter **500 itens** chamando uma API com rate limit de 60 por minuto.

O `Loop Over Items` divide a lista em **lotes** (batches) e processa um
lote de cada vez, com um laço que você mesmo fecha (uma conexão **de
volta** para o início do loop):

```
                ┌────────────────────────────────┐
                ▼                                 │
 [ Lista ] ──▶ [ Loop Over Items ] ──▶ [ Processa o lote ] ──┘
                      │
                      └──▶ (quando não sobra item) ──▶ Continua o workflow
```

Isso resolve dois problemas de uma vez: **memória** (você nunca carrega
os 500 itens processados ao mesmo tempo) e **rate limit** (você pode
inserir uma pausa, um `Wait`, entre lotes).

## 4. Filter: tirar itens do meio da lista

`Filter` é mais simples que os outros três: você dá uma condição, e só os
itens que passam seguem adiante. Diferente do `If`, ele não tem dois
caminhos — ele só **reduz** a lista. Útil para, por exemplo, processar só
os e-mails não lidos de um lote que o Gmail trouxe inteiro.

## 5. Erro de node: Retry, Timeout e Continue On Fail

Todo node do n8n tem, na aba **Settings**, três configurações que hoje
são o centro da aula:

| Configuração | O que faz | Quando usar |
|---|---|---|
| **Retry On Fail** | Tenta de novo (N vezes, com um intervalo) antes de considerar erro | Erros **passageiros**: `5xx`, timeout de rede, `429` |
| **Timeout** (dentro de Options, em alguns nodes) | Desiste depois de X segundos, em vez de esperar para sempre | Qualquer chamada de API externa, principalmente LLM |
| **Continue On Fail** (ou "On Error: Continue") | Em vez de parar o workflow, segue adiante com um item de erro no lugar | Quando um item ruim **não** deve travar os outros 499 |

**A pergunta que decide o Retry:** o erro é **passageiro** (a mesma
chamada, de novo, tem chance real de funcionar) ou é **permanente** (vai
falhar de novo do mesmo jeito)? Retry em cima de um `401` (chave errada)
só atrasa o erro — a chave continua errada na segunda tentativa. Retry em
cima de um `429` ou `503` faz sentido — o problema pode já ter passado.

| Código | Vale a pena retry? |
|---|---|
| `429` Too Many Requests | ✅ Sim — espere o `Retry-After`, se vier |
| `500`/`502`/`503` | ✅ Sim — geralmente passageiro |
| `401`/`403` | ❌ Não — a causa não muda tentando de novo |
| `400` (corpo mal formado) | ❌ Não — o problema é o que **você** mandou |

## 6. Error Trigger e Error Workflow: a rede que pega o que escapou

Até aqui, toda blindagem foi **por node**. Mas e se o erro acontecer em
algo que você não previu? O n8n tem uma segunda camada, no nível do
**workflow inteiro**:

- Um workflow separado, começando com um node **Error Trigger**, roda
  **sempre que qualquer execução de outro workflow falhar** (se esse
  outro workflow estiver configurado para usá-lo).
- Você liga essa associação nas **Settings** do workflow principal, no
  campo **Error Workflow** — escolhendo o workflow que criou com o Error
  Trigger.
- O Error Trigger recebe dados sobre o que quebrou: qual workflow, qual
  execução, qual node, qual a mensagem de erro.

> ⚠️ **Duas condições que ninguém lê na primeira vez, e todo mundo
> esquece:** (1) o workflow com o Error Trigger precisa estar
> **publicado** — do mesmo jeito que um Webhook, "existir" não é
> suficiente, ele precisa estar ativo para o n8n o chamar; e (2) o Error
> Workflow só dispara para falhas de uma execução **de produção**
> (webhook, Schedule Trigger, Gmail Trigger...) — **não** para quando
> você clica em *Execute workflow* no editor. Faz sentido: é justamente a
> falha que ninguém está olhando, em produção, que essa rede existe para
> pegar.

```
 Workflow principal                    Workflow de erro
 ┌──────────────────┐   falhou    ┌────────────────────────┐
 │ ... node X quebra │ ──────────▶│ Error Trigger           │
 └──────────────────┘             │  → avisa alguém         │
                                   │  → registra num log     │
                                   └────────────────────────┘
```

**Por que separado, e não "mais um If no workflow principal"?** Porque um
Error Trigger pega **qualquer** falha, inclusive as que você não previu —
um bug seu, uma mudança na API de terceiro, um node que você nem tocou
hoje. Ele é a sua rede de segurança para o **desconhecido**, não só para
os casos que você já mapeou.

## 7. Sub-workflows: reutilizar um pedaço inteiro

Um **Sub-workflow** é um workflow chamado de dentro de outro, com o node
**Execute Workflow** — ele manda itens para outro workflow (que começa
com um node **Execute Workflow Trigger**) e recebe o resultado de volta,
como se fosse só mais um node.

```
 Workflow A                              Workflow B (sub-workflow)
 ┌───────────────────┐                   ┌──────────────────────────┐
 │ ... → Execute      │ ──── itens ────▶ │ Execute Workflow Trigger  │
 │     Workflow       │ ◀─── resultado ──│  → faz o trabalho         │
 │ → ...               │                 └──────────────────────────┘
 └───────────────────┘
```

**Por que isso importa para IA, especificamente:** se "chamar a LLM,
validar a saída, tentar de novo se falhar" é uma lógica que você usa em
**três** workflows diferentes (o do e-mail, o do WhatsApp, o do
formulário), copiar e colar esse bloco três vezes significa que, quando
você melhorar a blindagem, precisa lembrar de atualizar em três lugares.
Um sub-workflow existe **uma vez**, e os três chamam ele.

> ⚠️ **O sub-workflow precisa estar publicado, senão o principal nem
> publica.** Testando esta aula, tentei publicar o workflow que chama o
> sub-workflow de IA antes de publicar o sub-workflow em si — o n8n
> recusou, com uma mensagem direta: *"references workflow ... which is
> not published. Please publish all referenced sub-workflows first."*
> Publique sempre de dentro para fora: o sub-workflow primeiro, depois
> quem o chama.

## 8. Validar a saída da IA antes de confiar nela

Isto não é um node novo — é uma prática, que você já viu o início dela no
desafio da Aula 02 (a trava de palavras suspeitas). Hoje ela fica
sistemática: depois de receber o JSON da LLM, **antes** de usar qualquer
campo dele, confira:

- **Os campos obrigatórios existem?** (`categoria`, `sentimento`...)
- **Os valores estão dentro do esperado?** (`sentimento` só pode ser
  `positivo`/`neutro`/`negativo` — se vier `"meio triste"`, algo está
  errado)
- **Os tipos batem?** (`confianca` deveria ser número; se vier string,
  trate como suspeito)

Se qualquer checagem falhar, o item **não segue para a ação automática**
— ele vai para o mesmo lugar que um erro de API vai: o caminho de
"precisa de humano". Um node **Code** faz isso em poucas linhas; você vai
escrever o seu no Exercício 03.

---

## 🗺️ Juntando tudo

O "esqueleto de blindagem" que você vai montar hoje, em volta de **uma
chamada de IA**:

```
         ┌─────────────────────────────────────────────┐
         │  Sub-workflow: "Analisar com IA"             │
         │                                                │
  item ─▶│  Chamar LLM (Retry On Fail + Timeout)         │
         │        │                                       │
         │        ▼                                       │
         │  Validar saída (Code: campos, tipos, valores)  │
         │        │                                       │
         │   ┌────┴────┐                                  │
         │  válida   inválida/erro                         │
         │   │           │                                 │
         │   ▼           ▼                                 │
         │ segue    marca "precisa_humano"                 │
         └─────────────────────────────────────────────┘
                          │
                          ▼
         Error Workflow pega qualquer coisa que escapou
         de tudo isso (o imprevisto)
```

## 🧪 Exercício

Antes da demonstração, responda por escrito:

1. Você tem um `If` checando `categoria == 'vip'`. Um colega quer
   acrescentar mais dois tipos de cliente. Você muda para `Switch` ou
   encadeia mais um `If`? Justifique com o que você aprendeu na ideia 1.
2. Um node que chama uma API externa recebe `503 Service Unavailable`.
   Você configuraria Retry? E se fosse `400 Bad Request`? Explique a
   diferença usando a tabela da ideia 5.
3. Por que o Error Workflow fica **separado** do workflow principal, em
   vez de ser só mais um ramo dentro dele?
4. Pensa num motivo, além de "evitar copiar e colar", para transformar a
   chamada de IA num sub-workflow. (Dica: pense em quem vai dar
   manutenção nisso daqui a 6 meses.)

**Próximo passo:** [04-demonstracao-guiada](../04-demonstracao-guiada/README.md)
