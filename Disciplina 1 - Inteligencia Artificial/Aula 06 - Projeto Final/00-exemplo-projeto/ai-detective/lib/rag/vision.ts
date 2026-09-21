import { getOpenAI } from "../openai";
import { VISION_MODEL } from "../config";

// AULA 03 · Visão: pede ao modelo uma descrição em TEXTO de uma imagem.
//
// Por que transformar imagem em texto? Porque o RAG busca por texto. Depois de
// descrita, a foto da câmera vira um documento como outro qualquer: é dividida
// em chunks, vetorizada e passa a ser encontrada pela busca semântica.
//
// O `prompt` vem de fora (case/prompt.ts → visionPrompt) porque o que se quer
// saber de uma imagem depende do tema. Esta função é genérica.

export async function describeImage(buffer: Buffer, mime: string, prompt: string): Promise<string> {
  const response = await getOpenAI().chat.completions.create({
    model: VISION_MODEL,
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          // A imagem vai embutida na requisição, codificada em base64.
          { type: "image_url", image_url: { url: `data:${mime};base64,${buffer.toString("base64")}` } },
        ],
      },
    ],
  });

  return response.choices[0]?.message?.content?.trim() || "Não foi possível analisar a imagem.";
}
