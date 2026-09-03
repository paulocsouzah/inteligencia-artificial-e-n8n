# 7. Exercício Final — Relatório da Aula 02

Este módulo fecha a aula. Não há prática nova aqui — é a consolidação, em
um único documento, de tudo que você fez nos três exercícios anteriores.

## 📦 O que entregar

Um **relatório em PDF** contendo:

1. **Identificação:** seu nome e a data.
2. **Contexto e problema real:** suas respostas ao exercício do módulo
   [01-contexto-e-problema-real](../01-contexto-e-problema-real/README.md).
3. **Exercício 01 — Role e Contexto:**
   - Os prints das respostas dos três (ou quatro, se fez o desafio) prompts.
   - A tabela comparativa preenchida.
   - As respostas às perguntas de reflexão.
   - *Opcional:* prints e tabela do desafio dev (revisão de código).
4. **Exercício 02 — Few-shot em Casos Ambíguos:**
   - Os prints das 6 respostas (3 mensagens x zero-shot/few-shot), e do
     desafio no segundo modelo, se você fez.
   - A tabela comparativa preenchida.
   - As respostas às perguntas de reflexão.
   - *Opcional:* prints e tabela do desafio dev (triagem de issues).
5. **Exercício 03 — Decomposição + Structured Output:**
   - Os prints das 5 execuções (3 mensagens + 2 repetições da Mensagem A),
     e do desafio com o prompt ingênuo, se você fez.
   - A tabela comparativa preenchida.
   - As respostas às perguntas de reflexão.
   - *Opcional:* prints e tabela do desafio dev (triagem de falha de
     CI/CD).
6. **Síntese final (obrigatória, ~1 parágrafo):** das cinco técnicas desta
   aula (role, contexto, few-shot, decomposição, structured output), qual
   você acredita que teria o maior impacto se aplicada ao processo real
   que você descreveu na Aula 01
   ([01-contexto-e-problema-real](<../../Aula 01 - Fundamentos de IA e LLMs/01-contexto-e-problema-real/README.md>))?
   Justifique.

## ✅ Rubrica de avaliação

| Critério | Peso |
|---|---|
| Exercício de contexto (módulo 01) respondido | 10% |
| Exercício 01 completo (prints + tabela + reflexão) | 20% |
| Exercício 02 completo (prints + tabela + reflexão) | 25% |
| Exercício 03 completo (prints + tabela + reflexão) | 30% |
| Síntese final — qualidade da conexão entre as técnicas e o cenário real | 15% |

Assim como na Aula 01, não é sobre acertar "a resposta certa" — é sobre
demonstrar que você **testou de verdade**, **observou** o comportamento do
modelo e **raciocinou** sobre ele, especialmente nos casos ambíguos que eu
propositalmente incluí nos exercícios 02 e 03.

**Bônus:** cada exercício tem um "🚀 Desafio dev" opcional (revisão de
código, triagem de issues, triagem de falha de CI/CD) — não é obrigatório
para nota máxima, mas quem fizer os três ganha até **+10%** na nota final
da aula, somados aos 100% acima.

## 📮 Como entregar

Envie o PDF pelo canal que eu indicar (AVA/Canvas da FAEX ou outro meio
combinado com a turma). Nomeie o arquivo como:

```
IA-Aula02-SeuNome.pdf
```

---

**Fim da Aula 02.** Na próxima aula (IA dentro de aplicações), vamos
pegar exatamente o prompt combinado que você construiu no
[Exercício 03](../06-exercicio-03-decomposicao-e-structured-output/README.md)
e colocá-lo dentro de uma aplicação de verdade, via **API** — o JSON que
você validou manualmente aqui vai ser lido, na prática, por uma linha de
código.
