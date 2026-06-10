/**
 * Accent colour theming. The site uses three accent shades (see globals.css):
 *   --color-accent       #F59E0B  base (buttons, badges, links)
 *   --color-accent-dark  #D97706  hover
 *   --color-accent-text  #8A4700  small text/labels on light backgrounds
 *
 * The Studio exposes ONE editable accent colour; the two darker shades are
 * derived here in HSL, mirroring the relationships of the built-in amber
 * (hover: slightly warmer hue, 12% darker; text: much darker, more saturated
 * so it stays readable at small sizes).
 */

export type AccentShades = {
  accent: string;
  accentDark: string;
  accentText: string;
};

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return { h: h * 360, s, l };
}

function hslToHex(h: number, s: number, l: number): string {
  const hue = ((h % 360) + 360) % 360;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = l - c / 2;
  let rgb: [number, number, number];
  if (hue < 60) rgb = [c, x, 0];
  else if (hue < 120) rgb = [x, c, 0];
  else if (hue < 180) rgb = [0, c, x];
  else if (hue < 240) rgb = [0, x, c];
  else if (hue < 300) rgb = [x, 0, c];
  else rgb = [c, 0, x];
  return (
    '#' +
    rgb
      .map((v) => Math.round((v + m) * 255).toString(16).padStart(2, '0'))
      .join('')
  );
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

/**
 * Derives the hover and text shades from a single accent colour.
 * Returns null for anything that is not a #rrggbb hex string.
 */
export function deriveAccentShades(input: string): AccentShades | null {
  const match = /^#?([0-9a-fA-F]{6})$/.exec(input.trim());
  if (!match) return null;
  const hex = match[1].toLowerCase();
  const { h, s, l } = hexToHsl(hex);

  return {
    accent: `#${hex}`,
    // Hover: a touch warmer/deeper, 12% darker — amber F59E0B -> ~D97706.
    accentDark: hslToHex(h - 6, clamp(s + 0.01, 0, 1), clamp(l * 0.88, 0.05, 0.95)),
    // Small-text shade: much darker and fully saturated for legibility on
    // light backgrounds — amber F59E0B -> ~8A4700.
    accentText: hslToHex(h - 7, clamp(s + 0.08, 0, 1), clamp(l * 0.54, 0.12, 0.4)),
  };
}
