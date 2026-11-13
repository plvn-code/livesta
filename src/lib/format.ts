/** Client-safe helpers (no catalogue import). */

export type Card = {
  id: string; // catalogue code, e.g. "530101"
  s: string; // slug
  n: string; // name
  v: string | null; // volume label
  p: number; // price
  o: number | null; // old (catalogue) price
  sr: string | null; // series id
  srn: string | null; // series name
  sec: string;
  sub: string | null;
  img: boolean;
  cut: boolean;
};

const group = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
export const price = (n: number) => `${group(n)} ₴`;
export const off = (p: number, o: number | null) => (o && o > p ? Math.round((1 - p / o) * 100) : 0);

export const img = (id: string, kind: "" | "s" | "c" = "") => `/images/p/${id}${kind}.webp`;

export function plural(n: number, one: string, few: string, many: string) {
  const m10 = n % 10,
    m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
  return many;
}

export const goods = (n: number) => `${n} ${plural(n, "товар", "товари", "товарів")}`;

/** Lower-cased, apostrophes and punctuation folded, so «мʼята», «м'ята» and «м’ята» match. */
export function fold(s: string) {
  return s
    .toLowerCase()
    .replace(/[ʼ’'`"«»]/g, "")
    .replace(/ё/g, "е")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

/** Every query word must appear in the haystack (series + name + code); earlier and word-start hits rank higher. */
export function searchCards(cards: Card[], q: string, limit = 60) {
  const words = fold(q).split(" ").filter(Boolean);
  if (!words.length) return [];
  const out: { c: Card; score: number }[] = [];
  for (const c of cards) {
    const hay = fold(`${c.n} ${c.srn ?? ""} ${c.id}`);
    let score = 0;
    let ok = true;
    for (const w of words) {
      const i = hay.indexOf(w);
      if (i < 0) {
        ok = false;
        break;
      }
      score += i === 0 || hay[i - 1] === " " ? 3 : 1;
      score -= i / 400;
    }
    if (ok) out.push({ c, score: score + (c.img ? 0.3 : 0) });
  }
  return out
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.c);
}
