# 🔌 Aula 03 — IA dentro de Aplicações

**Formato:** Presencial

Nas duas últimas aulas, você colou prompt numa interface de chat e leu a
resposta na tela. Hoje isso vira **código**: sua aplicação chama a API de
um LLM sozinha, sem ninguém copiando e colando — o passo que transforma
tudo que você aprendeu em algo que roda em produção. Os exercícios sobem
de nível ao longo da aula: da primeira chamada simples até um script que
**lê uma imagem ou PDF sozinho e extrai os dados**, como se preenchesse
um formulário automaticamente.

## 📚 Estrutura

| Pasta | Conteúdo |
|-------|----------|
| [00-resumo-para-slides](00-resumo-para-slides.md) | Conteúdo condensado da aula, pronto para gerar uma apresentação (ex.: NotebookLM) — arquivo local, fora do Git (`.gitignore`) |
| [01-contexto-e-problema-real](01-contexto-e-problema-real/README.md) | Por que colar prompt num chat não escala, e o que muda quando é o código que chama o modelo |
| [02-conceitos-fundamentais](02-conceitos-fundamentais/README.md) | API key, SDK, estrutura de requisição, tokens e custo, streaming, function/tool calling, entrada multimodal, rate limits, segurança |
| [03-demonstracao-guiada](03-demonstracao-guiada/README.md) | Eu escrevo código ao vivo: primeira chamada, streaming, function calling, tratamento de erro, leitura de imagem |
| [04-exercicio-01-primeira-chamada-de-api](04-exercicio-01-primeira-chamada-de-api/README.md) | 🟢 Básico — configurar o projeto do zero e fazer sua primeira chamada de API |
| [05-exercicio-02-streaming](05-exercicio-02-streaming/README.md) | 🟡 Médio — reaproveitar um prompt da Aula 02, agora via API com streaming |
| [06-exercicio-03-function-calling](06-exercicio-03-function-calling/README.md) | 🟠 Complexo — triagem de mensagem via function/tool calling, schema garantido |
| [07-exercicio-04-visao-e-extracao-de-documentos](07-exercicio-04-visao-e-extracao-de-documentos/README.md) | 🔴 Avançado — ler imagem/PDF de um pedido e extrair os dados automaticamente |
| [08-exercicio-final](08-exercicio-final/README.md) | Relatório final da aula + entrega do código-fonte |

## ▶️ Como usar

Siga as pastas na ordem numérica. Diferente das Aulas 01-02, esta aula
**exige setup prévio** — como é presencial, o tempo em sala é curto
demais para instalar coisas do zero.

**Pré-requisitos (fazer ANTES da aula):**

- [Node.js](https://nodejs.org/) instalado (versão LTS mais recente).
- Uma conta e **API key** criada em pelo menos um destes provedores
  (diferente das aulas anteriores, agora precisa ser conta de API, não só
  de chat):
  - [OpenAI Platform](https://platform.openai.com/)
  - [Anthropic Console](https://console.anthropic.com/)
  - [Google AI Studio](https://aistudio.google.com/)
- Ter concluído a Aula 02 (os exercícios de hoje partem diretamente dos
  prompts que você já escreveu lá, principalmente do
  [Exercício 01](<../Aula 02 - Prompt Engineering/04-exercicio-01-role-e-contexto/README.md>)
  e do [Exercício 03](<../Aula 02 - Prompt Engineering/06-exercicio-03-decomposicao-e-structured-output/README.md>)).

## 🎯 Objetivos de aprendizagem

Ao final desta aula, você será capaz de:

- Fazer uma chamada de API a um LLM a partir de código, com autenticação
  segura via variável de ambiente.
- Calcular o custo de uma chamada (e de uma automação em escala) a partir
  do uso de tokens.
- Implementar streaming de resposta.
- Usar function/tool calling para obter saída estruturada **garantida**,
  em vez de apenas pedida no texto do prompt.
- Tratar rate limits com retry e backoff exponencial.
- Aplicar boas práticas de segurança: key fora do código, `.env` no
  `.gitignore`, nunca chamar a API direto do frontend.
- Enviar imagem ou PDF para o modelo e extrair dados estruturados de um
  documento — combinando entrada multimodal com function/tool calling.

## 🏁 Avaliação

O módulo [08-exercicio-final](08-exercicio-final/README.md) fecha a aula
consolidando os quatro exercícios anteriores. Diferente das aulas
anteriores, a entrega inclui **código-fonte**, além do relatório em PDF —
os detalhes de entrega e a rubrica estão no próprio módulo.

**Próxima aula:** Aula 04 — RAG + Embeddings *(em breve)*.
