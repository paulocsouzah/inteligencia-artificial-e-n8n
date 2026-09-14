# 1. Contexto e problema real

Na Aula 02, você aprendeu que dar **contexto** no prompt evita que o
modelo "invente" uma resposta — lembra do exemplo da política de
reembolso? Hoje a gente resolve o problema que ficou em aberto ali: e se
a sua empresa tiver **centenas de páginas** de política, FAQ e manual —
como você decide, para cada pergunta, qual pedacinho colar no prompt?

---

## 📚 O limite de colar contexto na mão

No [Exercício 01 da Aula 02](<../../Aula 02 - Prompt Engineering/04-exercicio-01-role-e-contexto/README.md>),
você escreveu a política de reembolso **direto no prompt**, à mão. Isso
funciona quando existe uma política e ela cabe em duas frases. Mas pensa
numa empresa de verdade:

- Um manual de produto com 80 páginas.
- Uma base de FAQ com 300 perguntas já respondidas.
- Um contrato de serviço de 40 páginas, cheio de cláusulas.

Você **não pode** colar tudo isso em todo prompt — não cabe na context
window (lembra da Aula 01?), custa uma fortuna em tokens (lembra da Aula
03?), e mesmo que coubesse, o modelo tende a prestar menos atenção no que
está "no meio" de um texto muito longo.

## 💡 A ideia central do RAG

**RAG** = *Retrieval-Augmented Generation* (Geração Aumentada por
Busca). A ideia, resumida:

```
Pergunta do cliente
       │
       ▼
Busca automática: "qual pedacinho dos meus documentos
                    é relevante pra essa pergunta?"
       │
       ▼
Monta um prompt só com ESSE pedacinho como contexto
       │
       ▼
Manda pro LLM responder (o que você já sabe fazer desde a Aula 03)
```

Em vez de você decidir na mão qual contexto colar (Aula 02) ou tentar
colar tudo (impossível), o sistema **busca automaticamente** o trecho
certo, entre milhares, e só aí monta o prompt. É basicamente automatizar
a parte de "contexto" da Aula 02 — para documentos reais, em escala.

## 🌍 Isso já é o que roda por trás de qualquer "chat com seus documentos"

Todo produto que você já usou do tipo "converse com seu PDF", "pergunte
para a base de conhecimento" ou "assistente que conhece nossos manuais"
(Notion AI respondendo sobre suas próprias páginas, um chatbot de suporte
que cita a política certa, uma ferramenta jurídica que aponta a cláusula
exata de um contrato) é RAG por baixo dos panos — nenhum desses produtos
manda o documento inteiro para o modelo a cada pergunta.

## 🧭 Para onde isso vai

Estendendo a tabela desde a Aula 01:

| Aula | O que construímos sobre o cenário |
|------|----------------------------------------|
| Aula 1 | Entender o "cérebro" (LLM) que vamos usar |
| Aula 2 | Escrever prompts confiáveis, com contexto **escrito à mão** |
| Aula 3 | Fazer o código chamar o modelo sozinho, via API |
| Aula 4 (esta) | Fazer o código **encontrar sozinho** o contexto certo, entre muitos documentos |
| Aula 5 | Um agente decide **quando** buscar, e o que fazer com o resultado |
| n8n | A mesma busca, disparada por um workflow, sem escrever código |

## 🧪 Exercício

Antes de seguir para os conceitos, responda por escrito:

1. No cenário do módulo, imagine que a empresa tem 50 políticas
   diferentes (reembolso, troca, garantia, frete, cancelamento...). Se
   você tivesse que colar a política certa no prompt **manualmente**,
   como você decidiria qual colar, para cada mensagem de cliente
   diferente? Por que isso não escala?
2. Pense numa base de conhecimento que você já usou (FAQ de um site,
   documentação de uma ferramenta, manual de produto). Se você tivesse
   que construir um assistente que responde perguntas sobre ela, por que
   simplesmente "colar tudo no prompt" não funcionaria?
3. Qual a diferença entre um sistema que **sabe** a resposta porque
   "decorou" durante o treinamento (conhecimento paramétrico, lembra da
   Aula 01?) e um sistema que **busca** a resposta num documento real
   antes de responder? Qual dos dois você confiaria mais para responder
   sobre a política **atual** da sua empresa (que pode ter mudado semana
   passada)?

**Próximo passo:** [02-conceitos-fundamentais](../02-conceitos-fundamentais/README.md)
