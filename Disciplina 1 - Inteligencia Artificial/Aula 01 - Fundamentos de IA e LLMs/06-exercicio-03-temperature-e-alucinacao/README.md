# 6. Exercício 03 — Temperature e Alucinação

Fechando a bateria de exercícios da aula: agora é sua vez de provocar,
sozinho, os dois comportamentos que eu te mostrei na
[demonstração guiada](../03-demonstracao-guiada/README.md).

## 🌡️ Parte 1 — Temperature

Acesse o [Google AI Studio](https://aistudio.google.com/) (gratuito, entra
com conta Google, não pede cartão) e abra um novo prompt no modo "chat" ou
"prompt" simples. Localize o controle deslizante de **Temperature**.

1. Ajuste a temperature para o **valor mínimo** (0).
2. Rode este prompt **três vezes** (em conversas/prompts novos a cada
   vez, para não haver influência de uma resposta na outra):
   ```
   Dê um nome criativo para uma cafeteria de bairro.
   ```
3. Ajuste a temperature para o **valor máximo** disponível.
4. Rode o mesmo prompt mais **três vezes**, do mesmo jeito.
5. Guarde print das 6 respostas.

> Não tem acesso ao Google AI Studio ou prefere outra ferramenta com
> controle de temperature? Qualquer "playground" de API com esse controle
> serve (ex.: [OpenAI Platform](https://platform.openai.com/playground), se
> você já tiver conta e créditos gratuitos). O importante é o
> comportamento observado, não a ferramenta específica.

### 📊 Comparação

| | Temperature 0 (execuções 1, 2, 3) | Temperature máxima (execuções 1, 2, 3) |
|---|---|---|
| As 3 respostas foram iguais ou muito parecidas entre si? | | |
| As respostas foram "seguras"/óbvias ou criativas/inesperadas? | | |

---

## 🎭 Parte 2 — Provocando uma alucinação

Agora tente fazer um modelo (qualquer um: ChatGPT, Claude, Gemini)
**inventar uma informação com confiança**. Sugestões de caminho (escolha
um ou tente os dois):

**Caminho A — pergunta sobre algo inexistente**
```
Explique como funciona a função `resumirTexto()` da biblioteca
`nlp-brasil-pro` em JavaScript e me dê um exemplo de uso.
```
(Esta biblioteca/função não existe — foi inventada agora.)

**Caminho B — pedir uma fonte específica**
```
Cite o artigo científico brasileiro, publicado em uma revista acadêmica,
que comprovou que plantas respondem melhor a música clássica do que a
outros gêneros musicais. Traga o nome dos autores e o ano.
```

Guarde print da resposta. Se o modelo **recusou** responder ou **avisou**
que não tem certeza / que a fonte pode não existir, isso também é um
resultado válido — anote e explique por que você acha que, nesse caso, o
modelo não alucinou.

## 🧪 Perguntas de reflexão

1. Com base na Parte 1: para uma automação que **gera respostas
   criativas de marketing**, você usaria temperature alta ou baixa? E
   para uma automação que **extrai um valor numérico de um texto**?
2. Com base na Parte 2: a resposta do modelo veio com algum sinal de
   incerteza (palavras como "acredito", "geralmente", "pode ser"), ou foi
   apresentada com a mesma confiança de um fato verificado?
3. Se este fosse um sistema automatizado de verdade (sem humano revisando
   cada resposta antes de ela chegar ao cliente), que tipo de dano uma
   alucinação como essa poderia causar? Dê um exemplo concreto ligado ao
   cenário da empresa de atendimento ao cliente.
4. Que estratégia você imagina que poderia reduzir alucinações em um
   sistema real? (Não se preocupe em acertar tecnicamente — isso é o que
   as Aulas 3 e 4, sobre API e RAG, vão responder de verdade.)

**Próximo passo:** [07-exercicio-final](../07-exercicio-final/README.md)
