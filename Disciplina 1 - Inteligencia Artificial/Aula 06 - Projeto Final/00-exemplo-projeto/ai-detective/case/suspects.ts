import type { Suspect } from "@/types";

// Perfis dos suspeitos — só quem são e qual o papel no museu.
//
// Repare no que NÃO está aqui: nível de suspeita, "motivo da avaliação" ou o
// depoimento. O depoimento vive no documento (case/evidence.ts) e a conclusão
// é trabalho do agente. Se o dado já trouxer a resposta pronta, a IA só
// repete o gabarito — e não há o que investigar.

export const suspects: Suspect[] = [
  {
    id: "carlos-almeida",
    name: "Carlos Almeida",
    role: "Segurança do museu",
    initials: "CA",
    description:
      "Segurança terceirizado, trabalha no Museu Imperial há 6 anos. Tem crachá de acesso a quase todas as áreas, incluindo a sala de segurança e os corredores internos.",
  },
  {
    id: "maria-oliveira",
    name: "Maria Oliveira",
    role: "Pesquisadora",
    initials: "MO",
    description:
      "Pesquisadora convidada para catalogar o diamante Aurora antes da exposição privada. Teve acesso liberado à área restrita nos dias anteriores ao evento e conhece o funcionamento do sistema de segurança da Ala Aurora.",
  },
  {
    id: "joao-santos",
    name: "João Santos",
    role: "Funcionário da limpeza",
    initials: "JS",
    description:
      "Funcionário da equipe de limpeza terceirizada, responsável pela manutenção dos corredores e salas do segundo andar durante eventos noturnos.",
  },
  {
    id: "ana-martins",
    name: "Ana Martins",
    role: "Visitante",
    initials: "AM",
    description:
      "Visitante convidada para a exposição privada, entusiasta de joalheria e colecionismo. Foi vista próxima à vitrine do Aurora minutos antes do fechamento.",
  },
];
