# 3. Demonstração Guiada

Agora eu vou te mostrar, ao vivo, os conceitos que acabei de te explicar
**acontecendo de verdade na tela** — antes de você colocar a mão sozinho
no próximo módulo. Você pode reproduzir cada demonstração comigo, em
qualquer interface de chat gratuita (ChatGPT, Claude.ai ou Gemini —
qualquer uma serve). Acompanhe e anote o que observar, porque você vai
comparar com o que encontrar sozinho, no exercício seguinte.

---

## 🔢 Demo 1 — Tokens não são palavras

Eu peço ao modelo:

```
Conte quantas letras "r" existem na palavra "morangoterapia".
```

Repare que, em vários modelos, a resposta vem **errada** — porque o
modelo não está "olhando letra por letra" como nós; ele está lidando com
**tokens**, que muitas vezes agrupam várias letras em um único pedaço.
Essa é a forma mais direta e simples de eu te provar, ao vivo, que token
não é a mesma coisa que caractere ou palavra.

> 💬 **Pensa comigo:** se o modelo errou, o que isso te diz sobre confiar
> um LLM para tarefas de contagem/precisão caractere-a-caractere?

---

## 🪟 Demo 2 — Context window "esquecendo" o início

1. Eu começo uma conversa nova e, na primeira mensagem, digo um dado
   arbitrário: `Meu número da sorte é 47. Guarde isso.`
2. Continuo a conversa normalmente por várias trocas de mensagem sobre
   **outros assuntos**, gerando bastante texto de propósito (peço
   resumos longos, histórias etc. — o objetivo é consumir tokens da
   context window).
3. Depois de uma boa quantidade de texto trocado, eu pergunto:
   `Qual é o meu número da sorte?`

Em conversas curtas o modelo lembra sem problema (o dado ainda está
dentro da context window). Essa demonstração fica mais interessante em
modelos com context window menor, ou gerando bastante volume de texto no
meio — o que importa aqui é o **conceito**, mesmo que nesta demonstração
específica o limite não seja atingido (o que já te mostra que a context
window usada é grande).

> 💬 **Pensa comigo:** por que, em uma conversa muito longa, um
> assistente pode "esquecer" uma instrução dada lá no início?

---

## 🌡️ Demo 3 — Temperature na prática

Quando a interface tem acesso a um "playground" com controle de
temperature (eu uso o [Google AI Studio](https://aistudio.google.com/),
que é gratuito e não pede cartão), eu rodo o **mesmo prompt 3 vezes**:

```
Escreva uma frase de efeito para abertura de uma palestra sobre tecnologia.
```

- Com **temperature próxima de 0**: rodo 3 vezes → comparamos as respostas.
- Com **temperature próxima de 1** (ou no máximo do slider): rodo mais 3
  vezes → comparamos de novo.

Se você estiver usando uma interface sem esse controle (caso comum no
ChatGPT/Claude/Gemini no modo chat padrão), eu te mostro o resultado
esperado com prints que já preparei, ou faço essa demonstração específica
direto no Google AI Studio junto com você.

> 💬 **Pensa comigo:** qual conjunto de respostas (temperature baixa ou
> alta) você usaria para gerar uma mensagem de confirmação de pedido
> automática? E para um gerador de slogans?

---

## 🎭 Demo 4 — Provocando uma alucinação

Eu peço algo bem específico e obscuro, de propósito, algo verificável que
o modelo dificilmente teria visto muito no treinamento:

```
Me conte sobre o artigo científico "Silva, 2021 — Otimização de
Cronogramas Escolares via Redes Neurais Recorrentes em Instituições de
Pequeno Porte no Brasil" e cite as principais conclusões.
```

(Esse artigo é fictício — eu inventei agora, só para esta demonstração.)
É comum o modelo **responder com confiança total**, descrevendo
conclusões plausíveis para um artigo que **não existe**. Essa é uma
alucinação clássica, acontecendo ao vivo na sua frente — a mesma coisa
que aconteceu de verdade no caso do advogado que eu te contei no módulo
anterior.

> 💬 **Pensa comigo:** o que a resposta do modelo tinha de convincente?
> Olhando com atenção, existe algum sinal de alerta de que a informação
> pode ser inventada? Como isso se conecta com o que você respondeu lá no
> primeiro módulo, sobre "o que pode dar errado" ao automatizar um
> processo com IA?

---

## 📝 O que anotar

Durante a demonstração, anote (você vai usar isso nos próximos
exercícios, que você faz sozinho):

- O que aconteceu de diferente do que você esperava, em cada demonstração.
- Se o modelo que usamos errou a contagem de letras, acertou ou chegou
  perto.
- Se a alucinação da Demo 4 "pareceu" verdadeira à primeira vista.

**Próximo passo:** [04-exercicio-01-comparando-modelos](../04-exercicio-01-comparando-modelos/README.md)
