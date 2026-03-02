const stats = [
  { value: 'WW V', label: 'Schwierigkeitsgrad' },
  { value: 'EINLADUNG', label: 'Teilnahme' },
  { value: 'TIROL', label: 'Österreich' },
  { value: '2019', label: 'Seit' },
];

const DIVIDER = '1px solid rgba(255,255,255,0.1)';

export default function DasRennen() {
  return (
    <section style={{ backgroundColor: 'var(--color-ink)' }}>
      {/* Amber top accent rule */}
      <div style={{ height: '4px', backgroundColor: 'var(--color-accent)' }} />

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-20 md:py-28">
        {/* Section label */}
        <p
          className="uppercase mb-6"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '11px',
            letterSpacing: '0.25em',
            color: 'var(--color-accent)',
          }}
        >
          Das Rennen
        </p>

        {/* Manifesto pullquote */}
        <h2
          className="uppercase mb-14 md:mb-20"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(48px, 7.5vw, 104px)',
            fontWeight: 700,
            color: '#FAFAF7',
            lineHeight: 0.9,
            letterSpacing: '-0.02em',
          }}
        >
          Nur die Besten<br />fahren hier.
        </h2>

        {/* Stat strip — desktop: horizontal row */}
        <div
          className="hidden md:flex"
          style={{ borderTop: DIVIDER }}
        >
          {stats.map(({ value, label }, i) => (
            <div
              key={value}
              className="flex-1 py-8 pr-8"
              style={{
                paddingLeft: i === 0 ? '0' : '2rem',
                borderLeft: i === 0 ? 'none' : DIVIDER,
              }}
            >
              <p
                className="uppercase leading-none"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(28px, 4vw, 68px)',
                  fontWeight: 700,
                  color: 'var(--color-accent)',
                  letterSpacing: '-0.01em',
                }}
              >
                {value}
              </p>
              <p
                className="mt-3 uppercase"
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '11px',
                  letterSpacing: '0.15em',
                  color: 'rgba(255,255,255,0.35)',
                }}
              >
                {label}
              </p>
            </div>
          ))}
        </div>

        {/* Stat strip — mobile: vertical list with amber left accent */}
        <div
          className="md:hidden"
          style={{ borderTop: DIVIDER }}
        >
          {stats.map(({ value, label }) => (
            <div
              key={value}
              className="py-5 pl-4"
              style={{
                borderBottom: DIVIDER,
                borderLeft: '3px solid var(--color-accent)',
              }}
            >
              <p
                className="uppercase leading-none"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(32px, 9vw, 60px)',
                  fontWeight: 700,
                  color: 'var(--color-accent)',
                  letterSpacing: '-0.01em',
                }}
              >
                {value}
              </p>
              <p
                className="mt-2 uppercase"
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '11px',
                  letterSpacing: '0.15em',
                  color: 'rgba(255,255,255,0.35)',
                }}
              >
                {label}
              </p>
            </div>
          ))}
        </div>

        {/* Editorial paragraph */}
        <p
          className="mt-12 max-w-xl"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '16px',
            lineHeight: 1.8,
            color: 'rgba(255,255,255,0.45)',
          }}
        >
          Die Ötztaler Ache. WW&nbsp;V. Eines der härtesten Kajak-Rennen der Alpen.
          Kein offener Start — hier fährt man nur auf Einladung.
          Die Strecke fordert Erfahrung, Technik und die Bereitschaft, an die eigene Grenze zu gehen.
        </p>
      </div>
    </section>
  );
}
