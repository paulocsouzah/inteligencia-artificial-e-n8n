import Investigation from "@/components/Investigation";
import { listEvidence } from "@/lib/rag/store";
import { toAppError } from "@/lib/errors";
import { caseInfo, starterQuestions } from "@/case/info";
import { suspects } from "@/case/suspects";
import { timeline } from "@/case/timeline";

// Server Component: carrega o caso direto no servidor e entrega ao componente do
// navegador (Investigation), que cuida de tudo que é interativo.
//
// force-dynamic: a página lê o banco a cada acesso. Sem isso, o Next tentaria gerar
// a página durante o `next build` — quando o banco pode nem existir ainda.
export const dynamic = "force-dynamic";

export default async function Home() {
  let evidence;
  try {
    evidence = await listEvidence();
  } catch (err) {
    return <SetupNotice reason={toAppError(err).message} />;
  }
  if (evidence.length === 0) {
    return <SetupNotice reason="O banco está no ar, mas ainda não tem evidências indexadas." />;
  }

  return (
    <Investigation
      caseInfo={caseInfo}
      suspects={suspects}
      timeline={timeline}
      initialEvidence={evidence}
      suggestions={starterQuestions}
    />
  );
}

/** Tela de ajuda quando o banco ainda não foi preparado (o erro mais comum de quem clona o projeto). */
function SetupNotice({ reason }: { reason: string }) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col justify-center gap-4 px-6 py-12">
      <h1 className="font-mono text-lg font-bold text-ink">🕵️ AI Detective — falta preparar o ambiente</h1>
      <p className="text-sm text-ink-dim">{reason}</p>
      <pre className="overflow-x-auto rounded-lg border border-border bg-panel p-4 font-mono text-xs leading-relaxed text-ink">
        {`npm run db:up   # sobe o Postgres + pgvector (Docker)
npm run setup   # gera as evidências e indexa no banco (RAG)`}
      </pre>
      <p className="text-xs text-ink-faint">Depois, recarregue esta página. Detalhes no README.</p>
    </main>
  );
}
