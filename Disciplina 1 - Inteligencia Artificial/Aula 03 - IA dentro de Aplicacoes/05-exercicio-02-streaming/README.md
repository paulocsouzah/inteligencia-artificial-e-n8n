# 5. Exercício 02 — Streaming + Prompt Engineering Aplicado

**Nível: 🟡 Médio.**

Neste exercício, você vai pegar um prompt que **já escreveu na Aula 02**
e rodá-lo via API, com streaming — juntando as duas aulas num script só.

## 🎯 Objetivo

Ver na prática que tudo que você aprendeu de prompt engineering continua
valendo dentro do código — o `system`/`user` da API é só uma casa nova
para o mesmo prompt — e entender como implementar streaming de verdade.

## 🧪 O prompt que você vai reaproveitar

Volte ao [Exercício 01 da Aula 02](<../../Aula 02 - Prompt Engineering/04-exercicio-01-role-e-contexto/README.md>)
e pegue o **Prompt C** (com role e contexto de política de reembolso).
Separe-o em duas partes:

```
system: "Você é um atendente sênior de e-commerce, treinado para responder
com empatia e objetividade.

Contexto: nossa política permite reembolso integral em até 7 dias após a
entrega, ou troca imediata, sem necessidade de devolver o produto
danificado, caso ele tenha chegado com defeito de fábrica. Casos com essa
justificativa têm prioridade máxima no envio da solução."

user: "Comprei um notebook no site de vocês faz 3 dias e ele chegou com a
tela trincada. Já tentei falar no chat e ninguém resolveu. Quero meu
dinheiro de volta ou um produto novo, e rápido, porque preciso dele para
trabalhar."
```

## 📋 Passo a passo

1. No mesmo projeto do Exercício 01 (ou um novo), crie `streaming.js`:

   ```js
   import "dotenv/config";
   import OpenAI from "openai";

   const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

   const stream = await client.chat.completions.create({
     model: "gpt-4o-mini",
     messages: [
       { role: "system", content: "<cole aqui o system do Prompt C>" },
       { role: "user", content: "<cole aqui a mensagem do cliente>" }
     ],
     stream: true
   });

   let textoCompleto = "";
   for await (const chunk of stream) {
     const pedaco = chunk.choices[0]?.delta?.content || "";
     process.stdout.write(pedaco);
     textoCompleto += pedaco;
   }

   console.log("\n\n--- Tamanho total da resposta ---");
   console.log(textoCompleto.length, "caracteres");
   ```

2. Rode e observe a resposta "sendo digitada" no terminal:

   ```bash
   node streaming.js
   ```

3. Compare com a resposta que você guardou do **Prompt C** na Aula 02
   (rodado no chat, sem streaming) — o conteúdo da resposta é parecido?

4. **Desafio:** modifique o script para medir o tempo entre o início da
   chamada e o **primeiro** chunk recebido (`console.time`/
   `console.timeEnd`), e compare com o tempo até a resposta **completa**
   terminar. Essa diferença é exatamente o ganho de UX que streaming
   proporciona.

## 📊 Comparação

| | Resposta no chat (Aula 02) | Resposta via API com streaming |
|---|---|---|
| Conteúdo é parecido/equivalente? | | |
| Formato/tom da resposta | | |
| Tempo até você ver a **primeira** palavra | (imediato, é chat) | |

## 🧪 Perguntas de reflexão

1. O `system` que você separou do prompt original mudou alguma coisa no
   comportamento do modelo, comparado a mandar tudo junto num texto só
   (como fizemos na Aula 02)?
2. No desafio: qual foi a diferença entre o tempo até o primeiro chunk e
   o tempo até a resposta completa? Em uma aplicação de chat ao vivo, por
   que essa diferença importa tanto para a experiência do usuário?
3. Para a automação de triagem do nosso cenário (que roda sem ninguém
   olhando a tela), streaming muda alguma coisa? Por que sim ou por que
   não?
4. Se você precisasse **salvar** a resposta completa num banco de dados
   depois que ela terminar de chegar (não só exibir no terminal), o que
   o código precisaria fazer diferente do que já está no `streaming.js`?

**Próximo passo:** [06-exercicio-03-function-calling](../06-exercicio-03-function-calling/README.md)
