'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { getCountdownState, type CountdownState } from '@/lib/countdown';

const GRAIN = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`;

type Props = {
  festivalDate?: string | null;
};

export default function Hero({ festivalDate }: Props) {
  const [state, setState] = useState<CountdownState | null>(null);
  const t = useTranslations('hero');
  const tc = useTranslations('countdown');

  const targetDate = festivalDate ? new Date(festivalDate) : new Date('2026-09-17T09:00:00Z');

  useEffect(() => {
    setState(getCountdownState(new Date(), targetDate));
    const id = setInterval(() => setState(getCountdownState(new Date(), targetDate)), 1000);
    return () => clearInterval(id);
  }, []);

  const units =
    state && state.phase !== 'static'
      ? [
          { v: String(state.delta.days).padStart(2, '0'), l: tc('days') },
          { v: String(state.delta.hours).padStart(2, '0'), l: tc('hours') },
          { v: String(state.delta.minutes).padStart(2, '0'), l: tc('minutes') },
          { v: String(state.delta.seconds).padStart(2, '0'), l: tc('seconds') },
        ]
      : null;

  const countdownLabel =
    state?.phase === 'launch' ? tc('launch') :
    state?.phase === 'festival' ? tc('festival') : '';

  return (
    <section className="relative w-full h-screen min-h-[680px] overflow-hidden">

      {/* Background photo */}
      <Image
        src="/images/hero.jpg"
        alt={t('imageAlt')}
        fill
        className="object-cover object-center"
        priority
        sizes="100vw"
      />

      {/* Film grain */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: GRAIN,
          backgroundSize: '200px 200px',
          opacity: 0.07,
          mixBlendMode: 'overlay',
        }}
      />

      {/* Gradient layers */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

      {/* Countdown — dead center */}
      {state && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pb-40 md:pb-64 hero-countdown">
          {units ? (
            <div
              className="text-center px-6 py-8 md:px-10 md:py-10"
              style={{
                background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.25) 60%, transparent 100%)',
              }}
            >
              <div
                className="mx-auto mb-5"
                style={{ width: '40px', height: '3px', backgroundColor: 'var(--color-accent)' }}
              />
              <p
                className="uppercase text-white mb-6 tracking-[0.25em]"
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '11px',
                  textShadow: '0 1px 8px rgba(0,0,0,0.6)',
                }}
              >
                {countdownLabel}
              </p>
              <div className="flex items-end justify-center gap-0">
                {units.map(({ v, l }, i) => (
                  <div key={l} className="flex items-end">
                    {i > 0 && (
                      <span
                        className="text-white/30 self-start mt-2"
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontSize: 'clamp(20px, 2.5vw, 36px)',
                          lineHeight: 1,
                          margin: '0 2px',
                        }}
                      >
                        :
                      </span>
                    )}
                    <div className="text-center px-2 md:px-3">
                      <div
                        className="text-white leading-none"
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontWeight: 700,
                          fontSize: 'clamp(36px, 7vw, 96px)',
                          letterSpacing: '-0.03em',
                          fontVariantNumeric: 'tabular-nums',
                          textShadow: '0 4px 32px rgba(0,0,0,0.4)',
                        }}
                      >
                        {v}
                      </div>
                      <div
                        className="text-white/65 uppercase mt-2 tracking-[0.2em]"
                        style={{ fontFamily: 'var(--font-body)', fontSize: '10px' }}
                      >
                        {l}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p
              className="uppercase text-white text-center"
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: 'clamp(32px, 6vw, 80px)',
                lineHeight: 0.95,
                textShadow: '0 4px 24px rgba(0,0,0,0.4)',
              }}
            >
              {t('static')}
            </p>
          )}
        </div>
      )}

      {/* Race title — pinned bottom-left */}
      <div className="absolute bottom-0 left-0 right-0 px-6 pb-14 md:px-12 md:pb-20">
        <span
          className="inline-block mb-5 md:mb-6 px-[12px] py-[6px] text-[11px] font-bold uppercase tracking-widest hero-badge"
          style={{
            backgroundColor: 'var(--color-accent)',
            color: '#111',
            borderRadius: '3px',
            transform: 'rotate(-2deg)',
            transformOrigin: 'left center',
            boxShadow: '0 2px 16px rgba(0,0,0,0.5)',
          }}
        >
          {t('badge')}
        </span>

        <h1
          className="uppercase text-white leading-none"
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            letterSpacing: '-0.02em',
          }}
        >
          <span className="block hero-line-1" style={{ fontSize: 'clamp(44px, 8vw, 100px)', lineHeight: 0.9 }}>{t('line1')}</span>
          <span className="block hero-line-2 mt-1 md:mt-2" style={{ fontSize: 'clamp(26px, 5vw, 64px)', lineHeight: 0.95 }}>{t('line2')}</span>
        </h1>

        <p
          className="mt-4 md:mt-5 uppercase text-white/45 hero-location"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '11px',
            letterSpacing: '0.28em',
          }}
        >
          {t('location')}
        </p>
      </div>

    </section>
  );
}
