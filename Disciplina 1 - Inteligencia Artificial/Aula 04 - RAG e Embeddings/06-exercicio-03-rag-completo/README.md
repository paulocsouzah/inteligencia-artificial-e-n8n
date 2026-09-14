# 6. Exercício 03 — RAG Completo (Chunking + Retrieval + Geração)

**Nível: 🟠 Complexo.**

Este é o exercício que fecha o ciclo: você vai pegar um documento maior,
dividir em chunks, montar a base, e responder as mensagens de cliente do
cenário integrador — as mesmas mensagens que você classificou na Aula 02
e na Aula 03 — só que agora, em vez de classificar, o sistema **responde
ao cliente com base na política real da empresa**.

## 🎯 Objetivo

Implementar o pipeline de RAG completo (chunking → embedding → retrieval
→ geração), e comparar a resposta do sistema com e sem o contexto
recuperado.

## 📄 O documento

Um "manual de políticas" fictício, com várias seções — cole isso como uma
única string longa no seu script (ou leia de um arquivo `.txt` separado,
se preferir):

```
POLÍTICA DE REEMBOLSO
Reembolso integral em até 7 dias após a entrega. Caso o produto tenha
chegado com defeito de fábrica, o cliente não precisa devolver o produto
para receber o reembolso ou a troca — basta enviar fotos do defeito.
Casos com defeito de fábrica têm prioridade máxima no atendimento.

POLÍTICA DE GARANTIA
Todos os produtos eletrônicos têm 12 meses de garantia contra defeito de
fabricação, contados a partir da data de compra. A garantia não cobre
danos causados por mau uso, quedas ou contato com líquidos.

POLÍTICA DE FRETE E ENTREGA
Frete grátis para compras acima de R$ 200. Prazo de entrega de 5 a 10
dias úteis para regiões metropolitanas, podendo chegar a 15 dias úteis
para outras regiões. Pedidos atrasados além do prazo informado têm
prioridade de investigação junto à transportadora.

POLÍTICA DE TROCA
Trocas por tamanho, cor ou modelo diferente podem ser solicitadas em até
30 dias corridos após o recebimento, desde que o produto esteja sem uso e
com a embalagem original.

POLÍTICA DE CANCELAMENTO
Pedidos podem ser cancelados sem custo enquanto ainda não tiverem sido
despachados. Após o despacho, o cliente deve aguardar a entrega e seguir
o processo de reembolso.
```

## 📋 Passo a passo

1. Crie `rag-completo.js`. Comece com o **chunking** — divida o manual
   por seção (cada bloco separado por linha em branco vira um chunk):

   ```js
   import "dotenv/config";
   import OpenAI from "openai";

   const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

   const manual = `POLÍTICA DE REEMBOLSO
   Reembolso integral em até 7 dias após a entrega. Caso o produto tenha
   chegado com defeito de fábrica, o cliente não precisa devolver o produto
   para receber o reembolso ou a troca — basta enviar fotos do defeito.
   Casos com defeito de fábrica têm prioridade máxima no atendimento.

   POLÍTICA DE GARANTIA
   Todos os produtos eletrônicos têm 12 meses de garantia contra defeito de
   fabricação, contados a partir da data de compra. A garantia não cobre
   danos causados por mau uso, quedas ou contato com líquidos.

   POLÍTICA DE FRETE E ENTREGA
   Frete grátis para compras acima de R$ 200. Prazo de entrega de 5 a 10
   dias úteis para regiões metropolitanas, podendo chegar a 15 dias úteis
   para outras regiões. Pedidos atrasados além do prazo informado têm
   prioridade de investigação junto à transportadora.

   POLÍTICA DE TROCA
   Trocas por tamanho, cor ou modelo diferente podem ser solicitadas em até
   30 dias corridos após o recebimento, desde que o produto esteja sem uso e
   com a embalagem original.

   POLÍTICA DE CANCELAMENTO
   Pedidos podem ser cancelados sem custo enquanto ainda não tiverem sido
   despachados. Após o despacho, o cliente deve aguardar a entrega e seguir
   o processo de reembolso.`;

   // Chunking: divide por seção (parágrafos separados por linha em branco)
   const chunks = manual.split(/\n\s*\n/).map(c => c.trim()).filter(Boolean);
   console.log(`Documento dividido em ${chunks.length} chunks.\n`);
   ```

2. Adicione as funções de embedding, similaridade e retrieval (iguais às
   dos exercícios anteriores), e monte a base:

   ```js
   function similaridadeCosseno(a, b) {
     let produtoEscalar = 0, normaA = 0, normaB = 0;
     for (let i = 0; i < a.length; i++) {
       produtoEscalar += a[i] * b[i];
       normaA += a[i] * a[i];
       normaB += b[i] * b[i];
     }
     return produtoEscalar / (Math.sqrt(normaA) * Math.sqrt(normaB));
   }

   async function embed(texto) {
     const response = await client.embeddings.create({ model: "text-embedding-3-small", input: texto });
     return response.data[0].embedding;
   }

   const base = [];
   for (const chunk of chunks) {
     base.push({ texto: chunk, embedding: await embed(chunk) });
   }
   ```

3. Implemente a função `responderComRag`, que faz retrieval **e** gera a
   resposta final:

   ```js
   async function responderComRag(pergunta, base, topK = 2) {
     const perguntaEmbedding = await embed(pergunta);
     const recuperados = base
       .map(doc => ({ texto: doc.texto, score: similaridadeCosseno(perguntaEmbedding, doc.embedding) }))
       .sort((a, b) => b.score - a.score)
       .slice(0, topK);

     const contexto = recuperados.map(r => r.texto).join("\n\n");

     const resposta = await client.chat.completions.create({
       model: "gpt-4o-mini",
       messages: [
         { role: "system", content: `Você é um atendente de e-commerce. Responda a pergunta do cliente usando APENAS as informações do contexto abaixo. Se o contexto não tiver a resposta, diga que vai verificar com a equipe responsável.\n\nContexto:\n${contexto}` },
         { role: "user", content: pergunta }
       ]
     });

     return { resposta: resposta.choices[0].message.content, chunksUsados: recuperados };
   }
   ```

4. Rode com as mensagens do cenário integrador (as mesmas da Aula 02 e
   Aula 03):

   ```js
   const mensagens = [
     "Comprei um notebook no site de vocês faz 3 dias e ele chegou com a tela trincada. Já tentei falar no chat e ninguém resolveu. Quero meu dinheiro de volta ou um produto novo, e rápido, porque preciso dele para trabalhar.",
     "Comprei um remédio de uso contínuo há 5 dias e ele nunca chegou. Estou sem o remédio desde ontem.",
     "Posso desistir da compra? Ainda não recebi nada."
   ];

   for (const mensagem of mensagens) {
     const { resposta, chunksUsados } = await responderComRag(mensagem, base);
     console.log(`\nMensagem: "${mensagem}"`);
     console.log(`Chunk(s) usado(s): ${chunksUsados.map(c => c.texto.split("\n")[0]).join(" | ")}`);
     console.log(`Resposta: ${resposta}`);
   }
   ```

   ```bash
   node rag-completo.js
   ```

5. **Desafio:** faça uma pergunta que **não tem resposta** no manual
   (ex.: "Vocês têm loja física em Belo Horizonte?") e confirme que o
   sistema admite não saber, em vez de inventar uma resposta.

## 📊 Comparação

| Mensagem | Chunk(s) recuperado(s) | Resposta fez sentido com a política real? |
|---|---|---|
| Notebook com tela trincada | | |
| Remédio que não chegou | | |
| Desistir da compra | | |

## 🧪 Perguntas de reflexão

1. Para a mensagem do notebook, o sistema recuperou o chunk de
   **Reembolso**? A resposta mencionou corretamente que não precisa
   devolver o produto (por ter defeito de fábrica)?
2. A mensagem "Posso desistir da compra? Ainda não recebi nada." é
   ambígua entre Cancelamento e Reembolso. Qual chunk foi recuperado? Você
   concorda com a escolha?
3. No desafio (pergunta sem resposta no manual): o sistema alucinou uma
   resposta, ou admitiu não saber? Por que a instrução no `system`
   ("se o contexto não tiver a resposta, diga que vai verificar") importa
   tanto aqui quanto o retrieval em si?
4. Compare este exercício com o Exercício 03 da Aula 02 (a triagem
   manual/via function calling). Lá, a informação (categoria, prioridade)
   já estava implícita na própria mensagem. Aqui, a resposta depende de
   uma informação **externa** (o manual). Por que RAG resolve um problema
   que nem prompt engineering nem function calling sozinhos resolveriam?

**Próximo passo:** [07-exercicio-04-rag-com-infra-aws](../07-exercicio-04-rag-com-infra-aws/README.md)
