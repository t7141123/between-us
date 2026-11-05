/**
 * Builds the shareable card picture as an SVG string (pure; no React Native imports).
 * The web renders it to PNG through a canvas; phones render the same SVG and capture it.
 */
export interface CardImageStyle {
  bg: string;
  ink: string;
  accent: string;
  sub: string;
  border: string;
}

export const CARD_IMAGE_WIDTH = 1080;
export const CARD_IMAGE_HEIGHT = 1350;

/** Width of a character in half-em units: CJK/full-width = 2, everything else = 1. */
export function charUnits(ch: string): number {
  const code = ch.codePointAt(0) ?? 0;
  return code >= 0x2e80 || (code >= 0xff00 && code <= 0xffef) ? 2 : 1;
}

export function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** Punctuation that must not start a line (it hangs at the end of the previous line instead). */
const NO_LINE_START = new Set([...'，。、；：！？）」』】》〉,.;:!?)]}%…—·”’']);

/** Splits into latin words (kept whole), single spaces, and single other characters. */
function tokenize(text: string): string[] {
  return text.replace(/\s*\n\s*/g, ' ').match(/[A-Za-z0-9'’\-]+|\s|./gu) ?? [];
}

const widthOf = (s: string) => [...s].reduce((n, c) => n + charUnits(c), 0);

/**
 * Greedy wrap by visual width. Latin words are never cut, CJK breaks anywhere, and closing punctuation
 * never starts a line (it is allowed to overhang by a character instead).
 */
export function wrapLines(text: string, maxUnits: number): string[] {
  const lines: string[] = [];
  let line = '';
  let units = 0;
  const flush = () => {
    if (line.trim() !== '') lines.push(line.trimEnd());
    line = '';
    units = 0;
  };

  for (const token of tokenize(text)) {
    if (token === ' ' && line === '') continue;
    const w = widthOf(token);
    if (units + w > maxUnits && line !== '') {
      const hangs = token.length === 1 && NO_LINE_START.has(token);
      if (!hangs) {
        flush();
        if (token === ' ') continue;
      }
    }
    // A single word longer than a whole line has to be split.
    if (w > maxUnits) {
      for (const ch of token) {
        const cw = charUnits(ch);
        if (units + cw > maxUnits) flush();
        line += ch;
        units += cw;
      }
      continue;
    }
    line += token;
    units += w;
  }
  flush();
  return lines;
}

export interface BuildCardSvgInput {
  text: string;
  label: string;
  footer: string;
  style: CardImageStyle;
  width?: number;
  height?: number;
}

export function buildCardSvg(input: BuildCardSvgInput): string {
  const { text, label, footer, style } = input;
  const width = input.width ?? CARD_IMAGE_WIDTH;
  const height = input.height ?? CARD_IMAGE_HEIGHT;
  const margin = 120;
  const maxLines = 9;

  // Largest font size at which the question fits.
  let fontSize = 42;
  let lines: string[] = [text];
  for (const size of [66, 58, 50, 44, 40, 36]) {
    const maxUnits = Math.floor((width - margin * 2) / (size / 2));
    const wrapped = wrapLines(text, maxUnits);
    fontSize = size;
    lines = wrapped;
    if (wrapped.length <= maxLines) break;
  }
  lines = lines.slice(0, maxLines * 2); // hard cap; extremely long text is clipped rather than overflowing

  const lineHeight = Math.round(fontSize * 1.55);
  const blockHeight = lineHeight * lines.length;
  const startY = Math.round((height - blockHeight) / 2 + fontSize);
  const font = "'Songti TC','Noto Serif TC','PingFang TC',Georgia,serif";

  const textNodes = lines
    .map((l, i) => `<text x="${width / 2}" y="${startY + i * lineHeight}" text-anchor="middle" font-size="${fontSize}" fill="${style.ink}" font-family="${font}">${escapeXml(l)}</text>`)
    .join('');

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
    `<rect width="${width}" height="${height}" fill="${style.bg}"/>`,
    `<rect x="44" y="44" width="${width - 88}" height="${height - 88}" rx="40" fill="none" stroke="${style.border}" stroke-width="3"/>`,
    `<text x="${width / 2}" y="190" text-anchor="middle" font-size="34" letter-spacing="6" fill="${style.accent}" font-family="${font}">${escapeXml(label)}</text>`,
    textNodes,
    `<text x="${width / 2}" y="${height - 150}" text-anchor="middle" font-size="32" fill="${style.sub}" font-family="${font}">${escapeXml(footer)}</text>`,
    `<text x="${width / 2}" y="${height - 98}" text-anchor="middle" font-size="26" fill="${style.sub}" font-family="${font}">between-us.ark-studio.app</text>`,
    `</svg>`,
  ].join('');
}
