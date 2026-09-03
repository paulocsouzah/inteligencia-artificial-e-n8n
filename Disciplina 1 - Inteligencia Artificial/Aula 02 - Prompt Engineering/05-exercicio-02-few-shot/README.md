# 5. Exercício 02 — Few-shot em Casos Ambíguos

Este é o exercício mais aprofundado da aula. Vamos testar se dar exemplos
no prompt (few-shot) realmente melhora a classificação de mensagens
**ambíguas de propósito** — o tipo de caso em que uma regra escrita em
palavras não é suficiente.

## 🎯 Objetivo

Perceber que few-shot não é só sobre formato — é sobre **transmitir um
critério de decisão** através de exemplos, algo que às vezes é mais fácil
de mostrar do que de explicar.

## 🧪 As mensagens ambíguas

Três mensagens de cliente, escolhidas de propósito por não se encaixarem
claramente em uma única categoria (`Financeiro`, `Tecnico`, `Logistica`,
`Elogio`):

```
Mensagem 1: "O produto chegou, mas o aplicativo de vocês não reconhece o
número de série para ativar a garantia."

Mensagem 2: "Paguei o frete expresso e mesmo assim o pedido está atrasado
há uma semana, quero meu dinheiro do frete de volta."

Mensagem 3: "Amei o produto, mas o app trava toda vez que eu tento avaliar
minha compra."
```

### Prompt zero-shot

```
Classifique a mensagem abaixo em uma única categoria: Financeiro, Tecnico,
Logistica ou Elogio.

Mensagem: "<cole aqui uma das três mensagens>"
Categoria:
```

### Prompt few-shot

```
Exemplo 1
Mensagem: "Meu pedido não chegou e já faz 15 dias."
Categoria: Logistica

Exemplo 2
Mensagem: "O app trava toda vez que eu tento fazer login."
Categoria: Tecnico

Exemplo 3
Mensagem: "Vocês cobraram duas vezes no meu cartão neste mês."
Categoria: Financeiro

Agora classifique a mensagem abaixo na mesma lógica dos exemplos acima,
em uma única categoria: Financeiro, Tecnico, Logistica ou Elogio.

Mensagem: "<cole aqui a mesma mensagem usada no prompt zero-shot>"
Categoria:
```

## 📋 Passo a passo

1. Escolha um modelo.
2. Para **cada uma das três mensagens**: rode primeiro o prompt
   zero-shot, depois o few-shot (sempre em conversas novas). Guarde print
   de cada uma das 6 respostas.
3. Preencha a tabela comparativa abaixo.
4. **Desafio:** repita apenas a Mensagem 1 (a mais ambígua das três) em um
   **segundo modelo**, zero-shot e few-shot, e veja se os dois modelos
   concordam entre si.
5. **🚀 Desafio dev (mais completo):** repita o mesmo experimento
   classificando **issues de GitHub** em vez de mensagens de cliente.
   Categorias: `Bug`, `Feature`, `Duvida`, `Documentacao`.

   ```
   Issue 1: "O botão de salvar não aparece no Firefox, mas funciona no
   Chrome — é assim que deveria ser?"

   Issue 2: "Seria ótimo se desse pra exportar o relatório em CSV além de
   PDF."

   Issue 3: "O endpoint /users retorna 500 quando o campo 'email' vem
   vazio, mas a documentação não diz se o campo é obrigatório."
   ```

   Rode as três, zero-shot e depois few-shot (com 3-4 exemplos de issues
   já rotuladas, no mesmo estilo do módulo de conceitos). A Issue 3 é a
   mais ambígua de propósito (é bug? é falta de documentação?).

## 📊 Comparação

| Mensagem | Categoria — zero-shot | Categoria — few-shot | O few-shot mudou o resultado? |
|---|---|---|---|
| 1 (garantia + app) | | | |
| 2 (frete + reembolso) | | | |
| 3 (elogio + bug no app) | | | |

### 📊 Comparação (desafio dev)

| Issue | Categoria — zero-shot | Categoria — few-shot | Justificativa faz sentido? |
|---|---|---|---|
| 1 (comportamento inconsistente entre navegadores) | | | |
| 2 (pedido de nova funcionalidade) | | | |
| 3 (erro não documentado) | | | |

## 🧪 Perguntas de reflexão

1. Para qual das três mensagens o few-shot fez mais diferença? O que, nos
   seus três exemplos, pode ter guiado o modelo para aquela decisão
   específica?
2. Os meus três exemplos (do prompt few-shot) não cobrem nenhum caso
   "misto" como os que você testou — mesmo assim eles ajudaram? Por que
   você acha que sim (ou não)?
3. Se uma dessas mensagens pudesse legitimamente se encaixar em **duas**
   categorias (ex.: Mensagem 1 tem Logística **e** Técnico), como você
   resolveria isso no design do prompt — permitir mais de uma categoria,
   ou forçar o modelo a escolher uma só e por quê?
4. No desafio (segundo modelo): os dois modelos concordaram na
   classificação da Mensagem 1? O que isso te diz sobre confiar em um
   único modelo para decisões ambíguas em produção?
5. Se você fez o desafio dev: a Issue 3 (erro não documentado) foi
   classificada como `Bug` ou `Documentacao`? Na prática, times de
   produto/engenharia às vezes discutem exatamente esse tipo de caso —
   você concorda com o critério que o modelo usou?

**Próximo passo:** [06-exercicio-03-decomposicao-e-structured-output](../06-exercicio-03-decomposicao-e-structured-output/README.md)
