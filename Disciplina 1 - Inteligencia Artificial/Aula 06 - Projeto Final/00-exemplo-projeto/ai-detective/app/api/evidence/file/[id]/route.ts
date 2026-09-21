import { promises as fs } from "fs";
import { errorResponse, AppError } from "@/lib/errors";
import { evidenceFilePath, mimeFor } from "@/lib/rag/files";
import { getEvidence } from "@/lib/rag/store";

// GET /api/evidence/file/[id] — devolve o arquivo original (PDF ou imagem) para
// a tela exibir o preview. O caminho vem SEMPRE do banco (nunca da URL), então
// não dá para pedir "../../.env".

export const runtime = "nodejs";

export async function GET(_request: Request, ctx: RouteContext<"/api/evidence/file/[id]">) {
  try {
    const { id } = await ctx.params;
    const evidence = await getEvidence(id);
    if (!evidence) throw new AppError("NOT_FOUND", 404);

    const buffer = await fs.readFile(evidenceFilePath(evidence)).catch(() => {
      throw new AppError("NOT_FOUND", 404);
    });

    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": mimeFor(evidence.filename),
        "Content-Disposition": `inline; filename="${evidence.filename}"`,
        "Cache-Control": "private, max-age=60",
      },
    });
  } catch (err) {
    return errorResponse(err);
  }
}
