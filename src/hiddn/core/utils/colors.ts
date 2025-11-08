export type RGB = { r: number; g: number; b: number };
export type Gradient = [string, string, string?];

const PASTELS = [
  '#C8B6FF', '#E7C6FF', '#FFD6FF', '#B8E0D2', '#FAEDCB', '#F1C0E8', '#A0C4FF', '#FFDEB4', '#FDE2E4'
];

export function hexToRgb(hex: string): RGB {
  const m = hex.replace('#','');
  const n = parseInt(m.length === 3 ? m.split('').map(c=>c+c).join('') : m, 16);
  return { r: (n>>16)&255, g: (n>>8)&255, b: n&255 };
}
export function luminance({r,g,b}: RGB){ return 0.2126*r + 0.7152*g + 0.0722*b; }
export function textOn(bg: string): '#000000E6' | '#FFFFFFE6' {
  const L = luminance(hexToRgb(bg));
  return L > 160 ? '#000000E6' : '#FFFFFFE6';
}

export function pickHarmonicGradient(seedColors?: string[]): Gradient {
  const base = (seedColors && seedColors.length ? seedColors : PASTELS);
  const i1 = Math.floor(Math.random()*base.length);
  let i2 = Math.floor(Math.random()*base.length);
  let i3 = Math.floor(Math.random()*base.length);
  if (i2 === i1) i2 = (i2+3)%base.length;
  if (i3 === i1 || i3 === i2) i3 = (i3+5)%base.length;
  return [base[i1], base[i2], base[i3]];
}

export function gradientCss(g: Gradient): string {
  const [a,b,c] = g;
  const stops = c ? `${a} 0%, ${b} 55%, ${c} 100%` : `${a}, ${b}`;
  return `linear-gradient(135deg, ${stops})`;
}
