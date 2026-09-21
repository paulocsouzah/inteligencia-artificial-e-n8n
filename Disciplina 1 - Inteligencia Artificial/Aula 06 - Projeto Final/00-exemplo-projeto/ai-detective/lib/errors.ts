import OpenAI from "openai";

// ─────────────────────────────────────────────────────────────────────────────
// Erros com mensagem segura para o usuário.
//
// Regra de ouro: o navegador NUNCA recebe a mensagem original de um erro (ela
// pode conter caminhos do servidor, trechos de SQL ou até parte de uma chave).
// Em vez disso, cada erro vira um AppError com um código e um texto amigável.
// ─────────────────────────────────────────────────────────────────────────────

export type AppErrorCode =
  | "MISSING_API_KEY"
  | "OPENAI_UNAVAILABLE"
  | "DB_UNAVAILABLE"
  | "INVALID_FILE"
  | "FILE_TOO_LARGE"
  | "BAD_REQUEST"
  | "NOT_FOUND"
  | "INTERNAL";

const MESSAGES: Record<AppErrorCode, string> = {
  MISSING_API_KEY: "A chave da OpenAI não está configurada ou é inválida. Confira o OPENAI_API_KEY no arquivo .env.",
  OPENAI_UNAVAILABLE: "Não foi possível falar com a OpenAI agora (limite de uso, rede ou instabilidade). Tente novamente em instantes.",
  DB_UNAVAILABLE: "Não foi possível conectar ao banco de dados. Ele está rodando? (docker compose --profile local up -d db)",
  INVALID_FILE: "Arquivo inválido. Envie um PDF, JPG, PNG ou WEBP que não esteja corrompido.",
  FILE_TOO_LARGE: "Arquivo muito grande. O limite é 10 MB.",
  BAD_REQUEST: "Requisição inválida.",
  NOT_FOUND: "Recurso não encontrado.",
  INTERNAL: "Ocorreu um erro interno inesperado.",
};

export class AppError extends Error {
  readonly code: AppErrorCode;
  readonly status: number;

  constructor(code: AppErrorCode, status = 500, cause?: unknown) {
    super(MESSAGES[code]);
    this.name = "AppError";
    this.code = code;
    this.status = status;
    if (cause instanceof Error) this.cause = cause;
  }
}

/** Converte qualquer erro capturado num AppError seguro para mostrar ao usuário. */
export function toAppError(err: unknown): AppError {
  if (err instanceof AppError) return err;

  if (err instanceof OpenAI.APIError) {
    // 401 = chave errada. Os demais (429 limite de uso, 5xx instabilidade…) são "indisponível".
    return err.status === 401 ? new AppError("MISSING_API_KEY", 401, err) : new AppError("OPENAI_UNAVAILABLE", 502, err);
  }
  if (err instanceof OpenAI.APIConnectionError) {
    return new AppError("OPENAI_UNAVAILABLE", 502, err);
  }

  // Erros de rede do driver do Postgres chegam com o código do sistema operacional.
  const code = (err as { code?: string } | null)?.code;
  if (code === "ECONNREFUSED" || code === "ENOTFOUND" || code === "ETIMEDOUT") {
    return new AppError("DB_UNAVAILABLE", 503, err);
  }

  return new AppError("INTERNAL", 500, err);
}

/** Resposta JSON de erro para as rotas de API. O detalhe técnico fica só no log do servidor. */
export function errorResponse(err: unknown): Response {
  const appError = toAppError(err);
  console.error(`[${appError.code}]`, appError.cause ?? err);
  return Response.json({ error: appError.message }, { status: appError.status });
}
