import type { Creator } from "../data/creators";
import { pickHarmonicGradient, textOn, gradientCss } from "../utils/colors";
import type { Gradient } from "../utils/colors";

export type NewCreatorCard = {
  creator: Creator;
  gradient: Gradient;
  textColor: string;
};

export type NewCreatorsSection = {
  cards: NewCreatorCard[];
  generatedAt: number;
};

export function computeNewCreators(creators: Creator[], now = Date.now(), max = 6): NewCreatorsSection {
  const FORTY_EIGHT_H = 48 * 3600_000;
  const fresh = creators
    .filter(c => now - new Date(c.joinedAt).getTime() < FORTY_EIGHT_H)
    .sort((a,b)=> new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime());

  const used = new Set<string>();
  const cards = fresh.slice(0, max).map(c => {
    // Try to use creator palette if present; fallback to harmonics
    const grad = pickHarmonicGradient(c.palette);
    const key = grad.join("-");
    if (used.has(key)) {
      // ensure uniqueness with another pick
      const alt = pickHarmonicGradient();
      used.add(alt.join("-"));
      return { creator: c, gradient: alt, textColor: textOn(alt[0]) };
    }
    used.add(key);
    return { creator: c, gradient: grad, textColor: textOn(grad[0]) };
  });

  return { cards, generatedAt: now };
}

export function cardBackground(g: Gradient) {
  return gradientCss(g);
}
