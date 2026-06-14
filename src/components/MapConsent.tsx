'use client';

import { useState } from 'react';
import TextWithLinks from '@/components/TextWithLinks';

/**
 * GDPR-friendly Google Maps embed: nothing is requested from Google until the
 * visitor clicks "load map". Before consent we render only a local placeholder
 * (notice + button) — no iframe, no Google request, no cookies.
 */
type Props = {
  src: string;
  title: string;
  notice: string;
  loadLabel: string;
};

export default function MapConsent({ src, title, notice, loadLabel }: Props) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      style={{
        width: '100%',
        height: 'clamp(360px, 60vh, 520px)',
        border: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-surface)',
      }}
    >
      {loaded ? (
        <iframe
          src={src}
          title={title}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          style={{ display: 'block', width: '100%', height: '100%', border: 0 }}
        />
      ) : (
        <div
          className="flex h-full flex-col items-center justify-center gap-5 px-6 text-center"
        >
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '14px',
              lineHeight: 1.7,
              color: 'var(--color-muted)',
              maxWidth: '46ch',
            }}
          >
            <TextWithLinks text={notice} />
          </p>
          <button
            type="button"
            onClick={() => setLoaded(true)}
            className="uppercase transition-opacity duration-200 hover:opacity-90"
            style={{
              backgroundColor: 'var(--color-accent)',
              color: '#111',
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              fontWeight: 600,
              letterSpacing: '0.05em',
              padding: '0.75rem 1.5rem',
              border: 0,
              cursor: 'pointer',
            }}
          >
            {loadLabel}
          </button>
        </div>
      )}
    </div>
  );
}
