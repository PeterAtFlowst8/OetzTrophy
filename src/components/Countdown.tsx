'use client';

import { useEffect, useState } from 'react';
import { getCountdownState, type CountdownState } from '@/lib/countdown';

function pad(n: number) {
  return String(n).padStart(2, '0');
}

export default function Countdown() {
  const [state, setState] = useState<CountdownState | null>(null);

  useEffect(() => {
    const tick = () => setState(getCountdownState(new Date(), null));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  if (!state) return null; // avoid hydration mismatch

  return (
    <section className="bg-white border-t-4" style={{ borderColor: 'var(--color-accent)' }}>
      <div className="max-w-5xl mx-auto px-5 md:px-10 py-16 md:py-20 text-center">
        {state.phase === 'static' ? (
          <p
            className="uppercase"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(40px, 6vw, 80px)',
              fontWeight: 700,
              color: 'var(--color-ink)',
              lineHeight: 1,
            }}
          >
            Coming September 2026
          </p>
        ) : (
          <>
            <p
              className="uppercase tracking-widest mb-10"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '11px',
                letterSpacing: '0.25em',
                color: 'var(--color-muted)',
              }}
            >
              {state.label}
            </p>
            <div className="flex items-start justify-center gap-6 md:gap-12">
              {([
                { value: state.delta.days, label: 'Tage' },
                { value: state.delta.hours, label: 'Std' },
                { value: state.delta.minutes, label: 'Min' },
                { value: state.delta.seconds, label: 'Sek' },
              ] as const).map(({ value, label }) => (
                <div key={label} className="flex flex-col items-center min-w-[60px]">
                  <span
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 'clamp(56px, 9vw, 120px)',
                      fontWeight: 700,
                      color: 'var(--color-ink)',
                      lineHeight: 1,
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {pad(value)}
                  </span>
                  <span
                    className="uppercase mt-2 tracking-widest"
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '11px',
                      letterSpacing: '0.15em',
                      color: 'var(--color-muted)',
                    }}
                  >
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
