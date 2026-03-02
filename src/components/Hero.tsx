'use client';

import { useState, useEffect } from 'react';
import { getCountdownState, type CountdownState } from '@/lib/countdown';

const GRAIN = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`;

export default function Hero() {
  const [state, setState] = useState<CountdownState | null>(null);

  useEffect(() => {
    setState(getCountdownState(new Date(), null));
    const id = setInterval(() => setState(getCountdownState(new Date(), null)), 1000);
    return () => clearInterval(id);
  }, []);

  const units =
    state && state.phase !== 'static'
      ? [
          { v: String(state.delta.days).padStart(2, '0'), l: 'Tage' },
          { v: String(state.delta.hours).padStart(2, '0'), l: 'Std' },
          { v: String(state.delta.minutes).padStart(2, '0'), l: 'Min' },
          { v: String(state.delta.seconds).padStart(2, '0'), l: 'Sek' },
        ]
      : null;

  return (
    <section className="relative w-full h-screen min-h-[680px] overflow-hidden">

      {/* Background photo */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/hero.jpg')" }}
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

      {/* Gradient layers: general darkening + strong bottom for title */}
      <div className="absolute inset-0 bg-black/45" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

      {/* ── COUNTDOWN — dead center ── */}
      {state && (
        <div className="absolute inset-0 flex flex-col items-center justify-center hero-countdown">
          {units ? (
            <div className="text-center px-4">
              {/* Amber accent line */}
              <div
                className="mx-auto mb-5"
                style={{
                  width: '40px',
                  height: '3px',
                  backgroundColor: 'var(--color-accent)',
                }}
              />
              {/* Label */}
              <p
                className="uppercase text-white/75 mb-6 tracking-[0.25em]"
                style={{ fontFamily: 'var(--font-body)', fontSize: '11px' }}
              >
                {state.label}
              </p>
              {/* Numbers */}
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
                          fontSize: 'clamp(48px, 7vw, 96px)',
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
              Coming<br />September 2026
            </p>
          )}
        </div>
      )}

      {/* ── RACE TITLE — pinned bottom-left ── */}
      <div className="absolute bottom-0 left-0 right-0 px-6 pb-10 md:px-12 md:pb-12">
        <span
          className="inline-block mb-4 px-[10px] py-[5px] text-[11px] font-bold uppercase tracking-widest hero-badge"
          style={{
            backgroundColor: 'var(--color-accent)',
            color: '#111',
            borderRadius: '3px',
            transform: 'rotate(-2deg)',
            transformOrigin: 'left center',
            boxShadow: '0 2px 16px rgba(0,0,0,0.5)',
          }}
        >
          Invite Only · 2026
        </span>

        <h1
          className="uppercase text-white leading-none"
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            letterSpacing: '-0.02em',
          }}
        >
          <span className="block hero-line-1" style={{ fontSize: 'clamp(36px, 5vw, 68px)' }}>Extreme</span>
          <span className="block hero-line-2" style={{ fontSize: 'clamp(36px, 5vw, 68px)' }}>Kayak Championships</span>
        </h1>

        <p
          className="mt-3 uppercase text-white/45"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '11px',
            letterSpacing: '0.28em',
            animation: 'fadeUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.95s both',
          }}
        >
          Oetz · Tirol · Österreich
        </p>
      </div>

    </section>
  );
}
