import { errorResponse, AppError } from "@/lib/errors";
import { ingestUpload } from "@/lib/rag/ingest";
import { listEvidence } from "@/lib/rag/store";

// GET  /api/evidence → lista as evidências (as do caso + as enviadas pelo usuário)
// POST /api/evidence → recebe um PDF ou imagem (multipart/form-data, campo "file"),
//                      extrai o texto, gera os embeddings e passa a ser buscável
//                      pelo agente na hora — sem reiniciar nada (AULA 04: ingestão).

export const runtime = "nodejs";

export async function GET() {
  try {
    return Response.json({ evidence: await listEvidence() });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData().catch(() => null);
    const file = formData?.get("file");
    if (!(file instanceof File)) throw new AppError("BAD_REQUEST", 400);

    return Response.json({ evidence: await ingestUpload(file) });
  } catch (err) {
    return errorResponse(err);
  }
}
