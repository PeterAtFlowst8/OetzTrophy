const stats = [
  { value: 'WW III–IV', label: 'Schwierigkeitsgrad' },
  { value: 'Auf Einladung', label: 'Teilnahme' },
  { value: 'Tirol, Österreich', label: 'Austragungsort' },
  { value: 'Seit 2019', label: 'Tradition' },
];

export default function DasRennen() {
  return (
    <section className="py-20 md:py-28" style={{ backgroundColor: 'var(--color-background)' }}>
      <div className="max-w-5xl mx-auto px-5 md:px-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">

          {/* Editorial text */}
          <div>
            <p
              className="uppercase tracking-widest mb-4"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '11px',
                letterSpacing: '0.2em',
                color: 'var(--color-accent)',
              }}
            >
              Das Rennen
            </p>
            <h2
              className="uppercase mb-6"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(40px, 5vw, 64px)',
                fontWeight: 700,
                color: 'var(--color-ink)',
                lineHeight: 0.95,
              }}
            >
              Die Ötztaler Ache
            </h2>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '16px',
                lineHeight: 1.7,
                color: 'var(--color-body-text)',
              }}
            >
              WW III–IV. Eines der härtesten Kajak-Rennen der Alpen.
              Kein offener Start — hier fährt man nur auf Einladung.
              Die Strecke an der Ötztaler Ache fordert Erfahrung,
              Technik und die Bereitschaft, an die eigene Grenze zu gehen.
            </p>
          </div>

          {/* Stats */}
          <div
            className="pl-6 md:pl-8 border-l-4"
            style={{ borderColor: 'var(--color-accent)' }}
          >
            <div className="grid grid-cols-2 gap-8">
              {stats.map(({ value, label }) => (
                <div key={label}>
                  <p
                    className="uppercase"
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 'clamp(24px, 3vw, 36px)',
                      fontWeight: 700,
                      color: 'var(--color-ink)',
                      lineHeight: 1,
                    }}
                  >
                    {value}
                  </p>
                  <p
                    className="mt-1 uppercase tracking-wider"
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '11px',
                      color: 'var(--color-muted)',
                      letterSpacing: '0.1em',
                    }}
                  >
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
