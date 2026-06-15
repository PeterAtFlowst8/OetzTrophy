/** Per-category participant caps and the pure logic around them. */

export type Category = 'men' | 'women';
export type Caps = { men: number; women: number };

export const DEFAULT_CAPS: Caps = { men: 130, women: 50 };

/** Caps come from Sanity settings when set to a positive number, else the defaults. */
export function resolveCaps(settings: { maxMen?: number | null; maxWomen?: number | null }): Caps {
  const pick = (v: number | null | undefined, d: number) =>
    typeof v === 'number' && v > 0 ? v : d;
  return {
    men: pick(settings.maxMen, DEFAULT_CAPS.men),
    women: pick(settings.maxWomen, DEFAULT_CAPS.women),
  };
}

/** A category is full once paid registrations reach its cap. */
export function isCategoryFull(paidCount: number, cap: number): boolean {
  return paidCount >= cap;
}

export type CategoryAvailability = {
  men: { paid: number; cap: number; full: boolean };
  women: { paid: number; cap: number; full: boolean };
};

/** Form helper: is the currently-selected category full? Unknown/empty → not full. */
export function isSelectedCategoryFull(
  category: string,
  availability: { men: { full: boolean }; women: { full: boolean } },
): boolean {
  if (category === 'men') return availability.men.full;
  if (category === 'women') return availability.women.full;
  return false;
}
