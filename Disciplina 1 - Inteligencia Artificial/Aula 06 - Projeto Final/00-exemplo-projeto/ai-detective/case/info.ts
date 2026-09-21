// ─────────────────────────────────────────────────────────────────────────────
// case/  =  o TEMA do projeto.
//
// Tudo o que descreve o "Caso #001" mora nesta pasta. O resto da aplicação
// (lib/rag, lib/agent, app/, components/) não sabe que o tema é um detetive:
// para criar o SEU projeto, troque o conteúdo de case/ (e reescreva o system
// prompt) — a infraestrutura de RAG e de agente continua a mesma.
// ─────────────────────────────────────────────────────────────────────────────

export const caseInfo = {
  id: "CASO-001",
  title: "O Roubo do Diamante Aurora",
  location: "Museu Imperial — Ala Aurora",
  incidentWindow: "22:00 – 23:00",
  summary:
    "Um raro diamante chamado 'Aurora' desapareceu do Museu Imperial durante uma exposição privada. O roubo teria ocorrido entre 22:00 e 23:00. Quatro pessoas estavam no local: um segurança, uma pesquisadora, um funcionário da limpeza e uma visitante.",
};

// Botões de pergunta rápida que aparecem na tela vazia do chat.
export const starterQuestions = [
  "Quem pode usar o código de override das vitrines?",
  "O depoimento do Carlos bate com as câmeras?",
  "Analise o caso e proponha um suspeito.",
];
