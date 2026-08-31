# 2. Conceitos Fundamentais

Vocabulário mínimo para entender qualquer conversa sobre IA generativa.
São nove conceitos — todos vão reaparecer nas próximas aulas, então vale a
pena fixar bem agora.

---

## 🧠 IA tradicional x IA generativa

> IA tradicional **classifica ou prevê**. IA generativa **cria**.

| | IA tradicional (Machine Learning "clássico") | IA generativa |
|---|---|---|
| O que faz | Classifica, prevê um número, agrupa dados | Gera texto, imagem, áudio, código — conteúdo novo |
| Exemplo | "Este e-mail é spam?" (sim/não) | "Escreva uma resposta para este e-mail" |
| Saída | Categoria, número, rótulo | Texto (ou outro conteúdo) livre, em linguagem natural |
| Como é construída | Treinada para **uma tarefa específica** | Treinada de forma genérica, depois **direcionada por prompt** |

Um filtro de spam é IA tradicional: ele só sabe dizer "spam" ou "não
spam". Um LLM é IA generativa: você pode pedir para ele classificar um
e-mail como spam **e também** escrever a resposta, resumir o e-mail,
traduzi-lo — sem re-treinar nada, só mudando o que você pede.

**Outro exemplo prático:** quando a Netflix te recomenda uma série, isso
é IA tradicional — um modelo treinado especificamente para prever "qual a
chance de você gostar deste título", que devolve só um número/ranking.
Quando você pede para o ChatGPT "resuma esta série em um parágrafo sem
spoiler", isso é IA generativa — ele cria um texto novo, que nunca
existiu daquele jeito antes.

---

## 🔍 Machine Learning x Deep Learning

IA generativa não surgiu do nada — ela é um caso particular de Deep
Learning, que por sua vez é um caso particular de Machine Learning.

```
Inteligência Artificial (IA)
└── Machine Learning (ML)
    │   sistema aprende padrões a partir de dados, em vez de regras fixas
    └── Deep Learning (DL)
        │   ML com redes neurais de muitas camadas ("profundas")
        └── LLMs (o que usamos neste curso)
            arquitetura Transformer, treinada em bilhões de textos
```

- **Machine Learning**: em vez de programar regras, você mostra exemplos
  (dados) e o sistema aprende o padrão sozinho. Ex.: prever o preço de uma
  casa a partir de dados de outras casas.
- **Deep Learning**: um tipo de ML baseado em **redes neurais artificiais**
  com muitas camadas — é o que permitiu avanços em visão computacional,
  fala e, mais recentemente, linguagem.
- **LLM**: um modelo de Deep Learning, de arquitetura **Transformer**,
  treinado em quantidades massivas de texto para prever "qual é a próxima
  palavra mais provável" — e é justamente esse mecanismo simples, em
  escala gigantesca, que produz o comportamento que parece "inteligente".

---

## 💬 O que é um LLM

**LLM** = *Large Language Model* (Modelo de Linguagem de Grande Escala).

Na prática, um LLM é uma função gigantesca que recebe um texto de entrada
(o **prompt**) e produz um texto de saída, prevendo a sequência de palavras
mais provável dado tudo que ele já viu no seu treinamento e no próprio
prompt. Exemplos: GPT (OpenAI), Claude (Anthropic), Gemini (Google),
Llama (Meta).

Ele não "sabe" fatos como um banco de dados sabe — ele **aprendeu padrões
estatísticos de linguagem**. Isso explica boa parte do que vem a seguir
(inclusive as alucinações).

---

## 🔢 Tokens

> Um LLM não lê "palavras". Ele lê **tokens**.

**Token** é a unidade mínima de texto que o modelo processa — pode ser uma
palavra inteira, um pedaço de palavra, ou até um espaço/pontuação. Em
inglês, 1 token ≈ 4 caracteres ≈ ¾ de palavra. Em português, por causa de
acentos e conjugações, o mesmo texto geralmente **gasta mais tokens** do
que em inglês.

```
"Olá, tudo bem?"  →  [ "Ol", "á", ",", " tudo", " bem", "?" ]   (≈ 6 tokens)
```

Por que isso importa:

- **Custo**: a maioria das APIs de LLM cobra por token (entrada + saída).
- **Limite**: todo modelo tem um número máximo de tokens que consegue
  processar de uma vez — o que nos leva ao próximo conceito.

**Exemplo prático:** imagine que sua automação de atendimento processa
10 mil mensagens de clientes por dia, e cada mensagem (prompt + resposta
do modelo) gasta em média 300 tokens. São 3 milhões de tokens por dia —
e é exatamente essa conta que você vai fazer, na Aula 3, para decidir se
o custo de usar IA em cada mensagem faz sentido para o negócio.

---

## 🪟 Context Window

> É a "memória de curto prazo" do modelo, medida em tokens.

A **context window** (janela de contexto) é a quantidade máxima de tokens
que o modelo consegue "enxergar" ao mesmo tempo — somando o prompt que
você manda, o histórico da conversa e a resposta que ele vai gerar.

Se a conversa ultrapassa esse limite, o começo dela **sai da janela** — o
modelo literalmente deixa de "ver" as primeiras mensagens, mesmo que
pareça, pela interface de chat, que ele "lembra de tudo".

```
┌─────────────────── Context Window (ex.: 128.000 tokens) ───────────────────┐
│  System Prompt | Histórico da conversa | Prompt atual | (resposta gerada)  │
└──────────────────────────────────────────────────────────────────────────┘
       ↑ se a conversa crescer demais, o início "cai" para fora daqui
```

Modelos diferentes têm context windows bem diferentes (de ~8 mil a mais de
1 milhão de tokens, dependendo do modelo) — isso é um dos critérios para
escolher qual usar em cada aplicação.

**Exemplo prático:** pense num chatbot de suporte em que o cliente conta
o problema logo na primeira mensagem ("meu pedido #4521 chegou quebrado")
e, depois de trocar 40 mensagens tirando outras dúvidas, pede "resolve
aquele problema que eu te falei no início". Se a conversa toda não coube
na context window do modelo, ele simplesmente não vai mais "lembrar" do
número do pedido — e vai responder de forma vaga ou pedir a informação de
novo, irritando o cliente.

---

## 🌡️ Temperature

> Controla o quão "arriscado"/criativo o modelo é ao escolher a próxima
> palavra.

Em cada passo, o modelo calcula uma **probabilidade para cada possível
próxima palavra**. O parâmetro `temperature` decide como essa
probabilidade é usada na hora de escolher:

- **Temperature baixa (perto de 0):** o modelo quase sempre escolhe a
  palavra mais provável → respostas mais **previsíveis, consistentes e
  "seguras"**. Ideal para tarefas que exigem precisão (extração de dados,
  classificação, código).
- **Temperature alta (perto de 1 ou mais, dependendo do modelo):** o
  modelo tem mais chance de escolher palavras menos óbvias → respostas
  mais **variadas e criativas**, mas também mais instáveis. Ideal para
  brainstorm, texto criativo.

O mesmo prompt, rodado várias vezes com temperature alta, pode gerar
respostas visivelmente diferentes entre si. Com temperature 0, as respostas
tendem a ser praticamente idênticas a cada execução.

**Exemplo prático, voltando ao nosso cenário de atendimento:** na parte
que **classifica** a mensagem do cliente (categoria, prioridade,
sentimento), você quer temperature baixa — o sistema que recebe essa
classificação espera sempre o mesmo tipo de resposta, consistente. Já na
parte que **gera a resposta final** para o cliente, uma temperature um
pouco mais alta deixa o texto menos robótico e repetitivo.

---

## 🖼️ Modelos multimodais

Os primeiros LLMs só liam e escreviam **texto**. Um modelo **multimodal**
consegue receber e/ou gerar **mais de um tipo de mídia**: texto, imagem,
áudio e, em alguns casos, vídeo.

Exemplo prático: enviar uma foto de um gráfico e pedir para o modelo
explicar o que ele mostra, ou enviar um print de erro de código e pedir
para ele identificar o problema. GPT-4o/4.1, Claude e Gemini mais recentes
são todos multimodais.

**Voltando ao nosso cenário:** um cliente que manda uma **foto** do
produto quebrado, junto com a mensagem de texto reclamando, só pode ser
atendido de ponta a ponta por um modelo multimodal — um modelo só-texto
sequer "enxergaria" a foto.

---

## 🎭 Alucinações e limitações

> O modelo não sabe que não sabe.

**Alucinação** é quando o modelo gera uma informação **falsa, mas com
total confiança e fluência** — uma citação que não existe, uma API que
nunca existiu, um fato histórico inventado. Isso acontece porque o modelo
não está "consultando uma fonte de verdade": ele está prevendo a sequência
de palavras estatisticamente mais provável, e às vezes essa sequência é
plausível, mas falsa.

Outras limitações importantes a ter em mente desde já:

- **Conhecimento com data de corte:** o modelo não sabe de eventos depois
  do fim do seu treinamento (a menos que tenha acesso a busca/ferramentas).
- **Não aprende com a conversa atual permanentemente** — cada nova
  conversa começa "do zero" (fora o que está na context window daquela
  sessão).
- **Sensível à forma como a pergunta é feita** — o mesmo pedido, escrito
  de formas diferentes, pode gerar respostas de qualidade bem diferente
  (o assunto inteiro da Aula 2).

**Isso já causou problema sério no mundo real.** Em 2023, nos EUA, um
advogado usou o ChatGPT para pesquisar jurisprudência e apresentou, em um
processo judicial de verdade, **seis citações de casos que simplesmente
não existiam** — o modelo tinha inventado nomes de processos, números e
até trechos de decisão, tudo com aparência perfeitamente legítima. O
advogado foi multado pelo juiz. Esse caso (ficou conhecido como *Mata v.
Avianca*) é hoje citado como o exemplo clássico de alucinação: ninguém
percebeu o erro até alguém tentar verificar as fontes.

Esse é exatamente o tipo de risco que você já intuiu no exercício da seção
anterior, quando pensou no que poderia "dar errado" ao automatizar um
processo com IA.

---

## 🔓🔒 Modelos fechados x open source

| | Modelos fechados (proprietários) | Modelos open source / open weight |
|---|---|---|
| Exemplos | GPT (OpenAI), Claude (Anthropic), Gemini (Google) | Llama (Meta), Mistral, DeepSeek |
| Acesso | Só via API/interface do fornecedor | Pesos do modelo disponíveis para download |
| Onde roda | Nos servidores do fornecedor | Onde você quiser (nuvem própria, on-premise) |
| Custo | Pago por uso (tokens) | Grátis para rodar, mas você paga a infraestrutura |
| Controle/privacidade | Dados passam pelo fornecedor | Pode manter 100% dos dados internamente |
| Ponta de qualidade | Geralmente à frente no estado da arte | Chega perto, com mais flexibilidade de custo/controle |

Não existe "o melhor" — a escolha depende de custo, privacidade exigida
pelo caso de uso, necessidade de customização e infraestrutura disponível.

**Exemplo prático:** um hospital que quer usar IA para resumir prontuários
de pacientes dificilmente vai mandar esses dados para uma API externa —
dados de saúde são sensíveis e regulados (LGPD). Nesse caso, faz mais
sentido rodar um modelo open source **dentro** da própria infraestrutura
do hospital, mesmo que isso dê mais trabalho, porque nenhum dado sai de
lá. Já uma startup pequena, sem dado sensível e sem equipe de
infraestrutura, normalmente sai ganhando ao simplesmente usar a API de um
modelo fechado.

Eu retomo essa decisão quando a gente chegar em integração via API, na
Aula 3.

---

## 📝 Resumo visual

| Conceito | Em uma frase |
|---|---|
| IA generativa | Cria conteúdo novo, em vez de só classificar/prever |
| ML → DL → LLM | LLM é Deep Learning, que é um tipo de Machine Learning |
| LLM | Prevê a próxima palavra mais provável, em escala gigantesca |
| Token | Unidade de texto que o modelo processa (custo e limite são medidos nisso) |
| Context Window | Quanto o modelo "enxerga" de uma vez, em tokens |
| Temperature | Controla previsibilidade (baixa) x criatividade (alta) da resposta |
| Multimodal | Modelo que lida com texto + imagem/áudio/vídeo |
| Alucinação | Resposta falsa gerada com confiança total |
| Fechado x open source | Pago e pronto x grátis mas você hospeda |

---

## 🧪 Exercício

Responda por escrito, sem usar nenhum LLM para responder (isso é para
fixar o conceito, a prática vem nos próximos módulos):

1. Explique, com suas palavras, por que um LLM pode "inventar" uma
   resposta errada com a mesma confiança de uma resposta certa. Ligue sua
   resposta ao conceito de "prever a próxima palavra mais provável".
2. Se você fosse construir uma automação para **extrair o CPF de um texto
   e devolver só o número**, você usaria temperature alta ou baixa? E se
   fosse para **gerar 5 ideias criativas de nome para um produto**?
3. Escolha uma tarefa do seu dia a dia (ou do cenário que você descreveu
   no módulo anterior) que exigiria uma context window grande. Por quê?
4. Em que situação você recomendaria um modelo **open source** hospedado
   internamente em vez de um modelo fechado via API, mesmo sendo mais
   trabalhoso de manter? Pense em privacidade/custo.

**Próximo passo:** [03-demonstracao-guiada](../03-demonstracao-guiada/README.md)
