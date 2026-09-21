import { test } from "node:test";
import assert from "node:assert/strict";
import { chunkText } from "../lib/rag/chunk";

// Testes da AULA 04 · chunking. Rodam sem banco e sem OpenAI: `npm test`.

test("texto curto vira um chunk só", () => {
  assert.deepEqual(chunkText("linha 1\nlinha 2", 200, 50), ["linha 1\nlinha 2"]);
});

test("texto vazio não gera chunks", () => {
  assert.deepEqual(chunkText("  \n \n", 200, 50), []);
});

test("nenhum chunk passa muito do limite e nenhuma linha se perde", () => {
  const lines = Array.from({ length: 30 }, (_, i) => `${20 + i}:00 — evento número ${i} do registro`);
  const chunks = chunkText(lines.join("\n"), 200, 60);

  assert.ok(chunks.length > 1, "deveria ter dividido em mais de um chunk");
  for (const chunk of chunks) assert.ok(chunk.length <= 200 + 60 + 10, `chunk grande demais: ${chunk.length}`);

  const joined = chunks.join("\n");
  for (const line of lines) assert.ok(joined.includes(line), `perdeu a linha: ${line}`);
});

test("o overlap repete o fim de um chunk no começo do próximo", () => {
  const lines = Array.from({ length: 12 }, (_, i) => `linha ${String(i).padStart(2, "0")} com um texto qualquer`);
  const chunks = chunkText(lines.join("\n"), 120, 60);

  for (let i = 1; i < chunks.length; i++) {
    const lastLineOfPrevious = chunks[i - 1].split("\n").at(-1)!;
    assert.ok(chunks[i].startsWith(lastLineOfPrevious), `chunk ${i} deveria começar repetindo "${lastLineOfPrevious}"`);
  }
});

test("uma linha maior que o limite é quebrada por frase", () => {
  const longLine = "Primeira frase do depoimento. Segunda frase do depoimento. Terceira frase do depoimento.";
  const chunks = chunkText(longLine, 45, 0);

  assert.ok(chunks.length >= 2);
  assert.equal(chunks.join(" ").replace(/\s+/g, " "), longLine);
});
