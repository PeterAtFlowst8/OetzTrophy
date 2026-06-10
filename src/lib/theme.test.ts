import { describe, it, expect } from 'vitest';
import { deriveAccentShades } from './theme';

function channelDistance(a: string, b: string): number {
  const parse = (hex: string) =>
    [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  const [r1, g1, b1] = parse(a);
  const [r2, g2, b2] = parse(b);
  return Math.max(Math.abs(r1 - r2), Math.abs(g1 - g2), Math.abs(b1 - b2));
}

describe('deriveAccentShades', () => {
  it('reproduces the built-in amber relationships closely', () => {
    const shades = deriveAccentShades('#F59E0B');
    expect(shades).not.toBeNull();
    expect(shades!.accent).toBe('#f59e0b');
    // Derived shades should land near the hand-picked originals.
    expect(channelDistance(shades!.accentDark, '#D97706')).toBeLessThanOrEqual(12);
    expect(channelDistance(shades!.accentText, '#8A4700')).toBeLessThanOrEqual(20);
  });

  it('produces valid hex output for arbitrary colours', () => {
    for (const input of ['#1D4ED8', '#10B981', '#E11D48', '#000000', '#ffffff']) {
      const shades = deriveAccentShades(input);
      expect(shades).not.toBeNull();
      for (const value of Object.values(shades!)) {
        expect(value).toMatch(/^#[0-9a-f]{6}$/);
      }
    }
  });

  it('keeps the text shade dark enough to read on light backgrounds', () => {
    // Even for a very light input the text shade is clamped dark.
    const shades = deriveAccentShades('#FDE68A')!;
    const lightness = (hex: string) => {
      const v = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
      return (Math.max(...v) + Math.min(...v)) / 2 / 255;
    };
    expect(lightness(shades.accentText)).toBeLessThanOrEqual(0.41);
  });

  it('accepts hex without the leading # and normalises', () => {
    expect(deriveAccentShades('1d4ed8')?.accent).toBe('#1d4ed8');
  });

  it('rejects invalid input', () => {
    expect(deriveAccentShades('')).toBeNull();
    expect(deriveAccentShades('#fff')).toBeNull();
    expect(deriveAccentShades('red')).toBeNull();
    expect(deriveAccentShades('#12345g')).toBeNull();
    expect(deriveAccentShades(':root{}')).toBeNull();
  });
});
