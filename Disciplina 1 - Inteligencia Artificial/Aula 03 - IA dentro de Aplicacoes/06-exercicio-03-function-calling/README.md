# 6. Exercício 03 — Function/Tool Calling

**Nível: 🟠 Complexo.**

Este é o exercício que fecha o ciclo do módulo inteiro. O JSON que você
validou **manualmente**, no papel, no Exercício 03 da Aula 02, vai virar
código de verdade — com schema garantido pela API, rodando sozinho, sem
você olhando cada resposta.

## 🎯 Objetivo

Implementar a triagem de mensagem de cliente via function/tool calling,
comparando os resultados com o que você já tinha obtido manualmente na
Aula 02, e adicionar tratamento de erro para rodar com segurança em
produção.

## 🧪 As mensagens de teste

As mesmas três da Aula 02, para você poder comparar diretamente:

```
Mensagem A: "Comprei um notebook no site de vocês faz 3 dias e ele chegou
com a tela trincada. Já tentei falar no chat e ninguém resolveu. Quero
meu dinheiro de volta ou um produto novo, e rápido, porque preciso dele
para trabalhar."

Mensagem B: "Só queria dizer que o atendimento de vocês foi excelente,
super rápido."

Mensagem C: "Comprei um remédio de uso contínuo há 5 dias e ele nunca
chegou. Estou sem o remédio desde ontem."
```

## 📋 Passo a passo

1. No projeto, crie `triagem.js`:

   ```js
   import "dotenv/config";
   import OpenAI from "openai";

   const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

   const mensagens = [
     "Comprei um notebook no site de vocês faz 3 dias e ele chegou com a tela trincada. Já tentei falar no chat e ninguém resolveu. Quero meu dinheiro de volta ou um produto novo, e rápido, porque preciso dele para trabalhar.",
     "Só queria dizer que o atendimento de vocês foi excelente, super rápido.",
     "Comprei um remédio de uso contínuo há 5 dias e ele nunca chegou. Estou sem o remédio desde ontem."
   ];

   const ferramentaTriagem = {
     type: "function",
     function: {
       name: "triar_mensagem",
       description: "Classifica uma mensagem de cliente de e-commerce",
       parameters: {
         type: "object",
         properties: {
           categoria: { type: "string", enum: ["Financeiro", "Tecnico", "Logistica", "Elogio"] },
           prioridade: { type: "string", enum: ["Baixa", "Media", "Alta", "Urgente"] },
           sentimento: { type: "string", enum: ["Positivo", "Neutro", "Negativo"] }
         },
         required: ["categoria", "prioridade", "sentimento"]
       }
     }
   };

   async function triar(mensagem) {
     const response = await client.chat.completions.create({
       model: "gpt-4o-mini",
       messages: [{ role: "user", content: mensagem }],
       tools: [ferramentaTriagem],
       tool_choice: { type: "function", function: { name: "triar_mensagem" } }
     });

     const chamada = response.choices[0].message.tool_calls[0];
     return JSON.parse(chamada.function.arguments);
   }

   for (const mensagem of mensagens) {
     const resultado = await triar(mensagem);
     console.log(mensagem.slice(0, 50) + "...");
     console.log(resultado);
     console.log("---");
   }
   ```

2. Rode e guarde print do resultado das três mensagens:

   ```bash
   node triagem.js
   ```

3. Compare cada resultado com o que você obteve **manualmente** no
   [Exercício 03 da Aula 02](<../../Aula 02 - Prompt Engineering/06-exercicio-03-decomposicao-e-structured-output/README.md>).

4. Rode a **Mensagem A** mais duas vezes (total de 3 execuções), como fez
   na Aula 02, e confirme que o `JSON.parse` **nunca** quebra — essa é a
   garantia que function calling adiciona sobre o prompt "implorado".

5. Adicione tratamento de erro com retry (do módulo de conceitos) na
   função `triar`, para o caso de rate limit:

   ```js
   async function triar(mensagem, tentativas = 3) {
     for (let i = 0; i < tentativas; i++) {
       try {
         const response = await client.chat.completions.create({
           model: "gpt-4o-mini",
           messages: [{ role: "user", content: mensagem }],
           tools: [ferramentaTriagem],
           tool_choice: { type: "function", function: { name: "triar_mensagem" } }
         });
         const chamada = response.choices[0].message.tool_calls[0];
         return JSON.parse(chamada.function.arguments);
       } catch (erro) {
         if (erro.status === 429 && i < tentativas - 1) {
           await new Promise(r => setTimeout(r, 2 ** i * 1000));
         } else {
           throw erro;
         }
       }
     }
   }
   ```

6. **🚀 Desafio dev (mais completo):** adapte o `ferramentaTriagem` e o
   `triar()` para o cenário de **triagem de falha de CI/CD** do desafio
   dev do Exercício 03 da Aula 02 (schema com `etapa_falha`,
   `causa_provavel`, `tipo`, `acao_recomendada`). Rode com os mesmos dois
   logs (transitório e estrutural) que você já tinha testado
   manualmente, agora via function calling de verdade.

## 📊 Comparação

| Mensagem | Categoria (API) | Prioridade (API) | Sentimento (API) | Igual ao resultado manual da Aula 02? |
|---|---|---|---|---|
| A — 1ª execução | | | | |
| A — 2ª execução | | | | |
| A — 3ª execução | | | | |
| B | | | | |
| C | | | | |

## 🧪 Perguntas de reflexão

1. As três execuções da Mensagem A via function calling foram mais
   consistentes entre si do que as três execuções manuais que você fez na
   Aula 02 (prompt "implorado")? O que muda estruturalmente entre as duas
   abordagens que explica essa diferença?
2. Em nenhuma das execuções o `JSON.parse` quebrou? Isso prova que
   function calling é 100% infalível, ou só que o **formato** é
   garantido (e o **conteúdo**, ou seja, a classificação em si, ainda
   pode estar errada)?
3. Pensando no retry com backoff que você adicionou: o que aconteceria
   com uma automação rodando 10.000 mensagens/dia se ela **não** tivesse
   esse tratamento e um rate limit fosse atingido no meio do processo?
4. Se você fez o desafio dev: comparado ao que você fez manualmente na
   Aula 02, o código conseguiu decidir corretamente entre erro
   transitório e estrutural nos dois logs de teste?

**Próximo passo:** [07-exercicio-04-visao-e-extracao-de-documentos](../07-exercicio-04-visao-e-extracao-de-documentos/README.md)
