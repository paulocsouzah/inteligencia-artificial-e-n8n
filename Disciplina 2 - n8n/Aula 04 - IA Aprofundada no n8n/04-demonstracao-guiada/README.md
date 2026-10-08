# 4. Demonstração guiada

Hoje eu construo em **cinco atos**, e um deles é um erro que eu mesmo
cometi montando esta aula — guardado de propósito, porque é um erro bom
de errar uma vez e nunca mais esquecer.

---

## 🎬 Ato 1 — Comprando e reclamando, pela tela

Abro `http://<ip>:8080`. Compro um produto (o Tênis Runner Pro). A loja
devolve um protocolo: `PED-20261008-1`. Registro uma reclamação citando
esse pedido: *"Meu tênis chegou com o solado descolando, pedido
PED-20261008-1, quero troca urgente."*

**O que observar:** a reclamação nasce com `status: "nova"`. É esse status
que o n8n vai procurar.

## 🎬 Ato 2 — Buscando a reclamação real no n8n

**Manual Trigger** → **HTTP Request**: `GET
http://<ip>:8080/api/reclamacoes?status=nova`. Executo.

**O que observar:** a saída é uma **lista** de itens — uma reclamação por
item do n8n. É a mesma mecânica do `/api/produtos` da Aula 02, só que
agora é o seu próprio sistema respondendo.

## 🎬 Ato 3 — Extração e classificação, numa reclamação só

Para aprender a mecânica, eu escolho **uma** reclamação só — a primeira da
lista (`$input.all()[0].json`) —, extraio os dados com schema fechado, e
classifico a intenção — exatamente como nos Exercícios 01 e 02, só que a
mensagem agora vem da API, não de um Set node.

> 💡 **Por que "a primeira", e não um `id` fixo?** Eu testei com um `id`
> escolhido à mão (`find(r => r.id === 2)`) e tropecei num problema real: o
> banco da loja é compartilhado entre todo mundo que está testando. Se
> aquela reclamação específica já tiver sido processada por você ou por
> outra pessoa, o `find` não acha nada, e a chamada para a LLM quebra com
> `"content": null`. Pegar sempre a **primeira** da lista resolve isso —
> funciona não importa quais `id`s existem no banco agora.

**O que observar:** `numero_pedido: "PED-20261008-1"`, `motivo: "troca"`,
`intencao: "suporte"`. O texto veio do banco; o resto é igual ao que você
já sabe fazer.

## 🎬 Ato 4 — O erro que eu cometi: só processou 1 de 5

Agora eu tiro o "escolher uma reclamação" e deixo o workflow processar
**todas** as reclamações novas — cinco, no meu teste. Rodo a cadeia
inteira: intenção → extração → buscar políticas → responder → decidir →
`PATCH`.

**Executo. A execução termina como sucesso.** Confiro o banco pela API:

```bash
curl http://<ip>:8080/api/reclamacoes
```

**Só uma reclamação foi atualizada.** As outras quatro continuam
`"nova"`, como se o workflow nem tivesse rodado para elas. **Nenhum erro.
Nenhum aviso.** A execução no n8n mostra "success" do início ao fim.

Eu abro os Code nodes da cadeia, um por um, e olho as **Settings** de cada
um. Todos estão no modo padrão: **Run Once for All Items**. Como cada um
devolve `return { json: {...} }` — um objeto, não uma lista — o n8n
entendeu "quero só um item" logo no primeiro Code node, e os outros quatro
desapareceram ali, silenciosamente.

**A correção:** em cada Code node da cadeia, abro **Settings** → **Mode**
→ **Run Once for Each Item**. Rodo de novo.

```bash
curl http://<ip>:8080/api/reclamacoes
```

**Agora as cinco foram atualizadas**, cada uma com o `status`, a
`intencao` e a `resposta` certos para o caso dela.

> 🧠 **Por que eu deixei esse erro na demonstração, em vez de já mostrar a
> versão certa:** porque "a execução deu sucesso" é exatamente o tipo de
> sinal que engana. Se eu só tivesse testado com uma reclamação (como fiz
> no Ato 3), eu nunca teria visto esse problema. Testar com **uma lista de
> verdade**, com mais de um item, é o que revela esse tipo de bug.

## 🎬 Ato 5 — Decisão, `PATCH` e resposta por e-mail

Com os cinco itens processados, mostro a etapa de decisão (código, não
IA) e o `PATCH` final. Depois, um `If`: se a ação for
`respondido_automaticamente`, um node **Gmail → Send** manda a resposta
para o `cliente_email` da reclamação.

**O que observar:** o node que decide o `If` usa `$('Montar patch').item.json.acao`,
e **não** `$json.acao` — porque depois do `PATCH`, `$json` passa a ser a
**resposta da API** (o registro atualizado), que não tem o campo `acao`.
Essa é outra pegadinha da mesma família: depois de qualquer HTTP Request,
o `$json` muda para a resposta **daquela** chamada — se você precisa de um
dado de um passo anterior, busque ele pelo nome do node, não por `$json`.

## 🧾 O que eu quero que você leve daqui

| O que vimos | A frase para guardar |
|---|---|
| `GET ?status=nova` | O filtro evita reprocessar o que já foi tratado |
| `PATCH` no final | Fecha o ciclo: ler → processar → escrever |
| Uma reclamação por vez (Ato 3) | Bom para aprender a mecânica, ruim para achar bugs de lista |
| **Run Once for Each Item** | Sem isso, uma lista de N vira 1, sem nenhum erro |
| `$json` depois de um HTTP Request | Virou a resposta **daquela** chamada — busque dados antigos pelo nome do node |

## 🧪 Exercício

Reproduza os Atos 2 a 4 no seu n8n, com a sua própria reclamação registrada
no Ato 1. Registre:

1. Print da execução "processando só 1 item" (antes da correção).
2. Print do modo **Run Once for Each Item** sendo ligado.
3. Print da execução depois da correção, com todos os itens atualizados no
   banco.

**Próximo passo:** [05-exercicio-01-extracao-estruturada](../05-exercicio-01-extracao-estruturada/README.md)
