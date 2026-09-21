# 7. Entrega e avaliação

Este módulo fecha a aula — e a disciplina. Diferente das Aulas 03, 04 e
05, **não há relatório em PDF**. Tudo o que eu preciso ver está dentro
do repositório do seu projeto.

---

## 📦 O que entregar

**O link do repositório no GitHub.** Só isso. Um envio por equipe.

- O repositório pode ser **público**, ou **privado com convite** para o
  meu usuário (`paulocsouzah`) com permissão de leitura.
- Sugestão de nome: `ia-projeto-final-<tema>` (por exemplo,
  `ia-projeto-final-tutor-de-sql`).
- Junto com o link, mande: o **nome do tema** e o **nome de todos os
  integrantes**, pelo canal que eu indicar.
- Eu avalio o que estiver na branch `main` no prazo que eu combinei com
  a turma. Quando fechar a versão final, crie uma tag (`git tag v1.0 &&
  git push --tags`) para deixar claro qual é ela.

**Não inclua** no repositório: `node_modules/`, `.env`, `terraform.tfvars`,
`*.pem`, nem nenhum arquivo com dado pessoal real.

## 📄 O README do seu projeto

O README do repositório é a sua "apresentação". É por ele que eu vou
começar, e é ele que eu vou seguir para rodar o projeto. Precisa ter,
**nesta ordem**:

```markdown
# Nome do Projeto

Uma frase dizendo o que ele faz.

## Equipe
| Nome | GitHub | Responsabilidade principal |
|---|---|---|

## O problema e a solução
(3-6 linhas: quem usa, qual dor resolve, como o sistema ajuda)

## Demonstração
(Um print ou GIF do sistema funcionando, e um exemplo de pergunta
e resposta)

## Como rodar
(Passo a passo do zero: pré-requisitos, `npm install`, como criar o
`.env` a partir do `.env.example`, como popular os dados, comando para
subir. Tem que funcionar copiando e colando.)

## Variáveis de ambiente
(Tabela: nome, obrigatória?, para que serve)

## Arquitetura
(Um diagrama simples — pode ser em texto — e um parágrafo explicando)

## Mapa de requisitos
| Requisito | Onde está no código | Como funciona (1-2 linhas) |
|---|---|---|
| 1. LLM por API, só no backend | `caminho/arquivo` | ... |
| 2. Prompt Engineering | ... | ... |
| 3. Structured Output | ... | ... |
| 4. Function Calling | ... | ... |
| 5. RAG ou Agente (qual dos dois?) | ... | ... |
| 6. Guardrails (quais três?) | ... | ... |
| 7. Engenharia básica | ... | ... |
| Bônus (se houver) | ... | ... |

## Testes e casos difíceis
(A tabela do módulo 05: perguntas, resposta esperada, resposta obtida,
e os três casos difíceis — fora do escopo, sem resposta nos dados,
documento malicioso)

## Decisões e limitações
(O que vocês decidiram fazer e por quê. O que **não** funciona bem. O
que fariam com mais tempo. Seja honesto: isso vale nota.)

## Deploy na AWS (se fez a parte de Cloud)
(O que foi criado, como reproduzir, prints em `docs/`)
```

A tabela **"Mapa de requisitos"** é a parte mais importante: ela me
aponta direto para o código de cada item, e mostra que **vocês**
sabem onde cada técnica está. Se ela estiver preenchida com cuidado, a
minha avaliação fica muito mais rápida — e a sua nota, mais justa.

## ✅ Rubrica de avaliação

| Critério | Peso | O que eu olho |
|---|---|---|
| **Tema, problema e proposta** | 10% | O problema é claro, o escopo cabe no projeto, o tema justifica as técnicas escolhidas |
| **Prompt Engineering** | 10% | System prompt com papel, contexto, regras e formato; regra explícita de recusa; evidência de que foi testado e refinado |
| **Structured Output e Function Calling** | 15% | Schema definido, validação em código, tools bem descritas e executadas no servidor |
| **RAG ou Agente** | 25% | O pipeline (RAG) ou o loop (agente) funciona de verdade; a escolha foi justificada pelo problema; observabilidade ou citação de fonte |
| **Guardrails e uso responsável** | 15% | Pelo menos três guardrails implementados **e testados**, incluindo o caso do documento malicioso |
| **Engenharia e README** | 20% | Roda seguindo o README, chave fora do Git, `.env.example`, tratamento de erro, código organizado, histórico de commits com todos os integrantes |
| **Decisões e limitações** | 5% | A seção é honesta: mostra que a equipe entende o que fez e onde o sistema falha |

**Bônus** (até o teto de 100): Cloud na AWS (até +10), RAG e agente
juntos (+3), testes automatizados (+3), visão ou PDF (+3), streaming
(+2) e modo mock (+2). A descrição de cada um está no [módulo
03](../03-requisitos-do-projeto/README.md) e a de Cloud, no
[módulo 06](../06-cloud-opcional-na-aws/README.md).

### O que tira pontos

| Situação | Desconto |
|---|---|
| Chave de API em qualquer commit do histórico | −10 pontos |
| Dado pessoal real no repositório | −10 pontos |
| O projeto não roda seguindo o README | −15 pontos |
| Integrante sem nenhum commit no histórico | a equipe é chamada para explicar a divisão do trabalho antes da nota final |

## 🤖 E se eu usar um assistente de código?

Pode. GitHub Copilot, Claude, ChatGPT, Cursor — usar ferramentas de IA
para programar um projeto de IA é uma prática normal do mercado, e eu
mesmo uso. Mas tem uma condição: **você precisa entender o que está no
seu repositório**. Eu posso escolher qualquer trecho e pedir para você
explicar o que ele faz e por que foi feito daquele jeito. Se a sua
resposta for "não sei, a IA que escreveu", esse trecho não conta como
seu.

## 🧭 Checklist final antes de enviar

- [ ] Clonei o repositório numa **pasta nova** e segui o meu próprio
      README do zero. Funcionou.
- [ ] `git log` mostra commits de **todos** os integrantes.
- [ ] Não há `.env`, `node_modules`, `terraform.tfvars` nem `*.pem` no
      repositório (confirmado com `git ls-files`).
- [ ] Busquei no histórico por qualquer chave (`git log -p | grep -i
      "sk-"`) e não achei nada.
- [ ] O "Mapa de requisitos" está preenchido, com caminhos de arquivo
      reais.
- [ ] A seção "Decisões e limitações" existe e é honesta.
- [ ] Se fiz Cloud: os prints estão em `docs/` e a seção "Deploy na AWS"
      está no README.
- [ ] Criei a tag `v1.0` e enviei o link, o tema e os nomes.

---

**Fim da Aula 06 — e da disciplina de Inteligência Artificial.** Em seis
aulas, você percorreu o caminho completo: entender o modelo (Aula 01),
escrever prompts confiáveis (Aula 02), chamar o modelo por código com
formato garantido (Aula 03), fazer o sistema encontrar sozinho o contexto
certo (Aula 04), deixar o modelo decidir o próprio caminho com
guardrails (Aula 05) — e agora juntar tudo num produto seu, de um tema
que você escolheu. Na disciplina de
[n8n](<../../../Disciplina 2 - n8n/README.md>), eu vou te mostrar como
**conectar** essas capacidades a processos, APIs e sistemas reais, e o
mesmo raciocínio de agente vira um nó visual — sem escrever o loop na
mão.
