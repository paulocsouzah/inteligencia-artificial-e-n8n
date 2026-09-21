import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import type { EvidenceCategory, EvidenceMeta } from "@/types";
import { AppError } from "../errors";
import { MAX_UPLOAD_BYTES } from "../config";
import { visionPrompt } from "../../case/prompt";
import { chunkText } from "./chunk";
import { embedTexts } from "./embed";
import { saveEvidence, replaceChunks } from "./store";
import { extractPdfText } from "./pdf";
import { describeImage } from "./vision";
import { UPLOADS_DIR, mimeFor } from "./files";

// ─────────────────────────────────────────────────────────────────────────────
// AULA 04 · INGESTÃO — o caminho de UM documento até virar "buscável".
//
//   arquivo → texto → chunks → embeddings → banco
//
// É usada em dois lugares: pelo script `npm run ingest` (as evidências do caso)
// e pelo upload feito na tela (uma evidência nova, em tempo de execução).
// ─────────────────────────────────────────────────────────────────────────────

/** Transforma o texto de uma evidência em chunks vetorizados e grava tudo. Devolve quantos chunks gerou. */
export async function ingestEvidence(meta: EvidenceMeta, content: string): Promise<number> {
  // Cada chunk leva o título do documento na frente. Sem isso, um trecho solto
  // como "22:31 — M.OLIVEIRA-4471 — Ala Aurora" perderia a informação de que
  // vem do registro de crachás — e a busca ficaria pior.
  const pieces = chunkText(content).map((chunk) => `[${meta.title}]\n${chunk}`);

  // Primeiro gera os embeddings (a parte que pode falhar: rede, chave, limite de
  // uso) e SÓ DEPOIS grava. Se a ordem fosse a inversa, uma falha deixaria uma
  // evidência no banco sem nenhum chunk — "indexada", mas invisível para a busca.
  const embeddings = await embedTexts(pieces);
  await saveEvidence(meta, content);
  await replaceChunks(meta.id, pieces, embeddings);

  return pieces.length;
}

/** Lê o arquivo de uma evidência e devolve o texto que será indexado (PDF → texto; imagem → descrição). */
export async function readEvidenceText(meta: EvidenceMeta, buffer: Buffer): Promise<string> {
  if (meta.kind === "pdf") return extractPdfText(buffer);
  return describeImage(buffer, mimeFor(meta.filename), visionPrompt(meta.title));
}

/** Upload feito na tela: valida, guarda o arquivo, extrai o texto e ingere. */
export async function ingestUpload(file: File): Promise<EvidenceMeta> {
  const isPdf = file.type === "application/pdf";
  const isImage = ["image/jpeg", "image/png", "image/webp"].includes(file.type);
  if (!isPdf && !isImage) throw new AppError("INVALID_FILE", 400);
  if (file.size > MAX_UPLOAD_BYTES) throw new AppError("FILE_TOO_LARGE", 413);

  const id = `upload-${randomUUID().slice(0, 8)}`;
  const ext = isPdf ? "pdf" : file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const category: EvidenceCategory = isPdf ? "relatorio" : "camera";

  const meta: EvidenceMeta = {
    id,
    kind: isPdf ? "pdf" : "image",
    category,
    title: file.name || "Evidência enviada",
    filename: `${id}.${ext}`, // nome gerado pelo servidor: nunca confie no nome que o usuário mandou
    description: "Evidência enviada durante a investigação.",
    uploaded: true,
  };

  const buffer = Buffer.from(await file.arrayBuffer());

  let text: string;
  try {
    text = await readEvidenceText(meta, buffer);
  } catch (err) {
    if (err instanceof AppError) throw err;
    if (isPdf) throw new AppError("INVALID_FILE", 422, err); // PDF corrompido
    throw err; // imagem: o erro provável é da OpenAI (chave, rede) — toAppError decide
  }
  if (!text) throw new AppError("INVALID_FILE", 422);

  await fs.mkdir(UPLOADS_DIR, { recursive: true });
  await fs.writeFile(path.join(UPLOADS_DIR, meta.filename), buffer);

  meta.description = text.replace(/\s+/g, " ").slice(0, 180);
  await ingestEvidence(meta, text);
  return meta;
}
