// ─────────────────────────────────────────────────────────────────────────────
// npm run seed-case
//
// Transforma os textos e cenas de case/evidence.ts em ARQUIVOS de verdade:
//   • um PDF por documento (desenhado com pdf-lib);
//   • uma foto por câmera (desenhada em SVG e rasterizada com sharp — o selo da
//     câmera e o horário ficam "queimados" nos pixels, para o modelo de visão ter
//     o que ler);
//   • evidence/samples/bilhete-anonimo.pdf: um documento com uma tentativa de
//     prompt injection, para você testar o guardrail enviando-o pela tela.
//
// Por que gerar arquivos, em vez de escrever o texto direto no banco? Para o
// pipeline ser o de verdade: arquivo → extração de texto / visão → chunks →
// embeddings. Não depende de banco nem de chave da OpenAI. Pode rodar de novo
// (sobrescreve os arquivos).
//
// Este script é 100% específico do tema (desenhar câmeras e depoimentos). No seu
// projeto, você pode substituí-lo por PDFs reais que já tenha em evidence/.
// ─────────────────────────────────────────────────────────────────────────────
import { promises as fs } from "fs";
import path from "path";
import { PDFDocument, StandardFonts, rgb, type PDFFont } from "pdf-lib";
import sharp from "sharp";
import { seedEvidence, documentBodies, imageScenes, attackSample } from "../case/evidence";
import { caseInfo } from "../case/info";
import { CASE_DIR, SAMPLES_DIR } from "../lib/rag/files";

const PAGE = { width: 595.28, height: 841.89, margin: 56 };

function wrapLine(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  if (text === "") return [""];
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines;
}

async function renderDocumentPdf(body: string): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setProducer("AI Detective — seed-case");
  doc.setSubject(`${caseInfo.id} — ${caseInfo.title}`);

  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const fontItalic = await doc.embedFont(StandardFonts.HelveticaOblique);

  const maxWidth = PAGE.width - PAGE.margin * 2;
  const lineHeight = 16;

  let page = doc.addPage([PAGE.width, PAGE.height]);
  let y = PAGE.height - PAGE.margin;

  const rawLines = body.split("\n");
  let isFirstLine = true;

  for (const raw of rawLines) {
    const size = isFirstLine ? 15 : 11;
    const useFont = isFirstLine ? fontBold : font;
    const wrapped = wrapLine(raw, useFont, size, maxWidth);

    for (const line of wrapped) {
      if (y < PAGE.margin + lineHeight * 2) {
        page = doc.addPage([PAGE.width, PAGE.height]);
        y = PAGE.height - PAGE.margin;
      }
      page.drawText(line, { x: PAGE.margin, y, size, font: useFont, color: rgb(0.09, 0.09, 0.11) });
      y -= lineHeight;
    }

    if (isFirstLine) {
      y -= 4;
      page.drawLine({
        start: { x: PAGE.margin, y },
        end: { x: PAGE.width - PAGE.margin, y },
        thickness: 1,
        color: rgb(0.7, 0.15, 0.15),
      });
      y -= 12;
    }

    isFirstLine = false;
  }

  for (const p of doc.getPages()) {
    p.drawText(`AI DETECTIVE — ${caseInfo.id} — documento gerado para fins didáticos`, {
      x: PAGE.margin,
      y: 28,
      size: 8,
      font: fontItalic,
      color: rgb(0.55, 0.55, 0.55),
    });
  }

  return doc.save();
}

function svgFrame(opts: {
  width: number;
  height: number;
  cameraLabel: string;
  timestampLabel: string;
  captionLines: string[];
  content: string;
}): string {
  const { width, height, cameraLabel, timestampLabel, captionLines, content } = opts;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <defs>
      <radialGradient id="vignette" cx="50%" cy="45%" r="75%">
        <stop offset="60%" stop-color="#10131a" stop-opacity="0"/>
        <stop offset="100%" stop-color="#000000" stop-opacity="0.55"/>
      </radialGradient>
      <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#1b2028"/>
        <stop offset="100%" stop-color="#0c0e12"/>
      </linearGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#floor)"/>
    ${content}
    <rect width="${width}" height="${height}" fill="url(#vignette)"/>
    <g font-family="'Courier New', monospace" fill="#7CFC98">
      <text x="20" y="34" font-size="20" font-weight="bold">${cameraLabel}</text>
      <circle cx="${width - 68}" cy="26" r="6" fill="#ff3b3b"/>
      <text x="${width - 20}" y="31" font-size="16" fill="#ff3b3b" text-anchor="end">REC</text>
    </g>
    <g font-family="'Courier New', monospace" fill="#c9d1d9">
      ${captionLines
        .map((line, i) => `<text x="20" y="${height - 46 + i * 16}" font-size="13" opacity="0.85">${line}</text>`)
        .join("\n")}
      <text x="${width - 20}" y="${height - 20}" font-size="16" fill="#7CFC98" text-anchor="end">${timestampLabel}</text>
    </g>
    <rect x="4" y="4" width="${width - 8}" height="${height - 8}" fill="none" stroke="#2c333c" stroke-width="2"/>
  </svg>`;
}

function personSilhouette(x: number, y: number, scale = 1, color = "#3a4250"): string {
  return `<g transform="translate(${x} ${y}) scale(${scale})" fill="${color}">
    <circle cx="0" cy="-58" r="16"/>
    <path d="M -22 -40 Q 0 -52 22 -40 L 26 30 Q 0 40 -26 30 Z"/>
  </g>`;
}

function buildCameraEntradaSvg(scene: { cameraLabel: string; timestampLabel: string; captionLines: string[] }): string {
  const content = `
    <g>
      <rect x="60" y="90" width="220" height="330" fill="#151a21" stroke="#2c333c" stroke-width="3"/>
      <line x1="170" y1="90" x2="170" y2="420" stroke="#2c333c" stroke-width="3"/>
      <rect x="380" y="300" width="260" height="90" rx="6" fill="#20262f" stroke="#333b46" stroke-width="2"/>
      <text x="400" y="332" font-family="'Courier New', monospace" font-size="14" fill="#8b95a1">RECEPÇÃO</text>
      <text x="400" y="352" font-family="'Courier New', monospace" font-size="14" fill="#8b95a1">ENTRADA PRINCIPAL</text>
      ${personSilhouette(470, 300, 1.3, "#4a5568")}
    </g>`;
  return svgFrame({ width: 960, height: 540, ...scene, content });
}

function buildCameraCorredorSvg(scene: { cameraLabel: string; timestampLabel: string; captionLines: string[] }): string {
  const content = `
    <g>
      <polygon points="0,540 380,150 580,150 960,540" fill="#181d24"/>
      <polygon points="380,150 580,150 520,420 440,420" fill="#20262f"/>
      <rect x="700" y="180" width="120" height="260" fill="#141920" stroke="#2c333c" stroke-width="3"/>
      <text x="712" y="200" font-family="'Courier New', monospace" font-size="13" fill="#8b95a1">ESCADA DE</text>
      <text x="712" y="216" font-family="'Courier New', monospace" font-size="13" fill="#8b95a1">SERVIÇO</text>
      ${personSilhouette(700, 360, 1.1, "#4a5568")}
    </g>`;
  return svgFrame({ width: 960, height: 540, ...scene, content });
}

function buildCameraSalaSegurancaSvg(scene: { cameraLabel: string; timestampLabel: string; captionLines: string[] }): string {
  const monitors: string[] = [];
  const cols = 3;
  const rows = 2;
  const monW = 160;
  const monH = 110;
  const startX = 360;
  const startY = 90;
  const gap = 24;
  let index = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = startX + c * (monW + gap);
      const y = startY + r * (monH + gap);
      const isDown = index === 4; // CAM 05 - Ala Aurora
      monitors.push(`
        <g>
          <rect x="${x}" y="${y}" width="${monW}" height="${monH}" fill="${isDown ? "#000000" : "#1a2a1f"}" stroke="#3a4250" stroke-width="2"/>
          <text x="${x + 8}" y="${y + 18}" font-family="'Courier New', monospace" font-size="11" fill="${isDown ? "#ff5b5b" : "#7CFC98"}">CAM 0${index + 1}</text>
          ${isDown ? `<text x="${x + 8}" y="${y + monH - 14}" font-family="'Courier New', monospace" font-size="12" fill="#ff5b5b">ALA AURORA</text><text x="${x + 8}" y="${y + monH / 2 + 6}" font-family="'Courier New', monospace" font-size="14" fill="#ff5b5b">SEM SINAL</text>` : `<line x1="${x + 10}" y1="${y + monH - 20}" x2="${x + monW - 10}" y2="${y + 20}" stroke="#2c4a35" stroke-width="1"/>`}
        </g>`);
      index++;
    }
  }
  const content = `
    <g>
      <rect x="330" y="60" width="600" height="380" fill="#10141a" stroke="#2c333c" stroke-width="3"/>
      ${monitors.join("\n")}
      ${personSilhouette(130, 360, 1.2, "#4a5568")}
    </g>`;
  return svgFrame({ width: 960, height: 540, ...scene, content });
}

function buildCenaDoCrimeSvg(scene: { cameraLabel: string; timestampLabel: string; captionLines: string[] }): string {
  const content = `
    <g>
      <rect x="300" y="120" width="360" height="260" fill="none" stroke="#8fd3ff" stroke-width="3" opacity="0.7"/>
      <rect x="300" y="120" width="360" height="260" fill="#8fd3ff" opacity="0.03"/>
      <rect x="430" y="330" width="100" height="26" fill="#2a2f37" stroke="#3a4250" stroke-width="2"/>
      <text x="440" y="348" font-family="'Courier New', monospace" font-size="11" fill="#8b95a1">PEDESTAL VAZIO</text>
      <circle cx="612" cy="150" r="16" fill="#f5c518" stroke="#8a6d00" stroke-width="2"/>
      <text x="608" y="156" font-family="'Courier New', monospace" font-size="14" fill="#3a2c00" font-weight="bold">1</text>
      <line x1="300" y1="410" x2="660" y2="410" stroke="#8b95a1" stroke-width="2"/>
      <text x="300" y="428" font-family="'Courier New', monospace" font-size="12" fill="#8b95a1">ESCALA — 30 cm</text>
    </g>`;
  return svgFrame({ width: 960, height: 540, ...scene, content });
}

const IMAGE_BUILDERS: Record<string, (scene: { cameraLabel: string; timestampLabel: string; captionLines: string[] }) => string> = {
  "camera-entrada": buildCameraEntradaSvg,
  "camera-corredor": buildCameraCorredorSvg,
  "camera-sala-seguranca": buildCameraSalaSegurancaSvg,
  "cena-do-crime": buildCenaDoCrimeSvg,
};

async function main() {
  console.log(`\n🕵️  AI Detective — gerando evidências do ${caseInfo.id}\n`);

  await fs.mkdir(CASE_DIR, { recursive: true });
  await fs.mkdir(SAMPLES_DIR, { recursive: true });

  for (const meta of seedEvidence) {
    const outPath = path.join(CASE_DIR, meta.filename);

    if (meta.kind === "pdf") {
      await fs.writeFile(outPath, await renderDocumentPdf(documentBodies[meta.id]));
      console.log(`  📄  ${meta.filename}`);
    } else {
      const scene = imageScenes[meta.id];
      const svg = IMAGE_BUILDERS[meta.id](scene);
      await fs.writeFile(outPath, await sharp(Buffer.from(svg)).jpeg({ quality: 88 }).toBuffer());
      console.log(`  📷  ${meta.filename}`);
    }
  }

  await fs.writeFile(path.join(SAMPLES_DIR, attackSample.filename), await renderDocumentPdf(attackSample.body));
  console.log(`  🧪  samples/${attackSample.filename} (teste de prompt injection — envie pela tela)`);

  console.log(`\n✅  ${seedEvidence.length} evidências geradas em ${path.relative(process.cwd(), CASE_DIR)}\n`);
}

main().catch((err) => {
  console.error("\n❌  Falha ao gerar as evidências do caso:\n", err);
  process.exit(1);
});
