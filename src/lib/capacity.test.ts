import { describe, expect, it } from 'vitest';
import { resolveCaps, isCategoryFull, isSelectedCategoryFull, DEFAULT_CAPS } from '@/lib/capacity';

describe('resolveCaps', () => {
  it('falls back to 130/50 when settings are blank', () => {
    expect(resolveCaps({ maxMen: null, maxWomen: null })).toEqual({ men: 130, women: 50 });
    expect(DEFAULT_CAPS).toEqual({ men: 130, women: 50 });
  });
  it('uses positive settings values when present', () => {
    expect(resolveCaps({ maxMen: 140, maxWomen: 60 })).toEqual({ men: 140, women: 60 });
  });
  it('honors an explicit 0 (freeze the category) but ignores negatives', () => {
    expect(resolveCaps({ maxMen: 0, maxWomen: -5 })).toEqual({ men: 0, women: 50 });
  });
});

describe('isCategoryFull', () => {
  it('is true only at or above the cap', () => {
    expect(isCategoryFull(129, 130)).toBe(false);
    expect(isCategoryFull(130, 130)).toBe(true);
    expect(isCategoryFull(131, 130)).toBe(true);
  });
});

describe('isSelectedCategoryFull', () => {
  const av = { men: { full: true }, women: { full: false } };
  it('maps the selected category to its availability flag', () => {
    expect(isSelectedCategoryFull('men', av)).toBe(true);
    expect(isSelectedCategoryFull('women', av)).toBe(false);
  });
  it('is false when no category is selected', () => {
    expect(isSelectedCategoryFull('', av)).toBe(false);
  });
});
