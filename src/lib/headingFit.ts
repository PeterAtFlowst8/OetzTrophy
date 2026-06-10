/**
 * Fluid heading font-size that only shrinks below the design scale when the
 * text actually needs it.
 *
 * Problem: a single fluid scale must be tuned for the worst-case word
 * ("Teilnahmebedingungen"), which makes every short title ("OETZ TROPHY")
 * needlessly small. Since headings render server-side, we know the text and
 * can cap the size per title instead.
 *
 * The design scale is `clamp(floorPx, slopeCqi, capPx)` in container-query
 * units (the wrapper must set `container-type: inline-size`). The fit cap is
 * the largest cqi at which the longest word still fits its column: uppercase
 * words in the display font (Agdasima bold) measure ~0.61–0.63x font-size per
 * character, so with a safety margin of 0.66 the cap is 100 / (0.66 * chars)
 * ≈ 151 / chars. `min()` lets the design scale win whenever the words are
 * short enough — for short words the cap is huge and never binds, while for
 * long words it also overrides the px floor (which would otherwise overflow
 * narrow columns).
 */
export function headingFontSize(
  text: string,
  opts: { floorPx: number; slopeCqi: number; capPx: number },
): string {
  const longest = text
    .trim()
    .split(/\s+/)
    .reduce((max, word) => Math.max(max, word.length), 1);

  const fitCqi = Math.round((151 / longest) * 10) / 10;
  const design = `clamp(${opts.floorPx}px, ${opts.slopeCqi}cqi, ${opts.capPx}px)`;

  return `min(${design}, ${fitCqi}cqi)`;
}
