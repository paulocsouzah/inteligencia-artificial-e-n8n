import type { ReactNode } from "react";

// Renderizador mínimo do subconjunto de Markdown que o Investigador IA usa
// (## e ### títulos, **negrito**, listas com "-" e "1."). Evita depender de uma
// lib de markdown só para o RELATÓRIO FINAL e algumas respostas com listas.

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g).filter((p) => p !== "");
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={`${keyPrefix}-${i}`} className="font-semibold text-ink">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={`${keyPrefix}-${i}`}>{part}</span>;
  });
}

export default function SimpleMarkdown({ text }: { text: string }) {
  const lines = text.split("\n");
  const blocks: ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    // "## " e "### " viram o mesmo título (os modelos usam os dois)
    const heading = line.match(/^#{2,3}\s+(.*)$/);
    if (heading) {
      blocks.push(
        <h3 key={key++} className="mb-1.5 mt-3 font-mono text-sm font-bold uppercase tracking-wide text-accent first:mt-0">
          {renderInline(heading[1], `h-${key}`)}
        </h3>
      );
      i++;
      continue;
    }

    if (/^\d+\.\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s/, ""));
        i++;
      }
      blocks.push(
        <ol key={key++} className="my-1.5 list-decimal space-y-1 pl-5 text-sm leading-relaxed">
          {items.map((it, idx) => (
            <li key={idx}>{renderInline(it, `ol-${key}-${idx}`)}</li>
          ))}
        </ol>
      );
      continue;
    }

    if (line.startsWith("- ")) {
      const items: string[] = [];
      while (i < lines.length && lines[i].startsWith("- ")) {
        items.push(lines[i].slice(2));
        i++;
      }
      blocks.push(
        <ul key={key++} className="my-1.5 list-disc space-y-1 pl-5 text-sm leading-relaxed">
          {items.map((it, idx) => (
            <li key={idx}>{renderInline(it, `ul-${key}-${idx}`)}</li>
          ))}
        </ul>
      );
      continue;
    }

    if (line.trim() === "") {
      i++;
      continue;
    }

    blocks.push(
      <p key={key++} className="text-sm leading-relaxed">
        {renderInline(line, `p-${key}`)}
      </p>
    );
    i++;
  }

  return <div className="flex flex-col">{blocks}</div>;
}
