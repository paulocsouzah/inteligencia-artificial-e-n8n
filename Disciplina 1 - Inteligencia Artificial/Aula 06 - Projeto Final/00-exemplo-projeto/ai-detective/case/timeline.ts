import type { TimelineEvent } from "@/types";

// Linha do tempo do caso: dado ESTRUTURADO (horário + evento + fonte).
//
// É de propósito que ela seja só fatos crus. Nada de "contradição" ou de
// conclusão escrita aqui: cruzar o depoimento de alguém com o registro de
// crachás é o trabalho do agente. Cada evento aponta as evidências que o
// sustentam (evidenceIds), para o agente poder ler a fonte.
//
// Estrutura x texto: esta tabela é consultada pela tool getTimeline (dado
// estruturado); os documentos são consultados pela tool searchEvidence (RAG,
// texto livre). Um bom projeto usa a ferramenta certa para cada tipo de dado.

export const timeline: TimelineEvent[] = [
  { time: "20:00", title: "Inventário inicial", description: "Item AUR-001 (Diamante Aurora) conferido e presente na vitrine.", evidenceIds: ["inventario"] },
  { time: "20:15", title: "Crachá de Carlos", description: "Crachá C.ALMEIDA-1102 registrado na entrada principal.", evidenceIds: ["registro-crachas"] },
  { time: "21:00", title: "Entrada de visitante", description: "Passe A.MARTINS-VISITA registrado na entrada principal.", evidenceIds: ["registro-crachas"] },
  { time: "21:30", title: "Crachá de Maria", description: "Crachá M.OLIVEIRA-4471 registrado na entrada principal / área de pesquisa.", evidenceIds: ["registro-crachas"] },
  { time: "21:30", title: "Crachá de João", description: "Crachá J.SANTOS-2290 registrado no corredor de serviço do 2º andar.", evidenceIds: ["registro-crachas"] },
  { time: "21:40", title: "Falha na CAM 05", description: "CAM 05 (Ala Aurora) reporta falha técnica intermitente. Chamado #4482 aberto.", evidenceIds: ["registro-seguranca"] },
  { time: "21:56", title: "Alerta de sensor", description: "Sensor de proximidade da Ala Aurora dispara um alerta breve.", evidenceIds: ["registro-seguranca"] },
  { time: "22:03", title: "Saída de visitante", description: "Passe A.MARTINS-VISITA registrado na saída principal.", evidenceIds: ["registro-crachas"] },
  { time: "22:05", title: "CAM 01 — entrada", description: "Câmera da entrada registra silhueta com uniforme de segurança junto à recepção.", evidenceIds: ["camera-entrada"] },
  { time: "22:17", title: "CAM 04 — Corredor B", description: "Câmera do Corredor B registra silhueta com uniforme de segurança junto à escada de serviço.", evidenceIds: ["camera-corredor"] },
  { time: "22:29", title: "Override na vitrine", description: "Código de override utilizado na vitrine da Ala Aurora, credencial M.OLIVEIRA-4471.", evidenceIds: ["registro-seguranca"] },
  { time: "22:31", title: "Acesso à Ala Aurora", description: "Crachá M.OLIVEIRA-4471 registrado na Ala Aurora (acesso restrito).", evidenceIds: ["registro-crachas"] },
  { time: "22:42", title: "Sala de segurança", description: "Crachá C.ALMEIDA-1102 registrado na sala de segurança; CAM 07 registra silhueta com uniforme de segurança na sala.", evidenceIds: ["registro-crachas", "camera-sala-seguranca"] },
  { time: "22:50", title: "Alarme geral", description: "Alarme geral acionado na Ala Aurora.", evidenceIds: ["registro-seguranca"] },
  { time: "23:00", title: "Desaparecimento confirmado", description: "Equipe de segurança confirma visualmente a ausência do item AUR-001.", evidenceIds: ["registro-seguranca", "relatorio-cena-crime", "cena-do-crime"] },
  { time: "23:05", title: "Conferência de inventário", description: "Conferência extraordinária confirma a ausência do item AUR-001.", evidenceIds: ["inventario"] },
];
