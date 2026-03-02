const footerLinks = [
  { label: 'Impressum', href: '/impressum' },
  { label: 'Kontakt', href: '/kontakt' },
];

const socialLinks = [
  { label: 'Instagram', href: 'https://www.instagram.com/oetz_trophy/' },
  { label: 'YouTube', href: 'https://www.youtube.com/c/OETZTROPHYExtremeKayakChampionships' },
  { label: 'Facebook', href: 'https://www.facebook.com/oetztrophy' },
];

export default function Footer() {
  return (
    <footer style={{ backgroundColor: 'var(--color-footer-bg)' }}>
      {/* Amber top accent */}
      <div style={{ height: '3px', backgroundColor: 'var(--color-accent)' }} />

      {/* Brand block — the wordmark owns the footer */}
      <div className="text-center px-6 pt-16 md:pt-24 pb-10 md:pb-14">
        <p
          className="uppercase leading-none"
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: 'clamp(52px, 9vw, 120px)',
            color: 'rgba(255,255,255,0.92)',
            letterSpacing: '-0.02em',
          }}
        >
          OETZ TROPHY
        </p>
        <p
          className="mt-4 uppercase"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '11px',
            letterSpacing: '0.28em',
            color: 'rgba(255,255,255,0.25)',
          }}
        >
          Extreme Kayak Championships · Ötztaler Ache · Seit 2019
        </p>
      </div>

      {/* Divider */}
      <div
        className="max-w-7xl mx-auto px-6 md:px-12"
        style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
      />

      {/* Bottom bar */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-7 flex flex-col md:flex-row items-center justify-between gap-5">

        {/* Nav links */}
        <nav className="flex gap-7" aria-label="Footer Navigation">
          {footerLinks.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className="uppercase transition-colors duration-200 hover:text-white/70"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '11px',
                letterSpacing: '0.18em',
                color: 'rgba(255,255,255,0.35)',
              }}
            >
              {label}
            </a>
          ))}
        </nav>

        {/* Social links */}
        <div className="flex items-center gap-7">
          {socialLinks.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="uppercase transition-colors duration-200 hover:text-white/70"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '11px',
                letterSpacing: '0.18em',
                color: 'rgba(255,255,255,0.35)',
              }}
            >
              {label}
            </a>
          ))}
        </div>

        {/* Copyright */}
        <span
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '11px',
            letterSpacing: '0.12em',
            color: 'rgba(255,255,255,0.18)',
          }}
        >
          © 2026 OETZ TROPHY
        </span>

      </div>
    </footer>
  );
}
