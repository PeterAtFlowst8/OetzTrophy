/**
 * Hero is server-rendered (homepage ISR, revalidate=60) and hydrates in the
 * browser later. React requires both renders to produce identical markup, so
 * nothing derived from the clock may appear in the initial render — the
 * countdown digits must only be filled in after mount, and the registration
 * CTA must follow the server-computed `registrationOpen` prop rather than
 * re-reading the clock. These tests pin those invariants by rendering the
 * same props at two different times.
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
    const ssrHtml = renderToString(<Hero festivalDate={FESTIVAL_DATE} registrationOpen={false} />);

    // The clock has ticked by the time the browser hydrates the cached HTML.
    vi.setSystemTime(new Date('2026-06-11T08:00:41.500Z'));
    const hydrationHtml = renderToString(<Hero festivalDate={FESTIVAL_DATE} registrationOpen={false} />);

    expect(hydrationHtml).toBe(ssrHtml);
  });

  it('renders an identical CTA when the render times straddle the registration opening', () => {
    const opensAt = '2026-06-17T00:00:00+02:00'; // = 2026-06-16T22:00:00Z

    // ISR snapshot cached seconds before registration opens. The server decided
    // "closed", and that decision travels with the cached payload as a prop —
    // it must not be re-derived from the clock during render.
    vi.setSystemTime(new Date('2026-06-16T21:59:45.000Z'));
    const ssrHtml = renderToString(
      <Hero festivalDate={FESTIVAL_DATE} registrationOpensAt={opensAt} registrationOpen={false} />,
    );

    // The browser hydrates that cached HTML just after the opening moment.
    vi.setSystemTime(new Date('2026-06-16T22:00:15.000Z'));
    const hydrationHtml = renderToString(
      <Hero festivalDate={FESTIVAL_DATE} registrationOpensAt={opensAt} registrationOpen={false} />,
    );

    expect(hydrationHtml).toBe(ssrHtml);
    expect(ssrHtml).toContain('hero.registrationCtaClosed');
  });

  it('server-renders the countdown shell rather than the static fallback', () => {
    vi.setSystemTime(new Date('2026-06-11T08:00:00.000Z'));
    const html = renderToString(<Hero festivalDate={FESTIVAL_DATE} registrationOpen={false} />);

    expect(html).toContain('countdown.days');
    expect(html).not.toContain('hero.static');
  });
});
