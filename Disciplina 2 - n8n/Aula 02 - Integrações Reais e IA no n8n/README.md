# 🔌🧠 Aula 02 — Integrações Reais e IA no n8n

**Formato:** Online

Na Aula 01 você construiu a porta de entrada do AI Customer Service: um
webhook que recebe, organiza e responde. Mas ele só conversava com quem o
chamava — ele não saía para buscar nada em lugar nenhum. Hoje ele sai de casa.

Eu vim para esta aula com um plano diferente do que estava no meu roteiro
original. Depois de ver vocês trabalhando na Aula 01, ficou claro que a
turma já chega sabendo n8n — vocês pegaram trigger, node, JSON e expression
rápido, e o exercício da porta de entrada saiu redondo. Então em vez de eu
passar uma aula inteira só em "GET, POST, header, API Key" de forma
abstrata, eu vou direto ao que dá trabalho de verdade: **fazer o n8n
conversar com uma API de verdade, autenticar direito, tratar a página 2 dos
resultados que não coube na página 1** — e, porque vocês já sabem IA da
Disciplina 1, ligar uma IA de verdade dentro do fluxo, hoje, não daqui a duas
aulas.

O projeto da aula: um workflow que **lê o e-mail que chega na sua caixa de
entrada do Gmail, manda o conteúdo para uma IA analisar, e responde o
cliente sozinho** — ou encaminha para um humano, se a IA não tiver certeza.
É a peça que eu ia guardar para a Aula 04. Vocês adiantaram.

## 📚 Estrutura

| Pasta | Conteúdo |
|-------|----------|
| [01-contexto-e-problema-real](01-contexto-e-problema-real/README.md) | Por que "chamar uma API" é o trabalho mais comum — e mais mal feito — de uma automação |
| [02-ambiente-n8n-na-aws](02-ambiente-n8n-na-aws/README.md) | **Terraform:** o mesmo ambiente da Aula 01, agora com um proxy reverso e HTTPS — obrigatório para o Google aceitar o login do Gmail |
| [03-conceitos-fundamentais](03-conceitos-fundamentais/README.md) | REST, headers, API Key, Bearer Token, OAuth2, paginação, credenciais no n8n, e como uma IA cabe nesse mesmo vocabulário |
| [04-demonstracao-guiada](04-demonstracao-guiada/README.md) | Eu construo ao vivo: de uma chamada GET simples até o pipeline Gmail → IA → resposta automática |
| [05-exercicio-01-consumindo-uma-api-publica](05-exercicio-01-consumindo-uma-api-publica/README.md) | 🟢 Básico — GET numa API real, com e sem autenticação, e o que muda |
| [06-exercicio-02-paginacao-e-bearer-token](06-exercicio-02-paginacao-e-bearer-token/README.md) | 🟡 Médio — Bearer Token e a paginação nativa do node HTTP Request |
| [07-exercicio-03-chamando-uma-llm-por-api](07-exercicio-03-chamando-uma-llm-por-api/README.md) | 🟡 Médio/🟠 Complexo — chamar uma LLM "na mão" via HTTP Request, e depois com o node pronto |
| [08-exercicio-04-gmail-oauth2](08-exercicio-04-gmail-oauth2/README.md) | 🟠 Complexo — credencial OAuth2 do Gmail e a leitura do primeiro e-mail de verdade |
| [09-exercicio-final](09-exercicio-final/README.md) | 🎯 **O projeto da aula:** Gmail → IA analisa → decide → responde ou escala. Relatório final |

## ▶️ Como usar

Siga as pastas na ordem numérica. O módulo 02 você só precisa refazer se não
tiver mais a EC2 da Aula 01 de pé — se ela ainda está no ar, você só
**acrescenta** o que este módulo pede (o proxy HTTPS) e segue.

**Pré-requisitos:**

- Ter feito a Aula 01 (workflow, trigger, node, JSON, expression, webhook).
- Ambiente n8n no ar (EC2 da Aula 01, com HTTPS acrescentado — módulo 02).
- Uma conta Gmail que você possa usar para os exercícios (crie uma de teste
  se não quiser usar a pessoal — você vai autorizar um app a ler e enviar
  e-mails nela).
- Uma chave de API de uma LLM (OpenAI ou outro provedor com API compatível).
  Se você já tem uma da Disciplina 1, é a mesma.
- Um terminal com `curl`.

**Não conseguiu configurar o Gmail a tempo?** O módulo 08 tem um plano B:
simular a caixa de entrada com um webhook que recebe um "e-mail" em JSON.
Você perde a parte de OAuth2 de verdade, mas continua fazendo a IA analisar
e responder.

## 🎯 Objetivos de aprendizagem

Ao final desta aula, você será capaz de:

- Explicar a diferença entre **API Key**, **Bearer Token** e **OAuth2**, e
  dizer, olhando a documentação de uma API, qual delas ela usa.
- Montar uma chamada HTTP no n8n com **headers**, **autenticação** e
  **paginação**, usando o node **HTTP Request** — e guardar segredos numa
  **credencial**, nunca dentro do node.
- Configurar uma credencial **OAuth2** de verdade (Gmail) e explicar por que
  ela exige HTTPS, ao contrário de uma API Key.
- Chamar uma API de LLM a partir do n8n — primeiro "na mão" (HTTP Request),
  depois com o node pronto — e pedir uma **saída estruturada** (JSON) em vez
  de texto solto.
- Reconhecer os erros mais comuns de integração: `401` (autenticação),
  `403` (permissão), `429` (limite de taxa) e uma resposta de IA que não é o
  JSON que você pediu.
- Explicar o risco de **prompt injection** quando o conteúdo que vai para a
  IA vem de fora (um e-mail de qualquer pessoa) — e o que fazer a respeito.
- Montar um pipeline completo: **gatilho → IA analisa → decide → age**, com
  um humano no circuito para os casos em que a IA não tem certeza.

## 🏁 Avaliação

O módulo [09-exercicio-final](09-exercicio-final/README.md) fecha a aula. Você
entrega um **relatório em PDF** com os prints e as respostas às perguntas de
reflexão, **mais** os workflows exportados em JSON. Os detalhes e a rubrica
estão no próprio módulo.

**Próxima aula:** [Aula 03 — Workflows avançados e IA com rede de proteção](<../Aula 03 - Workflows Avançados e IA com Rede de Proteção/README.md>).
