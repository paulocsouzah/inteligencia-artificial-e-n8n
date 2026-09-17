# 1. Contexto e problema real

Até aqui, vocês construíram IA **para o cliente** da loja: um sistema que
triava mensagens (Aula 03), buscava a política certa (Aula 04). Hoje a
câmera vira: o e-commerce que vocês vêm construindo desde a Aula 03 está
em produção, alguém precisa mantê-lo no ar — e esse alguém, hoje, é
vocês.

---

## 📟 3h da manhã, o pager toca

Cenário clássico de quem trabalha com sistema em produção: um alerta
dispara, alguma rota está devolvendo erro 500 pros clientes, e você (o
engenheiro de plantão) precisa descobrir **por quê**, rápido. O processo
manual de sempre:

1. Abrir os logs, filtrar pelo horário do alerta.
2. Achar o stack trace, identificar o arquivo e a linha.
3. Abrir o código, entender o que aquele trecho faz.
4. Talvez precisar checar o banco — o dado que chegou ali era inesperado?
5. Talvez precisar checar a documentação/runbook — isso já aconteceu
   antes? Tem um procedimento conhecido?
6. Só então formular uma hipótese de causa raiz.

Isso é **exatamente** o tipo de tarefa repetitiva, baseada em busca e
correlação de informação, que motivou tudo que vocês aprenderam neste
módulo — só que agora o "cliente" que precisa de uma resposta rápida é
você mesmo, às 3h da manhã.

## 🧩 Por que isso não é só "mais RAG"

Você poderia pensar: "isso é só um RAG sobre os logs" (Aula 04). Não é —
e a diferença importa. Um RAG busca **sempre**, num único tipo de fonte
(o vector store). Mas o passo 4 acima ("talvez precise checar o banco")
tem um **talvez**: depende do que os logs mostrarem no passo 2. Você não
sabe, antes de começar a investigação, quais das 5 fontes de informação
(código, logs, banco, documentação — e possivelmente métricas de
infraestrutura) vai precisar, nem em que ordem. Cada bug é um caminho
diferente:

| Sintoma | Fontes que provavelmente importam |
|---|---|
| Erro 500 intermitente | Logs → Código (do trecho que quebrou) → Documentação (esse caso já é conhecido?) |
| Lentidão numa rota | Logs (tempo de resposta) → Código (tem uma consulta repetida?) |
| Pico de erros nos logs num horário específico | Só logs, mas com muita correlação temporal |
| Suspeita de vulnerabilidade | Código, direto — nenhuma outra fonte ajuda |
| Inconsistência de dados | Banco, direto — e às vezes o código que grava lá |

Uma regra fixa do tipo "sempre checar logs → sempre checar banco →
sempre checar código, nessa ordem" (um **workflow determinístico** —
termo que formalizamos já no próximo módulo) desperdiça chamadas nos
casos em que a causa é só de código, e erra a ordem nos casos em que só
os logs já bastavam. É o mesmo problema de "sempre fazer a mesma coisa"
que vocês já viram nas Aulas 03 e 04 — só que agora com **cinco**
ferramentas possíveis, não duas.

## 💡 O que muda hoje

Em vez de você (ou um script) decidir o roteiro da investigação, o
**modelo** decide — ele recebe as ferramentas (buscar no código, ler um
arquivo, consultar os logs, consultar o banco, consultar a documentação)
e, mensagem a mensagem, raciocina sobre qual usar, com quais argumentos,
e quando já tem o suficiente para apontar uma causa raiz. Isso é um **AI
Agent**, e é o assunto do resto da aula.

## 🧭 Para onde isso vai

Estendendo a tabela desde a Aula 01:

| Aula | O que construímos sobre o cenário |
|------|----------------------------------------|
| Aula 1 | Entender o "cérebro" (LLM) que vamos usar |
| Aula 2 | Escrever prompts confiáveis, com contexto **escrito à mão** |
| Aula 3 | Fazer o código chamar o modelo sozinho, via API — e chamar **uma** ferramenta certa |
| Aula 4 | Fazer o código encontrar sozinho o contexto certo, entre muitos documentos |
| Aula 5 (esta) | Um agente **decide** quando investigar, o quê, e com quais ferramentas — sobre o próprio sistema que vocês construíram |
| n8n | O mesmo raciocínio, orquestrado por um workflow visual |

## 🧪 Exercício

Antes de seguir para os conceitos, responda por escrito:

1. Descreva, com suas próprias palavras, uma vez em que você (ou alguém
   que você conhece) precisou investigar um problema técnico "quebra-
   cabeça" — juntando pistas de mais de uma fonte (logs, código,
   configuração, banco) até achar a causa. Quais fontes você consultou, e
   em que ordem?
2. Por que uma regra fixa ("sempre checa logs, depois banco, depois
   código, nessa ordem") falharia num caso onde o bug é puramente de
   código (ex.: uma vulnerabilidade)? E num caso onde só os logs já
   bastam?
3. Pensa nas cinco fontes de informação da tabela acima (código, logs,
   banco, documentação, métricas). Qual delas você imagina ser a **mais
   arriscada** de dar a um agente sem supervisão — e por quê?
4. Repare que consultar o banco, aqui, é diferente de "confiar no que o
   sistema mostra pro cliente" — é **investigar por trás da cortina**.
   Que tipo de informação um engenheiro vê que um cliente nunca veria?

**Próximo passo:** [02-conceitos-fundamentais](../02-conceitos-fundamentais/README.md)
