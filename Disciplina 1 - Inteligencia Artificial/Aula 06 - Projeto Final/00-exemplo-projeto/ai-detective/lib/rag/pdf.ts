import { getDocumentProxy, extractText } from "unpdf";

// AULA 03 · Ler PDF: extrai o texto de um arquivo PDF.
//
// Usamos o unpdf porque ele empacota o pdf.js de um jeito que funciona dentro
// do bundler do Next (as bibliotecas "cruas" quebram no servidor do App Router).
// Só serve para PDFs com texto; PDF escaneado (imagem) exigiria OCR ou visão.

export async function extractPdfText(buffer: Buffer): Promise<string> {
  const pdf = await getDocumentProxy(new Uint8Array(buffer));
  const { text } = await extractText(pdf, { mergePages: true });
  return text.trim();
}
