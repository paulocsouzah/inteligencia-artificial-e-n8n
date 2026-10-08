# 🛡️ Aula 03 — Workflows Avançados e IA com Rede de Proteção

**Formato:** Online

Na Aula 02 você construiu um pipeline que funciona — e eu fui honesto com
você sobre um problema que ficou em aberto: o `If` que decide "responder
sozinho ou escalar" só olha três campos, a chamada para a LLM não tem
nenhuma defesa se a API cair ou demorar, e se o modelo devolver um JSON
mal formado, o seu workflow simplesmente quebra. Hoje eu fecho essas
lacunas.

Esta aula tem duas partes que se apoiam uma na outra. Primeiro, o
**controle de fluxo** que todo workflow de verdade precisa: `Switch` para
rotear por mais de dois caminhos, `Merge` para juntar dados de fontes
diferentes, `Loop Over Items` para processar em lotes sem estourar memória
nem limite de API. Depois, a **blindagem**: o que fazer quando a chamada
de IA falha, demora, custa mais do que devia, ou devolve algo que não é o
que você pediu — com retry, timeout, validação de saída e um
**Error Workflow** central que pega qualquer coisa que escapar.

O projeto da aula pega o pipeline Gmail → IA → decide → responde da Aula
02 e o torna **robusto**: roteamento por `Switch` (não só dois caminhos),
a chamada de IA virando um **sub-workflow reutilizável** com retry e
validação embutidos, e um Error Workflow que garante que nenhuma falha
passe em silêncio.

## 📚 Estrutura

| Pasta | Conteúdo |
|-------|----------|
| [01-contexto-e-problema-real](01-contexto-e-problema-real/README.md) | O "caminho feliz" sempre funciona na demonstração — e sempre quebra em produção. Dois casos reais de automação que precisou aguentar volume e falha |
| [02-ambiente-n8n-na-aws](02-ambiente-n8n-na-aws/README.md) | O mesmo ambiente da Aula 02, sem mudanças de infraestrutura — hoje a complexidade é toda dentro do workflow |
| [03-conceitos-fundamentais](03-conceitos-fundamentais/README.md) | Switch, Merge, Loop Over Items, Filter, Error Handling (retry/timeout por node), Error Trigger, Sub-workflows — e como isso tudo protege uma chamada de IA |
| [04-demonstracao-guiada](04-demonstracao-guiada/README.md) | Eu construo ao vivo: rotas com Switch, um lote que processa sem travar, uma API que falha de propósito, e o Error Workflow pegando a queda |
| [05-exercicio-01-if-para-switch](05-exercicio-01-if-para-switch/README.md) | 🟢 Básico — trocar um `If` encadeado por um `Switch` de verdade |
| [06-exercicio-02-merge-e-loop](06-exercicio-02-merge-e-loop/README.md) | 🟡 Médio — juntar duas fontes com `Merge` e processar em lotes com `Loop Over Items` |
| [07-exercicio-03-blindando-a-chamada-de-ia](07-exercicio-03-blindando-a-chamada-de-ia/README.md) | 🟡/🟠 — retry, timeout e validação de schema numa chamada de LLM que eu vou fazer falhar de propósito |
| [08-exercicio-04-error-workflow-e-sub-workflows](08-exercicio-04-error-workflow-e-sub-workflows/README.md) | 🟠 Complexo — um Error Workflow central e a chamada de IA virando sub-workflow |
| [09-exercicio-final](09-exercicio-final/README.md) | 🎯 **O projeto da aula:** o pipeline da Aula 02 ganha Switch, sub-workflow blindado e rede de proteção contra falha silenciosa |

## ▶️ Como usar

Siga as pastas na ordem numérica. Esta aula **não precisa de ambiente
novo**: se a sua EC2 da Aula 02 ainda está de pé, use ela; se não, o
módulo 02 te leva a recriá-la com o mesmo Terraform de sempre — hoje eu
não acrescentei nada na infraestrutura, porque todo o conteúdo novo mora
dentro do workflow, não no servidor.

**Pré-requisitos:**

- Ter feito a Aula 02 (REST, autenticação, e o pipeline de IA do projeto
  final) — você vai evoluir esse mesmo workflow hoje.
- Ambiente n8n no ar (mesmo da Aula 02).
- Sua chave de API de LLM e, se quiser reproduzir o módulo 08 por completo,
  acesso de novo ao Gmail configurado na Aula 02.

## 🎯 Objetivos de aprendizagem

Ao final desta aula, você será capaz de:

- Escolher entre `If` e `Switch` olhando o número de caminhos possíveis, e
  explicar por que encadear vários `If` é um cheiro de código (ou de
  workflow).
- Configurar um `Merge` nos seus diferentes modos (Append, Combine,
  Choose Branch) e prever o resultado de cada um.
- Usar `Loop Over Items` para processar uma lista grande em lotes, e
  explicar por que isso existe (memória, rate limit).
- Configurar **retry** e **timeout** por node, e explicar a diferença
  entre um erro que vale a pena tentar de novo e um que não vale.
- Validar a saída de uma LLM contra um formato esperado **antes** de
  confiar nela, e decidir o que fazer quando ela não bate.
- Criar um **Error Workflow** e explicar por que ele existe separado do
  workflow principal.
- Extrair um pedaço de workflow para um **Sub-workflow** reutilizável, e
  passar dados entre o workflow principal e ele.
- Reconhecer, olhando um workflow pronto, **onde** ele vai quebrar
  silenciosamente antes de você testar.

## 🏁 Avaliação

O módulo [09-exercicio-final](09-exercicio-final/README.md) fecha a aula.
Relatório em PDF com prints e respostas, mais os workflows exportados em
JSON. Rubrica no próprio módulo.

**Próxima aula:** [Aula 04 — IA aprofundada no n8n](<../Aula 04 - IA Aprofundada no n8n/README.md>).
