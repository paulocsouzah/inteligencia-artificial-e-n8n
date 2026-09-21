import path from "path";

// Onde ficam os arquivos originais das evidências e como descobrir o tipo deles.
// (O TEXTO e os embeddings ficam no banco; o arquivo bruto serve para o
// navegador exibir o PDF/imagem de verdade.)

export const CASE_DIR = path.join(process.cwd(), "evidence", "case-001");
export const UPLOADS_DIR = path.join(process.cwd(), "evidence", "uploads");
export const SAMPLES_DIR = path.join(process.cwd(), "evidence", "samples");

export function mimeFor(filename: string): string {
  const lower = filename.toLowerCase();
  if (lower.endsWith(".pdf")) return "application/pdf";
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".webp")) return "image/webp";
  return "image/jpeg";
}

/** Caminho do arquivo de uma evidência. path.basename impede "../" no nome do arquivo. */
export function evidenceFilePath(meta: { filename: string; uploaded: boolean }): string {
  return path.join(meta.uploaded ? UPLOADS_DIR : CASE_DIR, path.basename(meta.filename));
}
