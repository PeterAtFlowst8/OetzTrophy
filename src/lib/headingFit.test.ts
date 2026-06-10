import { describe, it, expect } from 'vitest';
import { headingFontSize } from './headingFit';

const OPTS = { floorPx: 36, slopeCqi: 8, capPx: 80 };

describe('headingFontSize', () => {
  it('keeps the design scale for short titles (fit cap never binds)', () => {
    // Longest word "TROPHY" = 6 chars -> cap 151/6 = 25.2cqi, far above the
    // design scale at any width, so min() always resolves to the clamp().
    expect(headingFontSize('OETZ TROPHY', OPTS)).toBe(
      'min(clamp(36px, 8cqi, 80px), 25.2cqi)',
    );
  });

  it('caps long single-word titles to fit their column', () => {
    // 20 chars -> 7.6cqi: below the 8cqi slope AND overrides the 36px floor
    // on narrow columns.
    expect(headingFontSize('Teilnahmebedingungen', OPTS)).toBe(
      'min(clamp(36px, 8cqi, 80px), 7.6cqi)',
    );
  });

  it('uses the longest word, not the whole text', () => {
    expect(headingFontSize('Die Teilnahmeberechtigung', OPTS)).toBe(
      headingFontSize('Teilnahmeberechtigung', OPTS),
    );
  });

  it('survives empty/whitespace text', () => {
    expect(headingFontSize('  ', OPTS)).toContain('clamp(36px, 8cqi, 80px)');
  });
});
