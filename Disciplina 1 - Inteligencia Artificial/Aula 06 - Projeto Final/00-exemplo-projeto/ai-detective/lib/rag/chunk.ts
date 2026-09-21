import { RAG } from "../config";

// ─────────────────────────────────────────────────────────────────────────────
// AULA 04 · CHUNKING — dividir um documento em pedaços que cabem na busca.
//
// Por que não embutir o documento inteiro? Um vetor só de um documento longo
// "mistura" todos os assuntos e a busca fica imprecisa. Pedaços pequenos e
// focados geram vetores mais fiéis ao que dizem.
//
// A estratégia aqui é simples e boa para textos curtos e logs:
//   1. cada LINHA é uma unidade (um evento de log, um parágrafo de depoimento);
//   2. juntamos linhas até chegar em `maxChars`;
//   3. o começo de cada chunk repete o fim do anterior (`overlapChars`), para
//      uma frase importante não ficar cortada bem na fronteira.
// ─────────────────────────────────────────────────────────────────────────────

/** Uma linha maior que o limite é quebrada por frase (e, em último caso, por palavra). */
function splitLongLine(line: string, maxChars: number): string[] {
  if (line.length <= maxChars) return [line];

  const parts: string[] = [];
  let current = "";
  for (const sentence of line.split(/(?<=[.!?])\s+/)) {
    for (const piece of sentence.length > maxChars ? sentence.split(/\s+/) : [sentence]) {
      if (current && current.length + piece.length + 1 > maxChars) {
        parts.push(current);
        current = piece;
      } else {
        current = current ? `${current} ${piece}` : piece;
      }
    }
  }
  if (current) parts.push(current);
  return parts;
}

export function chunkText(text: string, maxChars = RAG.chunkChars, overlapChars = RAG.overlapChars): string[] {
  const units = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .flatMap((line) => splitLongLine(line, maxChars));

  const chunks: string[] = [];
  let current: string[] = [];
  let length = 0;
  let fresh = 0; // quantas unidades NOVAS (não repetidas do overlap) o chunk atual tem

  for (const unit of units) {
    if (current.length > 0 && length + unit.length + 1 > maxChars) {
      chunks.push(current.join("\n"));

      // Overlap: leva o final do chunk que fechou para o começo do próximo.
      const carry: string[] = [];
      let carried = 0;
      for (let i = current.length - 1; i >= 0; i--) {
        if (carried + current[i].length > overlapChars) break;
        carry.unshift(current[i]);
        carried += current[i].length + 1;
      }
      current = carry;
      length = carried;
      fresh = 0;
    }
    current.push(unit);
    length += unit.length + 1;
    fresh++;
  }

  if (fresh > 0) chunks.push(current.join("\n"));
  return chunks;
}
