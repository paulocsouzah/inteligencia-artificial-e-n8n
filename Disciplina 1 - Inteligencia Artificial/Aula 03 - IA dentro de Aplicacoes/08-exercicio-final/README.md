# 8. Exercício Final — Relatório da Aula 03

Este módulo fecha a aula. A partir de hoje, a entrega muda um pouco: além
do relatório em PDF, você também entrega o **código-fonte** que
escreveu — é a primeira aula do módulo com código de verdade.

## 📦 O que entregar

### 1. Código-fonte

Uma pasta (ou repositório) com todos os scripts que você escreveu
(`index.js`, `streaming.js`, `triagem.js`, `visao-imagem.js`,
`visao-pdf.js`, e os desafios, se fez). **Não inclua** `node_modules/`
nem `.env` — só o código. Duas formas aceitas:

- Um `.zip` da pasta do projeto (sem `node_modules/`, sem `.env`).
- Um link de repositório no GitHub (público ou com acesso liberado para
  mim), com um `.gitignore` correto.

### 2. Relatório em PDF, contendo

1. **Identificação:** seu nome e a data.
2. **Contexto e problema real:** suas respostas ao exercício do módulo
   [01-contexto-e-problema-real](../01-contexto-e-problema-real/README.md).
3. **Exercício 01 — Primeira Chamada de API:**
   - Print da execução (resposta + `usage`).
   - A tabela comparativa preenchida (incluindo o desafio, se fez).
   - As respostas às perguntas de reflexão.
4. **Exercício 02 — Streaming + Prompt Engineering Aplicado:**
   - Print da execução com streaming.
   - A tabela comparativa preenchida.
   - As respostas às perguntas de reflexão.
5. **Exercício 03 — Function/Tool Calling:**
   - Prints das 5 execuções (3 mensagens + 2 repetições da Mensagem A).
   - A tabela comparativa preenchida.
   - As respostas às perguntas de reflexão.
   - *Opcional:* prints e resultado do desafio dev (triagem de CI/CD).
6. **Exercício 04 — Visão Computacional:**
   - Prints das duas execuções (imagem e PDF).
   - A tabela comparativa preenchida (incluindo custo de cada caminho).
   - As respostas às perguntas de reflexão.
   - *Opcional:* print do desafio (extração numa foto real).
7. **Síntese final (obrigatória, ~1 parágrafo):** escolha **um** dos dois
   pontos abaixo para desenvolver:
   - Compare o Exercício 03 desta aula com o Exercício 03 da Aula 02 — o
     que mudou, na prática, ao sair do "prompt implorado, validado no
     olho" para "schema garantido pela API"?
   - Ou: pensando no Exercício 04, que outro tipo de documento (do seu
     trabalho ou de um projeto pessoal) você automatizaria a leitura, e
     que cuidado de segurança/custo você teria que considerar antes de
     colocar isso em produção?

## ✅ Rubrica de avaliação

| Critério | Peso |
|---|---|
| Exercício de contexto (módulo 01) respondido | 10% |
| Exercício 01 completo (código + print + tabela + reflexão) | 10% |
| Exercício 02 completo (código + print + tabela + reflexão) | 15% |
| Exercício 03 completo (código + prints + tabela + reflexão) | 25% |
| Exercício 04 completo (código + prints + tabela + reflexão) | 25% |
| Síntese final — qualidade da reflexão | 15% |

**Bônus:** o desafio dev do Exercício 03 (triagem de CI/CD) e/ou o
desafio do Exercício 04 (extração numa foto real) valem até **+10%**
juntos na nota final da aula.

Diferente das aulas anteriores, aqui eu também olho para a **qualidade do
código**: se o `.env` está fora do controle de versão, se há tratamento
de erro, se o código roda sem erro na primeira tentativa. Não precisa ser
código "bonito" — precisa **funcionar** e não vazar a sua API key.

## 📮 Como entregar

Envie o PDF **e** o código (zip ou link de repositório) pelo canal que eu
indicar. Nomeie o PDF como:

```
IA-Aula03-SeuNome.pdf
```

---

**Fim da Aula 03.** Na próxima aula (RAG + Embeddings), a mesma chamada
de API que você escreveu hoje ganha um passo antes: em vez de você
escrever o contexto na mão (como fizemos com a política de reembolso),
o código vai **buscar** o trecho certo de um documento real e montar o
prompt sozinho.
