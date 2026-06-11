/**
 * Hero is server-rendered (homepage ISR, revalidate=60) and hydrates in the
 * browser later. React requires both renders to produce identical markup, so
 * nothing derived from the clock may appear in the initial render — the
 * countdown digits must only be filled in after mount. These tests pin that
 * invariant by rendering the same props at two different times.
 */
import type { ReactNode } from 'react';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Hero from './Hero';

vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt?: string }) => <img src={src} alt={alt} />,
}));

vi.mock('@/i18n/navigation', () => ({
  Link: ({ href, children }: { href: string; children?: ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock('next-intl', () => ({
  useLocale: () => 'de',
  useTranslations: (ns: string) => (key: string) => `${ns}.${key}`,
}));

const FESTIVAL_DATE = '2026-09-17T09:00:00+02:00';

describe('Hero hydration safety', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders identical markup no matter when the initial render happens', () => {
    vi.setSystemTime(new Date('2026-06-11T08:00:00.000Z'));
    const ssrHtml = renderToString(<Hero festivalDate={FESTIVAL_DATE} />);

    // The clock has ticked by the time the browser hydrates the cached HTML.
    vi.setSystemTime(new Date('2026-06-11T08:00:41.500Z'));
    const hydrationHtml = renderToString(<Hero festivalDate={FESTIVAL_DATE} />);

    expect(hydrationHtml).toBe(ssrHtml);
  });

  it('server-renders the countdown shell rather than the static fallback', () => {
    vi.setSystemTime(new Date('2026-06-11T08:00:00.000Z'));
    const html = renderToString(<Hero festivalDate={FESTIVAL_DATE} />);

    expect(html).toContain('countdown.days');
    expect(html).not.toContain('hero.static');
  });
});
