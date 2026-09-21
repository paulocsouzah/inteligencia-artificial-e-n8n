import OpenAI from "openai";
import { AppError } from "./errors";

// ─────────────────────────────────────────────────────────────────────────────
// AULA 03 · Ponto único de acesso ao SDK da OpenAI.
//
// A OPENAI_API_KEY só é lida aqui, no servidor. Nenhum outro arquivo mexe em
// process.env.OPENAI_API_KEY, e nada deste módulo é importado por componentes
// do navegador — a chave jamais chega ao frontend.
// ─────────────────────────────────────────────────────────────────────────────

let client: OpenAI | null = null;

export function getOpenAI(): OpenAI {
  if (!process.env.OPENAI_API_KEY) throw new AppError("MISSING_API_KEY", 401);

  // timeout + maxRetries: sem isso, uma OpenAI lenta deixaria a requisição
  // pendurada para sempre. O SDK já refaz a chamada sozinho em erros 429/5xx.
  client ??= new OpenAI({ apiKey: process.env.OPENAI_API_KEY, timeout: 60_000, maxRetries: 2 });
  return client;
}
